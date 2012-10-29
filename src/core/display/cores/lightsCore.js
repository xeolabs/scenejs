SceneJS_CoreFactory.createCoreType("lights", {

    init : function(params) {

        this.lights = params.lights || [];

        this.hash = params.hash || "";

        this.empty = params.empty != undefined ? params.empty : true;
    }
});