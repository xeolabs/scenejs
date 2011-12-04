/**
 * State node renderer
 */
var SceneJS_DrawListRenderer = function(cfg) {

    this._canvas = cfg.canvas;
    this._context = cfg.context;

    this.pickNameStates = [];

    this._callCtx = {};                                   // State retained within a single iteration of the call list

    /** Facade to support node state queries while node rendering
     */

    var self = this;

    this._queryFacade = {

        _node: null,

        _setNode: function(node) {
            this._node = node;
            this._mem = {};
        },

        getCameraMatrix : function() {
            return this._mem.camMat ? this._mem.camMat : this._mem.camMat = this._node.projXFormState.mat.slice(0);
        },

        getViewMatrix : function() {
            return this._mem.viewMat ? this._mem.viewMat : this._mem.viewMat = this._node.viewXFormState.mat.slice(0);
        },

        getModelMatrix : function() {
            return this._mem.modelMat ? this._mem.modelMat : this._mem.modelMat = this._node.modelXFormState.mat.slice(0);
        },

        getCanvasPos : function(offset) {

            if (this._mem.canvasPos && (!offset)) {
                return this._mem.canvasPos;
            }

            this.getProjPos(offset);

            if (!this._mem.canvasWidth) {
                this._mem.canvasWidth = self._canvas.width;
                this._mem.canvasHeight = self._canvas.height;
            }

            /* Projection division and map to canvas
             */
            var pc = this._mem.pc;

            var x = (pc[0] / pc[3]) * this._mem.canvasWidth * 0.5;
            var y = (pc[1] / pc[3]) * this._mem.canvasHeight * 0.5;

            return this._mem.canvasPos = {
                x: x + (self._canvas.width * 0.5),
                y: this._mem.canvasHeight - y - (this._mem.canvasHeight * 0.5)
            };
        },

        getCameraPos : function(offset) {
            if (!this._mem.camPos || offset) {
                this.getProjPos(offset);
                this._mem.camPos = SceneJS_math_normalizeVec3(this._mem.pc, [0,0,0]);
            }
            return { x: this._mem.camPos[0], y: this._mem.camPos[1], z: this._mem.camPos[2] };
        },

        getProjPos : function(offset) {
            if (!this._mem.pc || offset) {
                this.getViewPos(offset);
                this._mem.pc = SceneJS_math_transformPoint3(this._node.projXFormState.mat, this._mem.vc);
            }
            return { x: this._mem.pc[0], y: this._mem.pc[1], z: this._mem.pc[2],  w: this._mem.pc[3] };
        },

        getViewPos : function(offset) {
            if (!this._mem.vc || offset) {
                this.getWorldPos(offset);
                this._mem.vc = SceneJS_math_transformPoint3(this._node.viewXFormState.mat, this._mem.wc);
            }
            return { x: this._mem.vc[0], y: this._mem.vc[1], z: this._mem.vc[2],  w: this._mem.vc[3] };
        },

        getWorldPos : function(offset) {
            if (!this._mem.wc || offset) {
                this._mem.wc = SceneJS_math_transformPoint3(this._node.modelXFormState.mat, offset || [0,0,0]);
            }
            return { x: this._mem.wc[0], y: this._mem.wc[1], z: this._mem.wc[2],  w: this._mem.wc[3] };
        }
    };


    /**
     * Called before we render all state nodes for a frame.
     * Forgets any program that was used for the last node rendered, which causes it
     * to forget all states for that node.
     */
    this.init = function(params) {
        params = params || {};
        this._picking = params.picking;
        this._rayPicking = params.rayPick;

        this._callListDirty = params.callListDirty;
        this._callFuncsDirty = params.callFuncsDirty;

        this._program = null;
        this._lastFramebuf = null;
        this._lastFlagsState = null;
        this._lastRendererState = null;
        this._lastRenderListenersState = null;

        this._pickIndex = 0;

        /* Initialialise call context
         */
        this._callCtx.picking = this._picking;
        this._callCtx.rayPicking = this._rayPicking;
        this._callCtx.lastFrameBuf = null;
        this._callCtx.lastRendererProps = null;
        this._callCtx.lastFlagsState = null;

        this.stateSortProfile = {
            numTextures: 0,
            numGeometries: 0
        };
    };

    this.createCall = function(fn) {
        if (this._picking) {
            this._node.__pickCallList[this._node.__pickCallListLen++] = fn;
        } else {
            this._node.__drawCallList[this._node.__drawCallListLen++] = fn;
        }
        fn();
    };

    /**
     * Renders a state node. Makes state changes only where the node's states have different IDs
     * than the states of the last node. If the node has a different program than the last node
     * rendered, Renderer forgets all states for the previous node and makes a fresh set of transitions
     * into all states for this node.
     */
    this.renderNode = function(node) {

        if (this._picking || this._rayPicking) {                      // Picking mode - same calls for pick and Z-pick

            if (!(this._callListDirty || this._callFuncsDirty)) {   // Call list and function cache still good
                var pickList = node.__pickCallList;                 // Execute call list and return
                for (var i = 0, len = node.__pickCallListLen; i < len; i++) {
                    pickList[i]();
                }
                return;
            }

            /* Call list or function cache dirty
             */

            if (!node.__pickCallList) {                             // Lazy-allocate call list and function caches
                node._pickCallFuncs = node._pickCallFuncs || {};
                node.__pickCallList = [];
            }

            node.__pickCallListLen = 0;                             // (Re)building call list

            if (this._callFuncsDirty) {
                node._pickCallFuncs = {};                           // (Re)building function cache
            }

        } else {                                                    // Drawing mode

            this._queryFacade._setNode(node);                       // Activate query facade for render listeners

            if (!(this._callListDirty || this._callFuncsDirty)) {   // Call list and function cache still good
                var drawList = node.__drawCallList;                 // Execute pick call list and return
                for (var i = 0, len = node.__drawCallListLen; i < len; i++) {
                    drawList[i]();
                }
                return;
            }

            if (!node.__drawCallList) {                             // Lazy-allocate call list and function caches
                node._drawCallFuncs = node._drawCallFuncs || {};
                node.__drawCallList = [];
            }

            node.__drawCallListLen = 0;                             // (Re)building call list

            if (this._callFuncsDirty) {                             // (Re)building function cache
                node._drawCallFuncs = {};
            }
        }

        this._node = node;

        this._callFuncs = this._picking                             // Draw list is built once for colour pick and z-pick
                ? node._pickCallFuncs                               // Activate cache of WebGL call functions for pick or draw
                : node._drawCallFuncs;

        /* Cache some often-used node states for fast access
         */
        var nodeFlagsState = node.flagsState;
        var nodeGeoState = node.geoState;

        /* Bind program if none bound, or if node uses different program
         * to that currently bound.
         *
         * Also flag all buffers as needing to be bound.
         */
        if ((!this._program) || (node.program.id != this._lastProgramId)) {

            if (this._picking) {
                this._program = node.program.pick;

            } else {
                this._program = node.program.render;
            }

            if (this.stateSortProfile) {
                this._program.setProfile(this.profile);
            }

            /*----------------------------------------------------------------------------------------------------------
             * Program for render or pick
             *--------------------------------------------------------------------------------------------------------*/

            if (this._picking) {

                this.createCall(
                        this._callFuncs["pickShader"]
                                || (this._callFuncs["pickShader"] =

                                    (function() {

                                        var program = node.program.pick;

                                        var context = self._context;

                                        var callCtx = self._callCtx;

                                        var rayPickModeLocation;

                                        return function() {

                                            if (callCtx.program) {
                                                callCtx.program.unbind();
                                            }

                                            program.bind();

                                            if (!rayPickModeLocation) {
                                                rayPickModeLocation = program.getUniformLocation("SCENEJS_uRayPickMode");
                                            }
                                            context.uniform1i(rayPickModeLocation, !!callCtx.rayPicking);

                                            callCtx.program = program;
                                        };
                                    })()));
            } else {

                this.createCall(
                        this._callFuncs["renderShader"]
                                || (this._callFuncs["renderShader"] =
                                    (function() {

                                        var program = node.program.render;

                                        var callCtx = self._callCtx;

                                        return function() {

                                            if (callCtx.program) {
                                                callCtx.program.unbind();
                                            }

                                            program.bind();

                                            callCtx.program = program;
                                        };
                                    })()));
            }

            /** Track IDs of bound states as we build call list
             */
            this._lastProgramId = node.program.id;
            this._lastShaderStateId = -1;
            this._lastShaderParamsStateId = -1;
            this._lastGeoStateId = -1;
            this._lastFlagsStateId = -1;
            this._lastColortransStateId = -1;
            this._lastLightStateId = -1;
            this._lastClipStateId = -1;
            this._lastMorphStateId = -1;
            this._lastTexStateId = -1;
            this._lastMaterialStateId = -1;
            this._lastViewXFormStateId = -1;
            this._lastModelXFormStateId = -1;
            this._lastProjXFormStateId = -1;
            this._lastPickStateId = -1;
            this._lastFramebufStateId = -1;
            this._lastRenderListenersStateId = -1;

            /*----------------------------------------------------------------------------------------------------------
             * shader node
             *--------------------------------------------------------------------------------------------------------*/

            if (node.shaderState.shader &&
                node.shaderState.shader.paramsStack) { // Custom shader - set any params we have

                if (this._lastShaderStateId != node.shaderState._stateId) {

                    /*--------------------------------------------------------------------------------------------------
                     * A call list node.
                     *
                     * Each WebGL call is wrapped by function that is created by a higher-order function which prepares
                     * the arguments and caches them in a closure.
                     *------------------------------------------------------------------------------------------------*/

                    this.createCall(
                            this._callFuncs["shader"]
                                    || (this._callFuncs["shader"] =
                                        (function() {

                                            /*-------------------------------------------------------------------------
                                             * Code within the closure should be independent of state on any other
                                             * draw list node, in the assumption that the draw list may reorder, or
                                             * that other nodes may disappear from the draw list. It may however
                                             * safely depend on other previous executions of calls belonging to this
                                             * draw list node.
                                             *-----------------------------------------------------------------------*/

                                            var program = self._program;

                                            /* Cache param uniform locations and values
                                             */
                                            var paramsStack = node.shaderState.shader.paramsStack;

                                            return function() {

                                                /*----------------------------------------------------------------------
                                                 * Code within the call function depends on state held within the
                                                 * closure, and may safely depend on state set by any previous other
                                                 * draw list node or call.
                                                 *--------------------------------------------------------------------*/

                                                var params;
                                                var name;
                                                for (var i = 0, len = paramsStack.length; i < len; i++) {
                                                    params = paramsStack[i];
                                                    for (name in params) {
                                                        if (params.hasOwnProperty(name)) {
                                                            program.setUniform(name, params[name]);  // TODO: cache locations
                                                        }
                                                    }
                                                }
                                            };
                                        })()));

                    this._lastShaderStateId = node.shaderState._stateId;
                }
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * shaderParams
         *--------------------------------------------------------------------------------------------------------*/

        if (node.shaderParamsState.paramsStack) {

            if (this._lastShaderParamsStateId != node.shaderParamsState._stateId) {

                this.createCall(
                        this._callFuncs["shaderParams"]
                                || (this._callFuncs["shaderParams"] =
                                    (function() {

                                        var program = self._program;

                                        var paramsStack = node.shaderParamsState.paramsStack;

                                        return function() {
                                            var params;
                                            var name;
                                            for (var i = 0, len = paramsStack.length; i < len; i++) {
                                                params = paramsStack[i];
                                                for (name in params) {
                                                    if (params.hasOwnProperty(name)) {
                                                        program.setUniform(name, params[name]);  // TODO: cache locations
                                                    }
                                                }
                                            }
                                        };
                                    })()));

                this._lastShaderParamsStateId = node.shaderParamsState._stateId;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * frameBuf - maybe unbind old and maybe bind new
         *--------------------------------------------------------------------------------------------------------*/

        if ((!this._lastFrameBuf) || this._lastFramebufStateId != node.frameBufState._stateId) {

            this.createCall(
                    this._callFuncs["frameBuf"]
                            || (this._callFuncs["frameBuf"] =
                                (function() {

                                    var context = self._context;

                                    var callCtx = self._callCtx;

                                    var frameBuf = node.frameBufState.frameBuf;

                                    return function() {
                                        if (callCtx.lastFrameBuf) {
                                            context.finish(); // Force frameBuf to complete
                                            callCtx.lastFrameBuf.unbind();
                                        }
                                        if (frameBuf) {
                                            frameBuf.bind();
                                        }
                                        callCtx.lastFrameBuf = frameBuf;  // Must flush on cleanup
                                    };
                                })()));

            this._lastFramebufStateId = node.frameBufState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * texture
         *--------------------------------------------------------------------------------------------------------*/

        if (!this._picking) {

            if (node.texState._stateId != this._lastTexStateId) {

                var core = node.texState.core;
                if (core) {

                    this.createCall(
                            this._callFuncs["texture"]
                                    || (this._callFuncs["texture"] =
                                        (function() {

                                            var program = self._program;

                                            var numLayers = core.layers.length;
                                            var layers = core.layers;

                                            var layerVars = [];

                                            for (var j = 0; j < numLayers; j++) {
                                                layerVars.push({
                                                    texSamplerName : "SCENEJS_uSampler" + j,
                                                    texMatrixName : "SCENEJS_uLayer" + j + "Matrix",
                                                    texBlendFactorName : "SCENEJS_uLayer" + j + "BlendFactor"
                                                });
                                            }

                                            return function() {
                                                var layer, vars;
                                                for (var j = 0, len = numLayers; j < len; j++) {
                                                    layer = layers[j];
                                                    vars = layerVars[j];
                                                    if (layer.texture) {    // Lazy-loads
                                                        program.bindTexture(vars.texSamplerName, layer.texture, j);
                                                        if (layer.matrixAsArray) { // Must bind matrix in any case
                                                            program.setUniform(vars.texMatrixName, layer.matrixAsArray);
                                                        }
                                                        program.setUniform(vars.texBlendFactorName, layer.blendFactor);
                                                    }
                                                }
                                            };
                                        })()));
                }
            }

            this._lastTexStateId = node.texState._stateId;
        }


        /*----------------------------------------------------------------------------------------------------------
         * geometry or morphGeometry
         *
         * 1. Disable VBOs
         * 2. If new morphGeometry then bind target VBOs and remember which arrays we bound
         * 3. If new geometry then bind VBOs for whatever is not already bound
         *--------------------------------------------------------------------------------------------------------*/

        if ((nodeGeoState._stateId != this._lastGeoStateId)  // New geometry
                || (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId)) {   // New morphGeometry

            /* Disable all vertex arrays for draw and pick
             */
            this.createCall(
                    this._callFuncs["unbindVBOs"]
                            || (this._callFuncs["unbindVBOs"] =
                                (function() {

                                    var context = self._context;

                                    return function() {
                                        for (var k = 0; k < 8; k++) {
                                            context.disableVertexAttribArray(k);
                                        }
                                    };
                                })()));

            var morphVertexBufBound = false;
            var morphNormalBufBound = false;
            var morphUVBufBound = false;
            var morphUV2BufBound = false;


            if (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId) {

                /* Bind morph VBOs for draw and pick
                 */
                this.createCall(
                        this._callFuncs["morph"]
                                || (this._callFuncs["morph"] =
                                    (function() {

                                        var program = self._program;
                                        var context = self._context;

                                        var vertexAttr = program.getAttribute("SCENEJS_aVertex");
                                        var morphVertexAttr = program.getAttribute("SCENEJS_aMorphVertex");

                                        var normalAttr = program.getAttribute("SCENEJS_aNormal");
                                        var morphNormalAttr = program.getAttribute("SCENEJS_aMorphNormal");

                                        var morphUVAttr = program.getAttribute("SCENEJS_aMorphUVCoord");
                                        var uMorphFactor = program.getUniformLocation("SCENEJS_uMorphFactor");

                                        var morph = node.morphState.morph;

                                        return function() {

                                            var target1 = morph.targets[morph.key1]; // Keys will update
                                            var target2 = morph.targets[morph.key2];

                                            if (vertexAttr) {
                                                vertexAttr.bindFloatArrayBuffer(target1.vertexBuf);
                                                morphVertexAttr.bindFloatArrayBuffer(target2.vertexBuf);
                                                morphVertexBufBound = true;
                                            }

                                            if (morphNormalAttr) {
                                                normalAttr.bindFloatArrayBuffer(target1.normalBuf);
                                                morphNormalAttr.bindFloatArrayBuffer(target2.normalBuf);
                                                morphNormalBufBound = true;

                                            } else if (normalAttr && target1.normalBuf) {
                                                normalAttr.bindFloatArrayBuffer(target1.normalBuf);
                                                morphNormalBufBound = true;
                                            }

                                            if (morphUVAttr && target1.uvBuf) {
                                                program.bindFloatArrayBuffer(target1.uvBuf);
                                                program.bindFloatArrayBuffer(target2.uvBuf);
                                                morphUVBufBound = true;
                                            }
                                            if (uMorphFactor) {
                                                context.uniform1f(uMorphFactor, morph.factor); // Bind LERP factor
                                            }
                                        };
                                    })()));

                this._lastMorphStateId = node.morphState._stateId;
            }

            /* Bind any unbound VBOs for draw and pick
             */
            this.createCall(
                    this._callFuncs["geo"]
                            || (this._callFuncs["geo"] =
                                (function() {

                                    var program = self._program;

                                    var geo = nodeGeoState.geo;

                                    var vertexBuf = geo.vertexBuf;
                                    var normalBuf = geo.normalBuf;
                                    var colorBuf = geo.colorBuf;

                                    var vertexAttr = (!morphVertexBufBound && vertexBuf) ? program.getAttribute("SCENEJS_aVertex") : undefined;
                                    var normalAttr = (!morphNormalBufBound && normalBuf) ? program.getAttribute("SCENEJS_aNormal") : undefined;
                                    var colorAttr = (colorBuf) ? program.getAttribute("SCENEJS_aVertexColor") : undefined;

                                    return function() {
                                        if (vertexAttr) {
                                            vertexAttr.bindFloatArrayBuffer(vertexBuf);
                                        }
                                        if (normalAttr) {
                                            normalAttr.bindFloatArrayBuffer(normalBuf);
                                        }
                                        if (colorAttr) {
                                            colorAttr.bindFloatArrayBuffer(colorBuf);
                                        }
                                    };
                                })()));


            if (!this._picking) {

                if (node.texState && node.texState.core && node.texState.core.layers.length > 0) {

                    /* Bind UV buffers for draw
                     * TODO: Texturing for pick as well; need to pick through transparent regions of alpha maps
                     */
                    this.createCall(
                            this._callFuncs["uvs"]
                                    || (this._callFuncs["uvs"] =
                                        (function() {

                                            var program = self._program;

                                            var geo = nodeGeoState.geo;

                                            var uvBuf = geo.uvBuf;
                                            var uvBuf2 = geo.uvBuf2;

                                            var uvCoordAttr = (uvBuf) ? program.getAttribute("SCENEJS_aUVCoord") : undefined;
                                            var uvCoord2Attr = (uvBuf) ? program.getAttribute("SCENEJS_aUVCoord2") : undefined;

                                            return function() {
                                                if (uvCoordAttr) {
                                                    uvCoordAttr.bindFloatArrayBuffer(uvBuf);
                                                }
                                                if (uvCoord2Attr) {
                                                    uvCoord2Attr.bindFloatArrayBuffer(uvBuf2);
                                                }
                                            };
                                        })()));
                }
            }

            /* Bind IBO for draw and pick
             */
            this.createCall(
                    this._callFuncs["ibo"]
                            || (this._callFuncs["ibo"] =
                                (function() {

                                    var indexBuf = nodeGeoState.geo.indexBuf;
                                    return function() {
                                        indexBuf.bind();
                                    };
                                })()));

            this.stateSortProfile.numGeometries++;
            this._lastGeoStateId = nodeGeoState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * renderer
         *--------------------------------------------------------------------------------------------------------*/


        if (!this._lastRendererState || node.rendererState._stateId != this._lastRendererState._stateId) {

            /* Switch properties
             */
            this.createCall(
                    this._callFuncs["bindProps"]
                            || (this._callFuncs["bindProps"] =
                                (function() {

                                    var context = self._context;

                                    var callCtx = self._callCtx;

                                    var rendererState = node.rendererState;

                                    return function() {
                                        if (callCtx.lastRendererProps) {
                                            callCtx.lastRendererProps.restoreProps(context);
                                        }
                                        if (rendererState.props) {
                                            rendererState.props.setProps(context);
                                        }
                                        callCtx.lastRendererProps = rendererState.props;
                                    };
                                })()));

            /* Set ambient color
             */
            this.createCall(
                    this._callFuncs["ambient"]
                            || (this._callFuncs["ambient"] =
                                (function() {

                                    var context = self._context;
                                    var program = self._program;

                                    var rendererState = node.rendererState;
                                    var defaultColor = [0, 0, 0];

                                    var uColorLocation = program.getUniformLocation("SCENEJS_uAmbient");

                                    return function() {
                                        if (uColorLocation) {
                                            var props = rendererState.props;
                                            if (props && props.clearColor) {
                                                var clearColor = props.clearColor;
                                                context.uniform3fv(uColorLocation, [clearColor.r, clearColor.g, clearColor.b]);
                                            } else {
                                                context.uniform3fv(uColorLocation, defaultColor);
                                            }
                                        }
                                    };
                                })()));

            this._lastRendererState = node.rendererState;
        }

        /*----------------------------------------------------------------------------------------------------------
         * lookAt
         *--------------------------------------------------------------------------------------------------------*/

        if (node.viewXFormState._stateId != this._lastViewXFormStateId) {

            this.createCall(
                    this._callFuncs["lookAt"]
                            || (this._callFuncs["lookAt"] =
                                (function() {

                                    var program = self._program;
                                    var context = self._context;

                                    var viewXFormState = node.viewXFormState;

                                    var matLocation = program.getUniformLocation("SCENEJS_uVMatrix");
                                    var normalMatLocation = program.getUniformLocation("SCENEJS_uVNMatrix");
                                    var eyeLocation = program.getUniformLocation("SCENEJS_uEye");

                                    return function() {

                                        var mat = viewXFormState.mat;
                                        var normalMat = viewXFormState.normalMat;
                                        var lookAt = viewXFormState.lookAt;

                                        if (matLocation) {
                                            context.uniformMatrix4fv(matLocation, context.FALSE, mat);
                                        }
                                        if (normalMatLocation) {
                                            context.uniformMatrix4fv(normalMatLocation, context.FALSE, normalMat);
                                        }
                                        if (eyeLocation) {
                                            context.uniform3fv(eyeLocation, lookAt.eye);
                                        }
                                    };
                                })()));

            this._lastViewXFormStateId = node.viewXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * Model transform
         *--------------------------------------------------------------------------------------------------------*/

        if (node.modelXFormState._stateId != this._lastModelXFormStateId) {

            this.createCall(
                    this._callFuncs["modelXF"]
                            || (this._callFuncs["modelXF"] =
                                (function() {

                                    var program = self._program;
                                    var context = self._context;

                                    var modelXFormState = node.modelXFormState;

                                    var matLocation = program.getUniformLocation("SCENEJS_uMMatrix");
                                    var normalMatLocation = program.getUniformLocation("SCENEJS_uMNMatrix");

                                    return function() {
                                        var mat = modelXFormState.mat;
                                        var normalMat = modelXFormState.normalMat;
                                        if (matLocation) {
                                            context.uniformMatrix4fv(matLocation, context.FALSE, mat);
                                        }
                                        if (normalMatLocation) {
                                            context.uniformMatrix4fv(normalMatLocation, context.FALSE, normalMat);
                                        }
                                    };
                                })()));

            this._lastModelXFormStateId = node.modelXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * projection matrix
         *--------------------------------------------------------------------------------------------------------*/

        if (node.projXFormState._stateId != this._lastProjXFormStateId) {

            this.createCall(
                    this._callFuncs["camera"]
                            || (this._callFuncs["camera"] =
                                (function() {

                                    var program = self._program;
                                    var context = self._context;

                                    var callCtx = self._callCtx;

                                    var projXFormState = node.projXFormState;

                                    var matLocation = program.getUniformLocation("SCENEJS_uPMatrix");

                                    var zNearLocation = program.getUniformLocation("SCENEJS_uZNear");
                                    var zFarLocation = program.getUniformLocation("SCENEJS_uZFar");

                                    return function() {
                                        var mat = projXFormState.mat;
                                        var optics = projXFormState.optics;

                                        if (matLocation) {
                                            context.uniformMatrix4fv(matLocation, context.FALSE, mat);
                                        }

                                        if (callCtx.rayPicking) { // Z-pick pass: feed near and far clip planes into shader
                                            if (zFarLocation) {
                                                context.uniform1f(zNearLocation, optics.near);
                                            }
                                            if (zFarLocation) {
                                                context.uniform1f(zFarLocation, optics.far);
                                            }
                                        }
                                    };
                                })()));

            this._lastProjXFormStateId = node.projXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * clip
         *--------------------------------------------------------------------------------------------------------*/

        if (node.clipState &&
            (node.clipState._stateId != this._lastClipStateId ||
             nodeFlagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable clip

            /* Load clip planes for draw and pick
             */
            var clips = node.clipState.clips;
            for (var k = 0, len = clips.length; k < len; k++) {
                this.createCall(
                        (function() {
                            var context = self._context;
                            var program = self._program;

                            var clip = clips[k];
                            var flags = nodeFlagsState.flags;

                            var uClipModeLocation = program.getUniformLocation("SCENEJS_uClipMode" + k);
                            var uClipNormalAndDist = program.getUniformLocation("SCENEJS_uClipNormalAndDist" + k);

                            return function() {
                                if (uClipModeLocation && uClipNormalAndDist) {
                                    if (flags.clipping === false) { // Flags disable/enable clipping
                                        context.uniform1f(uClipModeLocation, 0);
                                    } else if (clip.mode == "inside") {
                                        context.uniform1f(uClipModeLocation, 2);
                                    } else if (clip.mode == "outside") {
                                        context.uniform1f(uClipModeLocation, 1);
                                    } else { // disabled
                                        context.uniform1f(uClipModeLocation, 0);
                                    }
                                    context.uniform4fv(uClipNormalAndDist, clip.normalAndDist);
                                }
                            };
                        } )());
            }

            this._lastClipStateId = node.clipState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * colortrans
         *--------------------------------------------------------------------------------------------------------*/

        if (!this._picking && !this._rayPicking) {

            if (node.colortransState && node.colortransState.core
                    && (node.colortransState._stateId != this._lastColortransStateId ||
                        nodeFlagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable colortrans

                this.createCall(
                        this._callFuncs["colortrans"]
                                || (this._callFuncs["colortrans"] =
                                    (function() {

                                        var program = self._program;

                                        var flags = nodeFlagsState.flags;
                                        var core = node.colortransState.core;

                                        return function() {
                                            if (flags.colortrans === false) {
                                                program.setUniform("SCENEJS_uColorTransMode", 0);  // Disable
                                            } else {
                                                var scale = core.scale;
                                                var add = core.add;
                                                program.setUniform("SCENEJS_uColorTransMode", 1);  // Enable
                                                program.setUniform("SCENEJS_uColorTransScale", [scale.r, scale.g, scale.b, scale.a]);  // Scale
                                                program.setUniform("SCENEJS_uColorTransAdd", [add.r, add.g, add.b, add.a]);  // Scale
                                                program.setUniform("SCENEJS_uColorTransSaturation", core.saturation);  // Saturation
                                            }
                                        };
                                    })()));

                this._lastColortransStateId = node.colortransState._stateId;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * material
         *--------------------------------------------------------------------------------------------------------*/

        if (!this._picking) {

            if (node.materialState && node.materialState != this._lastMaterialStateId) {

                this.createCall(
                        this._callFuncs["material"]
                                || (this._callFuncs["material"] =
                                    (function() {

                                        var program = self._program;
                                        var context = self._context;

                                        var uMaterialBaseColorLocation = program.getUniformLocation("SCENEJS_uMaterialBaseColor");
                                        var uMaterialSpecularColorLocation = program.getUniformLocation("SCENEJS_uMaterialSpecularColor");
                                        var uMaterialSpecularLocation = program.getUniformLocation("SCENEJS_uMaterialSpecular");
                                        var uMaterialShineLocation = program.getUniformLocation("SCENEJS_uMaterialShine");
                                        var uMaterialEmitLocation = program.getUniformLocation("SCENEJS_uMaterialEmit");
                                        var uMaterialAlphaLocation = program.getUniformLocation("SCENEJS_uMaterialAlpha");

                                        return function() {
                                            var material = node.materialState.material;
                                            if (uMaterialBaseColorLocation) {
                                                context.uniform3fv(uMaterialBaseColorLocation, material.baseColor);
                                            }
                                            if (uMaterialSpecularColorLocation) {
                                                context.uniform3fv(uMaterialSpecularColorLocation, material.specularColor);
                                            }
                                            if (uMaterialSpecularLocation) {
                                                context.uniform1f(uMaterialSpecularLocation, material.specular);
                                            }
                                            if (uMaterialShineLocation) {
                                                context.uniform1f(uMaterialShineLocation, material.shine);
                                            }
                                            if (uMaterialEmitLocation) {
                                                context.uniform1f(uMaterialEmitLocation, material.emit);
                                            }
                                            if (uMaterialAlphaLocation) {
                                                context.uniform1f(uMaterialAlphaLocation, material.alpha);
                                            }
                                        };
                                    })()));

                this._lastMaterialStateId = node.materialState._stateId;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * lights
         *--------------------------------------------------------------------------------------------------------*/

        if (!this._picking) {
            if (node.lightState && node.lightState._stateId != this._lastLightStateId) {

                /* Load lights for draw
                 */
                var lights = node.lightState.lights;
                for (var k = 0, len = lights.length; k < len; k++) {

                    this.createCall(
                            this._callFuncs["light" + k]
                                    || (this._callFuncs["light" + k] =
                                        (function() {

                                            var program = self._program;
                                            var context = self._context;

                                            var uLightColorLocation = program.getUniformLocation("SCENEJS_uLightColor" + k);
                                            var uLightDirLocation = program.getUniformLocation("SCENEJS_uLightDir" + k);
                                            var uLightPosLocation = program.getUniformLocation("SCENEJS_uLightPos" + k);
                                            var uLightCutOffLocation = program.getUniformLocation("SCENEJS_uLightCutOff" + k);
                                            var uLightSpotExpLocation = program.getUniformLocation("SCENEJS_uLightSpotExpOff" + k);
                                            var uLightAttenuationLocation = program.getUniformLocation("SCENEJS_uLightAttenuation" + k);

                                            var light = lights[k];

                                            switch (light.mode) {

                                                case "ambient":
                                                    return function() {
                                                        if (uLightColorLocation) {
                                                            context.uniform3fv(uLightColorLocation, light.color);
                                                        }
                                                    };

                                                case "dir":
                                                    return function() {
                                                        if (uLightColorLocation) {
                                                            context.uniform3fv(uLightColorLocation, light.color);
                                                        }
                                                        if (uLightDirLocation) {
                                                            context.uniform3fv(uLightDirLocation, light.worldDir);
                                                        }
                                                    };

                                                case "point":
                                                    return function() {
                                                        if (uLightColorLocation) {
                                                            context.uniform3fv(uLightColorLocation, light.color);
                                                        }
                                                        if (uLightPosLocation) {
                                                            context.uniform3fv(uLightPosLocation, light.worldPos);
                                                        }
                                                    };

                                                case "spot":
                                                    return function() {
                                                        //                                        if (uLightColorLocation) {
                                                        //                                            context.uniform3fv(uLightColorLocation, light.color);
                                                        //                                        }
                                                        //                                        if (uLightPosLocation) {
                                                        //                                            context.uniform3fv(uLightPosLocation, light.worldPos);
                                                        //                                        }
                                                        //                                        if (uLightDirLocation) {
                                                        //                                            context.uniform3fv(uLightDirLocation, light.worldDir);
                                                        //                                        }
                                                        //                                        if (uLightCutOffLocation) {
                                                        //
                                                        //                                        }
                                                        //                                        if (uLightSpotPosExp) {
                                                        //
                                                        //                                        }
                                                        //                                        context.uniform3fv(uLightAttenuationLocation,
                                                        //                                                [
                                                        //                                                    light.constantAttenuation,
                                                        //                                                    light.linearAttenuation,
                                                        //                                                    light.quadraticAttenuation
                                                        //                                                ]);
                                                    };
                                            }
                                        })()));
                }

                this._lastLightStateId = node.lightState._stateId;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * name
         *--------------------------------------------------------------------------------------------------------*/

        if (this._picking) {
            if (! this._lastNameState || node.nameState._stateId != this._lastNameState._stateId) {

                this.createCall(
                        this._callFuncs["name"]
                                || (this._callFuncs["name"] =
                                    (function() {

                                        var program = self._program;
                                        var context = self._context;

                                        var callCtx = self._callCtx;

                                        var nameState = node.nameState;

                                        var uPickColorLocation = program.getUniformLocation("SCENEJS_uPickColor");

                                        return function() {

                                            if (callCtx.picking) { // Colour-pick pass - feed name's colour into pick shader

                                                if (nameState.name) {

                                                    self.pickNameStates[self._pickIndex++] = nameState;

                                                    var b = self._pickIndex >> 16 & 0xFF;
                                                    var g = self._pickIndex >> 8 & 0xFF;
                                                    var r = self._pickIndex & 0xFF;

                                                    context.uniform3fv(uPickColorLocation, [r / 255, g / 255, b / 255]);
                                                }
                                            }
                                        };
                                    })()));

                this._lastNameState = node.nameState;
            }
        }

        /*--------------------------------------------------------------------------------------------------------------
         * Render listeners
         *------------------------------------------------------------------------------------------------------------*/

        if (!this._picking) {    // TODO: do we ever want matrices during a pick pass?

            if (! this._lastRenderListenersState || node.renderListenersState._stateId != this._lastRenderListenersState._stateId) {
                if (node.renderListenersState) {

                    this.createCall(
                            this._callFuncs["rendered"]
                                    || (this._callFuncs["rendered"] =
                                        (function() {

                                            var listeners = node.renderListenersState.listeners;
                                            var queryFacade = self._queryFacade;

                                            return function() {
                                                for (var i = listeners.length - 1; i >= 0; i--) {
                                                    listeners[i](queryFacade);  // Call listener with query facade object as scope
                                                }
                                            };
                                        })()));
                }
                this._lastRenderListenersState = node.renderListenersState;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * flags
         *
         * Set these last because we change certain other states when we determine that flags will change
         *--------------------------------------------------------------------------------------------------------*/

        if (! this._lastFlagsState || nodeFlagsState._stateId != this._lastFlagsState._stateId) {

            this.createCall(
                    this._callFuncs["flags"]
                            || (this._callFuncs["flags"] =
                                (function() {

                                    var context = self._context;
                                    var program = self._program;

                                    var callCtx = self._callCtx;

                                    var uBackfaceTexturingLocation = program.getUniformLocation("SCENEJS_uBackfaceTexturing");
                                    var uBackfaceLightingLocation = program.getUniformLocation("SCENEJS_uBackfaceLighting");
                                    var uSpecularLightingLocation = program.getUniformLocation("SCENEJS_uSpecularLighting");

                                    var flagsState = nodeFlagsState;

                                    return function() {

                                        var newFlags = flagsState.flags;
                                        var oldFlagsState = callCtx.lastFlagsState;
                                        var oldFlags = oldFlagsState ? oldFlagsState.flags : null;

                                        //            var clear = newFlags.clear;
                                        //            if (!oldFlags || (clear && (clear.depth != oldFlags.depth || clear.stencil != oldFlags.stencil))) {
                                        //                var clear = newFlags.clear || {};
                                        //                var mask = 0;
                                        //                if (clear.depth) {
                                        //                    mask |= gl.DEPTH_BUFFER_BIT;
                                        //                }
                                        //                if (clear.stencil) {
                                        //                    mask |= gl.STENCIL_BUFFER_BIT;
                                        //                }
                                        //                if (mask != 0) { alert("clear");
                                        //                    gl.clear(mask);
                                        //                }
                                        //            }


                                        if (!oldFlags || newFlags.backfaces != oldFlags.backfaces) {
                                            if (newFlags.backfaces) {
                                                context.disable(context.CULL_FACE);
                                            } else {
                                                context.enable(context.CULL_FACE);
                                            }
                                        }

                                        if (!oldFlags || newFlags.frontface != oldFlags.frontface) {
                                            if (newFlags.frontface == "cw") {
                                                context.frontFace(context.CW);
                                            } else {
                                                context.frontFace(context.CCW);
                                            }
                                        }

                                        if (!oldFlags || newFlags.blendFunc != oldFlags.blendFunc) {
                                            if (newFlags.blendFunc) {
                                                context.blendFunc(glEnum(context, newFlags.blendFunc.sfactor || "one"), glEnum(context, newFlags.blendFunc.dfactor || "zero"));
                                            } else {
                                                context.blendFunc(context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA); // Not redundant, because of inequality test above
                                            }
                                        }

                                        context.uniform1i(uBackfaceTexturingLocation, newFlags.backfaceTexturing == undefined ? true : !!newFlags.backfaceTexturing);
                                        context.uniform1i(uBackfaceLightingLocation, newFlags.backfaceLighting == undefined ? true : !!newFlags.backfaceLighting);
                                        context.uniform1i(uSpecularLightingLocation, newFlags.specular == undefined ? true : !!newFlags.specular);

                                        //            var mask = newFlags.colorMask;
                                        //
                                        //            if (!oldFlags || (mask && (mask.r != oldFlags.r || mask.g != oldFlags.g || mask.b != oldFlags.b || mask.a != oldFlags.a))) {
                                        //
                                        //                if (mask) {
                                        //
                                        //                    context.colorMask(mask.r, mask.g, mask.b, mask.a);
                                        //
                                        //                } else {
                                        //                    context.colorMask(true, true, true, true);
                                        //                }
                                        //            }

                                    };
                                })()));

            this._lastFlagsState = nodeFlagsState;
        }

        /*----------------------------------------------------------------------------------------------------------
         * Draw
         *--------------------------------------------------------------------------------------------------------*/

        this.createCall(
                this._callFuncs["draw"]
                        || (this._callFuncs["draw"] =
                            (function() {

                                var context = self._context;

                                var primitive = nodeGeoState.geo.primitive;
                                var numItems = nodeGeoState.geo.indexBuf.numItems;

                                return function() {
                                    context.drawElements(primitive, numItems, context.UNSIGNED_SHORT, 0);
                                };
                            })()));
    };


    var glEnum = function(context, name) {
        if (!name) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Null SceneJS.renderer node config: \"" + name + "\"");
        }
        var result = SceneJS_webgl_enumMap[name];
        if (!result) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\"");
        }
        var value = context[result];
        if (!value) {
            throw SceneJS_errorModule.fatalError(
                    SceneJS.errors.WEBGL_UNSUPPORTED_NODE_CONFIG,
                    "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
        }
        return value;
    };

    /**
     * Called after all nodes rendered for the current frame
     */
    this.cleanup = function() {

        this._context.flush();

        var callCtx = this._callCtx;

        this._lastRendererState = null;                             // Forget last "renderer" state
        if (callCtx.lastRendererProps) {                           // Forget last call-time renderer properties
            callCtx.lastRendererProps.restoreProps(this._context);
        }

        this._lastFlagsState = null;
        this._lastFrameBufState = null;
        this._lastNameState = null;

        if (callCtx.lastFrameBuf) {
            callCtx.lastFrameBuf.unbind();
            callCtx.lastFrameBuf = null;
        }

        this._lastProgramId = -1;

        this._program = null;

        //        if (this._program) {
        //            this._program.unbind();
        //
        //        }
        //        this._context.colorMask(true, true, true, true);
    };
};
