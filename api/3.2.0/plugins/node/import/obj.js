/**
 * WaveFront OBJ mesh importer
 *
 * Uses the K3D library to parse OBJ
 * © 2012 Ivan Kuckir
 * http://k3d.ivank.net/
 *
 */
require([

    // This prefix routes to the 3rd-party libs directory containing resources used by plugins
    "scenejsPluginDeps/k3d"
],
    function () {

        SceneJS.Types.addType("import/obj", {

            construct:function (params) {

                if (!params.src) {
                    this.log("error", "Attribute expected: src");
                }

                // Notify SceneJS so it can support loading/busy indicators etc
                this._taskId = this.taskStarted("Loading .OBJ");

                var self = this;

                load(params.src,
                    function (data) {

                        var m = K3D.parse.fromOBJ(data);	// done !

                        self.addNode({
                            type:"geometry",
                            positions:m.c_verts,
                            uv:m.c_uvt && m.c_uvt.length > 0 ? m.c_uvt : undefined,
                            normals:m.c_norms && m.c_norms.length > 0 ? m.c_norms : undefined,
                            indices:m.i_verts
                        });

                        self._taskId = self.taskFinished(self._taskId);
                    },

                    function (err) {
                        self.log("error", "Failed to load file: " + err);
                        self._taskId = self.taskFailed(self._taskId);
                    });

            },

            destruct:function () {
                this._taskId = this.taskFinished(this._taskId);
            }
        });


        function load(url, ok, error) {
            var xhr = new XMLHttpRequest();
            xhr.responseType = "arraybuffer";
//            xhr.addEventListener('progress',
//                function (event) {
//                    // TODO: Update the task? { type:'progress', loaded:event.loaded, total:event.total }
//                }, false);
            xhr.addEventListener('load',
                function (event) {
                    if (event.target.response) {
                        ok(event.target.response);
                    } else {
                        error('Invalid file [' + url + ']');
                    }
                }, false);
            xhr.addEventListener('error',
                function () {
                    error('Couldn\'t load URL [' + url + ']');
                }, false);
            xhr.open('GET', url, true);
            xhr.send(null);
        }

    })();