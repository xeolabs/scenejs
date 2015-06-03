/**
 Path camera node type

 @author xeolabs / http://xeolabs.com

 <pre>

 someNode.addNode({
        type: "cameras/path",
        sequence: [
            {
                time: 0,
                eye:    { x: 0,     y: 0,       z: -100 },
                look:   { x: 0,     y: 0,       z: 0 }
            },
            {
                time: 6,
                eye:    { x: 40,    y: 20.0,    z: -100 },
                look:   { x: 0,     y: 0,       z: 0 }
            }
        ]
  });

 </pre>

 <p>The camera is initially positioned at the given 'eye' and 'look', then the distance of 'eye' is zoomed out
 away from 'look' by the amount given in 'zoom', and then 'eye' is rotated by 'yaw' and 'pitch'.</p>

 */
SceneJS.Types.addType("cameras/path", {

    construct: function (params) {

        this._lookat = this.addNode({
            type: "lookAt",
            nodes: params.nodes
        });

        // Path of lookats
        this._sequence = [];

        // A time value for each lookat on the path
        this._timeline = [];

        // The current time on the path
        this._time = 0;

        // Build initial path
        if (params.path) {
            this.setPath(params.path);
        }

//        // On scene tick, update the lookat from path and current time
//        var self = this;
//        var lastTime = this._time;
//        this._tick = this.getScene().on("tick",
//            function (tick) {
//                tick /= 1000.0; // Millisecs to secs
//                if (tick.time != lastTime) {
//                    self._update();
//                    lastTime = self._time;
//                }
//            });
    },

    _buildLines : function() {
    },

    /**
     * Clears the path
     */
    clear: function () {
        this._sequence = [];
        this._timeline = [];
        this._time = 0.0;
    },

    /**
     * Adds a lookat to the path
     * @param lookat
     */
    add: function (lookat) {
        if (this._sequence.length === 0) {
            this._time = 0.0;
        }
        this._timeline.push(lookat.time);
        if (lookat.time < this._minTime) {
            this._minTime = lookat.time;
        }
        return this._sequence.push(lookat);
    },

    /**
     * Set the path of lookats
     * @param path
     */
    setPath: function (path) {
        for (var i = 0, len = path.length; i < len; i++) {
            this.add(path[i]);
        }
    },

    /**
     * Set the camera to its state on the path at the given time
     * @param time
     */
    setTime: function (time) {
        this._time = time;
        this._update();
    },

    /**
     * Returns the total time duration of the path
     * @returns {*}
     */
    getTotalTime: function () {
        if (this._timeline.length > 0) {
            return this._timeline[this._timeline.length - 1];
        }
        return 0;
    },

    _update: function () {
        if (this._sequence.length === 0) {
            return;
        }
        if (this._time < this._timeline[0]) {
            this._setLookat(this._sequence[0]);
            return;
        }
        if (this._time >= this.getTotalTime() || this._sequence.length === 1) {
            this._setLookat(this._sequence[this._sequence.length - 1]);
            return;
        }
        var i = 0;
        while (this._timeline[i] < this._time) {
            ++i;
        }
        this._lerp(this._time, i - 1);
    },

    _lerp: function (t, i) {
        var t1 = this._timeline[i];
        var t2 = this._timeline[i + 1];
        var a = this._sequence[i];
        var b = this._sequence[i + 1];
        this._lookat.setEye(this._lerpVec(t, t1, t2, a.eye, b.eye));
        this._lookat.setLook(this._lerpVec(t, t1, t2, a.look, b.look));
        this._lookat.setUp(this._lerpVec(t, t1, t2, a.up, b.up));
    },

    _lerpVec: function (t, t1, t2, p1, p2) {
        var f2 = (t - t1) / (t2 - t1);
        var f1 = 1.0 - f2;
        return  {
            x: p1.x * f1 + p2.x * f2,
            y: p1.y * f1 + p2.y * f2,
            z: p1.z * f1 + p2.z * f2
        };
    },

    _setLookat: function (lookat) {
        this._lookat.setEye(lookat.eye);
        this._lookat.setLook(lookat.look);
        this._lookat.setUp(lookat.up);
    },

    destruct: function () {
    }
});