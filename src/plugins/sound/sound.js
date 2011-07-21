SceneJS.Sound = SceneJS.createNodeType("sound");
SceneJS.Sound.prototype._init = function(params) {
    this._position = params.position;

    this._soundParams = params.soundParams;
    this._volume = params.soundParams.volume || 100;

    this._rearAtt = params.rearAtt || 42;
    this._distAtt = params.distAtt || 42;

    this._matrix = params.matrix;


    this._loaded = false;
};

SceneJS.Sound.prototype._compile = function(traversalContext) {
    if (!this._loaded && soundManager.supported())
    {
        this._sound = soundManager.createSound(this._soundParams);
        this._loaded = true;
    }

    if (this._loaded)
    {
        var listener = this._position;
        var matrix = SceneJS_math_identityMat4();
        if (!listener) {
            var lookAt = SceneJS_viewTransformModule.transform.lookAt;
            listener = lookAt.eye;
            lookAt = new SceneJS.LookAt({eye: lookAt.eye, look: lookAt.look, up: lookAt.up});
            matrix = SceneJS_math_negateMat4(lookAt.getMatrix());
        }

        if (this._matrix)
            matrix = this._matrix;

        var pos = SceneJS_math_transformPoint3(SceneJS_modelTransformModule.transform.matrix, [0, 0, 0]);
        var v = SceneJS_math_subVec3(pos, listener);
        var dist = SceneJS_math_lenVec3(v);

        if (dist < 0.001)
        {
            this._sound.setVolume(this._volume);
            this._sound.setPan(0);
        }
        else
        {
            var ov = [0, 0, 0];
            SceneJS_math_addVec3(ov, SceneJS_math_mulVec3Scalar(matrix.slice(0, 3), v[0]));
            SceneJS_math_addVec3(ov, SceneJS_math_mulVec3Scalar(matrix.slice(4, 7), v[1]));
            SceneJS_math_addVec3(ov, SceneJS_math_mulVec3Scalar(matrix.slice(8, 11), v[2]));

            SceneJS_math_normalizeVec3(ov);

            var pan = SceneJS_math_dotVector3([ov[0], 0, ov[2]], [1, 0, 0]);
            pan = pan * -99.9;
            this._sound.setPan(pan);

            var rearAtt = SceneJS_math_dotVector3([ov[0], 0, ov[2]], [0, 0, -1]);
            rearAtt = rearAtt * this._rearAtt;
            if (rearAtt < 0)
                rearAtt = 0;

            var distAtt = 150 / (dist / this._distAtt + 1) - 50;

            this._sound.setVolume(this._volume * (1 - rearAtt / 100) * (distAtt / 100));
        }
    }
    else
    {
        SceneJS_compileModule.nodeUpdated(this);
    }

    this._compileNodes(traversalContext);
};

SceneJS.Sound.prototype.setVolume = function(volume) {
    this._volume = volume || 100;
};

SceneJS.Sound.prototype.getVolume = function() {
    return this._volume;
};

SceneJS.Sound.prototype.getSound = function() {
    return this._sound;
};
