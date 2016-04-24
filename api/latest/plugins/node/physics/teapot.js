/**
 * A teapot with physics behaviour
 *
 * @author xeographics / http://xeographics.com
 *
 * <p>Documentation at: http://xeographics.com/articles/scenejs-physics/</p>
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

