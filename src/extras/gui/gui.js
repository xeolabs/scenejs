/**
 *
 * @param scene
 * @param nodeIds
 * @constructor
 */
SceneJS.GUI = function (scene, nodeIds) {

    var gui = new dat.GUI();

    this.createMenu = function (nodeId) {
        var node = scene.getNode(nodeId,
            function (node) {
                var type = node.getType();
                switch (type) {
                    case "lookAt":
                        lookat(node);
                        break;
                    case "lights":
                        spotLight(node, 0);
                        break;
                    case "material":
                        material(node);
                        break;
                    case "rotate":
                        rotate(node);
                        break;
                    case "translate":
                        translate(node);
                        break;
                    case "flags":
                        flags(node);
                        break;
                    case "scale":
                        scale(node);
                        break;
                }
            });
    };

    if (nodeIds) {
        for (var i = 0, len = nodeIds.length; i < len; i++) {
            this.createMenu(nodeIds[i]);
        }
    }

    function lookat(lookat) {
        var Menu = function () {
            var eye = lookat.getEye();
            var look = lookat.getLook();
            var up = lookat.getUp();
            this["eye.x"] = eye.x;
            this["eye.y"] = eye.y;
            this["eye.z"] = eye.z;
            this["look.x"] = look.x;
            this["look.y"] = look.y;
            this["look.z"] = look.z;
            this["up.x"] = up.x;
            this["up.y"] = up.y;
            this["up.z"] = up.z;

            var self = this;
            var update = function () {
                lookat.setEye({
                    x:self["eye.x"],
                    y:self["eye.y"],
                    z:self["eye.z"]
                });
                lookat.setLook({
                    x:self["look.x"],
                    y:self["look.y"],
                    z:self["look.z"]
                });
                lookat.setUp({
                    x:self["up.x"],
                    y:self["up.y"],
                    z:self["up.z"]
                });
                requestAnimationFrame(update);
            };
            update();
        };
        var folder = gui.addFolder("lookAt '" + lookat.getId() + "'");
        var menu = new Menu();
        folder.add(menu, 'eye.x', -20.0, 20.0);
        folder.add(menu, 'eye.y', -20.0, 20.0);
        folder.add(menu, 'eye.z', -20.0, 20.0);
        folder.add(menu, 'look.x', -20.0, 20.0);
        folder.add(menu, 'look.y', -20.0, 20.0);
        folder.add(menu, 'look.z', -20.0, 20.0);
        folder.add(menu, 'up.x', -20.0, 20.0);
        folder.add(menu, 'up.y', -20.0, 20.0);
        folder.add(menu, 'up.z', -20.0, 20.0);
        folder.open();
    }

    function lights(lights, cfg) {
        var lights = [];
    }

    function pointLight(lights, index, cfg) {
        var Menu = function () {
            this["pos.x"] = 10.0;
            this["pos.y"] = 10.0;
            this["pos.z"] = 10.0;
            this["color.r"] = 1.0;
            this["color.g"] = 1.0;
            this["color.b"] = 1.0;
            this.constantAttenuation = 0.0;
            this.linearAttenuation = 0.0;
            this.quadraticAttenuation = 0.0;
            this.specular = true;
            this.diffuse = true;

            var self = this;

            var update = function () {
                lights.setLights({
                    "0":{
                        pos:{
                            x:self["pos.x"],
                            y:self["pos.y"],
                            z:self["pos.z"]
                        },
                        color:{
                            r:self["color.r"],
                            g:self["color.g"],
                            b:self["color.b"]
                        },
                        constantAttenuation:self.constantAttenuation,
                        linearAttenuation:self.linearAttenuation,
                        quadraticAttenuation:self.quadraticAttenuation,
                        specular:self.specular,
                        diffuse:self.diffuse
                    }
                });
                requestAnimationFrame(update);
            };
            update();
        };

        var folder = gui.addFolder('Light ' + index);
        var menu = new Menu();
        folder.add(menu, 'pos.x', -10.0, 10.0);
        folder.add(menu, 'pos.y', -10.0, 10.0);
        folder.add(menu, 'pos.z', -10.0, 10.0);
        folder.add(menu, 'color.r', 0.0, 1.0);
        folder.add(menu, 'color.g', 0.0, 1.0);
        folder.add(menu, 'color.b', 0.0, 1.0);
        folder.add(menu, 'specular');
        folder.add(menu, 'diffuse');
        folder.add(menu, 'constantAttenuation', 0.0, 1.0);
        folder.add(menu, 'linearAttenuation', 0.0, 1.0);
        folder.add(menu, 'quadraticAttenuation', 0.0, 1.0);
        folder.open();
    }

    function spotLight(lights) {
        var Menu = function () {
            this["pos.x"] = 10.0;
            this["pos.y"] = 10.0;
            this["pos.z"] = 10.0;
            this["color.r"] = 1.0;
            this["color.g"] = 1.0;
            this["color.b"] = 1.0;
            this["dir.x"] = 0.0;
            this["dir.y"] = 0.0;
            this["dir.z"] = -1.0;
            this.innerCone = 0.25;
            this.outerCone = 0.3;
            this.constantAttenuation = 0.0;
            this.linearAttenuation = 0.0;
            this.quadraticAttenuation = 0.0;
            this.specular = true;
            this.diffuse = true;

            var self = this;

            var update = function () {
                lights.setLights({
                    "0":{
                        pos:{
                            x:self["pos.x"],
                            y:self["pos.y"],
                            z:self["pos.z"]
                        },
                        color:{
                            r:self["color.r"],
                            g:self["color.g"],
                            b:self["color.b"]
                        },
                        dir:{
                            x:self["dir.x"],
                            y:self["dir.y"],
                            z:self["dir.z"]
                        },
                        innerCone:self.innerCone,
                        outerCone:self.outerCone,
                        constantAttenuation:self.constantAttenuation,
                        linearAttenuation:self.linearAttenuation,
                        quadraticAttenuation:self.quadraticAttenuation,
                        specular:self.specular,
                        diffuse:self.diffuse
                    }
                });
                requestAnimationFrame(update);
            };
            update();
        };

        var folder = gui.addFolder('Light ' + index);
        var menu = new Menu();
        folder.add(menu, 'pos.x', -10.0, 10.0);
        folder.add(menu, 'pos.y', -10.0, 10.0);
        folder.add(menu, 'pos.z', -10.0, 10.0);
        folder.add(menu, 'color.r', 0.0, 1.0);
        folder.add(menu, 'color.g', 0.0, 1.0);
        folder.add(menu, 'color.b', 0.0, 1.0);
        folder.add(menu, 'dir.x', 0.0, 1.0);
        folder.add(menu, 'dir.y', 0.0, 1.0);
        folder.add(menu, 'dir.z', 0.0, 1.0);
        folder.add(menu, 'innerCone', 0.0, 1.0);
        folder.add(menu, 'outerCone', 0.0, 1.0);
        folder.add(menu, 'specular');
        folder.add(menu, 'diffuse');
        folder.add(menu, 'constantAttenuation', 0.0, 1.0);
        folder.add(menu, 'linearAttenuation', 0.0, 1.0);
        folder.add(menu, 'quadraticAttenuation', 0.0, 1.0);
        folder.open();
    }

    function dirLight(lights, index, cfg) {

        var Menu = function () {

            this["dir.x"] = 5.0;
            this["dir.y"] = -5.0;
            this["dir.z"] = -5.0;
            this["color.r"] = 1.0;
            this["color.g"] = 1.0;
            this["color.b"] = 1.0;
            this.specular = true;
            this.diffuse = true;

            var self = this;

            var update = function () {
                lights.setLights({
                    "0":{
                        dir:{
                            x:self["dir.x"],
                            y:self["dir.y"],
                            z:self["dir.z"]
                        },
                        color:{
                            r:self["color.r"],
                            g:self["color.g"],
                            b:self["color.b"]
                        },
                        specular:self.specular,
                        diffuse:self.diffuse
                    }
                });

                requestAnimationFrame(update);
            };

            update();
        };

        var folder = gui.addFolder('Light ' + index);
        var menu = new Menu();
        folder.add(menu, 'dir.x', -10.0, 10.0);
        folder.add(menu, 'dir.y', -10.0, 10.0);
        folder.add(menu, 'dir.z', -10.0, 10.0);
        folder.add(menu, 'color.r', 0.0, 1.0);
        folder.add(menu, 'color.g', 0.0, 1.0);
        folder.add(menu, 'color.b', 0.0, 1.0);
        folder.add(menu, 'specular');
        folder.add(menu, 'diffuse');
        folder.open();
    }


    function material(material) {

        var Menu = function () {
            this["color.r"] = 1.0;
            this["color.g"] = 1.0;
            this["color.b"] = 1.0;
            this["specularColor.r"] = 1.0;
            this["specularColor.g"] = 1.0;
            this["specularColor.b"] = 1.0;
            this.specular = 1.0;
            this.shine = 70.0;
            this.emit = 0;
            this.alpha = 1.0;

            var self = this;

            var update = function () {
                material.set({
                    color:{
                        r:self["color.r"],
                        g:self["color.g"],
                        b:self["color.b"]
                    },
                    specularColor:{
                        r:self["specularColor.r"],
                        g:self["specularColor.g"],
                        b:self["specularColor.b"]
                    },
                    specular:self.specular,
                    shine:self.shine,
                    emit:self.emit,
                    alpha:self.alpha
                });
                requestAnimationFrame(update);
            };
            update();
        };

        var folder = gui.addFolder("material \"" + material.getId() + "\"");
        var menu = new Menu();
        folder.add(menu, 'color.r', 0.0, 1.0);
        folder.add(menu, 'color.g', 0.0, 1.0);
        folder.add(menu, 'color.b', 0.0, 1.0);
        folder.add(menu, 'specularColor.r', 0.0, 1.0);
        folder.add(menu, 'specularColor.g', 0.0, 1.0);
        folder.add(menu, 'specularColor.b', 0.0, 1.0);
        folder.add(menu, 'specular', 0.0, 1.0);
        folder.add(menu, 'shine', 0.0, 1000.0);
        folder.add(menu, 'emit', 0.0, 10.0);
        folder.add(menu, 'alpha', 0.0, 1.0);
        folder.open();
    }

    function rotate(rotate) {
        var Menu = function () {
            this.x = 0.0;
            this.y = 1.0;
            this.z = 0.0;
            this.angle = 0.0;
            var self = this;
            var update = function () {
                rotate.set({
                    x:self.x,
                    y:self.y,
                    z:self.z,
                    angle:self.angle
                });
                requestAnimationFrame(update);
            };
            update();
        };
        var folder = gui.addFolder("Rotate '" + rotate.getId() + "'");
        var menu = new Menu();
        folder.add(menu, 'x', -1.0, 1.0);
        folder.add(menu, 'y', -1.0, 1.0);
        folder.add(menu, 'z', -1.0, 1.0);
        folder.add(menu, 'angle', 0, 360.0);
        folder.open();
    }

    function scale(scale) {
        var Menu = function () {
            this.x = 0.0;
            this.y = 1.0;
            this.z = 0.0;
            var self = this;
            var update = function () {
                scale.set({
                    x:self.x,
                    y:self.y,
                    z:self.z
                });
                requestAnimationFrame(update);
            };
            update();
        };
        var folder = gui.addFolder("Scale '" + scale.getId() + "'");
        var menu = new Menu();
        folder.add(menu, 'x', -1.0, 1.0);
        folder.add(menu, 'y', -1.0, 1.0);
        folder.add(menu, 'z', -1.0, 1.0);
        folder.open();
    }

    function translate(translate) {
        var Menu = function () {
            this.x = 0.0;
            this.y = 1.0;
            this.z = 0.0;
            var self = this;
            var update = function () {
                translate.set({
                    x:self.x,
                    y:self.y,
                    z:self.z
                });
                requestAnimationFrame(update);
            };
            update();
        };
        var folder = gui.addFolder("Translate '" + translate.getId() + "'");
        var menu = new Menu();
        folder.add(menu, 'x', -1.0, 1.0);
        folder.add(menu, 'y', -1.0, 1.0);
        folder.add(menu, 'z', -1.0, 1.0);
        folder.open();
    }

    function flags(flags) {
        var Menu = function () {
            var attr = flags.getFlags();
            this.picking = attr.picking;
            this.enabled = attr.enabled;
            this.transparent = attr.transparent;
            this.backfaces = attr.backfaces;
            this.frontface = attr.frontface;
            this.backfaceLighting = attr.backfaceLighting;
            this.backfaceTexturing = attr.backfaceTexturing;
            this.specular = attr.specular;
            this.ambient = attr.ambient;
            this.reflection = attr.reflection;

            var self = this;
            var update = function () {
                flags.set({
                    picking:self.picking,
                    enabled:self.enabled,
                    transparent:self.transparent,
                    backfaces:self.backfaces,
                    frontface:self.frontface,
                    backfaceLighting:self.backfaceLighting,
                    backfaceTexturing:self.backfaceTexturing,
                    specular:self.specular,
                    ambient:self.ambient,
                    reflection: self.reflection
                });
                requestAnimationFrame(update);
            };
            update();
        };
        var folder = gui.addFolder("Flags '" + flags.getId() + "'");
        var menu = new Menu();
        folder.add(menu, 'picking');
        folder.add(menu, 'enabled');
        folder.add(menu, 'transparent');
        folder.add(menu, 'backfaces');
        folder.add(menu, 'frontface', [ 'ccw', 'cw' ]);
        folder.add(menu, 'backfaceLighting');
        folder.add(menu, 'backfaceTexturing');
        folder.add(menu, 'specular');
        folder.add(menu, 'ambient');
        folder.add(menu, 'reflection');
        folder.open();
    }
};



