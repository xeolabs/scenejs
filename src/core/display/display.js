/**
 * @class Display compiled from a {@link SceneJS.Scene}, providing methods to render and pick.
 * @private
 *
 * <p>A Display is a container of {@link SceneJS_Object}s which are created (or updated) by a depth-first
 * <b>compilation traversal</b> of a {@link SceneJS.Scene}.</b>
 *
 * <h2>Rendering Pipeline</h2>
 *
 * <p>Conceptually, a Display implements a pipeline with the following stages:</p>
 *
 * <ol>
 * <li>Create or update {@link SceneJS_Object}s during scene compilation</li>
 * <li>Organise the {@link SceneJS_Object} into an <b>object list</b></li>
 * <li>Determine the GL state sort order for the object list</li>
 * <li>State sort the object list</li>
 * <li>Create a <b>draw list</b> containing {@link SceneJS_Chunk}s belonging to the {@link SceneJS_Object}s in the object list</li>
 * <li>Render the draw list to draw the image</li>
 * </ol>
 *
 * <p>An update to the scene causes the pipeline to be re-executed from one of these stages, and SceneJS is designed
 * so that the pipeline is always re-executed from the latest stage possible to avoid redoing work.</p>
 *
 * <p>For example:</p>
 *
 * <ul>
 * <li>when an object is created or updated, we need to (re)do stages 2, 3, 4, 5 and 6</li>
 * <li>when an object is made invisible, we need to redo stages 5 and 6</li>
 * <li>when an object is assigned to a different scene render layer (works like a render bin), we need to redo
 *   stages 3, 4, 5, and 6</li>
 *<li>when the colour of an object changes, or maybe when the viewpoint changes, we simplt redo stage 6</li>
 * </ul>
 *
 * <h2>Object Creation</h2>
 * <p>The object soup (stage 1) is constructed by a depth-first traversal of the scene graph, which we think of as
 * "compiling" the scene graph into the Display. As traversal visits each scene node, the node's state core is
 * set on the Display (such as {@link #flags}, {@link #layer}, {@link #renderer} etc), which we think of as the
 * cores that are active at that instant during compilation. Each of the scene's leaf nodes is always
 * a {@link SceneJS.Geometry}, and when traversal visits one of those it calls {@link #buildObject} to create an
 * object in the soup. For each of the currently active cores, the object is given a {@link SceneJS_Chunk}
 * containing the WebGL calls for rendering it.</p>
 *
 * <p>The object also gets a shader (implemented by {@link SceneJS_Program}), taylored to render those state cores.</p>
 *
 * <p>Limited re-compilation may also be done on portions of a scene that have been added or sufficiently modified. When
 * traversal visits a {@link SceneJS.Geometry} for which an object already exists in the display, {@link #buildObject}
 * may update the {@link SceneJS_Chunk}s on the object as required for any changes in the core soup since the
 * last time the object was built. If differences among the cores require it, then {@link #buildObject} may also replace
 * the object's {@link SceneJS_Program} in order to render the new core soup configuration.</p>
 *
 * <p>So in summary, to each {@link SceneJS_Object} it builds, {@link #buildObject} creates a list of
 * {@link SceneJS_Chunk}s to render the set of node state cores that are currently set on the {@link SceneJS_Display}.
 * When {@link #buildObject} is re-building an existing object, it may replace one or more {@link SceneJS_Chunk}s
 * for state cores that have changed from the last time the object was built or re-built.</p>

 * <h2>Object Destruction</h2>
 * <p>Destruction of a scene graph branch simply involves a call to {@link #removeObject} for each {@link SceneJS.Geometry}
 * in the branch.</p>
 *
 * <h2>Draw List</h2>
 * <p>The draw list is actually comprised of two lists of state chunks: a "pick" list to render a pick buffer
 * for colour-indexed GPU picking, along with a "draw" list for normal image rendering. The chunks in these lists
 * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.</p>
 *
 * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
 * then lazy-redone on the next call to #render or #pick.</p>
 */
