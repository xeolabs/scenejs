/**
 * A teapot with physics behaviour
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Documentation at: http://xeolabs.com/articles/scenejs-physics/</p>
 */
SceneJS.Types.addType("physics/teapot", {
    construct:function (params) {

        this.addNode({
            type:"physics/body",
            shape: "sphere",
            pos: params.pos,
            radius: 1,
            mass: params.mass,
            restitution: params.restitution,
            friction: params.friction,
            velocity: params.velocity,
            movable: params.movable,

            nodes:[
                {
                    type:"geometry/teapot"
                }
            ]
        });
    }
});

