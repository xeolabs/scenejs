/**

 Quaternion transformation

 @author xeolabs / http://xeolabs.com

 <p>Usage: </p>
 <pre>

 // Create node
 var myQuaternion = myNode.addNode({
    type: "xform/quaternion",

    // Base rotation
    x : 0.0, y : 0.0, z : 0.0, angle : 0.0,      // No rotation

    // Sequence of rotations to apply on top of the base rotation
    rotations: [
        { x : 0, y : 0, z : 1, angle : 45 }, // Rotate 45 degrees about Z the axis
        { x : 1, y : 0, z : 0, angle : 20 }, // Rotate 20 degrees about X the axis
        { x : 0, y : 1, z : 0, angle : 90 }, // Rotate 90 degrees about Y the axis
    ],

    nodes: [
        // .. Child nodes ...
    ]
 });

 // Add more rotations
 myQuaternion.add("rotation", { x : 0, y : 0, z : 1, angle : 15 });
 myQuaternion.add("rotation", { x : 0, y : 1, z : 0, angle : -55 });

 // Normalize
 myQuaternion.normalize();

 // Query
 var q = myQuaternion.getQuaternion();

 // get matrices
 var worldMat = myQuaternion.getWorldMatrix();
 var modelMat = myQuaternion.getModelMatrix();

 */
SceneJS.Types.addType("xform/quaternion", {

    construct: function (params) {

        this._xform = this.addNode({
            type: "xform",
            nodes: params.nodes
        });

        this._q = SceneJS_math_identityQuaternion();

        if (params.x || params.y || params.x || params.angle || params.w) {
            this.setRotation(params);
        }

        if (params.rotations) {
            for (var i = 0; i < params.rotations.length; i++) {
                this.addRotation(params.rotations[i]);
            }
        }
    },

    setRotation: function (q) {
        q = q || {};
        this._q = SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0);
        this._xform.setElements(SceneJS_math_newMat4FromQuaternion(this._q));
    },

    getRotation: function () {
        return SceneJS_math_angleAxisFromQuaternion(this._q);
    },

    addRotation: function (q) {
        this._q = SceneJS_math_mulQuaternions(SceneJS_math_angleAxisQuaternion(q.x || 0, q.y || 0, q.z || 0, q.angle || 0), this._q);
        this._xform.setElements(SceneJS_math_newMat4FromQuaternion(this._q));
    },

    getModelMatrix: function () {
        return this._xform.getModelMatrix();
    },

    getWorldMatrix: function () {
        return this._xform.getModelMatrix();
    },

    normalize: function () {
        this._q = SceneJS_math_normalizeQuaternion(this._q);
        this._xform.setElements(SceneJS_math_newMat4FromQuaternion(this._q));
    },

    getQuaternion: function () {
        return {
            x: this._q[0],
            y: this._q[1],
            z: this._q[2],
            w: this._q[3]
        };
    }
});
