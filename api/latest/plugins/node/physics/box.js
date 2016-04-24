/**
 * A box-shaped physics body
 *
 * @author xeographics / http://xeographics.com
 *
 * <p>Documentation at: http://xeographics.com/articles/scenejs-physics/</p>
 */
SceneJS.Types.addType("physics/box", {
    construct:function (params) {

        this.addNode({
            type:"physics/body",
            shape: "box",
            pos: params.pos,
            size: params.size,
            mass: params.mass,
            restitution: params.restitution,
            friction: params.friction,
            velocity: params.velocity,
            movable: params.movable,

            nodes:[
                {
                    type:"geometry/box",
                    size: params.size
                }
            ]
        });
    }
});

