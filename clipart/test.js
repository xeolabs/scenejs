/*
 CopperLicht 3D Engine, Copyright by Nikolaus Gebhardt, Ambiera e.U.
 For license details, see www.ambiera.com/copperlicht
 */
function f() {
    return function() {
    }
}
function k(a) {
    return function(b) {
        this[a] = b
    }
}
function l(a) {
    return function() {
        return this[a]
    }
}
function m(a) {
    return function() {
        return a
    }
}
var q;
DebugOutput = function(a) {
    this.pb = null;
    a = document.getElementById(a);
    if (a == null)r = false; else if (this.pb = a.parentNode) {
        this.ub = document.createElement("div");
        this.pb.appendChild(this.ub);
        this.og = a = document.createTextNode("Loading...");
        this.ub.appendChild(a)
    }
};
DebugOutput.prototype.print = function(a) {
    r != false && s(this, a, false)
};
function t(a, b) {
    if (a.ub)if (b == null)a.ub.style.display = "none"; else {
        a.ub.style.display = "block";
        a.og.nodeValue = b
    }
}
function u(a, b) {
    s(a, b, true)
}
function s(a, b, c) {
    if (!(r == false && c != true)) {
        a.pb.appendChild(document.createElement("br"));
        b = document.createTextNode(b);
        a.pb.appendChild(b)
    }
}
var r = true,v = null;
CCFileLoader = function(a) {
    this.Pc = a;
    this.S = false;
    if (!this.S && typeof XMLHttpRequest != "undefined")try {
        this.S = new XMLHttpRequest
    } catch(b) {
        this.S = false
    }
    if (!this.S && window.Zg)try {
        this.S = window.Zg()
    } catch(c) {
        this.S = false
    }
    this.load = function(d) {
        if (this.S == false)u(v, "Your browser doesn't support AJAX"); else {
            var e = this;
            try {
                this.S.open("GET", this.Pc, true)
            } catch(g) {
                u(v, "Could not open file " + this.Pc + ": " + g.message);
                return
            }
            e = this;
            this.S.onreadystatechange = function() {
                if (e.S.readyState == 4) {
                    e.S.status != 200 && e.S.status !=
                                         0 && e.S.status != null && u(v, "Could not open file " + e.Pc + " (status:" + e.S.status + ")");
                    d(e.S.responseText)
                }
            };
            this.S.send(null)
        }
    };
    this.Qi = function(d) {
        alert("loaded :" + d)
    }
};
Core = f();
Core.PI = 3.14159265359;
Core.wi = 1 / 3.14159265359;
Core.si = 1.570796326795;
Core.vi = 3.141592653589793;
Core.ee = 3.14159265359 / 180;
Core.xe = 57.29577951307855;
Core.oa = 1.0E-8;
Core.wc = function(a) {
    return a * Core.xe
};
Core.bf = function(a) {
    return a * Core.ee
};
Core.Ua = function(a) {
    return a < Core.oa && a > -Core.oa
};
Core.Nh = function(a) {
    return a + Core.oa >= 1 && a - Core.oa <= 1
};
Core.s = function(a, b) {
    return a + Core.oa >= b && a - Core.oa <= b
};
Core.Ze = function(a, b, c) {
    if (a < b)return b;
    if (a > c)return c;
    return a
};
Core.ff = function(a) {
    return a - Math.floor(a)
};
Core.Qh = function(a, b, c) {
    if (a > b) {
        if (a > c)return a;
        return c
    }
    if (b > c)return b;
    return c
};
Core.Rh = function(a, b, c) {
    if (a < b) {
        if (a < c)return a;
        return c
    }
    if (b < c)return b;
    return c
};
Core.oh = function(a) {
    return(a & 4278190080) >>> 24
};
Core.xf = function(a) {
    return(a & 16711680) >> 16
};
Core.qf = function(a) {
    return(a & 65280) >> 8
};
Core.kf = function(a) {
    return a & 255
};
Core.Xg = function(a, b, c, d) {
    a &= 255;
    b &= 255;
    c &= 255;
    d &= 255;
    return a << 24 | b << 16 | c << 8 | d
};
function w() {
    return(new Date).getTime()
}
;
Vect3d = function(a, b, c) {
    if (a == null)this.Z = this.Y = this.X = 0; else {
        this.X = a;
        this.Y = b;
        this.Z = c
    }
};
Vect3d.prototype.X = 0;
Vect3d.prototype.Y = 0;
Vect3d.prototype.Z = 0;
function x(a, b, c, d) {
    a.X = b;
    a.Y = c;
    a.Z = d
}
q = Vect3d.prototype;
q.b = function() {
    return new Vect3d(this.X, this.Y, this.Z)
};
q.P = function(a) {
    a.X = this.X;
    a.Y = this.Y;
    a.Z = this.Z
};
q.G = function(a) {
    return new Vect3d(this.X - a.X, this.Y - a.Y, this.Z - a.Z)
};
q.Lb = function(a) {
    this.X -= a.X;
    this.Y -= a.Y;
    this.Z -= a.Z
};
q.add = function(a) {
    return new Vect3d(this.X + a.X, this.Y + a.Y, this.Z + a.Z)
};
q.T = function(a) {
    this.X += a.X;
    this.Y += a.Y;
    this.Z += a.Z
};
q.normalize = function() {
    var a = this.X * this.X + this.Y * this.Y + this.Z * this.Z;
    if (!(a > -1.0E-7 && a < 1.0E-7)) {
        a = 1 / Math.sqrt(a);
        this.X *= a;
        this.Y *= a;
        this.Z *= a
    }
};
q.vh = function() {
    var a = this.X * this.X + this.Y * this.Y + this.Z * this.Z;
    if (a > -1.0E-7 && a < 1.0E-7)return new Vect3d(0, 0, 0);
    a = 1 / Math.sqrt(a);
    return new Vect3d(this.X * a, this.Y * a, this.Z * a)
};
q.Rd = function(a) {
    var b = this.X * this.X + this.Y * this.Y + this.Z * this.Z;
    if (!(b > -1.0E-7 && b < 1.0E-7)) {
        b = a / Math.sqrt(b);
        this.X *= b;
        this.Y *= b;
        this.Z *= b
    }
};
q.Kb = function(a) {
    this.X = a.X;
    this.Y = a.Y;
    this.Z = a.Z
};
q.s = function(a) {
    return Core.s(this.X, a.X) && Core.s(this.Y, a.Y) && Core.s(this.Z, a.Z)
};
q.df = function() {
    return Core.Ua(this.X) && Core.Ua(this.Y) && Core.Ua(this.Z)
};
q.gh = function(a, b, c) {
    return Core.s(this.X, a) && Core.s(this.Y, b) && Core.s(this.Z, c)
};
q.Mh = function() {
    return this.X == 0 && this.Y == 0 && this.Z == 0
};
q.Ta = function() {
    return Math.sqrt(this.X * this.X + this.Y * this.Y + this.Z * this.Z)
};
q.gb = function(a) {
    var b = a.X - this.X,c = a.Y - this.Y;
    a = a.Z - this.Z;
    return Math.sqrt(b * b + c * c + a * a)
};
q.xd = function(a) {
    var b = a.X - this.X,c = a.Y - this.Y;
    a = a.Z - this.Z;
    return b * b + c * c + a * a
};
q.tf = function() {
    return this.X * this.X + this.Y * this.Y + this.Z * this.Z
};
q.z = function(a) {
    return new Vect3d(this.X * a, this.Y * a, this.Z * a)
};
q.ya = function(a) {
    this.X *= a;
    this.Y *= a;
    this.Z *= a
};
q.Sh = function(a) {
    this.X *= a.X;
    this.Y *= a.Y;
    this.Z *= a.Z
};
q.Df = function(a) {
    return new Vect3d(this.X * a.X, this.Y * a.Y, this.Z * a.Z)
};
q.dh = function(a) {
    this.X /= a.X;
    this.Y /= a.Y;
    this.Z /= a.Z
};
q.eh = function(a) {
    return new Vect3d(this.X / a.X, this.Y / a.Y, this.Z / a.Z)
};
q.ia = function(a) {
    return new Vect3d(this.Y * a.Z - this.Z * a.Y, this.Z * a.X - this.X * a.Z, this.X * a.Y - this.Y * a.X)
};
q.ma = function(a) {
    return this.X * a.X + this.Y * a.Y + this.Z * a.Z
};
q.qc = function() {
    var a = new Vect3d;
    a.Y = Core.wc(Math.atan2(this.X, this.Z));
    if (a.Y < 0)a.Y += 360;
    if (a.Y >= 360)a.Y -= 360;
    var b = Math.sqrt(this.X * this.X + this.Z * this.Z);
    a.X = Core.wc(Math.atan2(b, this.Y)) - 90;
    if (a.X < 0)a.X += 360;
    if (a.X >= 360)a.X -= 360;
    return a
};
q.toString = function() {
    return"(x: " + this.X + " y:" + this.Y + " z:" + this.Z + ")"
};
Vect2d = function(a, b) {
    if (a == null)this.Y = this.X = 0; else {
        this.X = a;
        this.Y = b
    }
};
Vect2d.prototype.X = 0;
Vect2d.prototype.Y = 0;
Box3d = function() {
    this.MinEdge = new Vect3d;
    this.MaxEdge = new Vect3d
};
q = Box3d.prototype;
q.MinEdge = null;
q.MaxEdge = null;
q.lf = function() {
    var a = this.MinEdge.add(this.MaxEdge);
    a.ya(0.5);
    return a
};
q.nf = function() {
    return this.MaxEdge.G(this.MinEdge)
};
q.Cf = function(a, b) {
    var c = b.G(a),d = c.Ta();
    c.normalize();
    a = a.add(b).z(0.5);
    b = d * 0.5;
    d = this.nf().z(0.5);
    a = this.lf().G(a);
    if (Math.abs(a.X) > d.X + b * Math.abs(c.X) || Math.abs(a.Y) > d.Y + b * Math.abs(c.Y) || Math.abs(a.Z) > d.Z + b * Math.abs(c.Z))c = false; else {
        b = d.Y * Math.abs(c.Z) + d.Z * Math.abs(c.Y);
        if (Math.abs(a.Y * c.Z - a.Z * c.Y) > b)c = false; else {
            b = d.X * Math.abs(c.Z) + d.Z * Math.abs(c.X);
            if (Math.abs(a.Z * c.X - a.X * c.Z) > b)c = false; else {
                b = d.X * Math.abs(c.Y) + d.Y * Math.abs(c.X);
                c = Math.abs(a.X * c.Y - a.Y * c.X) > b ? false : true
            }
        }
    }
    return c
};
Plane3d = function() {
    this.Normal = new Vect3d(0, 1, 0);
    this.xc(new Vect3d(0, 0, 0))
};
Plane3d.prototype.D = 0;
Plane3d.prototype.Normal = null;
Plane3d.fg = 0;
Plane3d.eg = 1;
Plane3d.gg = 2;
q = Plane3d.prototype;
q.b = function() {
    var a = new Plane3DF(false);
    a.Normal = this.Normal.b();
    a.D = this.D;
    return a
};
q.xc = function(a) {
    this.D = -a.ma(this.Normal)
};
q.th = function() {
    return this.Normal.z(-this.D)
};
q.ii = function(a, b) {
    this.Normal = b.b();
    this.xc(a)
};
q.ji = function(a, b, c) {
    this.Normal = b.G(a).ia(c.G(a));
    this.Normal.normalize();
    this.xc(a)
};
q.normalize = function() {
    var a = 1 / this.Normal.Ta();
    this.Normal = this.Normal.z(a);
    this.D *= a
};
q.Ug = function(a) {
    a = this.Normal.ma(a) + this.D;
    if (a < -1.0E-6)return ISREL3D_BACK;
    if (a > 1.0E-6)return ISREL3D_FRONT;
    return ISREL3D_PLANAR
};
q.rc = function(a, b, c) {
    var d = new Vect3d,e = new Vect3d;
    if (this.sf(a, d, e))return b.rf(d, e, c);
    return false
};
q.sf = function(a, b, c) {
    var d = this.Normal.Ta(),e = this.Normal.ma(a.Normal),g = a.Normal.Ta(),j = d * g - e * e;
    if (Math.abs(j) < 1.0E-8)return false;
    j = 1 / j;
    g = (g * -this.D + e * a.D) * j;
    d = (d * -a.D + e * this.D) * j;
    this.Normal.ia(a.Normal).P(c);
    c = this.Normal.z(g);
    a = a.Normal.z(d);
    c.add(a).P(b);
    return true
};
q.rf = function(a, b, c) {
    var d = this.Normal.ma(b);
    if (d == 0)return false;
    d = -(this.Normal.ma(a) + this.D) / d;
    a.add(b.z(d)).P(c);
    return true
};
q.gb = function(a) {
    return a.ma(this.Normal) + this.D
};
q.Kh = function(a) {
    return this.Normal.ma(a) <= 0
};
Matrix4 = function(a) {
    if (a == null)a = true;
    this.l = this.k = this.j = this.i = this.r = this.e = this.q = this.p = this.o = this.h = this.d = this.g = this.n = this.m = this.f = this.c = 0;
    this.ea = false;
    if (a) {
        this.l = this.e = this.d = this.c = 1;
        this.ea = true
    }
};
Matrix4.prototype.s = function(a) {
    return Core.s(this.c, a.c) && Core.s(this.f, a.f) && Core.s(this.m, a.m) && Core.s(this.n, a.n) && Core.s(this.g, a.g) && Core.s(this.d, a.d) && Core.s(this.h, a.h) && Core.s(this.o, a.o) && Core.s(this.p, a.p) && Core.s(this.q, a.q) && Core.s(this.e, a.e) && Core.s(this.r, a.r) && Core.s(this.i, a.i) && Core.s(this.j, a.j) && Core.s(this.k, a.k) && Core.s(this.l, a.l)
};
function y(a, b) {
    return new Vect3d(b.X * a.c + b.Y * a.g + b.Z * a.p + a.i, b.X * a.f + b.Y * a.d + b.Z * a.q + a.j, b.X * a.m + b.Y * a.h + b.Z * a.e + a.k)
}
function z(a, b) {
    var c = b.X * a.f + b.Y * a.d + b.Z * a.q + a.j,d = b.X * a.m + b.Y * a.h + b.Z * a.e + a.k;
    b.X = b.X * a.c + b.Y * a.g + b.Z * a.p + a.i;
    b.Y = c;
    b.Z = d
}
function C(a, b) {
    var c = new Matrix4(false);
    if (a.ea) {
        b.P(c);
        return c
    }
    if (b.ea) {
        a.P(c);
        return c
    }
    c.c = a.c * b.c + a.g * b.f + a.p * b.m + a.i * b.n;
    c.f = a.f * b.c + a.d * b.f + a.q * b.m + a.j * b.n;
    c.m = a.m * b.c + a.h * b.f + a.e * b.m + a.k * b.n;
    c.n = a.n * b.c + a.o * b.f + a.r * b.m + a.l * b.n;
    c.g = a.c * b.g + a.g * b.d + a.p * b.h + a.i * b.o;
    c.d = a.f * b.g + a.d * b.d + a.q * b.h + a.j * b.o;
    c.h = a.m * b.g + a.h * b.d + a.e * b.h + a.k * b.o;
    c.o = a.n * b.g + a.o * b.d + a.r * b.h + a.l * b.o;
    c.p = a.c * b.p + a.g * b.q + a.p * b.e + a.i * b.r;
    c.q = a.f * b.p + a.d * b.q + a.q * b.e + a.j * b.r;
    c.e = a.m * b.p + a.h * b.q + a.e * b.e + a.k * b.r;
    c.r = a.n * b.p + a.o *
                      b.q + a.r * b.e + a.l * b.r;
    c.i = a.c * b.i + a.g * b.j + a.p * b.k + a.i * b.l;
    c.j = a.f * b.i + a.d * b.j + a.q * b.k + a.j * b.l;
    c.k = a.m * b.i + a.h * b.j + a.e * b.k + a.k * b.l;
    c.l = a.n * b.i + a.o * b.j + a.r * b.k + a.l * b.l;
    return c
}
Matrix4.prototype.b = function() {
    var a = new Matrix4(false);
    this.P(a);
    return a
};
Matrix4.prototype.P = function(a) {
    a.c = this.c;
    a.f = this.f;
    a.m = this.m;
    a.n = this.n;
    a.g = this.g;
    a.d = this.d;
    a.h = this.h;
    a.o = this.o;
    a.p = this.p;
    a.q = this.q;
    a.e = this.e;
    a.r = this.r;
    a.i = this.i;
    a.j = this.j;
    a.k = this.k;
    a.l = this.l;
    a.ea = this.ea
};
function D(a, b, c, d, e) {
    b = 1 / Math.tan(b / 2);
    a.c = b / c;
    a.f = 0;
    a.m = 0;
    a.n = 0;
    a.g = 0;
    a.d = b;
    a.h = 0;
    a.o = 0;
    a.p = 0;
    a.q = 0;
    a.e = e / (e - d);
    a.r = 1;
    a.i = 0;
    a.j = 0;
    a.k = -d * e / (e - d);
    a.l = 0;
    a.ea = false
}
function E(a, b) {
    var c = b.z(Core.ee);
    b = Math.cos(c.X);
    var d = Math.sin(c.X),e = Math.cos(c.Y),g = Math.sin(c.Y),j = Math.cos(c.Z);
    c = Math.sin(c.Z);
    a.c = e * j;
    a.f = e * c;
    a.m = -g;
    var n = d * g;
    g = b * g;
    a.g = n * j - b * c;
    a.d = n * c + b * j;
    a.h = d * e;
    a.p = g * j + d * c;
    a.q = g * c - d * j;
    a.e = b * e;
    a.ea = false
}
function F(a, b) {
    a.i = b.X;
    a.j = b.Y;
    a.k = b.Z;
    a.ea = false
}
function G(a, b) {
    a.c = b.X;
    a.d = b.Y;
    a.e = b.Z;
    a.ea = false
}
;
ViewFrustrum = function() {
    this.J = [];
    for (var a = 0; a < ViewFrustrum.Se; ++a)this.J.push(new Plane3d)
};
ViewFrustrum.prototype.J = null;
ViewFrustrum.hc = 0;
ViewFrustrum.Ng = 1;
ViewFrustrum.ld = 2;
ViewFrustrum.Te = 3;
ViewFrustrum.Re = 4;
ViewFrustrum.md = 5;
ViewFrustrum.Se = 6;
ViewFrustrum.prototype.Qd = function(a) {
    var b;
    b = this.J[ViewFrustrum.ld];
    b.Normal.X = a.n + a.c;
    b.Normal.Y = a.o + a.g;
    b.Normal.Z = a.r + a.p;
    b.D = a.l + a.i;
    b = this.J[ViewFrustrum.Te];
    b.Normal.X = a.n - a.c;
    b.Normal.Y = a.o - a.g;
    b.Normal.Z = a.r - a.p;
    b.D = a.l - a.i;
    b = this.J[ViewFrustrum.md];
    b.Normal.X = a.n - a.f;
    b.Normal.Y = a.o - a.d;
    b.Normal.Z = a.r - a.q;
    b.D = a.l - a.j;
    b = this.J[ViewFrustrum.Re];
    b.Normal.X = a.n + a.f;
    b.Normal.Y = a.o + a.d;
    b.Normal.Z = a.r + a.q;
    b.D = a.l + a.j;
    b = this.J[ViewFrustrum.hc];
    b.Normal.X = a.n - a.m;
    b.Normal.Y = a.o - a.h;
    b.Normal.Z = a.r -
                 a.e;
    b.D = a.l - a.k;
    b = this.J[ViewFrustrum.Ng];
    b.Normal.X = a.m;
    b.Normal.Y = a.h;
    b.Normal.Z = a.e;
    b.D = a.k;
    for (a = a = 0; a < ViewFrustrum.Se; ++a) {
        b = this.J[a];
        var c = -(1 / b.Normal.Ta());
        b.Normal = b.Normal.z(c);
        b.D *= c
    }
};
Vertex3D = function(a) {
    if (a) {
        this.Pos = new Vect3d;
        this.Normal = new Vect3d;
        this.Color = 4294967295;
        this.TCoords = new Vect2d;
        this.TCoords2 = new Vect2d
    }
};
q = Vertex3D.prototype;
q.Pos = null;
q.Normal = null;
q.Color = 0;
q.TCoords = null;
q.TCoords2 = null;
Texture = function() {
    this.Name = "";
    this.Yb = false;
    this.jd = this.Ub = null
};
Action = f();
Action.prototype.execute = f();
Action.me = function() {
    this.ke = false;
    this.gd = null;
    this.aa = false
};
Action.me.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.gd != -1)c = b.na(this.gd);
        if (c)switch (this.ke) {case 0:c.Visible = false;break;case 1:c.Visible = true;break;case 2:c.Visible = !c.Visible;break}
    }
};
Action.ae = function() {
    this.Sa = this.Eb = false
};
Action.ae.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.Ab != -1)c = b.na(this.Ab);
        if (c) {
            var d = null;
            switch (this.Yc) {case 0:d = this.O.b();break;case 1:d = c.Pos.add(this.O);break;case 2:var e = null;if (this.dd)e = a; else if (this.zb != -1)e = b.na(this.zb);if (e)d = e.Pos.add(this.O);break}
            if (d != null)if (this.Eb && this.Sa > 0) {
                a = new AnimatorFlyStraight;
                a.cb = c.Pos.b();
                a.Za = d;
                a.Ra = this.Sa;
                a.Rb = true;
                H(a);
                c.Fb(a)
            } else c.Pos = d
        }
    }
};
Action.be = f();
Action.be.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.Fe != -1)c = b.na(this.Fe);
        if (c)switch (this.Ag) {case 0:c.Rot = this.O.b();break;case 1:c.Rot = c.Rot.add(this.O);break}
    }
};
Action.ce = f();
Action.ce.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.Ge != -1)c = b.na(this.Ge);
        if (c)switch (this.Bg) {case 0:c.Scale = this.O.b();break;case 1:c.Scale = c.Scale.Df(this.O);break}
    }
};
Action.de = f();
Action.de.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.Ee != -1)c = b.na(this.Ee);
        if (c) {
            a = c.getMaterialCount();
            for (b = 0; b < a; ++b)c.getMaterial(b).Tex1 = this.Oe
        }
    }
};
Action.he = f();
Action.he.prototype.execute = function() {
    eval(this.ig)
};
Action.te = f();
Action.te.prototype.execute = function() {
    window.open(this.Pg, this.pa)
};
Action.Je = f();
Action.Je.prototype.execute = f();
Action.Le = k("rb");
Action.Le.prototype.execute = function() {
    this.rb && aa(this.rb, this.Cg, true)
};
Action.He = k("rb");
Action.He.prototype.execute = function(a, b) {
    if (a && b) {
        a = null;
        if (this.$d != -1)a = b.na(this.$d);
        a != null && a.getType() == "camera" && this.rb && ba(this.rb, a)
    }
};
Action.Ie = function() {
    this.Eb = false;
    this.Sa = 0
};
Action.Ie.prototype.execute = function(a, b) {
    if (a && b) {
        var c = null;
        if (this.aa)c = a; else if (this.Ab != -1)c = b.na(this.Ab);
        var d = c;
        if (d.getType() == "camera") {
            var e = d.xa().b();
            switch (this.Yc) {case 0:e = this.O.b();break;case 1:e = c.Pos.add(this.O);break;case 2:var g = null;if (this.dd)g = a; else if (this.zb != -1)g = b.na(this.zb);if (g)e = g.Pos.add(this.O);break}
            if (e != null)if (this.Eb && this.Sa > 0) {
                a = new AnimatorFlyStraight;
                a.cb = d.xa().b();
                a.Za = e;
                a.Ra = this.Sa;
                a.Rb = true;
                a.Ec = true;
                H(a);
                c.Fb(a)
            } else d.Ja(e)
        }
    }
};
ActionHandler = function(a) {
    this.Dc = [];
    this.fd = a
};
ActionHandler.prototype.execute = function(a) {
    for (var b = 0; b < this.Dc.length; ++b)this.Dc[b].execute(a, this.fd)
};
function ca(a, b) {
    b != null && a.Dc.push(b)
}
;
Material = function() {
    this.Type = 0;
    this.va = this.Tex1 = null;
    this.ZWriteEnabled = true;
    this.tb = this.ClampTexture1 = false
};
q = Material.prototype;
q.Qd = function(a) {
    if (a) {
        this.Type = a.Type;
        this.ZWriteEnabled = a.ZWriteEnabled;
        this.Tex1 = a.Tex1;
        this.va = a.va;
        this.ClampTexture1 = a.ClampTexture1;
        this.tb = a.tb
    }
};
q.b = function() {
    var a = new Material;
    a.Type = this.Type;
    a.ZReadEnabled = this.ZReadEnabled;
    a.ZWriteEnabled = this.ZWriteEnabled;
    a.Tex1 = this.Tex1;
    a.va = this.va;
    a.ClampTexture1 = this.ClampTexture1;
    a.tb = this.tb;
    return a
};
q.isTransparent = function() {
    return this.Type == Material.Lc || this.Type == Material.Mc
};
q.Type = 0;
q.Tex1 = null;
q.va = null;
q.ZWriteEnabled = true;
q.ZReadEnabled = true;
q.ClampTexture1 = false;
Material.ge = 0;
Material.qb = 2;
Material.Lc = 12;
Material.Mc = 13;
MeshBuffer = function() {
    this.Box = new Box3d;
    this.Mat = new Material;
    this.Indices = [];
    this.Vertices = [];
    this.RendererNativeArray = null
};
q = MeshBuffer.prototype;
q.Box = null;
q.Mat = null;
q.Indices = null;
q.Vertices = null;
q.RendererNativeArray = null;
q.update = function() {
    this.RendererNativeArray = null
};
Mesh = function() {
    this.Box = new Box3d;
    this.sa = []
};
Mesh.prototype.Xd = function(a) {
    this.sa.push(a)
};
Mesh.prototype.dg = l("sa");
TextureManager = function() {
    this.C = [];
    this.H = null;
    this.Wc = ""
};
TextureManager.prototype.yf = function(a, b) {
    if (a == null || a == "")return null;
    var c = I(this, a);
    if (c != null)return c;
    if (b) {
        c = new Texture;
        c.Name = a;
        da(this, c);
        var d = this;
        c.Ub = new Image;
        c.Ub.onload = function() {
            var e = c,g = d.H;
            if (g != null) {
                gl = g.v;
                var j = gl.ah();
                gl.fb(gl.da, j);
                gl.ni(gl.da, 0, e.Ub);
                gl.Ac(gl.da, gl.Dg, gl.kg);
                gl.Ac(gl.da, gl.Eg, gl.lg);
                gl.lh(gl.da);
                gl.fb(gl.da, null);
                g.Td = true;
                e.jd = j;
                e.Yb = true
            }
        };
        c.Ub.src = c.Name;
        return c
    }
    return null
};
TextureManager.prototype.zf = function() {
    return this.C.length
};
TextureManager.prototype.mf = function() {
    for (var a = 0,b = 0; b < this.C.length; ++b)this.C[b].Yb == false && ++a;
    return a
};
function I(a, b) {
    for (var c = 0; c < a.C.length; ++c) {
        var d = a.C[c];
        if (d.Name == b)return d
    }
    return null
}
function da(a, b) {
    if (b != null) {
        I(a, b.Name) != null && v.print("ERROR! Cannot add the texture multiple times: " + b.Name);
        a.C.push(b)
    }
}
;
BinaryStream = function(a) {
    this.Ve = a;
    this.Qg = a.length;
    this.I = 0;
    this.Ei = null;
    this.Fi = 8;
    this.Ki = false
};
function J(a) {
    return a.Qg - a.I
}
function ea(a, b) {
    return a.Ve.charCodeAt(b) & 255
}
function K(a) {
    return L(a, 1) != 0
}
function N(a, b) {
    for (var c = 0,d = a.I,e = d + b; e > d;)c = c * 256 + ea(a, --e);
    a.I += b;
    return c
}
function L(a, b) {
    a = N(a, b);
    if (a & 1 << b * 8 - 1)a = (~a + 1) * -1;
    return a
}
function O(a) {
    return L(a, 4)
}
function P(a) {
    var b;
    var c = a.Ve,d = a.I;
    b = c.charCodeAt(d + 3) & 255;
    var e = c.charCodeAt(d + 2) & 255,g = c.charCodeAt(d + 1) & 255;
    d = c.charCodeAt(d + 0) & 255;
    c = (b << 1 & 255 | e >> 7) - 127;
    e = (e & 127) << 16 | g << 8 | d;
    b = e == 0 && c == -127 ? 0 : (1 - 2 * (b >> 7)) * (1 + e * Math.pow(2, -23)) * Math.pow(2, c);
    a.I += 4;
    return b
}
;
Renderer = function() {
    this.v = this.canvas = null;
    this.height = this.width = 0;
    this.Td = false;
    this.ca = new Matrix4;
    this.ic = new Matrix4;
    this.kc = new Matrix4;
    this.Si = this.Ti = null;
    this.ra = [];
    this.pd = null
};
Renderer.prototype.Jd = l("width");
function fa(a) {
    var b = a.Td;
    a.Td = false;
    return b
}
q = Renderer.prototype;
q.Gh = l("v");
q.yd = l("height");
q.td = function(a) {
    if (a != null)for (var b = 0; b < a.sa.length; ++b) {
        var c = a.sa[b];
        this.Sd(c.Mat);
        this.ud(c)
    }
};
q.Sd = function(a) {
    if (a != null) {
        var b = this.v;
        if (b != null) {
            var c = null;
            try {
                c = this.ra[a.Type]
            } catch(d) {
            }
            if (c) {
                this.pd = c;
                b.Rf(c);
                if (c.Sg) {
                    b.Ib(b.Fc);
                    b.Ye(c.Tg, c.Rg)
                } else b.qd(b.Fc);
                !a.ZWriteEnabled || a.isTransparent() ? b.nc(false) : b.nc(true);
                a.ZReadEnabled ? b.Ib(b.Ic) : b.qd(b.Ic)
            }
            if (a.Tex1 && a.Tex1.Yb) {
                b.lc(b.Me);
                b.fb(b.da, a.Tex1.jd);
                b.Ac(b.da, b.Fg, a.ClampTexture1 ? b.Yd : b.tg);
                b.Ac(b.da, b.Gg, a.ClampTexture1 ? b.Yd : b.tg)
            } else {
                b.lc(b.Me);
                b.fb(b.da, null)
            }
            c && b.Bc(b.Jb(c, "texture1"), 0);
            if (a.va && a.va.Yb) {
                b.lc(b.Ne);
                b.fb(b.da,
                        a.va.jd)
            } else {
                b.lc(b.Ne);
                b.fb(b.da, null)
            }
            c && b.Bc(b.Jb(c, "texture2"), 1)
        }
    }
};
q.ud = function(a) {
    if (a != null)if (this.v != null) {
        if (a.RendererNativeArray == null) {
            for (var b = this.v,c = {},d = a.Vertices.length,e = new WebGLFloatArray(d * 3),g = new WebGLFloatArray(d * 3),j = new WebGLFloatArray(d * 2),n = new WebGLFloatArray(d * 2),o = 0; o < d; ++o) {
                var p = a.Vertices[o];
                e[o * 3 + 0] = p.Pos.X;
                e[o * 3 + 1] = p.Pos.Y;
                e[o * 3 + 2] = p.Pos.Z;
                g[o * 3 + 0] = p.Normal.X;
                g[o * 3 + 1] = p.Normal.Y;
                g[o * 3 + 2] = p.Normal.Z;
                j[o * 2 + 0] = p.TCoords.X;
                j[o * 2 + 1] = p.TCoords.Y;
                n[o * 2 + 0] = p.TCoords2.X;
                n[o * 2 + 1] = p.TCoords2.Y
            }
            d = a.Indices.length;
            o = new WebGLUnsignedShortArray(d);
            for (p = 0; p < d; p += 3) {
                o[p + 0] = a.Indices[p + 0];
                o[p + 1] = a.Indices[p + 2];
                o[p + 2] = a.Indices[p + 1]
            }
            c.Ff = b.Hb();
            b.ha(b.$, c.Ff);
            b.Gb(b.$, e, b.yb);
            c.Pf = b.Hb();
            b.ha(b.$, c.Pf);
            b.Gb(b.$, j, b.yb);
            c.Qf = b.Hb();
            b.ha(b.$, c.Qf);
            b.Gb(b.$, n, b.yb);
            c.Ef = b.Hb();
            b.ha(b.$, c.Ef);
            b.Gb(b.$, g, b.yb);
            b.ha(b.$, null);
            c.Bf = b.Hb();
            b.ha(b.Sb, c.Bf);
            b.Gb(b.Sb, o, b.yb);
            c.Ih = d;
            b.ha(b.Sb, null);
            a.RendererNativeArray = c
        }
        a = a.RendererNativeArray;
        b = this.v;
        b.oc(0);
        b.oc(1);
        b.oc(2);
        b.oc(3);
        b.ha(b.$, a.Ff);
        b.Cc(0, 3, b.Tb, false, 0, 0);
        b.ha(b.$, a.Pf);
        b.Cc(1, 2, b.Tb,
                false, 0, 0);
        b.ha(b.$, a.Qf);
        b.Cc(2, 2, b.Tb, false, 0, 0);
        b.ha(b.$, a.Ef);
        b.Cc(3, 3, b.Tb, false, 0, 0);
        b.ha(b.Sb, a.Bf);
        c = new Matrix4(false);
        this.ca.P(c);
        c = C(c, this.ic);
        c = C(c, this.kc);
        e = b.Jb(this.pd, "worldviewproj");
        b.oi(e, false, new WebGLFloatArray([c.c,c.f,c.m,c.n,c.g,c.d,c.h,c.o,c.p,c.q,c.e,c.r,c.i,c.j,c.k,c.l]));
        b.fh(b.Hg, a.Ih, b.Kg, 0)
    }
};
q.Xe = function(a) {
    if (this.v != null) {
        if (!(this.canvas == null || this.v == null))if (!(this.width == this.canvas.width && this.height == this.canvas.height)) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            var b = this.v;
            b.Sf && b.Sf(0, 0, this.width, this.height)
        }
        b = this.v;
        b.nc(true);
        b.$e(Core.xf(a) / 255, Core.qf(a) / 255, Core.kf(a) / 255, 1);
        b.clear(b.Wf | b.Zf)
    }
};
q.cf = function() {
    this.v != null && this.v.hh()
};
q.af = f();
q.ga = function(a) {
    this.canvas = a;
    this.v = null;
    try {
        a = ["webgl","experimental-webgl","moz-webgl","webkit-3d","3d"];
        for (var b = 0; b < a.length; b++)try {
            this.v = this.canvas.getContext(a[b]);
            if (this.v != null)break
        } catch(c) {
        }
    } catch(d) {
    }
    if (this.v == null) {
        u(v, "Error: This browser doesn't support a 3d or webGL canvas (or it is disabled).");
        u(v, "See www.ambiera.com/copperlicht/browsersupport.html for details.");
        return false
    } else {
        if (typeof WebGLFloatArray == "undefined")try {
            WebGLArrayBuffer = CanvasArrayBuffer;
            WebGLByteArray =
            CanvasByteArray;
            WebGLUnsignedByteArray = CanvasUnsignedByteArray;
            WebGLShortArray = CanvasShortArray;
            WebGLUnsignedShortArray = CanvasUnsignedShortArray;
            WebGLIntArray = CanvasIntArray;
            WebGLUnsignedIntArray = CanvasUnsignedIntArray;
            WebGLFloatArray = CanvasFloatArray
        } catch(e) {
            u(v, "Error: canvas array types for webgl not found.")
        }
        this.v.getProgramParameter || (this.v.getProgramParameter = this.v.getProgrami);
        this.v.getShaderParameter || (this.v.getShaderParameter = this.v.getShaderi);
        a = this.v;
        a.lc = a.activeTexture;
        a.We = a.attachShader;
        a.Ye = a.blendFunc;
        a.mc = a.bindAttribLocation;
        a.ha = a.bindBuffer;
        a.fb = a.bindTexture;
        a.Gb = a.bufferData;
        a.$e = a.clearColor;
        a.Vg = a.clearDepth;
        a.$g = a.createShader;
        a.Yg = a.createProgram;
        a.Hb = a.createBuffer;
        a.Wg = a.compileShader;
        a.ah = a.createTexture;
        a.bh = a.cullFace;
        a.fh = a.drawElements;
        a.qd = a.disable;
        a.nc = a.depthMask;
        a.Ib = a.enable;
        a.oc = a.enableVertexAttribArray;
        a.lh = a.generateMipmap;
        a.Cc = a.vertexAttribPointer;
        a.hh = a.flush;
        a.yh = a.getProgramParameter;
        a.Ch = a.getShaderParameter;
        a.xh = a.getProgramInfoLog;
        a.Jb = a.getUniformLocation;
        a.Oh = a.linkProgram;
        a.Rf = a.useProgram;
        a.Bc = a.uniform1i;
        a.oi = a.uniformMatrix4fv;
        a.Sf = a.viewport;
        a.mi = a.shaderSource;
        a.ni = a.texImage2D;
        a.Ac = a.texParameteri;
        a.$ = a.ARRAY_BUFFER;
        a.Uf = a.BACK;
        a.Fc = a.BLEND;
        a.Zd = a.COMPILE_STATUS;
        a.Wf = a.COLOR_BUFFER_BIT;
        a.Zd = a.COMPILE_STATUS;
        a.Yd = a.CLAMP_TO_EDGE;
        a.Xf = a.CULL_FACE;
        a.Zf = a.DEPTH_BUFFER_BIT;
        a.Ic = a.DEPTH_TEST;
        a.Sb = a.ELEMENT_ARRAY_BUFFER;
        a.Tb = a.FLOAT;
        a.bg = a.FRAGMENT_SHADER;
        a.kg = a.LINEAR;
        a.lg = a.LINEAR_MIPMAP_NEAREST;
        a.mg = a.LINK_STATUS;
        a.Ci = a.UNSIGNED_BYTE;
        a.Kg = a.UNSIGNED_SHORT;
        a.Mg = a.VERTEX_SHADER;
        a.re = a.ONE_MINUS_SRC_ALPHA;
        a.qg = a.ONE_MINUS_SRC_COLOR;
        a.pg = a.ONE;
        a.De = a.SRC_ALPHA;
        a.yb = a.STATIC_DRAW;
        a.Me = a.TEXTURE0;
        a.Ne = a.TEXTURE1;
        a.da = a.TEXTURE_2D;
        a.Dg = a.TEXTURE_MAG_FILTER;
        a.Eg = a.TEXTURE_MIN_FILTER;
        a.Gg = a.TEXTURE_WRAP_T;
        a.Fg = a.TEXTURE_WRAP_S;
        a.Hg = a.TRIANGLES;
        a = this.v;
        b = Q(this, this.Mb, this.wd);
        var g = Q(this, this.Mb, this.ih),j = Q(this, this.Mb, this.jh),n = Q(this, this.Mb, this.wd, true, a.De, a.re),o = Q(this, this.Mb, this.wd, true, a.pg, a.qg);
        this.ra[Material.ge] = b;
        this.ra[Material.ge +
                1] = b;
        this.ra[Material.qb] = g;
        this.ra[Material.qb + 1] = g;
        this.ra[Material.qb + 2] = g;
        this.ra[Material.qb + 3] = j;
        this.ra[Material.Lc] = o;
        this.ra[Material.Mc] = n;
        a.Rf(b);
        this.pd = b;
        a.$e(0, 0, 1, 1);
        a.Vg(1E4);
        a.nc(true);
        a.Ib(a.Ic);
        a.qd(a.Fc);
        a.Ye(a.De, a.re);
        a.Ib(a.da);
        a.Ib(a.Xf);
        a.bh(a.Uf)
    }
    return true
};
function R(a, b, c) {
    a = a.v;
    b = a.$g(b);
    if (b == null)return null;
    a.mi(b, c);
    a.Wg(b);
    if (!a.Ch(b, a.Zd)) {
        u(v, "Error loading shader: " + a.Oi(b));
        return null
    }
    return b
}
function Q(a, b, c, d, e, g) {
    var j;
    j = a.v;
    b = R(a, j.Mg, b);
    a = R(a, j.bg, c);
    if (!b || !a) {
        v.print("Could not create shader program");
        j = null
    } else {
        c = j.Yg();
        j.We(c, b);
        j.We(c, a);
        j.mc(c, 0, "vPosition");
        j.mc(c, 1, "vTexCoord1");
        j.mc(c, 2, "vTexCoord2");
        j.mc(c, 3, "vNormal");
        j.Bc(j.Jb(c, "texture1"), 0);
        j.Bc(j.Jb(c, "texture2"), 1);
        j.Oh(c);
        j.yh(c, j.mg) || v.print("Could not link program:" + j.xh(c));
        j = c
    }
    if (j) {
        j.Sg = d ? d : false;
        j.Tg = e;
        j.Rg = g
    }
    return j
}
q = Renderer.prototype;
q.Mf = function(a) {
    a.P(this.ca)
};
q.wf = l("ca");
q.Of = function(a) {
    a.P(this.ic)
};
q.Af = l("ic");
q.Hh = l("kc");
q.zc = function(a) {
    a && a.P(this.kc)
};
q.Mb = "\t\t\t\t\tuniform mat4 worldviewproj;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tattribute vec4 vPosition;\t\t\t\t\t\t\t\t\t    attribute vec4 vNormal;\t\t\t\t\t\t\t\t\t\t    attribute vec2 vTexCoord1;\t\t\t\t\t\t\t\t\t\tattribute vec2 vTexCoord2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    varying vec2 v_texCoord1;\t\t\t\t\t\t\t\t\t\tvarying vec2 v_texCoord2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    void main()\t\t\t\t\t\t\t\t\t\t\t\t\t    {\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t        gl_Position = worldviewproj * vPosition;\t\t\t\t        v_texCoord1 = vTexCoord1.st;\t\t\t\t\t\t\t\t\tv_texCoord2 = vTexCoord2.st;\t\t\t\t\t\t\t    }\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
q.wd = "\t\t\t\t\tuniform sampler2D texture1;\t\t\t\t\t\t\t\t\t\tuniform sampler2D texture2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    varying vec2 v_texCoord1;\t\t\t\t\t\t\t\t\t\tvarying vec2 v_texCoord2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    void main()\t\t\t\t\t\t\t\t\t\t\t\t\t    {\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t        vec2 texCoord = vec2(v_texCoord1.s, v_texCoord1.t);\t\t        gl_FragColor = texture2D(texture1, texCoord);\t\t\t    }\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
q.ih = "\t\t\t\t\tuniform sampler2D texture1;\t\t\t\t\t\t\t\t\t\tuniform sampler2D texture2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    varying vec2 v_texCoord1;\t\t\t\t\t\t\t\t\t\tvarying vec2 v_texCoord2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    void main()\t\t\t\t\t\t\t\t\t\t\t\t\t    {\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t        vec2 texCoord1 = vec2(v_texCoord1.s, v_texCoord1.t);\t\t\tvec2 texCoord2 = vec2(v_texCoord2.s, v_texCoord2.t);\t        vec4 col1 = texture2D(texture1, texCoord1);\t\t\t\t\t\tvec4 col2 = texture2D(texture2, texCoord2);\t\t\t\t\t\tgl_FragColor = col1 * col2;\t\t\t\t\t\t\t\t    }\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
q.jh = "\t\t\t\t\tuniform sampler2D texture1;\t\t\t\t\t\t\t\t\t\tuniform sampler2D texture2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    varying vec2 v_texCoord1;\t\t\t\t\t\t\t\t\t\tvarying vec2 v_texCoord2;\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t    void main()\t\t\t\t\t\t\t\t\t\t\t\t\t    {\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t        vec2 texCoord1 = vec2(v_texCoord1.s, v_texCoord1.t);\t\t\tvec2 texCoord2 = vec2(v_texCoord2.s, v_texCoord2.t);\t        vec4 col1 = texture2D(texture1, texCoord1);\t\t\t\t\t\tvec4 col2 = texture2D(texture2, texCoord2);\t\t\t\t\t\tgl_FragColor = col1 * col2 * 3.0;\t\t\t\t\t\t\t    }\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";
function ga(a, b) {
    a = new CopperLicht(a, true);
    a.load(b);
    return a
}
CopperLicht = function(a, b, c) {
    if ((b == null || b == true) && v == null)v = new DebugOutput(a);
    this.ag = a;
    this.Da = document.getElementById(this.ag);
    this.B = new CCDocument;
    this.H = null;
    this.hg = false;
    this.vb = null;
    this.la = new TextureManager;
    this.Zb = false;
    this.le = 0;
    this.ie = 60;
    this.OnLoadingComplete = this.OnAfterDrawAll = this.OnBeforeDrawAll = this.OnAnimate = null;
    this.Vc = false;
    this.oe = this.ne = this.qe = this.pe = 0;
    if (c)this.ie = c;
    var d = this;
    setInterval(function() {
        if (v) {
            ++d.le;
            var e = 0,g = 0;
            if (d.la) {
                e = d.la.mf();
                g = d.la.zf()
            }
            if (d.Zb ||
                e) {
                var j = "Loading";
                if (e > 0)j = "Textures loaded: " + (g - e) + "/" + g;
                switch (d.le % 4) {case 0:j += "   ";break;case 1:j += ".  ";break;case 2:j += ".. ";break;case 3:j += "...";break}
                t(v, j)
            } else t(v, null)
        }
    }, 500)
};
CopperLicht.prototype.Jh = function() {
    return S(this)
};
CopperLicht.prototype.zh = l("H");
CopperLicht.prototype.hb = function() {
    if (this.B == null)return null;
    return this.B.pc()
};
function ha(a) {
    document.onkeydown = function(c) {
        a.handleKeyDown(c)
    };
    document.onkeyup = function(c) {
        a.handleKeyUp(c)
    };
    var b = a.Da;
    if (b != null) {
        b.onmousemove = function(c) {
            a.handleMouseMove(c)
        };
        b.onmousedown = function(c) {
            a.handleMouseDown(c)
        };
        b.onmouseup = function(c) {
            a.handleMouseUp(c)
        }
    }
}
CopperLicht.prototype.load = function(a) {
    if (!S(this))return false;
    var b = this;
    this.Zb = true;
    (new CCFileLoader(a)).load(function(c) {
        b.Md(c, a)
    })
};
function S(a) {
    if (a.zi != null)return true;
    var b = a.Da;
    if (b == null)return false;
    a.H = new Renderer;
    if (a.H.ga(b) == false)return false;
    if (a.la)a.la.H = a.H;
    ha(a);
    setInterval(function() {
        a.sd()
    }, 50 / a.ie);
    return true
}
q = CopperLicht.prototype;
q.Lh = l("Zb");
q.Md = function(a, b) {
    this.Zb = false;
    a = (new FlaceLoader).Ph(a, b, this.la, this);
    if (a != null) {
        this.B = a;
        this.tc(a.pc());
        this.sd();
        this.OnLoadingComplete != null && this.OnLoadingComplete()
    }
};
q.sd = function() {
    if (!(this.B == null || this.H == null)) {
        T(this);
        var a = this.B.pc();
        if (!this.hg && a) {
            this.OnAnimate && this.OnAnimate();
            var b;
            var c = this.H;
            a.ng = c;
            if (a.N = 0)a.N = w();
            a.Ig = null;
            b = a.U.OnAnimate(a, w());
            var d;
            if (a.ka) {
                d = new Matrix4(false);
                a.ka.ca.P(d);
                d = C(d, a.ka.eb);
                d = !d.s(a.sb)
            } else d = true;
            c = c ? fa(c) : false;
            if (a.Qc || a.bc == 0 && (d || c) || a.bc == 1 && (d || b || c) || a.bc == 2) {
                a.Qc = false;
                b = true
            } else b = false;
            if (b) {
                this.H.Xe(a.Ob);
                this.OnBeforeDrawAll && this.OnBeforeDrawAll();
                ia(a, this.H);
                this.OnAfterDrawAll && this.OnAfterDrawAll();
                this.H.cf()
            }
        }
        T(this)
    }
};
q.Bh = function() {
    if (this.B)return this.B.ua;
    return 0
};
q.od = function(a) {
    if (this.B) {
        this.B.ua.push(a);
        this.B.ua.length == 1 && this.B.Jf(a)
    }
};
function aa(a, b, c) {
    if (!a.B)return false;
    var d = a.B.ua;
    b = b;
    if (c)b = b.toLowerCase();
    for (var e = 0; e < d.length; ++e) {
        var g = d[e].Name;
        if (c)g = g.toLowerCase();
        if (b == g) {
            a.tc(d[e]);
            return
        }
    }
}
CopperLicht.prototype.tc = function(a) {
    if (!a)return false;
    var b = a.sc() == "panorama",c = a.sc() == "free",d = null;
    this.B.Jf(a);
    if (a.Ue)a.fa(); else {
        a.Ue = true;
        var e = false,g = a.hf("camera");
        if (g)for (var j = 0; j < g.length; ++j) {
            var n = g[j];
            if (n && n.Wd) {
                d = n;
                e = true;
                break
            }
        }
        if (!e) {
            e = 4 / 3;
            if (this.H.width && this.H.height)e = this.H.width / this.H.height;
            d = new CameraSceneNode;
            d.If(e);
            a.U.wa(d);
            e = null;
            if (!b) {
                e = new AnimatorCameraFPS(d, this);
                d.Fb(e)
            }
            if (c) {
                if (a.Jc != null)d.Pos = a.Jc.b();
                if (a.Qb != null)e != null ? e.Ld(a.Qb) : d.Ja(a.Qb)
            }
            e && ja(e,
                    !b)
        }
        a.yc(d)
    }
    a.Nf(this.B.Lg);
    a.ef();
    return true
};
function T(a) {
    if (a.vb != null) {
        var b = a.B.pc();
        if (b != null)if (a.vb.R === b) {
            b.yc(a.vb);
            a.vb = null
        }
    }
}
q = CopperLicht.prototype;
q.handleKeyDown = function(a) {
    var b = this.hb();
    if (b != null) {
        b = b.fa();
        b != null && b.onKeyDown(a)
    }
};
q.handleKeyUp = function(a) {
    var b = this.hb();
    if (b != null) {
        b = b.fa();
        b != null && b.onKeyUp(a)
    }
};
q.handleMouseDown = function(a) {
    this.Vc = true;
    if (a) {
        this.ne = a.clientX - this.Da.offsetLeft + document.body.scrollLeft;
        this.oe = a.clientY - this.Da.offsetTop + document.body.scrollTop
    }
    var b = this.hb();
    if (b != null) {
        var c = b.fa();
        c != null && c.onMouseDown(a);
        for (c = 0; c < b.Oa.length; ++c)b.Oa[c].onMouseDown(a)
    }
};
q.Bd = l("pe");
q.Cd = l("qe");
q.vc = l("Vc");
q.zd = l("ne");
q.Ad = l("oe");
q.handleMouseUp = function(a) {
    this.Vc = false;
    var b = this.hb();
    if (b != null) {
        var c = b.fa();
        c != null && c.onMouseUp(a);
        for (c = 0; c < b.Oa.length; ++c)b.Oa[c].onMouseUp(a)
    }
};
q.handleMouseMove = function(a) {
    if (a) {
        this.pe = a.clientX - this.Da.offsetLeft + document.body.scrollLeft;
        this.qe = a.clientY - this.Da.offsetTop + document.body.scrollTop
    }
    var b = this.hb();
    if (b != null) {
        b = b.fa();
        b != null && b.onMouseMove(a)
    }
};
q.OnAnimate = null;
q.OnAfterDrawAll = null;
q.OnBeforeDrawAll = null;
q.OnLoadingComplete = null;
q.gf = function(a, b) {
    var c = this.H;
    if (c == null)return null;
    var d = c.wf(),e = c.Af();
    if (d == null || e == null)return null;
    d = C(d, e);
    var g = new ViewFrustrum;
    g.Qd(d);
    d = new Vect3d;
    g.J[ViewFrustrum.hc].rc(g.J[ViewFrustrum.md], g.J[ViewFrustrum.ld], d);
    e = new Vect3d;
    g.J[ViewFrustrum.hc].rc(g.J[ViewFrustrum.md], g.J[ViewFrustrum.Te], e);
    e = e.G(d);
    var j = new Vect3d;
    g.J[ViewFrustrum.hc].rc(g.J[ViewFrustrum.Re], g.J[ViewFrustrum.ld], j);
    g = j.G(d);
    j = c.Jd();
    c = c.yd();
    b = b / c;
    return d.add(e.z(a / j)).add(g.z(b))
};
q.mh = function(a) {
    var b = new Matrix4(false),c = this.H;
    if (!c.ca)return null;
    c.ca.P(b);
    b = C(b, c.ic);
    var d = c.Jd() / 2;
    c = c.yd() / 2;
    if (c == 0 || d == 0)return null;
    a = new Vect3d(a.X, a.Y, a.Z);
    a.W = 1;
    b = b;
    var e = a.b();
    e.jc = a.W;
    a.X = e.X * b.c + e.Y * b.g + e.Z * b.p + e.jc * b.i;
    a.Y = e.X * b.f + e.Y * b.d + e.Z * b.q + e.jc * b.j;
    a.Z = e.X * b.m + e.Y * b.h + e.Z * b.e + e.jc * b.k;
    a.W = e.X * b.n + e.Y * b.o + e.Z * b.r + e.jc * b.l;
    b = a.W == 0 ? 1 : 1 / a.W;
    if (a.Z < 0)return null;
    e = new Vect2d;
    e.X = d * a.X * b + d;
    e.Y = c - c * a.Y * b;
    return e
};
function ba(a, b) {
    if (b != null)a.vb = b
}
CopperLicht.prototype.Eh = l("la");
SceneNode = function() {
    this.Type = -1;
    this.Pos = new Vect3d;
    this.Rot = new Vect3d;
    this.Scale = new Vect3d(1, 1, 1);
    this.Visible = true;
    this.Name = "";
    this.qa = 0;
    this.Id = -1;
    this.Parent = null;
    this.L = [];
    this.A = [];
    this.K = new Matrix4;
    this.Bi = this.R = null
};
q = SceneNode.prototype;
q.ga = function() {
    this.Pos = new Vect3d;
    this.Rot = new Vect3d;
    this.Scale = new Vect3d(1, 1, 1);
    this.L = [];
    this.A = [];
    this.K = new Matrix4
};
q.Pos = null;
q.Rot = null;
q.Scale = null;
q.Visible = true;
q.Name = "";
q.Id = -1;
q.Parent = null;
q.wh = l("Parent");
q.getType = m("none");
q.getBoundingBox = function() {
    return new Box3d
};
q.ph = l("A");
q.jf = function(a) {
    for (i = 0; i < this.A.length; ++i) {
        var b = this.A[i];
        if (b.getType() == a)return b
    }
    return null
};
q.Fh = function() {
    var a = getBoundingBox().b(),b = a.Ni(),c;
    for (c = 0; c < 8; ++c)transformVect(b[c]);
    a.Ui(b[0]);
    for (c = 1; c < 8; ++c)a.Gi(b[c]);
    return a
};
function U(a, b, c) {
    b.Name = new String(Name);
    b.Visible = a.Visible;
    b.qa = a.qa;
    b.Pos = a.Pos.b();
    b.Rot = a.Rot.b();
    b.Scale = a.Scale.b();
    b.Type = a.Type;
    b.Parent = c;
    for (c = 0; c < a.L.Pi; ++c) {
        var d = a.L[c];
        if (d) {
            d = d.createClone(b);
            d != null && b.wa(d)
        }
    }
    b.A = a.A.slice();
    if (a.K)b.K = a.K.b();
    b.R = a.R
}
q = SceneNode.prototype;
q.createClone = m(null);
q.Fb = function(a) {
    a != null && this.A.push(a)
};
q.Hf = function(a) {
    if (a != null) {
        var b;
        for (b = 0; b < this.A.length; ++b)if (this.A[b] === a) {
            this.A.splice(b, 1);
            return
        }
    }
};
q.wa = function(a) {
    if (a) {
        a.R = this.R;
        a.Parent && a.Parent.removeChild(a);
        a.Parent = this;
        this.L.push(a)
    }
};
q.removeChild = function(a) {
    for (var b = 0; b < this.L.length; ++b)if (this.L[b] === a) {
        a.Parent = null;
        this.L.splice(b, 1);
        return
    }
};
q.OnRegisterSceneNode = function(a) {
    if (this.Visible)for (var b = 0; b < this.L.length; ++b)this.L[b].OnRegisterSceneNode(a)
};
q.OnAnimate = function(a, b) {
    var c = false;
    if (this.Visible) {
        var d,e = this.A.length;
        for (d = 0; d < e;) {
            c = this.A[d].animateNode(this, b) || c;
            var g = e;
            e = this.A.length;
            g >= e && ++d
        }
        this.Aa();
        for (d = 0; d < this.L.length; ++d)c = this.L[d].OnAnimate(a, b) || c
    }
    return c
};
q.Ed = function() {
    var a = new Matrix4;
    E(a, this.Rot);
    F(a, this.Pos);
    if (this.Scale.X != 1 || this.Scale.Y != 1 || this.Scale.Z != 1) {
        var b = new Matrix4;
        G(b, this.Scale);
        a = C(a, b)
    }
    return a
};
q.Aa = function() {
    this.K = this.Parent != null ? C(this.Parent.K, this.Ed()) : this.Ed()
};
q.render = f();
q.nh = l("K");
q.ja = function() {
    return new Vect3d(this.K.i, this.K.j, this.K.k)
};
q.getMaterialCount = m(0);
q.getMaterial = m(null);
CameraSceneNode = function() {
    this.ga();
    this.Box = new Box3d;
    this.Wd = this.Ya = false;
    this.pa = new Vect3d(0, 0, 10);
    this.Ga = new Vect3d(0, 1, 0);
    this.ca = new Matrix4;
    this.eb = new Matrix4;
    this.Ca = Core.PI / 2.5;
    this.Ba = 4 / 3;
    this.Ia = 0.1;
    this.Ha = 3E3;
    D(this.ca, this.Ca, this.Ba, this.Ia, this.Ha)
};
CameraSceneNode.prototype = new SceneNode;
function V(a) {
    D(a.ca, a.Ca, a.Ba, a.Ia, a.Ha)
}
q = CameraSceneNode.prototype;
q.getType = m("camera");
q.If = function(a) {
    if (!Core.s(this.Ba, a)) {
        this.Ba = a;
        V(this)
    }
};
q.qh = l("Ba");
q.pf = l("Ca");
q.Kf = function(a) {
    if (!Core.s(this.Ca, a)) {
        this.Ca = a;
        V(this)
    }
};
q.Ja = function(a) {
    if (a)this.pa = a.b()
};
q.xa = l("pa");
q.Hd = l("Ga");
q.li = function(a) {
    if (a)this.Ga = a.b()
};
q.uf = l("Ia");
q.gi = function(a) {
    if (!Core.s(this.Ia, a)) {
        this.Ia = a;
        V(this)
    }
};
q.of = l("Ha");
q.di = function(a) {
    if (!Core.s(this.Ha, a)) {
        this.Ha = a;
        V(this)
    }
};
q.OnAnimate = function(a, b) {
    a = SceneNode.prototype.OnAnimate.call(this, a, b);
    b = this.ja();
    var c = this.pa.b();
    if (b.s(c))c.X += 1;
    b = this.eb;
    var d = this.Pos,e = this.Ga;
    c = c.G(d);
    c.normalize();
    e = e.ia(c);
    e.normalize();
    var g = c.ia(e);
    b.c = e.X;
    b.f = g.X;
    b.m = c.X;
    b.n = 0;
    b.g = e.Y;
    b.d = g.Y;
    b.h = c.Y;
    b.o = 0;
    b.p = e.Z;
    b.q = g.Z;
    b.e = c.Z;
    b.r = 0;
    b.i = -e.ma(d);
    b.j = -g.ma(d);
    b.k = -c.ma(d);
    b.l = 1;
    b.ea = false;
    return a
};
q.OnRegisterSceneNode = function(a) {
    if (a.fa() === this) {
        a.Wa(this, 2);
        SceneNode.prototype.OnRegisterSceneNode.call(this, a)
    }
};
q.render = function(a) {
    a.Mf(this.ca);
    a.Of(this.eb)
};
q.onMouseDown = function(a) {
    for (var b = 0; b < this.A.length; ++b)this.A[b].onMouseDown(a)
};
q.onMouseUp = function(a) {
    for (var b = 0; b < this.A.length; ++b)this.A[b].onMouseUp(a)
};
q.onMouseMove = function(a) {
    for (var b = 0; b < this.A.length; ++b)this.A[b].onMouseMove(a)
};
q.onKeyDown = function(a) {
    for (var b = 0; b < this.A.length; ++b)this.A[b].onKeyDown(a)
};
q.onKeyUp = function(a) {
    for (var b = 0; b < this.A.length; ++b)this.A[b].onKeyUp(a)
};
q.createClone = function(a) {
    var b = new CameraSceneNode;
    cloneMembers(b, a);
    if (Target)b.pa = this.pa.b();
    if (UpVector)b.Ga = this.Ga.b();
    if (Projection)b.ca = this.ca.b();
    if (ViewMatrix)b.eb = this.eb.b();
    b.Ca = this.Ca;
    b.Ba = this.Ba;
    b.Ia = this.Ia;
    b.Ha = this.Ha;
    if (Box)b.Box = this.Box.b();
    return b
};
MeshSceneNode = function() {
    this.ga();
    this.Box = new Box3d;
    this.Ya = false;
    this.Q = null;
    this.xi = true
};
MeshSceneNode.prototype = new SceneNode;
q = MeshSceneNode.prototype;
q.getBoundingBox = l("Box");
q.uh = l("Q");
q.ei = k("Q");
q.getType = m("mesh");
q.OnRegisterSceneNode = function(a) {
    var b = this.Q;
    if (this.Visible && b) {
        for (var c = false,d = false,e = 0; e < b.sa.length; ++e)if (b.sa[e].Mat.isTransparent())c = true; else d = true;
        c && a.Wa(this, Scene.wb);
        d && a.Wa(this, Scene.ab);
        SceneNode.prototype.OnRegisterSceneNode.call(this, a)
    }
};
q.render = function(a) {
    a.zc(this.K);
    a.td(this.Q)
};
q.getMaterialCount = function() {
    if (this.Q)return this.Q.sa.length;
    return 0
};
q.getMaterial = function(a) {
    if (this.Q != null)if (a >= 0 && a < this.Q.sa.length)return this.Q.sa[a].Mat;
    return null
};
q.createClone = function(a) {
    var b = new MeshSceneNode;
    U(this, b, a);
    if (OwnedMesh)b.Q = this.Q.b();
    b.cd = this.cd;
    b.Ya = this.Ya;
    if (this.Box)b.Box = this.Box.b();
    return b
};
SkyBoxSceneNode = f();
SkyBoxSceneNode.prototype = new MeshSceneNode;
SkyBoxSceneNode.prototype.OnRegisterSceneNode = function(a) {
    if (this.Visible) {
        a.Wa(this, 1);
        SceneNode.prototype.OnRegisterSceneNode.call(this, a)
    }
};
SkyBoxSceneNode.prototype.render = function(a) {
    var b = this.R.fa();
    if (b && this.Q) {
        var c = new Matrix4(false);
        this.K.P(c);
        F(c, b.ja());
        b = (b.uf() + b.of()) * 0.5;
        var d = new Matrix4;
        G(d, new Vect3d(b, b, b));
        a.zc(C(c, d));
        a.td(this.Q)
    }
};
SkyBoxSceneNode.prototype.createClone = function(a) {
    var b = new SkyBoxSceneNode;
    U(this, b, a);
    if (OwnedMesh)b.Q = this.Q.b();
    b.cd = this.cd;
    b.Ya = this.Ya;
    if (this.Box)b.Box = this.Box.b();
    return b
};
BillboardSceneNode = function() {
    this.ga();
    this.Box = new Box3d;
    this.Pa = this.bb = 10;
    this.Vb = false;
    this.Fa = new MeshBuffer;
    this.kb = new Vertex3D(true);
    this.lb = new Vertex3D(true);
    this.mb = new Vertex3D(true);
    this.nb = new Vertex3D(true);
    var a = this.Fa.Indices;
    a.push(0);
    a.push(2);
    a.push(1);
    a.push(0);
    a.push(3);
    a.push(2);
    a = this.Fa.Vertices;
    a.push(this.kb);
    a.push(this.lb);
    a.push(this.mb);
    a.push(this.nb);
    this.kb.TCoords.X = 1;
    this.kb.TCoords.Y = 1;
    this.lb.TCoords.X = 1;
    this.lb.TCoords.Y = 0;
    this.mb.TCoords.X = 0;
    this.mb.TCoords.Y =
    0;
    this.nb.TCoords.X = 0;
    this.nb.TCoords.Y = 1
};
BillboardSceneNode.prototype = new SceneNode;
q = BillboardSceneNode.prototype;
q.getBoundingBox = l("Box");
q.getType = m("billboard");
q.OnRegisterSceneNode = function(a) {
    if (this.Visible) {
        a.Wa(this, this.Fa.Mat.isTransparent() ? Scene.wb : Scene.ab);
        SceneNode.prototype.OnRegisterSceneNode.call(this, a)
    }
};
q.render = function(a) {
    var b = this.R.fa();
    if (b) {
        var c = this.ja(),d = b.ja(),e = b.xa();
        b = b.Hd();
        d = e.G(d);
        d.normalize();
        e = b.ia(d);
        e.tf() == 0 && x(e, b.Y, b.X, b.Z);
        e.normalize();
        e.ya(0.5 * this.bb);
        b = e.ia(d);
        b.normalize();
        b.ya(0.5 * this.Pa);
        this.Vb && x(b, 0, -0.5 * this.Pa, 0);
        d.ya(1);
        this.kb.Pos.Kb(c);
        this.kb.Pos.T(e);
        this.kb.Pos.T(b);
        this.lb.Pos.Kb(c);
        this.lb.Pos.T(e);
        this.lb.Pos.Lb(b);
        this.mb.Pos.Kb(c);
        this.mb.Pos.Lb(e);
        this.mb.Pos.Lb(b);
        this.nb.Pos.Kb(c);
        this.nb.Pos.Lb(e);
        this.nb.Pos.T(b);
        this.Fa.update();
        c = new Matrix4(true);
        a.zc(c);
        a.Sd(this.Fa.Mat);
        a.ud(this.Fa)
    }
};
q.getMaterialCount = m(1);
q.getMaterial = function() {
    return this.Fa.Mat
};
q.createClone = function(a) {
    var b = new BillboardSceneNode;
    U(this, b, a);
    if (this.Box)b.Box = this.Box.b();
    b.bb = this.bb;
    b.Pa = this.Pa;
    b.Vb = this.Vb;
    return b
};
q.Dh = function() {
    return new Vect2d(this.bb, this.Pa)
};
q.ki = function(a, b) {
    this.bb = a;
    this.Pa = b
};
PathSceneNode = function() {
    this.ga();
    this.Box = new Box3d;
    this.Tightness = 0;
    this.IsClosedCircle = false;
    this.Nodes = []
};
PathSceneNode.prototype = new SceneNode;
q = PathSceneNode.prototype;
q.Tightness = 0;
q.IsClosedCircle = false;
q.Nodes = [];
q.getBoundingBox = l("Box");
q.getType = m("path");
q.createClone = function(a) {
    var b = new PathSceneNode;
    U(this, b, a);
    if (this.Box)b.Box = this.Box.b();
    b.Tightness = this.Tightness;
    b.IsClosedCircle = this.IsClosedCircle;
    b.Nodes = [];
    for (a = 0; a < this.Nodes.length; ++a)b.Nodes.push(this.Nodes[a].b());
    return b
};
q.vf = function(a) {
    if (a < 0 || a >= this.Nodes.length)return new Vect3d(0, 0, 0);
    this.K || updateAbsolutePosition();
    a = this.Nodes[a];
    a = a.b();
    z(this.K, a);
    return a
};
function W(a, b, c) {
    if (a.IsClosedCircle)return b < 0 ? c + b : b >= c ? b - c : b;
    return b < 0 ? 0 : b >= c ? c - 1 : b
}
PathSceneNode.prototype.Dd = function(a, b) {
    var c = this.Nodes.length;
    if (this.IsClosedCircle)a *= c; else {
        a = Core.Ze(a, 0, 1);
        a *= c - 1
    }
    var d = new Vect3d;
    if (c == 0)return d;
    if (c == 1)return d;
    a = a;
    var e = Core.ff(a),g = Math.floor(a) % c,j = this.Nodes[W(this, g - 1, c)];
    d = this.Nodes[W(this, g + 0, c)];
    a = this.Nodes[W(this, g + 1, c)];
    var n = this.Nodes[W(this, g + 2, c)],o = 2 * e * e * e - 3 * e * e + 1;
    c = -2 * e * e * e + 3 * e * e;
    g = e * e * e - 2 * e * e + e;
    e = e * e * e - e * e;
    j = a.G(j);
    j.ya(this.Tightness);
    n = n.G(d);
    n.ya(this.Tightness);
    d = d.z(o);
    d.T(a.z(c));
    d.T(j.z(g));
    d.T(n.z(e));
    if (!b) {
        this.K ||
        this.Aa();
        z(this.K, d)
    }
    return d
};
Scene = function() {
    this.U = new SceneNode;
    this.U.R = this;
    this.Name = "";
    this.Ob = 0;
    this.ng = null;
    this.N = 0;
    this.ka = null;
    this.Qc = false;
    this.sb = new Matrix4;
    this.Ig = null;
    this.bc = 2;
    this.La = 0;
    this.dc = [];
    this.Bb = [];
    this.Xb = [];
    this.$b = [];
    this.Oa = [];
    this.Ue = false
};
Scene.prototype.ga = function() {
    this.U = new SceneNode;
    this.U.R = this;
    this.Name = "";
    this.sb = new Matrix4
};
Scene.prototype.sc = m("unknown");
Scene.prototype.sh = l("La");
function ia(a, b) {
    a.dc = [];
    a.Bb = [];
    a.Xb = [];
    a.$b = [];
    a.U.OnRegisterSceneNode(a);
    a.La = Scene.$c;
    var c = null;
    if (a.ka) {
        c = a.ka.ja();
        a.ka.render(b)
    }
    a.La = Scene.bd;
    a.Ke && a.Ke.render(b);
    b.af();
    var d;
    a.La = Scene.ab;
    for (d = 0; d < a.Xb.length; ++d)a.Xb[d].render(b);
    a.La = Scene.ad;
    for (d = 0; d < a.dc.length; ++d)a.dc[d].render(b);
    a.La = Scene.wb;
    c != null && a.Bb.sort(function(e, g) {
        e = c.xd(e.ja());
        g = c.xd(g.ja());
        if (e < g)return 1;
        if (e > g)return-1;
        return 0
    });
    for (d = 0; d < a.Bb.length; ++d)a.Bb[d].render(b);
    a.La = Scene.Zc;
    for (d = 0; d < a.$b.length; ++d)a.$b[d].render(b);
    ka(a)
}
function ka(a) {
    if (a.ka) {
        a.ka.ca.P(a.sb);
        a.sb = C(a.sb, a.ka.eb)
    }
}
q = Scene.prototype;
q.ci = k("Ob");
q.rh = l("Ob");
q.getName = l("Name");
q.fi = k("Name");
q.Nf = k("bc");
q.yc = k("ka");
q.fa = l("ka");
q.ef = function() {
    this.Qc = true
};
q.Gd = l("N");
q.Wa = function(a, b) {
    if (b == null)b = Scene.ab;
    switch (b) {case Scene.bd:this.Ke = a;break;case Scene.ab:this.dc.push(a);break;case Scene.ad:this.Xb.push(a);break;case Scene.$c:break;case Scene.wb:this.Bb.push(a);break;case Scene.Zc:this.$b.push(a);break}
};
q.hf = function(a) {
    if (this.U == null)return null;
    var b = [];
    X(this, this.U, a, b);
    return b
};
function X(a, b, c, d) {
    b.getType() == c && d.push(b);
    for (var e = 0; e < b.L.length; ++e)X(a, b.L[e], c, d)
}
Scene.prototype.Fd = function(a) {
    if (this.U == null)return null;
    return Y(this, this.U, a)
};
function Y(a, b, c) {
    if (b.Name == c)return b;
    for (var d = 0; d < b.L.length; ++d) {
        var e = Y(a, b.L[d], c);
        if (e)return e
    }
    return null
}
Scene.prototype.na = function(a) {
    if (this.U == null)return null;
    return Z(this, this.U, a)
};
function Z(a, b, c) {
    if (b.Id == c)return b;
    for (var d = 0; d < b.L.length; ++d) {
        var e = Z(a, b.L[d], c);
        if (e)return e
    }
    return null
}
Scene.prototype.Ah = l("U");
Scene.rg = 2;
Scene.sg = 1;
Scene.ye = 2;
Scene.bd = 1;
Scene.ab = 0;
Scene.ad = 2;
Scene.$c = 3;
Scene.wb = 4;
Scene.Zc = 5;
PanoramaScene = function() {
    this.ga()
};
PanoramaScene.prototype = new Scene;
PanoramaScene.prototype.sc = m("panorama");
Free3dScene = function() {
    this.ga();
    this.Jc = new Vect3d;
    this.Qb = new Vect3d
};
Free3dScene.prototype = new Scene;
Free3dScene.prototype.sc = m("free");
FlaceLoader = function() {
    this.a = this.B = null;
    this.je = "";
    this.ba = 0;
    this.F = this.la = null;
    this.Wc = "";
    this.Ph = function(a, b, c, d) {
        this.je = b;
        this.la = c;
        this.F = d;
        if (a.length == 0) {
            u(v, "Error: Could not load file '" + b + "'");
            return null
        }
        if (b.indexOf(".ccbjs"))a = base64decode(a);
        this.B = b = new CCDocument;
        c = this.je;
        d = c.lastIndexOf("/");
        if (d != -1)c = c.substring(0, d + 1);
        this.Wc = c;
        this.a = new BinaryStream(a);
        if (!this.Md())return null;
        return b
    };
    this.Md = function() {
        if (O(this.a) != 1701014630)return false;
        O(this.a);
        N(this.a, 4);
        for (var a =
                0; J(this.a) > 0;) {
            var b = this.V();
            ++a;
            if (a == 1 && b != 1)return false;
            switch (b) {case 1:this.Th();break;case 12:this.w();break;default:this.w()}
        }
        return true
    };
    this.w = function() {
        this.a.I = 0 + this.ba
    };
    this.V = function() {
        var a = 0;
        a = N(this.a, 2);
        var b = 0;
        this.Pb = b = N(this.a, 4);
        this.ba = this.a.I + b;
        return a
    };
    this.M = function() {
        var a = N(this.a, 4);
        if (a > 104857600)return"";
        if (a <= 0)return"";
        for (var b = [],c = 0; c < a; ++c) {
            var d = N(this.a, 1);
            d != 0 && b.push(String.fromCharCode(d))
        }
        return b.join("")
    };
    this.Th = function() {
        for (var a = this.ba; J(this.a) >
                              0 && this.a.I < a;)switch (this.V()) {case 1004:this.B.ob = O(this.a);break;case 20:this.ai();break;case 2:var b = null;switch (O(this.a)) {case 0:b = new Free3dScene;this.Yh(b);break;case 1:b = new PanoramaScene;this.$h(b);break;default:this.w()}this.B.od(b);break;default:this.w()}
    };
    this.ai = function() {
        O(this.a);
        this.B.Tf = this.M();
        for (var a = this.ba; J(this.a) > 0 && this.a.I < a;)switch (this.V()) {case 21:this.w();break;case 22:this.w();break;default:this.w()}
    };
    this.Yh = function(a) {
        var b = this.ba;
        for (this.bi(a); J(this.a) >
                         0 && this.a.I < b;)switch (this.V()) {case 1007:a.Jc = this.t();a.Qb = this.t();break;case 8:this.zg(a);break;default:this.w()}
    };
    this.$h = function() {
        this.w()
    };
    this.t = function() {
        var a = new Vect3d;
        a.X = P(this.a);
        a.Y = P(this.a);
        a.Z = P(this.a);
        return a
    };
    this.xb = function() {
        var a = new Vect2d;
        a.X = P(this.a);
        a.Y = P(this.a);
        return a
    };
    this.Na = function() {
        var a = new Box3d;
        a.MinEdge = this.t();
        a.MaxEdge = this.t();
        return a
    };
    this.bi = function(a) {
        if (this.V() == 26) {
            a.Name = this.M();
            a.Ob = O(this.a)
        } else this.jg()
    };
    this.jg = function() {
        this.a.position -=
        10
    };
    this.zg = function(a) {
        for (var b = this.ba; J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 9:this.Ce(a, a.U, 0);break;default:this.w()}
    };
    this.Ce = function(a, b, c) {
        if (b != null) {
            var d = this.ba,e = O(this.a),g = O(this.a),j = this.M(),n = this.t(),o = this.t(),p = this.t(),A = K(this.a),B = O(this.a),h = null,M = 0;
            if (c == 0) {
                b.Visible = A;
                b.Name = j;
                b.qa = B
            }
            for (; J(this.a) > 0 && this.a.I < d;)switch (this.V()) {case 9:this.Ce(a, h ? h : b, c + 1);break;case 10:switch (e) {case 2037085030:h = new SkyBoxSceneNode;h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible =
                                                                                                                                                                                                                      A;h.Name = j;h.qa = B;h.Id = g;h.R = a;this.Gf(h);b.wa(h);h = h;h.Aa();break;case 1752395110:h = new MeshSceneNode;h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible = A;h.Name = j;h.qa = B;h.Id = g;h.R = a;this.Gf(h);b.wa(h);h = h;h.Aa();break;case 1953526632:h = new HotspotSceneNode(CursorControl, null);h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible = A;h.Name = j;h.qa = B;h.Id = g;h.R = a;this.Wh(h);b.wa(h);h = h;h.Aa();break;case 1819042406:h = new BillboardSceneNode;h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible = A;h.Name = j;h.qa = B;h.Id = g;h.R =
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                a;this.Uh(h);b.wa(h);h = h;h.Aa();break;case 1835098982:h = new CameraSceneNode;h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible = A;h.Name = j;h.qa = B;h.R = a;h.Id = g;this.Vh(h);b.wa(h);h = h;h.Aa();break;case 1752461414:h = new PathSceneNode;h.Type = e;h.Pos = n;h.Rot = o;h.Scale = p;h.Visible = A;h.Name = j;h.qa = B;h.Id = g;h.R = a;this.Xh(h);b.wa(h);h = h;h.Aa();break;default:this.w();break}break;case 11:var ma = this.Be();h && h.getMaterial(M) && h.getMaterial(M).Qd(ma);++M;break;case 25:this.vg(h, a);break;default:this.w()}
        }
    };
    this.Gf = function(a) {
        var b =
                this.ba;
        a.Box = this.Na();
        K(this.a);
        K(this.a);
        a.Ya = K(this.a);
        for (K(this.a); J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 14:var c = this.xg();a.Q = c;break;default:this.w()}
    };
    this.xg = function() {
        var a = new Mesh;
        a.Box = this.Na();
        for (var b = this.ba; J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 15:var c = this.yg();c != null && a.Xd(c);break;default:this.w()}
        return a
    };
    this.yg = function() {
        var a = new MeshBuffer;
        a.Box = this.Na();
        for (var b = this.ba; J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 11:a.Mat = this.Be();break;case 16:for (var c =
                Math.floor(this.Pb / 2),d = 0; d < c; ++d)a.Indices.push(N(this.a, 2));break;case 17:c = Math.floor(this.Pb / 36);for (d = 0; d < c; ++d) {
            var e = new Vertex3D;
            e.Pos = this.t();
            e.Normal = this.t();
            e.Color = O(this.a);
            e.TCoords = this.xb();
            e.TCoords2 = new Vect2d;
            a.Vertices.push(e)
        }break;case 18:c = Math.floor(this.Pb / 44);for (d = 0; d < c; ++d) {
            e = new Vertex3D;
            e.Pos = this.t();
            e.Normal = this.t();
            e.Color = O(this.a);
            e.TCoords = this.xb();
            e.TCoords2 = this.xb();
            a.Vertices.push(e)
        }break;case 19:c = this.Pb / 60;for (d = 0; d < c; ++d) {
            e = new Vertex3D;
            e.Pos = this.t();
            e.Normal = this.t();
            e.Color = O(this.a);
            e.TCoords = this.xb();
            e.TCoords2 = new Vect2d;
            this.t();
            this.t();
            a.Vertices.push(e)
        }break;default:this.w()}
        return a
    };
    this.Be = function() {
        var a = new Material;
        a.Type = O(this.a);
        O(this.a);
        O(this.a);
        O(this.a);
        O(this.a);
        P(this.a);
        O(this.a);
        O(this.a);
        K(this.a);
        K(this.a);
        a.tb = K(this.a);
        a.ZWriteEnabled = K(this.a);
        L(this.a, 1);
        K(this.a);
        K(this.a);
        K(this.a);
        K(this.a);
        for (var b = 0; b < 4; ++b) {
            var c = this.ac();
            switch (b) {case 0:a.Tex1 = c;break;case 1:a.va = c;break}
            K(this.a);
            K(this.a);
            K(this.a);
            if (N(this.a, 2) != 0)switch (b) {case 0:a.ClampTexture1 = true;break;case 1:break}
        }
        return a
    };
    this.wg = function() {
        return this.M()
    };
    this.ac = function() {
        var a = this.wg(),b = this.Wc + a;
        if (this.la != null && a != "")return this.la.yf(b, true);
        return null
    };
    this.Wh = function(a) {
        var b = this.ba;
        a.Box = this.Na();
        a.Di = O(this.a);
        for (a.ti = O(this.a); J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 3:this.Zh(a);break;default:this.w()}
    };
    this.Zh = function(a) {
        var b = this.ba;
        a.caption = this.M();
        a.Oe = this.ac();
        this.xb();
        O(this.a);
        a.Li = this.M();
        for (a.Wi = K(this.a); J(this.a) > 0 && this.a.I < b;)switch (this.V()) {case 6:a.Hi = true;a.Mi = this.M();break;case 4:a.Ii = true;a.tc = this.M();break;case 5:a.Ji = true;a.Xi = this.M();a.Yi = this.M();break;default:this.w()}
    };
    this.Vh = function(a) {
        a.Box = this.Na();
        a.pa = this.t();
        a.Ga = this.t();
        a.Ca = P(this.a);
        a.Ba = P(this.a);
        a.Ia = P(this.a);
        a.Ha = P(this.a);
        a.Wd = K(this.a)
    };
    this.Uh = function(a) {
        a.Fa.Box = this.Na();
        a.bb = P(this.a);
        a.Pa = P(this.a);
        var b = L(this.a, 1);
        a.Vb = (b & 2) != 0
    };
    this.Xh = function(a) {
        a.Box = this.Na();
        a.Tightness = P(this.a);
        a.IsClosedCircle = K(this.a);
        O(this.a);
        for (var b = O(this.a),c = 0; c < b; ++c)a.Nodes.push(this.t())
    };
    this.vg = function(a, b) {
        if (a) {
            var c;
            c = null;
            switch (O(this.a)) {case 100:b = new AnimatorRotation;b.ed = this.t();c = b;break;case 101:b = new AnimatorFlyStraight;b.cb = this.t();b.Za = this.t();b.Ra = O(this.a);b.Ma = K(this.a);H(b);c = b;break;case 102:b = new AnimatorFlyCircle;b.Hc = this.t();b.Xa = this.t();b.Radius = P(this.a);b.hd = P(this.a);b.ga();c = b;break;case 103:this.w();break;case 104:b = new AnimatorCameraFPS(a, this.F);b.$a = P(this.a);
                b.MoveSpeed = P(this.a);b.RotateSpeed = P(this.a);b.JumpSpeed = P(this.a);b.NoVerticalMovement = K(this.a);O(this.a);c = b;break;case 105:b = new AnimatorCameraModelViewer(a, this.F);b.Radius = P(this.a);b.RotateSpeed = P(this.a);b.NoVerticalMovement = K(this.a);O(this.a);c = b;break;case 106:b = new AnimatorFollowPath(b);b.gc = O(this.a);b.Uc = K(this.a);b.Xc = this.M();b.se = K(this.a);b.Nb = this.t();b.Nc = L(this.a, 1);b.Gc = this.M();O(this.a);c = b;break;case 107:var d = new AnimatorOnClick(b, this.F);d.Vf = K(this.a);d.Yf = K(this.a);O(this.a);
                if (c = O(this.a)) {
                    c = new ActionHandler(b);
                    this.Ae(c, b);
                    d.Qa = c
                }c = d;break;case 108:d = new AnimatorOnProximity(b);d.Oc = O(this.a);d.we = O(this.a);d.ze = P(this.a);d.cc = O(this.a);O(this.a);if (c = O(this.a)) {
                c = new ActionHandler(b);
                this.Ae(c, b);
                d.Qa = c
            }c = d;break;case 109:b = new AnimatorAnimateTexture;b.kd = O(this.a);b.Db = O(this.a);b.fc = O(this.a);b.Ma = K(this.a);c = O(this.a);b.C = [];for (d = 0; d < c; ++d)b.C.push(this.ac());c = b;break;default:this.w();return}
            c && a.Fb(c)
        } else this.w()
    };
    this.Ae = function(a, b) {
        var c = this.V();
        if (c !=
            29)this.w(); else for (var d = this.ba; J(this.a) > 0 && this.a.I < d;) {
            c = this.V();
            if (c == 30)(c = this.ug(O(this.a), b)) && ca(a, c); else this.w()
        }
    };
    this.ug = function(a) {
        var b = 0;
        switch (a) {case 0:b = new Action.me;b.ke = O(this.a);b.gd = O(this.a);b.aa = K(this.a);O(this.a);return b;case 1:a = new Action.ae;a.Yc = O(this.a);a.Ab = O(this.a);a.aa = K(this.a);a.O = this.t();a.dd = K(this.a);a.zb = O(this.a);b = O(this.a);if (b & 1) {
            a.Eb = true;
            a.Sa = O(this.a)
        }return a;case 2:b = new Action.be;b.Ag = O(this.a);b.Fe = O(this.a);b.aa = K(this.a);b.O = this.t();
            O(this.a);return b;case 3:b = new Action.ce;b.Bg = O(this.a);b.Ge = O(this.a);b.aa = K(this.a);b.O = this.t();O(this.a);return b;case 4:b = new Action.de;b.kd = O(this.a);b.Ee = O(this.a);b.aa = K(this.a);b.Oe = this.ac();O(this.a);return b;case 5:this.w();case 6:this.w();case 7:b = new Action.he;O(this.a);b.ig = this.M();return b;case 8:b = new Action.te;O(this.a);b.Pg = this.M();b.pa = this.M();return b;case 9:b = new Action.Je;b.Ai = O(this.a);b.aa = K(this.a);b.Ma = K(this.a);b.pi = this.M();O(this.a);return b;case 10:b = new Action.Le(this.F);
            b.Cg = this.M();O(this.a);return b;case 11:b = new Action.He(this.F);b.$d = O(this.a);O(this.a);return b;case 12:a = new Action.Ie;a.Yc = O(this.a);a.Ab = O(this.a);a.aa = K(this.a);a.O = this.t();a.dd = K(this.a);a.zb = O(this.a);b = O(this.a);if (b & 1) {
            a.Eb = true;
            a.Sa = O(this.a)
        }return a;default:this.w()}
        return null
    }
};
Animator = function() {
    this.Type = -1
};
q = Animator.prototype;
q.getType = m("none");
q.animateNode = m(false);
q.onMouseDown = f();
q.onMouseUp = f();
q.onMouseMove = f();
q.onKeyDown = f();
q.onKeyUp = f();
AnimatorCameraFPS = function(a, b) {
    this.Type = -1;
    this.ib = 0;
    this.rd = this.Ud = this.Od = this.Kd = this.NoVerticalMovement = false;
    this.Nd = this.za = 0;
    this.Va = 20;
    this.jb = 100;
    this.Vd = (this.jb - this.Va) / 50;
    this.Vi = this.Va;
    this.Ka = 90;
    this.ib = w();
    this.u = a;
    this.F = b;
    a && this.Ld(a.xa())
};
AnimatorCameraFPS.prototype = new Animator;
q = AnimatorCameraFPS.prototype;
q.getType = m("camerafps");
q.$a = 88;
q.MoveSpeed = 0.06;
q.RotateSpeed = 200;
q.JumpSpeed = 0;
q.NoVerticalMovement = false;
q.MayMove = true;
q.MayZoom = true;
function ja(a, b) {
    MayMove = b
}
q = AnimatorCameraFPS.prototype;
q.Ld = function(a) {
    if (this.u != null) {
        a = a.G(this.u.Pos);
        a = a.qc();
        this.za = a.X;
        this.Nd = a.Y;
        if (this.za > this.$a)this.za -= 360
    }
};
q.animateNode = function() {
    if (this.u == null)return false;
    var a = w(),b = a - this.ib;
    if (b > 250)b = 250;
    this.ib = a;
    a = this.u.Pos.b();
    if (this.MayMove && (this.Ud || this.rd)) {
        var c = this.u.Pos.G(this.u.xa());
        if (this.NoVerticalMovement)c.Y = 0;
        c.normalize();
        this.Ud && a.T(c.z(this.MoveSpeed * -b));
        this.rd && a.T(c.z(this.MoveSpeed * b))
    }
    if (this.MayMove && (this.Kd || this.Od)) {
        c = this.u.Pos.G(this.u.xa()).ia(this.u.Hd());
        c.normalize();
        if (this.Kd) {
            c = c.z(this.MoveSpeed * -b);
            a.T(c);
            this.u.Ja(this.u.xa().add(c))
        }
        if (this.Od) {
            c = c.z(this.MoveSpeed *
                    b);
            a.T(c);
            this.u.Ja(this.u.xa().add(c))
        }
    }
    this.u.Pos = a;
    if (this.MayZoom) {
        a = Core.wc(this.u.pf());
        this.Ka += 0 * b;
        if (this.Ka < this.Va)this.Ka = this.Va;
        if (this.Ka > this.jb)this.Ka = this.jb;
        c = this.Vd;
        c = Math.abs(this.Ka - a) / 8;
        if (c < this.Vd)c = this.Vd;
        if (a < this.jb - c && a < this.Ka) {
            a += c;
            if (a > this.jb)a = this.jb
        }
        if (a > this.Va + c && a > this.Ka) {
            a -= c;
            if (a < this.Va)a = this.Va
        }
        this.u.Kf(Core.bf(a))
    }
    a = new Vect3d(0, 0, 1);
    c = new Matrix4;
    E(c, new Vect3d(this.za, this.Nd, 0));
    z(c, a);
    c = 0;
    if (this.F.vc())c = this.F.Cd() - this.F.Ad();
    c += 0;
    if (c > 300)c =
                300;
    if (c < -300)c = -300;
    this.za += c * b * this.RotateSpeed * 2.0E-5;
    if (this.za < -this.$a)this.za = -this.$a;
    if (this.za > this.$a)this.za = this.$a;
    c = 0;
    if (this.F.vc())c = this.F.Bd() - this.F.zd();
    c += 0;
    if (c > 300)c = 300;
    if (c < -300)c = -300;
    this.Nd += c * b * this.RotateSpeed * 2.0E-5;
    this.u.Ja(this.u.Pos.add(a));
    return false
};
q.onMouseDown = function(a) {
    Animator.prototype.onMouseDown.call(this, a)
};
q.onMouseUp = function(a) {
    Animator.prototype.onMouseUp.call(this, a)
};
q.onMouseMove = function(a) {
    Animator.prototype.onMouseMove.call(this, a)
};
function la(a, b, c) {
    if (c == 37 || c == 65)a.Kd = b;
    if (c == 39 || c == 68)a.Od = b;
    if (c == 38 || c == 87)a.Ud = b;
    if (c == 40 || c == 83)a.rd = b
}
AnimatorCameraFPS.prototype.onKeyDown = function(a) {
    la(this, true, a.keyCode)
};
AnimatorCameraFPS.prototype.onKeyUp = function(a) {
    la(this, false, a.keyCode)
};
AnimatorCameraModelViewer = function(a, b) {
    this.Type = -1;
    this.RotateSpeed = 0.06;
    this.Radius = 100;
    this.NoVerticalMovement = false;
    this.ib = w();
    this.u = a;
    this.F = b
};
AnimatorCameraModelViewer.prototype = new Animator;
q = AnimatorCameraModelViewer.prototype;
q.getType = m("cameramodelviewer");
q.RotateSpeed = 0.06;
q.Radius = 100;
q.NoVerticalMovement = false;
q.animateNode = function() {
    if (this.u == null)return false;
    var a = w(),b = a - this.ib;
    if (b > 250)b = 250;
    this.ib = a;
    a = this.u.Pos.b();
    var c = this.u.pa.b(),d = c.G(this.u.ja()),e = 0,g = 0;
    if (this.F.vc()) {
        e = (this.F.Bd() - this.F.zd()) * this.RotateSpeed / 5E4;
        g = (this.F.Cd() - this.F.Ad()) * this.RotateSpeed / 5E4
    }
    d = d.ia(this.u.Ga);
    d.Y = 0;
    d.normalize();
    if (!Core.Ua(e)) {
        d.ya(b * e);
        a.T(d)
    }
    if (!this.NoVerticalMovement && !Core.Ua(g)) {
        e = this.u.Ga.b();
        e.normalize();
        b = a.add(e.z(b * g));
        g = b.b();
        g.Y = c.Y;
        e = this.Radius / 10;
        if (g.gb(c) > e)a = b
    }
    d = a.G(c);
    d.Rd(this.Radius);
    a = c.add(d);
    this.u.Pos = a;
    return false
};
AnimatorFollowPath = function(a) {
    this.gc = 5E3;
    this.Uc = this.Rc = this.Qe = false;
    this.se = true;
    this.Pe = 0;
    this.Tc = true;
    this.Nc = AnimatorFollowPath.Kc;
    this.ec = false;
    this.Ea = a;
    this.N = 0;
    this.Qe = false;
    this.ta = this.Wb = null;
    this.ec = false;
    this.Xc = null;
    this.Pe = 0;
    this.Gc = this.Nb = null
};
AnimatorFollowPath.prototype = new Animator;
AnimatorFollowPath.Kc = 0;
AnimatorFollowPath.fe = 1;
AnimatorFollowPath.$f = 2;
AnimatorFollowPath.prototype.getType = m("followpath");
AnimatorFollowPath.prototype.hi = function(a, b, c) {
    this.Nc = EFPFEM_START_AGAIN;
    this.Uc = c;
    this.gc = b
};
AnimatorFollowPath.prototype.animateNode = function(a, b) {
    if (a == null || !this.Ea || !this.gc)return false;
    if (a !== this.Wb) {
        if (this.Wb = a)this.Rc = this.Wb.getType() == "camera";
        return false
    }
    if (!this.ta)if (!this.Qe)if (this.Xc.length)if (this.Ea) {
        var c = this.Ea.Fd(this.Xc);
        c && c.getType() == "path" && this.Lf(c)
    }
    if (this.ta == null)return false;
    c = false;
    var d = null;
    if (this.Rc && this.se) {
        c = !this.Tc;
        d = a;
        if (this.Ea.fa() !== d) {
            if (this.ta.Nodes.length)d.Pos = this.ta.vf(0);
            this.Tc = true;
            return false
        } else this.Tc = false;
        if (!this.N || !c)this.N =
                          b
    }
    if (!this.N)this.N = this.Ea.Gd();
    d = (b - this.N + this.Pe) / this.gc;
    if (d > 1 && !this.ta.IsClosedCircle)switch (this.Nc) {case AnimatorFollowPath.Kc:d %= 1;break;case AnimatorFollowPath.fe:d = 1;break;case AnimatorFollowPath.$f:d = 1;if (!this.ec) {
        if (this.Ea)if (this.Gc.length)(c = this.Ea.Fd(this.Gc)) && c.getType() == "camera" && this.Ea.yc(c);
        this.ec = true
    }break} else this.ec = false;
    b = this.ta.Dd(d);
    c = !b.s(a.Pos);
    a.Pos = b;
    if (this.Uc && this.ta.Nodes.length) {
        d = this.ta.Dd(d + 0.0010);
        if (!Core.Ua(d.gb(b))) {
            var e = d.G(b);
            e.Rd(100);
            if (this.Rc) {
                d =
                a;
                a = b.add(e);
                c = c || !a.s(d.pa);
                d.Ja(a)
            } else {
                if (!this.Nb || this.Nb.df())d = e.qc(); else {
                    d = new Matrix4;
                    E(d, e.qc());
                    b = new Matrix4;
                    E(b, this.Nb);
                    d = C(d, b);
                    b = -Math.asin(m02);
                    e = Math.cos(b);
                    b *= Core.xe;
                    var g,j;
                    if (Math.abs(e) > Core.oa) {
                        var n = 1 / e;
                        g = d.e * n;
                        j = d.h * n;
                        e = Math.atan2(j, g) * Core.oa;
                        g = d.c * n;
                        j = d.f * n
                    } else {
                        e = 0;
                        g = d.d;
                        j = -d.g
                    }
                    d = Math.atan2(j, g) * Core.oa;
                    if (e < 0)e += 360;
                    if (b < 0)b += 360;
                    if (d < 0)d += 360;
                    d = new Vect3d(e, b, d)
                }
                c = c || !d.s(a.Rot);
                a.Rot = d
            }
        }
    }
    return c
};
AnimatorFollowPath.prototype.Lf = k("ta");
AnimatorFlyStraight = function(a, b, c, d, e, g) {
    this.cb = new Vect3d(0, 0, 0);
    this.Za = new Vect3d(40, 40, 40);
    this.N = w();
    this.Ra = 3E3;
    this.Ec = this.Rb = this.Ma = false;
    if (a)this.cb = a.b();
    if (b)this.Za = b.b();
    if (c)this.Ra = c;
    if (d)this.Ma = d;
    H(this);
    if (e)this.Rb = e;
    if (g)this.Ec = g
};
AnimatorFlyStraight.prototype = new Animator;
AnimatorFlyStraight.prototype.getType = m("flystraight");
AnimatorFlyStraight.prototype.animateNode = function(a, b) {
    b = b - this.N;
    var c = false;
    if (b != 0) {
        var d = this.cb.b();
        if (!this.Ma && b >= this.Ra) {
            d = this.Za.b();
            c = true
        } else d.T(this.O.z(b % this.Ra * this.Jg));
        if (this.Ec)a.getType() == "camera" && a.Ja(d); else a.Pos = d;
        c && this.Rb && a.Hf(this);
        return true
    }
    return false
};
function H(a) {
    a.O = a.Za.G(a.cb);
    a.Og = a.O.Ta();
    a.O.normalize();
    a.Jg = a.Og / a.Ra
}
;
AnimatorFlyCircle = function(a, b, c, d) {
    this.Hc = new Vect3d;
    this.Xa = new Vect3d(0, 1, 0);
    this.nd = new Vect3d;
    this.db = new Vect3d;
    this.N = w();
    this.hd = 0.01;
    this.Radius = 100;
    if (a)this.Hc = a.b();
    if (b)this.Radius = b;
    if (c)this.Xa = c.b();
    if (d)this.hd = d;
    this.ga()
};
AnimatorFlyCircle.prototype = new Animator;
AnimatorFlyCircle.prototype.getType = m("flycircle");
AnimatorFlyCircle.prototype.animateNode = function(a, b) {
    b = b - this.N;
    if (b != 0) {
        b = b * this.hd;
        b = this.nd.z(Math.cos(b)).add(this.db.z(Math.sin(b)));
        b.ya(this.Radius);
        a.Pos = this.Hc.add(b);
        return true
    }
    return false
};
AnimatorFlyCircle.prototype.ga = function() {
    this.Xa.normalize();
    this.db = this.Xa.Y != 0 ? new Vect3d(50, 0, 0) : new Vect3d(0, 50, 0);
    this.db = this.db.ia(this.Xa);
    this.db.normalize();
    this.nd = this.db.ia(this.Xa);
    this.nd.normalize()
};
AnimatorRotation = function(a) {
    this.ed = new Vect3d;
    if (a)this.ed = a.b();
    this.N = w()
};
AnimatorRotation.prototype = new Animator;
AnimatorRotation.prototype.getType = m("rotation");
AnimatorRotation.prototype.animateNode = function(a, b) {
    var c = b - this.N;
    if (c != 0) {
        a.Rot.T(this.ed.z(c / 10));
        this.N = b;
        return true
    }
    return false
};
AnimatorAnimateTexture = function(a, b, c) {
    this.C = [];
    this.Ma = true;
    this.Db = 20;
    this.fc = this.kd = 0;
    this.N = w();
    if (a)this.C = a;
    if (b)this.Db = b;
    if (c == true)this.Ri = false
};
AnimatorAnimateTexture.prototype = new Animator;
AnimatorAnimateTexture.prototype.getType = m("animatetexture");
AnimatorAnimateTexture.prototype.animateNode = function(a, b) {
    if (a == null || this.C == null)return false;
    var c = false,d = null;
    if (this.C.length) {
        var e = a.R.Gd();
        d = b - e;
        var g = e + this.Db * this.C.length;
        e = 0;
        e = !this.Ma && b >= g ? this.C.length - 1 : this.Db > 0 ? Math.floor(d / this.Db % this.C.length) : 0;
        if (e < this.C.length)if (this.kd == 1) {
            if (this.fc >= 0 && this.fc < a.getMaterialCount())if ((d = a.getMaterial(this.fc)) && d.Tex1 !== this.C[e]) {
                d.Tex1 = this.C[e];
                c = true
            }
        } else {
            b = a.getMaterialCount();
            for (g = 0; g < b; ++g)if ((d = a.getMaterial(g)) && d.Tex1 !==
                                                                 this.C[e]) {
                d.Tex1 = this.C[e];
                c = true
            }
        }
    }
    return c
};
AnimatorOnClick = function(a, b, c) {
    this.vd = b;
    this.Cb = 0;
    this.ve = this.ue = -1;
    this.yi = false;
    this.ui = null;
    this.fd = a;
    this.cg = c;
    this.Vf = true;
    this.Yf = false;
    this.kc = this.Qa = null;
    a:if (this != null) {
        for (b = 0; b < a.Oa.length; ++b)if (a.Oa[b] === this)break a;
        a.Oa.push(this)
    }
};
AnimatorOnClick.prototype = new Animator;
AnimatorOnClick.prototype.getType = m("onclick");
AnimatorOnClick.prototype.animateNode = function(a) {
    if (a == null)return false;
    if (this.Cb)if (w() - this.Cb < 1500) {
        this.Cb = 0;
        if (a.Visible && na(this, a, this.ue, this.ve)) {
            this.kh && this.kh();
            this.uc(a);
            return true
        }
    }
    return false
};
AnimatorOnClick.prototype.onMouseUp = function(a) {
    this.ue = a.clientX - this.vd.Da.offsetLeft + document.body.scrollLeft;
    this.ve = a.clientY - this.vd.Da.offsetTop + document.body.scrollTop;
    this.Cb = w()
};
AnimatorOnClick.prototype.uc = function(a) {
    this.Qa && this.Qa.execute(a)
};
function na(a, b, c, d) {
    if (b == null)return false;
    c = a.vd.gf(c, d);
    if (c == null)return false;
    a = a.fd.fa();
    if (a == null)return false;
    a = a.ja();
    d = b.getBoundingBox();
    var e = new Matrix4(false);
    b = b.K;
    if (b.ea) {
        b.P(e);
        b = true
    } else {
        var g = (b.c * b.d - b.f * b.g) * (b.e * b.l - b.r * b.k) - (b.c * b.h - b.m * b.g) * (b.q * b.l - b.r * b.j) + (b.c * b.o - b.n * b.g) * (b.q * b.k - b.e * b.j) + (b.f * b.h - b.m * b.d) * (b.p * b.l - b.r * b.i) - (b.f * b.o - b.n * b.d) * (b.p * b.k - b.e * b.i) + (b.m * b.o - b.n * b.h) * (b.p * b.j - b.q * b.i);
        if (g > -1.0E-7 && g < 1.0E-7)b = false; else {
            g = 1 / g;
            e.c = g * (b.d * (b.e * b.l - b.r * b.k) +
                       b.h * (b.r * b.j - b.q * b.l) + b.o * (b.q * b.k - b.e * b.j));
            e.f = g * (b.q * (b.m * b.l - b.n * b.k) + b.e * (b.n * b.j - b.f * b.l) + b.r * (b.f * b.k - b.m * b.j));
            e.m = g * (b.j * (b.m * b.o - b.n * b.h) + b.k * (b.n * b.d - b.f * b.o) + b.l * (b.f * b.h - b.m * b.d));
            e.n = g * (b.f * (b.o * b.e - b.h * b.r) + b.m * (b.d * b.r - b.o * b.q) + b.n * (b.h * b.q - b.d * b.e));
            e.g = g * (b.h * (b.p * b.l - b.r * b.i) + b.o * (b.e * b.i - b.p * b.k) + b.g * (b.r * b.k - b.e * b.l));
            e.d = g * (b.e * (b.c * b.l - b.n * b.i) + b.r * (b.m * b.i - b.c * b.k) + b.p * (b.n * b.k - b.m * b.l));
            e.h = g * (b.k * (b.c * b.o - b.n * b.g) + b.l * (b.m * b.g - b.c * b.h) + b.i * (b.n * b.h - b.m * b.o));
            e.o = g * (b.m * (b.o *
                              b.p - b.g * b.r) + b.n * (b.g * b.e - b.h * b.p) + b.c * (b.h * b.r - b.o * b.e));
            e.p = g * (b.o * (b.p * b.j - b.q * b.i) + b.g * (b.q * b.l - b.r * b.j) + b.d * (b.r * b.i - b.p * b.l));
            e.q = g * (b.r * (b.c * b.j - b.f * b.i) + b.p * (b.f * b.l - b.n * b.j) + b.q * (b.n * b.i - b.c * b.l));
            e.e = g * (b.l * (b.c * b.d - b.f * b.g) + b.i * (b.f * b.o - b.n * b.d) + b.j * (b.n * b.g - b.c * b.o));
            e.r = g * (b.n * (b.d * b.p - b.g * b.q) + b.c * (b.o * b.q - b.d * b.r) + b.f * (b.g * b.r - b.o * b.p));
            e.i = g * (b.g * (b.e * b.j - b.q * b.k) + b.d * (b.p * b.k - b.e * b.i) + b.h * (b.q * b.i - b.p * b.j));
            e.j = g * (b.p * (b.m * b.j - b.f * b.k) + b.q * (b.c * b.k - b.m * b.i) + b.e * (b.f * b.i - b.c * b.j));
            e.k = g * (b.i * (b.m * b.d - b.f * b.h) + b.j * (b.c * b.h - b.m * b.g) + b.k * (b.f * b.g - b.c * b.d));
            e.l = g * (b.c * (b.d * b.e - b.h * b.q) + b.f * (b.h * b.p - b.g * b.e) + b.m * (b.g * b.q - b.d * b.p));
            e.ea = b.ea;
            b = true
        }
    }
    if (b)if (d.Cf(y(e, a), y(e, c)))return true;
    return false
}
;
AnimatorOnProximity = function(a, b, c, d, e) {
    this.Cb = 0;
    this.Pd = a;
    this.Qa = this.cc = this.ze = this.we = this.Oc = 0;
    this.cg = d;
    if (b)this.Radius = b;
    if (c)this.cc = c;
    if (e)this.Oc = EPET_LEAVE;
    this.Sc = false
};
AnimatorOnProximity.prototype = new Animator;
AnimatorOnProximity.prototype.getType = m("oncollide");
AnimatorOnProximity.prototype.animateNode = function(a) {
    if (a == null || this.Pd == null)return false;
    var b = false,c = null;
    if (this.we == 0)c = this.Pd.fa(); else if (this.cc != -1)c = this.Pd.na(this.cc);
    if (c) {
        if (a === c)return false;
        var d = c.ja();
        a = a.ja();
        d = d.gb(a) < this.ze;
        switch (this.Oc) {case 0:if (d && !this.Sc) {
            this.uc(c);
            b = true
        }break;case 1:if (!d && this.Sc) {
            this.uc(c);
            b = true
        }break}
        this.Sc = d
    }
    return b
};
AnimatorOnProximity.prototype.uc = function(a) {
    this.Qa && this.Qa.execute(a)
};
CCDocument = function() {
    this.ob = -1;
    this.Tf = "";
    this.ua = [];
    this.Lg = Scene.ye;
    this.ri = 320;
    this.qi = 200;
    this.od = function(a) {
        this.ua.push(a)
    };
    this.pc = function() {
        if (this.ob < 0 || this.ob >= this.ua.length)return null;
        return this.ua[this.ob]
    };
    this.Jf = function(a) {
        for (var b = 0; b < this.ua.length; ++b)if (this.ua[b] === a) {
            this.ob = b;
            return
        }
    }
};
var $ = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
base64decode = function(a) {
    var b,c,d,e,g;
    e = a.length;
    d = 0;
    for (g = ""; d < e;) {
        do b = $[a.charCodeAt(d++) & 255]; while (d < e && b == -1);
        if (b == -1)break;
        do c = $[a.charCodeAt(d++) & 255]; while (d < e && c == -1);
        if (c == -1)break;
        g += String.fromCharCode(b << 2 | (c & 48) >> 4);
        do{
            b = a.charCodeAt(d++) & 255;
            if (b == 61)return g;
            b = $[b]
        } while (d < e && b == -1);
        if (b == -1)break;
        g += String.fromCharCode((c & 15) << 4 | (b & 60) >> 2);
        do{
            c = a.charCodeAt(d++) & 255;
            if (c == 61)return g;
            c = $[c]
        } while (d < e && c == -1);
        if (c == -1)break;
        g += String.fromCharCode((b & 3) << 6 | c)
    }
    return g
};
window.startCopperLichtFromFile = ga;
Vect3d.prototype.dotProduct = Vect3d.prototype.ma;
Vect3d.prototype.getHorizontalAngle = Vect3d.prototype.qc;
Vect3d.prototype.crossProduct = Vect3d.prototype.ia;
Vect3d.prototype.divideThroughVect = Vect3d.prototype.eh;
Vect3d.prototype.divideThisThroughVect = Vect3d.prototype.dh;
Vect3d.prototype.multiplyWithVect = Vect3d.prototype.Df;
Vect3d.prototype.multiplyThisWithVect = Vect3d.prototype.Sh;
Vect3d.prototype.multiplyThisWithScal = Vect3d.prototype.ya;
Vect3d.prototype.multiplyWithScal = Vect3d.prototype.z;
Vect3d.prototype.getLengthSQ = Vect3d.prototype.tf;
Vect3d.prototype.getDistanceFromSQ = Vect3d.prototype.xd;
Vect3d.prototype.getDistanceTo = Vect3d.prototype.gb;
Vect3d.prototype.getLength = Vect3d.prototype.Ta;
Vect3d.prototype.isZero = Vect3d.prototype.Mh;
Vect3d.prototype.equalsByNumbers = Vect3d.prototype.gh;
Vect3d.prototype.equalsZero = Vect3d.prototype.df;
Vect3d.prototype.equals = Vect3d.prototype.s;
Vect3d.prototype.setTo = Vect3d.prototype.Kb;
Vect3d.prototype.setLength = Vect3d.prototype.Rd;
Vect3d.prototype.getNormalized = Vect3d.prototype.vh;
Vect3d.prototype.normalize = Vect3d.prototype.normalize;
Vect3d.prototype.addToThis = Vect3d.prototype.T;
Vect3d.prototype.add = Vect3d.prototype.add;
Vect3d.prototype.crossProduct = Vect3d.prototype.ia;
Vect3d.prototype.substractFromThis = Vect3d.prototype.Lb;
Vect3d.prototype.substract = Vect3d.prototype.G;
Vect3d.prototype.copyTo = Vect3d.prototype.P;
Vect3d.prototype.clone = Vect3d.prototype.b;
Vect3d.prototype.toString = Vect3d.prototype.toString;
Box3d.prototype.getCenter = Box3d.prototype.lf;
Box3d.prototype.getExtent = Box3d.prototype.nf;
Box3d.prototype.intersectsWithLine = Box3d.prototype.Cf;
Core.TOLERANCE = Core.oa;
Core.radToDeg = Core.wc;
Core.degToRad = Core.bf;
Core.iszero = Core.Ua;
Core.isone = Core.Nh;
Core.equals = Core.s;
Core.clamp = Core.Ze;
Core.fract = Core.ff;
Core.max3 = Core.Qh;
Core.min3 = Core.Rh;
Core.getBlue = Core.kf;
Core.getGreen = Core.qf;
Core.getRed = Core.xf;
Core.getAlpha = Core.oh;
Core.createColor = Core.Xg;
Scene.REDRAW_WHEN_SCENE_CHANGED = Scene.sg;
Scene.REDRAW_WHEN_CAM_MOVED = Scene.rg;
Scene.REDRAW_EVERY_FRAME = Scene.ye;
Scene.RENDER_MODE_SKYBOX = Scene.bd;
Scene.RENDER_MODE_DEFAULT = Scene.ab;
Scene.RENDER_MODE_LIGHTS = Scene.ad;
Scene.RENDER_MODE_CAMERA = Scene.$c;
Scene.RENDER_MODE_TRANSPARENT = Scene.wb;
Scene.RENDER_MODE_2DOVERLAY = Scene.Zc;
Scene.prototype.setRedrawMode = Scene.prototype.Nf;
Scene.prototype.setActiveCamera = Scene.prototype.yc;
Scene.prototype.getActiveCamera = Scene.prototype.fa;
Scene.prototype.forceRedrawNextFrame = Scene.prototype.ef;
Scene.prototype.getStartTime = Scene.prototype.Gd;
Scene.prototype.registerNodeForRendering = Scene.prototype.Wa;
Scene.prototype.getAllSceneNodesOfType = Scene.prototype.hf;
Scene.prototype.getSceneNodeFromName = Scene.prototype.Fd;
Scene.prototype.getSceneNodeFromId = Scene.prototype.na;
Scene.prototype.getRootSceneNode = Scene.prototype.Ah;
Scene.prototype.registerNodeForRendering = Scene.prototype.Wa;
Scene.prototype.getCurrentRenderMode = Scene.prototype.sh;
Scene.prototype.setBackgroundColor = Scene.prototype.ci;
Scene.prototype.getBackgroundColor = Scene.prototype.rh;
Scene.prototype.setName = Scene.prototype.fi;
Scene.prototype.getName = Scene.prototype.getName;
SceneNode.prototype.getParent = SceneNode.prototype.wh;
SceneNode.prototype.getAnimators = SceneNode.prototype.ph;
SceneNode.prototype.getAnimatorOfType = SceneNode.prototype.jf;
SceneNode.prototype.getTransformedBoundingBox = SceneNode.prototype.Fh;
SceneNode.prototype.addAnimator = SceneNode.prototype.Fb;
SceneNode.prototype.removeAnimator = SceneNode.prototype.Hf;
SceneNode.prototype.addChild = SceneNode.prototype.wa;
SceneNode.prototype.removeChild = SceneNode.prototype.removeChild;
SceneNode.prototype.getRelativeTransformation = SceneNode.prototype.Ed;
SceneNode.prototype.updateAbsolutePosition = SceneNode.prototype.Aa;
SceneNode.prototype.getAbsolutePosition = SceneNode.prototype.ja;
SceneNode.prototype.init = SceneNode.prototype.ga;
SceneNode.prototype.getAbsoluteTransformation = SceneNode.prototype.nh;
Animator.prototype.getType = Animator.prototype.getType;
AnimatorCameraFPS.prototype.getType = AnimatorCameraFPS.prototype.getType;
AnimatorCameraFPS.prototype.lookAt = AnimatorCameraFPS.prototype.Ld;
AnimatorCameraFPS.prototype.animateNode = AnimatorCameraFPS.prototype.animateNode;
AnimatorCameraModelViewer.prototype.animateNode = AnimatorCameraModelViewer.prototype.animateNode;
AnimatorCameraModelViewer.prototype.getType = AnimatorCameraModelViewer.prototype.getType;
AnimatorFollowPath.prototype.animateNode = AnimatorFollowPath.prototype.animateNode;
AnimatorFollowPath.prototype.getType = AnimatorFollowPath.prototype.getType;
AnimatorFollowPath.prototype.setOptions = AnimatorFollowPath.prototype.hi;
AnimatorFollowPath.prototype.setPathToFollow = AnimatorFollowPath.prototype.Lf;
AnimatorFollowPath.EFPFEM_STOP = AnimatorFollowPath.fe;
AnimatorFollowPath.EFPFEM_START_AGAIN = AnimatorFollowPath.Kc;
AnimatorOnClick.prototype.getType = AnimatorOnClick.prototype.getType;
AnimatorOnProximity.prototype.getType = AnimatorOnProximity.prototype.getType;
Material.EMT_LIGHTMAP = Material.qb;
Material.EMT_TRANSPARENT_ADD_COLOR = Material.Lc;
Material.EMT_TRANSPARENT_ALPHA_CHANNEL = Material.Mc;
SceneNode.prototype.getAnimatorOfType = SceneNode.prototype.jf;
CopperLicht.prototype.getRenderer = CopperLicht.prototype.zh;
CopperLicht.prototype.getScene = CopperLicht.prototype.hb;
CopperLicht.prototype.load = CopperLicht.prototype.load;
CopperLicht.prototype.isLoading = CopperLicht.prototype.Lh;
CopperLicht.prototype.draw3dScene = CopperLicht.prototype.sd;
CopperLicht.prototype.gotoScene = CopperLicht.prototype.tc;
CopperLicht.prototype.getScenes = CopperLicht.prototype.Bh;
CopperLicht.prototype.getMouseX = CopperLicht.prototype.Bd;
CopperLicht.prototype.getMouseY = CopperLicht.prototype.Cd;
CopperLicht.prototype.isMouseDown = CopperLicht.prototype.vc;
CopperLicht.prototype.getMouseDownX = CopperLicht.prototype.zd;
CopperLicht.prototype.getMouseDownY = CopperLicht.prototype.Ad;
CopperLicht.prototype.initRenderer = CopperLicht.prototype.Jh;
CopperLicht.prototype.getTextureManager = CopperLicht.prototype.Eh;
CopperLicht.prototype.get2DPositionFrom3DPosition = CopperLicht.prototype.mh;
CopperLicht.prototype.get3DPositionFrom2DPosition = CopperLicht.prototype.gf;
CopperLicht.prototype.addScene = CopperLicht.prototype.od;
CameraSceneNode.prototype.setAspectRatio = CameraSceneNode.prototype.If;
CameraSceneNode.prototype.getAspectRatio = CameraSceneNode.prototype.qh;
CameraSceneNode.prototype.getFov = CameraSceneNode.prototype.pf;
CameraSceneNode.prototype.setFov = CameraSceneNode.prototype.Kf;
CameraSceneNode.prototype.setTarget = CameraSceneNode.prototype.Ja;
CameraSceneNode.prototype.getTarget = CameraSceneNode.prototype.xa;
CameraSceneNode.prototype.getUpVector = CameraSceneNode.prototype.Hd;
CameraSceneNode.prototype.setUpVector = CameraSceneNode.prototype.li;
CameraSceneNode.prototype.getNearValue = CameraSceneNode.prototype.uf;
CameraSceneNode.prototype.setNearValue = CameraSceneNode.prototype.gi;
CameraSceneNode.prototype.getFarValue = CameraSceneNode.prototype.of;
CameraSceneNode.prototype.setFarValue = CameraSceneNode.prototype.di;
CameraSceneNode.prototype.createClone = CameraSceneNode.prototype.createClone;
BillboardSceneNode.prototype.getBoundingBox = BillboardSceneNode.prototype.getBoundingBox;
BillboardSceneNode.prototype.getType = BillboardSceneNode.prototype.getType;
BillboardSceneNode.prototype.render = BillboardSceneNode.prototype.render;
BillboardSceneNode.prototype.getMaterialCount = BillboardSceneNode.prototype.getMaterialCount;
BillboardSceneNode.prototype.getMaterial = BillboardSceneNode.prototype.getMaterial;
BillboardSceneNode.prototype.createClone = BillboardSceneNode.prototype.createClone;
BillboardSceneNode.prototype.setSize = BillboardSceneNode.prototype.ki;
BillboardSceneNode.prototype.getSize = BillboardSceneNode.prototype.Dh;
SkyBoxSceneNode.prototype.createClone = SkyBoxSceneNode.prototype.createClone;
PathSceneNode.prototype.getBoundingBox = PathSceneNode.prototype.getBoundingBox;
PathSceneNode.prototype.getType = PathSceneNode.prototype.getType;
PathSceneNode.prototype.createClone = PathSceneNode.prototype.createClone;
PathSceneNode.prototype.getPathNodePosition = PathSceneNode.prototype.vf;
PathSceneNode.prototype.getPointOnPath = PathSceneNode.prototype.Dd;
MeshSceneNode.prototype.getMesh = MeshSceneNode.prototype.uh;
MeshSceneNode.prototype.getMaterialCount = MeshSceneNode.prototype.getMaterialCount;
MeshSceneNode.prototype.getMaterial = MeshSceneNode.prototype.getMaterial;
MeshSceneNode.prototype.createClone = MeshSceneNode.prototype.createClone;
MeshSceneNode.prototype.setMesh = MeshSceneNode.prototype.ei;
MeshSceneNode.prototype.getBoundingBox = MeshSceneNode.prototype.getBoundingBox;
Plane3d.ISREL3D_FRONT = Plane3d.fg;
Plane3d.ISREL3D_BACK = Plane3d.eg;
Plane3d.ISREL3D_PLANAR = Plane3d.gg;
Plane3d.prototype.clone = Plane3d.prototype.b;
Plane3d.prototype.recalculateD = Plane3d.prototype.xc;
Plane3d.prototype.getMemberPoint = Plane3d.prototype.th;
Plane3d.prototype.setPlane = Plane3d.prototype.ii;
Plane3d.prototype.setPlaneFrom3Points = Plane3d.prototype.ji;
Plane3d.prototype.normalize = Plane3d.prototype.normalize;
Plane3d.prototype.classifyPointRelation = Plane3d.prototype.Ug;
Plane3d.prototype.getIntersectionWithPlanes = Plane3d.prototype.rc;
Plane3d.prototype.getIntersectionWithPlane = Plane3d.prototype.sf;
Plane3d.prototype.getIntersectionWithLine = Plane3d.prototype.rf;
Plane3d.prototype.getDistanceTo = Plane3d.prototype.gb;
Plane3d.prototype.isFrontFacing = Plane3d.prototype.Kh;
Mesh.prototype.AddMeshBuffer = Mesh.prototype.Xd;
Mesh.prototype.GetMeshBuffers = Mesh.prototype.dg;
MeshBuffer.prototype.update = MeshBuffer.prototype.update;
Renderer.prototype.getWidth = Renderer.prototype.Jd;
Renderer.prototype.getWebGL = Renderer.prototype.Gh;
Renderer.prototype.getHeight = Renderer.prototype.yd;
Renderer.prototype.drawMesh = Renderer.prototype.td;
Renderer.prototype.setMaterial = Renderer.prototype.Sd;
Renderer.prototype.drawMeshBuffer = Renderer.prototype.ud;
Renderer.prototype.beginScene = Renderer.prototype.Xe;
Renderer.prototype.endScene = Renderer.prototype.cf;
Renderer.prototype.clearDynamicLights = Renderer.prototype.af;
Renderer.prototype.setProjection = Renderer.prototype.Mf;
Renderer.prototype.getProjection = Renderer.prototype.wf;
Renderer.prototype.setView = Renderer.prototype.Of;
Renderer.prototype.getView = Renderer.prototype.Af;
Renderer.prototype.getWorld = Renderer.prototype.Hh;
Renderer.prototype.setWorld = Renderer.prototype.zc;
TextureManager.prototype.getTexture = TextureManager.prototype.yf;
TextureManager.prototype.getTextureCount = TextureManager.prototype.zf;
TextureManager.prototype.getCountOfTexturesToLoad = TextureManager.prototype.mf;