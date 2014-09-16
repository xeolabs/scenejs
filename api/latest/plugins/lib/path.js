/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * Creates free form 2d path using series of points, lines or curves.
 *
 **/

SceneJS.utils = SceneJS.utils || {};

SceneJS.utils.Path = function (points) {

    THREE.CurvePath.call(this);

    this.actions = [];

    if (points) {
        this.fromPoints(points);
    }
};

SceneJS.utils.Path.prototype = new THREE.CurvePath();
SceneJS.utils.Path.prototype.constructor = SceneJS.utils.Path;


SceneJS.utils.PathActions = {
    MOVE_TO: 'moveTo',
    LINE_TO: 'lineTo',
    QUADRATIC_CURVE_TO: 'quadraticCurveTo', // Bezier quadratic curve
    BEZIER_CURVE_TO: 'bezierCurveTo', 		// Bezier cubic curve
    CSPLINE_THRU: 'splineThru',				// Catmull-rom spline
    ARC: 'arc'								// Circle
};

// Create path using straight lines to connect all points
// - vectors: array of Vector2

SceneJS.utils.Path.prototype.fromPoints = function (vectors) {
    this.moveTo(vectors[ 0 ].x, vectors[ 0 ].y);
    var v, vlen = vectors.length;
    for (v = 1; v < vlen; v++) {
        this.lineTo(vectors[ v ].x, vectors[ v ].y);
    }
};

// startPath() endPath()?

SceneJS.utils.Path.prototype.moveTo = function (x, y) {
    var args = Array.prototype.slice.call(arguments);
    this.actions.push({ action: SceneJS.utils.PathActions.MOVE_TO, args: args });
};

SceneJS.utils.Path.prototype.lineTo = function (x, y) {
    var args = Array.prototype.slice.call(arguments);
    var lastargs = this.actions[ this.actions.length - 1 ].args;
    var x0 = lastargs[ lastargs.length - 2 ];
    var y0 = lastargs[ lastargs.length - 1 ];
    var curve = new THREE.LineCurve([x0, y0], [x, y]);
    this.curves.push(curve);
    this.actions.push({ action: SceneJS.utils.PathActions.LINE_TO, args: args });
};

SceneJS.utils.Path.prototype.quadraticCurveTo = function (aCPx, aCPy, aX, aY) {
    var args = Array.prototype.slice.call(arguments);
    var lastargs = this.actions[ this.actions.length - 1 ].args;
    var x0 = lastargs[ lastargs.length - 2 ];
    var y0 = lastargs[ lastargs.length - 1 ];
    var curve = new THREE.QuadraticBezierCurve([x0, y0], [aCPx, aCPy], [aX, aY));
    this.curves.push(curve);
    this.actions.push({ action: SceneJS.utils.PathActions.QUADRATIC_CURVE_TO, args: args });
};

SceneJS.utils.Path.prototype.bezierCurveTo = function (aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
    var args = Array.prototype.slice.call(arguments);
    var lastargs = this.actions[ this.actions.length - 1 ].args;
    var x0 = lastargs[ lastargs.length - 2 ];
    var y0 = lastargs[ lastargs.length - 1 ];
    var curve = new THREE.CubicBezierCurve(new THREE.Vector2(x0, y0),
        new THREE.Vector2(aCP1x, aCP1y),
        new THREE.Vector2(aCP2x, aCP2y),
        new THREE.Vector2(aX, aY));
    this.curves.push(curve);
    this.actions.push({ action: SceneJS.utils.PathActions.BEZIER_CURVE_TO, args: args });
};

SceneJS.utils.Path.prototype.splineThru = function (pts /*Array of Vector*/) {
    var args = Array.prototype.slice.call(arguments);
    var lastargs = this.actions[ this.actions.length - 1 ].args;
    var x0 = lastargs[ lastargs.length - 2 ];
    var y0 = lastargs[ lastargs.length - 1 ];
//---
    var npts = [ new THREE.Vector2(x0, y0) ];
    Array.prototype.push.apply(npts, pts);
    var curve = new THREE.SplineCurve(npts);
    this.curves.push(curve);
    this.actions.push({ action: SceneJS.utils.PathActions.CSPLINE_THRU, args: args });
};

// FUTURE: Change the API or follow canvas API?
// TODO ARC ( x, y, x - radius, y - radius, startAngle, endAngle )

SceneJS.utils.Path.prototype.arc = function (aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
    var args = Array.prototype.slice.call(arguments);
    var curve = new THREE.ArcCurve(aX, aY, aRadius,
        aStartAngle, aEndAngle, aClockwise);
    this.curves.push(curve);
    // console.log( 'arc', args );
    this.actions.push({ action: SceneJS.utils.PathActions.ARC, args: args });
};


SceneJS.utils.Path.prototype.getSpacedPoints = function (divisions, closedPath) {
    if (!divisions) divisions = 40;
    var points = [];
    for (var i = 0; i < divisions; i++) {
        points.push(this.getPoint(i / divisions));
        //if( !this.getPoint( i / divisions ) ) throw "DIE";

    }

    // if ( closedPath ) {
    //
    // 	points.push( points[ 0 ] );
    //
    // }

    return points;

};

/* Return an array of vectors based on contour of the path */

