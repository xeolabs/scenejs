/**
 * State node renderer
 */
var SceneJS_NodeRenderer = function(cfg) {

    this._canvas = cfg.canvas;
    this._context = cfg.context;

    this._pickListeners = new Array(100000);

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
                this._mem.camPos = SceneJS._math_normalizeVec3(this._mem.pc, [0,0,0]);
            }
            return { x: this._mem.camPos[0], y: this._mem.camPos[1], z: this._mem.camPos[2] };
        },

        getProjPos : function(offset) {
            if (!this._mem.pc || offset) {
                this.getViewPos(offset);
                this._mem.pc = SceneJS._math_transformPoint3(this._node.projXFormState.mat, this._mem.vc);
            }
            return { x: this._mem.pc[0], y: this._mem.pc[1], z: this._mem.pc[2],  w: this._mem.pc[3] };
        },

        getViewPos : function(offset) {
            if (!this._mem.vc || offset) {
                this.getWorldPos(offset);
                this._mem.vc = SceneJS._math_transformPoint3(this._node.viewXFormState.mat, this._mem.wc);
            }
            return { x: this._mem.vc[0], y: this._mem.vc[1], z: this._mem.vc[2],  w: this._mem.vc[3] };
        },

        getWorldPos : function(offset) {
            if (!this._mem.wc || offset) {
                this._mem.wc = SceneJS._math_transformPoint3(this._node.modelXFormState.mat, offset || [0,0,0]);
            }
            return { x: this._mem.wc[0], y: this._mem.wc[1], z: this._mem.wc[2],  w: this._mem.wc[3] };
        }
    };


    /**
     * Called before we render all state nodes for a frame.
     * Forgets any program that was used for the last node rendered, which causes it
     * to forget all states for that node.
     */
    this.init = function(picking) {
        this._picking = picking;
        this._program = null;
        this._lastRendererState = null;
        this._lastImageBufState = null;
        this._pickIndex = 0;
    };

    /**
     * Renders a state node. Makes state changes only where the node's states have different IDs
     * than the states of the last node. If the node has a different program than the last node
     * rendered, Renderer forgets all states for the previous node and makes a fresh set of transitions
     * into all states for this node.
     */
    this.renderNode = function(node) {

        /* Prepare query facade
         */
        this._queryFacade._setNode(node);

        /* Only pick nodes that are enabled for picking
         */
        if (this._picking && node.flagsState.flags.picking === false) {
            return;
        }

        /* Bind program if none bound, or if node uses different program
         * to that currently bound.
         *
         * Also flag all buffers as needing to be bound.
         */
        if ((!this._program) || (node.program.id != this._lastProgramId)) {
            //                if (this._program) {
            //                    this._program.unbind();
            //                }

            this._program = this._picking ? node.program.pick : node.program.render;
            this._program.bind();

            this._lastGeoStateId = -1;
            this._lastFlagsStateId = -1;
            this._lastColortransStateId = -1;
            this._lastLightStateId = -1;
            this._lastClipStateId = -1;
            this._lastDeformStateId = -1;
            this._lastMorphStateId = -1;
            this._lastTexStateId = -1;
            this._lastMaterialStateId = -1;
            this._lastViewXFormStateId = -1;
            this._lastModelXFormStateId = -1;
            this._lastProjXFormStateId = -1;
            this._lastPickStateId = -1;
            this._lastImageBufStateId = -1;
            this._lastFogStateId = -1;
            this._lastPickListenersStateId = -1;
            this._lastRenderListenersStateId = -1;

            this._lastProgramId = node.program.id;
        }

        var program = this._program;
        var gl = this._context;

        /*----------------------------------------------------------------------------------------------------------
         * flags
         *--------------------------------------------------------------------------------------------------------*/

        if (! this._lastFlagsState || node.flagsState._stateId != this._lastFlagsState._stateId) {

            /*
             */
            var newFlags = node.flagsState.flags;
            var oldFlags = this._lastFlagsState ? this._lastFlagsState.flags : null;

            if (!oldFlags || newFlags.backfaces != oldFlags.backfaces) {
                if (newFlags.backfaces) {
                    gl.disable(gl.CULL_FACE);
                } else {
                    gl.enable(gl.CULL_FACE);
                }
            }

            if (!oldFlags || newFlags.frontface != oldFlags.frontface) {
                if (newFlags.frontface == "cw") {
                    gl.frontFace(gl.CW);
                } else {
                    gl.frontFace(gl.CCW);
                }
            }

            if (!oldFlags || newFlags.blendFunc != oldFlags.blendFunc) {
                if (newFlags.blendFunc) {
                    gl.blendFunc(glEnum(gl, newFlags.blendFunc.sfactor || "one"), glEnum(gl, newFlags.blendFunc.dfactor || "zero"));
                } else {
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Not redundant, because of inequality test above
                }
            }

            this._lastFlagsState = node.flagsState;
        }

        /*----------------------------------------------------------------------------------------------------------
         * imagebuf
         *--------------------------------------------------------------------------------------------------------*/

        if (! this._lastImageBufState || node.imageBufState._stateId != this._lastImageBufState._stateId) {
            if (this._lastImageBufState && this._lastImageBufState.imageBuf) {
                gl.finish();
                this._lastImageBufState.imageBuf.unbind();
            }
            if (node.imageBufState.imageBuf) {
                node.imageBufState.imageBuf.bind();
            }
            this._lastImageBufState = node.imageBufState;
        }

        /*----------------------------------------------------------------------------------------------------------
         * geometry or morphGeometry
         *
         * 1. Disable VBOs
         * 2. If new morphGeometry then bind target VBOs and remember which arrays we bound
         * 3. If new geometry then bind VBOs for whatever is not already bound
         *--------------------------------------------------------------------------------------------------------*/

        if ((node.geoState._stateId != this._lastGeoStateId)  // New geometry
                || (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId)) {   // New morphGeometry

            /* Disable all vertex arrays
             */
            for (var k = 0; k < 8; k++) {
                gl.disableVertexAttribArray(k);
            }

            var vertexBufBound = false;
            var normalBufBound = false;
            var uvBufBound = false;
            var uvBuf2Bound = false;

            var morph;
            var target1, target2;

            var geo = node.geoState.geo;

            if (node.morphState.morph && node.morphState._stateId != this._lastMorphStateId) {

                /* Bind morph VBOs
                 */

                morph = node.morphState.morph;

                target1 = morph.target1;
                target2 = morph.target2;

                if (target1.vertexBuf) {
                    program.bindFloatArrayBuffer("aVertex", target1.vertexBuf);
                    program.bindFloatArrayBuffer("aMorphVertex", target2.vertexBuf);
                    vertexBufBound = true;
                }

                if (target1.normalBuf) {
                    program.bindFloatArrayBuffer("aNormal", target1.normalBuf);
                    program.bindFloatArrayBuffer("aMorphNormal", target2.normalBuf);
                    normalBufBound = true;
                }

                if (target1.uvBuf) {
                    program.bindFloatArrayBuffer("aUVCoord", target1.uvBuf);
                    program.bindFloatArrayBuffer("aMorphUVCoord", target2.uvBuf);
                    uvBufBound = true;
                }

                if (target1.uvBuf2) {
                    program.bindFloatArrayBuffer("aUVCoord2", target1.uvBuf);
                    program.bindFloatArrayBuffer("aMorphUVCoord2", target2.uvBuf);
                    uvBuf2Bound = true;
                }

                program.setUniform("uMorphFactor", morph.factor);
                this._lastMorphStateId = node.morphState._stateId;
            }

            /* Bind geometry VBOs - do that in any case, since we'll always have a geometry
             * within a morphGeometry
             */

            this._lastGeoStateId = node.geoState._stateId;

            if (!vertexBufBound && geo.vertexBuf) {
                program.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
            }

            if (!normalBufBound && geo.normalBuf) {
                program.bindFloatArrayBuffer("aNormal", geo.normalBuf);
            }
            // TODO
            if (node.texState && node.texState.layers.length > 0) {
                if (geo.uvBuf) {
                    program.bindFloatArrayBuffer("aUVCoord", geo.uvBuf);
                }
                if (geo.uvBuf2) {
                    program.bindFloatArrayBuffer("aUVCoord2", geo.uvBuf2);
                }
            }

            if (geo.colorBuf) {
                program.bindFloatArrayBuffer("aVertexColor", geo.colorBuf);
            }

            geo.indexBuf.bind();
        }

        /* Set GL props
         */
        if (node.rendererState) {
            if (!this._lastRendererState || node.rendererState._stateId != this._lastRendererState._stateId) {
                if (this._lastRendererState && this._lastRendererState.props) {
                    this._lastRendererState.props.restoreProps(gl);
                }
                if (node.rendererState.props) {
                    node.rendererState.props.setProps(gl);
                }
                this._lastRendererState = node.rendererState;
            }

            /* Bind renderer properties
             */
            var clearColor;
            if (node.rendererState.props) {
                clearColor = node.rendererState.props.props.clearColor;
            }
            program.setUniform("uAmbient", clearColor ? [clearColor.r, clearColor.g, clearColor.b] : [0, 0, 0]);
        }

        /*----------------------------------------------------------------------------------------------------------
         * texture
         *--------------------------------------------------------------------------------------------------------*/

        if (node.texState._stateId != this._lastTexStateId) {
            var layer;
            for (var j = 0, len = node.texState.layers.length; j < len; j++) {
                layer = node.texState.layers[j];
                program.bindTexture("uSampler" + j, layer.texture, j);
                if (layer.matrixAsArray) {
                    program.setUniform("uLayer" + j + "Matrix", layer.matrixAsArray);
                }
            }
            this._lastTexStateId = node.texState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * view matrix and eye position
         *--------------------------------------------------------------------------------------------------------*/

        if (node.viewXFormState._stateId != this._lastViewXFormStateId) {
            program.setUniform("uVMatrix", node.viewXFormState.mat);
            program.setUniform("uVNMatrix", node.viewXFormState.normalMat);
            program.setUniform("uEye", node.viewXFormState.lookAt.eye);
            this._lastViewXFormStateId = node.viewXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * model matrix
         *--------------------------------------------------------------------------------------------------------*/

        if (node.modelXFormState._stateId != this._lastModelXFormStateId) {
            program.setUniform("uMMatrix", node.modelXFormState.mat);
            program.setUniform("uMNMatrix", node.modelXFormState.normalMat);
            this._lastModelXFormStateId = node.modelXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * projection matrix
         *--------------------------------------------------------------------------------------------------------*/

        if (node.projXFormState._stateId != this._lastProjXFormStateId) {
            program.setUniform("uPMatrix", node.projXFormState.mat);
            this._lastProjXFormStateId = node.projXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * clip planes
         *--------------------------------------------------------------------------------------------------------*/

        if (node.clipState &&
            (node.clipState._stateId != this._lastClipStateId ||
             node.flagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable clip

            var clip;
            for (var k = 0; k < node.clipState.clips.length; k++) {
                clip = node.clipState.clips[k];

                if (node.flagsState.flags.clipping === false) { // Flags disable/enable clipping
                    program.setUniform("uClipMode" + k, 0);
                } else if (clip.mode == "inside") {
                    program.setUniform("uClipMode" + k, 2);
                } else if (clip.mode == "outside") {
                    program.setUniform("uClipMode" + k, 1);
                } else { // disabled
                    program.setUniform("uClipMode" + k, 0);
                }

                program.setUniform("uClipNormalAndDist" + k, clip.normalAndDist);
            }
            this._lastClipStateId = node.clipState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * deform
         *--------------------------------------------------------------------------------------------------------*/

        if (node.deformState && node.deformState.deform && node.deformState._stateId != this._lastDeformStateId) {
            var verts = node.deformState.deform.verts;
            var vert;
            for (var k = 0, len = verts.length; k < len; k++) {
                vert = verts[k];
                program.setUniform("uDeformVertex" + k, vert.worldPos);
                program.setUniform("uDeformWeight" + k, vert.weight);
                if (vert.mode == "linear") {
                    program.setUniform("uDeformMode" + k, 0.0);
                } else if (vert.mode == "exp") {
                    program.setUniform("uDeformMode" + k, 1.0);
                }
            }
            this._lastDeformStateId = node.deformState._stateId;
        }


        if (!this._picking) {

            /*----------------------------------------------------------------------------------------------------------
             * fog
             *--------------------------------------------------------------------------------------------------------*/

            if (node.fogState && node.fogState.fog &&
                (node.fogState._stateId != this._lastFogStateId ||
                 node.flagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable fog

                var fog = node.fogState.fog;

                if (node.flagsState.flags.fog === false || fog.mode == "disabled") {

                    // When fog is disabled, don't bother loading any of its parameters
                    // because they will be ignored by the shader

                    program.setUniform("uFogMode", 0.0);
                } else {

                    if (fog.mode == "constant") {
                        program.setUniform("uFogMode", 4.0);
                        program.setUniform("uFogColor", fog.color);
                        program.setUniform("uFogDensity", fog.density);

                    } else {

                        if (fog.mode == "linear") {
                            program.setUniform("uFogMode", 1.0);
                        } else if (fog.mode == "exp") {
                            program.setUniform("uFogMode", 2.0);
                        } else if (fog.mode == "exp2") {
                            program.setUniform("uFogMode", 3.0); // mode is "exp2"
                        }
                        program.setUniform("uFogColor", fog.color);
                        program.setUniform("uFogDensity", fog.density);
                        program.setUniform("uFogStart", fog.start);
                        program.setUniform("uFogEnd", fog.end);
                    }
                }
                this._lastFogStateId = node.fogState._stateId;
            }

            /*----------------------------------------------------------------------------------------------------------
             * colortrans
             *--------------------------------------------------------------------------------------------------------*/

            if (node.colortransState && node.colortransState.trans
                    && (node.colortransState._stateId != this._lastColortransStateId ||
                        node.flagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable colortrans

                /* Bind colortrans
                 */
                if (node.flagsState.flags.colortrans === false) {
                    program.setUniform("uColortransMode", 0);  // Disable
                } else {
                    var trans = node.colortransState.trans;
                    var scale = trans.scale;
                    var add = trans.add;
                    program.setUniform("uColortransMode", 1);  // Enable
                    program.setUniform("uColortransScale", [scale.r, scale.g, scale.b, scale.a]);  // Scale
                    program.setUniform("uColortransAdd", [add.r, add.g, add.b, add.a]);  // Scale
                    program.setUniform("uColortransSaturation", trans.saturation);  // Saturation
                    this._lastColortransStateId = node.colortransState._stateId;
                }
            }

            /*----------------------------------------------------------------------------------------------------------
             * material
             *--------------------------------------------------------------------------------------------------------*/

            if (node.materialState && node.materialState != this._lastMaterialStateId
                    || node.flagsState._stateId != this._lastFlagsStateId) { // Flags can enable/disable specularity

                /* Bind Material
                 */
                var material = node.materialState.material;
                program.setUniform("uMaterialBaseColor", material.baseColor);
                program.setUniform("uMaterialSpecularColor", material.specularColor);
                program.setUniform("uMaterialSpecular", node.flagsState.flags.specular != false ? material.specular : 0.0);
                program.setUniform("uMaterialShine", material.shine);
                program.setUniform("uMaterialEmit", material.emit);
                program.setUniform("uMaterialAlpha", material.alpha);

                this._lastMaterialStateId = node.materialState._stateId;

                /* If highlighting then override material's baseColor. We'll also force a
                 * material state change for the next node, otherwise otherwise the highlight
                 * may linger in the shader uniform if there is no material state change for the next node.
                 */
                if (node.flagsState && node.flagsState.flags.highlight) {
                    program.setUniform("uMaterialBaseColor", material.highlightBaseColor);
                    this._lastMaterialStateId = null;
                }
            }

            /*----------------------------------------------------------------------------------------------------------
             * lights
             *--------------------------------------------------------------------------------------------------------*/

            if (node.lightState && node.lightState._stateId != this._lastLightStateId) {
                var ambient;
                var light;
                for (var k = 0; k < node.lightState.lights.length; k++) {
                    light = node.lightState.lights[k];
                    program.setUniform("uLightColor" + k, light.color);
                    program.setUniform("uLightDiffuse" + k, light.diffuse);
                    if (light.mode == "dir") {
                        program.setUniform("uLightDir" + k, light.worldDir);
                    } else if (light.mode == "ambient") {
                        ambient = ambient ? [
                            ambient[0] + light.color[0],
                            ambient[1] + light.color[1],
                            ambient[2] + light.color[2]
                        ] : light.color;
                    } else {
                        if (light.mode == "point") {
                            program.setUniform("uLightPos" + k, light.worldPos);
                        }
                        if (light.mode == "spot") {
                            program.setUniform("uLightPos" + k, light.worldPos);
                            program.setUniform("uLightDir" + k, light.worldDir);
                            program.setUniform("uLightSpotCosCutOff" + k, light.spotCosCutOff);
                            program.setUniform("uLightSpotExp" + k, light.spotExponent);
                        }
                        program.setUniform("uLightAttenuation" + k,
                                [
                                    light.constantAttenuation,
                                    light.linearAttenuation,
                                    light.quadraticAttenuation
                                ]);
                    }
                }
                this._lastLightStateId = node.lightState._stateId;
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * Pick listeners
         *--------------------------------------------------------------------------------------------------------*/

        if (this._picking) {

            if (! this._lastPickListenersState || node.pickListenersState._stateId != this._lastPickListenersState._stateId) {

                if (node.pickListenersState.listeners.length > 0) {

                    this._pickListeners[this._pickIndex++] = node.pickListenersState;

                    var b = this._pickIndex >> 16 & 0xFF;
                    var g = this._pickIndex >> 8 & 0xFF;
                    var r = this._pickIndex & 0xFF;
                    g = g / 255;
                    r = r / 255;
                    b = b / 255;

                    program.setUniform("uPickColor", [r,g,b]);
                }
                this._lastPickListenersState = node.pickListenersState;
            }
        }

        if (!this._picking) {    // TODO: do we ever want matrices during a pick pass?

            /*----------------------------------------------------------------------------------------------------------
             * Render listeners
             *--------------------------------------------------------------------------------------------------------*/

            if (! this._lastRenderListenersState || node.renderListenersState._stateId != this._lastRenderListenersState._stateId) {
                if (node.renderListenersState) {
                    var listeners = node.renderListenersState.listeners;
                    for (var i = listeners.length - 1; i >= 0; i--) {
                        listeners[i](this._queryFacade);             // Call listener with query facade object as scope
                    }
                    this._lastRenderListenersState = node.renderListenersState;
                }
            }
        }

        /*----------------------------------------------------------------------------------------------------------
         * Draw the geometry;  When wireframe option is set we'll render
         * triangle primitives as wireframe
         * TODO: should we also suppress shading in the renderer? This will currently apply phong shading to the lines.
         *--------------------------------------------------------------------------------------------------------*/

        var primitive = node.geoState.geo.primitive;
        if (node.flagsState && node.flagsState.flags.wireframe) {
            if (primitive == gl.TRIANGLES ||
                primitive == gl.TRIANGLE_STRIP ||
                primitive == gl.TRIANGLE_FAN) {

                primitive = gl.LINES;
            }
        }

        gl.drawElements(
                primitive,
                node.geoState.geo.indexBuf.numItems,
                gl.UNSIGNED_SHORT,
                0);
    };

    var glEnum = function(context, name) {
        if (!name) {
            throw SceneJS._errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Null SceneJS.renderer node config: \"" + name + "\"");
        }
        var result = SceneJS._webgl_enumMap[name];
        if (!result) {
            throw SceneJS._errorModule.fatalError(
                    SceneJS.errors.ILLEGAL_NODE_CONFIG,
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\"");
        }
        var value = context[result];
        if (!value) {
            throw SceneJS._errorModule.fatalError(
                    SceneJS.errors.WEBGL_UNSUPPORTED_NODE_CONFIG,
                    "This browser's WebGL does not support renderer node config value: \"" + name + "\"");
        }
        return value;
    };


    /**
     * Called after all nodes rendered for the current frame
     */
    this.cleanup = function() {


        //            if (node._pickListenersState) {     // Post-call last listeners
        //
        //            }

        ///////////////////////////////////////////
        this._context.finish();
        ///////////////////////////////////////////


        //            if (this._lastRendererState) {
        //                this._lastRendererState.props.restoreProps(canvas.context);
        //            }
        //            if (this._program) {
        //                this._program.unbind();
        //            }

        /*----------------------------------------------------------------------------------------------------------
         * If an image buffer is active, flush and deactivate it
         *--------------------------------------------------------------------------------------------------------*/

        if (this._lastImageBufState && this._lastImageBufState.imageBuf) {
            this._lastImageBufState.imageBuf.unbind();
            this._lastImageBufState = null;
        }

        if (this._program) {
            this._program.unbind();
            this._program = null;
        }
        return this._pickListeners;
    };
}
        ;
