(function () {

    Human.timeline.Tween.tweenFactory.createTweenType(
        "lerp",
        function (cfg) {
            if (!cfg.type) {
                throw "'type' expected";
            }
            if (!cfg.keys) {
                throw "'keys' expected";
            }
            if (!cfg.targets) {
                throw "'targets' expected";
            }

            if (cfg.keys.length < 2 || cfg.targets.length < 2) {
                throw "tween '" + cfg.name + "' has insufficient keys or targets - minimum of two required";
            }
            if (cfg.keys.length != cfg.targets.length) {
                throw "tween '" + cfg.name + "' has mismatching numbers of keys and targets";
            }

            this.keys = cfg.keys;
            this.targets = cfg.targets;

            this.firstTime = cfg.keys[0];
            this.lastTime = cfg.keys[cfg.keys.length - 1];

            this._manipulator = Human.timeline.Tween.manipulatorFactory.getManipulator(cfg);
            this.name = cfg.name;
            this.type = cfg.type;
            this.tweenMap = {};
            this.tweenList = [];

            var target;
            var key;
            var targetAttr;
            var tween;

            // Parse "targets"
            for (var i = 0, len = this.targets.length; i < len; i++) {
                target = this.targets[i];
                key = this.keys[i];

                //Create a Tween for each attribute ("translate", "rotate" etc.) in target.
                // Each tween will contain a sub-tween for each of its target's elements ("x", "y" etc.)
                for (var attrName in target) {
                    if (target.hasOwnProperty(attrName)) {
                        targetAttr = target[attrName];
                        tween = this.tweenMap[attrName];
                        if (!tween) { // Lazy-create
                            var tweenAttr = this._manipulator.attr[attrName];
//                            if (tweenAttr == undefined) {
//                                Human.log.warn("tween '" + this.name + "' of type '" + this.type + "' does not support attribute '" + attrName + "'");
//                                continue;
//                            }
                            tween = new AttrLerp(tweenAttr, cfg.options);
                            this.tweenMap[attrName] = tween;
                            this.tweenList.push(tween);
                        }
                        tween.addTarget(key, targetAttr);
                    }
                }
            }

            this.update = function (ctx, time) {

                if (time == undefined) {
                    time = this.firstTime;
                }

                var countUpdated = 0;

                // Update each tween
                for (var j = 0, len = this.tweenList.length; j < len; j++) {
                    if (this.tweenList[j].update(ctx, time)) {
                        countUpdated++;
                    }
                }

                // Manipulate target
                if (countUpdated > 0) {
                    this._manipulator.update(ctx);
                }
            };

            this.stop = function () {
                if (this._manipulator.stop) {
                    this._manipulator.stop();
                }
            };

            this.destroy = function () {
                Human.timeline.Tween.manipulatorFactory.putManipulator(this._manipulator);
            };
        });


    /**
     * Tweens an attribute map
     *
     * Eg. var lerp = new AttrLerp({ "x": 0, "y": 0, "z": 0 });
     */
    function AttrLerp(attr, options) {

        this.attr = attr || {};
        this.options = options || {};

        this.keys = [];
        this.attrTargetLists = {};

        this._key1 = 0;
        this._key2 = 1;

        this._loop = !!options.loop;

        this._timeOffset = options.timeOffset || 0;

        /** Adds a target to this Tween
         *
         * Eg: addTarget(4, { "x": 0, "y": 0, "z": -10 });
         */
        this.addTarget = function (time, attr) {

            time += this._timeOffset;

            var name;
            if (this.keys.length == 0) {
                for (name in this.attr) {
                    if (!attr.hasOwnProperty(name)) {
                        throw "Attribute expected on first target: '" + name + "'";
                    }
                }
            }
            this.keys.push(time);
            var targetList;
            for (name in this.attr) {
                if (this.attr.hasOwnProperty(name)) {
                    targetList = this.attrTargetLists[name];
                    if (!targetList) {
                        if (this.keys.length > 1) {
                            throw "First target in tween must contain a value for each animated attribute on target";
                        }
                        targetList = this.attrTargetLists[name] = [];
                    }
                    var val = attr[name];
                    if (val != undefined && val != null) {  // Attribute supplied, push to targets
                        targetList.push(val);
                    } else if (targetList.length > 0) {     // else inherit previous target
                        targetList.push(targetList[targetList.length - 1]);
                    } else {
                        targetList.push(this.attr[name]);   // else start target with initial attribute value
                    }
                }
            }

            /* Find key range
             */
            if (this._firstKey == undefined || this._firstKey > time) {
                this._firstKey = time;
                this._keyDiff = this._lastKey - this._firstKey;
            }
            if (this._lastKey == undefined || this._lastKey < time) {
                this._lastKey = time;
                this._keyDiff = this._lastKey - this._firstKey;
            }

        };

        /**
         * Drives the interpolation factor on this Tween
         *
         * Key is in seconds
         *
         * Eg. update(3.2);
         */
        this.update = function (ctx, time) {

            //   time += this._timeOffset;
            //        if (this._loop) {
            //            time = this._firstKey + (time % this._keyDiff);
            //        }

            var state = this._findEnclosingFrame(time);

            // if (!this._loop) {
            switch (state) {
                case this.STATE_BEFORE:
                    this._clampToFrame(0);
                    return true;

                case this.STATE_AFTER:
                    this._clampToFrame(this.keys.length - 1);
                    return true;
            }
            //  }

            var targetList, u, v, w, offs;
            var val;
            var updated = false;

            for (var name in this.attr) {
                if (this.attr.hasOwnProperty(name)) {
                    targetList = this.attrTargetLists[name];

                    u = this.keys[this._key2] - this.keys[this._key1];
                    v = time - this.keys[this._key1];
                    w = targetList[this._key2] - targetList[this._key1];
                    offs = ((v / u) * w);
                    val = targetList[this._key1] + offs;

                    if (this.attr[name] != val) {
                        this.attr[name] = val;
                        updated = true;
                    }
                }
            }
            return updated;
        };

        this._clampToFrame = function (time) {
            for (var name in this.attr) {
                if (this.attr.hasOwnProperty(name)) {
                    this.attr[name] = this.attrTargetLists[name][time];
                }
            }
        };

        this._findEnclosingFrame = function (time) {
            if (time < this.keys[0]) {
                this._key1 = 0;
                this._key2 = 1;
                return this.STATE_BEFORE;
            }
            if (time > this.keys[this.keys.length - 1]) {
                this._key1 = this.keys.length - 2;
                this._key2 = this._key1 + 1;
                return this.STATE_AFTER;
            }
            while (this.keys[this._key1] > time) {
                this._key1--;
                this._key2--;
            }
            while (this.keys[this._key2] < time) {
                this._key1++;
                this._key2++;
            }
            return this.STATE_RUNNING;
        };
    };


    AttrLerp.prototype.STATE_OUTSIDE = 0;    // Alpha outside of key sequence

    AttrLerp.prototype.STATE_BEFORE = 1;     // Alpha before first key

    AttrLerp.prototype.STATE_AFTER = 2;     // Alpha after last key

    AttrLerp.prototype.STATE_RUNNING = 3;    // Found keys before and after alpha

})();