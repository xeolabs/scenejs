/**
 * Backend for a scene node.
 */
SceneJS._backends.installBackend(

        "scene",

        function(ctx) {

            var initialised = false; // True as soon as first scene registered
            var scenes = {};
            var nScenes = 0;
            var activeSceneId;

            var projMat;
            var viewMat;
            var picking;

            ctx.events.onEvent(
                    SceneJS._eventTypes.RESET,
                    function() {
                        scenes = {};
                        nScenes = 0;
                        activeSceneId = null;
                    });

            function updatePick() {

            }

            ctx.events.onEvent(
                    SceneJS._eventTypes.PROJECTION_TRANSFORM_UPDATED,
                    function(params) {
                        projMat = params.matrix;
                    });

            ctx.events.onEvent(
                    SceneJS._eventTypes.VIEW_TRANSFORM_UPDATED,
                    function(params) {
                        viewMat = params.matrix;
                    });

            /** Locates canvas in DOM, finds WebGL context on it,
             *  sets some default state on the context, then returns
             *  canvas, canvas ID and context wrapped up in an object.
             *
             * If canvasId is null, will fall back on SceneJS_webgl_DEFAULT_CANVAS_ID
             */
            var findCanvas = function(canvasId) {
                var canvas;
                if (!canvasId) {
                    ctx.logging.info("SceneJS.scene config 'canvasId' omitted - looking for default canvas with ID '"
                            + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                    canvasId = SceneJS_webgl_DEFAULT_CANVAS_ID;
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        throw new SceneJS.exceptions.CanvasNotFoundException
                                ("SceneJs.scene config 'canvasId' omitted and could not find default canvas with ID '"
                                        + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                    }
                } else {
                    canvas = document.getElementById(canvasId);
                    if (!canvas) {
                        ctx.logging.info("SceneJS.scene config 'canvasId' unresolved - looking for default canvas with " +
                                         "ID '" + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                        canvasId = SceneJS_webgl_DEFAULT_CANVAS_ID;
                        canvas = document.getElementById(canvasId);
                        if (!canvas) {
                            throw new SceneJS.exceptions.CanvasNotFoundException
                                    ("SceneJs.scene config 'canvasId' does not match any elements in the page and no " +
                                     "default canvas found with ID '" + SceneJS_webgl_DEFAULT_CANVAS_ID + "'");
                        }
                    }
                }
                var context;
                var contextNames = SceneJS_webgl_contextNames;
                for (var i = 0; (!context) && i < contextNames.length; i++) {
                    try {

                        context = canvas.getContext(contextNames[i]);

                        //
                        //                                                alert("WebGL Trace enabled");
                        //                                                context = WebGLDebugUtils.makeDebugContext(canvas.getContext(contextNames[i]));
                        //                                                context.setTracing(true);
                    } catch (e) {

                    }
                }
                if (!context) {
                    throw new SceneJS.exceptions.WebGLNotSupportedException
                            ('Canvas document element with ID \''
                                    + canvasId
                                    + '\' failed to provide a supported WebGL context');
                }
                context.clearColor(0.0, 0.0, 0.0, 1.0);
                context.clearDepth(1.0);
                context.enable(context.DEPTH_TEST);
                context.disable(context.CULL_FACE);
                context.disable(context.TEXTURE_2D);
                context.depthRange(0, 1);
                context.disable(context.SCISSOR_TEST);
                return {
                    canvas: canvas,
                    context: context,
                    canvasId : canvasId
                };
            };

            function createPickBuffer(context) {
                var buffer = {
                    frameBuffer : context.createFramebuffer(),
                    renderBuffer : context.createRenderbuffer(),
                    texture : context.createTexture()
                };
                context.bindTexture(context.TEXTURE_2D, buffer.texture);
                try { // Null may be OK with some browsers - thanks Paul
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, null);
                } catch (e) {
                    var texture = new WebcontextUnsignedByteArray(3);
                    context.texImage2D(
                            context.TEXTURE_2D, 0, context.RGB, 1, 1, 0, context.RGB, context.UNSIGNED_BYTE, texture);
                }
                context.bindFramebuffer(context.FRAMEBUFFER, buffer.frameBuffer);
                context.bindRenderbuffer(context.RENDERBUFFER, buffer.renderBuffer);
                context.renderbufferStorage(context.RENDERBUFFER, context.DEPTH_COMPONENT, 1, 1);
                context.bindRenderbuffer(context.RENDERBUFFER, null);
                context.framebufferTexture2D(
                        context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, buffer.texture, 0);
                context.framebufferRenderbuffer(
                        context.FRAMEBUFFER, context.DEPTH_ATTACHMENT, context.RENDERBUFFER, buffer.renderBuffer);
                context.bindFramebuffer(context.FRAMEBUFFER, null);
                return buffer;
            }

            function activatePickBuffer(context, buffer) {
                context.bindFramebuffer(context.FRAMEBUFFER, buffer.framePickBuffer);
                context.viewport(0, 0, 1, 1);
                context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                context.disable(context.BLEND);
            }

            function getPick(context, buffer) {
                var data = context.readPixels(0, 0, 1, 1, context.RGBA, context.UNSIGNED_BYTE);
                if (data.data) {
                    data = data.data; // TODO: hack for firefox
                }
                var id = data[0] + data[1] * 256;
                context.bindFramebuffer(context.FRAMEBUFFER, null);
                return id;
            }

            function pick(x, y) {
                //get camera space coords
                var origmatrix = this.camera.matrix;
                var origpmatrix = this.camera.pMatrix;
                xcoord = -( ( ( 2 * x ) / this.renderer.canvas.width ) - 1 ) / this.camera.pMatrix.e(1, 1);
                ycoord = ( ( ( 2 * y ) / this.renderer.canvas.height ) - 1 ) / this.camera.pMatrix.e(2, 2);
                zcoord = 1;
                if (this.camera.type == GLGE.C_PERSPECTIVE) {
                    var coord = [xcoord,ycoord,zcoord,0];
                    coord = this.camera.matrix.inverse().x(coord);
                    var cameraPos = this.camera.getPosition();
                    var zvec = coord.toUnitVector();
                    var xvec = (new GLGE.Vec([0,0,1])).cross(zvec).toUnitVector();
                    var yvec = zvec.cross(xvec).toUnitVector();
                    this.camera.matrix = new GLGE.Mat([xvec.e(1), yvec.e(1), zvec.e(1), cameraPos.x,
                        xvec.e(2), yvec.e(2), zvec.e(2), cameraPos.y,
                        xvec.e(3), yvec.e(3), zvec.e(3), cameraPos.z,
                        0, 0, 0, 1]).inverse();
                }
                if (this.camera.type == GLGE.C_ORTHO) {
                    this.camera.matrix = this.camera.matrix.inv().x(GLGE.translateMatrix(-xcoord, -ycoord, 0)).inv();
                }
                this.camera.pMatrix = GLGE.makeOrtho(-0.0001, 0.0001, -0.0001, 0.0001, this.camera.near, this.camera.far);
                //render for picking
                var gl = this.renderer.gl;
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framePickBuffer);
                gl.viewport(0, 0, 1, 1);
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                this.renderer.gl.disable(this.renderer.gl.BLEND);

                for (var i = 0; i < this.objects.length; i++) {
                    this.objects[i].GLRender(this.renderer.gl, GLGE.RENDER_PICK);
                }
                var data = gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE);
                //TODO: firefox hack :-( remove when fixed!
                if (data.data) data = data.data;
                var index = data[0] + data[1] * 256;
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);

                //revert the view matrix
                this.camera.matrix = origmatrix;
                this.camera.pMatrix = origpmatrix;

                if (index > 0) {
                    return this.objects[index - 1];
                } else {
                    return false;
                }

            }


            return { // Node-facing API

                /** Registers a scene and returns the ID under which it is registered
                 */
                registerScene : function(scene, params) {
                    if (!initialised) {
                        ctx.logging.info("SceneJS V" + SceneJS.version + " initialised");
                        ctx.events.fireEvent(SceneJS._eventTypes.INIT);
                    }
                    var canvas = findCanvas(params.canvasId); // canvasId can be null
                    var sceneId = SceneJS._utils.createKeyForMap(scenes, "scene");
                    scenes[sceneId] = {
                        sceneId: sceneId,
                        scene:scene,
                        canvas: canvas
                    };
                    nScenes++;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_CREATED, {sceneId : sceneId });
                    ctx.logging.info("Scene defined: " + sceneId);
                    return sceneId;
                },

                /** Deregisters scene
                 */
                deregisterScene :function(sceneId) {
                    scenes[sceneId] = null;
                    nScenes--;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DESTROYED, {sceneId : sceneId });
                    if (activeSceneId == sceneId) {
                        activeSceneId = null;
                    }
                    ctx.logging.info("Scene destroyed: " + sceneId);
                    if (nScenes == 0) {
                        ctx.logging.info("SceneJS reset");
                        ctx.events.fireEvent(SceneJS._eventTypes.RESET);

                    }
                },

                /** Specifies which registered scene is the currently active one
                 */
                activateScene : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    activeSceneId = sceneId;
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_ACTIVATED, { sceneId: sceneId });
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_ACTIVATED, scene.canvas);
                },

                /** Returns the canvas element the given scene is bound to
                 */
                getSceneCanvas : function(sceneId) {
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    return scene.canvas.canvas;
                },
                //
                //                activatePick : function(sceneId) {
                //
                //                },

                /** Returns all registered scenes
                 */
                getAllScenes:function() {
                    var list = [];
                    for (var id in scenes) {
                        var scene = scenes[id];
                        if (scene) {
                            list.push(scene.scene);
                        }
                    }
                    return list;
                },

                /** Finds a registered scene
                 */
                getScene : function(sceneId) {
                    return scenes[sceneId].scene;
                },

                /** Deactivates the currently active scene and reaps destroyed and timed out processes
                 */
                deactivateScene : function() {
                    if (!activeSceneId) {
                        throw "Internal error: no scene active";
                    }
                    var sceneId = activeSceneId;
                    activeSceneId = null;
                    var scene = scenes[sceneId];
                    if (!scene) {
                        throw "Scene not defined: '" + sceneId + "'";
                    }
                    ctx.events.fireEvent(SceneJS._eventTypes.CANVAS_DEACTIVATED, scene.canvas);
                    ctx.events.fireEvent(SceneJS._eventTypes.SCENE_DEACTIVATED, {sceneId : sceneId });
                    //ctx.logging.info("Scene deactivated: " + sceneId);

                }
            };
        });