var SceneJS_Display = function (cfg) {

    // Display is bound to the lifetime of an HTML5 canvas
    this._canvas = cfg.canvas;

    // Factory which creates and recycles {@link SceneJS_Program} instances
    this._programFactory = new SceneJS_ProgramFactory({
        canvas: cfg.canvas
    });

    // Factory which creates and recycles {@link SceneJS.Chunk} instances
    this._chunkFactory = new SceneJS_ChunkFactory();

    /**
     * True when the background is to be transparent
     * @type {boolean}
     */
    this.transparent = cfg.transparent === true;

    /**
     * Node state core for the last {@link SceneJS.Enable} visited during scene graph compilation traversal
     * @type Object
     */
    this.enable = null;

    /**
     * Node state core for the last {@link SceneJS.Flags} visited during scene graph compilation traversal
     * @type Object
     */
    this.flags = null;

    /**
     * Node state core for the last {@link SceneJS.Layer} visited during scene graph compilation traversal
     * @type Object
     */
    this.layer = null;

    /**
     * Node state core for the last {@link SceneJS.Stage} visited during scene graph compilation traversal
     * @type Object
     */
    this.stage = null;

    /**
     * Node state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderer = null;

    /**
     * Node state core for the last {@link SceneJS.DepthBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.depthBuffer = null;

    /**
     * Node state core for the last {@link SceneJS.ColorBuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.colorBuffer = null;

    /**
     * Node state core for the last {@link SceneJS.View} visited during scene graph compilation traversal
     * @type Object
     */
    this.view = null;

    /**
     * Node state core for the last {@link SceneJS.Lights} visited during scene graph compilation traversal
     * @type Object
     */
    this.lights = null;

    /**
     * Node state core for the last {@link SceneJS.Material} visited during scene graph compilation traversal
     * @type Object
     */
    this.material = null;

    /**
     * Node state core for the last {@link SceneJS.Texture} visited during scene graph compilation traversal
     * @type Object
     */
    this.texture = null;

    /**
     * Node state core for the last {@link SceneJS.Fresnel} visited during scene graph compilation traversal
     * @type Object
     */
    this.fresnel = null;

    /**
     * Node state core for the last {@link SceneJS.Reflect} visited during scene graph compilation traversal
     * @type Object
     */
    this.cubemap = null;

    /**
     * Node state core for the last {@link SceneJS.XForm} visited during scene graph compilation traversal
     * @type Object
     */
    this.modelTransform = null;

    /**
     * Node state core for the last {@link SceneJS.LookAt} visited during scene graph compilation traversal
     * @type Object
     */
    this.viewTransform = null;

    /**
     * Node state core for the last {@link SceneJS.Camera} visited during scene graph compilation traversal
     * @type Object
     */
    this.projTransform = null;

    /**
     * Node state core for the last {@link SceneJS.RegionMap} visited during scene graph compilation traversal
     * @type Object
     */
    this.regionMap = null;

    /**
     * Node state core for the last {@link SceneJS.ColorTarget} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderTarget = null;

    /**
     * Node state core for the last {@link SceneJS.Clips} visited during scene graph compilation traversal
     * @type Object
     */
    this.clips = null;

    /**
     * Node state core for the last {@link SceneJS.MorphGeometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.morphGeometry = null;

    /**
     * Node state core for the last {@link SceneJS.Name} visited during scene graph compilation traversal
     * @type Object
     */
    this.name = null;

    /**
     * Node state core for the last {@link SceneJS.Tag} visited during scene graph compilation traversal
     * @type Object
     */
    this.tag = null;

    /**
     * Node state core for the last render {@link SceneJS.Node} listener encountered during scene graph compilation traversal
     * @type Object
     */
    this.renderListeners = null;

    /**
     * Node state core for the last {@link SceneJS.Shader} visited during scene graph compilation traversal
     * @type Object
     */
    this.shader = null;

    /**
     * Node state core for the last {@link SceneJS.ShaderParams} visited during scene graph compilation traversal
     * @type Object
     */
    this.shaderParams = null;

    /**
     * Node state core for the last {@link SceneJS.Style} visited during scene graph compilation traversal
     * @type Object
     */
    this.style = null;

    /**
     * Node state core for the last {@link SceneJS.Geometry} visited during scene graph compilation traversal
     * @type Object
     */
    this.geometry = null;

    /* Factory which creates and recycles {@link SceneJS_Object} instances
     */
    this._objectFactory = new SceneJS_ObjectFactory();

    /**
     * The objects in the display
     */
    this._objects = {};

    /**
     * Ambient color, which must be given to gl.clearColor before draw list iteration
     */
    this._ambientColor = [0, 0, 0, 1.0];

    /**
     * The object list, containing all elements of #_objects, kept in GL state-sorted order
     */
    this._objectList = [];
    this._objectListLen = 0;

    /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
     * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
     * "draw" list for normal image rendering.  The chunks in these lists are held in the state-sorted order of
     * their objects in #_objectList, with runs of duplicate states removed.
     */
    this._drawList = [];                // State chunk list to render all objects
    this._drawListLen = 0;

    this._pickDrawList = [];            // State chunk list to render scene to pick buffer
    this._pickDrawListLen = 0;

    this._targetList = [];
    this._targetListLen = 0;

    // Tracks the index of the first chunk in the transparency pass. The first run of chunks
    // in the list are for opaque objects, while the remainder are for transparent objects.
    // This supports a mode in which we only render the opaque chunks.
    this._drawListTransparentIndex = -1;

    /* The frame context holds state shared across a single render of the draw list, along with any results of
     * the render, such as pick hits
     */
    this._frameCtx = {
        pickNames: [], // Pick names of objects hit during pick render,
        regionData: [],
        canvas: this._canvas,           // The canvas
        VAO: null                       // Vertex array object extension
    };

    /* The frame context has this facade which is given to scene node "rendered" listeners
     * to allow application code to access things like transform matrices from within those listeners.
     */
    this._frameCtx.renderListenerCtx = new SceneJS.RenderContext(this._frameCtx);

    /*-------------------------------------------------------------------------------------
     * Flags which schedule what the display is to do when #render is next called.
     *------------------------------------------------------------------------------------*/

    /**
     * Flags the object list as needing to be rebuilt from existing objects on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #2 (see class comment),
     * causing object list rebuild, state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.objectListDirty = true;

    /**
     * Flags the object list as needing state orders to be computed on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #3 (see class comment),
     * causing state order determination, state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateOrderDirty = true;

    /**
     * Flags the object list as needing to be state sorted on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #4 (see class comment),
     * causing state sort, draw list construction and image render.
     * @type Boolean
     */
    this.stateSortDirty = true;

    /**
     * Flags the draw list as needing to be rebuilt from the object list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #5 (see class comment),
     * causing draw list construction and image render.
     * @type Boolean
     */
    this.drawListDirty = true;

    /**
     * Flags the image as needing to be redrawn from the draw list on the next call to {@link #render} or {@link #pick}.
     * Setting this will cause the rendering pipeline to be executed from stage #6 (see class comment),
     * causing the image render.
     * @type Boolean
     */
    this.imageDirty = true;
};

