/**
 * Standard pipeline
 *
 * IN DEVELOPMENT
 *
 * Usage example:
 *
 * someNode.addNode({
 *      type: "postprocess/pipeline/std",
 *      nodes: [
 *        //..
 *
 *      }
 *  });
 */
SceneJS.Types.addType("postprocess/pipeline/std", {
    construct: function (params) {

        var pipeline = this.addNode({
            type: "postprocess/pipeline",
            effects: [

                // Oculus Rift
                {
                    effectId: "oculusRift",
                    type: "effects/oculusRift",
                    displayName: "Oculus Rift",
                    description: "Render to Oculus Rift"
                },

                // Anaglyph
                {
                    effectId: "anaglyph",
                    type: "effects/anaglyph",
                    displayName: "Anaglyph 3D",
                    description: "Render as Anaglyph 3D"
                },

                // Stereo
                {
                    effectId: "stereo",
                    type: "effects/stereo",
                    displayName: "Stereo",
                    description: "Render in stereo"
                },

                // Depth-of-field
                {
                    effectId: "dof",                // Unique ID to assign
                    type: "postprocess/dof",        // SceneJS node to use for this effect
                    displayName: "Depth-of-field",
                    description: "Simulates photographic depth-of-field",

                    // Effect parameters
                    params: {
                        texelSize: 0.00022,             // Size of one texel (1 / width, 1 / height)
                        blurCoeff: 0.0084,	            // Calculated from the blur equation, b = ( f * ms / N )
                        autofocus: true                 // Automatically synch focusDist to "cameras/pickFlyOrbit"
                    }
                },

                // Sepia effect
                {
                    effectId: "sepia",
                    type: "postprocess/sepia",
                    displayName: "Sepia",
                    description: "Sepia color filter"
                },

                // Scanlines effect
                {
                    effectId: "scanlines",
                    type: "postprocess/scanlines",
                    displayName: "Scanlines",
                    description: "Scan lines pattern"
                },

                // Film grain effect
                {
                    effectId: "filmGrain",
                    type: "postprocess/filmGrain",
                    displayName: "Film Grain",
                    description: "Film grain noise"
                },

                // Technicolor effect
                {
                    effectId: "technicolor",
                    type: "postprocess/technicolor",
                    displayName: "Technicolor",
                    description: "Technicolor color filter"
                }
            ],

            nodes: params.nodes
        });

        this.pipeline = pipeline.pipeline;
        this.effects = pipeline.effects;

        this.setParams = function (params) {
            pipeline.setParams(params);
        };

        this.setEnabled = function (params) {
            pipeline.setEnabled(params);
        };
    }
});

