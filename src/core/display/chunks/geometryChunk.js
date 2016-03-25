/**
 *  Create display state chunk type for draw and pick render of geometry
 */
SceneJS_ChunkFactory.createChunkType({

    type: "geometry",

    build: function () {

        var draw = this.program.draw;

        this._aRegionMapUVDraw = draw.getAttribute("SCENEJS_aRegionMapUV");
        this._aVertexDraw = draw.getAttribute("SCENEJS_aVertex");
        this._aNormalDraw = draw.getAttribute("SCENEJS_aNormal");

        // Get attributes for unlimited UV layers

        this._aUVDraw = [];
        var aUV;
        for (var i = 0; i < 1000; i++) { // Assuming we'll never have more than 1000 UV layers
            aUV = draw.getAttribute("SCENEJS_aUVCoord" + i);
            if (!aUV) {
                break;
            }
            this._aUVDraw.push(aUV);
        }

        this._aTangentDraw = draw.getAttribute("SCENEJS_aTangent");
        this._aColorDraw = draw.getAttribute("SCENEJS_aVertexColor");

        this._aMorphVertexDraw = draw.getAttribute("SCENEJS_aMorphVertex");
        this._aMorphNormalDraw = draw.getAttribute("SCENEJS_aMorphNormal");
        this._aMorphTangentDraw = draw.getAttribute("SCENEJS_aMorphTangent");
        this._uMorphFactorDraw = draw.getUniform("SCENEJS_uMorphFactor");

        var pick = this.program.pick;

        this._aRegionMapUVPick = pick.getAttribute("SCENEJS_aRegionMapUV");
        this._aVertexPick = pick.getAttribute("SCENEJS_aVertex");
        this._aColorPick = pick.getAttribute("SCENEJS_aColor");
        this._aMorphVertexPick = pick.getAttribute("SCENEJS_aMorphVertex");
        this._uMorphFactorPick = pick.getUniform("SCENEJS_uMorphFactor");

        this.VAO = null;
        this.VAOMorphKey1 = 0;
        this.VAOMorphKey2 = 0;
        this.VAOHasInterleavedBuf = false;
    },

    recycle: function () {
        if (this.VAO) {
            // Guarantee that the old VAO is deleted immediately when recycling the object.
            var VAOExt = this.program.gl.getExtension("OES_vertex_array_object");
            VAOExt.deleteVertexArrayOES(this.VAO);
            this.VAO = null;
        }
    },

    morphDraw: function (frameCtx) {

        this.VAOMorphKey1 = this.core.key1;
        this.VAOMorphKey2 = this.core.key2;

        var key1 = this.core.key1;
        var key2 = this.core.key2;

        var target1 = this.core.targets[key1]; // Keys will update
        var target2 = this.core.targets[key2];

        if (this._aMorphVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(target1.vertexBuf);
            this._aMorphVertexDraw.bindFloatArrayBuffer(target2.vertexBuf);
        } else if (this._aVertexDraw) {
            this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
        }

        if (this._aMorphNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(target1.normalBuf);
            this._aMorphNormalDraw.bindFloatArrayBuffer(target2.normalBuf);
        } else if (this._aNormalDraw) {
            this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
        }

        if (this._aMorphTangentDraw || this._aTangentDraw) {

            // Bind tangent arrays from geometry and morphGeometry

            // In the texture chunk we remembered which UV layer we're using for the normal
            // map so that we can lazy-generate the tangents from the appropriate UV layer
            // in the geometry chunk.

            // Note that only one normal map is allowed per drawable, so there
            // will be only one UV layer used for normal mapping.

            var normalMapUVLayerIdx = frameCtx.normalMapUVLayerIdx;
            if (normalMapUVLayerIdx >= 0) {
                if (this._aMorphTangentDraw) {
                    this._aTangentDraw.bindFloatArrayBuffer(this.core.getTangents(key1, this.core2.arrays.indices, this.core2.arrays.uvs[normalMapUVLayerIdx]));
                    this._aMorphTangentDraw.bindFloatArrayBuffer(this.core.getTangents(key2, this.core2.arrays.indices, this.core2.arrays.uvs[normalMapUVLayerIdx]));
                } else if (this._aTangentDraw) {

                    // TODO: What's this for?
                    //this._aTangentDraw.bindFloatArrayBuffer(this.core2.tangentBuf);
                }
            }
        }

        // Bind UV layer from geometry

        var uvBuf;
        for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
            uvBuf = this.core2.uvBufs[i];
            if (uvBuf) {
                this._aUVDraw[i].bindFloatArrayBuffer(uvBuf);
            }
        }

        if (this._aColorDraw) {
            this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
        }

        this.setDrawMorphFactor();
    },

    setDrawMorphFactor: function () {

        if (this._uMorphFactorDraw) {
            this._uMorphFactorDraw.setValue(this.core.factor); // Bind LERP factor
        }

    },

    draw: function (frameCtx) {
        var doMorph = this.core.targets && this.core.targets.length;
        var cleanInterleavedBuf = this.core2.interleavedBuf && !this.core2.interleavedBuf.dirty;

        if (this.VAO && frameCtx.VAO) { // Workaround for https://github.com/xeolabs/scenejs/issues/459
            frameCtx.VAO.bindVertexArrayOES(this.VAO);
            if (doMorph) {
                if (this.VAOMorphKey1 == this.core.key1 && this.VAOMorphKey2 == this.core.key2) {
                    this.setDrawMorphFactor();
                    return;
                }
            } else if (cleanInterleavedBuf || !this.VAOHasInterleavedBuf) {
                return;
            }
        } else if (frameCtx.VAO) {
            // Start creating a new VAO by switching to the default VAO, which doesn't have attribs enabled.
            frameCtx.VAO.bindVertexArrayOES(null);
            this.VAO = frameCtx.VAO.createVertexArrayOES();
            frameCtx.VAO.bindVertexArrayOES(this.VAO);
        }

        if (doMorph) {
            this.morphDraw(frameCtx);
        } else {
            if (cleanInterleavedBuf) {
                this.VAOHasInterleavedBuf = true;
                this.core2.interleavedBuf.bind();
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedPositionOffset);
                }
                if (this._aNormalDraw) {
                    this._aNormalDraw.bindInterleavedFloatArrayBuffer(3, this.core2.interleavedStride, this.core2.interleavedNormalOffset);
                }
                for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
                    this._aUVDraw[i].bindInterleavedFloatArrayBuffer(2, this.core2.interleavedStride, this.core2.interleavedUVOffsets[i]);
                }
                if (this._aColorDraw) {
                    this._aColorDraw.bindInterleavedFloatArrayBuffer(4, this.core2.interleavedStride, this.core2.interleavedColorOffset);
                }
            } else {
                this.VAOHasInterleavedBuf = false;
                if (this._aVertexDraw) {
                    this._aVertexDraw.bindFloatArrayBuffer(this.core2.vertexBuf);
                }
                if (this._aNormalDraw) {
                    this._aNormalDraw.bindFloatArrayBuffer(this.core2.normalBuf);
                }
                var uvBuf;
                for (var i = 0, len = this._aUVDraw.length; i < len; i++) {
                    uvBuf = this.core2.uvBufs[i];
                    if (uvBuf) {
                        this._aUVDraw[i].bindFloatArrayBuffer(uvBuf);
                    }
                }
                if (this._aColorDraw) {
                    this._aColorDraw.bindFloatArrayBuffer(this.core2.colorBuf);
                }
            }

            if (this._aTangentDraw) {

                // In the texture chunk we remembered which UV layer we're using for the normal
                // map so that we can lazy-generate the tangents from the appropriate UV layer
                // in the geometry chunk.

                // Note that only one normal map is allowed per drawable, so there
                // will be only one UV layer used for normal mapping.

                var normalMapUVLayerIdx = frameCtx.normalMapUVLayerIdx;
                if (normalMapUVLayerIdx >= 0) {
                    this._aTangentDraw.bindFloatArrayBuffer(this.core2.getTangents(normalMapUVLayerIdx));
                }
            }
        }

        if (this._aRegionMapUVDraw) {
            var regionMapUVLayerIdx = frameCtx.regionMapUVLayerIdx; // Set by regionMapChunk
            if (regionMapUVLayerIdx >= 0) {
                var uvBufs = this.core2.uvBufs;
                if (regionMapUVLayerIdx < uvBufs.length) {
                    this._aRegionMapUVDraw.bindFloatArrayBuffer(uvBufs[regionMapUVLayerIdx]);
                }
            }
        }

        this.core2.indexBuf.bind();
    },

    morphPick: function (frameCtx) {

        var core = this.core;
        var core2 = this.core2;

        var target1 = core.targets[core.key1];
        var target2 = core.targets[core.key2];

        if (frameCtx.pickObject || frameCtx.pickRegion) {

            if (this._aMorphVertexPick) {

                this._aVertexPick.bindFloatArrayBuffer(target1.vertexBuf);
                this._aMorphVertexPick.bindFloatArrayBuffer(target2.vertexBuf);

            } else if (this._aVertexPick) {
                this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);
            }

            core2.indexBuf.bind();

        } else if (frameCtx.pickTriangle) {

            if (this._aMorphVertexPick) {

                var pickPositionsBuf = core.getPickPositions(core.key1, core2.arrays.indices);
                if (pickPositionsBuf) {
                    this._aVertexPick.bindFloatArrayBuffer(pickPositionsBuf);
                }

                pickPositionsBuf = core.getPickPositions(core.key2, core2.arrays.indices);
                if (pickPositionsBuf) {
                    this._aMorphVertexPick.bindFloatArrayBuffer(pickPositionsBuf);
                }

                if (this._aColorPick) {
                    this._aColorPick.bindFloatArrayBuffer(core2.getPickColors());
                }

            } else if (this._aVertexPick) {

                this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);

                core2.indexBuf.bind();
            }
        }

        if (this._uMorphFactorPick) {
            this._uMorphFactorPick.setValue(core.factor);
        }
    },

    pick: function (frameCtx) {

        var core = this.core;
        var core2 = this.core2;

        if (core.targets && core.targets.length) {

            this.morphPick(frameCtx);

        } else {

            if (frameCtx.pickObject || frameCtx.pickRegion) {

                if (this._aVertexPick) {
                    this._aVertexPick.bindFloatArrayBuffer(core2.vertexBuf);
                }

                if (this._aRegionMapUVPick) {
                    this._aRegionMapUVPick.bindFloatArrayBuffer(core2.uvBufs[frameCtx.regionMapUVLayerIdx]); // Set by regionMapChunk
                }

                core2.indexBuf.bind();

            } else if (frameCtx.pickTriangle) {

                if (this._aVertexPick) {
                    this._aVertexPick.bindFloatArrayBuffer(core2.getPickPositions());
                }

                if (this._aColorPick) {
                    this._aColorPick.bindFloatArrayBuffer(core2.getPickColors());
                }

            }
        }
    }
});