/**
 * Reallocates WebGL resources for objects within this display
 */
SceneJS_Display.prototype.webglRestored = function () {
    this._programFactory.webglRestored();// Reallocate programs
    this._chunkFactory.webglRestored(); // Recache shader var locations
    var gl = this._canvas.gl;
    if (this.pickBuf) {
        this.pickBuf.webglRestored(gl);          // Rebuild pick buffers
    }
    this.imageDirty = true;             // Need redraw
};

/**
 * Internally creates (or updates) a {@link SceneJS_Object} of the given ID from whatever node state cores are currently set
 * on this {@link SceneJS_Display}. The object is created if it does not already exist in the display, otherwise it is
 * updated with the current state cores, possibly replacing cores already referenced by the object.
 *
 * @param {String} objectId ID of object to create or update
 */
SceneJS_Display.prototype.buildObject = function (objectId) {

    var object = this._objects[objectId];

    if (!object) { // Create object
        object = this._objects[objectId] = this._objectFactory.getObject(objectId);
        this.objectListDirty = true;
    }

    object.modelTransform = this.modelTransform;
    object.viewTransform = this.viewTransform;
    object.projTransform = this.projTransform;
    object.stage = this.stage;
    object.layer = this.layer;
    object.renderTarget = this.renderTarget;
    object.texture = this.texture;
    object.cubemap = this.cubemap;
    object.geometry = this.geometry;
    object.enable = this.enable;
    object.flags = this.flags;
    object.tag = this.tag;
    object.name = this.name;

    //if (!object.hash) {

    var hash = ([                   // Build current state hash
        this.geometry.hash,
        this.shader.hash,
        this.clips.hash,
        this.morphGeometry.hash,
        this.texture.hash,
        this.fresnel.hash,
        this.cubemap.hash,
        this.lights.hash,
        this.flags.hash,
        this.regionMap.hash
    ]).join(";");

    if (!object.program || hash != object.hash) {
        // Get new program for object if no program or hash mismatch
        if (object.program) {
            this._programFactory.putProgram(object.program);
        }
        object.program = this._programFactory.getProgram(hash, this);
        object.hash = hash;
    }
    //}

    // Build draw chunks for object

    this._setChunk(object, 0, "program");          // Must be first
    this._setChunk(object, 1, "xform", this.modelTransform);
    this._setChunk(object, 2, "lookAt", this.viewTransform);
    this._setChunk(object, 3, "camera", this.projTransform);
    this._setChunk(object, 4, "flags", this.flags);
    this._setChunk(object, 5, "shader", this.shader);
    this._setChunk(object, 6, "shaderParams", this.shaderParams);
    this._setChunk(object, 7, "style", this.style);
    this._setChunk(object, 8, "depthBuffer", this.depthBuffer);
    this._setChunk(object, 9, "colorBuffer", this.colorBuffer);
    this._setChunk(object, 10, "view", this.view);
    this._setChunk(object, 11, "name", this.name);
    this._setChunk(object, 12, "lights", this.lights);
    this._setChunk(object, 13, "material", this.material);
    this._setChunk(object, 14, "texture", this.texture);
    this._setChunk(object, 15, "regionMap", this.regionMap);
    this._setChunk(object, 16, "fresnel", this.fresnel);
    this._setChunk(object, 17, "cubemap", this.cubemap);
    this._setChunk(object, 18, "clips", this.clips);
    this._setChunk(object, 19, "renderer", this.renderer);
    this._setChunk(object, 20, "geometry", this.morphGeometry, this.geometry);
    this._setChunk(object, 21, "listeners", this.renderListeners);      // Must be after the above chunks
    this._setChunk(object, 22, "draw", this.geometry); // Must be last

    // At the very least, the object sort order
    // will need be recomputed

    this.stateOrderDirty = true;
};

SceneJS_Display.prototype._setChunk = function (object, order, chunkType, core, core2) {

    var chunkId;
    var chunkClass = this._chunkFactory.chunkTypes[chunkType];

    if (core) {

        // Core supplied
        if (core.empty) { // Only set default cores for state types that have them
            var oldChunk = object.chunks[order];
            if (oldChunk) {
                this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
            }
            object.chunks[order] = null;
            return;
        }

        // Note that core.stateId can be either a number or a string, that's why we make
        // chunkId a string here.
        // TODO: Would it be better if all were numbers?
        chunkId = chunkClass.prototype.programGlobal
            ? '_' + core.stateId
            : 'p' + object.program.id + '_' + core.stateId;

        if (core2) {
            chunkId += '__' + core2.stateId;
        }

    } else {

        // No core supplied, probably a program.
        // Only one chunk of this type per program.
        chunkId = 'p' + object.program.id;
    }

    // This is needed so that chunkFactory can distinguish between draw and geometry
    // chunks with the same core.
    chunkId = order + '__' + chunkId;

    var oldChunk = object.chunks[order];

    if (oldChunk) {
        if (oldChunk.id == chunkId) { // Avoid needless chunk reattachment
            return;
        }
        this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
    }

    object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, core, core2); // Attach new chunk

    // Ambient light is global across everything in display, and
    // can never be disabled, so grab it now because we want to
    // feed it to gl.clearColor before each display list render
    if (chunkType == "lights") {
        this._setAmbient(core);
    }
};

