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

            if (node.shaderState.shader && node.shaderState.shader.vars) { // Custom shader - set any vars we have
                var vars = node.shaderState.shader.vars;
                for (var name in vars) {
                    if (vars.hasOwnProperty(name)) {
                        this._program.setUniform(name, vars[name]);
                    }
                }
            }

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
            this._lastImageBufStateId = -1;
            this._lastFogStateId = -1;
            this._lastPickListenersStateId = -1;
            this._lastRenderListenersStateId = -1;
            this._lastProgramId = node.program.id;
        }

        var program = this._program;
        var gl = this._context;


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

            var morphVertexBufBound = false;
            var morphNormalBufBound = false;
            var morphUVBufBound = false;
            var morphUV2BufBound = false;

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
                    program.bindFloatArrayBuffer("SCENEJS_aVertex", target1.vertexBuf);
                    program.bindFloatArrayBuffer("SCENEJS_aMorphVertex", target2.vertexBuf);
                    morphVertexBufBound = true;
                }

                if (target1.normalBuf) {
                    program.bindFloatArrayBuffer("SCENEJS_aNormal", target1.normalBuf);
                    program.bindFloatArrayBuffer("SCENEJS_aMorphNormal", target2.normalBuf);
                    morphNormalBufBound = true;
                }

                if (target1.uvBuf) {
                    program.bindFloatArrayBuffer("SCENEJS_aUVCoord", target1.uvBuf);
                    program.bindFloatArrayBuffer("SCENEJS_aMorphUVCoord", target2.uvBuf);
                    morphUVBufBound = true;
                }

                if (target1.uvBuf2) {
                    program.bindFloatArrayBuffer("SCENEJS_aUVCoord2", target1.uvBuf);
                    program.bindFloatArrayBuffer("SCENEJS_aMorphUVCoord2", target2.uvBuf);
                    morphUV2BufBound = true;
                }

                program.setUniform("SCENEJS_uMorphFactor", morph.factor);
                this._lastMorphStateId = node.morphState._stateId;
            }

            /* Bind geometry
             */
            if (!morphVertexBufBound && geo.vertexBuf) {
                program.bindFloatArrayBuffer("SCENEJS_aVertex", geo.vertexBuf);
            }

            if (!morphNormalBufBound && geo.normalBuf) {
                program.bindFloatArrayBuffer("SCENEJS_aNormal", geo.normalBuf);
            }
            // TODO
            if (node.texState && node.texState.layers.length > 0) {
                if (geo.uvBuf) {
                    program.bindFloatArrayBuffer("SCENEJS_aUVCoord", geo.uvBuf);
                }
                if (geo.uvBuf2) {
                    program.bindFloatArrayBuffer("SCENEJS_aUVCoord2", geo.uvBuf2);
                }
            }
            if (geo.colorBuf) {
                program.bindFloatArrayBuffer("SCENEJS_aVertexColor", geo.colorBuf);
            }
            geo.indexBuf.bind();
            this._lastGeoStateId = node.geoState._stateId;
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
            program.setUniform("SCENEJS_uAmbient", clearColor ? [clearColor.r, clearColor.g, clearColor.b] : [0, 0, 0]);
        }

        /*----------------------------------------------------------------------------------------------------------
         * texture
         *--------------------------------------------------------------------------------------------------------*/

        if (node.texState._stateId != this._lastTexStateId) {
            var layer;
            for (var j = 0, len = node.texState.layers.length; j < len; j++) {
                layer = node.texState.layers[j];
                if (layer.texture) {
                    program.bindTexture("SCENEJS_uSampler" + j, layer.texture, j);
                    if (layer.matrixAsArray) {
                        program.setUniform("SCENEJS_uLayer" + j + "Matrix", layer.matrixAsArray);
                    }
               }
            }
            this._lastTexStateId = node.texState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * view matrix and eye position
         *--------------------------------------------------------------------------------------------------------*/

        if (node.viewXFormState._stateId != this._lastViewXFormStateId) {
            program.setUniform("SCENEJS_uVMatrix", node.viewXFormState.mat);
            //            program.setUniform("SCENEJS_uVNMatrix", node.viewXFormState.normalMat);
            //            program.setUniform("SCENEJS_uEye", node.viewXFormState.lookAt.eye);
            this._lastViewXFormStateId = node.viewXFormState._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * model matrix
         *--------------------------------------------------------------------------------------------------------*/

        if (node.modelXFormState._stateId != this._lastModelXFormStateId) {
            var m = node.modelXFormState;
            program.setUniform("SCENEJS_uMMatrix", m.mat);
            program.setUniform("SCENEJS_uMNMatrix", m.normalMat);
            this._lastModelXFormStateId = m._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * projection matrix
         *--------------------------------------------------------------------------------------------------------*/

        if (node.projXFormState._stateId != this._lastProjXFormStateId) {
            var p = node.projXFormState;
            program.setUniform("SCENEJS_uPMatrix", p.mat);
            this._lastProjXFormStateId = p._stateId;
        }

        /*----------------------------------------------------------------------------------------------------------
         * clip planes
         *--------------------------------------------------------------------------------------------------------*/

        if (node.clipState &&
            (node.clipState._stateId != this._lastClipStateId ||
             node.flagsState._stateId != this._lastFlagsStateId)) { // Flags can enable/disable clip
            var clips = node.clipState.clips;
            var clip;
            for (var k = 0, len = clips.length; k < len; k++) {
                clip = clips[k];
                if (node.flagsState.flags.clipping === false) { // Flags disable/enable clipping
                    program.setUniform("SCENEJS_uClipMode" + k, 0);
                } else if (clip.mode == "inside") {
                    program.setUniform("SCENEJS_uClipMode" + k, 2);
                } else if (clip.mode == "outside") {
                    program.setUniform("SCENEJS_uClipMode" + k, 1);
                } else { // disabled
                    program.setUniform("SCENEJS_uClipMode" + k, 0);
                }
                program.setUniform("SCENEJS_uClipNormalAndDist" + k, clip.normalAndDist);
            }
            this._lastClipStateId = node.clipState._stateId;
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

                    program.setUniform("SCENEJS_uFogMode", 0.0);
                } else {

                    if (fog.mode == "constant") {
                        program.setUniform("SCENEJS_uFogMode", 4.0);
                        program.setUniform("SCENEJS_uFogColor", fog.color);
                        program.setUniform("SCENEJS_uFogDensity", fog.density);

                    } else {

                        if (fog.mode == "linear") {
                            program.setUniform("SCENEJS_uFogMode", 1.0);
                        } else if (fog.mode == "exp") {
                            program.setUniform("SCENEJS_uFogMode", 2.0);
                        } else if (fog.mode == "exp2") {
                            program.setUniform("SCENEJS_uFogMode", 3.0); // mode is "exp2"
                        }
                        program.setUniform("SCENEJS_uFogColor", fog.color);
                        program.setUniform("SCENEJS_uFogDensity", fog.density);
                        program.setUniform("SCENEJS_uFogStart", fog.start);
                        program.setUniform("SCENEJS_uFogEnd", fog.end);
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
                    program.setUniform("SCENEJS_uColorTransMode", 0);  // Disable
                } else {
                    var trans = node.colortransState.trans;
                    var scale = trans.scale;
                    var add = trans.add;
                    program.setUniform("SCENEJS_uColorTransMode", 1);  // Enable
                    program.setUniform("SCENEJS_uColorTransScale", [scale.r, scale.g, scale.b, scale.a]);  // Scale
                    program.setUniform("SCENEJS_uColorTransAdd", [add.r, add.g, add.b, add.a]);  // Scale
                    program.setUniform("SCENEJS_uColorTransSaturation", trans.saturation);  // Saturation
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
                program.setUniform("SCENEJS_uMaterialBaseColor", material.baseColor);
                program.setUniform("SCENEJS_uMaterialSpecularColor", material.specularColor);
                program.setUniform("SCENEJS_uMaterialSpecular", node.flagsState.flags.specular != false ? material.specular : 0.0);
                program.setUniform("SCENEJS_uMaterialShine", material.shine);
                program.setUniform("SCENEJS_uMaterialEmit", material.emit);
                program.setUniform("SCENEJS_uMaterialAlpha", material.alpha);

                this._lastMaterialStateId = node.materialState._stateId;

                /* If highlighting then override material's baseColor. We'll also force a
                 * material state change for the next node, otherwise otherwise the highlight
                 * may linger in the shader uniform if there is no material state change for the next node.
                 */
                if (node.flagsState && node.flagsState.flags.highlight) {
                    program.setUniform("SCENEJS_uMaterialBaseColor", material.highlightBaseColor);
                    this._lastMaterialStateId = null;
                }
            }

            /*----------------------------------------------------------------------------------------------------------
             * lights
             *--------------------------------------------------------------------------------------------------------*/

            if (node.lightState && node.lightState._stateId != this._lastLightStateId) {
                var ambient;
                var lights = node.lightState.lights;
                var light;
                for (var k = 0, len = lights.length; k < len; k++) {
                    light = lights[k];
                    program.setUniform("SCENEJS_uLightColor" + k, light.color);
                    if (light.mode == "dir") {
                        program.setUniform("SCENEJS_uLightDir" + k, light.worldDir);
                    } else if (light.mode == "ambient") {
                        ambient = ambient ? [
                            ambient[0] + light.color[0],
                            ambient[1] + light.color[1],
                            ambient[2] + light.color[2]
                        ] : light.color;
                    } else {
                        if (light.mode == "point") {
                            program.setUniform("SCENEJS_uLightPos" + k, light.worldPos);
                        }
                        if (light.mode == "spot") {
                            program.setUniform("SCENEJS_uLightPos" + k, light.worldPos);
                            program.setUniform("SCENEJS_uLightDir" + k, light.worldDir);
                            program.setUniform("SCENEJS_uLightCutOff" + k, light.spotCosCutOff);
                            program.setUniform("SCENEJS_uLightSpotExp" + k, light.spotExponent);
                        }
                        program.setUniform("SCENEJS_uLightAttenuation" + k,
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
                this._pickListeners[this._pickIndex++] = node.pickListenersState;
                var b = this._pickIndex >> 16 & 0xFF;
                var g = this._pickIndex >> 8 & 0xFF;
                var r = this._pickIndex & 0xFF;
                program.setUniform("SCENEJS_uPickColor", [r/255,g/255,b/255]);
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
         * flags
         *
         * Set these last because we change certain other states when we determine that flags will change
         *--------------------------------------------------------------------------------------------------------*/

        if (! this._lastFlagsState || node.flagsState._stateId != this._lastFlagsState._stateId) {

            /*
             */
            var newFlags = node.flagsState.flags;
            var oldFlags = this._lastFlagsState ? this._lastFlagsState.flags : null;

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

            //            var mask = newFlags.colorMask;
            //
            //            if (!oldFlags || (mask && (mask.r != oldFlags.r || mask.g != oldFlags.g || mask.b != oldFlags.b || mask.a != oldFlags.a))) {
            //
            //                if (mask) {
            //
            //                    gl.colorMask(mask.r, mask.g, mask.b, mask.a);
            //
            //                } else {
            //                    gl.colorMask(true, true, true, true);
            //                }
            //            }

            this._lastFlagsState = node.flagsState;
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


        //            if (node._pickListenersState) {     // Post-call last listeners
        //
        //            }

        ///////////////////////////////////////////
        this._context.finish();
        //this._context.flush();
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
        //        this._context.colorMask(true, true, true, true);
        return this._pickListeners;
    };
};
