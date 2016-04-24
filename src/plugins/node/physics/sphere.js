/**
 * Spherical physics body
 *
 * @author xeographics / http://xeographics.com
 *
 * <p>Documentation at: http://xeographics.com/articles/scenejs-physics/</p>
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