SceneJS_Display.prototype._setAmbient = function (core) {
    var lights = core.lights;
    var light;
    for (var i = 0, len = lights.length; i < len; i++) {
        light = lights[i];
        if (light.mode == "ambient") {
            this._ambientColor[0] = light.color[0];
            this._ambientColor[1] = light.color[1];
            this._ambientColor[2] = light.color[2];
        }
    }
};

/**
 * Removes an object from this display
 *
 * @param {String} objectId ID of object to remove
 */
SceneJS_Display.prototype.removeObject = function (objectId) {
    var object = this._objects[objectId];
    if (!object) {
        return;
    }
    this._programFactory.putProgram(object.program);
    object.program = null;
    object.hash = null;
    this._objectFactory.putObject(object);
    delete this._objects[objectId];
    this.objectListDirty = true;
};

/**
 * Set a tag selector to selectively activate objects that have matching SceneJS.Tag nodes
 */
SceneJS_Display.prototype.selectTags = function (tagSelector) {
    this._tagSelector = tagSelector;
    this.drawListDirty = true;
};

/**
 * Render this display. What actually happens in the method depends on what flags are set.
 *
 */
SceneJS_Display.prototype.render = function (params) {

    params = params || {};

    if (this.objectListDirty) {
        this._buildObjectList();          // Build object render bin
        this.objectListDirty = false;
        this.stateOrderDirty = true;        // Now needs state ordering
    }

    if (this.stateOrderDirty) {
        this._makeStateSortKeys();       // Compute state sort order
        this.stateOrderDirty = false;
        this.stateSortDirty = true;     // Now needs state sorting
    }

    if (this.stateSortDirty) {
        this._stateSort();              // State sort the object render bin
        this.stateSortDirty = false;
        this.drawListDirty = true;      // Now needs new visible object bin
        //this._logObjectList();
    }

    if (this.drawListDirty) {           // Render visible list while building transparent list
        this._buildDrawList();
        this.imageDirty = true;
        //this._logDrawList();
        //this._logPickList();
    }

    if (this.imageDirty || params.force) {
        this._doDrawList({ // Render, no pick
            clear: (params.clear !== false), // Clear buffers by default
            opaqueOnly: params.opaqueOnly
        });
        this.imageDirty = false;
        this.pickBufDirty = true;       // Pick buff will now need rendering on next pick
    }
};

SceneJS_Display.prototype._buildObjectList = function () {
    this._objectListLen = 0;
    for (var objectId in this._objects) {
        if (this._objects.hasOwnProperty(objectId)) {
            this._objectList[this._objectListLen++] = this._objects[objectId];
        }
    }
};

SceneJS_Display.prototype._makeStateSortKeys = function () {
    //  console.log("--------------------------------------------------------------------------------------------------");
    // console.log("SceneJS_Display_makeSortKeys");
    var object;
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        object = this._objectList[i];
        if (!object.program) {
            // Non-visual object (eg. sound)
            object.sortKey = -1;
        } else {
            object.sortKey =
                ((object.stage.priority + 1) * 1000000000000)
                + ((object.flags.transparent ? 2 : 1) * 1000000000)
                + ((object.layer.priority + 1) * 1000000)
                + ((object.program.id + 1) * 1000)
                + object.texture.stateId;
        }
    }
    //  console.log("--------------------------------------------------------------------------------------------------");
};

SceneJS_Display.prototype._stateSort = function () {
    this._objectList.length = this._objectListLen;
    this._objectList.sort(this._stateSortObjects);
};

SceneJS_Display.prototype._stateSortObjects = function (a, b) {
    return a.sortKey - b.sortKey;
};

SceneJS_Display.prototype._logObjectList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._objectListLen + " objects");
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        var object = this._objectList[i];
        console.log("SceneJS_Display : object[" + i + "] sortKey = " + object.sortKey);
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

