
function SglPlane3(normal, offset, normalize) {
	this._normal = [ 0.0, 0.0, 1.0 ];
	this._offset = 0.0;

	if (normal && offset) {
		this.setup(normal, offset, normalize);
	}
}

SglPlane3.prototype = {
	get normal() { return this._normal; },
	get offset() { return this._offset; },

	clone : function() {
		return new SglPlane3(this._normal, this._offset, false);
	},

	get copy() {
		return this.clone();
	},

	setup : function(normal, offset, nomalize) {
		this._normal[0] = normal[0];
		this._normal[1] = normal[1];
		this._normal[2] = normal[2];
		this._offset    = offset;

		if (normalize) {
			var s = sglSqrt(
				this._normal[0] * this._normal[0] +
				this._normal[1] * this._normal[1] +
				this._normal[2] * this._normal[2]
			);

			if (s > 0.0) {
				s = 1.0 / s;
				this._normal[0] *= s;
				this._normal[1] *= s;
				this._normal[2] *= s;
				this._offset    *= s;
			}
		}
	}
};
/***********************************************************************/


// SglBox3
/***********************************************************************/
/**
 * Constructs a SglBox3.
 * @class Represents an axis-aligned box in space.
 */
function SglBox3(min, max) {
	this._min = [  1.0,  1.0,  1.0 ];
	this._max = [ -1.0, -1.0, -1.0 ];

	if (min && max) {
		this.setup(min, max);
	}
}

SglBox3.prototype = {
	get min() { return this._min; },
	get max() { return this._max; },

	clone : function() {
		return new SglBox3(this._min, this._max);
	},

	get copy() {
		return this.clone();
	},

	setup : function(min, max) {
		for (var i=0; i<3; ++i) {
			this._min[i] = min[i];
			this._max[i] = max[i];
		}
		return this;
	},

	get isNull() {
		return (this._min[0] > this._max[0]);
	},

	get isEmpty() {
		return (
			   (this._min[0] == this._max[0])
			&& (this._min[1] == this._max[1])
			&& (this._min[2] == this._max[2])
		);
	},

	get center() {
		return [
			(this._max[0] + this._min[0]) / 2.0,
			(this._max[1] + this._min[1]) / 2.0,
			(this._max[2] + this._min[2]) / 2.0
		];
	},

	get size() {
		return [
			(this._max[0] - this._min[0]),
			(this._max[1] - this._min[1]),
			(this._max[2] - this._min[2])
		];
	},

	get facesAreas() {
		var s = this.size;
		return [
			(s[1] * s[2]),
			(s[0] * s[2]),
			(s[0] * s[1])
		];
	},

	get surfaceArea() {
		var a = this.facesArea;
		return ((a[0] + a[1] + a[2]) * 2.0);
	},

	get volume() {
		var s = this.size;
		return (s[0] * s[1] * s[2]);
	},

	offset : function(half_delta) {
		for (var i=0; i<3; ++i) {
			this._min[i] -= half_delta;
			this._max[i] += half_delta;
		}
		return this;
	}
};
/***********************************************************************/


// SglSphere3
/***********************************************************************/
/**
 * Constructs a SglSphere3.
 * @class Represents a sphere in space.
 */
function SglSphere3(center, radius) {
	this._center = [ 0.0, 0.0, 0.0 ];
	this._radius = -1.0;

	if (center && radius) {
		this.setup(center, radius);
	}
}

SglSphere3.prototype = {
	clone : function() {
		return new SglSphere3(this._center, this._radius);
	},

	get copy() {
		return this.clone();
	},

	setup : function(center, radius) {
		this._center[0] = center[0];
		this._center[1] = center[1];
		this._center[2] = center[2];
		this._radius    = radius;
		return this;
	},

	get isNull() {
		return (this._radius < 0.0);
	},

	get isEmpty() {
		return (this._radius == 0.0);
	},

	get surfaceArea() {
		return (4.0 * SGL_PI * this._radius * this._radius);
	},

	get volume() {
		return ((4.0 / 3.0) * SGL_PI * this._radius * this._radius * this._radius);
	}
};
/***********************************************************************/


