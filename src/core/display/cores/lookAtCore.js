
SceneJS_CoreFactory.createCoreType("lookAt", {

    init : function(params) {

        this.lookAt = params.lookAt || SceneJS_math_LOOKAT_ARRAYS;

        this.dirty = true;
    },

    build: function() {

        this.matrix = SceneJS_math_lookAtMat4c(
                this.eyeX, this.eyeY, this.eyeZ,
                this.lookX, this.lookY, this.lookZ,
                this.upX, this.upY, this.upZ);

        this.lookAt = {
            eye: [this.eyeX, this.eyeY, this.eyeZ ],
            look: [this.lookX, this.lookY, this.lookZ ],
            up:  [this.upX, this.upY, this.upZ ]
        };

        if (!this.mat) { // Lazy-create arrays
            this.mat = new Float32Array(this.matrix);
            this.normalMat = new Float32Array(
                    SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(this.matrix, SceneJS_math_mat4())));

        } else { // Insert into arrays
            this.mat.set(this.matrix);
            this.normalMat.set(SceneJS_math_transposeMat4(SceneJS_math_inverseMat4(this.matrix, SceneJS_math_mat4())));
        }

        this.dirty = false;
    }
});
