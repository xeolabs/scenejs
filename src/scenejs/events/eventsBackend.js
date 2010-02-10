/**
 * Backend for event handling.
 */
SceneJs.backends.installBackend(
        new (function() {

            this.type = 'events';

            var ctx;

            this.install = function(_ctx) {
                ctx = _ctx;

                ctx.events = (function() {

                    var commands = {};

                    return {

                        /** Registers listener for a backend-generated event. These are set by backends
                         * on installation to set up permanent triggers for them to synchronise themselves
                         * with each other. An example: when geometry backend fires "geo-drawing" event
                         * the view transform backend then lazy-computes the current view matrix and loads it
                         * into the current shader.
                         */
                        onEvent: function(name, command) {
                            var list = commands[name];
                            if (!list) {
                                list = [];
                                commands[name] = list;
                            }
                            list.push(command);
                        },

                        /** Fires backend event
                         */
                        fireEvent: function(name, params) {
                            var list = commands[name];
                            if (list) {
                                for (var i = 0; i < list.length; i++) {
                                    list[i](params);
                                }
                            }
                        }
                    };
                })();
            };
        })());
