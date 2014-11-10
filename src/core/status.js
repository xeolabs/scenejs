/**
 * Backend that tracks statistics on loading states of nodes during scene traversal.
 *
 * This supports the "loading-status" events that we can listen for on scene nodes.
 *
 * When a node with that listener is pre-visited, it will call getStatus on this module to
 * save a copy of the status. Then when it is post-visited, it will call diffStatus on this
 * module to find the status for its sub-nodes, which it then reports through the "loading-status" event.
 *
 * @private
 */
var SceneJS_sceneStatusModule = new (function () {

    // Public activity summary
    this.sceneStatus = {};

    // IDs of all tasks
    var taskIds = new SceneJS_Map();
    var tasks = {};

    var sceneStates = {};

    var self = this;

    SceneJS_events.addListener(
        SceneJS_events.SCENE_DESTROYED,
        function (params) {
            var sceneId = params.engine.id;
            delete self.sceneStatus[sceneId];
            delete sceneStates[sceneId];
        });

    /** Notifies that a node has begun loading some data
     */
    this.taskStarted = function (node, description) {

        var popups = SceneJS_configsModule.configs.statusPopups !== false;

        var scene = node.getScene();
        var sceneId = scene.getId();
        var nodeId = node.getId();
        var canvas = scene.getCanvas();

        var taskId = taskIds.addItem();

        // Update public info
        var status = this.sceneStatus[sceneId];
        if (!status) {
            status = this.sceneStatus[sceneId] = {
                numTasks: 0
            };
        }
        status.numTasks++;

        // Track node
        var sceneState = sceneStates[sceneId];
        if (!sceneState) {
            sceneState = sceneStates[sceneId] = {
                sceneId: sceneId,
                nodeStates: {},
                scene: scene,
                popupContainer: popups ? createPopupContainer(canvas) : null,
                descCounts: {}
            };
        }
        var descCount = sceneState.descCounts[description];
        if (descCount == undefined) {
            descCount = sceneState.descCounts[description] = 0;
        }
        sceneState.descCounts[description]++;
        var nodeState = sceneState.nodeStates[nodeId];
        if (!nodeState) {
            nodeState = sceneState.nodeStates[nodeId] = {
                nodeId: nodeId,
                numTasks: 0,
                tasks: {}
            };
        }
        description = description + " " + sceneState.descCounts[description] + "...";
        nodeState.numTasks++;
        var task = {
            sceneState: sceneState,
            nodeState: nodeState,
            description: description,
            element: popups ? createPopup(sceneState.popupContainer, description) : null
        };
        nodeState.tasks[taskId] = task;
        tasks[taskId] = task;
        return taskId;
    };

    function createPopupContainer(canvas) {
        var body = document.getElementsByTagName("body")[0];
        var div = document.createElement('div');
        var style = div.style;
        style.position = "absolute";
        style.width = "200px";
        style.right = "10px";
        style.top = "0";
        style.padding = "10px";
        style["z-index"] = "10000";
        body.appendChild(div);
        return div;
    }

    function createPopup(popupContainer, description) {
        var div = document.createElement('div');
        var style = div.style;
        style["font-family"] = "Helvetica";
        style["font-size"] = "14px";
        style.padding = "5px";
        style.margin = "4px";
        style["padding-left"] = "12px";
        style["border"] = "1px solid #000055";
        style.color = "black";
        style.background = "#AAAAAA";
        style.opacity = "0.8";
        style["border-radius"] = "3px";
        style["-moz-border-radius"] = "3px";
        style["box-shadow"] = "3px 3px 3px #444444";
        div.innerHTML = description;
        popupContainer.appendChild(div);
        return div;
    }

    /** Notifies that a load has finished loading some data
     */
    this.taskFinished = function (taskId) {
        if (taskId == -1 || taskId == null) {
            return null;
        }
        var task = tasks[taskId];
        if (!task) {
            return null;
        }
        var sceneState = task.sceneState;
        this.sceneStatus[sceneState.sceneId].numTasks--;
        if (task.element) {
            dismissPopup(task.element);
        }
        var nodeState = task.nodeState;
        nodeState.numTasks--;
        delete nodeState.tasks[taskId];
        if (nodeState.numTasks == 0) {
            delete sceneState.nodeStates[nodeState.nodeId];
        }
        return null;
    };

    function dismissPopup(element) {
        element.style.background = "#AAFFAA";
        var opacity = 0.8;
        var interval = setInterval(function () {
            if (opacity <= 0) {
                element.parentNode.removeChild(element);
                clearInterval(interval);
            } else {
                element.style.opacity = opacity;
                opacity -= 0.1;
            }
        }, 100);
    }

    /** Notifies that a task has failed
     */
    this.taskFailed = function (taskId) {
        if (taskId == -1 || taskId == null) {
            return null;
        }
        var task = tasks[taskId];
        if (!task) {
            return null;
        }
        var popups = !!SceneJS_configsModule.configs.statusPopups;
        var sceneState = task.sceneState;
        this.sceneStatus[sceneState.sceneId].numTasks--;
        if (popups) {
            failPopup(task.element);
        }
        var nodeState = task.nodeState;
        nodeState.numTasks--;
        delete nodeState.tasks[taskId];
        if (nodeState.numTasks == 0) {
            delete task.sceneState.nodeStates[nodeState.nodeId];
        }
        return null;
    };

    function failPopup(element) {
        element.style.background = "#FFAAAA";
    }
})();