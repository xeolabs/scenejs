/**
 * @class Renders and picks a {@link SceneJS.Scene}
 * @private
 *
 * <p>A Display is a container of {@link SceneJS_Object}s which are created (or updated) by a depth-first
 * <b>compilation traversal</b> of the nodes within a {@link SceneJS.Scene}.</b>
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
 * <p>The draw list is actually comprised of three lists of state chunks: a "pick" list to render a pick buffer
 * for colour-indexed GPU picking, along with an "opaque" list and "transparent" list for normal image rendering.
 * For normal rendering the opaque list is rendered, then blending is enabled and the transparent list is rendered.
 * The chunks in these lists are held in the state-sorted order of their objects in #_objectList, with runs of
 * duplicate states removed, as mentioned.</p>
 *
 * <p>After a scene update, we set a flag on the display to indicate the stage we will need to redo from. The pipeline is
 * then lazy-redone on the next call to #render or #pick.</p>
 */
var SceneJS_Display = function (cfg) {

    /* Display is bound to the lifetime of an HTML5 canvas
     */
    this._canvas = cfg.canvas;

    /* Factory which creates and recycles {@link SceneJS_Program} instances
     */
    this._programFactory = new SceneJS_ProgramFactory({
        canvas:cfg.canvas
    });

    /* Factory which creates and recycles {@link SceneJS.Chunk} instances
     */
    this._chunkFactory = new SceneJS_ChunkFactory();

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
     * Node state core for the last {@link SceneJS.Renderer} visited during scene graph compilation traversal
     * @type Object
     */
    this.renderer = null;

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
     * Node state core for the last {@link SceneJS.Framebuf} visited during scene graph compilation traversal
     * @type Object
     */
    this.framebuf = null;

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
    this._ambientColor = [0, 0, 0];

    /**
     * The object list, containing all elements of #_objects, kept in GL state-sorted order
     */
    this._objectList = [];
    this._objectListLen = 0;

    /* The "draw list", comprised collectively of three lists of state chunks belong to visible objects
     * within #_objectList: a "pick" list to render a pick buffer for colour-indexed GPU picking, along with an
     * "opaque" list and "transparent" list for normal image rendering. For normal rendering the opaque list is
     * rendered, then blending is enabled and the transparent list is rendered. The chunks in these lists
     * are held in the state-sorted order of their objects in #_objectList, with runs of duplicate states removed.
     */
    this._opaqueDrawList = [];         // State chunk list to render opaque objects
    this._opaqueDrawListLen = 0;

    this._transparentDrawList = [];    // State chunk list to render transparent objects
    this._transparentDrawListLen = 0;

    this._pickDrawList = [];           // State chunk list to render scene to pick buffer
    this._pickDrawListLen = 0;

    /* The frame context holds state shared across a single render of the draw list, along with any results of
     * the render, such as pick hits
     */
    this._frameCtx = {
        pickNames:[], // Pick names of objects hit during pick render
        canvas:this._canvas            // The canvas
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

    /**
     * Flags the neccessity for the image buffer to be re-rendered from the draw list.
     * @type Boolean
     */
    this.pickBufDirty = true;           // Redraw pick buffer
    this.rayPickBufDirty = true;        // Redraw raypick buffer
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

    if (this.rayPickBuf) {
        this.rayPickBuf.webglRestored(gl);
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

    object.layer = this.layer;
    object.texture = this.texture;
    object.geometry = this.geometry;
    object.flags = this.flags;
    object.tag = this.tag;

    //if (!object.hash) {

    var hash = ([                   // Build current state hash
        this.geometry.hash,
        this.shader.hash,
        this.clips.hash,
        this.morphGeometry.hash,
        this.texture.hash,
        this.lights.hash

    ]).join(";");

    if (!object.program || hash != object.hash) {

        /* Get new program for object if no program or hash mismatch
         */

        if (object.program) {
            this._programFactory.putProgram(object.program);
        }

        object.program = this._programFactory.getProgram(hash, this);
        object.hash = hash;
    }
    //}

    /* Build draw chunks for object
     */
    this._setChunk(object, 0, "program");          // Must be first
    this._setChunk(object, 1, "xform", this.modelTransform);
    this._setChunk(object, 2, "lookAt", this.viewTransform);
    this._setChunk(object, 3, "camera", this.projTransform);
    this._setChunk(object, 4, "flags", this.flags);
    this._setChunk(object, 5, "shader", this.shader);
    this._setChunk(object, 6, "shaderParams", this.shaderParams);
    //  this._setChunk(object, 7, this.renderer, true);
    this._setChunk(object, 7, "name", this.name);
    this._setChunk(object, 8, "lights", this.lights);
    this._setChunk(object, 9, "material", this.material);
    this._setChunk(object, 10, "texture", this.texture);
    this._setChunk(object, 11, "framebuf", this.framebuf);
    this._setChunk(object, 12, "clips", this.clips);
    this._setChunk(object, 13, "morphGeometry", this.morphGeometry);
    this._setChunk(object, 14, "listeners", this.renderListeners);      // Must be after the above chunks
    this._setChunk(object, 15, "geometry", this.geometry); // Must be last
};

SceneJS_Display.prototype._setChunk = function (object, order, chunkType, core, unique) {

    var chunkId;

    if (unique) {

        chunkId = core.stateId + 1;

    } else if (core) {

        if (core.empty) { // Only set default cores for state types that have them

            var oldChunk = object.chunks[order];

            if (oldChunk) {
                this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
            }

            object.chunks[order] = null;

            return;
        }

        chunkId = ((object.program.id + 1) * 50000) + core.stateId + 1;

    } else {

        chunkId = ((object.program.id + 1) * 50000);
    }

    var oldChunk = object.chunks[order];

    if (oldChunk) {

        if (oldChunk.id == chunkId) { // Avoid needless chunk reattachment
            return;
        }

        this._chunkFactory.putChunk(oldChunk); // Release previous chunk to pool
    }

    object.chunks[order] = this._chunkFactory.getChunk(chunkId, chunkType, object.program, core); // Attach new chunk

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
            this._ambientColor = light.color;
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
    }

    if (this.drawListDirty) {           // Render visible list while building transparent list

        this._buildDrawList();

        this.imageDirty = true;
    }

    if (this.imageDirty || params.force) {

        this._doDrawList(false);        // Render, no pick

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

SceneJS_Display.prototype._makeStateSortKeys = function () { // TODO: state sort for sound objects?
    var object;
    for (var i = 0, len = this._objectListLen; i < len; i++) {
        object = this._objectList[i];
        object.sortKey = object.program
            ? (((object.layer.priority + 1) * 100000000)
            + ((object.program.id + 1) * 100000)
            + (object.texture.stateId * 1000))
            //    + i // Force stability among same-priority objects across multiple sorts
            : -1;   // Non-visual object (eg. sound)
    }
};

//SceneJS_Display.prototype._makeStateSortKeys = function () { // TODO: state sort for sound objects?
//    var object;
//    for (var i = 0, len = this._objectListLen; i < len; i++) {
//        object = this._objectList[i];
//        object.sortKey = object.program
//            ? (((object.layer.priority + 1) * 1000000000)
//            + ((object.program.id + 1) * 1000000)
//            + (object.texture.stateId * 10000)
//            + (object.geometry.stateId))
//            //    + i // Force stability among same-priority objects across multiple sorts
//            : -1;   // Non-visual object (eg. sound)
//    }
//};

SceneJS_Display.prototype._stateSort = function () {
    this._objectList.length = this._objectListLen;
    this._objectList.sort(this._stateSortObjects);
};

SceneJS_Display.prototype._stateSortObjects = function (a, b) {
    return a.sortKey - b.sortKey;
};

SceneJS_Display.prototype._buildDrawList = function () {

    this._lastStateId = this._lastStateId || [];
    this._lastPickStateId = this._lastPickStateId || [];

    for (var i = 0; i < 20; i++) {
        this._lastStateId[i] = null;
        this._lastPickStateId[i] = null;
    }

    this._opaqueDrawListLen = 0;
    this._pickDrawListLen = 0;
    this._transparentDrawListLen = 0;

    var object;
    var tagMask;
    var tagRegex;
    var tagCore;
    var flags;
    var chunks;
    var chunk;
    var transparent;
    var picking;

    if (this._tagSelector) {
        tagMask = this._tagSelector.mask;
        tagRegex = this._tagSelector.regex;
    }

    if (!this._xpBuf) {
        this._xpBuf = [];
    }
    this._xpBufLen = 0;

    for (var i = 0, len = this._objectListLen; i < len; i++) {

        object = this._objectList[i];

        flags = object.flags;

        /* Cull invisible objects
         */

        if (flags.enabled === false) {                              // Skip disabled object
            continue;
        }

        if (!object.layer.enabled) { // Skip disabled layers
            continue;
        }

        if (tagMask) { // Skip unmatched tags. No tag matching in visible bin prevent this being done on every frame.

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

        transparent = flags.transparent;

        if (transparent) {
            this._xpBuf[this._xpBufLen++] = object;
        }

        /* Add object's chunks to appropriate chunk list
         */

        chunks = object.chunks;

        picking = flags.picking;

        for (var j = 0, lenj = chunks.length; j < lenj; j++) {

            chunk = chunks[j];

            if (chunk) {

                /*
                 * As we apply the state chunk lists we track the ID of most types of chunk in order
                 * to cull redundant re-applications of runs of the same chunk - except for those chunks with a
                 * 'unique' flag. We don't want to cull runs of geometry chunks because they contain the GL
                 * drawElements calls which render the objects.
                 */

                if (!transparent && chunk.draw) {
                    if (chunk.unique || this._lastStateId[j] != chunk.id) {
                        this._opaqueDrawList[this._opaqueDrawListLen++] = chunk;
                        this._lastStateId[j] = chunk.id;
                    }
                }

                if (chunk.pick) { // Transparent objects are pickable
                    if (picking) { // Don't pick unpickable objects
                        if (chunk.unique || this._lastPickStateId[j] != chunk.id) {
                            this._pickDrawList[this._pickDrawListLen++] = chunk;
                            this._lastPickStateId[j] = chunk.id;
                        }
                    }
                }
            }
        }
    }

    if (this._xpBufLen > 0) {

        for (var i = 0; i < 20; i++) {
            this._lastStateId[i] = null;
        }

        for (var i = 0; i < this._xpBufLen; i++) {

            object = this._xpBuf[i];
            chunks = object.chunks;

            for (var j = 0, lenj = chunks.length; j < lenj; j++) {

                chunk = chunks[j];

                if (chunk && chunk.draw) {

                    if (chunk.unique || this._lastStateId[j] != chunk.id) {
                        this._transparentDrawList[this._transparentDrawListLen++] = chunk;
                        this._lastStateId[j] = chunk.id;
                    }
                }
            }
        }
    }

    this.drawListDirty = false;
};

SceneJS_Display.prototype.pick = function (params) {

    //return;

    var canvas = this._canvas.canvas;

    var hit = null;

    var canvasX = params.canvasX;
    var canvasY = params.canvasY;

    /*-------------------------------------------------------------
     * Pick object using normal GPU colour-indexed pick
     *-----------------------------------------------------------*/

    var pickBuf = this.pickBuf;                                                   // Lazy-create pick buffer

    if (!pickBuf) {
        pickBuf = this.pickBuf = new SceneJS_PickBuffer({ canvas:this._canvas });
        this.pickBufDirty = true;                                                 // Freshly-created pick buffer is dirty
    }

    this.render(); // Do any pending visible render

    pickBuf.bind();                                                                 // Bind pick buffer

    if (this.pickBufDirty) {                          // Render pick buffer

        pickBuf.clear();

        this._doDrawList(true);

        this._canvas.gl.finish();

        this.pickBufDirty = false;                                                  // Pick buffer up to date
        this.rayPickBufDirty = true;                                                // Ray pick buffer now dirty
    }

    var pix = pickBuf.read(canvasX, canvasY);                                       // Read pick buffer
    var pickedObjectIndex = pix[0] + pix[1] * 256 + pix[2] * 65536;
    var pickIndex = (pickedObjectIndex >= 1) ? pickedObjectIndex - 1 : -1;

    pickBuf.unbind();                                                               // Unbind pick buffer

    var pickName = this._frameCtx.pickNames[pickIndex];                                   // Map pixel to name

    if (pickName) {

        hit = {
            name:pickName
        };

        if (params.rayPick) { // Ray pick to find position

            var rayPickBuf = this.rayPickBuf; // Lazy-create Z-pick buffer
            if (!rayPickBuf) {
                rayPickBuf = this.rayPickBuf = new SceneJS_PickBuffer({ canvas:this._canvas });
            }

            rayPickBuf.bind();

            if (this.rayPickBufDirty) {

                rayPickBuf.clear();

                this._doDrawList(true, true); // pick, rayPick

                this.rayPickBufDirty = false;
            }

            pix = rayPickBuf.read(canvasX, canvasY);

            rayPickBuf.unbind();

            /* Read normalised device Z coordinate, which will be
             * in range of [0..1] with z=0 at front
             */
            var screenZ = this._unpackDepth(pix);

            var w = canvas.width;
            var h = canvas.height;

            /* Calculate clip space coordinates, which will be in range
             * of x=[-1..1] and y=[-1..1], with y=(+1) at top
             */
            var x = (canvasX - w / 2) / (w / 2);           // Calculate clip space coordinates
            var y = -(canvasY - h / 2) / (h / 2);

            var projMat = this._frameCtx.cameraMat;
            var viewMat = this._frameCtx.viewMat;

            var pvMat = SceneJS_math_mulMat4(projMat, viewMat, []);
            var pvMatInverse = SceneJS_math_inverseMat4(pvMat, []);

            var world1 = SceneJS_math_transformVector4(pvMatInverse, [x, y, -1, 1]);
            world1 = SceneJS_math_mulVec4Scalar(world1, 1 / world1[3]);

            var world2 = SceneJS_math_transformVector4(pvMatInverse, [x, y, 1, 1]);
            world2 = SceneJS_math_mulVec4Scalar(world2, 1 / world2[3]);

            var dir = SceneJS_math_subVec3(world2, world1, []);

            var vWorld = SceneJS_math_addVec3(world1, SceneJS_math_mulVec4Scalar(dir, screenZ, []), []);

            hit.canvasPos = [canvasX, canvasY];
            hit.worldPos = vWorld;
        }
    }

    return hit;
};

SceneJS_Display.prototype._unpackDepth = function (depthZ) {
    var vec = [depthZ[0] / 256.0, depthZ[1] / 256.0, depthZ[2] / 256.0, depthZ[3] / 256.0];
    var bitShift = [1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0];
    return SceneJS_math_dotVector4(vec, bitShift);
};

SceneJS_Display.prototype._doDrawList = function (pick, rayPick) {

    var frameCtx = this._frameCtx;                                                // Reset rendering context

    frameCtx.program = null;
    frameCtx.framebuf = null;
    frameCtx.viewMat = null;
    frameCtx.modelMat = null;
    frameCtx.cameraMat = null;
    frameCtx.renderer = null;
    frameCtx.vertexBuf = false;
    frameCtx.normalBuf = false;
    frameCtx.uvBuf = false;
    frameCtx.uvBuf2 = false;
    frameCtx.colorBuf = false;
    frameCtx.backfaces = false;
    frameCtx.frontface = "ccw";
    frameCtx.pick = !!pick;

    var gl = this._canvas.gl;

    gl.viewport(0, 0, this._canvas.canvas.width, this._canvas.canvas.height);
    gl.clearColor(this._ambientColor[0], this._ambientColor[1], this._ambientColor[2], 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.lineWidth(3);
    gl.frontFace(gl.CCW);
    //   gl.disable(gl.CULL_FACE);

    if (pick) { // Pick

        frameCtx.pickIndex = 0;
        frameCtx.rayPick = !!rayPick;

        for (var i = 0, len = this._pickDrawListLen; i < len; i++) {        // Push picking chunks
            this._pickDrawList[i].pick(frameCtx);
        }

    } else { // Draw

        for (var i = 0, len = this._opaqueDrawListLen; i < len; i++) {      // Push opaque rendering chunks
            this._opaqueDrawList[i].draw(frameCtx);
        }

        if (this._transparentDrawListLen > 0) {

            gl.enable(gl.BLEND);                                            // Enable blending
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            for (var i = 0, len = this._transparentDrawListLen; i < len; i++) { // Push transparent rendering chunks
                this._transparentDrawList[i].draw(frameCtx);
            }

            gl.disable(gl.BLEND);                                           //  Disable blending
        }
    }

    gl.flush();                                                         // Flush GL

    if (frameCtx.program) {                                                  // Unbind remaining program
        //frameCtx.program.unbind();
    }

    if (frameCtx.framebuf) {                                                 // Unbind remaining frame buffer
        gl.finish();
        frameCtx.framebuf.unbind();
    }

    if (frameCtx.renderer) {                           // Forget last call-time renderer properties
        //     frameCtx.renderer.props.restoreProps(gl);
    }
};

SceneJS_Display.prototype.destroy = function () {
    this._programFactory.destroy();
};