SceneJS.utils.Path.prototype.getPoints = function (divisions, closedPath) {
    divisions = divisions || 12;
    var points = [];
    var i, il, item, action, args;
    var cpx, cpy, cpx2, cpy2, cpx1, cpy1, cpx0, cpy0,
        laste, j,
        t, tx, ty;

    for (i = 0, il = this.actions.length; i < il; i++) {

        item = this.actions[ i ];
        action = item.action;
        args = item.args;

        switch (action) {

            case SceneJS.utils.PathActions.MOVE_TO:
                break;

            case SceneJS.utils.PathActions.LINE_TO:
                points.push(new THREE.Vector2(args[ 0 ], args[ 1 ]));
                break;

            case SceneJS.utils.PathActions.QUADRATIC_CURVE_TO:
                cpx = args[ 2 ];
                cpy = args[ 3 ];
                cpx1 = args[ 0 ];
                cpy1 = args[ 1 ];
                if (points.length > 0) {
                    laste = points[ points.length - 1 ];
                    cpx0 = laste.x;
                    cpy0 = laste.y;
                } else {
                    laste = this.actions[ i - 1 ].args;
                    cpx0 = laste[ laste.length - 2 ];
                    cpy0 = laste[ laste.length - 1 ];
                }
                for (j = 1; j <= divisions; j++) {
                    t = j / divisions;
                    tx = THREE.Shape.Utils.b2(t, cpx0, cpx1, cpx);
                    ty = THREE.Shape.Utils.b2(t, cpy0, cpy1, cpy);
                    points.push(new THREE.Vector2(tx, ty));
                }
                break;

            case SceneJS.utils.PathActions.BEZIER_CURVE_TO:
                cpx = args[ 4 ];
                cpy = args[ 5 ];
                cpx1 = args[ 0 ];
                cpy1 = args[ 1 ];
                cpx2 = args[ 2 ];
                cpy2 = args[ 3 ];
                if (points.length > 0) {
                    laste = points[ points.length - 1 ];
                    cpx0 = laste.x;
                    cpy0 = laste.y;
                } else {
                    laste = this.actions[ i - 1 ].args;
                    cpx0 = laste[ laste.length - 2 ];
                    cpy0 = laste[ laste.length - 1 ];
                }
                for (j = 1; j <= divisions; j++) {
                    t = j / divisions;
                    tx = THREE.Shape.Utils.b3(t, cpx0, cpx1, cpx2, cpx);
                    ty = THREE.Shape.Utils.b3(t, cpy0, cpy1, cpy2, cpy);
                    points.push(new THREE.Vector2(tx, ty));
                }
                break;

            case SceneJS.utils.PathActions.CSPLINE_THRU:
                laste = this.actions[ i - 1 ].args;
                var last = new THREE.Vector2(laste[ laste.length - 2 ], laste[ laste.length - 1 ]);
                var spts = [ last ];
                var n = divisions * args[ 0 ].length;
                spts = spts.concat(args[ 0 ]);
                var spline = new THREE.SplineCurve(spts);
                for (j = 1; j <= n; j++) {
                    points.push(spline.getPointAt(j / n));
                }
                break;

            case SceneJS.utils.PathActions.ARC:
                laste = this.actions[ i - 1 ].args;
                var aX = args[ 0 ], aY = args[ 1 ],
                    aRadius = args[ 2 ],
                    aStartAngle = args[ 3 ], aEndAngle = args[ 4 ],
                    aClockwise = !!args[ 5 ];
                var lastx = laste[ laste.length - 2 ],
                    lasty = laste[ laste.length - 1 ];
                if (laste.length == 0) {
                    lastx = lasty = 0;
                }
                var deltaAngle = aEndAngle - aStartAngle;
                var angle;
                var tdivisions = divisions * 2;
                var t;
                for (j = 1; j <= tdivisions; j++) {
                    t = j / tdivisions;
                    if (!aClockwise) {
                        t = 1 - t;
                    }
                    angle = aStartAngle + t * deltaAngle;
                    tx = lastx + aX + aRadius * Math.cos(angle);
                    ty = lasty + aY + aRadius * Math.sin(angle);
                    //console.log('t', t, 'angle', angle, 'tx', tx, 'ty', ty);
                    points.push(new THREE.Vector2(tx, ty));
                }
                //console.log(points);
                break;
        } // end switch
    }
    if (closedPath) {
        points.push(points[ 0 ]);
    }
    return points;

};


// This was used for testing purposes. Should be removed soon.

SceneJS.utils.Path.prototype.transform = function (path, segments) {
    var bounds = this.getBoundingBox();
    var oldPts = this.getPoints(segments); // getPoints getSpacedPoints
    //console.log( path.cacheArcLengths() );
    //path.getLengths(400);
    //segments = 40;
    return this.getWrapPoints(oldPts, path);

};

// Read http://www.tinaja.com/glib/nonlingr.pdf
// nonlinear transforms

SceneJS.utils.Path.prototype.nltransform = function (a, b, c, d, e, f) {

    // a - horizontal size
    // b - lean
    // c - x offset
    // d - vertical size
    // e - climb
    // f - y offset

    var oldPts = this.getPoints();
    var i, il, p, oldX, oldY;
    for (i = 0, il = oldPts.length; i < il; i++) {
        p = oldPts[i];
        oldX = p.x;
        oldY = p.y;
        p.x = a * oldX + b * oldY + c;
        p.y = d * oldY + e * oldX + f;
    }
    return oldPts;
};


