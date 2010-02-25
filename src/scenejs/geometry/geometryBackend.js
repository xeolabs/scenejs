/**
 * Backend module for the geometry node. Buffers geometry on the
 * currently-active canvas, triggers loading into shader, performs
 * rendering. Also performs eviction of least-used geometry buffers
 * on request from memory management module.
 */
SceneJS._backends.installBackend(

        "geometry",

        function(ctx) {

            var time = (new Date()).getTime();               // For LRU caching
            var canvas;             // Currently active canvas
            var geometries = {};    // Buffered geometries for all existing canvases
            var nextTypeId = 0;     // For random geometry type when no type specified
            var currentBoundGeo;    // prevents continuous rebind of same buffer

            ctx.events.onEvent(// System time update
                    SceneJS._eventTypes.TIME_UPDATED,
                    function(t) {
                        time = t;
                    });

            ctx.events.onEvent(// Scene traversal begun - no canvas active, no geometry bound
                    SceneJS._eventTypes.SCENE_ACTIVATED,
                    function() {
                        canvas = null;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(// Canvas activated - no geometry bound
                    SceneJS._eventTypes.CANVAS_ACTIVATED,
                    function(c) {
                        canvas = c;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(// Canvas deactivated
                    SceneJS._eventTypes.CANVAS_DEACTIVATED,
                    function() {
                        canvas = null;
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(// Shader activated - now need lazy-bind of buffers and vars
                    SceneJS._eventTypes.SHADER_ACTIVATED,
                    function() {
                        currentBoundGeo = null;
                    });

            ctx.events.onEvent(// Shader deactivated - may need re-bind to previous shader
                    SceneJS._eventTypes.SHADER_DEACTIVATED,
                    function() {
                        currentBoundGeo = null;
                    });

            /**
             * Destroys geometry, returning true if memory freed, else false
             * where canvas not found and geometry was implicitly destroyed
             */
            function destroyGeometry(geo) {
                ctx.logging.debug("Destroying geometry : '" + geo.type + "'");
                if (geo.geoId == currentBoundGeo) {
                    currentBoundGeo = null;
                }
                if (document.getElementById(geo.canvas.canvasId)) { // Context won't exist if canvas has disappeared
                    if (geo.vertexBuf) {
                        geo.vertexBuf.destroy();
                    }
                    if (geo.normalBuf) {
                        geo.normalBuf.destroy();
                    }
                    if (geo.normalBuf) {
                        geo.indexBuf.destroy();
                    }
                    if (geo.texCoordBuf) {
                        geo.texCoordBuf.destroy();
                    }
                    geometries[geo.geoId] = null;
                    return true;
                } else {
                    return false;
                }
            }

            ctx.events.onEvent(// Framework reset - destroy geometries
                    SceneJS._eventTypes.RESET,
                    function() {
                        for (var geoId in geometries) {
                            destroyGeometry(geometries[geoId]);
                        }
                        canvas = null;
                        geometries = {};
                        currentBoundGeo = null;
                    });

            /**
             * Volunteer to destroy a shader when asked to by
             * memory management module when memory runs low
             */
            ctx.memory.registerEvictor(
                    function() {
                        var earliest = time;
                        var evictee;
                        for (var geoId in geometries) {
                            if (geoId) {
                                var buffer = geometries[geoId];
                                if (buffer.lastUsed < earliest) {
                                    evictee = buffer;
                                    earliest = buffer.lastUsed;
                                }
                            }
                        }
                        if (evictee) {
                            ctx.logging.warn("Evicting geometry from shader memory: " + evictee.type);
                            destroyGeometry(evictee);
                            return true;
                        }                                                  
                        return false;   // Couldnt find suitable buffer to delete
                    });

            /**
             * Creates an array buffer
             *
             * @param context WebGL context
             * @param type Eg. ARRAY_BUFFER
             * @param values WebGL array
             * @param numItems
             * @param itemSize
             * @param usage Eg. STATIC_DRAW
             */
            function createArrayBuffer(description, context, type, values, numItems, itemSize, usage) {
                var buf;
                ctx.memory.allocate(
                        description,
                        function() {
                            buf = new SceneJS._webgl.ArrayBuffer
                                    (context, type, values, numItems, itemSize, usage);
                        });
                return buf;
            }

            /**
             * Converts SceneJS primitive type string to WebGL constant
             */
            function getPrimitiveType(context, type) {
                switch (type) {
                    case "points":
                        return context.POINTS;
                    case "lines":
                        return context.LINES;
                    case "line-loop":
                        return context.LINE_LOOP;
                    case "line-strip":
                        return context.LINE_STRIP;
                    case "triangles":
                        return context.TRIANGLES;
                    case "triangle-strip":
                        return context.TRIANGLE_STRIP;
                    case "triangle-fan":
                        return context.TRIANGLE_FAN;
                    default:
                        throw new SceneJS.exceptions.InvalidGeometryConfigException(
                                "Unsupported geometry primitive: '" +
                                type +
                                "' - supported types are: 'points', 'lines', 'line-loop', " +
                                "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'");
                }
            }

            return { // Node-facing API

                /**
                 * Returns the ID of the geometry of the given type if it exists on the active canvas
                 */
                findGeometry : function(type) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var geoId = canvas.canvasId + type;
                    return (geometries[geoId]) ? geoId : null;
                },

                /**
                 * Creates geometry of the given type on the active canvas and returns its ID
                 *
                 * @param type Optional type for geometry - when null, a random type will be used
                 * @param data Contains vertices, normals, indexes etc.
                 */
                createGeometry : function(type, data) {
                    ctx.logging.debug("Creating geometry: '" + type + "'");
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }
                    var geoId = canvas.canvasId + (type || nextTypeId++);
                    var context = canvas.context;

                    var usage = context.STATIC_DRAW;
                    //var usage = (!data.fixed) ? context.STREAM_DRAW : context.STATIC_DRAW;

                    var vertexBuf;
                    var normalBuf;
                    var texCoordBuf;
                    var indexBuf;

                    try { // TODO: Modify usage flags in accordance with how often geometry is evicted

                        vertexBuf = createArrayBuffer("geometry vertex buffer", context, context.ARRAY_BUFFER,
                                new WebGLFloatArray(data.vertices), data.vertices.length, 3, usage);

                        normalBuf = createArrayBuffer("geometry normal buffer", context, context.ARRAY_BUFFER,
                                new WebGLFloatArray(data.normals), data.normals.length, 3, usage);

                        if (data.texCoords) {
                            texCoordBuf = createArrayBuffer("geometry texture buffer", context, context.ARRAY_BUFFER,
                                    new WebGLFloatArray(data.texCoords), data.texCoords.length, 2, usage);
                        }

                        indexBuf = createArrayBuffer("geometry index buffer", context, context.ELEMENT_ARRAY_BUFFER,
                                new WebGLUnsignedShortArray(data.indices), data.indices.length, 1, usage);

                        var geo = {
                            fixed : true, // TODO: support dynamic geometry
                            primitive: getPrimitiveType(context, data.primitive),
                            type: type,
                            geoId: geoId,
                            lastUsed: time,
                            canvas : canvas,
                            context : context,
                            vertexBuf : vertexBuf,
                            normalBuf : normalBuf,
                            indexBuf : indexBuf,
                            texCoordBuf: texCoordBuf
                        };

                        geometries[geoId] = geo;

                        return geoId;

                    } catch (e) { // Allocation failure - delete whatever buffers got allocated

                        if (vertexBuf) {
                            vertexBuf.destroy();
                        }
                        if (normalBuf) {
                            normalBuf.destroy();
                        }
                        if (texCoordBuf) {
                            texCoordBuf.destroy();
                        }
                        if (indexBuf) {
                            indexBuf.destroy();
                        }
                        throw e;
                    }
                },

                /**
                 * Draws the geometry of the given ID that exists on the current canvas.
                 * Client node must ensure prior that the geometry exists on the canvas
                 * using findGeometry, and have created it if neccessary with createGeometry.
                 */
                drawGeometry : function(geoId) {
                    if (!canvas) {
                        throw new SceneJS.exceptions.NoCanvasActiveException("No canvas active");
                    }

                    var geo = geometries[geoId];

                    geo.lastUsed = time;

                    var context = canvas.context;

                    /* Prompt other backends to lazy-load their resources into the active shader
                     */
                    ctx.events.fireEvent(SceneJS._eventTypes.GEOMETRY_RENDERING);

                    /* Dont rebind buffer if already bound - this is the case when
                     * we're drawing a batch of the same object, Eg. a bunch of cubes in a row
                     */
                    if (currentBoundGeo != geoId) {
                        /* Bind vertex buffers to active shader
                         */
                        ctx.events.fireEvent(
                                SceneJS._eventTypes.SHADER_FLOAT_ARRAY_BUFFER,
                                [
                                    SceneJS._webgl.shaderVarNames.VERTEX,       // name
                                    geo.vertexBuf                               // value
                                ]);

                        ctx.events.fireEvent(
                                SceneJS._eventTypes.SHADER_FLOAT_ARRAY_BUFFER,
                                [
                                    SceneJS._webgl.shaderVarNames.NORMAL,
                                    geo.normalBuf
                                ]);

                        /* Bind texture coords to active shader - texture sampler is bound by texture backend
                         */
                        if (geo.texCoordBuf) {
                            ctx.events.fireEvent(
                                    SceneJS._eventTypes.SHADER_FLOAT_ARRAY_BUFFER,
                                    [
                                        SceneJS._webgl.shaderVarNames.TEXTURE_COORD,
                                        geo.texCoordBuf
                                    ]);
                        }

                        geo.indexBuf.bind(); // Bind index buffer

                        currentBoundGeo = geoId;
                    }

                    /* Draw geometry
                     */
                    context.drawElements(geo.primitive, geo.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
                    context.flush();

                    /* Don't need to unbind buffers - only one is bound at a time anyway                    
                     */

                    /* Destroy one-off geometry
                     */
                    if (!geo.fixed) {
                        destroyGeometry(geo);
                        currentBoundGeo = null;
                    }
                }
            };
        });