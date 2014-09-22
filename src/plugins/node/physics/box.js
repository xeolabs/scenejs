/**
 * A box-shaped physics body
 *
 * @author xeolabs / http://xeolabs.com
 *
 * <p>Documentation at: http://xeolabs.com/articles/scenejs-physics/</p>
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

