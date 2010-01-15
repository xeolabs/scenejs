/**
 * Backend for asset nodes which extends the basic type to provide support for parsing (evaluating)
 * scene chunks that are the usual SceneJS scene definitions as JavaScript.
 *
 * @param cfg
 */

SceneJs.backends.installBackend(
        (function() {

            return SceneJs.assetBackend({

                /** All asset backends have an type ID of this form:
                 * "asset." concatenated with the target file extension
                 */
                type: 'asset.js',

               /** Special params for asset server
                 */
                serverParams: {
                    mode: 'js'
                },

                /** Does no parsing, just returns data which is already a scene node
                 */
                parse: function(data) {
                    return data
                }
            });
        })()
        )
        ;


