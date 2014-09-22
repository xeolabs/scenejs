/**
 * Spherical physics body
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Documentation at: http://xeolabs.com/articles/scenejs-physics/</p>
 */
SceneJS.Types.addType("physics/sphere", {
    construct:function (params) {

        this.addNode({
            type:"physics/sphere",
            shape: "sphere",
            pos: params.pos,
            radius: params.radius,
            mass: params.mass,
            restitution: params.restitution,
            friction: params.friction,
            velocity: params.velocity,
            movable: params.movable,

            nodes:[
                {
                    type:"geometry/radius",
                    latitudeBands: params.latitudeBands,
                    longitudeBands: params.longitudeBands,
                    radius: params.radius
                }
            ]
        });
    }
});

