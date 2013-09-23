SceneJS.Types.addType("effects/wobble", {

    construct:function (params) {

        var shader = this.addNode({
            type:"shader",
            shaders:[
                {
                    stage:"vertex",
                    code:"uniform float time;\n\
                          vec4 myWorldPosFunc(vec4 pos){\n\
                              pos.x=pos.x+sin(pos.x*5.0+time+10.0)*0.1;\n\
                              pos.y=pos.y+sin(pos.y*5.0+time+10.0)*0.1;\n\
                              pos.z=pos.z+sin(pos.z*5.0+time+10.0)*0.1;\n\
                              return pos;\n\
                          }\n",
                    hooks:{
                        worldPos:"myWorldPosFunc"
                    }
                }
            ],
            params:{
                time:0.5
            },
            nodes:params.nodes
        });

        var time = 0;

        this._tick = this.getScene().on("tick",
            function () {
                shader.setParams({
                    time:time
                });
                time += 0.1;
            });
    },

    destruct:function () {
        this.getScene().off(this._tick);
    }
});
