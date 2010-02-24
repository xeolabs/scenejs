/**
 * Extend the assets backend to support import of native SceneJS JavaScript assets
 */
SceneJS._backends.extend(

        function(ctx) {

            ctx.assets.installImporter({

                /** All asset backends have an type ID of this form:
                 * "asset." concatenated with the target file extension.
                 * If you made one for COLLADA, you would give it type "asset.dae".
                 */
                type: '.js',

                /** Special params for asset (proxy) server
                 */
                serverParams: {
                    mode: 'js'
                },

                /** Does no parsing, just returns data which is already a scene node
                 */
                parse: function(data, onError) {
                    if (typeof data != 'function') {
                        onError(data.error || "unkown server error");
                        return null;
                    } else {
                        return data;
                    }
                }
            });
        });