SceneJS_Display.prototype._buildDrawList = function () {

    this._lastStateId = this._lastStateId || [];
    this._lastPickStateId = this._lastPickStateId || [];

    for (var i = 0; i < 25; i++) {
        this._lastStateId[i] = null;
        this._lastPickStateId[i] = null;
    }

    this._drawListLen = 0;
    this._pickDrawListLen = 0;

    this._drawListTransparentIndex = -1;

    // For each render target, a list of objects to render to that target
    var targetObjectLists = {};

    // A list of all the render target object lists
    var targetListList = [];

    // List of all targets
    var targetList = [];

    var object;
    var tagMask;
    var tagRegex;
    var tagCore;
    var flags;

    if (this._tagSelector) {
        tagMask = this._tagSelector.mask;
        tagRegex = this._tagSelector.regex;
    }

    this._objectDrawList = this._objectDrawList || [];
    this._objectDrawListLen = 0;

    for (var i = 0, len = this._objectListLen; i < len; i++) {

        object = this._objectList[i];

        // Cull invisible objects
        if (object.enable.enabled === false) {
            continue;
        }

        flags = object.flags;

        // Cull invisible objects
        if (flags.enabled === false) {
            continue;
        }

        // Cull objects in disabled layers
        if (!object.layer.enabled) {
            continue;
        }

        // Cull objects with unmatched tags
        if (tagMask) {
            tagCore = object.tag;
            if (tagCore.tag) {
                if (tagCore.mask != tagMask) { // Scene tag mask was updated since last render
                    tagCore.mask = tagMask;
                    tagCore.matches = tagRegex.test(tagCore.tag);
                }
                if (!tagCore.matches) {
                    continue;
                }
            }
        }

        // Put objects with render targets into a bin for each target
        if (object.renderTarget.targets) {
            var targets = object.renderTarget.targets;
            var target;
            var coreId;
            var list;
            for (var j = 0, lenj = targets.length; j < lenj; j++) {
                target = targets[j];
                coreId = target.coreId;
                list = targetObjectLists[coreId];
                if (!list) {
                    list = [];
                    targetObjectLists[coreId] = list;
                    targetListList.push(list);
                    targetList.push(this._chunkFactory.getChunk(target.stateId, "renderTarget", object.program, target));
                }
                list.push(object);
            }
        } else {

            //
            this._objectDrawList[this._objectDrawListLen++] = object;
        }
    }

    // Append chunks for objects within render targets first

    var list;
    var target;
    var object;
    var pickable;

    for (var i = 0, len = targetListList.length; i < len; i++) {

        list = targetListList[i];
        target = targetList[i];

        this._appendRenderTargetChunk(target);

        for (var j = 0, lenj = list.length; j < lenj; j++) {
            object = list[j];
            pickable = object.stage && object.stage.pickable; // We'll only pick objects in pickable stages
            this._appendObjectToDrawLists(object, pickable);
        }
    }

    if (object) {

        // Unbinds any render target bound previously
        this._appendRenderTargetChunk(this._chunkFactory.getChunk(-1, "renderTarget", object.program, {}));
    }

    // Append chunks for objects not in render targets
    for (var i = 0, len = this._objectDrawListLen; i < len; i++) {
        object = this._objectDrawList[i];
        pickable = !object.stage || (object.stage && object.stage.pickable); // We'll only pick objects in pickable stages
        this._appendObjectToDrawLists(object, pickable);
    }

    this.drawListDirty = false;
};


SceneJS_Display.prototype._appendRenderTargetChunk = function (chunk) {
    this._drawList[this._drawListLen++] = chunk;
};

/**
 * Appends an object to the draw and pick lists.
 * @param object
 * @param pickable
 * @private
 */
SceneJS_Display.prototype._appendObjectToDrawLists = function (object, pickable) {
    var chunks = object.chunks;
    var picking = object.flags.picking;
    var chunk;
    for (var i = 0, len = chunks.length; i < len; i++) {
        chunk = chunks[i];
        if (chunk) {

            // As we apply the state chunk lists we track the ID of most types of chunk in order
            // to cull redundant re-applications of runs of the same chunk - except for those chunks with a
            // 'unique' flag, because we don't want to cull runs of draw chunks because they contain the GL
            // drawElements calls which render the objects.

            if (chunk.draw) {
                if (chunk.unique || this._lastStateId[i] != chunk.id) { // Don't reapply repeated states
                    this._drawList[this._drawListLen] = chunk;
                    this._lastStateId[i] = chunk.id;

                    // Get index of first chunk in transparency pass

                    if (chunk.core && chunk.core && chunk.core.transparent) {
                        if (this._drawListTransparentIndex < 0) {
                            this._drawListTransparentIndex = this._drawListLen;
                        }
                    }
                    this._drawListLen++;
                }
            }

            if (chunk.pick) {
                if (pickable !== false) {   // Don't pick objects in unpickable stages
                    if (picking) {          // Don't pick unpickable objects
                        if (chunk.unique || this._lastPickStateId[i] != chunk.id) { // Don't reapply repeated states
                            this._pickDrawList[this._pickDrawListLen++] = chunk;
                            this._lastPickStateId[i] = chunk.id;
                        }
                    }
                }
            }
        }
    }
};

/**
 * Logs the contents of the draw list to the console.
 * @private
 */
SceneJS_Display.prototype._logDrawList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._drawListLen + " draw list chunks");
    for (var i = 0, len = this._drawListLen; i < len; i++) {
        var chunk = this._drawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

/**
 * Logs the contents of the pick list to the console.
 * @private
 */
SceneJS_Display.prototype._logPickList = function () {
    console.log("--------------------------------------------------------------------------------------------------");
    console.log(this._pickDrawListLen + " pick list chunks");
    for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
        var chunk = this._pickDrawList[i];
        console.log("[chunk " + i + "] type = " + chunk.type);
        switch (chunk.type) {
            case "draw":
                console.log("\n");
                break;
            case "renderTarget":
                console.log(" bufType = " + chunk.core.bufType);
                break;
        }
    }
    console.log("--------------------------------------------------------------------------------------------------");
};

