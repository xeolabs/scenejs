/**
 * Backend for asset nodes which extends the basic type to provide support for the Collada ".dae" file format.
 *
 * @param cfg
 */

SceneJs.backends.installBackend(
        (function() {

            return SceneJs.assetBackend({

                /** All asset backends have an type ID of this form:
                 * "asset." concatenated with the target file extension
                 */
                type: 'asset.dae',

                /** Parser that converts a Collada file into a scene graph node
                 */
                parse: function() { // TODO: what form is this argument? String, stream or URL?
                    return SceneJs.objects.teapot({}); // Stub
                }
            });
        })()
        )
        ;


