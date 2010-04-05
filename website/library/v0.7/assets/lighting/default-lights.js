/**
 * SceneJS asset that defines some quick-and-dirty lights and a default material
 * for use while developing scene graph definitions.
 *
 * Use like this:
 *
 * SceneJS.load({  url: "<location of this file>" },
 *
 *      // Rest of your scene here ...
 *
 *  )
 * 
 */
SceneJS.lights({

    /* Three directional light sources
     */
    sources: [
        {
            type:                   "dir",
            color:                  { r: .8, g: 0.8, b: 0.8 },
            diffuse:                true,
            specular:               false,
            pos:                    { x: 100.0, y: 4.0, z: -100.0 },
            constantAttenuation:    1.0,
            quadraticAttenuation:   0.0,
            linearAttenuation:      0.0
        }
        ,
        {
            type:                   "dir",
            color:                  { r: 0.6, g: 0.6, b: 0.6 },
            diffuse:                true,
            specular:               true,
            pos:                    { x: 100.0, y: -100.0, z: -100.0 },
            constantAttenuation:    1.0,
            quadraticAttenuation:   0.0,
            linearAttenuation:      0.0
        },
        {
            type:                   "dir",
            color:                  { r: 0.6, g: 0.6, b: 0.6 },
            diffuse:                true,
            specular:               true,
            pos:                    { x: -1000.0, y: -1000.0, z: 0.0 },
            constantAttenuation:    1.0,
            quadraticAttenuation:   0.0,
            linearAttenuation:      0.0
        }
    ]},

        /* Some gray material
         */
        SceneJS.material({
            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
            specular:       0.9,
            shine:          6.0
        }))