(function () {

// Cached vectors to avoid garbage collection

    var origin = SceneJS_math_vec3();
    var dir = SceneJS_math_vec3();

    var a = SceneJS_math_vec3();
    var b = SceneJS_math_vec3();
    var c = SceneJS_math_vec3();

    var triangleVertices = SceneJS_math_vec3();
    var position = SceneJS_math_vec4();
    var worldPos = SceneJS_math_vec4();
    var barycentric = SceneJS_math_vec3();

    var na = SceneJS_math_vec3();
    var nb = SceneJS_math_vec3();
    var nc = SceneJS_math_vec3();

    var uva = SceneJS_math_vec3();
    var uvb = SceneJS_math_vec3();
    var uvc = SceneJS_math_vec3();

    var tempMat4 = SceneJS_math_mat4();
    var tempMat4b = SceneJS_math_mat4();

    var tempVec4 = SceneJS_math_vec4();
    var tempVec4b = SceneJS_math_vec4();
    var tempVec4c = SceneJS_math_vec4();

    var tempVec3 = SceneJS_math_vec3();
    var tempVec3b = SceneJS_math_vec3();
    var tempVec3c = SceneJS_math_vec3();
    var tempVec3d = SceneJS_math_vec3();
    var tempVec3e = SceneJS_math_vec3();
    var tempVec3f = SceneJS_math_vec3();
    var tempVec3g = SceneJS_math_vec3();
    var tempVec3h = SceneJS_math_vec3();
    var tempVec3i = SceneJS_math_vec3();
    var tempVec3j = SceneJS_math_vec3();


    // Given a GameObject and camvas coordinates, gets a ray
    // originating at the World-space eye position that passes
    // through the perspective projection plane. The ray is
    // returned via the origin and dir arguments.

    function getLocalRay(canvas, object, canvasCoords, origin, dir) {

        var modelMat = object.modelTransform.matrix;
        var viewMat = object.viewTransform.matrix;
        var projMat = object.projTransform.matrix;

        var vmMat = SceneJS_math_mulMat4(viewMat, modelMat, tempMat4);
        var pvMat = SceneJS_math_mulMat4(projMat, vmMat, tempMat4b);
        var pvMatInverse = SceneJS_math_inverseMat4(pvMat, tempMat4b);

        //var modelMatInverse = math.inverseMat4(modelMat, tempMat4c);

        // Calculate clip space coordinates, which will be in range
        // of x=[-1..1] and y=[-1..1], with y=(+1) at top

        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;

        var clipX = (canvasCoords[0] - canvasWidth / 2) / (canvasWidth / 2);  // Calculate clip space coordinates
        var clipY = -(canvasCoords[1] - canvasHeight / 2) / (canvasHeight / 2);

        var local1 = SceneJS_math_transformVector4(pvMatInverse, [clipX, clipY, -1, 1], tempVec4);
        local1 = SceneJS_math_mulVec4Scalar(local1, 1 / local1[3]);

        var local2 = SceneJS_math_transformVector4(pvMatInverse, [clipX, clipY, 1, 1], tempVec4b);
        local2 = SceneJS_math_mulVec4Scalar(local2, 1 / local2[3]);

        origin[0] = local1[0];
        origin[1] = local1[1];
        origin[2] = local1[2];

        SceneJS_math_subVec3(local2, local1, dir);
    }

    /**
     * Performs a pick on the display graph and returns info on the result.
     * @param {*} params
     * @returns {*}
     */
    SceneJS_Display.prototype.pick = function (params) {

        var canvas = this._canvas.canvas;
        var resolutionScaling = this._canvas.resolutionScaling;
        var canvasX = params.canvasX * resolutionScaling;
        var canvasY = params.canvasY * resolutionScaling;
        var canvasPos= [canvasX, canvasY];
        var pickBuf = this.pickBuf;
        var hit = null;
        var object;

        // Lazy-create pick buffer

        if (!pickBuf) {
            pickBuf = this.pickBuf = new SceneJS._webgl.RenderBuffer({
                canvas: this._canvas
            });
        }

        this.render(); // Do any pending visible render

        //------------------------------------------------------------------
        // Pick an object using color-indexed render
        //------------------------------------------------------------------

        pickBuf.bind();

        pickBuf.clear();

        this._doDrawList({
            pickObject: true,
            clear: true
        });

        this._canvas.gl.finish();

        // Read pixel color in pick buffer at given coordinates,
        // convert to an index into the pick name list

        var pix = pickBuf.read(canvasX, canvasY);

        var pickedColorIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
        var pickIndex = (pickedColorIndex >= 1) ? pickedColorIndex - 1 : -1;

        object = this._objectDrawList[pickIndex];

        //var pickName = this._frameCtx.pickNames[pickIndex];

        if (object) {

            hit = {
                canvasPos: canvasPos
            };

            var name = object.name;

            if (name) {
                hit.name = name.name;
                hit.path = name.path;
                hit.nodeId = name.nodeId;
            }
        }

        if (params.pickRegion) {

            //------------------------------------------------------------------
            // Pick a region
            // Region picking is independent of having picked an object
            //------------------------------------------------------------------

            hit = hit || {
                    canvasPos: canvasPos
                };

            pickBuf.clear();

            this._doDrawList({
                pickRegion: true,
                object: object,
                clear: true
            });

            pix = pickBuf.read(canvasX, canvasY);

            if (pix[0] !== 0 || pix[1] !== 0 || pix[2] === 0 || pix[3] === 0) {

                var regionColor = {r: pix[0] / 255, g: pix[1] / 255, b: pix[2] / 255, a: pix[3] / 255};
                var regionData = this._frameCtx.regionData;
                var tolerance = 0.01;
                var data = {};
                var color, delta;

                for (var i = 0, len = regionData.length; i < len; i++) {
                    color = regionData[i].color;
                    if (regionColor && regionData[i].data) {
                        delta = Math.max(
                            Math.abs(regionColor.r - color.r),
                            Math.abs(regionColor.g - color.g),
                            Math.abs(regionColor.b - color.b),
                            Math.abs(regionColor.a - (color.a === undefined ? regionColor.a : color.a))
                        );

                        if (delta < tolerance) {
                            data = regionData[i].data;
                            break;
                        }
                    }
                }

                hit.color = regionColor;
                hit.regionData = data;
            }
        }

        if (params.pickTriangle && object) {

            //------------------------------------------------------------------
            // Pick a triangle on the picked object
            //------------------------------------------------------------------

            pickBuf.clear();

            this._doDrawList({
                pickTriangle: true,
                object: object,
                clear: true
            });

            pix = pickBuf.read(canvasX, canvasY);
            var primitiveIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
            primitiveIndex = (primitiveIndex >= 1) ? primitiveIndex - 1 : -1;

            hit.primitiveIndex = primitiveIndex;

            var geometry = object.geometry;

            if (geometry.primitiveName === "triangles") {

                // Triangle picked; this only happens when the
                // GameObject has a Geometry that has primitives of type "triangle"

                hit.primitive = "triangle";

                // Get the World-space positions of the triangle's vertices

                var i = hit.primitiveIndex; // Indicates the first triangle index in the indices array

                var indices = geometry.arrays.indices;
                var positions = geometry.arrays.positions;

                var ia = indices[i];
                var ib = indices[i + 1];
                var ic = indices[i + 2];

                triangleVertices[0] = ia;
                triangleVertices[1] = ib;
                triangleVertices[2] = ic;

                hit.indices = triangleVertices;

                a[0] = positions[(ia * 3)];
                a[1] = positions[(ia * 3) + 1];
                a[2] = positions[(ia * 3) + 2];

                b[0] = positions[(ib * 3)];
                b[1] = positions[(ib * 3) + 1];
                b[2] = positions[(ib * 3) + 2];

                c[0] = positions[(ic * 3)];
                c[1] = positions[(ic * 3) + 1];
                c[2] = positions[(ic * 3) + 2];

                // Attempt to ray-pick the triangle; in World-space, fire a ray
                // from the eye position through the mouse position
                // on the perspective projection plane

                getLocalRay(canvas, object, canvasPos, origin, dir);

                // Since we've already picked the triangle, just grab the intersection
                // point rather testing against the triangle again.
                SceneJS_math_rayPlaneIntersect(origin, dir, a, b, c, position);

                // Get Local-space cartesian coordinates of the ray-triangle intersection

                hit.position = position;

                // Get interpolated World-space coordinates

                // Need to transform homogeneous coords

                tempVec4[0] = position[0];
                tempVec4[1] = position[1];
                tempVec4[2] = position[2];
                tempVec4[3] = 1;

                // Get World-space cartesian coordinates of the ray-triangle intersection

                SceneJS_math_transformVector4(object.modelTransform.matrix, tempVec4, tempVec4b);

                worldPos[0] = tempVec4b[0];
                worldPos[1] = tempVec4b[1];
                worldPos[2] = tempVec4b[2];

                hit.worldPos = worldPos;

                // Get barycentric coordinates of the ray-triangle intersection

                SceneJS_math_cartesianToBarycentric(position, a, b, c, barycentric);

                hit.barycentric = barycentric;

                // Get interpolated normal vector

                var normals = geometry.arrays.normals;

                if (normals) {

                    na[0] = normals[(ia * 3)];
                    na[1] = normals[(ia * 3) + 1];
                    na[2] = normals[(ia * 3) + 2];

                    nb[0] = normals[(ib * 3)];
                    nb[1] = normals[(ib * 3) + 1];
                    nb[2] = normals[(ib * 3) + 2];

                    nc[0] = normals[(ic * 3)];
                    nc[1] = normals[(ic * 3) + 1];
                    nc[2] = normals[(ic * 3) + 2];

                    hit.normal = SceneJS_math_addVec3(SceneJS_math_addVec3(
                            SceneJS_math_mulVec3Scalar(na, barycentric[0], tempVec3),
                            SceneJS_math_mulVec3Scalar(nb, barycentric[1], tempVec3b), tempVec3c),
                        SceneJS_math_mulVec3Scalar(nc, barycentric[2], tempVec3d), tempVec3e);
                }

                // Get interpolated UV coordinates

                var uvs = geometry.arrays.uv;

                if (uvs) {

                    uva[0] = uvs[(ia * 2)];
                    uva[1] = uvs[(ia * 2) + 1];

                    uvb[0] = uvs[(ib * 2)];
                    uvb[1] = uvs[(ib * 2) + 1];

                    uvc[0] = uvs[(ic * 2)];
                    uvc[1] = uvs[(ic * 2) + 1];

                    hit.uv = SceneJS_math_addVec3(
                        SceneJS_math_addVec3(
                            SceneJS_math_mulVec2Scalar(uva, barycentric[0], tempVec3f),
                            SceneJS_math_mulVec2Scalar(uvb, barycentric[1], tempVec3g), tempVec3h),
                        SceneJS_math_mulVec2Scalar(uvc, barycentric[2], tempVec3i), tempVec3j);
                }
            }
        }

        pickBuf.unbind();

        return hit;
    };
})();

