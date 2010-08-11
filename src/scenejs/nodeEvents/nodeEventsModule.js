/**
 * This module manages event flow within scene graphs, mediating the firing and receipt of events to ensure that
 * events originating at sub-nodes end up at the appropriate listeners on their super-nodes.
 *
 * SceneJS has a two-step event model, in which events fired within a scene traversal are handed to the target node
 * listeners on the subsequent traversal. The pending events are handled to each node as it is rendered, giving it
 * the opportunity to react to the previous traversal's events within its subgraph before the subgraph is re-rendered.
 *
 * Since SceneJS allows dynamic, recursive instancing using SceneJS.Instance and SceneJS.Symbol nodes, in which an
 * Instances can actually be targeted at different Symbols dynamically at render-time (eg. by callbacks influenced by
 * external triggers, like the system time), SceneJS never knows exactly what nodes will be rendered during the next
 * traversal. This module implements the strategy described below to allow precise event flow within such
 * non-deterministic scene traversals.
 *
 * Scene nodes register their pre-rendering and post-rendering on this module during each traversal. This enables the
 * module to keep track of which node is currently-rendering, along with the path of nodes that traversal descended
 * through to arrive at the current node. Most event types are fired by nodes as they are rendered, and this module is
 * notified of each such event as it is fired. Knowing the current node, it is able to identify it as the event source,
 * while also being able to locate recipient nodes by traversing the path to find those that have the corresponding
 * listeners.
 *
 * Other event types, such as "picked", are only fired after a traversal is complete (ie. the pick buffer has been read
 * or ray intersection has been performed to find the picked Geometry). To support that, this module allows the current
 * traversal node to be "tagged" with a client-supplied key (eg. an index colour in a pick buffer). Then an event may be
 * fired through this module for the a given tag, effectively identifying the tag node as the event source and all nodes
 * on the path to the tagged node as potential recipients.
 *
 * @private
 */
SceneJS._nodeEventsModule = new (function() {

    const MAX_SCENE_DEPTH = 10000;   // TODO: factor out to SceneJS object

    /**
     * Sparse traversal path of records for nodes that have listeners, leading down to the currently
     * rendering node. Contains null entries for nodes that don't have listeners.
     */
    var listeningNodePath = new Array(MAX_SCENE_DEPTH);

    /**
     * Non-sparse traversal path of IDs of nodes leading down to the currently rendering node.
     */
    var nodeIdPath = new Array(MAX_SCENE_DEPTH);

    /**
     * Length of node and ID paths
     */
    var pathLen = 0;

    /**
     * Path of SIDs leading to and including the currently rendering node
     */
    var sidPath = [];

    /** Events stored for each active scene
     */
    var sceneEvents = {};

    /* Event management for currently-rendering scene
     */
    var currentSceneEvents;

    /* Traversal state snaphots of selected nodes, enabling us to fire events from them 
     * AFTER traversal instead of while rendering them
     */
    var taggedNodes = {};

    /* Reset this module on SceneJS init
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.INIT,
            function() {
                reset();
            });

    function reset() {
        pathLen = 0;
        sceneEvents = {};
    }

    /* On new traversal, swap event buffers and prepare traversal paths
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.SCENE_RENDERING,
            function(e) {

                currentSceneEvents = sceneEvents[e.sceneId];
                if (!currentSceneEvents) {

                    /* The eventsIn buffer stores events fired during each traversal, while eventsOut holds
                     * events available for processing by the listening nodes.
                     *
                     * Before each traversal, contents of eventsIn are transferred to eventsOut to make events fired in
                     * last pass available during this pass, then eventsIn is emptied ready to store events fired in
                     * this pass.
                     */
                    currentSceneEvents = sceneEvents[e.sceneId] = {
                        eventsIn : {},     // Fired events
                        eventsOut : {}     // Available events
                    };

                } else {

                    /* Transfer eventsIn to eventsOut, clear eventsIn
                     */
                    var temp = currentSceneEvents.eventsIn;
                    currentSceneEvents.eventsIn = {};
                    currentSceneEvents.eventsOut = temp;
                }
                pathLen = 0;

                /* Ready to build new map of tagged listener-node paths
                 */
                taggedNodes = {};
            });

    /* Reset this module on SceneJS reset
     */
    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                reset();
            });

    /**
     * Registers pre-visit of node during traversal
     */
    this.preVisitNode = function(node) {
        var sid = node.getSID();                // Build SID path
        if (sid) {
            sidPath.push(sid);
        }
        if (node.hasListeners()) {              // Build listener node path
            listeningNodePath[pathLen] = {
                node: node,
                visitHash : nodeIdPath.slice(0, pathLen).join("."),
                sidDepth: sidPath.length
            };
        } else {
            listeningNodePath[pathLen] = null;
        }
        nodeIdPath[pathLen] = node.getID();     // Build node ID path
        pathLen++;
    };

    /**
     * Fires an event from the currently-rendering node. The event will be available for collection on the
     * next traversal.
     */
    this.fireEvent = function(name, params) {
        fireAtListeners(name, params, listeningNodePath, pathLen, sidPath);
    };

    function fireAtListeners(name, params, _listeningNodePath, len, _sidPath) {
        var listeningNode;
        var events;
        for (var i = len - 1; i >= 0; i--) {
            listeningNode = _listeningNodePath[i];
            if (listeningNode && listeningNode.node.hasListener(name)) {   // path is sparse
                events = currentSceneEvents.eventsIn[listeningNode.visitHash];
                if (!events) {
                    events = currentSceneEvents.eventsIn[listeningNode.visitHash] = [];
                }
                events.unshift({                   // FIFO
                    name: name,
                    params: params,
                    uri : _sidPath.slice(listeningNode.sidDepth).join("/")  // Relative SID path to event source
                });
            }
        }
    }

    /**
     * Returns FIFO queue of events for the current-rendering node that were fired during the last traversal
     */
    this.getEvents = function() {
        var listeningNode = listeningNodePath[pathLen - 1];
        return (listeningNode && listeningNode.visitHash) ? currentSceneEvents.eventsOut[listeningNode.visitHash] : null;
    };

    /**
     * Tags the currently rendering node so that we can fire an event from it after the whole traversal has finished
     * using #fireEventFromTagNode.
     *
     * This is useful for events that can only be fired once the whole scene has been rendered, such as picking,
     * which needs to fire a "picked" event from one geometry after all of them have been rendered
     */
    this.tagNode = function(key) {

        /* Take snapshots of the paths of listener nodes and SIDs that
         * lead to the currently rendering node and map them to the given key.
         */
        taggedNodes[key] = {
            listeningNodePath: listeningNodePath.slice(0, pathLen - 1),
            sidPath : sidPath.slice(0)
        };
    };

    /**
     * Pops the currently rendering node
     */
    this.postVisitNode = function(node) {
        if (node.getSID()) {
            sidPath.pop();
        }
        pathLen--;
    };

    /**
     * Fire an event from a node that was tagged during the previous traversal by #tagNode. The event will be available
     * for collection on the next traversal.
     *
     * Note that firing from tagged nodes is much less efficient than firing from nodes as they are rendered,
     * since the tag must snapshot the traversal state in order to locate the node as the event source.
     */
    this.fireEventFromTagNode = function(key, name, params) {
        var tag = taggedNodes[key];
        if (tag) {
            fireAtListeners(name, params, tag.listeningNodePath, tag.listeningNodePath.length, tag.sidPath);
        }
    };
})();