/** Renders either the draw or pick list.
 *
 * @param {*} params
 * @param {Boolean} params.clear Set true to clear the color, depth and stencil buffers first
 * @param {*} params.object Object to render chunks of, for pickTriangle or pickRegion modes
 * @param {Boolean} params.pickObject Set true to render for object-picking, using per-object indexed color
 * @param {Boolean} params.pickTriangle Set true to render for triangle-picking, using per-triangle indexed color
 * @param {Boolean} params.pickRegion Set true to render for region-picking
 * @param {Boolean} params.transparent Set false to only render opaque objects
 * @private
 */
SceneJS_Display.prototype._doDrawList = function (params) {

    var gl = this._canvas.gl;

    // Reset frame context
    var frameCtx = this._frameCtx;
    frameCtx.renderTarget = null;
    frameCtx.targetIndex = 0;
    frameCtx.renderBuf = null;
    frameCtx.viewMat = null;
    frameCtx.modelMat = null;
    frameCtx.cameraMat = null;
    frameCtx.renderer = null;
    frameCtx.depthbufEnabled = null;
    frameCtx.clearDepth = null;
    frameCtx.depthFunc = gl.LESS;
    frameCtx.scissorTestEnabled = false;
    frameCtx.blendEnabled = false;
    frameCtx.backfaces = true;
    frameCtx.frontface = "ccw";
    frameCtx.pickObject = !!params.pickObject;
    frameCtx.pickTriangle = !!params.pickTriangle;
    frameCtx.pickRegion = !!params.pickRegion;
    frameCtx.pickIndex = 0;
    frameCtx.textureUnit = 0;
    frameCtx.lineWidth = 1;
    frameCtx.transparent = false;
    frameCtx.ambientColor = this._ambientColor;
    frameCtx.aspect = this._canvas.canvas.width / this._canvas.canvas.height;

    // The extensions needs to be re-queried in case the context was lost and has been recreated.
    if (this._canvas.UINT_INDEX_ENABLED) {
        gl.getExtension("OES_element_index_uint");
    }

    var VAO = gl.getExtension("OES_vertex_array_object");
    frameCtx.VAO = (VAO) ? VAO : null;

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    if (this.transparent || params.pick) {
        gl.clearColor(0, 0, 0, 0);
    } else {
        gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
    }

    if (params.clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    }

    gl.frontFace(gl.CCW);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    if (params.pickObject) {

        // Pick object
        // Render whole draw list

        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
            this._pickDrawList[i].pick(frameCtx);
        }

    } else if (params.pickRegion || params.pickTriangle) {

        // Pick region or triangle

        if (params.object) {

            // Object was picked
            // Render just the chunks of the target object

            var chunks = params.object.chunks;
            var chunk;

            for (var i = 0, len = chunks.length; i < len; i++) {
                chunk = chunks[i];
                if (chunk && chunk.pick) {
                    chunk.pick(frameCtx);
                }
            }

        } else {

            // No object was picked
            // Render whole draw list

            if (params.pickRegion) {

                for (var i = 0, len = this._pickDrawListLen; i < len; i++) {
                    this._pickDrawList[i].pick(frameCtx);
                }
            }
        }

    } else {

        // Render scene
        // Render whole draw list

        // Option to only render opaque objects
        var len = (params.opaqueOnly ? this._drawListTransparentIndex : this._drawListLen);

        // Render for draw
        for (var i = 0; i < len; i++) {      // Push opaque rendering chunks
            this._drawList[i].draw(frameCtx);
        }
    }

    gl.flush();

    if (frameCtx.renderBuf) {
        frameCtx.renderBuf.unbind();
    }

    if (frameCtx.VAO) {
        frameCtx.VAO.bindVertexArrayOES(null);
        for (var i = 0; i < 10; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
//
//    var numTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
//    for (var ii = 0; ii < numTextureUnits; ++ii) {
//        gl.activeTexture(gl.TEXTURE0 + ii);
//        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
//        gl.bindTexture(gl.TEXTURE_2D, null);
//    }
};

SceneJS_Display.prototype.readPixels = function (entries, size) {

    if (!this._readPixelBuf) {
        this._readPixelBuf = new SceneJS._webgl.RenderBuffer({canvas: this._canvas});
    }

    this._readPixelBuf.bind();

    this._readPixelBuf.clear();

    this.render({force: true});

    var entry;
    var color;

    for (var i = 0; i < size; i++) {

        entry = entries[i] || (entries[i] = {});

        color = this._readPixelBuf.read(entry.x, entry.y);

        entry.r = color[0];
        entry.g = color[1];
        entry.b = color[2];
        entry.a = color[3];
    }

    this._readPixelBuf.unbind();
};

/**
 * Unpacks a color-encoded depth
 * @param {Array(Number)} depthZ Depth encoded as an RGBA color value
 * @returns {Number}
 * @private
 */
SceneJS_Display.prototype._unpackDepth = function (depthZ) {
    var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
    var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
    return SceneJS_math_dotVector4(vec, bitShift);
};


SceneJS_Display.prototype.destroy = function () {
    this._programFactory.destroy();
};
