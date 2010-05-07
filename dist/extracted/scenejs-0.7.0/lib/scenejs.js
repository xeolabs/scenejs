/**
 * @class SceneJS
 * SceneJS name space
 * @singleton
 */
var SceneJS = {

    /** Version of this release
     */
    VERSION: '0.7.3',

    /** ID of canvas SceneJS looks for when SceneJS.scene node does not supply one
     */
    DEFAULT_CANVAS_ID:"_scenejs-default-canvas",

    /** Names of supported WebGL canvas contexts
     */
    SUPPORTED_WEBGL_CONTEXT_NAMES:["experimental-webgl", "webkit-3d", "moz-webgl", "moz-glweb20"],

    /** @private */
    _traversalMode :0x1,

    /** @private */
    _TRAVERSAL_MODE_RENDER: 0x1,

    /** @private */
    _TRAVERSAL_MODE_PICKING:   0x2,

    /**
     * @private
     */
    _inherit : function(DerivedClassName, BaseClassName) {
        DerivedClassName.prototype = new BaseClassName();
        DerivedClassName.prototype.constructor = DerivedClassName;
    },

    /** Creates a namespace
     * @private
     */
    _namespace : function() {
        var a = arguments, o = null, i, j, d, rt;
        for (i = 0; i < a.length; ++i) {
            d = a[i].split(".");
            rt = d[0];
            eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
            for (j = 1; j < d.length; ++j) {
                o[d[j]] = o[d[j]] || {};
                o = o[d[j]];
            }
        }
    },

    /**
     * Returns a key for a vacant slot in the given map
     * @private
     */
    _createKeyForMap : function(keyMap, prefix) {
        var i = 0;
        while (true) {
            var key = prefix + i++;
            if (!keyMap[key]) {
                return key;
            }
        }
    }
};

SceneJS._namespace("SceneJS");

/**
 * @class Exception thrown by SceneJS when a recognised WebGL context could not be found on the canvas specified to a SceneJS.Scene.
 */
SceneJS.WebGLNotSupportedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS node classes when a mandatory configuration was not supplied
 */
SceneJS.NodeConfigExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.ShaderCompilationFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.ShaderLinkFailureException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.NoSceneActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @private
 */
SceneJS.NoCanvasActiveException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown when a SceneJS.Scene 'canvasId' configuration does not match any elements in the page and no
 * default canvas was found with the ID specified in SceneJS.Scene.DEFAULT_CANVAS_ID.
 */
SceneJS.CanvasNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class Exception thrown by SceneJS node classes when configuration property is invalid.
 */
SceneJS.InvalidNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when SceneJS fails to allocate a buffer (eg. texture, vertex array) in video RAM.
 * <p>Whether this is actually thrown before your GPU/computer hangs depends on the quality of implementation within the underlying
 * OS/OpenGL/WebGL stack, so there are no guarantees that SceneJS will warn you with one of these.</p.
 */
SceneJS.OutOfVRAMException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**@class  Exception thrown when a SceneJS.LoggingToPage 'elementId' configuration does not match any elements in the page and no
 * default DIV was found with the ID specified in SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID.
 */
SceneJS.DocumentElementNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when parsing of a Collada file fails for some reason.
 */
SceneJS.ColladaParseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when the element ID given in its 'node' configuration does not match the ID
 * of any node in the Collada document.
 */
SceneJS.ColladaRootNotFoundException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @class  Exception thrown by a SceneJS.LoadCollada node when it could not find the default Collada node ("asset) to parse and needs you to
 * explicitly provide the ID of a target asset through a 'node' configuration property.
 */
SceneJS.ColladaRootRequiredException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when you have attempted to make a cross-domain load without specify the proxy to mediate the transfer. The
 * URL of the proxy must be specified with a 'proxy' configuration property on either the SceneJS.Scene node or the node
 * that does the load  (eg. SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyNotSpecifiedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify an error response from the proxy configured for cross-domain loads
 * (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyErrorResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify an empty response from the proxy configured for cross-domain loads
 * (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.ProxyEmptyResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that empty content was loaded (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.EmptyResponseException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify that an HTTP error occured while attempting to load content (eg. by SceneJS.Load, SceneJS.LoadCollada etc).
 */
SceneJS.HttpException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown by nodes such as SceneJS.Renderer and SceneJS.Texture when the browser's WebGL does not support
 * a specified config value.
 */
SceneJS.WebGLUnsupportedNodeConfigException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/** @private */
SceneJS.PickWithoutRenderedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown when a node (such as SceneJs.ScalarInterpolator) expects to find some element of data on the current
 * data scope (SceneJS.Data).
 */
SceneJS.DataExpectedException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown by nodes such as SceneJs.Load and SceneJS.LoadCollada when they timeout waiting for their content to load.
 */
SceneJS.LoadTimeoutException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};

/**
 * @class  Exception thrown to signify a general internal SceneJS exception, ie. a SceneJS implementation bug.
 */
SceneJS.InternalException = function(msg, cause) {
    this.message = msg;
    this.cause = cause;
};



/** @private */
function SceneJS_math_divVec3(u, v) {
    return [u[0] / v[0], u[1] / v[1], u[2] / v[2]];
}

/** @private */
function SceneJS_math_negateVector4(v) {
    return [-v[0],-v[1],-v[2],-v[3]];
}

/** @private */
function SceneJS_math_addVec4(u, v) {
    return [u[0] + v[0],u[1] + v[1],u[2] + v[2],u[3] + v[3]];
}

/** @private */
function SceneJS_math_addVec4s(v, s) {
    return [v[0] + s,v[1] + s,v[2] + s,v[3] + s];
}

/** @private */
function SceneJS_math_addScalarVec4(s, v) {
    return SceneJS_math_addVec4s(v, s)
}

/** @private */
function SceneJS_math_subVec4(u, v) {
    return [u[0] - v[0],u[1] - v[1],u[2] - v[2],u[3] - v[3]];
}

/** @private */
function SceneJS_math_subVec3(u, v) {
    return [u[0] - v[0],u[1] - v[1],u[2] - v[2]];
}

/** @private */
function SceneJS_math_subVec4Scalar(v, s) {
    return [v[0] - s,v[1] - s,v[2] - s,v[3] - s];
}

/** @private */
function SceneJS_math_subScalarVec4(v, s) {
    return [s - v[0],s - v[1],s - v[2],s - v[3]];
}

/** @private */
function SceneJS_math_mulVec4(u, v) {
    return [u[0] * v[0],u[1] * v[1],u[2] * v[2],u[3] * v[3]];
}

/** @private */
function SceneJS_math_mulVec4Scalar(v, s) {
    return [v[0] * s,v[1] * s,v[2] * s,v[3] * s];
}

/** @private */
function SceneJS_math_mulVec3Scalar(v, s) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

/** @private */
function SceneJS_math_divVec4(u, v) {
    return [u[0] / v[0],u[1] / v[1],u[2] / v[2],u[3] / v[3]];
}

/** @private */
function SceneJS_math_divScalarVec3(s, v) {
    return [s / v[0], s / v[1], s / v[2]];
}

/** @private */
function SceneJS_math_divVec3s(v, s) {
    return [v[0] / s, v[1] / s, v[2] / s];
}

/** @private */
function SceneJS_math_divVec4s(v, s) {
    return [v[0] / s,v[1] / s,v[2] / s,v[3] / s];
}

/** @private */
function SceneJS_math_divScalarVec4(s, v) {
    return [s / v[0],s / v[1],s / v[2],s / v[3]];
}


/** @private */
function SceneJS_math_dotVector4(u, v) {
    return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2] + u[3] * v[3]);
}

/** @private */
function SceneJS_math_cross3Vec4(u, v) {
    return [u[1] * v[2] - u[2] * v[1],u[2] * v[0] - u[0] * v[2],u[0] * v[1] - u[1] * v[0],0.0];
}

/** @private */
function SceneJS_math_cross3Vec3(u, v) {
    return [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
}

/** @private */
function SceneJS_math_sqLenVec4(v) {
    return SceneJS_math_dotVector4(v, v);
}

/** @private */
function SceneJS_math_lenVec4(v) {
    return Math.sqrt(SceneJS_math_sqLenVec4(v));
}

/** @private */
function SceneJS_math_dotVector3(u, v) {
    return (u[0] * v[0] + u[1] * v[1] + u[2] * v[2]);
}

/** @private */
function SceneJS_math_sqLenVec3(v) {
    return SceneJS_math_dotVector3(v, v);
}

/** @private */
function SceneJS_math_lenVec3(v) {
    return Math.sqrt(SceneJS_math_sqLenVec3(v));
}

/** @private */
function SceneJS_math_rcpVec3(v) {
    return SceneJS_math_divScalarVec3(1.0, v);
}

/** @private */
function SceneJS_math_normalizeVec4(v) {
    var f = 1.0 / SceneJS_math_lenVec4(v);
    return SceneJS_math_mulVec4Scalar(v, f);
}

/** @private */
function SceneJS_math_normalizeVec3(v) {
    var f = 1.0 / SceneJS_math_lenVec3(v);
    return SceneJS_math_mulVec3Scalar(v, f);
}

/** @private */
function SceneJS_math_mat4() {
    return new Array(16);
}

/** @private */
function SceneJS_math_dupMat4(m) {
    return m.slice(0, 16);
}

/** @private */
function SceneJS_math_getCellMat4(m, row, col) {
    return m[row + col * 4];
}

/** @private */
function SceneJS_math_setCellMat4(m, row, col, s) {
    m[row + col * 4] = s;
}

/** @private */
function SceneJS_math_getRowMat4(m, r) {
    return [m[r + 0], m[r + 4], m[r + 8], m[r + 12]];
}

/** @private */
function SceneJS_math_setRowMat4(m, r, v) {
    m[r + 0] = v[0];
    m[r + 4] = v[1];
    m[r + 8] = v[2];
    m[r + 12] = v[3];
}

/** @private */
function SceneJS_math_setRowMat4c(m, r, x, y, z, w) {
    SceneJS_math_setRowMat4(m, r, [x,y,z,w]);
}

/** @private */
function SceneJS_math_setRowMat4s(m, r, s) {
    SceneJS_math_setRowMat4c(m, r, s, s, s, s);
}

/** @private */
function SceneJS_math_getColMat4(m, c) {
    var i = c * 4;
    return [m[i + 0], m[i + 1],m[i + 2],m[i + 3]];
}

/** @private */
function SceneJS_math_setColMat4v(m, c, v) {
    var i = c * 4;
    m[i + 0] = v[0];
    m[i + 1] = v[1];
    m[i + 2] = v[2];
    m[i + 3] = v[3];
}

/** @private */
function SceneJS_math_setColMat4c(m, c, x, y, z, w) {
    SceneJS_math_setColMat4v(m, c, [x,y,z,w]);
}

/** @private */
function SceneJS_math_setColMat4Scalar(m, c, s) {
    SceneJS_math_setColMat4c(m, c, s, s, s, s);
}

/** @private */
function SceneJS_math_mat4To3(m) {
    return [
        m[0],m[1],m[2],
        m[4],m[5],m[6],
        m[8],m[9],m[10]
    ];
}

/** @private */
function SceneJS_math_m4s(s) {
    return [
        s,s,s,s,
        s,s,s,s,
        s,s,s,s,
        s,s,s,s
    ];
}

/** @private */
function SceneJS_math_setMat4ToZeroes() {
    return SceneJS_math_m4s(0.0);
}

/** @private */
function SceneJS_math_setMat4ToOnes() {
    return SceneJS_math_m4s(1.0);
}

/** @private */
function SceneJS_math_diagonalMat4v(v) {
    return [
        v[0], 0.0, 0.0, 0.0,
        0.0,v[1], 0.0, 0.0,
        0.0, 0.0, v[2],0.0,
        0.0, 0.0, 0.0, v[3]
    ];
}

/** @private */
function SceneJS_math_diagonalMat4c(x, y, z, w) {
    return SceneJS_math_diagonalMat4v([x,y,z,w]);
}

/** @private */
function SceneJS_math_diagonalMat4s(s) {
    return SceneJS_math_diagonalMat4c(s, s, s, s);
}

/** @private */
function SceneJS_math_identityMat4() {
    return SceneJS_math_diagonalMat4s(1.0);
}

/** @private */
function SceneJS_math_isIdentityMat4(m) {
    var i = 0;
    var j = 0;
    var s = 0.0;
    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
            s = m[i + j * 4];
            if ((i == j)) {
                if (s != 1.0) {
                    return false;
                }
            }
            else {
                if (s != 0.0) {
                    return false;
                }
            }
        }
    }
    return true;
}

/** @private */
function SceneJS_math_negateMat4(m) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = -m[i];
    }
    return r;
}

/** @private */
function SceneJS_math_addMat4(a, b) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = a[i] + b[i];
    }
    return r;
}

/** @private */
function SceneJS_math_addMat4Scalar(m, s) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = m[i] + s;
    }
    return r;
}

/** @private */
function SceneJS_math_addScalarMat4(s, m) {
    return SceneJS_math_addMat4Scalar(m, s);
}

/** @private */
function SceneJS_math_subMat4(a, b) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = a[i] - b[i];
    }
    return r;
}

/** @private */
function SceneJS_math_subMat4Scalar(m, s) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = m[i] - s;
    }
    return r;
}

/** @private */
function SceneJS_math_subScalarMat4(s, m) {
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = s - m[i];
    }
    return r;
}

/** @private */
function SceneJS_math_mulMat4(a, b) {
    var r = SceneJS_math_mat4();
    var i = 0;
    var j = 0;
    var k = 0;
    var s = 0.0;
    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
            s = 0.0;
            for (k = 0; k < 4; ++k) {
                s += a[i + k * 4] * b[k + j * 4];
            }
            r[i + j * 4] = s;
        }
    }
    return r;
}

/** @private */
function SceneJS_math_mulMat4s(m, s)
{
    var r = SceneJS_math_mat4();
    for (var i = 0; i < 16; ++i) {
        r[i] = m[i] * s;
    }
    return r;
}

/** @private */
function SceneJS_math_mulMat4v4(m, v) {
    return [
        m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12] * v[3],
        m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13] * v[3],
        m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14] * v[3],
        m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15] * v[3]
    ];
}

/** @private */
function SceneJS_math_transposeMat4(m) {
    var r = SceneJS_math_mat4();
    var i = 0;
    var j = 0;
    for (i = 0; i < 4; ++i) {
        for (j = 0; j < 4; ++j) {
            r[i + j * 4] = m[i * 4 + j];
        }
    }
    return r;
}

/** @private */
function SceneJS_math_determinantMat4(m) {
    var f = SceneJS_math_getCellMat4;
    return (
            f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) +
            f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) +
            f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) +
            f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) +
            f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) +
            f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3)
            );
}

/** @private */
function SceneJS_math_inverseMat4(m) {
    var t = SceneJS_math_mat4();

    var f = SceneJS_math_getCellMat4;

    t[0] = f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 2) - f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 2) - f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 3) + f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 3);
    t[1] = f(m, 1, 3) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 2) + f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 2) + f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 3) - f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 3);
    t[2] = f(m, 1, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 1, 3) * f(m, 2, 1) * f(m, 3, 0) + f(m, 1, 3) * f(m, 2, 0) * f(m, 3, 1) - f(m, 1, 0) * f(m, 2, 3) * f(m, 3, 1) - f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 3) + f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 3);
    t[3] = f(m, 1, 2) * f(m, 2, 1) * f(m, 3, 0) - f(m, 1, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 1, 2) * f(m, 2, 0) * f(m, 3, 1) + f(m, 1, 0) * f(m, 2, 2) * f(m, 3, 1) + f(m, 1, 1) * f(m, 2, 0) * f(m, 3, 2) - f(m, 1, 0) * f(m, 2, 1) * f(m, 3, 2);

    t[4] = f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 2) + f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 3) - f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 3);
    t[5] = f(m, 0, 2) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 2) * f(m, 3, 0) + f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 3);
    t[6] = f(m, 0, 3) * f(m, 2, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 2, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 2, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 2, 3) * f(m, 3, 1) + f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 3);
    t[7] = f(m, 0, 1) * f(m, 2, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 2, 1) * f(m, 3, 0) + f(m, 0, 2) * f(m, 2, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 2, 2) * f(m, 3, 1) - f(m, 0, 1) * f(m, 2, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 2, 1) * f(m, 3, 2);

    t[8] = f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 2) - f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 2) - f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 3) + f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 3);
    t[9] = f(m, 0, 3) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 2) + f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 2) + f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 3) - f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 3);
    t[10] = f(m, 0, 1) * f(m, 1, 3) * f(m, 3, 0) - f(m, 0, 3) * f(m, 1, 1) * f(m, 3, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 3, 1) - f(m, 0, 0) * f(m, 1, 3) * f(m, 3, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 3) + f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 3);
    t[11] = f(m, 0, 2) * f(m, 1, 1) * f(m, 3, 0) - f(m, 0, 1) * f(m, 1, 2) * f(m, 3, 0) - f(m, 0, 2) * f(m, 1, 0) * f(m, 3, 1) + f(m, 0, 0) * f(m, 1, 2) * f(m, 3, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 3, 2) - f(m, 0, 0) * f(m, 1, 1) * f(m, 3, 2);

    t[12] = f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 1) - f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 2) + f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 2) + f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 3) - f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 3);
    t[13] = f(m, 0, 2) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 2) * f(m, 2, 0) + f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 2) - f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 2) - f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 3) + f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 3);
    t[14] = f(m, 0, 3) * f(m, 1, 1) * f(m, 2, 0) - f(m, 0, 1) * f(m, 1, 3) * f(m, 2, 0) - f(m, 0, 3) * f(m, 1, 0) * f(m, 2, 1) + f(m, 0, 0) * f(m, 1, 3) * f(m, 2, 1) + f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 3) - f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 3);
    t[15] = f(m, 0, 1) * f(m, 1, 2) * f(m, 2, 0) - f(m, 0, 2) * f(m, 1, 1) * f(m, 2, 0) + f(m, 0, 2) * f(m, 1, 0) * f(m, 2, 1) - f(m, 0, 0) * f(m, 1, 2) * f(m, 2, 1) - f(m, 0, 1) * f(m, 1, 0) * f(m, 2, 2) + f(m, 0, 0) * f(m, 1, 1) * f(m, 2, 2);

    var s = 1.0 / SceneJS_math_determinantMat4(m);
    return SceneJS_math_mulMat4s(t, s);
}

/** @private */
function SceneJS_math_traceMat4(m) {
    return (m[0] + m[5] + m[10] + m[15]);
}

/** @private */
function SceneJS_math_translationMat4v(v) {
    var m = SceneJS_math_identityMat4();
    m[12] = v[0];
    m[13] = v[1];
    m[14] = v[2];
    return m;
}

/** @private */
function SceneJS_math_translationMat4c(x, y, z) {
    return SceneJS_math_translationMat4v([x,y,z]);
}

/** @private */
function SceneJS_math_translationMat4s(s) {
    return SceneJS_math_translationMat4c(s, s, s);
}

/** @private */
function SceneJS_math_rotationMat4v(anglerad, axis) {
    var ax = SceneJS_math_normalizeVec4([axis[0],axis[1],axis[2],0.0]);
    var s = Math.sin(anglerad);
    var c = Math.cos(anglerad);
    var q = 1.0 - c;

    var x = ax[0];
    var y = ax[1];
    var z = ax[2];

    var xx,yy,zz,xy,yz,zx,xs,ys,zs;

    xx = x * x;
    yy = y * y;
    zz = z * z;
    xy = x * y;
    yz = y * z;
    zx = z * x;
    xs = x * s;
    ys = y * s;
    zs = z * s;

    var m = SceneJS_math_mat4();

    m[0] = (q * xx) + c;
    m[1] = (q * xy) + zs;
    m[2] = (q * zx) - ys;
    m[3] = 0.0;

    m[4] = (q * xy) - zs;
    m[5] = (q * yy) + c;
    m[6] = (q * yz) + xs;
    m[7] = 0.0;

    m[8] = (q * zx) + ys;
    m[9] = (q * yz) - xs;
    m[10] = (q * zz) + c;
    m[11] = 0.0;

    m[12] = 0.0;
    m[13] = 0.0;
    m[14] = 0.0;
    m[15] = 1.0;

    return m;
}

/** @private */
function SceneJS_math_rotationMat4c(anglerad, x, y, z) {
    return SceneJS_math_rotationMat4v(anglerad, [x,y,z]);
}

/** @private */
function SceneJS_math_scalingMat4v(v) {
    var m = SceneJS_math_identityMat4();
    m[0] = v[0];
    m[5] = v[1];
    m[10] = v[2];
    return m;
}

/** @private */
function SceneJS_math_scalingMat4c(x, y, z) {
    return SceneJS_math_scalingMat4v([x,y,z]);
}

/** @private */
function SceneJS_math_scalingMat4s(s) {
    return SceneJS_math_scalingMat4c(s, s, s);
}

/** @private */
function SceneJS_math_lookAtMat4v(pos, target, up) {
    var pos4 = [pos[0],pos[1],pos[2],0.0];
    var target4 = [target[0],target[1],target[2],0.0];
    var up4 = [up[0],up[1],up[2],0.0];

    var v = SceneJS_math_normalizeVec4(SceneJS_math_subVec4(target4, pos4));
    var u = SceneJS_math_normalizeVec4(up4);
    var s = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(v, u));

    u = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(s, v));

    var m = SceneJS_math_mat4();

    m[0] = s[0];
    m[1] = u[0];
    m[2] = -v[0];
    m[3] = 0.0;

    m[4] = s[1];
    m[5] = u[1];
    m[6] = -v[1];
    m[7] = 0.0;

    m[8] = s[2];
    m[9] = u[2];
    m[10] = -v[2];
    m[11] = 0.0;

    m[12] = 0.0;
    m[13] = 0.0;
    m[14] = 0.0;
    m[15] = 1.0;

    m = SceneJS_math_mulMat4(m, SceneJS_math_translationMat4v(SceneJS_math_negateVector4(pos4)));

    return m;
}

/** @private */
function SceneJS_math_lookAtMat4c(posx, posy, posz, targetx, targety, targetz, upx, upy, upz) {
    return SceneJS_math_lookAtMat4v([posx,posy,posz], [targetx,targety,targetz], [upx,upy,upz]);
}

/** @private */
function SceneJS_math_orthoMat4v(omin, omax) {
    var omin4 = [omin[0],omin[1],omin[2],0.0];
    var omax4 = [omax[0],omax[1],omax[2],0.0];
    var vsum = SceneJS_math_addVec4(omax4, omin4);
    var vdif = SceneJS_math_subVec4(omax4, omin4);

    var m = SceneJS_math_mat4();

    m[0] = 2.0 / vdif[0];
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;

    m[4] = 0.0;
    m[5] = 2.0 / vdif[1];
    m[6] = 0.0;
    m[7] = 0.0;

    m[8] = 0.0;
    m[9] = 0.0;
    m[10] = -2.0 / vdif[2];
    m[11] = 0.0;

    m[12] = -vsum[0] / vdif[0];
    m[13] = -vsum[1] / vdif[1];
    m[14] = -vsum[2] / vdif[2];
    m[15] = 1.0;

    return m;
}

/** @private */
function SceneJS_math_orthoMat4c(left, right, bottom, top, znear, zfar) {
    return SceneJS_math_orthoMat4v([left,bottom,znear], [right,top,zfar]);
}

/** @private */
function SceneJS_math_frustumMat4v(fmin, fmax) {
    var fmin4 = [fmin[0],fmin[1],fmin[2],0.0];
    var fmax4 = [fmax[0],fmax[1],fmax[2],0.0];
    var vsum = SceneJS_math_addVec4(fmax4, fmin4);
    var vdif = SceneJS_math_subVec4(fmax4, fmin4);
    var t = 2.0 * fmin4[2];

    var m = SceneJS_math_mat4();

    m[0] = t / vdif[0];
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;

    m[4] = 0.0;
    m[5] = t / vdif[1];
    m[6] = 0.0;
    m[7] = 0.0;

    m[8] = vsum[0] / vdif[0];
    m[9] = vsum[1] / vdif[1];
    m[10] = -vsum[2] / vdif[2];
    m[11] = -1.0;

    m[12] = 0.0;
    m[13] = 0.0;
    m[14] = -t * fmax4[2] / vdif[2];
    m[15] = 0.0;

    return m;
}

/** @private */
function SceneJS_math_frustumMatrix4(left, right, bottom, top, znear, zfar) {
    var fmin4 = [left,right,bottom,0.0];
    var fmax4 = [top,znear,zfar,0.0];
    var vsum = SceneJS_math_addVec4(fmax4, fmin4);
    var vdif = SceneJS_math_subVec4(fmax4, fmin4);
    var t = 2.0 * fmin4[2];

    var m = SceneJS_math_mat4();

    m[0] = t / vdif[0];
    m[1] = 0.0;
    m[2] = 0.0;
    m[3] = 0.0;

    m[4] = 0.0;
    m[5] = t / vdif[1];
    m[6] = 0.0;
    m[7] = 0.0;

    m[8] = vsum[0] / vdif[0];
    m[9] = vsum[1] / vdif[1];
    m[10] = -vsum[2] / vdif[2];
    m[11] = -1.0;

    m[12] = 0.0;
    m[13] = 0.0;
    m[14] = -t * fmax4[2] / vdif[2];
    m[15] = 0.0;

    return m;
}

/** @private */
function SceneJS_math_perspectiveMatrix4(fovyrad, aspectratio, znear, zfar) {
    var pmin = new Array(4);
    var pmax = new Array(4);

    pmin[2] = znear;
    pmax[2] = zfar;

    pmax[1] = pmin[2] * Math.tan(fovyrad / 2.0);
    pmin[1] = -pmax[1];

    pmax[0] = pmax[1] * aspectratio;
    pmin[0] = -pmax[0];

    return SceneJS_math_frustumMat4v(pmin, pmax);
}

/** @private */
function SceneJS_math_transformPoint3(m, p) {
    return [
        (m[0] * p[0]) + (m[4] * p[1]) + (m[8] * p[2]) + m[12],
        (m[1] * p[0]) + (m[5] * p[1]) + (m[9] * p[2]) + m[13],
        (m[2] * p[0]) + (m[6] * p[1]) + (m[10] * p[2]) + m[14],
        (m[3] * p[0]) + (m[7] * p[1]) + (m[11] * p[2]) + m[15]
    ];
}

/** @private */
function SceneJS_math_transformPoints3(m, points) {
    var result = new Array(points.length);
    var len = points.length;
    for (var i = 0; i < len; i++) {
        result[i] = SceneJS_math_transformPoint3(m, points[i]);
    }
    return result;
}

/** @private */
function SceneJS_math_transformVector3(m, v) {
    return [
        (m[0] * v[0]) + (m[4] * v[1]) + (m[8] * v[2]),
        (m[1] * v[0]) + (m[5] * v[1]) + (m[9] * v[2]),
        (m[2] * v[0]) + (m[6] * v[1]) + (m[10] * v[2])
    ];
}

/** @private */
function SceneJS_math_projectVec4(v) {
    var f = 1.0 / v[3];
    return [v[0] * f, v[1] * f, v[2] * f, 1.0];
}


/** @private */
function SceneJS_math_Plane3(normal, offset, normalize) {
    this.normal = [0.0, 0.0, 1.0 ];
    this.offset = 0.0;
    if (normal && offset) {
        this.normal[0] = normal[0];
        this.normal[1] = normal[1];
        this.normal[2] = normal[2];
        this.offset = offset;

        if (normalize) {
            var s = Math.sqrt(
                    this.normal[0] * this.normal[0] +
                    this.normal[1] * this.normal[1] +
                    this.normal[2] * this.normal[2]
                    );
            if (s > 0.0) {
                s = 1.0 / s;
                this.normal[0] *= s;
                this.normal[1] *= s;
                this.normal[2] *= s;
                this.offset *= s;
            }
        }
    }
}

/** @private */
const SceneJS_math_MAX_DOUBLE = 1000000000000.0;
/** @private */
const SceneJS_math_MIN_DOUBLE = -1000000000000.0;

/** @private
 *
 */
function SceneJS_math_Box3(min, max) {
    this.min = min || [ SceneJS_math_MAX_DOUBLE,SceneJS_math_MAX_DOUBLE,SceneJS_math_MAX_DOUBLE ];
    this.max = max || [ SceneJS_math_MIN_DOUBLE,SceneJS_math_MIN_DOUBLE,SceneJS_math_MIN_DOUBLE ];

    /** @private */
    this.init = function(min, max) {
        for (var i = 0; i < 3; ++i) {
            this.min[i] = min[i];
            this.max[i] = max[i];
        }
        return this;
    };

    /** @private */
    this.fromPoints = function(points) {
        var points2 = [];
        for (var i = 0; i < points.length; i++) {
            points2.push([points[i][0] / points[i][3], points[i][1] / points[i][3], points[i][2] / points[i][3]]);
        }
        points = points2;
        for (var i = 0; i < points.length; i++) {
            var v = points[i];
            for (var j = 0; j < 3; j++) {
                if (v[j] < this.min[j]) {
                    this.min[j] = v[j];
                }
                if (v[j] > this.max[j]) {
                    this.max[j] = v[j];
                }
            }
        }
        return this;
    };

    /** @private */
    this.isEmpty = function() {
        return (
                (this.min[0] >= this.max[0])
                        && (this.min[1] >= this.max[1])
                        && (this.min[2] >= this.max[2])
                );
    };

    /** @private */
    this.getCenter = function() {
        return [
            (this.max[0] + this.min[0]) / 2.0,
            (this.max[1] + this.min[1]) / 2.0,
            (this.max[2] + this.min[2]) / 2.0
        ];
    };

    /** @private */
    this.getSize = function() {
        return [
            (this.max[0] - this.min[0]),
            (this.max[1] - this.min[1]),
            (this.max[2] - this.min[2])
        ];
    };

    /** @private */
    this.getFacesAreas = function() {
        var s = this.size;
        return [
            (s[1] * s[2]),
            (s[0] * s[2]),
            (s[0] * s[1])
        ];
    };

    /** @private */
    this.getSurfaceArea = function() {
        var a = this.getFacesAreas();
        return ((a[0] + a[1] + a[2]) * 2.0);
    };

    /** @private */
    this.getVolume = function() {
        var s = this.size;
        return (s[0] * s[1] * s[2]);
    };

    /** @private */
    this.getOffset = function(half_delta) {
        for (var i = 0; i < 3; ++i) {
            this.min[i] -= half_delta;
            this.max[i] += half_delta;
        }
        return this;
    };
}

/** @private
 *
 * @param min
 * @param max
 */
function SceneJS_math_AxisBox3(min, max) {
    this.verts = [
        [min[0], min[1], min[2]],
        [max[0], min[1], min[2]],
        [max[0], max[1], min[2]],
        [min[0], max[1], min[2]],

        [min[0], min[1], max[2]],
        [max[0], min[1], max[2]],
        [max[0], max[1], max[2]],
        [min[0], max[1], max[2]]
    ];

    /** @private */
    this.toBox3 = function() {
        var box = new SceneJS_math_Box3();
        for (var i = 0; i < 8; i++) {
            var v = this.verts[i];
            for (var j = 0; j < 3; j++) {
                if (v[j] < box.min[j]) {
                    box.min[j] = v[j];
                }
                if (v[j] > box.max[j]) {
                    box.max[j] = v[j];
                }
            }
        }
    };
}

/** @private
 *
 * @param center
 * @param radius
 */
function SceneJS_math_Sphere3(center, radius) {
    this.center = [center[0], center[1], center[2] ];
    this.radius = radius;

    /** @private */
    this.isEmpty = function() {
        return (this.radius == 0.0);
    };

    /** @private */
    this.surfaceArea = function() {
        return (4.0 * Math.PI * this.radius * this.radius);
    };

    /** @private */
    this.getVolume = function() {
        return ((4.0 / 3.0) * Math.PI * this.radius * this.radius * this.radius);
    };
}

/** Creates billboard matrix from given view matrix
 * @private
 */
function SceneJS_math_billboardMat(viewMatrix) {
    var rotVec = [
        SceneJS_math_getColMat4(viewMatrix, 0),
        SceneJS_math_getColMat4(viewMatrix, 1),
        SceneJS_math_getColMat4(viewMatrix, 2)
    ];

    var scaleVec = [
        SceneJS_math_lenVec4(rotVec[0]),
        SceneJS_math_lenVec4(rotVec[1]),
        SceneJS_math_lenVec4(rotVec[2])
    ];

    var scaleVecRcp = SceneJS_math_rcpVec3(scaleVec);
    var sMat = SceneJS_math_scalingMat4v(scaleVec);
    var sMatInv = SceneJS_math_scalingMat4v(scaleVecRcp);

    rotVec[0] = SceneJS_math_mulVec4Scalar(rotVec[0], scaleVecRcp[0]);
    rotVec[1] = SceneJS_math_mulVec4Scalar(rotVec[1], scaleVecRcp[1]);
    rotVec[2] = SceneJS_math_mulVec4Scalar(rotVec[2], scaleVecRcp[2]);

    var rotMatInverse = SceneJS_math_identityMat4();

    SceneJS_math_setRowMat4(rotMatInverse, 0, rotVec[0]);
    SceneJS_math_setRowMat4(rotMatInverse, 1, rotVec[1]);
    SceneJS_math_setRowMat4(rotMatInverse, 2, rotVec[2]);

    return SceneJS_math_mulMat4(rotMatInverse, sMat);
    // return SceneJS_math_mulMat4(sMat, SceneJS_math_mulMat4(rotMatInverse, sMat));
    //return SceneJS_math_mulMat4(sMatInv, SceneJS_math_mulMat4(rotMatInverse, sMat));
}

/** @private */
function SceneJS_math_FrustumPlane(nx, ny, nz, offset) {
    var s = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    this.normal = [nx * s, ny * s, nz * s];
    this.offset = offset * s;
    this.testVertex = [
        (this.normal[0] >= 0.0) ? (1) : (0),
        (this.normal[1] >= 0.0) ? (1) : (0),
        (this.normal[2] >= 0.0) ? (1) : (0)];
}

/** @private */
const SceneJS_math_OUTSIDE_FRUSTUM = 3;
/** @private */
const SceneJS_math_INTERSECT_FRUSTUM = 4;
/** @private */
const SceneJS_math_INSIDE_FRUSTUM = 5;

/** @private */
function SceneJS_math_Frustum(viewMatrix, projectionMatrix, viewport) {
    var m = SceneJS_math_mulMat4(projectionMatrix, viewMatrix);
    var q = [ m[3], m[7], m[11] ];
    var planes = [
        new SceneJS_math_FrustumPlane(q[ 0] - m[ 0], q[ 1] - m[ 4], q[ 2] - m[ 8], m[15] - m[12]),
        new SceneJS_math_FrustumPlane(q[ 0] + m[ 0], q[ 1] + m[ 4], q[ 2] + m[ 8], m[15] + m[12]),
        new SceneJS_math_FrustumPlane(q[ 0] - m[ 1], q[ 1] - m[ 5], q[ 2] - m[ 9], m[15] - m[13]),
        new SceneJS_math_FrustumPlane(q[ 0] + m[ 1], q[ 1] + m[ 5], q[ 2] + m[ 9], m[15] + m[13]),
        new SceneJS_math_FrustumPlane(q[ 0] - m[ 2], q[ 1] - m[ 6], q[ 2] - m[10], m[15] - m[14]),
        new SceneJS_math_FrustumPlane(q[ 0] + m[ 2], q[ 1] + m[ 6], q[ 2] + m[10], m[15] + m[14])
    ];

    /* Resources for LOD
     */
    var rotVec = [
        SceneJS_math_getColMat4(viewMatrix, 0),
        SceneJS_math_getColMat4(viewMatrix, 1),
        SceneJS_math_getColMat4(viewMatrix, 2)
    ];

    var scaleVec = [
        SceneJS_math_lenVec4(rotVec[0]),
        SceneJS_math_lenVec4(rotVec[1]),
        SceneJS_math_lenVec4(rotVec[2])
    ];

    var scaleVecRcp = SceneJS_math_rcpVec3(scaleVec);
    var sMat = SceneJS_math_scalingMat4v(scaleVec);
    var sMatInv = SceneJS_math_scalingMat4v(scaleVecRcp);

    rotVec[0] = SceneJS_math_mulVec4Scalar(rotVec[0], scaleVecRcp[0]);
    rotVec[1] = SceneJS_math_mulVec4Scalar(rotVec[1], scaleVecRcp[1]);
    rotVec[2] = SceneJS_math_mulVec4Scalar(rotVec[2], scaleVecRcp[2]);

    var rotMatInverse = SceneJS_math_identityMat4();

    SceneJS_math_setRowMat4(rotMatInverse, 0, rotVec[0]);
    SceneJS_math_setRowMat4(rotMatInverse, 1, rotVec[1]);
    SceneJS_math_setRowMat4(rotMatInverse, 2, rotVec[2]);

    this.matrix = SceneJS_math_mulMat4(projectionMatrix, viewMatrix);
    this.billboardMatrix = SceneJS_math_mulMat4(sMatInv, SceneJS_math_mulMat4(rotMatInverse, sMat));
    this.viewport = viewport.slice(0, 4);

    /** @private */
    this.textAxisBoxIntersection = function(box) {
        var ret = SceneJS_math_INSIDE_FRUSTUM;
        var bminmax = [ box.min, box.max ];
        var plane = null;
        for (var i = 0; i < 6; ++i) {
            plane = planes[i];
            if (((plane.normal[0] * bminmax[plane.testVertex[0]][0]) +
                 (plane.normal[1] * bminmax[plane.testVertex[1]][1]) +
                 (plane.normal[2] * bminmax[plane.testVertex[2]][2]) +
                 (plane.offset)) < 0.0) {
                return SceneJS_math_OUTSIDE_FRUSTUM;
            }

            if (((plane.normal[0] * bminmax[1 - plane.testVertex[0]][0]) +
                 (plane.normal[1] * bminmax[1 - plane.testVertex[1]][1]) +
                 (plane.normal[2] * bminmax[1 - plane.testVertex[2]][2]) +
                 (plane.offset)) < 0.0) {
                ret = SceneJS_math_INTERSECT_FRUSTUM;
            }
        }
        return ret;
    };

    /** @private */
    this.getProjectedSize = function(box) {
        var diagVec = SceneJS_math_subVec3(box.max, box.min);

        var diagSize = SceneJS_math_lenVec3(diagVec);

        var size = Math.abs(diagSize);

        var p0 = [
            (box.min[0] + box.max[0]) * 0.5,
            (box.min[1] + box.max[1]) * 0.5,
            (box.min[2] + box.max[2]) * 0.5,
            0.0];

        var halfSize = size * 0.5;
        var p1 = [ -halfSize, 0.0, 0.0, 1.0 ];
        var p2 = [  halfSize, 0.0, 0.0, 1.0 ];

        p1 = SceneJS_math_mulMat4v4(this.billboardMatrix, p1);
        p1 = SceneJS_math_addVec4(p1, p0);
        p1 = SceneJS_math_projectVec4(SceneJS_math_mulMat4v4(this.matrix, p1));

        p2 = SceneJS_math_mulMat4v4(this.billboardMatrix, p2);
        p2 = SceneJS_math_addVec4(p2, p0);
        p2 = SceneJS_math_projectVec4(SceneJS_math_mulMat4v4(this.matrix, p2));

        return viewport[2] * Math.abs(p2[0] - p1[0]);
    };
}



/** Private WebGL support classes
 */



/** Maps SceneJS node parameter names to WebGL enum names
 * @private
 */
const SceneJS_webgl_enumMap = {
    funcAdd: "FUNC_ADD",
    funcSubtract: "FUNC_SUBTRACT",
    funcReverseSubtract: "FUNC_REVERSE_SUBTRACT",
    zero : "ZERO",
    one : "ONE",
    srcColor:"SRC_COLOR",
    oneMinusSrcColor:"ONE_MINUS_SRC_COLOR",
    dstColor:"DST_COLOR",
    oneMinusDstColor:"ONE_MINUS_DST_COLOR",
    srcAlpha:"SRC_ALPHA",
    oneMinusSrcAlpha:"ONE_MINUS_SRC_ALPHA",
    dstAlpha:"DST_ALPHA",
    oneMinusDstAlpha:"ONE_MINUS_DST_ALPHA",
    contantColor:"CONSTANT_COLOR",
    oneMinusConstantColor:"ONE_MINUS_CONSTANT_COLOR",
    constantAlpha:"CONSTANT_ALPHA",
    oneMinusConstantAlpha:"ONE_MINUS_CONSTANT_ALPHA",
    srcAlphaSaturate:"SRC_ALPHA_SATURATE",
    front: "FRONT",
    back: "BACK",
    frontAndBack: "FRONT_AND_BACK",
    never:"NEVER",
    less:"LESS",
    equal:"EQUAL",
    lequal:"LEQUAL",
    greater:"GREATER",
    notequal:"NOTEQUAL",
    gequal:"GEQUAL",
    always:"ALWAYS",
    cw:"CW",
    ccw:"CCW",
    linear: "LINEAR",
    nearest: "NEAREST",
    linearMipMapNearest : "LINEAR_MIPMAP_NEAREST",
    nearestMipMapNearest : "NEAREST_MIPMAP_NEAREST",
    nearestMipMapLinear: "NEAREST_MIPMAP_LINEAR",
    linearMipMapLinear: "LINEAR_MIPMAP_LINEAR",
    repeat: "REPEAT",
    clampToEdge: "CLAMP_TO_EDGE",
    mirroredRepeat: "MIRRORED_REPEAT",
    alpha:"ALPHA",
    rgb:"RGB",
    rgba:"RGBA",
    luminance:"LUMINANCE",
    luminanceAlpha:"LUMINANCE_ALPHA",
    textureBinding2D:"TEXTURE_BINDING_2D",
    textureBindingCubeMap:"TEXTURE_BINDING_CUBE_MAP",
    compareRToTexture:"COMPARE_R_TO_TEXTURE", // Hardware Shadowing Z-depth,
    unsignedByte: "UNSIGNED_BYTE"
};

/** @private
 */
const SceneJS_webgl_fogModes = {
    EXP: 0,
    EXP2: 1,
    LINEAR: 2
};

/** @private */
function SceneJS_webgl_ProgramUniform(context, program, name, type, size, location, logging) {

    var func = null;
    if (type == context.BOOL) {
        func = function (v) {
            context.uniform1i(location, v);
        };
    } else if (type == context.BOOL_VEC2) {
        func = function (v) {
            context.uniform2iv(location, v);
        };
    } else if (type == context.BOOL_VEC3) {
        func = function (v) {
            context.uniform3iv(location, v);
        };
    } else if (type == context.BOOL_VEC4) {
        func = function (v) {
            context.uniform4iv(location, v);
        };
    } else if (type == context.INT) {
        func = function (v) {
            context.uniform1iv(location, v);
        };
    } else if (type == context.INT_VEC2) {
        func = function (v) {
            context.uniform2iv(location, v);
        };
    } else if (type == context.INT_VEC3) {
        func = function (v) {
            context.uniform3iv(location, v);
        };
    } else if (type == context.INT_VEC4) {
        func = function (v) {
            context.uniform4iv(location, v);
        };
    } else if (type == context.FLOAT) {
        func = function (v) {
            context.uniform1f(location, v);
        };
    } else if (type == context.FLOAT_VEC2) {
        func = function (v) {
            context.uniform2fv(location, v);
        };
    } else if (type == context.FLOAT_VEC3) {
        func = function (v) {
            context.uniform3fv(location, v);
        };
    } else if (type == context.FLOAT_VEC4) {
        func = function (v) {
            context.uniform4fv(location, v);
        };
    } else if (type == context.FLOAT_MAT2) {
        func = function (v) {
            context.uniformMatrix2fv(location, context.FALSE, v);
        };
    } else if (type == context.FLOAT_MAT3) {
        func = function (v) {
            context.uniformMatrix3fv(location, context.FALSE, v);
        };
    } else if (type == context.FLOAT_MAT4) {
        func = function (v) {
            context.uniformMatrix4fv(location, context.FALSE, v);
        };
    } else {
        throw "Unsupported shader uniform type: " + type;
    }

        /** @private */
    this.setValue = function(v) {
        func(v);
    };

        /** @private */
    this.getValue = function() {
        return context.getUniform(program, location);
    };
}

/** @private */
function SceneJS_webgl_ProgramSampler(context, program, name, type, size, location, logging) {
    //  logging.debug("Program sampler found in shader: " + name);
    this.bindTexture = function(texture, unit) {
        texture.bind(unit);
        context.uniform1i(location, unit);
    };
}

/** An attribute within a shader
 * @private
 */
function SceneJS_webgl_ProgramAttribute(context, program, name, type, size, location, logging) {
    // logging.debug("Program attribute found in shader: " + name);
    this.bindFloatArrayBuffer = function(buffer) {
        buffer.bind();
        context.enableVertexAttribArray(location);

        context.vertexAttribPointer(location, buffer.itemSize, context.FLOAT, false, 0, 0);   // Vertices are not homogeneous - no w-element
    };

}

/**
 * A vertex/fragment shader in a program
 *
 * @private
 * @param context WebGL context
 * @param gl.VERTEX_SHADER | gl.FRAGMENT_SHADER
 * @param source Source code for shader
 * @param logging Shader will write logging's debug channel as it compiles
 */
function SceneJS_webgl_Shader(context, type, source, logging) {
    this.handle = context.createShader(type);

    //  logging.debug("Creating " + ((type == context.VERTEX_SHADER) ? "vertex" : "fragment") + " shader");
    this.valid = true;

    context.shaderSource(this.handle, source);
    context.compileShader(this.handle);

    if (context.getShaderParameter(this.handle, context.COMPILE_STATUS) != 0) {
        //    logging.debug("Shader compile succeeded:" + context.getShaderInfoLog(this.handle));
    }
    else {
        this.valid = false;
        logging.error("Shader compile failed:" + context.getShaderInfoLog(this.handle));
    }
    if (!this.valid) {
        SceneJS_errorModule.fatalError(
                new SceneJS.ShaderCompilationFailureException("Shader program failed to compile"));
    }
}


/**
 * A program on an active WebGL context
 *
 * @private
 * @param hash SceneJS-managed ID for program
 * @param lastUsed Time program was lst activated, for LRU cache eviction
 * @param context WebGL context
 * @param vertexSources Source codes for vertex shaders
 * @param fragmentSources Source codes for fragment shaders
 * @param logging Program and shaders will write to logging's debug channel as they compile and link
 */
function SceneJS_webgl_Program(hash, lastUsed, context, vertexSources, fragmentSources, logging) {
    this.hash = hash;
    this.lastUsed = lastUsed;

    /* Create shaders from sources
     */
    var shaders = [];
    for (var i = 0; i < vertexSources.length; i++) {
        shaders.push(new SceneJS_webgl_Shader(context, context.VERTEX_SHADER, vertexSources[i], logging));
    }
    for (var i = 0; i < fragmentSources.length; i++) {
        shaders.push(new SceneJS_webgl_Shader(context, context.FRAGMENT_SHADER, fragmentSources[i], logging));
    }

    /* Create program, attach shaders, link and validate program
     */
    var handle = context.createProgram();

    for (var i = 0; i < shaders.length; i++) {
        var shader = shaders[i];
        if (shader.valid) {
            context.attachShader(handle, shader.handle);
        }
    }
    context.linkProgram(handle);
    context.validateProgram(handle);

    this.valid = true;
    this.valid = this.valid && (context.getProgramParameter(handle, context.LINK_STATUS) != 0);
    this.valid = this.valid && (context.getProgramParameter(handle, context.VALIDATE_STATUS) != 0);

    //     logging.debug("Creating shader program: '" + hash + "'");
    if (this.valid) {
        //  logging.debug("Program link succeeded: " + context.getProgramInfoLog(handle));
    }
    else {
        logging.debug("Program link failed: " + context.getProgramInfoLog(handle));
    }

    if (!this.valid) {
        SceneJS_errorModule.fatalError(
                new SceneJS.ShaderLinkFailureException("Shader program failed to link"));
    }

    /* Discover active uniforms and samplers
     */
    var uniforms = {};
    var samplers = {};

    var numUniforms = context.getProgramParameter(handle, context.ACTIVE_UNIFORMS);

    for (var i = 0; i < numUniforms; ++i) {
        var u = context.getActiveUniform(handle, i);
        if (u) {
            var location = context.getUniformLocation(handle, u.name);
            if ((u.type == context.SAMPLER_2D) || (u.type == context.SAMPLER_CUBE) || (u.type == 35682)) {

                samplers[u.name] = new SceneJS_webgl_ProgramSampler(
                        context,
                        handle,
                        u.name,
                        u.type,
                        u.size,
                        location,
                        logging);
            } else {
                uniforms[u.name] = new SceneJS_webgl_ProgramUniform(
                        context,
                        handle,
                        u.name,
                        u.type,
                        u.size,
                        location,
                        logging);
            }
        }
    }

    /* Discover attributes
     */
    var attributes = {};

    var numAttribs = context.getProgramParameter(handle, context.ACTIVE_ATTRIBUTES);
    for (var i = 0; i < numAttribs; i++) {
        var a = context.getActiveAttrib(handle, i);
        if (a) {
            var location = context.getAttribLocation(handle, a.name);
            attributes[a.name] = new SceneJS_webgl_ProgramAttribute(
                    context,
                    handle,
                    a.name,
                    a.type,
                    a.size,
                    location,
                    logging);
        }
    }

    /** @private */
    this.bind = function() {
        context.useProgram(handle);
    };


    /** @private */
    this.setUniform = function(name, value) {
        var u = uniforms[name];
        if (u) {
            u.setValue(value);
        } else {
            //    logging.warn("Shader uniform load failed - uniform not found in shader : " + name);
        }
    };

    /** @private */
    this.bindFloatArrayBuffer = function(name, buffer) {
        var attr = attributes[name];
        if (attr) {
            attr.bindFloatArrayBuffer(buffer);
        } else {
            //  logging.warn("Shader attribute bind failed - attribute not found in shader : " + name);
        }
    };

    /** @private */
    this.bindTexture = function(name, texture, unit) {
        var sampler = samplers[name];
        if (sampler) {
            sampler.bindTexture(texture, unit);
        } else {
            //  logging.warn("Sampler not found: " + name);
        }
    };

    /** @private
     */
    this.unbind = function() {
        //     context.useProgram(0);
    };

    /** @private */
    this.destroy = function() {
        if (this.valid) {
            //   logging.debug("Destroying shader program: '" + hash + "'");
            context.deleteProgram(handle);
            for (var s in shaders) {
                context.deleteShader(shaders[s].handle);
            }
            attributes = null;
            uniforms = null;
            samplers = null;
            this.valid = false;
        }
    };
}

/** @private */
function SceneJS_webgl_Texture2D(context, cfg) {
    //  cfg.logging.debug("Creating texture: '" + cfg.textureId + "'");
    this.canvas = cfg.canvas;
    this.textureId = cfg.textureId;
    this.handle = context.createTexture();
    this.target = context.TEXTURE_2D;
    this.minFilter = cfg.minFilter;
    this.magFilter = cfg.magFilter;
    this.wrapS = cfg.wrapS;
    this.wrapT = cfg.wrapT;

    context.bindTexture(this.target, this.handle);

    if (cfg.image) {

        /* Texture from image
         */
        context.texImage2D(context.TEXTURE_2D, 0, cfg.image, cfg.flipY);

        this.format = context.RGBA;
        this.width = cfg.image.width;
        this.height = cfg.image.height;
        this.isDepth = false;
        this.depthMode = 0;
        this.depthCompareMode = 0;
        this.depthCompareFunc = 0;

    } else {

        /* Texture from data
         */
        if (!cfg.texels) {
            if (cfg.sourceType == context.FLOAT) {
                cfg.texels = new WebGLFloatArray(cfg.width * cfg.height * 4);
            }
            else {
                cfg.texels = new WebGLUnsignedByteArray(cfg.width * cfg.height * 4);
            }
        }

        context.texImage2D(context.TEXTURE_2D, 0, cfg.internalFormat, cfg.width, cfg.height, 0, cfg.sourceFormat, cfg.sourceType, cfg.texels);

        if (cfg.isDepth) {
            if (cfg.depthMode) {
                context.texParameteri(context.TEXTURE_2D, context.DEPTH_TEXTURE_MODE, cfg.depthMode);
            }
            if (cfg.depthCompareMode) {
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_MODE, cfg.depthCompareMode);
            }
            if (cfg.depthCompareFunc) {
                context.texParameteri(context.TEXTURE_2D, context.TEXTURE_COMPARE_FUNC, cfg.depthCompareFunc);
            }
        }

        this.format = cfg.internalFormat;
        this.width = cfg.width;
        this.height = cfg.height;
        this.isDepth = cfg.isDepth;
        this.depthMode = cfg.depthMode;
        this.depthCompareMode = cfg.depthCompareMode;
        this.depthCompareFunc = cfg.depthCompareFunc;
    }

    if (cfg.minFilter) {
        context.texParameteri(// Filtered technique when scaling texture down
                context.TEXTURE_2D,
                context.TEXTURE_MIN_FILTER,
                cfg.minFilter);
    }

    if (cfg.magFilter) {
        context.texParameteri(// Filtering technique when scaling texture up
                context.TEXTURE_2D,
                context.TEXTURE_MAG_FILTER,
                cfg.magFilter);
    }
    if (cfg.wrapS) {
        context.texParameteri(
                context.TEXTURE_2D,
                context.TEXTURE_WRAP_S,
                cfg.wrapS);
    }

    if (cfg.wrapT) {
        context.texParameteri(
                context.TEXTURE_2D,
                context.TEXTURE_WRAP_T,
                cfg.wrapT);
    }

    /* Generate MIP map if required
     */
    if (cfg.minFilter == context.NEAREST_MIPMAP_NEAREST ||
        cfg.minFilter == context.LINEAR_MIPMAP_NEAREST ||
        cfg.minFilter == context.NEAREST_MIPMAP_LINEAR ||
        cfg.minFilter == context.LINEAR_MIPMAP_LINEAR) {

        context.generateMipmap(context.TEXTURE_2D);
    }

    context.bindTexture(this.target, null);

    /** @private */
    this.bind = function(unit) {
        context.activeTexture(context["TEXTURE" + unit]);
        context.bindTexture(this.target, this.handle);

    };

    /** @private */
    this.unbind = function(unit) {
        context.activeTexture(context["TEXTURE" + unit]);
        context.bindTexture(this.target, null);
    };

    /** @private */
    this.generateMipmap = function() {
        context.generateMipmap(context.TEXTURE_2D);
    };

    /** @private */
    this.destroy = function() {
        if (this.handle) {
            // cfg.logging.debug("Destroying texture");
            context.deleteTexture(this.handle);
            this.handle = null;
        }
    };
}

/** Buffer for vertices and indices
 *
 * @private
 * @param context  WebGL context
 * @param type     Eg. ARRAY_BUFFER, ELEMENT_ARRAY_BUFFER
 * @param values   WebGL array wrapper
 * @param numItems Count of items in array wrapper
 * @param itemSize Size of each item
 * @param usage    Eg. STATIC_DRAW
 */
function SceneJS_webgl_ArrayBuffer(context, type, values, numItems, itemSize, usage) {
    this.handle = context.createBuffer();
    context.bindBuffer(type, this.handle);
    context.bufferData(type, values, usage);
    context.bindBuffer(type, null);

    this.type = type;
    this.numItems = numItems;
    this.itemSize = itemSize;

        /** @private */
    this.bind = function() {
        context.bindBuffer(type, this.handle);
    };

        /** @private */
    this.unbind = function() {
        context.bindBuffer(type, null);
    };

        /** @private */
    this.destroy = function() {
        context.deleteBuffer(this.handle);
    };
}

//Copyright (c) 2009 The Chromium Authors. All rights reserved.
//Use of this source code is governed by a BSD-style license that can be
//found in the LICENSE file.

// Various functions for helping debug WebGL apps.

WebGLDebugUtils = function() {

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Map of valid enum function argument positions.
 */

var glValidEnumContexts = {

       // Generic setters and getters

       'enable': { 0:true },
       'disable': { 0:true },
       'getParameter': { 0:true },

       // Rendering

       'drawArrays': { 0:true },
       'drawElements': { 0:true, 2:true },

       // Shaders

       'createShader': { 0:true },
       'getShaderParameter': { 1:true },
       'getProgramParameter': { 1:true },

       // Vertex attributes

       'getVertexAttrib': { 1:true },
       'vertexAttribPointer': { 2:true },

       // Textures

       'bindTexture': { 0:true },
       'activeTexture': { 0:true },
       'getTexParameter': { 0:true, 1:true },
       'texParameterf': { 0:true, 1:true },
       'texParameteri': { 0:true, 1:true, 2:true },
       'texImage2D': { 0:true, 2:true, 6:true, 7:true },
       'texSubImage2D': { 0:true, 6:true, 7:true },
       'copyTexImage2D': { 0:true, 2:true },
       'copyTexSubImage2D': { 0:true },
       'generateMipmap': { 0:true },

       // Buffer objects

       'bindBuffer': { 0:true },
       'bufferData': { 0:true, 2:true },
       'bufferSubData': { 0:true },
       'getBufferParameter': { 0:true, 1:true },

       // Renderbuffers and framebuffers

       'pixelStorei': { 0:true, 1:true },
       'readPixels': { 4:true, 5:true },
       'bindRenderbuffer': { 0:true },
       'bindFramebuffer': { 0:true },
       'checkFramebufferStatus': { 0:true },
       'framebufferRenderbuffer': { 0:true, 1:true, 2:true },
       'framebufferTexture2D': { 0:true, 1:true, 2:true },
       'getFramebufferAttachmentParameter': { 0:true, 1:true, 2:true },
       'getRenderbufferParameter': { 0:true, 1:true },
       'renderbufferStorage': { 0:true, 1:true },

       // Frame buffer operations (clear, blend, depth test, stencil)

       'clear': { 0:true },
       'depthFunc': { 0:true },
       'blendFunc': { 0:true, 1:true },
       'blendFuncSeparate': { 0:true, 1:true, 2:true, 3:true },
       'blendEquation': { 0:true },
       'blendEquationSeparate': { 0:true, 1:true },
       'stencilFunc': { 0:true },
       'stencilFuncSeparate': { 0:true, 1:true },
       'stencilMaskSeparate': { 0:true },
       'stencilOp': { 0:true, 1:true, 2:true },
       'stencilOpSeparate': { 0:true, 1:true, 2:true, 3:true },

       // Culling

       'cullFace': { 0:true },
       'frontFace': { 0:true },
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Returns true if 'value' matches any WebGL enum, and the i'th parameter
 * of the WebGL function 'fname' is expected to be (any) enum. Does not
 * check that 'value' is actually a valid i'th parameter to 'fname', as
 * that will be checked by the WebGL implementation itself.
 *
 * @param {string} fname the GL function to use for screening the enum
 * @param {integer} i the parameter index to use for screening the enum
 * @param {any} value the value to check for being a valid i'th parameter to 'fname'
 * @return {boolean} true if value matches one of the defined WebGL enums,
 *         and the i'th parameter to 'fname' is expected to be an enum
 *
 * @author Tomi Aarnio
 */
function mightBeValidEnum(fname, i, value) {
       if (!mightBeEnum(value)) return false;
       return (fname in glValidEnumContexts) && (i in glValidEnumContexts[fname]);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? name :
      ("*UNKNOWN WebGL ENUM (0x" + value.toString(16) + ")");
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 */
function makeDebugContext(ctx, opt_onErrorFunc) {
  init(ctx);
  function formatFunctionCall(functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        for (var ii = 0; ii < args.length; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              (mightBeEnum(args[ii]) ? glEnumToString(args[ii]) : args[ii]);
        }
        return functionName +  "(" + argStr + ")";
      };

  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        log("WebGL error "+ glEnumToString(err) + " in "+
            formatFunctionCall(functionName, args));
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  var tracing = false;

  ctx.setTracing = function (newTracing) {
      if (!tracing && newTracing) {
        log('gl.setTracing(' + newTracing + ');');
      }
      tracing = newTracing;
  }

  var escapeDict = {
    '\'' : '\\\'',
    '\"' : '\\\"',
    '\\' : '\\\\',
    '\b' : '\\b',
    '\f' : '\\f',
    '\n' : '\\n',
    '\r' : '\\r',
    '\t' : '\\t'
  };

  function quote(s) {
    var q = '\'';
    var l = s.length;
    for (var i = 0; i < l; i++) {
        var c = s.charAt(i);
        var d = s.charCodeAt(i);
        var e = escapeDict[c];
        if ( e != undefined ) {
            q += e;
        } else if ( d < 32 || d >= 128 ) {
            var h = '000' + d.toString(16);
            q += '\\u' + h.substring(h.length - 4);
        } else {
            q += s.charAt(i);
        }
    }
    q += '\'';
    return q;
  }

  function genSymMaker(name) {
      var counter = 0;
      return function() {
          var sym = name + counter;
          counter++;
          return sym;
      }
  }

  var constructorDict = {
    "createBuffer" : genSymMaker("buffer"),
    "createFrameBuffer": genSymMaker("frameBuffer"),
    "createProgram": genSymMaker("program"),
    "createRenderbuffer": genSymMaker("renderBuffer"),
    "createShader": genSymMaker("shader"),
    "createTexture": genSymMaker("texture"),
    "getUniformLocation": genSymMaker("uniformLocation"),
    "readPixels": genSymMaker("pixels")
  };

  var objectNameProperty = '__webgl_trace_name__';

  var arrayTypeDict = {
    "[object WebGLByteArray]" : "WebGLByteArray",
    "[object WebGLUnsignedByteArray]" : "WebGLUnsignedByteArray",
    "[object WebGLShortArray]" : "WebGLShortArray",
    "[object WebGLUnsignedShortArray]" : "WebGLUnsignedShortArray",
    "[object WebGLIntArray]" : "WebGLIntArray",
    "[object WebGLUnsignedIntArray]" : "WebGLUnsignedIntArray",
    "[object WebGLFloatArray]" : "WebGLFloatArray"
  }

  function asWebGLArray(a) {
    var arrayType = arrayTypeDict[a];
    if (arrayType === undefined) {
        return undefined;
    }
    var buf = 'new ' + arrayType + '( [';
    for (var i = 0; i < a.length; i++) {
        if (i > 0 ) {
            buf += ', ';
        }
        buf += a.get(i);
    }
    buf += '] )';
    return buf;
  };

  function traceFunctionCall(functionName, args) {
        var argStr = "";
        for (var ii = 0; ii < args.length; ++ii) {
            var arg = args[ii];
            if ( ii > 0 ) {
                argStr += ', ';
            }
            var objectName;
            try {
            if (arg !== null) {
                objectName = arg[objectNameProperty];
            }
            } catch (e) {
                alert(functionName);
                throw e;
            }
            var webGLArray = asWebGLArray(arg);
            if (objectName != undefined ) {
                argStr += objectName;
            } else if (webGLArray != undefined) {
                argStr += webGLArray;
            }else if (typeof(arg) == "string") {
                argStr += quote(arg);
            } else if ( mightBeValidEnum(functionName, ii, arg) ) {
                argStr += 'gl.' + glEnumToString(arg);
            } else {
                argStr += arg;
            }
        }
        return "gl." + functionName +  "(" + argStr + ");";
  };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      var resultName;
      if (tracing) {
          var prefix = '';
          // Should we remember the result for later?
          objectNamer = constructorDict[functionName];
          if (objectNamer != undefined) {
              resultName = objectNamer();
              prefix = 'var ' + resultName + ' = ';
          }
          log(prefix + traceFunctionCall(functionName, arguments));
      }

      var result = ctx[functionName].apply(ctx, arguments);

      if (tracing && resultName != undefined) {
          result[objectNameProperty] = resultName;
      }

      var err = ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
      wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
     } else {
       wrapper[propertyName] = ctx[propertyName];
     }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow[err]) {
        glErrorShadow[err] = false;
        return err;
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

return {
  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to" +
   *            funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   */
  'makeDebugContext': makeDebugContext
};

}();
/**
 * @class Data scope that is passed as the single argument to the callback function that many scene node classes may be
 * dynamically configured through.
 * <p>These are created whenever data is generated within a scene graph, to transport the data down to sub-nodes.</p>
 * <p>Some nodes that create these are: SceneJS.Scene when rendered, SceneJs.WithData and SceneJS.ScalarInterpolator.</p>.
 * <p><b>Example:</b></p><p>Nested creation of these will form a linked chain of data scopes. The outer SceneJS.WithData
 * node creates one SceneJS.Data with "sizeX" and "sizeY" properties, then the inner SceneJS.WithData chains another SceneJS.Data
 * onto that with a "sizeZ" property. The dynamic config callback on the SceneJS.Scale node then hunts up the chain to
 * get the properties for its SceneJS.Scale node.</b></p><pre><code>
 *
 * var wd new SceneJS.WithData({
 *          sizeX: 5,
 *          sizeY: 6
 *      },
 *      new SceneJS.Translate({ x: 100 },
 *
 *          var wd new SceneJS.WithData({
 *              sizeZ: 2
 *          },
 *          new SceneJS.Scale(function(data) {        // Here's our SceneJS.Data object
 *                   return {
 *                       x: data.get("sizeX"),
 *                       y: data.get("sizeY"),
 *                       z: data.get("sizeZ")
 *                   }
 *          },
 *
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 * </code></pre>
 */
SceneJS.Data = function(_parent, _fixed, _data) {
    this._parent = _parent;
    this._data = _data || {};
    this._fixed = _fixed || (_parent ? _parent._fixed : false);

    /** Hunts up the data scope chain to get the property with the given key, getting it off the
     * first data scope that has it.
     * @param {String} key Name of property
     * @returns {Object} The property
     */
    this.get = function(key) {
        var value = this._data[key];
        if ((value == 0) || value) {
            return value;
        }
        if (!this._parent) {
            return null;
        }
        return this._parent.get(key);
    };

    /**
     * Returns true if all data on the scope chain is fixed, ie. will not change between scene graph traversals.
     * @returns {boolean}
     */
    this.isFixed = function() {
        return this._fixed;
    };
};
/**
 @class The basic scene node type, providing the ability to connect nodes into parent-child relationships to form scene graphs.
 @constructor
 Create a new SceneJS.node
 @param {SceneJS.node, ...} arguments Zero or more child nodes
 */
SceneJS.Node = function() {
    this._nodeType = "node";
    this._children = [];
    this._fixedParams = true;
    this._parent = null;

    /* Used by many node types to track the level at which they can
     * memoise internal state. When rendered, a node increments
     * this each time it discovers that it can cache more state, so that
     * it knows not to recompute that state when next rendered.
     * Since internal state is usually dependent on the states of higher
     * nodes, this is reset whenever the node is attached to a new
     * parent.
     *
     * private
     */
    this._memoLevel = 0;

    /* Configure from variable args
     */
    if (arguments.length > 0) {
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg._render) {                      // arg is node
                this._children.push(arg);
            } else if (i == 0) {                    // arg is config
                if (arg instanceof Function) {      // arg is config function
                    this._getParams = arg;
                    this._fixedParams = false;
                } else {
                    var config = arg;               // arg is config object
                    this._fixedParams = true;
                    for (var key in arg) {
                        if (arg.hasOwnProperty(key)) {
                            if (this._fixedParams && arg[key] instanceof Function) {
                                this._fixedParams = false;
                            }
                        }
                    }
                    this._getParams = function() {  // Wrap with function to return config object
                        return config;
                    };
                }
            } else {
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException
                        ("Invalid node parameters - config should be first, IE. node(config, node, node,...)"));
            }
        }
        if (!this._getParams) {
            this._getParams = function() {
                return {
                };
            };
        }
    } else {
        if (!this._getParams) {
            this._getParams = function() {
                return {};
            };
        }
    }
};

SceneJS.Node.prototype.constructor = SceneJS.Node;

/**
 * Resets memoization level to zero - used when moving nodes around in graph
 * @private
 */
SceneJS.Node.prototype._resetMemoLevel = function() {
    this._memoLevel = 0;
    for (var i = 0; i < this._children.length; i++) {
        this._children[i]._resetMemoLevel();
    }
};

/** @private */
SceneJS.Node.prototype._renderNodes = function(traversalContext, data) {
    var child;
    var len = this._children.length;
    if (len) {
        for (var i = 0; i < len; i++) {
            child = this._children[i];
            child._render.call(child, { // Traversal context
                appendix : traversalContext.appendix,
                insideRightFringe: traversalContext.insideRightFringe || (i < len - 1)
            }, data);
        }
    } else {

        /* Leaf node - if on right fringe of tree then
         * render appended nodes
         */
        if (traversalContext.appendix && (!traversalContext.insideRightFringe)) {
            len = traversalContext.appendix.length;
            for (var i = 0; i < len; i++) {
                child = traversalContext.appendix[i];
                child._render.call(child, { // Traversal context
                    appendix : null,
                    insideRightFringe: (i < len - 1)
                }, data);
            }
        }
    }
};

/** @private */
SceneJS.Node.prototype._renderNode = function(index, traversalContext, data) {
    var child = this._children[index];
    child._render.call(child, traversalContext, data);
};

/** @private */
SceneJS.Node.prototype._render = function(traversalContext, data) {
    this._renderNodes(traversalContext, data);
};

/**
 * Returns the number of child nodes
 * @returns {int} Number of child nodes
 */
SceneJS.Node.prototype.getNumNodes = function() {
    return this._children.length;
};

/** Returns child nodes
 * @returns {Array} Child nodes
 */
SceneJS.Node.prototype.getNodes = function() {
    var list = new Array(this._children.length);
    var len = this._children.length;
    for (var i = 0; i < len; i++) {
        list[i] = this._children[i];
    }
    return list;
};

///** Sets child nodes, removing those already present
// * @param {Array} children Array of child nodes
// * @return this
// */
//SceneJS.Node.prototype.setNodes = function(children) {
//    throw "SceneJS.node.setNodes not implemented yet";
//    return this;
//};

/** Returns child node at given index
 * @returns {SceneJS.Node} Child node
 */
SceneJS.Node.prototype.getNodeAt = function(index) {
    return this._children[index];
};

/** Removes the child node at the given index
 * @param {int} index Child node index
 */
SceneJS.Node.prototype.removeNodeAt = function(index) {
    var r = this._children.splice(index, 1);
    if (r.length > 0) {
        r[0]._parent = null;
        return r[0];
    } else {
        return null;
    }
};

/** Appends a child node
 * @param {SceneJS.Node} node Child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.addNode = function(node) {
    if (node._parent != null) {
    }
    this._children.push(node);
    node._parent = this;
    node._resetMemoLevel();
    return node;
};

/** Inserts a child node
 * @param {SceneJS.Node} node Child node
 * @param {int} i Index for new child node
 * @return {SceneJS.Node} The child node
 */
SceneJS.Node.prototype.insertNode = function(node, i) {
    if (node._parent != null) {
    }
    if (i == undefined || i <= 0) {
        this._children.unshift(node);
    } else if (i >= this._children.length) {
        this._children.push(node);
    } else {
        this._children.splice(i, 0, node);
    }
    node._parent = this;
    node._resetMemoLevel();
    return node;
};

/** Returns the parent node
 * @return {SceneJS.Node} The parent node
 */
SceneJS.Node.prototype.getParent = function() {
    return this._parent;
};

/** Returns either all child or all sub-nodes of the given type, depending on whether search is recursive or not.
 * @param {string} type Node type
 * @param {boolean} recursive When true, will return all matching nodes in subgraph, otherwise returns just children (default)
 * @return {SceneJS.node[]} Array of matching nodes
 */
SceneJS.Node.prototype.findNodesByType = function(type, recursive) {
    return this._findNodesByType(type, [], recursive);
};

/** @private */
SceneJS.Node.prototype._findNodesByType = function(type, list, recursive) {
    for (var i = 0; i < this._children; i++) {
        var node = this._children[i];
        if (node.nodeType == type) {
            list.add(node);
        }
    }
    if (recursive) {
        for (var i = 0; i < this._children; i++) {
            this._children[i]._findNodesByType(type, list, recursive);
        }
    }
    return list;
};

/** Returns a new SceneJS.Node instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Node constructor
 * @returns {SceneJS.Node}
 */
SceneJS.node = function() {
    var n = new SceneJS.Node();
    SceneJS.Node.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend module that defines SceneJS events and provides an interface on the backend context through which
 * backend modules can fire and subscribe to them.
 *
 * Events are actually somewhat more like commands; they are always synchronous, and are often used to decouple the
 * transfer of data between backends, request events in response, and generally trigger some immediate action.
 *
 * Event subscription can optionally be prioritised, to control the order in which the subscriber will be notified of
 * a given event relative to other suscribers. This is useful, for example, when a backend must be the first to handle
 * an INIT, or the last to handle a RESET.
 *
 * @private
 */
var SceneJS_eventModule = new (function() {

    this.ERROR = 0;
    this.INIT = 1;                           // SceneJS framework initialised
    this.RESET = 2;                          // SceneJS framework reset
    this.TIME_UPDATED = 3;                   // System time updated
    this.SCENE_CREATED = 4;                  // Scene has just been created
    this.SCENE_ACTIVATED = 5;                // Scene about to be traversed
    this.SCENE_DEACTIVATED = 6;              // Scene just been completely traversed
    this.SCENE_DESTROYED = 7;                // Scene just been destroyed
    this.RENDERER_UPDATED = 8;                // Current WebGL context has been updated to the given state
    this.RENDERER_EXPORTED = 9;               // Export of the current WebGL context state
    this.CANVAS_ACTIVATED = 10;
    this.CANVAS_DEACTIVATED = 11;
    this.VIEWPORT_UPDATED = 12;
    this.GEOMETRY_UPDATED = 13;
    this.GEOMETRY_EXPORTED = 14;
    this.MODEL_TRANSFORM_UPDATED = 15;
    this.MODEL_TRANSFORM_EXPORTED = 16;
    this.PROJECTION_TRANSFORM_UPDATED = 17;
    this.PROJECTION_TRANSFORM_EXPORTED = 18;
    this.VIEW_TRANSFORM_UPDATED = 19;
    this.VIEW_TRANSFORM_EXPORTED = 20;
    this.LIGHTS_UPDATED = 21;
    this.LIGHTS_EXPORTED = 22;
    this.MATERIAL_UPDATED = 23;
    this.MATERIAL_EXPORTED = 24;
    this.TEXTURES_UPDATED = 25;
    this.TEXTURES_EXPORTED = 26;
    this.SHADER_ACTIVATE = 27;
    this.SHADER_ACTIVATED = 28;
    this.SHADER_RENDERING = 29;
    this.SHADER_DEACTIVATED = 30;
    this.FOG_UPDATED = 31;
    this.FOG_EXPORTED = 32;
    this.NAME_UPDATED = 33;
    this.PROCESS_CREATED = 34;
    this.PROCESS_KILLED = 35;
    this.PROCESS_TIMED_OUT = 36;

    /* Priority queue for each type of event
     */
    var events = new Array(37);

    /**
     * Registers a handler for the given event
     *
     * The handler can be registered with an optional priority number which specifies the order it is
     * called among the other handler already registered for the event.
     *
     * So, with n being the number of commands registered for the given event:
     *
     * (priority <= 0)      - command will be the first called
     * (priority >= n)      - command will be the last called
     * (0 < priority < n)   - command will be called at the order given by the priority
     * @private
     * @param type Event type - one of the values in SceneJS_eventModule
     * @param command - Handler function that will accept whatever parameter object accompanies the event
     * @param priority - Optional priority number (see above)
     */
    this.onEvent = function(type, command, priority) {
        var list = events[type];
        if (!list) {
            list = [];
            events[type] = list;
        }
        var handler = {
            command: command,
            priority : (priority == undefined) ? list.length : priority
        };
        for (var i = 0; i < list.length; i++) {
            if (list[i].priority > handler.priority) {
                list.splice(i, 0, handler);
                return;
            }
        }
        list.push(handler);
    };

    /**
     * @private
     */
    this.fireEvent = function(type, params) {
        var list = events[type];
        if (list) {
            if (!params) {
                params = {};
            }
            for (var i = 0; i < list.length; i++) {
                list[i].command(params);
            }
        }
    };
})();


/** <p>Adds a listener to be notified when a given event occurs within SceneJS.</p>
 * <p><b>Supported events</b></p>
 * <p><b><em>error</em></b></p><p>An error has occurred either while defining or rendering a scene. These can be either fatal,
 * or errors that SceneJS can recover from.</p><p>Example:</p><pre><code>
 * SceneJS.onEvent("error", function(e) {
 *     if (e.exception.message) {
 *         alert("Error: " + e.exception.message);
 *     } else {
 *         alert("Error: " + e.exception);
 *     }
*  });
 * </pre></code>
 *
 * <p><b><em>reset</em></b></p><p>The SceneJS framework has been reset, where all SceneJS.Scene instances are destroyed and resources
 * held for them freed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "reset",
 *      function(e) {
 *          alert("SceneJS has been reset");
 *      });
 * </pre></code>

 * <p><b><em>scene-created</em></b></p><p>A SceneJS.Scene has been defined.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-created",
 *      function(e) {
 *          alert("A new Scene has been created - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-activated</em></b></p><p>Traversal (render) of a SceneJS.Scene has just begun.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-activated",
 *      function(e) {
 *          alert("Rendering of a new Scene has just begun - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>canvas-activated</em></b></p><p>A canvas has just been activated for a Scene, where the Scene is about to start
 * rendering to it. This will come right after a "scene-activated" event, which will indicate which Scene is the one
 * about to do the rendering.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "canvas-activated",
 *      function(e) {
 *          var canvas = e.canvas;
 *          var context = e.context;
 *          var canvasId = e.canvasId;
 *          alert("Canvas is about to be rendered to : " + canvasId);
 *      });
 * </pre></code>
 *
 * <p><b><em>process-created</em></b></p><p>An asynchronous process has started within a Scene. Processes track the progress of
 * tasks such as the loading of remotely-stored content by SceneJS.Load and SceneJS.LoadCollada nodes. This event is
 * paticularly useful to monitor for content loading. Since loads are triggered in one scene traversal, and then loaded
 * content is integrated during a subsequent traversal, you might listen for this along with "process-killed" on a
 * non-animated scene to ensure that a final scene image is rendered once all loads have completed and content
 * integrated.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-created",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>process-timed-out</em></b></p><p>An asynchronous process has timed out. This will be followed by a "process-killed" event.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-timed-out",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>process-killed</em></b></p><p>An asynchronous process has finished.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "process-killed",
 *      function(e) {
 *          var sceneId = e.sceneId;
 *          var processId = e.process.id;
 *          var timeStarted = e.process.timeStarted;
 *          var description = e.process.description;
 *          var timeoutSecs = e.process.timeoutSecs;
 *
 *          // ...
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-deactivated</em></b></p><p>A SceneJS.Scene traversal has completed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-created",
 *      function(e) {
 *          alert("Traversal completed for Scene - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 *
 * <p><b><em>scene-destroyed</em></b></b></p><p>A SceneJS.Scene traversal has been destroyed.</p><p>Example:</p><pre><code>
 *  SceneJS.onEvent(
 *      "scene-destroyed",
 *      function(e) {
 *          alert("Scene has been destroyed - scene ID: " + e.sceneId);
 *      });
 * </pre></code>
 * @param name Event name
 * @param func Callback function
 */
SceneJS.onEvent = function(name, func) {
    switch (name) {

        /**
         * @event error
         * Fires when the data cache has changed in a bulk manner (e.g., it has been sorted, filtered, etc.) and a
         * widget that is using this Store as a Record cache should refresh its view.
         * @param {Store} this
         */
        case "error" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.ERROR,
                function(params) {
                    func({
                        exception: params.exception,
                        fatal: params.fatal
                    });
                });
            break;

        case "reset" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.RESET,
                function() {
                    func();
                });
            break;

        case "scene-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_CREATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_ACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "canvas-activated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.CANVAS_ACTIVATED,
                function(params) {
                    func({
                        canvas: params.canvas
                    });
                });
            break;

        case "process-created" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_CREATED,
                function(params) {
                    func(params);
                });
            break;

        case "process-timed-out" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_TIMED_OUT,
                function(params) {
                    func(params);
                });
            break;

        case "process-killed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.PROCESS_KILLED,
                function(params) {
                    func(params);
                });
            break;

        case "scene-deactivated" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DEACTIVATED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        case "scene-destroyed" : SceneJS_eventModule.onEvent(
                SceneJS_eventModule.SCENE_DESTROYED,
                function(params) {
                    func({
                        sceneId : params.sceneId
                    });
                });
            break;

        default:
            throw "SceneJS.onEvent - this event type not supported: '" + name + "'";
    }
};

/**
 * Backend module that provides single point through which exceptions may be raised
 *
 * @private
 */
var SceneJS_errorModule = new (function() {

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                var time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    // @private
    this.fatalError = function(e) {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            exception: e,
            fatal: true
        });
        throw e;
    };

    // @private
    this.error = function(e) {
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.ERROR, {
            exception: e,
            fatal: false
        });
    };
})();
/**
 * Backend module that provides the current system time, updating it every time a scene is rendered
 *  @private
 */
var SceneJS_timeModule = new (function() {

    var time = (new Date()).getTime();

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                time = (new Date()).getTime();
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.TIME_UPDATED, time);
            });

    this.getTime = function() {
        return time;
    };
})();
/**
 * Backend module to provide logging that is aware of the current location of scene traversal.
 *
 * There are three "channels" of log message: error, warning, info and debug.
 *
 * Provides an interface on the backend context through which other backends may log messages.
 *
 * Provides an interface to scene nodes to allow them to log messages, as well as set and get the function
 * that actually processes messages on each channel. Those getters and setters are used by the SceneJS.logging node,
 * which may be distributed throughout a scene graph to cause messages to be processed in particular ways for different
 * parts of the graph.
 *
 * Messages are queued. Initially, each channel has no function set for it and will queue messages until a function is
 * set, at which point the queue flushes.  If the function is unset, subsequent messages will queue, then flush when a
 * function is set again. This allows messages to be logged before any SceneJS.logging node is visited.
 *
 * This backend is always the last to handle a RESET
 *
 *  @private
 *
 */
var SceneJS_loggingModule = new (function() {

    var activeSceneId;
    var funcs = null;
    var queues = {};
    var indent = 0;
    var indentStr = "";

    /**
     * @private
     */
    function log(channel, message) {
        message = activeSceneId
                ? indentStr + activeSceneId + ": " + message
                : indentStr + message;
        var func = funcs ? funcs[channel] : null;
        if (func) {
            func(message);
        } else {
            var queue = queues[channel];
            if (!queue) {
                queue = queues[channel] = [];
            }
            queue.push(message);
        }
    }

    /**
     * @private
     */
    function flush(channel) {
        var queue = queues[channel];
        if (queue) {
            var func = funcs ? funcs[channel] : null;
            if (func) {
                for (var i = 0; i < queue.length; i++) {
                    func(queue[i]);
                }
                queues[channel] = [];
            }
        }
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED, // Set default logging for scene root
            function(params) {
                activeSceneId = params.sceneId;

                var element = document.getElementById(SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID);
                if (element) {
                    funcs = {
                        warn : function log(msg) {
                            element.innerHTML += "<p style=\"color:orange;\">" + msg + "</p>";
                        },
                        error : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkred;\">" + msg + "</p>";
                        },
                        debug : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkblue;\">" + msg + "</p>";
                        },
                        info : function log(msg) {
                            element.innerHTML += "<p style=\"color:darkgreen;\">" + msg + "</p>";
                        }
                    };
                } else {
                    funcs = null;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_DEACTIVATED, // Set default logging for scene root
            function() {
                activeSceneId = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                queues = {};
                funcs = null;
            },
            100000);  // Really low priority - must be reset last

    // @private
    this.setIndent = function(_indent) {
        indent = _indent;
        var indentArray = [];
        for (var i = 0; i < indent; i++) {
            indentArray.push("----");
        }
        indentStr = indentArray.join("");
    };

    // @private
    this.error = function(msg) {
        log("error", msg);
    };

    // @private
    this.warn = function(msg) {
        log("warn", msg);
    };

    // @private
    this.info = function(msg) {
        log("info", msg);
    };

    // @private
    this.debug = function(msg) {
        log("debug", msg);
    };

    // @private
    this.getFuncs = function() {
        return funcs;
    };

    // @private
    this.setFuncs = function(l) {
        if (l) {
            funcs = l;
            for (var channel in queues) {
                flush(channel);
            }
        }
    };
})();
/**
 * @class A scene node that allows you to intercept SceneJS logging at selected points within your scene graph.
 * <p><b>Example Usage</b></p><p>Routing all logging within a given subgraph to alert popups:</b></p><pre><code>
 * var node = new SceneJS.Node(
 *
 *    // ...some nodes ...
 *
 *    new SceneJS.Logging({
 *           error: function(msg) {
 *                alert("Error at global logger: " + msg);
 *           },
 *
 *           warn: function(msg) {
 *               alert("Warning at global logger: " + msg);
 *           },
 *
 *           debug: function(msg) {
 *               alert("Debug at global logger: " + msg);
 *           },
 *
 *           info: function(msg) {
 *               alert("Info at global logger: " + msg);
 *           }
 *       },
 *
 *       // ... sub-nodes we are in interesting
 *       //        intercepting logs from here ...
 *    )
 * );
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Logging
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Logging = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "logging";
    this._funcs = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Logging, SceneJS.Node);

/**
 * Sets functions
 *
 * @param {object} funcs - object cntaining functions - see class comment for example
 * @returns {SceneJS.Logging} This logging node
 */
SceneJS.Logging.prototype.setFuncs = function(funcs) {
    if (funcs.warn) {
        this._funcs.warn = funcs.warn;
    }
    if (funcs.error) {
        this._funcs.error = funcs.error;
    }
    if (funcs.debug) {
        this._funcs.debug = funcs.debug;
    }
    if (funcs.info) {
        this._funcs.info = funcs.info;
    }
    return this;
};

/**
 Returns logging functions
 @returns {object} The functions
 */
SceneJS.Logging.prototype.getFuncs = function() {
    return {
        warn : this._funcs.warn,
        error : this._funcs.error,
        debug : this._funcs.debug,
        info : this._funcs.info
    };
};

// @private
SceneJS.Logging.prototype._init = function(params) {
    this.setFuncs(params);
};

// @private
SceneJS.Logging.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    var prevFuncs = SceneJS_loggingModule.getFuncs();
    SceneJS_loggingModule.setFuncs(this._funcs);
    this._renderNodes(traversalContext, data);
    SceneJS_loggingModule.setFuncs(prevFuncs);
};

/** Returns a new SceneJS.Logging instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Logging constructor
 * @returns {SceneJS.Logging}
 */
SceneJS.logging = function() {
    var n = new SceneJS.Logging();
    SceneJS.Logging.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that allows you to intercept SceneJS logging at selected points within your
 * scene graph and write it to a specified DIV tag.
 * <p><b>Example Usage</b></p><p>Routing all logging within a given subgraph to alert popups:</b></p><pre><code>
 * var node = new SceneJS.Node(
 *
 *    // ...some nodes ...
 *
 *    new SceneJS.LoggingToPage({
 *           elementId: "myLoggingDiv"
 *       },
 *
 *       // ... sub-nodes we are in interesting
 *       //        intercepting logs from here ...
 *    )
 * );
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.LoggingToPage
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.LoggingToPage = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "logging-to-page";
    this._elementId = null;
    this._element = null;
    this._funcs = null; // Lazily initialised
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

/** ID ("_scenejs-default-logging") of element to which SceneJS will log to if found.
 * When no SceneJS.LoggingToPage is specified, or a SceneJS.LoggingToPage is
 * specified with no element ID.
 */
SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID = "_scenejs-default-logging";

SceneJS._inherit(SceneJS.LoggingToPage, SceneJS.Node);

/**
 * Sets target DIV ID. If no value is given then ID will default to the value of
 * SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID.
 *
 * @param {string} elementId - ID of target DIV
 * @returns {SceneJS.LoggingToPage} This logging node
 * @throws {SceneJS.DocumentElementNotFoundException} Element not found in document
 */
SceneJS.LoggingToPage.prototype.setElementId = function(elementId) {
    if (elementId) {
        var element = document.getElementById(elementId);
        if (!element) {
            SceneJS_errorModule.fatalError(new SceneJS.DocumentElementNotFoundException
                    ("SceneJS.LoggingToPage cannot find document element with ID '" + elementId + "'"));
        }
        this._elementId = elementId;
        this._element = element;
    } else {
        this._elementId = SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID;
        this._element = document.getElementById(SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID);
    }
    return this;
};

/** Returns the target DIV ID. If none has been given then the value will be that of
 * SceneJS.LoggingToPage.DEFAULT_LOGGING_DIV_ID.
 *
 * @returns {string} The DIV ID
 */
SceneJS.LoggingToPage.prototype.getElementId = function() {
    return this._elementId;
};

// @private
SceneJS.LoggingToPage.prototype._init = function(params) {
    this.setElementId(params.elementId);
};

// @private
SceneJS.LoggingToPage.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    if (!this._funcs && this._element) {
        var element = this._element;
        this._funcs = {
            warn : function (msg) {
                element.innerHTML += "<p style=\"color:orange;\">" + msg + "</p>";
            },
            error : function (msg) {
                element.innerHTML += "<p style=\"color:darkred;\">" + msg + "</p>";
            },
            debug : function (msg) {
                element.innerHTML += "<p style=\"color:darkblue;\">" + msg + "</p>";
            },
            info : function (msg) {
                element.innerHTML += "<p style=\"color:darkgreen;\">" + msg + "</p>";
            }
        };
    }
    if (this._element) {
        var prevFuncs = SceneJS_loggingModule.getFuncs();
        SceneJS_loggingModule.setFuncs(this._funcs);
        this._renderNodes(traversalContext, data);
        SceneJS_loggingModule.setFuncs(prevFuncs);
    } else {
        this._renderNodes(traversalContext, data);
    }
};

/** Returns a new SceneJS.LoggingToPage instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoggingToPage constructor
 * @returns {SceneJS.LoggingToPage}
 */
SceneJS.loggingToPage = function() {
    var n = new SceneJS.LoggingToPage();
    SceneJS.LoggingToPage.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend module for VRAM management. This module tries to ensure that SceneJS always has enough video memory
 * to keep things ticking over, at least slowly. Whenever any backend wants to load something into video RAM, it
 * will get the memory manager to mediate the allocation, passing in a callback that will attempt the actual allocation.
 * The memory manager will then try the callback and if no exception is thrown by it, all is good and that's that.
 *
 * However, if the callback throws an out-of-memory exception, the memory manager will poll each registered evictor to
 * evict something to free up some memory in order to satisfy the request. As soon as one of the evictors has
 * successfully evicted something, the memory manager will have another go with the  callback. It will repeat this
 * process, polling a different evictor each time, until the callback succeeds. For fairness, the memory manager
 * remembers the last evictor it polled, to continue with the next one when it needs to evict something again.
 *
 * This module is to be used only when there is an active canvas.
 *
 *  @private
 */
var SceneJS_memoryModule = new (function() {

    var canvas;                 // Used for testing for error conditions
    var evictors = [];          // Eviction function for each client
    var iEvictor = 0;           // Fair eviction policy - don't keep starting polling at first evictor

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
            });

    SceneJS_eventModule.onEvent(// Framework reset - start next polling at first evictor
            SceneJS_eventModule.RESET,
            function() {
                canvas = null;
                iEvictor = 0;
            });

    /**
     * Polls each registered evictor backend to evict something. Stops on the first one to
     * comply. When called again, resumes at the next in sequence to ensure fairness.
     * @private
     */
    function evict() {
        if (evictors.length == 0) {
            return false;
        }
        var tries = 0;
        while (true) {
            if (iEvictor > evictors.length) {
                iEvictor = 0;
            }
            if (evictors[iEvictor++]()) {
                SceneJS_loggingModule.warn("Evicted least-used item from memory");
                return true;
            } else {
                tries++;
                if (tries == evictors.length) {
                    return false;
                }
            }
        }
    }

    // @private
    function outOfMemory(description) {
        SceneJS_loggingModule.error("Memory allocation failed");
        SceneJS_errorModule.fatalError(new SceneJS.OutOfVRAMException(
                "Out of memory - failed to allocate memory for " + description));
    }

    /**
     * Volunteers the caller as an evictor that is willing to attempt to free some memory when polled
     * by this module as memory runs low. The given evict callback is to attempt to free some memory
     * held by the caller, and should return true on success else false.
     * @private
     */
    this.registerEvictor = function(evict) {
        evictors.push(evict);
    };

    /**
     * Attempt allocation of some memory for the caller. This method does not return anything - the
     * tryAllocate callback is to wrap the allocation attempt and provide the result to the caller via
     * a closure, IE. not return it.
     * @private
     */
    this.allocate = function(description, tryAllocate) {
        // SceneJS_loggingModule.debug("Allocating memory for: " + description);
        if (!canvas) {
            SceneJS_errorModule.fatalError(new SceneJS.NoCanvasActiveException
                    ("No canvas active - failed to allocate shader memory"));
        }
        var maxTries = 10; // TODO: Heuristic for this? Does this really need be greater than one?
        var context = canvas.context;
        if (context.getError() == context.OUT_OF_MEMORY) {
            outOfMemory(description);
        }
        var tries = 0;
        while (true) {
            try {
                tryAllocate();
                if (context.getError() == context.OUT_OF_MEMORY) {
                    outOfMemory(description);
                }
                return; // No errors, must have worked
            } catch (e) {
                if (context.getError() != context.OUT_OF_MEMORY) {
                    SceneJS_loggingModule.error(e.message || e);
                    throw e; // We only handle out-of-memory error here
                }
                if (++tries > maxTries || !evict()) { // Too many tries or no cacher wants to evict
                    outOfMemory(description);
                }
            }
        }
    };
})();




/**
 * Backend that tracks which named scene subgraph is currently being traversed.
 *
 * Holds a current name path and services the SceneJS.name node, providing it with methods to
 * push and pop a name to and from the path. On each push or pop, fires a NAME_UPDATED event
 * to notify subscribers of changes to the path.
 *
 *  @private
 */
var SceneJS_nameModule = new (function() {
    var canvas;
    var nameStack = [];
    var namePath = "";
    var namesByPath = {};
    var namesByColor = {};
    var colorMap = {};
    var redCount = 0;
    var blueCount = 0;
    var greenCount = 0;
    var item = null;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(_canvas) {
                canvas = _canvas;
                nameStack = [];
                namePath = "";
                namesByPath = {};
                namesByColor = {};
                colorMap = {};
                redCount = 0;
                blueCount = 0;
                greenCount = 0;
                item = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                //  if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
                SceneJS_eventModule.fireEvent(
                        SceneJS_eventModule.NAME_EXPORTED,
                        item);
                //}
            });

//    ctx.names = {
//
//        getItemByColor: function(color) {
//            if (!canvas) {
//                return null;
//            }
//            var key = color[0] + "." + color[1] + "." + color[2];
//            return namesByColor[key];
//        },
//
//        getItemByPath: function(path) {
//            if (!canvas) {
//                return null;
//            }
//            return namesByPath[path];
//        }
//        //                ,
//        //
//        //                getCurrentItem: function() {
//        //                    return item;
//        //                }
//    };

    // @private
    function nextColor() {
        if (blueCount < 1) {
            blueCount += 0.01;
        } else {
            blueCount = 0;
            if (greenCount < 1) {
                greenCount += 0.01;
            } else {
                greenCount = 0;
                if (redCount < 1) {
                    redCount += 0.01;
                } else {
                    redCount = 0; // TODO: Handle running out of colours
                }
            }
        }
        return [redCount, greenCount, blueCount];
    }

    // @private
    this.pushName = function(name) {
        if (!canvas) {
            SceneJS_errorModule.fatalError("No canvas active");
        }
        nameStack.push(name);
        namePath = nameStack.join("/");
        item = namesByPath[namePath];
        if (!item) {
            item = {
                path : namePath,
                color: nextColor()
            };
            namesByPath[namePath] = item;
        }
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.NAME_UPDATED,
                item);
    };

    // @private
    this.popName = function() {
        nameStack.pop();
        namePath = nameStack.join("/");
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.NAME_UPDATED,
                namesByPath[namePath]); // Can be null
    };
})();
/**
 *@class A scene node that specifies a name for the nodes in its subgraph.
 *<p> These may be nested to create hierarchical names, effectively overlaying semantics onto a scene.</p>
 *<p><b>Example:</b></p><p>Two cubes, blue and green, assigned names "cubes.blue" and "cubes.green".</b></p><pre><code>
 * var n = SceneJS.Name({ name: "cubes" },
 *      new SceneJS.Name({ name: "blue" },
 *              new SceneJS.Material({
 *                  baseColor: { b: 0.9 }
 *              },
 *                      new SceneJS.Translate({x: -10.0 },
 *                              new SceneJS.objects.Cube()
 *                              )
 *                      )
 *              ),
 *
 *      new SceneJS.Name({ name: "green" },
 *              new SceneJS.Material({
 *                  baseColor: { g: 0.9 }
 *              },
 *                      new SceneJS.Translate({x: 10.0 },
 *                              new SceneJS.objects.Cube()
 *                              )
 *                      )
 *              )
 *      )
 *  // ...
 * </code></pre>
 * @extends SceneJS.Node
 *  @constructor
 * Create a new SceneJS.Name
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Name = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "name";
    this._name = "undefined";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Name, SceneJS.Node);

/**
 * Sets the name value
 * @param {String} name The name value
 * @returns {SceneJS.Name} This name node
 */
SceneJS.Name.prototype.setName = function(name) {
    if (!name) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.name name is undefined"));
    }
    name = name.replace(/^\s+|\s+$/g, ''); // Trim
    if (name.length == 0) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.name name cannot be empty string"));
    }
    this._name = name;
    return this;
};

/** Returns the name value
 * @returns {String} The name string
 */
SceneJS.Name.prototype.getName = function() {
    return this._name;
};

// @private
SceneJS.Name.prototype._init = function(params) {
    if (params.name) {
        this.setName(params.name);
    }
};

// @private
SceneJS.Name.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    SceneJS_nameModule.pushName(this._name);
    this._renderNodes(traversalContext, data);
    SceneJS_nameModule.popName();
};

/** Returns a new SceneJS.Name instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Name constructor
 * @returns {SceneJS.Name}
 */
SceneJS.name = function() {
    var n = new SceneJS.Name();
    SceneJS.Name.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend module for asynchronous process management.
 *
 * This module provides creation, destruction and query of SceneJS processes.
 *
 * This module maintains a separate group of processes for each active scene. When a scene is defined, it
 * will create a group for it, then whenever it is deactivated it will automatically reap all processes
 * in its group that have timed out.
 *
 *  @private
 */
var SceneJS_processModule = new (function() {

    var time = (new Date()).getTime();          // System time
    var groups = {};                            // A process group for each existing scene
    var activeSceneId;                          // ID of currently-active scene

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(// Scene defined, create new process group for it
            SceneJS_eventModule.SCENE_CREATED,
            function(params) {
                var group = {   // IDEA like this
                    sceneId : params.sceneId,
                    processes: {} ,
                    numProcesses : 0
                };
                groups[params.sceneId] = group;
            });

    SceneJS_eventModule.onEvent(// Scene traversal begins
            SceneJS_eventModule.SCENE_ACTIVATED,
            function(params) {
                activeSceneId = params.sceneId;
            });

    SceneJS_eventModule.onEvent(// Scene traversed - reap its dead and timed-out processes
            SceneJS_eventModule.SCENE_DEACTIVATED,
            function() {
                var group = groups[activeSceneId];
                var processes = group.processes;
                for (var pid in processes) {
                    var process = processes[pid];
                    if (process) {
                        if (process.destroyed) {
                            processes[pid] = undefined;
                            group.numProcesses--;
                        } else {
                            var elapsed = time - process.timeStarted;
                            if ((process.timeoutSecs > -1) && (elapsed > (process.timeoutSecs * 1000))) {

                                SceneJS_loggingModule.warn("Process timed out after " +
                                                           process.timeoutSecs +
                                                           " seconds: " + process.description);

                                /* Process timed out - notify listeners
                                 */
                                SceneJS_eventModule.fireEvent(SceneJS_eventModule.PROCESS_TIMED_OUT, {
                                    sceneId: activeSceneId,
                                    process: {
                                        id: process.id,
                                        timeStarted : process.timeStarted,
                                        description: process.description,
                                        timeoutSecs: process.timeoutSecs
                                    }
                                });

                                process.destroyed = true;
                                processes[pid] = undefined;
                                group.numProcesses--;
                                if (process.onTimeout) {
                                    process.onTimeout();
                                }
                            } else {
                                process.timeRunning = elapsed;
                            }
                        }
                    }
                }
                activeSceneId = null;
            });

    SceneJS_eventModule.onEvent(// Scene destroyed - destroy its process group
            SceneJS_eventModule.SCENE_DESTROYED,
            function(params) {
                groups[params.sceneId] = undefined;
            });

    SceneJS_eventModule.onEvent(// Framework reset - destroy all process groups
            SceneJS_eventModule.RESET,
            function(params) {
                groups = {};
                activeSceneId = null;
            });


    /**
     *
     * Creates a new asynchronous process for the currently active scene and returns a handle to it.
     * The handle is actually an object containing live information on the process, which must
     * not be modified.
     *
     * Example:
     *
     * createProcess({
     *      description: "loading texture image",
     *      timeoutSecs: 30,                         // 30 Seconds
     *      onTimeout(function() {
     *              alert("arrrg!!");
     *          });
     *
     * @private
     */
    this.createProcess = function(cfg) {
        if (!activeSceneId) {
            SceneJS_errorModule.fatalError(new SceneJS.NoSceneActiveException("No scene active - can't create process"));
        }
        var group = groups[activeSceneId];
        var i = 0;
        while (true) {
            var pid = activeSceneId + i++;
            if (!group.processes[pid]) {

                /* Register process
                 */
                var process = {
                    sceneId: activeSceneId,
                    id: pid,
                    timeStarted : time,
                    timeRunning: 0,
                    description : cfg.description || "",
                    timeoutSecs : cfg.timeoutSecs || 30, // Thirty second default timout
                    onTimeout : cfg.onTimeout
                };
                group.processes[pid] = process;
                group.numProcesses++;

                /* Notify listeners
                 */
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.PROCESS_CREATED, {
                    sceneId: activeSceneId,
                    process: {
                        id: process.id,
                        timeStarted : process.timeStarted,
                        description: process.description,
                        timeoutSecs: process.timeoutSecs
                    }
                });

                return process;
            }
        }
    };

    /**
     * Destroys the given process, which is the object returned by the previous call to createProcess.
     * Does not care if no scene is active, or if the process no longer exists or is dead.
     *
     * @private
     */
    this.killProcess = function(process) {
        if (process) {
            process.destroyed = true;

            /* Notify listeners
             */
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.PROCESS_KILLED, {
                sceneId: activeSceneId,
                process: {
                    id: process.id,
                    timeStarted : process.timeStarted,
                    description: process.description,
                    timeoutSecs: process.timeoutSecs
                }
            });
        }
    };

    /**
     * Returns the number of living processes for either the scene of the given ID, or if
     * no ID supplied, the active scene. If no scene is active, returns zero.
     *
     * @private
     */
    this.getNumProcesses = function(sceneId) {
        var group = groups[sceneId];
        if (!group) {
            return 0;
        }
        return sceneId ? group.numProcesses : (activeSceneId ? groups[activeSceneId].numProcesses : 0);
    };

    /**
     * Returns all living processes for the given scene, which may be null, in which case this
     * method will return the living processes for the currently active scene by default. An empty map
     * will be returned if there is no scene active.
     *
     * Process info looks like this:
     *
     *      {   id: "xx",
     *          timeStarted :   65765765765765,             // System time in milliseconds
     *          timeRunning:    876870,                     // Elapsed time in milliseconds
     *          description :   "loading texture image",
     *          timeoutSecs :       30,                      // Timeout in milliseconds
     *          onTimeout :     <function>                  // Function that will fire on timeoutSecs
     *
     * @private
     */
    this.getProcesses = function(sceneId) {
        var group = groups[sceneId];
        if (!group) {
            return {};
        }
        return sceneId ? group.processes : (activeSceneId ? groups[activeSceneId].processes : {});
    };
})();
/**
 * Backend module that services the SceneJS.assets.XXX nodes to manage the asynchronous cross-domain
 * load and caching of remotely-stored scene fragments.
 *
 * Uses the memory management backend to mediate cache management.
 *
 *  @private
 */
var SceneJS_loadModule = new (function() {

    var time = (new Date()).getTime();
    var proxyUri = null;
    var assets = {};        // Asset content subgraphs for eviction, not reuse

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                assets = {};
            });

    /** @private */
    function _loadFile(url, onLoad, onError) {
        try {
            var x;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState == 4) {
                    if (request.status == 200) {
                        onLoad(request.responseText);
                    } else {
                        onError(request.status, request.statusText);
                    }
                }
            };
            request.open("GET", url, true);
            request.send(null);
        }
        catch (e) {
            onError(request.status, e.toString());
        }
    }

    /** @private */
    function _loadAssetSameDomain(uri, assetId, parser, onSuccess, onError) {
        _loadFile(uri,
                function(data) {  // onLoad
                    if (!data) {
                        onError(new SceneJS.EmptyResponseException("loaded content is empty"));
                    } else {
                        var assetNode = parser(
                                data,
                                function(msg) {
                                    onError(msg);
                                });
                        if (!assetNode) {
                            onError(new SceneJS.InternalException("parser returned null result"));
                        } else {
                            assets[assetId] = {
                                assetId: assetId,
                                uri: uri,
                                node: assetNode,
                                lastUsed: time
                            };
                            onSuccess(assetNode);
                        }
                    }
                },
                function(status, statusText) {
                    onError(new SceneJS.HttpException(status + " - " + (statusText || "")));
                });
    }

    /** @private */
    function _jsonp(fullUri, callbackName, onLoad) {
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.type = "text/javascript";
        window[callbackName] = function(data) {
            onLoad(data);
            window[callbackName] = undefined;
            try {
                delete window[callbackName];
            } catch(e) {
            }
            head.removeChild(script);
        };
        head.appendChild(script);
        script.src = fullUri;  // Request fires now
    }

    /** Loads asset and caches it against uri
     * @private
     */
    function _loadAssetCrossDomain(uri, assetId, serverParams, callbackName, parser, onSuccess, onError) {
        var url = [proxyUri, "?callback=", callbackName , "&uri=" + uri];
        for (var param in serverParams) { // TODO: memoize string portion that contains params
            url.push("&", param, "=", serverParams[param]);
        }
        _jsonp(url.join(""),
                callbackName,
                function(data) {    // onLoad
                    if (!data) {
                        onError(new SceneJS.ProxyEmptyResponseException("proxy server response is empty"));
                    } else if (data.error) {
                        onError(new SceneJS.ProxyErrorResponseException("proxy server responded with error - " + data.error));
                    } else {
                        var assetNode = parser(
                                data,
                                function(msg) {
                                    onError(msg);
                                });
                        if (!assetNode) {
                            onError(new SceneJS.InternalException("parser returned null result"));
                        } else {
                            assets[assetId] = {
                                assetId: assetId,
                                uri: uri,
                                node: assetNode,
                                lastUsed: time
                            };
                            onSuccess(assetNode);
                        }
                    }
                });
    }

    // @private
    this.setProxy = function(_proxyUri) {
        proxyUri = _proxyUri;
    };

    /** Attempts to get currently-loaded asset, which may have been evicted
     * @private
     */
    this.getAsset = function(handle) {
        var asset = assets[handle.assetId];
        if (asset) {
            asset.lastUsed = time;
            return asset.node;
        }
        return null;
    };

    /**
     * Triggers asynchronous JSONP load of asset, creates new process and handle; callback
     * will fire with new child for the  client asset node. The asset node will have to then call assetLoaded
     * to notify the backend that the asset has loaded and allow backend to kill the process.
     *
     * JSON does not handle errors, so the best we can do is manage timeouts withing SceneJS's process management.
     *
     * @private
     * @uri Location of asset
     * @serverParams Request parameters for proxy
     * @parser Processes asset data on load
     * @onSuccess Callback through which processed asset data is returned
     * @onTimeout Callback invoked when no response from proxy
     * @onError Callback invoked when error reported by proxy
     */
    this.loadAsset = function(uri, serverParams, parser, onSuccess, onTimeout, onError) {
        //        if (!proxyUri) {
        //            SceneJS_errorModule.fatalError(new SceneJS.ProxyNotSpecifiedException
        //                    ("Scene definition error - SceneJS.load node expects a 'proxy' property on the SceneJS.scene node"));
        //        }
        if (proxyUri) {
            SceneJS_loggingModule.debug("Loading asset cross-domain from " + uri);
        } else {
            SceneJS_loggingModule.debug("Loading asset from local domain " + uri);
        }
        var assetId = SceneJS._createKeyForMap(assets, "asset");
        var process = SceneJS_processModule.createProcess({
            onTimeout: function() {  // process killed automatically on timeout
                SceneJS_loggingModule.error(
                        "Asset load failed - timed out waiting for a reply " +
                        "(incorrect proxy URI?) - proxy: " + proxyUri +
                        ", uri: " + uri);
                onTimeout();
            },
            description:"asset load: proxy = " + proxyUri + ", uri = " + uri,
            timeoutSecs: 180 // Big timeout to allow files to parse
        });
        if (proxyUri) {
            var callbackName = "callback" + process.id; // Process ID is globally unique
            _loadAssetCrossDomain(
                    uri,
                    assetId,
                    serverParams,
                    callbackName,
                    parser,
                    onSuccess,
                    function(msg) {  // onError
                        SceneJS_processModule.killProcess(process);
                        onError(msg);
                    });
        } else {
            _loadAssetSameDomain(
                    uri,
                    assetId,
                    parser,
                    onSuccess,
                    function(msg) {  // onError
                        SceneJS_processModule.killProcess(process);
                        onError(msg);
                    });
        }
        var handle = {
            process: process,
            assetId : assetId
        };
        return handle;
    };

    /** Notifies backend that load has completed; backend then kills the process.
     * @private
     */
    this.assetLoaded = function(handle) {
        SceneJS_processModule.killProcess(handle.process);
    };

})();
/**
 * @class A scene node that asynchronously loads JavaScript content for its subgraph from a server.
 * <p>A scene node can load content cross-domain if neccessary. This node is configured with the
 * location of a JavaScript file containing a SceneJS definition of the subgraph. When first visited during scene
 * traversal, it will begin the load and allow traversal to continue at its next sibling node. When on a subsequent
 * visit its subgraph has been loaded, it will then allow traversal to descend into that subgraph to render it.</p>
 * <p>You can monitor loads by registering "process-started" and "process-killed" listeners with SceneJS.onEvent().</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-asset-load">Example 1</a></li>
 * </ul>
 * <p><b>Usage Example</b></p><p>The SceneJS.Load node shown below loads a fragment of JavaScript-defined scene
 * definition cross-domain, via the JSONP proxy located by the <b>uri</b> property on the SceneJS.Scene node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *       proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.Load({
 *                 uri:"http://foo.com/my-asset.js"
 *            })
 *  );
 *  </pre></code>
 * @extends SceneJS.Node
 *  @constructor
 *  Create a new SceneJS.Load
 *  @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Load = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "load";
    this._uri = null;
    this._assetParams = null;
    this._parser = null;
    this._assetNode = null;
    this._handle = null;
    this._state = SceneJS.Load.prototype._STATE_INITIAL;
    //    if (this._fixedParams) {
    //        this._init(this._getParams());
    //    }
};

SceneJS._inherit(SceneJS.Load, SceneJS.Node);

// @private
SceneJS.Load.prototype._STATE_ERROR = -1;         // Asset load or texture creation failed

// @private
SceneJS.Load.prototype._STATE_INITIAL = 0;        // Ready to start load

// @private
SceneJS.Load.prototype._STATE_LOADING = 1;        // Load in progress

// @private
SceneJS.Load.prototype._STATE_LOADED = 2;         // Load completed

// @private
SceneJS.Load.prototype._STATE_ATTACHED = 3;       // Subgraph integrated

// @private
SceneJS.Load.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.Load parameter expected: uri"));
    }
    this._uri = params.uri;
    this._serverParams = params.serverParams;
    this._parser = params.parser;
};

// @private
SceneJS.Load.prototype._visitSubgraph = function(data) {
    var traversalContext = {
        appendix : this._children
    };
    this._assetNode._render.call(this._assetNode, traversalContext, data);
};

// @private
SceneJS.Load.prototype._parse = function(data, onError) {
    if (!data._render) {
        onError(data.error || "unknown server error");
        return null;
    } else {
        return data;
    }
};

// @private
SceneJS.Load.prototype._render = function(traversalContext, data) {
    if (!this._uri) {
        this._init(this._getParams(data));
    }
    if (this._state == this._STATE_ATTACHED) {
        if (!SceneJS_loadModule.getAsset(this._handle)) { // evicted from cache - must reload
            this._state = this._STATE_INITIAL;
        }
    }
    switch (this._state) {
        case this._STATE_ATTACHED:
            this._visitSubgraph(data);
            break;

        case this._STATE_LOADING:
            break;

        case this._STATE_LOADED:
            SceneJS_loadModule.assetLoaded(this._handle);  // Finish loading - kill process
            this._state = this._STATE_ATTACHED;
            this._visitSubgraph(data);
            break;

        case this._STATE_INITIAL:
            this._state = this._STATE_LOADING;

            /* Asset not currently loaded or loading - load it
             */
            var _this = this;
            this._handle = SceneJS_loadModule.loadAsset(// Process killed automatically on error or abort
                    this._uri,
                    this._serverParams || {
                        format: "scenejs"
                    },
                    this._parser || this._parse,
                    function(asset) { // Success
                        _this._assetNode = asset;   // Asset is wrapper created by SceneJS.createNode
                        _this._state = _this._STATE_LOADED;
                    },
                    function() { // onTimeout
                        _this._state = _this._STATE_ERROR;
                        SceneJS_errorModule.error(
                                new SceneJS.LoadTimeoutException("Load timed out - uri: " + _this._uri));
                    },
                    function(e) { // onError - SceneJS_loadModule has killed process
                        _this._state = _this._STATE_ERROR;
                        e.message = "Load failed - " + e.message + " - uri: " + _this._uri;
                        SceneJS_errorModule.error(e);
                    });
            break;

        case this._STATE_ERROR:
            break;
    }
};

/** Returns a new SceneJS.Load instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Load constructor
 * @returns {SceneJS.Load}
 */
SceneJS.load = function() {
    var n = new SceneJS.Load();
    SceneJS.Load.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that parses a COLLADA files into a SceneJS nodes.
 *
 * 
 * @private
 *
 */
var SceneJS_colladaParserModule = new (function() {

    var xmlDoc; // Holds DOM parsed from XML string
    var uri;    // URI at which Collada document resides
    var dirURI; // Path to directory containing the Collada document
    var idMap = {}; // Maps every DOM element by ID
    var sources = {};
    var modes = {};

    /**
     * Holds any data parsed from camera node, if requested, to create view a projection
     * transform nodes with which to wrap the result subgraph with just before returning it
     * from this parser.
     */
    var cameraData = {};

    /** Resets parser state
     * @private
     */
    function reset() {
        xmlDoc = null;
        idMap = {};
        sources = {};
        cameraData = null;
        modes = {};
    }

    /**
     * Parses the given XML string into the xmlDoc
     * @private
     */
    function loadDoc(xml) {
        if (window.DOMParser) {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        }
        else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xml);
        }
    }

    /**
     * Finds every element in the xmlDoc and maps the by IDs into the idMap
     * @private
     */
    function buildIdMap() {
        idMap = {};
        var elements = xmlDoc.getElementsByTagName("*");
        var id;
        for (var i = elements.length - 1; i >= 0; i--) {
            id = elements[i].getAttribute("id");
            if (id != "") {
                idMap[id] = elements[i];
            }
        }
    }

    /**
     * Parses the xmlDoc, optionally constrained to the subtree identified by rootId
     * @private
     */
    function parseDoc(rootId) {
        if (rootId) {
            SceneJS_loggingModule.info("Parsing Collada asset '" + rootId + "'");
            var root = idMap[rootId];
            if (root) {
                return parseNode(root);
            } else {
                SceneJS_errorModule.error(new SceneJS.ColladaRootNotFoundException(
                        "SceneJS.assets.collada root not found in COLLADA document: '" + rootId + "'"));
            }
        } else {
            SceneJS_loggingModule.info("Parsing Collada scene. Asset: " + rootId ? "'" + rootId + "'" : "default");
            var scene = xmlDoc.getElementsByTagName("scene");
            if (scene.length > 0) {
                return parseNode(scene[0]);
            } else {
                SceneJS_errorModule.error(new SceneJS.ColladaRootRequiredException(
                        "SceneJS.assets.collada root needs to be specified for COLLADA document: " + uri));
            }
        }
    }

    // @private
    function parseFloatArray(node) {
        var result = [];
        var prev = "";
        var child = node.firstChild;
        var currArray;
        while (child) {
            currArray = (prev + child.nodeValue).replace(/\s+/g, " ").replace(/^\s+/g, "").split(" ");
            child = child.nextSibling;
            if (currArray[0] == "") {
                currArray.unshift();
            }
            if (child) {
                prev = currArray.pop();
            }
            for (var i = 0; i < currArray.length; i++) {
                result.push(parseFloat(currArray[i]));
            }
        }
        return result;
    }


    /**
     * Returns the data for either a <vertices> or a <source>
     *
     * A <source> declares a data repository that provides values according
     * to the semantics of an <input> element that refers to it.
     * @private
     */
    function getSource(id) {
        var source = sources[id];
        if (source) {
            return source;
        }
        var element = idMap[id];
        if (element.tagName == "vertices") {

            /* Recurse to child <source> element
             */
            source = getSource(
                    element
                            .getElementsByTagName("input")[0]
                            .getAttribute("source")
                            .substr(1));
        } else {

            /* Element is a <source>
             */
            var accessor = element
                    .getElementsByTagName("technique_common")[0]
                    .getElementsByTagName("accessor")[0];

            var stride = parseInt(accessor.getAttribute("stride"));         // Number of values per unit
            var offset = parseInt(accessor.getAttribute("offset")) || 0;    // Index of first value
            var count = parseInt(accessor.getAttribute("count"));           // Number of units

            /* Create mask that indicates what data types are in the
             * source - int, float, Name, bool and IDREF.
             *
             * The number and type of the <param> elements define the
             * output of the <accessor>. Parameters are bound to values
             * in the order in which both are specified. A <param> wtihout
             * a name attribute indicates that the value is not part of the
             * input.
             */
            var params = accessor.getElementsByTagName("param");
            var typeMask = [];
            for (var i = 0; i < params.length; i++) {
                if (params[i].hasAttribute("name")) {
                    typeMask.push(true);
                } else {
                    typeMask.push(false);
                }
            }

            source = {
                array:parseFloatArray(idMap[accessor.getAttribute("source").substr(1)]),
                stride:stride,
                offset:offset,
                count:count,
                typeMask: typeMask
            };
        }
        sources[id] = source;
        return source;
    }

    // @private
    function getMaxOffset(inputs) {
        var maxOffset = 0;
        for (var n = 0; n < inputs.length; n++) {
            var offset = inputs[n].getAttribute("offset");
            if (offset > maxOffset) {
                maxOffset = offset;
            }
        }
        return maxOffset;
    }

    // @private
    function getTrianglesFromPolyList(polyList) {
        var i, j, k;
        var inputs = polyList.getElementsByTagName("input");
        var maxOffset = getMaxOffset(inputs);
        var vcount = parseFloatArray(polyList.getElementsByTagName("vcount")[0]);
        var faces = parseFloatArray(polyList.getElementsByTagName("p")[0]);         // TODO: parseInt
        var triangles = [];
        var base = 0;
        for (i = 0; i < vcount.length; i++) {
            for (j = 0; j < vcount[i] - 2; j++) { // For each vertex
                for (k = 0; k <= maxOffset; k++) { // A
                    triangles.push(faces[base + k]);
                }
                for (k = 0; k <= maxOffset; k++) { // B
                    triangles.push(faces[base + (maxOffset + 1) * (j + 1) + k]);
                }
                for (k = 0; k <= maxOffset; k++) { // C
                    triangles.push(faces[base + (maxOffset + 1) * (j + 2) + k]);
                }
            }
            base = base + (maxOffset + 1) * vcount[i];
        }
        return triangles;
    }

    /** Extracts list of triangles from the given <mesh>, merged from both the
     * <triangles> and <polylist> child nodes of the <mesh>.
     * @private
     */
    function getTrianglesList(geometryNode) {
        var trianglesList = [];
        var meshNode = geometryNode.getElementsByTagName("mesh")[0];

        /* Extract <polylist> children
         */
        var polyLists = meshNode.getElementsByTagName("polylist");
        for (var i = 0; i < polyLists.length; i++) {
            var polyList = polyLists[i];
            polyList.getElementsByTagName("p")[0].data = getTrianglesFromPolyList(polyList);
            trianglesList.push(polyList);
        }

        var tris = meshNode.getElementsByTagName("triangles");
        for (i = 0; i < tris.length; i++) {
            trianglesList.push(tris[i]);
        }
        return trianglesList;
    }


    /** Parses a <geometry> and returns an array containing a SceneJS.geometry node for
     * each <mesh> child
     * @private
     * @param id
     */
    function getGeometriesData(geometryNode) {
        var geometriesData = [];
        var trianglesList = getTrianglesList(geometryNode);

        for (var it = 0; it < trianglesList.length; it++) {
            var triangle = trianglesList [it];
            var inputs = triangle.getElementsByTagName("input");
            var inputArray = [];
            var outputData = {};

            for (var n = 0; n < inputs.length; n++) {
                inputs[n].data = getSource(inputs[n].getAttribute("source").substr(1));
                var group = inputs[n].getAttribute("semantic");
                if (group == "TEXCOORD") {
                    group = group + inputs[n].getAttribute("set") || 0;
                }
                inputs[n].group = group;
                inputArray[inputs[n].getAttribute("offset")] = inputs[n];
                outputData[group] = [];
            }

            var faces;
            if (triangle.getElementsByTagName("p")[0].data) {
                faces = triangle.getElementsByTagName("p")[0].data;
            }
            else {
                faces = parseFloatArray(triangle.getElementsByTagName("p")[0]);
            }

            for (var i = 0; i < faces.length; i = i + inputArray.length) {
                for (var n = 0; n < inputArray.length; n++) {
                    var group = inputArray[n].group;
                    var pCount = 0;
                    for (var j = 0; j < inputArray[n].data.stride; j++) {
                        if (inputArray[n].data.typeMask[j]) {
                            outputData[group].push(
                                    parseFloat(inputArray[n].data.array[faces[i + n]
                                            * inputArray[n].data.stride + j
                                            + inputArray[n].data.offset]));
                            pCount++;
                        }
                    }

                    /* 1D
                     */
                    if (group == "VERTEX" && pCount == 1) {
                        outputData[group].push(0);
                    }

                    /* 2D
                     */
                    if (group == "VERTEX" && pCount == 2) {
                        outputData[group].push(0);
                    }

                    /* 2D textures
                     */
                    if (group == "TEXCOORD0" && pCount == 3) {
                        outputData[group].pop();
                    }
                    if (group == "TEXCOORD1" && pCount == 3) {
                        outputData[group].pop();
                    }
                }
            }

            faces = [];
            for (n = 0; n < outputData.VERTEX.length / 3; n++) {
                faces.push(n);
            }

            geometriesData.push({
                materialName : triangle.getAttribute("material"),
                positions: outputData.VERTEX,
                normals: outputData.NORMAL,
                uv : outputData.TEXCOORD0,
                uv2 : outputData.TEXCOORD1,
                indices: faces
            });
        }
        return geometriesData;
    }

    /**
     * Returns profile/newparam[sid="<sid>"]/sampler2D[0]/source[0].nodeValue
     * @private
     */
    function getSamplerSource(profile, sid) {
        var params = profile.getElementsByTagName("newparam");
        for (var i = 0; i < params.length; i++) {
            if (params[i].getAttribute("sid") == sid) {
                return params[i]
                        .getElementsByTagName("sampler2D")[0]
                        .getElementsByTagName("source")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        SceneJS_errorModule.fatalError(
                new SceneJS.ColladaParseException
                        ("COLLADA element expected: "
                                + profile.tagName
                                + "/newparam[sid == '"
                                + sid + "']/sampler2D[0]/source[0]"));
    }

    /**
     * Returns profile/newparam[sid="<sid>"]/surface[0]/init_from[0].nodeValue
     * @private
     */
    function getImageId(profile, sid) {
        var newparams = profile.getElementsByTagName("newparam");
        for (var i = 0; i < newparams.length; i++) {
            if (newparams[i].getAttribute("sid") == sid) {
                var surface = newparams[i].getElementsByTagName("surface")[0];
                return surface
                        .getElementsByTagName("init_from")[0]
                        .firstChild
                        .nodeValue;
            }
        }
        SceneJS_errorModule.fatalError(new SceneJS.ColladaParseException
                ("COLLADA element expected: "
                        + profile.tagName
                        + "/newparam[sid == '"
                        + sid + "']/surface[0]/init_from[0]"));
    }

    // @private
    function getTextureData(profileCommon, texture, applyTo) {
        var source = getSamplerSource(profileCommon, texture.getAttribute("texture"));
        var imageId = getImageId(profileCommon, source);
        var image = idMap[imageId];
        var imageFileName = image.getElementsByTagName("init_from")[0].firstChild.nodeValue;
        var blendMode = texture.getElementsByTagName("blend_mode")[0];
        return {
            uri : dirURI + imageFileName,
            applyTo: applyTo,
            blendMode: (blendMode == "MULTIPLY") ? "multiply" : "add"
        };
    }

    // @private
    function getDiffuseMaterialData(profileCommon, technique, materialData) {
        var diffuse = technique.getElementsByTagName("diffuse");
        if (diffuse.length > 0) {
            var child = diffuse[0].firstChild;
            do{
                switch (child.tagName) {
                    case "color":
                        var color = child.firstChild.nodeValue.split(" ");
                        materialData.baseColor = { r:parseFloat(color[0]), g:parseFloat(color[1]), b:parseFloat(color[2]) };
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommon, child, "baseColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getSpecularColorMaterialData(profileCommon, technique, materialData) {
        var specular = technique.getElementsByTagName("specular");
        if (specular.length > 0) {
            var child = specular[0].firstChild;
            do{
                switch (child.tagName) {
                    case "color":
                        var color = child.firstChild.nodeValue.split(" ");
                        materialData.specularColor = { r:parseFloat(color[0]), g:parseFloat(color[1]), b:parseFloat(color[2]),a: 1 };
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommon, child, "specularColor"));
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getShininessMaterialData(profileCommon, technique, materialData) {
        var shininess = technique.getElementsByTagName("shininess");
        if (shininess.length > 0) {
            var child = shininess[0].firstChild;
            do{
                switch (child.tagName) {
                    case "float":
                        materialData.shine = parseFloat(child.firstChild.nodeValue);
                        break;

                    case "texture":
                        materialData.texturesData.push(
                                getTextureData(profileCommon, child, "shine"));

                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getBumpMapMaterialData(profileCommon, technique, materialData) {
        var bump = technique.getElementsByTagName("bump");
        if (bump.length > 0) {
            var child = bump[0].firstChild;
            do{
                switch (child.tagName) {
                    case "texture":
                        SceneJS_loggingModule.warn("Collada bump mapping not supported yet");
                        break;
                }
            } while (child = child.nextSibling);
        }
    }

    // @private
    function getMaterialData(id) {
        var materialNode = idMap[id];
        var effectId = materialNode
                .getElementsByTagName("instance_effect")[0]
                .getAttribute("url")
                .substr(1);
        var effect = idMap[effectId];
        var profileCommon = effect.getElementsByTagName("profile_COMMON")[0];
        var technique = profileCommon.getElementsByTagName("technique")[0];
        var materialData = {
            texturesData : []
        };
        getDiffuseMaterialData(profileCommon, technique, materialData);
        getSpecularColorMaterialData(profileCommon, technique, materialData);
        getShininessMaterialData(profileCommon, technique, materialData);
        getBumpMapMaterialData(profileCommon, technique, materialData);
        return materialData;
    }

    // @private
    function getMaterialsData(instanceGeometryNode) {
        var materialsData = {};
        var materials = instanceGeometryNode.getElementsByTagName("instance_material");
        var material;
        var materialId;
        var symbolId;
        for (var i = 0; i < materials.length; i++) {
            material = materials[i];
            materialId = material.getAttribute("target").substr(1);
            symbolId = material.getAttribute("symbol");
            materialsData[symbolId] = getMaterialData(materialId);
        }
        return materialsData;
    }


    // @private
    function wrapWithBoundingBox(e, child) {
        if (modes.showBoundingBoxes) {
            return SceneJS.boundingBox(e, SceneJS.renderer({
                lineWidth:2,
                enableTexture2D: false
            }, SceneJS.material({baseColor: { r: 1, g: 0, b: 0 }},
                    SceneJS.geometry({
                        primitive: "lines",
                        positions : [
                            e.xmax, e.ymax, e.zmax,
                            e.xmax, e.ymin, e.zmax,
                            e.xmin, e.ymin, e.zmax,
                            e.xmin, e.ymax, e.zmax,
                            e.xmax, e.ymax, e.zmin,
                            e.xmax, e.ymin, e.zmin,
                            e.xmin, e.ymin, e.zmin,
                            e.xmin, e.ymax, e.zmin
                        ],
                        indices : [ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1,5, 2, 6,3,7 ]
                    }))), child);
        } else {                                   
            return SceneJS.boundingBox(e, child);
        }
    }

    // @private
    function newExtents() {
        const hugeNum = 9999999; // TODO: Guarantee this is max
        return {
            xmin : hugeNum, ymin : hugeNum, zmin : hugeNum,
            xmax : -hugeNum, ymax : -hugeNum, zmax : -hugeNum
        };
    }

   // @private
    function expandExtentsByPositions(e, positions) {
        for (var i = 0; i < positions.length - 2; i += 3) {
            var x = positions[i];
            var y = positions[i + 1];
            var z = positions[i + 2];
            if (x < e.xmin) e.xmin = x;
            if (y < e.ymin) e.ymin = y;
            if (z < e.zmin) e.zmin = z;
            if (x > e.xmax) e.xmax = x;
            if (y > e.ymax) e.ymax = y;
            if (z > e.zmax) e.zmax = z;
        }
        return e;
    }

    // @private
    function expandExtentsByExtents(e, e2) {
        if (e2.xmin < e.xmin) e.xmin = e2.xmin;
        if (e2.ymin < e.ymin) e.ymin = e2.ymin;
        if (e2.zmin < e.zmin) e.zmin = e2.zmin;
        if (e2.xmax > e.xmax) e.xmax = e2.xmax;
        if (e2.ymax > e.ymax) e.ymax = e2.ymax;
        if (e2.zmax > e.zmax) e.zmax = e2.zmax;
        return e;
    }

    // @private
    function parseInstanceGeometry(instanceGeometryNode) {
        var geoUrl = instanceGeometryNode.getAttribute("url").substr(1);
        var geometryNode = idMap[geoUrl];
        var geometriesData = getGeometriesData(geometryNode);
        var materialsData = getMaterialsData(instanceGeometryNode);

        var nodeArgList = []; // Args for SceneJS node result

        var extents = newExtents();

        for (var i = 0; i < geometriesData.length; i++) {
            var geoData = geometriesData[i];
            var geoType = uri + ":" + geoUrl + i;
            var sceneNode = SceneJS.geometry({
                type: geoType,
                primitive: "triangles",
                positions: geoData.positions,
                normals: geoData.normals,
                uv : geoData.uv,
                uv2 : geoData.uv2,
                indices: geoData.indices
            });

            if (geoData.materialName) {
                var materialData = materialsData[geoData.materialName];

                /* Wrap in SceneJS.material
                 */
                if (materialData) {
                    sceneNode = SceneJS.material({
                        baseColor: materialData.baseColor,
                        specularColor: materialData.specularColor ,
                        shine: 10.0,
                        specular: 1
                    }, sceneNode);

                    /* Wrap in SceneJS.texture
                     */
                    var textureLayers = materialData.texturesData;
                    if (textureLayers.length > 0) {
                        var layers = [];
                        for (var j = 0; j < textureLayers.length; j++) {
                            layers.push({
                                uri : textureLayers[j].uri,
                                applyTo: textureLayers[j].applyTo,
                                flipY : false,
                                blendMode: textureLayers[j].blendMode,

                                wrapS: "repeat",
                                wrapT: "repeat" ,
                                minFilter: "linearMipMapLinear",
                                magFilter: "linear"
                            });
                        }
                        sceneNode = SceneJS.texture({ layers: layers }, sceneNode);
                    }
                }
            }
            nodeArgList.push(wrapWithBoundingBox(
                    expandExtentsByPositions(newExtents(), geoData.positions),
                    sceneNode));
        }
        return SceneJS.node.apply(this, nodeArgList);
    }

    // @private
    function parseMatrix(node) {
        var data = parseFloatArray(node);
        return data;
    }

    // @private
    function parseTranslate(node) {
        var data = parseFloatArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
      //  SceneJS_loggingModule.warn("translate - x: " + x + ", y: " + y + ", z: " + z);
        return SceneJS_math_translationMat4v(data);
    }

    // @private
    function parseRotate(node) {
        var data = parseFloatArray(node);
        var x = data[0];
        var y = data[1];
        var z = data[2];
        var angle = data[3];
      //  SceneJS_loggingModule.warn("rotate - x: " + x + ", y: " + y + ", z: " + z + ", angle: " + angle);
        return SceneJS_math_rotationMat4c(angle * 0.017453278, x, y, z);
    }

    /** Parses data from camera node
     * @private
     */
    function parseCameraOptics(camera) {
        var optics = camera.getElementsByTagName("optics")[0];
        var techniqueCommon = optics.getElementsByTagName("technique_common")[0];
        var perspective = techniqueCommon.getElementsByTagName("perspective")[0];

        var opticsData = {};

        if (perspective) {
            var yfov = perspective.getElementsByTagName("yfov")[0];
            var aspectRatio = perspective.getElementsByTagName("aspect_ratio")[0];
            var znear = perspective.getElementsByTagName("znear")[0];
            var zfar = perspective.getElementsByTagName("zfar")[0];

            opticsData = {
                perspective: {
                    fovy: yfov ? parseFloat(yfov.textContent) : 60.0,
                    aspect: aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0,
                    near: znear ? parseFloat(znear.textContent) : 0.1,
                    far: zfar ? parseFloat(zfar.textContent) : 10000.0
                }
            };

//            SceneJS_loggingModule.info("fovy = " + opticsData.perspective.fovy);
//            SceneJS_loggingModule.info("aspect = " + opticsData.perspective.aspect);
//            SceneJS_loggingModule.info("near = " + opticsData.perspective.near);
//            SceneJS_loggingModule.info("far = " + opticsData.perspective.far);

            return opticsData;

        } else {
            var orthographic = techniqueCommon.getElementsByTagName("orthographic")[0];
            if (orthographic) {

                opticsData = {
                    orthographic: {
                        left: -1,
                        right: 1,
                        bottom: -1,
                        top: 1,
                        near: .1,
                        far: 10000
                    }
                };

                var xmag = perspective.getElementsByTagName("xmag")[0];
                var ymag = perspective.getElementsByTagName("ymag")[0];
                var aspectRatio = perspective.getElementsByTagName("aspect_ratio")[0];
                var znear = perspective.getElementsByTagName("znear")[0];
                var zfar = perspective.getElementsByTagName("zfar")[0];

                var xmagVal;
                var ymagVal;
                var aspect;
                var near = znear ? parseFloat(znear.textContent) : 0.1;
                var far = zfar ? parseFloat(zfar.textContent) : 10000.0;

                if (xmag && ymag) { // Ignore aspect

                    xmagVal = xmag ? parseFloat(xmag.textContent) : 1.0;
                    ymagVal = ymag ? parseFloat(ymag.textContent) : 1.0;
                    opticsData = {
                        orthographic: {
                            left: -xmagVal,
                            right: xmagVal,
                            bottom: -ymagVal,
                            top: ymagVal,
                            near: near,
                            far: far
                        }
                    };


                } else if (xmag) {
                    xmagVal = xmag ? parseFloat(xmag.textContent) : 1.0;
                    aspect = aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0;
                    opticsData = {
                        orthographic: {
                            left: -xmagVal,
                            right: xmagVal,
                            bottom: -xmagVal * aspect,
                            top: xmagVal * aspect,
                            near: near,
                            far: far
                        }
                    };

                } else if (ymag) {
                    ymagVal = ymag ? parseFloat(ymag.textContent) : 1.0;
                    aspect = aspectRatio ? parseFloat(aspectRatio.textContent) : 1.0;
                    opticsData = {
                        orthographic: {
                            left: -ymagVal * aspect,
                            right: ymagVal * aspect,
                            bottom: -ymagVal,
                            top: ymagVal,
                            near: near,
                            far: far
                        }
                    };
                } else {
                    SceneJS_loggingModule.warn("camera.technique_common.optics.orthographic - insufficient data found, falling back on defaults");
                }

//                SceneJS_loggingModule.info("left = " + opticsData.orthographic.left);
//                SceneJS_loggingModule.info("right = " + opticsData.orthographic.right);
//                SceneJS_loggingModule.info("bottom = " + opticsData.orthographic.bottom);
//                SceneJS_loggingModule.info("top = " + opticsData.orthographic.top);
//                SceneJS_loggingModule.info("near = " + opticsData.orthographic.near);
//                SceneJS_loggingModule.info("far = " + opticsData.orthographic.far);

            } else {
                SceneJS_loggingModule.warn("camera.technique_common.optics - neither perspective nor perspective found");
            }
        }

        return opticsData;
    }


    /**
     * Returns a SceneJS node created from the given DOM node.
     * @private
     */
    function parseNode(node) {

        /* Builds params for our scene node
         */
        var sceneNodeParams = [];

        /* Camera optics data from any camera elements found
         */
        var cameraOpticsData = null;

        /* Matrix created from any transforms found
         */
        var matrix = SceneJS_math_identityMat4();

        var child = node.firstChild;

        do{
            /* Traverse child nodes
             */
            switch (child.tagName) {

                case "node":
                    sceneNodeParams.push(parseNode(child));
                    break;

                case "matrix":
                    var array = parseMatrix(child);

                    /* Convert row-major to SceneJS column-major
                     */
                    matrix = [
                        array[0],array[4],array[8],array[12],
                        array[1],array[5],array[9],array[13],
                        array[2],array[6],array[10],array[14],
                        array[3],array[7],array[11],array[15]];
                    break;


                case "translate":
                    matrix = matrix
                            ? SceneJS_math_mulMat4(matrix, parseTranslate(child))
                            : parseTranslate(child);
                    break;

                case "rotate":
                    matrix = matrix
                            ? SceneJS_math_mulMat4(matrix, parseRotate(child))
                            : parseRotate(child);
                    break;

                case "instance_node":
                    sceneNodeParams.push(parseNode(idMap[child.getAttribute("url").substr(1)]));
                    break;

                case "instance_visual_scene":
                    sceneNodeParams.push(parseNode(idMap[child.getAttribute("url").substr(1)]));
                    break;

                case "instance_geometry":
                    sceneNodeParams.push(parseInstanceGeometry(child));
                    break;

                case "instance_camera":
                    cameraOpticsData = parseCameraOptics(idMap[child.getAttribute("url").substr(1)]);
                    break;
            }
        } while (child = child.nextSibling);

        var sceneNode = SceneJS.node.apply(this, sceneNodeParams);

//        if (cameraOpticsData) {
//
//            /* Save camera data for wrapping asset subgraph with when we're done parsing
//             */
//            cameraData = {
//                opticsData : cameraOpticsData,
//                matrix : matrix
//            };
//
//        } else {

            /* Modelling transform
             */
            if (matrix) {
                sceneNode = SceneJS.modelMatrix({ elements: matrix }, sceneNode);
            }
//        }

        return sceneNode;
    }

    /**
     * @param _uri Path to the Collada document (used for texture image paths etc)
     * @param xml Collada document string
     * @param rootId Optional ID of particular asset we want from Collada document
     * @private
     */
    this.parse = function(_uri, xml, rootId, _modes) {

        reset();

        uri = _uri;
        dirURI = _uri.substring(0, _uri.lastIndexOf("/") + 1);
        modes = _modes;

        loadDoc(xml);
        buildIdMap();
        var node = parseDoc(rootId);

        if (modes.loadCamera && cameraData) {

            /* Camera was parsed -
             */

            /* Wrap result with view transform:
             */
            if (cameraData.matrix) {
                node = SceneJS.viewMatrix({ elements: cameraData.matrix }, node);
            }

            /* Wrap again with projection transform:
             */
            if (cameraData.opticsData.perspective) {
                node = SceneJS.perspective(cameraData.opticsData.perspective, node);

            } else if (cameraData.opticsData.orthographic) {
                node = SceneJS.ortho(cameraData.opticsData.orthographic, node);
            }
        }

        if (modes.loadLights && lightsData) {
        }

        reset();

        return node;
    };
})();
/**
 * @class A scene node that asynchronously loads its subgraph from a COLLADA file.
 * <p>This node is configured with the location of the COLLADA file, which it can load-cross domain when a proxy is
 * provided. When first visited during scene traversal, it will
 * begin the load and allow traversal to continue at its next sibling node. When on a subsequent visit its subgraph has
 * been loaded, it will then allow traversal to descend into that subgraph to render it.</p>
 * <p>You can monitor loads by registering "process-started" and "process-killed" listeners with SceneJS.onEvent().</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-collada-load-seymour">Seymour Plane</a></li>
 * <li><a target = "other" href="http://bit.ly/scenejs-tron-tank">Tron Tank</a></li>
 * </ul>
 * <p><b>Usage Example</b></p><p>The SceneJS.LoadCollada node shown below loads a target asset cross-domain, from
 * the <node> with ID "propeller" in a Collada file "airplane.dae" stored on a server at "foo.com". The transfer is
 * routed via the JSONP proxy located by the <b>uri</b> property on the SceneJS.Scene node.</b></p>
 * <pre><code>
 * var exampleScene = new SceneJS.Scene({
 *
 *       // JSONP proxy location - needed only for cros-domain load
 *       proxy:"http://scenejs.org/cgi-bin/jsonp_proxy.pl" });
 *
 *       new SceneJS.LoadCollada({
 *                  uri: "http://foo.com/airplane.dae",
 *                  node: "propeller"
 *            })
 *  );
 *  </pre></code>
 *
 * @extends SceneJS.load
 */

SceneJS.LoadCollada = function() {
    SceneJS.Load.apply(this, arguments);
    this._nodeType = "loadCollada";
};

SceneJS._inherit(SceneJS.LoadCollada, SceneJS.Load);

// @private
SceneJS.LoadCollada.prototype._init = function(params) {
    if (!params.uri) {
        SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                ("SceneJS.LoadCollada parameter expected: uri"));
    }
    this._uri = params.uri;
    this._serverParams = {
        format: "xml"
    };
    var modes = {
        loadCamera: params.loadCamera,
        loadLights: params.loadLights,
        showBoundingBoxes : params.showBoundingBoxes
    };
    this._parser = function(xml, onError) {
        return SceneJS_colladaParserModule.parse(
                params.uri, // Used in paths to texture images
                xml,
                params.node, // Optional cherry-picked asset
                modes
                );
    };
};


/** Returns a new SceneJS.LoadCollada instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.LoadCollada constructor
 * @returns {SceneJS.LoadCollada}
 */
SceneJS.loadCollada = function() {
    var n = new SceneJS.LoadCollada();
    SceneJS.LoadCollada.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend for a scene node.
 *  @private
 */
var SceneJS_sceneModule = new (function() {

    var initialised = false; // True as soon as first scene registered
    var scenes = {};
    var nScenes = 0;
    var activeSceneId;

    var projMat;
    var viewMat;
    var picking;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                scenes = {};
                nScenes = 0;
                activeSceneId = null;
            });

    // @private
    function updatePick() {
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(params) {
                projMat = params.matrix;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    /** Locates canvas in DOM, finds WebGL context on it,
     *  sets some default state on the context, then returns
     *  canvas, canvas ID and context wrapped up in an object.
     *
     * If canvasId is null, will fall back on SceneJS.DEFAULT_CANVAS_ID
     * @private
     */
    var findCanvas = function(canvasId) {
        var canvas;
        if (!canvasId) {
            SceneJS_loggingModule.info("SceneJS.scene config 'canvasId' omitted - looking for default canvas with ID '"
                    + SceneJS.DEFAULT_CANVAS_ID + "'");
            canvasId = SceneJS.DEFAULT_CANVAS_ID;
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                SceneJS_errorModule.fatalError(new SceneJS.CanvasNotFoundException
                        ("SceneJS.Scene config 'canvasId' omitted and could not find default canvas with ID '"
                                + SceneJS.DEFAULT_CANVAS_ID + "'"));
            }
        } else {
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                SceneJS_loggingModule.info("SceneJS.scene config 'canvasId' unresolved - looking for default canvas with " +
                                           "ID '" + SceneJS.DEFAULT_CANVAS_ID + "'");
                canvasId = SceneJS.DEFAULT_CANVAS_ID;
                canvas = document.getElementById(canvasId);
                if (!canvas) {
                    SceneJS_errorModule.fatalError(new SceneJS.CanvasNotFoundException
                            ("SceneJS.Scene config 'canvasId' does not match any elements in the page and no " +
                             "default canvas found with ID '" + SceneJS.DEFAULT_CANVAS_ID + "'"));
                }
            }
        }
        var context;
        var contextNames = SceneJS.SUPPORTED_WEBGL_CONTEXT_NAMES;
        for (var i = 0; (!context) && i < contextNames.length; i++) {
            try {

                context = canvas.getContext(contextNames[i]);


                //                                                                        alert("WebGL Trace enabled");
                //                                                                        context = WebGLDebugUtils.makeDebugContext(canvas.getContext(contextNames[i]));
                //                                                                        context.setTracing(true);
            } catch (e) {

            }
        }
        if (!context) {
            SceneJS_errorModule.fatalError(new SceneJS.WebGLNotSupportedException
                    ('Canvas document element with ID \''
                            + canvasId
                            + '\' failed to provide a supported WebGL context'));
        }
        context.clearColor(0.0, 0.0, 0.0, 1.0);
        context.clearDepth(1.0);
        context.enable(context.DEPTH_TEST);
        context.disable(context.CULL_FACE);
        context.disable(context.TEXTURE_2D);
        context.depthRange(0, 1);
        context.disable(context.SCISSOR_TEST);
        return {
            canvas: canvas,
            context: context,
            canvasId : canvasId
        };
    };

    /** Registers a scene, finds it's canvas, and returns the ID under which the scene is registered
     * @private
     */
    this.createScene = function(scene, params) {
        if (!initialised) {
            SceneJS_loggingModule.info("SceneJS V" + SceneJS.VERSION + " initialised");
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.INIT);
        }
        var canvas = findCanvas(params.canvasId); // canvasId can be null
        var sceneId = SceneJS._createKeyForMap(scenes, "scene");
        scenes[sceneId] = {
            sceneId: sceneId,
            scene:scene,
            canvas: canvas
        };
        nScenes++;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_CREATED, {sceneId : sceneId });
        SceneJS_loggingModule.info("Scene defined: " + sceneId);
        return sceneId;
    };

    /** Deregisters scene
     * @private
     */
    this.destroyScene = function(sceneId) {
        scenes[sceneId] = null;
        nScenes--;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_DESTROYED, {sceneId : sceneId });
        if (activeSceneId == sceneId) {
            activeSceneId = null;
        }
        SceneJS_loggingModule.info("Scene destroyed: " + sceneId);
        if (nScenes == 0) {
            SceneJS_loggingModule.info("SceneJS reset");
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.RESET);

        }
    };

    /** Specifies which registered scene is the currently active one
     * @private
     */
    this.activateScene = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            SceneJS_errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        activeSceneId = sceneId;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_ACTIVATED, { sceneId: sceneId });
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.CANVAS_ACTIVATED, scene.canvas);
    };

    /** Returns the canvas element the given scene is bound to
     * @private
     */
    this.getSceneCanvas = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            SceneJS_errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        return scene.canvas.canvas;
    };
    //
    //                activatePick : function(sceneId) {
    //
    //                },

    /** Returns all registered scenes
     * @private
     */
    this.getAllScenes = function() {
        var list = [];
        for (var id in scenes) {
            var scene = scenes[id];
            if (scene) {
                list.push(scene.scene);
            }
        }
        return list;
    };

    /** Finds a registered scene
     * @private
     */
    this.getScene = function(sceneId) {
        return scenes[sceneId].scene;
    };

    /** Deactivates the currently active scene and reaps destroyed and timed out processes
     * @private
     */
    this.deactivateScene = function() {
        if (!activeSceneId) {
            SceneJS_errorModule.fatalError("Internal error: no scene active");
        }
        var sceneId = activeSceneId;
        activeSceneId = null;
        var scene = scenes[sceneId];
        if (!scene) {
            SceneJS_errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.CANVAS_DEACTIVATED, scene.canvas);
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SCENE_DEACTIVATED, {sceneId : sceneId });
        //SceneJS_loggingModule.info("Scene deactivated: " + sceneId);
    };

})();
/**
 @class Root node of a SceneJS scene graph.
 <p>This is entry and exit point for execution when rendering one frame of a scene graph.</p>  
 @extends SceneJS.Node
 */
SceneJS.Scene = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scene";
    if (!this._fixedParams) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException
                        ("Dynamic configuration of SceneJS.scene node is not supported"));
    }
    this._params = this._getParams();
    this._lastRenderedData = null;
    if (this._params.canvasId) {
        this._canvasId = document.getElementById(this._params.canvasId) ? this._params.canvasId : SceneJS.DEFAULT_CANVAS_ID;
    } else {
        this._canvasId = SceneJS.DEFAULT_CANVAS_ID;
    }
};

SceneJS._inherit(SceneJS.Scene, SceneJS.Node);

/** Returns the ID of the canvas element that this scene is to bind to. When no canvasId was configured, it will be the
 * the default ID of "_scenejs-default-canvas".
 */
SceneJS.Scene.prototype.getCanvasId = function() {
    return this._canvasId;
};

/**
 * Renders the scene, passing in any properties required for dynamic configuration of its contained nodes.
 * <p><b>Example:</b></p><p>A Scene with a LookAt node whoe's "eye" property is dynamically configured with a callback. When the Scene is
 * rendered, a value for the property is injected into it. The Scene will put the property on a data scope (implemented by a SceneJS.Data)
 * that the LookAt's config callback then accesses.</b></p><pre><code>
 * var myScene = new SceneJS.Scene(
 *          {
 *              // .. scene configs .. //
 *          },
 *
 *          new SceneJS.LookAt(
 *              function(data) {
 *                  return {
 *                      eye: data.get("eye")
 *                  };
 *              },
 *
 *              // ..more scene nodes..
 *      );
 *
 * myScene.render({
 *          eye: {
 *             x: 0, y: 0, z: -100
 *          }
 *      });
 *
 * </pre></code>
 */
SceneJS.Scene.prototype.render = function(paramOverrides) {
    if (!this._sceneId) {
        this._sceneId = SceneJS_sceneModule.createScene(this, this._getParams());
    }
    SceneJS_sceneModule.activateScene(this._sceneId);
    if (this._params.proxy) {
        SceneJS_loadModule.setProxy(this._params.proxy);
    }
    var traversalContext = {};
    this._renderNodes(traversalContext, new SceneJS.Data(null, false, paramOverrides));
    SceneJS_loadModule.setProxy(null);
    SceneJS_sceneModule.deactivateScene();
    this._lastRenderedData = paramOverrides;
};

/**
 * Performs pick on rendered scene and returns path to picked geometry, if any. The path is the
 * concatenation of the names specified by SceneJS.name nodes on the path to the picked geometry.
 * The scene must have been previously rendered, since this method re-renders it (to a special
 * pick frame buffer) using parameters retained from the prior render() call.
 *
 * @param canvasX
 * @param canvasY
 */
//SceneJS.Scene.prototype.pick = function(canvasX, canvasY) {
//    if (this._sceneId) {
//        try {
//            if (!this._lastRenderedData) {
//                throw new SceneJS.PickWithoutRenderedException
//                        ("Scene not rendered - need to render before picking");
//            }
//            SceneJS_sceneModule.activateScene(this._sceneId);  // Also activates canvas
//            SceneJS_pickModule.pick(canvasX, canvasY);
//            if (this._params.proxy) {
//                SceneJS_loadModule.setProxy(this._params.proxy);
//            }
//            var traversalContext = {};
//            this._renderNodes(traversalContext, this._lastRenderedData);
//            SceneJS_loadModule.setProxy(null);
//            var picked = SceneJS_pickModule.getPicked();
//            SceneJS_sceneModule.deactivateScene();
//            return picked;
//        } finally {
//            SceneJS._traversalMode = SceneJS._TRAVERSAL_MODE_RENDER;
//        }
//    }
//};


/**
 * Returns count of active processes. A non-zero count indicates that the scene should be rendered
 * at least one more time to allow asynchronous processes to complete - since processes are
 * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
 * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
 * a race condition.
 */
SceneJS.Scene.prototype.getNumProcesses = function() {
    return (this._sceneId) ? SceneJS_processModule.getNumProcesses(this._sceneId) : 0;
};

/** Destroys this scene. You should destroy
 * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
 * resources for it (eg. shaders, VBOs etc) that are no longer in use. A destroyed scene
 * becomes un-destroyed as soon as you render it again.
 */
SceneJS.Scene.prototype.destroy = function() {
    if (this._sceneId) {
        SceneJS_sceneModule.destroyScene(this._sceneId); // Last one fires RESET command
        this._sceneId = null;
    }
};

/** Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function() {
    return (this._sceneId != null);
};

/** Returns a new SceneJS.Scene instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Scene constructor
 * @returns {SceneJS.Scene}
 */
SceneJS.scene = function() {
    var n = new SceneJS.Scene();
    SceneJS.Scene.prototype.constructor.apply(n, arguments);
    return n;
};

/** Total SceneJS reset - destroys all scenes and cached resources.
 */
SceneJS.reset = function() {
    var scenes = SceneJS_sceneModule.getAllScenes();
    var temp = [];
    for (var i = 0; i < scenes.length; i++) {
        temp.push(scenes[i]);
    }
    while (temp.length > 0) {

        /* Destroy each scene individually so it they can mark itself as destroyed.
         * A RESET command will be fired after the last one is destroyed.
         */
        temp.pop().destroy();
    }
};

/**
 * This module encapsulates shading behind an event API.
 *
 * By listening to XXX_UPDATED events, this module tracks various elements of scene state, such as WebGL settings,
 * texture layers, lighting, current material properties etc.
 *
 * On a SHADER_ACTIVATE event it will compose and activate a shader taylored to the current scene state
 * (ie. where the shader has variables and routines for the current lights, materials etc), then fire a
 * SHADER_ACTIVATED event when the shader is ready for business.
 *
 * Other modules will then handle the SHADER_ACTIVATED event by firing XXXXX_EXPORTED events parameterised with
 * resources that they want loaded into the shader. This module then handles those by loading their parameters into
 * the shader.
 *
 * The module will avoid constant re-generation of shaders by caching each of them against a hash code that it
 * derives from the current collective scene state; on a SHADER_ACTIVATE event, it will attempt to reuse a shader
 * cached for the hash of the current scene state.
 *
 * Shader allocation and LRU cache eviction is mediated by SceneJS_memoryModule.
 *  @private
 */
var SceneJS_shaderModule = new (function() {

    var time = (new Date()).getTime();      // For LRU caching

    /* Resources contributing to shader
     */
    var canvas;                             // Currently active canvas
    var rendererState;                      // WebGL settings state
    var lights = [];                        // Current lighting state
    var material = {};                      // Current material state
    var fog = null;                         // Current fog
    var textureLayers = [];                 // Texture layers are pushed/popped to this as they occur
    var geometry = null;                    // Current geometry

    /* Hash codes identifying states of contributing resources
     */
    var rendererHash = "";
    var fogHash = "";
    var lightsHash = "";
    var textureHash = "";
    var geometryHash = "";

    /* Shader programs
     */
    var programs = {};                      // Program cache
    var activeProgram = null;               // Currently active program

    /* Combined hash from those of contributing resources, to identify shaders
     */
    var sceneHash;


    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                for (var programId in programs) {  // Just free allocated programs
                    programs[programId].destroy();
                }
                programs = {};
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                canvas = null;
                rendererState = null;
                activeProgram = null;
                lights = [];
                material = {};
                textureLayers = [];

                sceneHash = null;
                fogHash = "";
                lightsHash = "";
                textureHash = "";
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                activeProgram = null;
                sceneHash = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                activeProgram = null;
                sceneHash = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RENDERER_UPDATED,
            function(_rendererState) {
                rendererState = _rendererState;  // Canvas change will be signified by a CANVAS_UPDATED
                sceneHash = null;
                rendererHash = rendererState.enableTexture2D ? "t" : "f";
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RENDERER_EXPORTED,
            function(_rendererState) {

                /* Default ambient material colour is taken from canvas clear colour
                 */
                var clearColor = _rendererState.clearColor;
                activeProgram.setUniform("uAmbient",
                        clearColor
                                ? [clearColor.r, clearColor.g, clearColor.b]
                                : [0, 0, 0]);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TEXTURES_UPDATED,
            function(stack) {
                textureLayers = stack;
                sceneHash = null;

                /* Build texture hash
                 */
                var hash = [];
                for (var i = 0; i < stack.length; i++) {
                    var layer = textureLayers[i];
                    hash.push("/");
                    hash.push(layer.params.applyFrom);
                    hash.push("/");
                    hash.push(layer.params.applyTo);
                    hash.push("/");
                    hash.push(layer.params.blendMode);
                    if (layer.params.matrix) {
                        hash.push("/anim");
                    }
                }
                textureHash = hash.join("");
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TEXTURES_EXPORTED,
            function(stack) {
                for (var i = 0; i < stack.length; i++) {
                    var layer = stack[i];
                    activeProgram.bindTexture("uSampler" + i, layer.texture, i);
                    if (layer.params.matrixAsArray) {
                        activeProgram.setUniform("uLayer" + i + "Matrix", layer.params.matrixAsArray);
                    }
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.LIGHTS_UPDATED,
            function(l) {
                lights = l;
                sceneHash = null;

                /* Build lights hash
                 */
                var hash = [];
                for (var i = 0; i < lights.length; i++) {
                    var light = lights[i];
                    hash.push(light._type);
                    if (light._specular) {
                        hash.push("s");
                    }
                    if (light._diffuse) {
                        hash.push("d");
                    }
                }
                lightsHash = hash.join("");
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.LIGHTS_EXPORTED,
            function(_lights) {
                for (var i = 0; i < _lights.length; i++) {
                    var light = _lights[i];
                    activeProgram.setUniform("uLightColor" + i, light._color);
                    activeProgram.setUniform("uLightDiffuse" + i, light._diffuse);
                    if (light._type == "dir") {
                        activeProgram.setUniform("uLightDir" + i, light._viewDir);
                    } else {
                        if (light._type == "point") {
                            activeProgram.setUniform("uLightPos" + i, light._viewPos);
                        }
                        if (light._type == "spot") {
                            activeProgram.setUniform("uLightPos" + i, light._viewPos);
                            activeProgram.setUniform("uLightDir" + i, light._viewDir);
                            activeProgram.setUniform("uLightSpotCosCutOff" + i, light._spotCosCutOff);
                            activeProgram.setUniform("uLightSpotExp" + i, light._spotExponent);
                        }
                        activeProgram.setUniform("uLightAttenuation" + i,
                                [
                                    light._constantAttenuation,
                                    light._linearAttenuation,
                                    light._quadraticAttenuation
                                ]);
                    }
                }
            });


    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.MATERIAL_UPDATED,
            function(m) {
                material = m;
                sceneHash = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.MATERIAL_EXPORTED,
            function(m) {
                activeProgram.setUniform("uMaterialBaseColor", m.baseColor);
                activeProgram.setUniform("uMaterialSpecularColor", m.specularColor);

                activeProgram.setUniform("uMaterialSpecular", m.specular);
                activeProgram.setUniform("uMaterialShine", m.shine);
                activeProgram.setUniform("uMaterialEmit", m.emit);
                activeProgram.setUniform("uMaterialAlpha", m.alpha);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.FOG_UPDATED,
            function(f) {
                fog = f;
                sceneHash = null;
                fogHash = fog ? fog.mode : "";
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.FOG_EXPORTED,
            function(f) {
                activeProgram.setUniform("uFogColor", f.color);
                activeProgram.setUniform("uFogDensity", f.density);
                activeProgram.setUniform("uFogStart", f.start);
                activeProgram.setUniform("uFogEnd", f.end);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.MODEL_TRANSFORM_EXPORTED,
            function(transform) {

                activeProgram.setUniform("uMMatrix", transform.matrixAsArray);
                activeProgram.setUniform("uMNMatrix", transform.normalMatrixAsArray);

            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_EXPORTED,
            function(transform) {
                activeProgram.setUniform("uVMatrix", transform.matrixAsArray);
                activeProgram.setUniform("uVNMatrix", transform.normalMatrixAsArray);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.PROJECTION_TRANSFORM_EXPORTED,
            function(transform) {
                activeProgram.setUniform("uPMatrix", transform.matrixAsArray);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.GEOMETRY_UPDATED,
            function(geo) {
                geometry = geo;
                sceneHash = null;
                geometryHash = ([
                    geometry.normalBuf ? "t" : "f",
                    geometry.uvBuf ? "t" : "f",
                    geometry.uvBuf2 ? "t" : "f"]).join("");
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.GEOMETRY_EXPORTED,
            function(geo) {
                if (geo.vertexBuf) {
                    activeProgram.bindFloatArrayBuffer("aVertex", geo.vertexBuf);
                }
                if (geo.normalBuf) {
                    activeProgram.bindFloatArrayBuffer("aNormal", geo.normalBuf);
                }
                if (textureLayers.length > 0 && rendererState.enableTexture2D) {
                    if (geo.uvBuf) {
                        activeProgram.bindFloatArrayBuffer("aUVCoord", geo.uvBuf);
                    }
                    if (geo.uvBuf2) {
                        activeProgram.bindFloatArrayBuffer("aUVCoord2", geo.uvBuf2);
                    }
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATE, // Request to activate a shader
            function() {
                activateProgram();
            });

    SceneJS_memoryModule.registerEvictor(
            function() {
                var earliest = time;
                var programToEvict;
                for (var hash in programs) {
                    if (hash) {
                        var program = programs[hash];

                        /* Avoiding eviction of shader just used,
                         * currently in use, or likely about to use
                         */
                        if (program.lastUsed < earliest && program.hash != sceneHash) {
                            programToEvict = program;
                            earliest = programToEvict.lastUsed;
                        }
                    }
                }
                if (programToEvict) { // Delete LRU program's shaders and deregister program
                    //  SceneJS_loggingModule.info("Evicting shader: " + hash);
                    programToEvict.destroy();
                    programs[programToEvict.hash] = null;
                    return true;
                }
                return false;   // Couldnt find suitable program to delete
            });

    /**
     * @private
     */
    function activateProgram() {
        if (!canvas) {
            SceneJS_errorModule.fatalError(new SceneJS.NoCanvasActiveException("No canvas active"));
        }

        if (!sceneHash) {
            generateHash();
        }

        if (!activeProgram || activeProgram.hash != sceneHash) {
            if (activeProgram) {
                canvas.context.flush();
                activeProgram.unbind();
                activeProgram = null;
                SceneJS_eventModule.fireEvent(SceneJS_eventModule.SHADER_DEACTIVATED);
            }

            if (!programs[sceneHash]) {
                SceneJS_loggingModule.info("Creating shader: '" + sceneHash + "'");
                var vertexShaderSrc = composeVertexShader();
                var fragmentShaderSrc = composeFragmentShader();
                SceneJS_memoryModule.allocate(
                        "shader",
                        function() {
                            try {
                                programs[sceneHash] = new SceneJS_webgl_Program(
                                        sceneHash,
                                        time,
                                        canvas.context,
                                        [vertexShaderSrc],
                                        [fragmentShaderSrc],
                                        SceneJS_loggingModule);
                                SceneJS_loggingModule.info("OK - Created shader: '" + sceneHash + "'");
                            } catch (e) {
                                SceneJS_loggingModule.debug("Vertex shader:");
                                SceneJS_loggingModule.debug(getShaderLoggingSource(vertexShaderSrc.split(";")));
                                SceneJS_loggingModule.debug("Fragment shader:");
                                SceneJS_loggingModule.debug(getShaderLoggingSource(fragmentShaderSrc.split(";")));
                                SceneJS_errorModule.fatalError(e);
                            }
                        });
            }
            activeProgram = programs[sceneHash];
            activeProgram.lastUsed = time;
            activeProgram.bind();
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.SHADER_ACTIVATED);
        }

        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SHADER_RENDERING);
    }

    /**
     * Generates a shader hash code from current rendering state.
     * @private
     */
    function generateHash() {
        if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
            sceneHash = ([canvas.canvasId, "picking"]).join(";");
        } else {
            sceneHash = ([canvas.canvasId, rendererHash, fogHash, lightsHash, textureHash, geometryHash]).join(";");
        }
        //      SceneJS_loggingModule.debug("Scene shading hash:" + sceneHash);
    }

    /**
     * @private
     */
    function getShaderLoggingSource(src) {
        var src2 = [];
        for (var i = 0; i < src.length; i++) {
            var padding = (i < 10) ? "&nbsp;&nbsp;&nbsp;" : ((i < 100) ? "&nbsp;&nbsp;" : (i < 1000 ? "&nbsp;" : ""));
            src2.push(i + padding + ": " + src[i]);
        }
        return src2.join("<br/>");
    }

    /**
     * @private
     */
    function composeVertexShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingVertexShader() : composePickingVertexShader();
    }

    /**
     * @private
     */
    function composeFragmentShader() {
        return SceneJS._traversalMode == SceneJS._TRAVERSAL_MODE_RENDER ?
               composeRenderingFragmentShader() : composePickingFragmentShader();
    }

    /**
     * Composes a vertex shader script for rendering mode in current scene state
     * @private
     */
    function composePickingVertexShader() {
        return [
            "attribute vec3 aVertex;",
            "uniform mat4 uMMatrix;",
            "uniform mat4 uVMatrix;",
            "uniform mat4 uPMatrix;",
            "void main(void) {",
            "  gl_Position = uPMatrix * (uVMatrix * (uMMatrix * vec4(aVertex, 1.0)));",
            "}"
        ].join("\n");
    }

    /**
     * Composes a fragment shader script for rendering mode in current scene state
     * @private
     */
    function composePickingFragmentShader() {
        var g = parseFloat(Math.round((10 + 1) / 256) / 256);
        var r = parseFloat((10 - g * 256 + 1) / 256);
        var src = [
            "uniform vec3 uColor;",
            "void main(void) {",

            "gl_FragColor = vec4(" + (r.toFixed(17)) + ", " + (g.toFixed(17)) + ",1.0,1.0);",

            //      "    gl_FragColor = vec4(uColor.rgb, 1.0);  ",
            "}"
        ].join("\n");

        return src;
    }

    /**
     * @private
     */
    function composeRenderingVertexShader() {

        var texturing = textureLayers.length > 0 && rendererState.enableTexture2D && (geometry.uvBuf || geometry.uvBuf2);
        var lighting = (lights.length > 0 && geometry.normalBuf);

        var src = ["\n"];
        src.push("attribute vec3 aVertex;");                // World coordinates

        if (lighting) {
            src.push("attribute vec3 aNormal;");            // Normal vectors
            src.push("uniform mat4 uMNMatrix;");            // Model normal matrix
            src.push("uniform mat4 uVNMatrix;");            // View normal matrix

            src.push("varying vec3 vNormal;");              // Output view normal vector
            src.push("varying vec3 vEyeVec;");              // Output view eye vector

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                if (light._type == "dir") {
                    src.push("uniform vec3 uLightDir" + i + ";");
                }
                if (light._type == "point") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }
                if (light._type == "spot") {
                    src.push("uniform vec4 uLightPos" + i + ";");
                }

                src.push("varying vec3 vLightVec" + i + ";");
                src.push("varying float vLightDist" + i + ";");
            }
        }

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("attribute vec2 aUVCoord;");      // UV coords
            }
            if (geometry.uvBuf2) {
                src.push("attribute vec2 aUVCoord2;");     // UV2 coords
            }
        }
        src.push("uniform mat4 uMMatrix;");                // Model matrix
        src.push("uniform mat4 uVMatrix;");                // View matrix
        src.push("uniform mat4 uPMatrix;");                 // Projection matrix

        src.push("varying vec4 vViewVertex;");

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geometry.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }
        }

        src.push("void main(void) {");
        if (lighting) {
            src.push("  vec4 tmpVNormal = uVNMatrix * (uMNMatrix * vec4(aNormal, 1.0)); ");
            src.push("  vNormal = normalize(tmpVNormal.xyz);");
        }
        src.push("  vec4 tmpVertex = uVMatrix * (uMMatrix * vec4(aVertex, 1.0)); ");
        src.push("  vViewVertex = tmpVertex;");
        src.push("  gl_Position = uPMatrix * vViewVertex;");

        src.push("  vec3 tmpVec;");

        if (lighting) {
            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                if (light._type == "dir") {
                    src.push("tmpVec = -uLightDir" + i + ";");
                }
                if (light._type == "point") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex
                }
                if (light._type == "spot") {
                    src.push("tmpVec = -(uLightPos" + i + ".xyz - tmpVertex.xyz);");
                    src.push("vLightDist" + i + " = length(tmpVec);");          // Distance from light to vertex

                }
                src.push("vLightVec" + i + " = tmpVec;");                   // Vector from light to vertex

            }
            src.push("vEyeVec = normalize(-vViewVertex.xyz);");
        }

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("vUVCoord = aUVCoord;");
            }
            if (geometry.uvBuf2) {
                src.push("vUVCoord2 = aUVCoord2;");
            }
        }
        src.push("}");
        //      SceneJS_loggingModule.info(getShaderLoggingSource(src));
        return src.join("\n");
    }


    /**
     * @private
     */
    function composeRenderingFragmentShader() {
        var texturing = textureLayers.length > 0 && rendererState.enableTexture2D && (geometry.uvBuf || geometry.uvBuf2);
        var lighting = (lights.length > 0 && geometry.normalBuf);

        var src = ["\n"];

        src.push("varying vec4 vViewVertex;");              // View-space vertex

        if (texturing) {
            if (geometry.uvBuf) {
                src.push("varying vec2 vUVCoord;");
            }
            if (geometry.uvBuf2) {
                src.push("varying vec2 vUVCoord2;");
            }

            for (var i = 0; i < textureLayers.length; i++) {
                var layer = textureLayers[i];
                src.push("uniform sampler2D uSampler" + i + ";");
                if (layer.params.matrix) {
                    src.push("uniform mat4 uLayer" + i + "Matrix;");
                }
            }
        }

        src.push("uniform vec3  uMaterialBaseColor;");
        src.push("uniform float uMaterialAlpha;");

        if (lighting) {
            src.push("varying vec3 vNormal;");                  // View-space normal
            src.push("varying vec3 vEyeVec;");                  // Direction of view-space vertex from eye

            src.push("uniform vec3  uAmbient;");                         // Scene ambient colour - taken from clear colour
            src.push("uniform float uMaterialEmit;");

            src.push("uniform vec3  uMaterialSpecularColor;");
            src.push("uniform float uMaterialSpecular;");
            src.push("uniform float uMaterialShine;");

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                src.push("uniform vec3  uLightColor" + i + ";");
                if (light._type == "point") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                }
                if (light._type == "dir") {
                    src.push("uniform vec3   uLightDir" + i + ";");
                }
                if (light._type == "spot") {
                    src.push("uniform vec4   uLightPos" + i + ";");
                    src.push("uniform vec3   uLightDir" + i + ";");
                    src.push("uniform float  uLightSpotCosCutOff" + i + ";");
                    src.push("uniform float  uLightSpotExp" + i + ";");
                }
                src.push("uniform vec3  uLightAttenuation" + i + ";");
                src.push("varying vec3  vLightVec" + i + ";");         // Vector from light to vertex
                src.push("varying float vLightDist" + i + ";");        // Distance from light to vertex
            }
        }

        /* Fog uniforms
         */
        if (fog && fog.mode != "disabled") {
            src.push("uniform vec3  uFogColor;");
            src.push("uniform float uFogDensity;");
            src.push("uniform float uFogStart;");
            src.push("uniform float uFogEnd;");
        }

        src.push("void main(void) {");
        src.push("  vec3    color   = uMaterialBaseColor;");
        src.push("  float   alpha   = uMaterialAlpha;");

        if (lighting) {
            src.push("  vec3    ambientValue=uAmbient;");
            src.push("  float   emit    = uMaterialEmit;");

            src.push("  vec4    normalmap = vec4(vNormal,0.0);");
            src.push("  float   specular=uMaterialSpecular;");
            src.push("  vec3    specularColor=uMaterialSpecularColor;");
            src.push("  float   shine=uMaterialShine;");
            src.push("  float   attenuation = 1.0;");
        }

        if (texturing) {
            src.push("  vec4    texturePos;");
            src.push("  vec2    textureCoord=vec2(0.0,0.0);");

            for (var i = 0; i < textureLayers.length; i++) {
                var layer = textureLayers[i];

                /* Texture input
                 */
                if (layer.params.applyFrom == "normal" && lighting) {
                    if (geometry.normalBuf) {
                        src.push("texturePos=vec4(vNormal.xyz, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyFrom='normal' but geometry has no normal vectors");
                        continue;
                    }
                }
                if (layer.params.applyFrom == "uv") {
                    if (geometry.uvBuf) {
                        src.push("texturePos = vec4(vUVCoord.s, vUVCoord.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv' but geometry has no UV coordinates");
                        continue;
                    }
                }
                if (layer.params.applyFrom == "uv2") {
                    if (geometry.uvBuf2) {
                        src.push("texturePos = vec4(vUVCoord2.s, vUVCoord2.t, 1.0, 1.0);");
                    } else {
                        SceneJS_loggingModule.warn("Texture layer applyTo='uv2' but geometry has no UV2 coordinates");
                        continue;
                    }
                }

                /* Texture matrix
                 */
                if (layer.params.matrixAsArray) {
                    src.push("textureCoord=(uLayer" + i + "Matrix * texturePos).xy;");
                } else {
                    src.push("textureCoord=texturePos.xy;");
                }

                /* Texture output
                 */
                if (layer.params.applyTo == "baseColor") {
                    if (layer.params.blendMode == "multiply") {
                        src.push("color  = color * texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    } else {
                        src.push("color  = color + texture2D(uSampler" + i + ", vec2(textureCoord.x, 1.0 - textureCoord.y)).rgb;");
                    }
                }
            }
        }

        if (lighting) {
            src.push("  vec3    lightValue      = uAmbient;");
            src.push("  vec3    specularValue   = vec3(0.0, 0.0, 0.0);");

            src.push("  vec3    lightVec;");
            src.push("  float   dotN;");
            src.push("  float   spotFactor;");
            src.push("  float   pf;");

            for (var i = 0; i < lights.length; i++) {
                var light = lights[i];
                src.push("lightVec = normalize(vLightVec" + i + ");");

                /* Point Light
                 */
                if (light._type == "point") {
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
                    src.push("if (dotN > 0.0) {");
                    src.push("  attenuation = 1.0 / (" +
                             "  uLightAttenuation" + i + "[0] + " +
                             "  uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                             "  uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    if (light._diffuse) {
                        src.push("  lightValue += dotN *  uLightColor" + i + " * attenuation;");
                    }
                    if (light._specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal), vEyeVec),0.0), shine);");
                    }
                    src.push("}");
                }

                /* Directional Light
                 */
                if (light._type == "dir") {
                    src.push("dotN = max(dot(vNormal,lightVec),0.0);");
                    if (light._diffuse) {
                        src.push("lightValue += dotN * uLightColor" + i + ";");
                    }
                    if (light._specular) {
                        src.push("specularValue += specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(lightVec, vNormal),normalize(vEyeVec)),0.0), shine);");
                    }
                }

                /* Spot light
                 */
                if (light._type == "spot") {
                    src.push("spotFactor = max(dot(normalize(uLightDir" + i + "), lightVec));");
                    src.push("if ( spotFactor > 20) {");
                    src.push("  spotFactor = pow(spotFactor, uLightSpotExp" + i + ");");
                    src.push("  dotN = max(dot(vNormal,normalize(lightVec)),0.0);");
                    src.push("      if(dotN>0.0){");

                    //                            src.push("          attenuation = spotFactor / (" +
                    //                                     "uLightAttenuation" + i + "[0] + " +
                    //                                     "uLightAttenuation" + i + "[1] * vLightDist" + i + " + " +
                    //                                     "uLightAttenuation" + i + "[2] * vLightDist" + i + " * vLightDist" + i + ");");
                    src.push("          attenuation = 1;");

                    if (light._diffuse) {
                        src.push("lightValue +=  dotN * uLightColor" + i + " * attenuation;");
                    }
                    if (light._specular) {
                        src.push("specularValue += attenuation * specularColor * uLightColor" + i +
                                 " * specular  * pow(max(dot(reflect(normalize(lightVec), vNormal),normalize(vEyeVec)),0.0), shine);");
                    }

                    src.push("      }");
                    src.push("}");
                }
            }
            src.push("if (emit>0.0) lightValue = vec3(1.0, 1.0, 1.0);");
            src.push("vec4 fragColor = vec4(specularValue.rgb + color.rgb * (emit+1.0) * lightValue.rgb, alpha);");
        } else {

            /* No lighting
             */
            src.push("vec4 fragColor = vec4(color.rgb, alpha);");
        }

        /* Fog
         */
        if (fog && fog.mode != "disabled") {
            src.push("float fogFact=1.0;");
            if (fog.mode == "exp") {
                src.push("fogFact=clamp(pow(max((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0), 2.0), 0.0, 1.0);");
            } else if (fog.mode == "linear") {
                src.push("fogFact=clamp((uFogEnd - length(-vViewVertex.xyz)) / (uFogEnd - uFogStart), 0.0, 1.0);");
            }
            src.push("gl_FragColor = fragColor * fogFact + vec4(uFogColor, 1) * (1.0 - fogFact);");
        } else {
            src.push("gl_FragColor = fragColor;");
        }

        // src.push("gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);");
        src.push("}");

        // SceneJS_loggingModule.info(getShaderLoggingSource(src));
        return src.join("\n");
    }
})();
/**
 * Manages a stack of WebGL state frames that may be pushed and popped by SceneJS.renderer nodes.
 *  @private
 */
var SceneJS_rendererModule = new (function() {

    var canvas;  // Currently active canvas
    var stateStack;     // Stack of WebGL state frames
    var currentProps;   // Current map of set WebGL modes and states
    var loaded;         // True when current state exported

    /**
     * Maps renderer node properties to WebGL context enums
     * @private
     */
    var glEnum = function(context, name) {
        if (!name) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Null SceneJS.renderer node config: \"" + name + "\""));
        }
        var result = SceneJS_webgl_enumMap[name];
        if (!result) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Unrecognised SceneJS.renderer node config value: \"" + name + "\""));
        }
        var value = context[result];
        if (!value) {
            SceneJS_errorModule.fatalError(new SceneJS.WebGLUnsupportedNodeConfigException(
                    "This browser's WebGL does not support renderer node config value: \"" + name + "\""));
        }
        return value;
    };


    /**
     * Order-insensitive functions that set WebGL modes ie. not actually causing an
     * immediate change.
     *
     * These map to renderer properties and are called in whatever order their
     * property is found on the renderer config.
     *
     * Each of these wrap a state-setter function on the WebGL context. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * @private
     */
    var glModeSetters = {

        enableBlend: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = false;
            }
            context.enable(context.BLEND, flag);
            currentProps.enableBlend = flag;
        },

        blendColor: function(context, color) {
            color = color || {};
            color = {
                r: color.r || 0,
                g: color.g || 0,
                b: color.b || 0,
                a: (color.a == undefined || color.a == null) ? 1 : color.a
            };
            context.blendColor(color.r, color.g, color.b, color.a);
            currentProps.blendColor = color;
        },

        blendEquation: function(context, eqn) {
            eqn = eqn || "funcAdd";
            context.blendEquation(context, glEnum(context, eqn));
            currentProps.blendEquation = eqn;
        },

        /** Sets the RGB blend equation and the alpha blend equation separately
         */
        blendEquationSeparate: function(context, eqn) {
            eqn = eqn || {};
            eqn = {
                rgb : eqn.rgb || "funcAdd",
                alpha : eqn.alpha || "funcAdd"
            };
            context.blendEquation(glEnum(context, eqn.rgb), glEnum(context, eqn.alpha));
            currentProps.blendEquationSeperate = eqn;
        },

        blendFunc: function(context, funcs) {
            blendFunc = blendFunc || {};
            funcs = {
                sfactor : funcs.sfactor || "one",
                dfactor : funcs.dfactor || "zero"
            };
            context.blendFunc(glEnum(context, funcs.sfactor || "one"), glEnum(context, funcs.dfactor || "zero"));
            currentProps.blendFunc = funcs;
        },

        blendFuncSeparate: function(context, func) {
            func = func || {};
            func = {
                srcRGB : func.srcRGB || "zero",
                dstRGB : func.dstRGB || "zero",
                srcAlpha : func.srcAlpha || "zero",
                dstAlpha :  func.dstAlpha || "zero"
            };
            context.blendFuncSeparate(
                    glEnum(context, func.srcRGB || "zero"),
                    glEnum(context, func.dstRGB || "zero"),
                    glEnum(context, func.srcAlpha || "zero"),
                    glEnum(context, func.dstAlpha || "zero"));
            currentProps.blendFuncSeparate = func;
        },

        clearColor: function(context, color) {
            color = color || {};
            color.r = color.r || 0;
            color.g = color.g || 0;
            color.b = color.b || 0;
            color.a = (color.a == undefined || color.a == null) ? 1 : color.a;
            context.clearColor(color.r, color.g, color.b, color.a);
            currentProps.clearColor = color;
        },

        clearDepth: function(context, depth) {
            if (depth == null || depth == undefined) {
                depth = 1;
            }
            context.clearDepth(depth);
            currentProps.clearDepth = depth;
        },

        clearStencil: function(context, clearValue) {
            clearValue = clearValue || 0;
            context.clearStencil(clearValue);
            currentProps.clearStencil = clearValue;
        },

        colorMask: function(context, color) {
            color = color || {};
            color.r = color.r || 0;
            color.g = color.g || 0;
            color.b = color.b || 0;
            color.a = (color.a == undefined || color.a == null) ? 1 : color.a;
            context.colorMask(color.r, color.g, color.b, color.a);
            currentProps.colorMask = color;
        },

        enableCullFace: function(context, flag) {
            if (flag) {
                context.enable(context.CULL_FACE);
            } else {
                flag = false;
                context.disable(context.CULL_FACE);
            }
            currentProps.enableCullFace = flag;
        },

        cullFace: function(context, mode) {
            mode = mode || "back";
            context.cullFace(glEnum(context, mode));
            currentProps.cullFace = mode;
        },

        enableDepthTest: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = true;
            }
            if (flag) {
                context.enable(context.DEPTH_TEST);
            } else {
                context.disable(context.DEPTH_TEST);
            }
            currentProps.enableDepthTest = flag;
        },

        depthFunc: function(context, func) {
            func = func || "less";
            context.depthFunc(glEnum(context, func));
            currentProps.depthFunc = func;
        },

        enableDepthMask: function(context, flag) {
            if (flag == null || flag == undefined) {
                flag = true;
            }
            context.depthMask(flag);
            currentProps.enableDepthMask = flag;
        },

        depthRange: function(context, range) {
            range = range || {};
            range = {
                zNear : range.zNear || 0,
                zFar : range.zFar || 1
            };
            context.depthRange(range.zNear, range.zFar);
            currentProps.depthRange = range;
        },

        frontFace: function(context, mode) {
            mode = mode || "ccw";
            context.frontFace(glEnum(context, mode));
            currentProps.frontFace = mode;
        },

        lineWidth: function(context, width) {
            width = width || 1;
            context.lineWidth(width);
            currentProps.lineWidth = width;
        },

        enableTexture2D: function(context, flag) {
            if (flag) {
                context.enable(context.TEXTURE_2D);
            } else {
                flag = false;
                context.disable(context.TEXTURE_2D);
            }
            currentProps.enableTexture2D = flag;
        },

        enableScissorTest: function(context, flag) {
            if (flag) {
                context.enable(context.SCISSOR_TEST);
            } else {
                flag = false;
                context.disable(context.SCISSOR_TEST);
            }
            currentProps.enableScissorTest = flag;
        }
    };

    /**
     * Order-sensitive functions that immediately effect WebGL state change.
     *
     * These map to renderer properties and are called in a particular order since they
     * affect one another.
     *
     * Each of these wrap a state-setter function on the WebGL context. Each function
     * also uses the glEnum map to convert its renderer node property argument to the
     * WebGL enum constant required by its wrapped function.
     *
     * @private
     */
    var glStateSetters = {

        /** Set viewport on the given context
         */
        viewport: function(context, v) {
            v = v || {};
            v = {
                x : v.x || 1,
                y : v.y || 1,
                width: v.width || canvas.width,
                height: v.height || canvas.height
            };
            currentProps.viewport = v;
            context.viewport(v.x, v.y, v.width, v.height);
            SceneJS_eventModule.fireEvent(SceneJS_eventModule.VIEWPORT_UPDATED, v);
        },

        /** Sets scissor region on the given context
         */
        scissor: function(context, s) {
            s = s || {};
            s = {
                x : s.x || currentProps.viewport.x,
                y : s.y || currentProps.viewport.y,
                width: s.width || currentProps.viewport.width,
                height: s.height || currentProps.viewport.height
            };
            currentProps.scissor = s;
            context.scissor(s.x, s.y, s.width, s.height);
        },

        /** Clears buffers on the given context as specified in mask
         */
        clear:function(context, mask) {
            mask = mask || {};
            var m;
            if (mask.color) {
                m = context.COLOR_BUFFER_BIT;
            }
            if (mask.depth) {
                m = m | context.DEPTH_BUFFER_BIT;
            }
            if (mask.stencil) {
                m = m | context.STENCIL_BUFFER_BIT;
            }
            if (m) {
                context.clear(m);
            }
        }
    };

    /**
     * Sets current renderer properties.
     * @private
     */
    var setProperties = function(context, props) {

        /* Set order-insensitive properties (modes)
         */
        for (var key in props) {
            var setter = glModeSetters[key];
            if (setter) {
                setter(context, props[key]);
            }
        }

        /* Set order-sensitive properties (states)
         */
        if (props.viewport) {
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }
        if (props.clear) {
            glStateSetters.clear(context, props.clear);
        }

        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.RENDERER_UPDATED,
                currentProps);

        loaded = false;
    };

    /**
     * Restores previous renderer properties, except for clear - that's the reason we
     * have a seperate set and restore semantic - we don't want to keep clearing the buffers
     * @private
     */
    var undoProperties = function(context, props) {

        /* Set order-insensitive properties (modes)
         */
        for (var key in props) {
            var setter = glModeSetters[key];
            if (setter) {
                setter(context, props[key]);
            }
        }

        /* Set order-sensitive properties (states)
         */
        if (props.viewport) {
            glStateSetters.viewport(context, props.viewport);
        }
        if (props.scissor) {
            glStateSetters.clear(context, props.scissor);
        }

        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.RENDERER_UPDATED,
                currentProps);

        loaded = false;
    };


    /** Gets value of the given property on the first higher renderer state that has it
     * @private
     */
    var getSuperProperty = function(name) {
        for (var i = stateStack.length - 1; i >= 0; i--) {
            var state = stateStack[i];
            if (!(state.props[name] == undefined)) {
                return state.props[name];
            }
        }
        return null; // Cause default to be set
    };

    /* Activate initial defaults
     */
    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                currentProps = {
                    clear: { depth : true, color : true},
                    //  clearColor: {r: 0, g : 0, b : 0 },
                    clearDepth: 1.0,
                    enableDepthTest:true,
                    enableCullFace: false,
                    enableTexture2D: true,
                    depthRange: { zNear: 0, zFar: 1},
                    enableScissorTest: false,
                    viewport:{ x : 1, y : 1, width: c.canvas.width, height: canvas.canvas.height}
                };
                stateStack = [
                    {
                        props: currentProps,
                        restore : null          // WebGL properties to set for reverting to previous state
                    }
                ];
                loaded = false;

                setProperties(canvas.context, currentProps);

                SceneJS_eventModule.fireEvent(
                        SceneJS_eventModule.RENDERER_UPDATED,
                        currentProps);
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                loaded = false;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                loaded = false;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (!loaded) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.RENDERER_EXPORTED,
                            currentProps);
                    loaded = true;
                }
            });

    /**
     * Returns a new WebGL state object to the caller, without making it active.
     * @private
     */
    this.createRendererState = function(props) {

        /* For each property supplied, find the previous value to restore it to
         */
        var restore = {};
        for (var name in props) {
            if (!(props[name] == undefined)) {
                restore[name] = getSuperProperty(name);
            }
        }

        var state = {
            props : props,
            restore : restore
        };
        return state;
    };

    /** Activates the given WebGL state. If no state is active, then it must specify a canvas to activate,
     * in which case the default simple shader will be activated as well
     * @private
     */
    this.setRendererState = function(state) {
        stateStack.push(state);
        setProperties(canvas.context, state.props);
    };

    /**
     * Restores previous WebGL state, if any. We do a seperate restore operation because some "properties",
     * like clear, are actually operations that we don't want to undo, so we don't redo those in a restore.
     * @private
     */
    this.undoRendererState = function(state) {
        stateStack.pop();
        undoProperties(canvas.context, state.restore); // Undo property settings
    };

})();



/** @class A scene node that sets WebGL state for nodes in its subtree.
 * <p>This node basically exposes various WebGL state configurations through the SceneJS API.</p>
 * (TODO: more comments here!)
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-renderer-node">Example 1</a></li>
 * </ul>
 * @extends SceneJS.Node
 */
SceneJS.Renderer = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "renderer";
    this._params = this._getParams();
    this._sceneId = null; // lazy-set on render
    this._lastRenderedData = null;
};

SceneJS._inherit(SceneJS.Renderer, SceneJS.Node);

// @private
SceneJS.Renderer.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        this._rendererState = SceneJS_rendererModule.createRendererState(this._getParams(data));
        if (this._fixedParams) {
            this._memoLevel = 1;
        }
    }
    SceneJS_rendererModule.setRendererState(this._rendererState);
    this._renderNodes(traversalContext, data);
    SceneJS_rendererModule.undoRendererState(this._rendererState);
};

/** Returns a new SceneJS.Renderer instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Renderer constructor
 * @returns {SceneJS.Renderer}
 */
SceneJS.renderer = function() {
    var n = new SceneJS.Renderer();
    SceneJS.Renderer.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Services geometry node requests to store and render elements of geometry.
 *
 * Stores geometry in vertex buffers in video RAM, caching them there under a least-recently-used eviction policy
 * mediated by the "memory" backend.
 *
 * Geometry elements are identified by type IDs, which may either be supplied by scene nodes, or automatically
 * generated by this backend.
 *
 * After creating geometry, the backend returns to the node the type ID for the node to retain. The node
 * can then pass in the type ID to test if the geometry still exists (perhaps it has been evicted) or to have the
 * backend render the geometry.
 *
 * The backend is free to evict whatever geometry it chooses between scene traversals, so the node must always check
 * the existence of the geometry and possibly request its re-creation each time before requesting the backend render it.
 *
 * A geometry buffer consists of positions, normals, optional texture coordinates, indices and a primitive type
 * (eg. "triangles").
 *
 * When rendering a geometry element, the backend will first fire a GEOMETRY_UPDATED to give the shader backend a
 * chance to prepare a shader script to render the geometry for current scene state. Then it will fire a SHADER_ACTIVATE
 * to prompt the shader backend to fire a SHADER_ACTIVATED to marshal resources from various backends (including this one)
 * for its shader script variables, which then provide their resources to the shader through XXX_EXPORTED events.
 * This backend then likewise provides its geometry buffers to the shader backend through a GEOMETRY_EXPORTED event,
 * then bind and draw the index buffer.
 *
 * The backend avoids needlessly re-exporting and re-binding geometry (eg. when rendering a bunch of cubes in a row)
 * by tracking the type of the last geometry rendered. That type is maintained until another either geoemetry is rendered,
 * the canvas switches, shader deactivates or scene deactivates.
 *
 *  @private

 */
var SceneJS_geometryModule = new (function() {

    var time = (new Date()).getTime();  // For LRU caching
    var canvas;
    var geoMaps = {};                   // Geometry map for each canvas
    var currentGeoMap = null;
    var currentBoundGeoType;            // Type of geometry currently bound to shader

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                canvas = null;
                currentGeoMap = null;
                currentBoundGeoType = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                if (!geoMaps[c.canvasId]) {      // Lazy-create geometry map for canvas
                    geoMaps[c.canvasId] = {};
                }
                canvas = c;
                currentGeoMap = geoMaps[c.canvasId];
                currentBoundGeoType = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                currentGeoMap = null;
                currentBoundGeoType = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                currentBoundGeoType = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                currentBoundGeoType = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET,
            function() {
                for (var canvasId in geoMaps) {    // Destroy geometries on all canvases
                    var geoMap = geoMaps[canvasId];
                    for (var type in geoMap) {
                        var geometry = geoMap[type];
                        destroyGeometry(geometry);
                    }
                }
                canvas = null;
                geoMaps = {};
                currentGeoMap = null;
                currentBoundGeoType = null;
            });

    /**
     * Destroys geometry, returning true if memory freed, else false
     * where canvas not found and geometry was implicitly destroyed
     * @private
     */
    function destroyGeometry(geo) {
        //  SceneJS_loggingModule.debug("Destroying geometry : '" + geo.type + "'");
        if (geo.type == currentBoundGeoType) {
            currentBoundGeoType = null;
        }
        if (document.getElementById(geo.canvas.canvasId)) { // Context won't exist if canvas has disappeared
            if (geo.vertexBuf) {
                geo.vertexBuf.destroy();
            }
            if (geo.normalBuf) {
                geo.normalBuf.destroy();
            }
            if (geo.normalBuf) {
                geo.indexBuf.destroy();
            }
            if (geo.uvBuf) {
                geo.uvBuf.destroy();
            }
            if (geo.uvBuf2) {
                geo.uvBuf2.destroy();
            }
        }
        var geoMap = geoMaps[geo.canvas.canvasId];
        if (geoMap) {
            geoMap[geo.type] = null;
        }
    }

    /**
     * Volunteer to attempt to destroy a geometry when asked to by memory module
     *
     */
    SceneJS_memoryModule.registerEvictor(
            function() {
                var earliest = time;
                var evictee;
                for (var canvasId in geoMaps) {
                    var geoMap = geoMaps[canvasId];
                    if (geoMap) {
                        for (var type in geoMap) {
                            var geometry = geoMap[type];
                            if (geometry) {
                                if (geometry.lastUsed < earliest
                                        && document.getElementById(geometry.canvas.canvasId)) { // Canvas must still exist
                                    evictee = geometry;
                                    earliest = geometry.lastUsed;
                                }
                            }
                        }
                    }
                }
                if (evictee) {
                    SceneJS_loggingModule.warn("Evicting geometry from memory: " + evictee.type);
                    destroyGeometry(evictee);
                    return true;
                }
                return false;  // Couldnt find a geometry we can delete
            });

    /**
     * Creates an array buffer
     *
     * @private
     * @param context WebGL context
     * @param bufType Eg. ARRAY_BUFFER
     * @param values WebGL array
     * @param numItems
     * @param itemSize
     * @param usage Eg. STATIC_DRAW
     */
    function createArrayBuffer(description, context, bufType, values, numItems, itemSize, usage) {
        var buf;
        SceneJS_memoryModule.allocate(
                description,
                function() {
                    buf = new SceneJS_webgl_ArrayBuffer(context, bufType, values, numItems, itemSize, usage);
                });
        return buf;
    }

    /**
     * Converts SceneJS primitive type string to WebGL constant
     * @private
     */
    function getPrimitiveType(context, primitive) {
        switch (primitive) {
            case "points":
                return context.POINTS;
            case "lines":
                return context.LINES;
            case "line-loop":
                return context.LINE_LOOP;
            case "line-strip":
                return context.LINE_STRIP;
            case "triangles":
                return context.TRIANGLES;
            case "triangle-strip":
                return context.TRIANGLE_STRIP;
            case "triangle-fan":
                return context.TRIANGLE_FAN;
            default:
                SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(// Logs and throws
                        "SceneJS.geometry primitive unsupported: '" +
                        primitive +
                        "' - supported types are: 'points', 'lines', 'line-loop', " +
                        "'line-strip', 'triangles', 'triangle-strip' and 'triangle-fan'"));
        }
    }


    /**
     * Tests if the given geometry type exists on the currently active canvas
     * @private
     */
    this.testGeometryExists = function(type) {
        return currentGeoMap[type] ? true : false;
    };

    /**
     * Creates geometry on the active canvas - can optionally take a type ID. On success, when ID given
     * will return that ID, else if no ID given, will return a generated one.
     * @private
     */
    this.createGeometry = function(type, data) {
        if (!type) {
            type = SceneJS._createKeyForMap(currentGeoMap, "type");
        }

        //   SceneJS_loggingModule.debug("Creating geometry: '" + type + "'");

        if (!data.primitive) { // "points", "lines", "line-loop", "line-strip", "triangles", "triangle-strip" or "triangle-fan"
            SceneJS_errorModule.fatalError(
                    new SceneJS.NodeConfigExpectedException(
                            "SceneJS.geometry node property expected : primitive"));
        }
        var context = canvas.context;
        var usage = context.STATIC_DRAW;
        //var usage = (!data.fixed) ? context.STREAM_DRAW : context.STATIC_DRAW;

        var vertexBuf;
        var normalBuf;
        var uvBuf;
        var uvBuf2;
        var indexBuf;

        try { // TODO: Modify usage flags in accordance with how often geometry is evicted

            vertexBuf = createArrayBuffer("geometry vertex buffer", context, context.ARRAY_BUFFER,
                    new WebGLFloatArray(data.positions), data.positions.length, 3, usage);

            if (data.normals && data.normals.length > 0) {
                normalBuf = createArrayBuffer("geometry normal buffer", context, context.ARRAY_BUFFER,
                        new WebGLFloatArray(data.normals), data.normals.length, 3, usage);
            }

            if (data.uv && data.uv.length > 0) {
                if (data.uv) {
                    uvBuf = createArrayBuffer("geometry UV buffer", context, context.ARRAY_BUFFER,
                            new WebGLFloatArray(data.uv), data.uv.length, 2, usage);
                }
            }

            if (data.uv2 && data.uv2.length > 0) {
                if (data.uv2) {
                    uvBuf2 = createArrayBuffer("geometry UV2 buffer", context, context.ARRAY_BUFFER,
                            new WebGLFloatArray(data.uv2), data.uv2.length, 2, usage);
                }
            }

            indexBuf = createArrayBuffer("geometry index buffer", context, context.ELEMENT_ARRAY_BUFFER,
                    new WebGLUnsignedShortArray(data.indices), data.indices.length, 1, usage);

            var geo = {
                fixed : true, // TODO: support dynamic geometry
                primitive: getPrimitiveType(context, data.primitive),
                type: type,
                lastUsed: time,
                canvas : canvas,
                context : context,
                vertexBuf : vertexBuf,
                normalBuf : normalBuf,
                indexBuf : indexBuf,
                uvBuf: uvBuf,
                uvBuf2: uvBuf2
            };
            currentGeoMap[type] = geo;
            return type;
        } catch (e) { // Allocation failure - delete whatever buffers got allocated

            if (vertexBuf) {
                vertexBuf.destroy();
            }
            if (normalBuf) {
                normalBuf.destroy();
            }
            if (uvBuf) {
                uvBuf.destroy();
            }
            if (uvBuf2) {
                uvBuf2.destroy();
            }
            if (indexBuf) {
                indexBuf.destroy();
            }
            throw e;
        }
    };

    /**
     * Draws the geometry of the given ID that exists on the current canvas.
     * Client node must ensure prior that the geometry exists on the canvas
     * using findGeometry, and have created it if neccessary with createGeometry.
     * @private
     */
    this.drawGeometry = function(type) {
        if (!canvas) {
            SceneJS_errorModule.fatalError(SceneJS.NoCanvasActiveException("No canvas active"));
        }
        var geo = currentGeoMap[type];

        SceneJS_eventModule.fireEvent(SceneJS_eventModule.GEOMETRY_UPDATED, geo);  // Gives shader backend a chance to generate a shader

        /* Prompt shader backend to in turn prompt for exports from all backends.
         * This backend exports proactively however (see below), since it is the one
         * which prompted the shader backend.
         */
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.SHADER_ACTIVATE);

        geo.lastUsed = time;  // Geometry now not evictable in this scene traversal

        var context = canvas.context;

        /* Dont re-export and bind if already the last one exported and bound - this is the case when
         * we're drawing a batch of the same object, Eg. a bunch of cubes in a row
         */
        if (currentBoundGeoType != type) {
            for (var i = 0; i < 8; i++) {
                context.disableVertexAttribArray(i);
            }
            SceneJS_eventModule.fireEvent(
                    SceneJS_eventModule.GEOMETRY_EXPORTED,
                    geo);

            geo.indexBuf.bind(); // Bind index buffer

            currentBoundGeoType = type;
        }

        /* Draw geometry
         */
        context.drawElements(geo.primitive, geo.indexBuf.numItems, context.UNSIGNED_SHORT, 0);
        context.flush();

        /* Don't need to unbind buffers - only one is bound at a time anyway
         */

        /* Destroy one-off geometry
         */
        //                    if (!geo.fixed) {
        //                        destroyGeometry(geo);
        //                        currentBoundGeoType = null;
        //                    }
    };
})();
/**
 * @class A scene node that defines an element of geometry.
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-geometry-example">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Definition of a cube, with normals and UV texture coordinates, with coordinates shown here only for the first face:</b></p><pre><code>
 * var g = new SceneJS.Geometry({
 *
 *        // Mandatory primitive type - "points", "lines", "line-loop", "line-strip", "triangles",
 *        // "triangle-strip" or "triangle-fan".
 *
 *        primitive: "triangles",
 *
 *        // Mandatory vertices - eight for our cube, each one spaining three array elements for X,Y and Z
 *
 *        positions : [
 *
 *            // Front cube face - vertices 0,1,2,3
 *
 *            5, 5, 5,
 *            -5, 5, 5,
 *            -5,-5, 5,
 *            5,-5, 5,
 *
 *            //...
 *        ],
 *
 *        // Optional normal vectors, one for each vertex. If you omit these, then cube will not be shaded.
 *
 *        normals : [
 *
 *            // Vertices 0,1,2,3
 *
 *            0, 0, -1,
 *            0, 0, -1,
 *            0, 0, -1,
 *            0, 0, -1,
 *
 *            //...
 *        ],
 *
 *        // Optional 2D texture coordinates corresponding to the 3D positions defined above -
 *        // eight for our cube, each one spanning two array elements for X and Y. If you omit these, then the cube
 *        // will never be textured.
 *
 *        uv : [
 *
 *            // Vertices 0,1,2,3
 *
 *            5, 5,
 *            0, 5,
 *            0, 0,
 *            5, 0,
 *
 *            // ...
 *        ],
 *
 *        // Optional coordinates for a second UV layer - just to illustrate their availability
 *
 *        uv2 : [
 *
 *        ],
 *
 *        // Mandatory indices - these organise the positions, normals and uv texture coordinates into geometric
 *        // primitives in accordance with the "primitive" parameter, in this case a set of three indices for each triangle.
 *        // Note that each triangle in this example is specified in counter-clockwise winding order. You can specify them in
 *        // clockwise order if you configure the SceneJS.renderer node's frontFace property as "cw", instead of the
 *        // default "ccw".
 *
 *        indices : [
 *
 *            // Vertices 0,1,2,3
 *
 *            0, 1, 2,
 *            0, 2, 3,
 *
 *            // ...
 *        ]
 * });
 *  </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Geometry
 * @param {Object} config The config object, followed by zero or more child nodes
 */
SceneJS.Geometry = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "geometry";
    this._geo = null;  // Holds geometry when configured as given arrays
    this._create = null; // Callback to create geometry
    this._type = null; // Optional geometry type ID
    this._handle = null; // Handle to created geometry
};

SceneJS._inherit(SceneJS.Geometry, SceneJS.Node);

// @private
SceneJS.Geometry.prototype._render = function(traversalContext, data) {
    if (!this._geo && !this._create) {

        /* This is a dynamically-configured node
         */
        var params = this._getParams(data);
        if (this._init) {

            /* Subclass implements an init method which will set
             * _geo or _create on this node
             */
            this._init(params);
        } else {

            /* Geometry provided in params
             */
            this._type = params.type;                  // Optional - can be null
            if (params.create instanceof Function) {
                this._create = params.create;
            } else {
                this._geo = {
                    positions : params.positions || [],
                    normals : params.normals || [],
                    colors : params.colors || [],
                    indices : params.indices || [],
                    uv : params.uv || [],
                    primitive : params.primitive || "triangles"
                };
            }
        }
        this._handle = null;
    }
    if (this._handle) { // Was created before - test if not evicted since
        if (!SceneJS_geometryModule.testGeometryExists(this._handle)) {
            this._handle = null;
        }
    }
    if (!this._handle) { // Either not created yet or has been evicted
        if (this._create) { // Use callback to create
            this._handle = SceneJS_geometryModule.createGeometry(this._type, this._create());
        } else { // Or supply arrays
            this._handle = SceneJS_geometryModule.createGeometry(this._type, this._geo);
        }
    }
    SceneJS_geometryModule.drawGeometry(this._handle);
    this._renderNodes(traversalContext, data);
};

/** Returns a new SceneJS.Geometry instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Geometry constructor
 * @returns {SceneJS.Geometry}
 */
SceneJS.geometry = function() {
    var n = new SceneJS.Geometry();
    SceneJS.Geometry.prototype.constructor.apply(n, arguments);
    return n;
};
SceneJS._namespace("SceneJS.objects");
/**
 * @class A scene node that defines the geometry of the venerable OpenGL teapot.
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-example-teapot">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Definition of teapot:</b></p><pre><code>
 * var c = new SceneJS.objects.Teapot(); // Requires no parameters
 * </pre></code>
 * @extends SceneJS.Geometry
 * @constructor
 * Create a new SceneJS.objects.Teapot
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.objects.Teapot = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "teapot";

    /* Type ID ensures that we save memory by reusing any teapot that has already been created
     */
    this._type = "teapot";

    /* Callback that does the creation when teapot not created yet
     * @private
     */
    this._create = function() {
        var positions = [
            [-3.000000, 1.650000, 0.000000],
            [-2.987110, 1.650000, -0.098438],
            [-2.987110, 1.650000, 0.098438],
            [-2.985380, 1.567320, -0.049219],
            [-2.985380, 1.567320, 0.049219],
            [-2.983500, 1.483080, 0.000000],
            [-2.981890, 1.723470, -0.049219],
            [-2.981890, 1.723470, 0.049219],
            [-2.976560, 1.798530, 0.000000],
            [-2.970900, 1.486210, -0.098438],
            [-2.970900, 1.486210, 0.098438],
            [-2.963880, 1.795340, -0.098438],
            [-2.963880, 1.795340, 0.098438],
            [-2.962210, 1.570170, -0.133594],
            [-2.962210, 1.570170, 0.133594],
            [-2.958640, 1.720570, -0.133594],
            [-2.958640, 1.720570, 0.133594],
            [-2.953130, 1.650000, -0.168750],
            [-2.953130, 1.650000, 0.168750],
            [-2.952470, 1.403740, -0.049219],
            [-2.952470, 1.403740, 0.049219],
            [-2.937700, 1.494470, -0.168750],
            [-2.937700, 1.494470, 0.168750],
            [-2.935230, 1.852150, -0.049219],
            [-2.935230, 1.852150, 0.049219],
            [-2.933590, 1.320120, 0.000000],
            [-2.930450, 1.786930, -0.168750],
            [-2.930450, 1.786930, 0.168750],
            [-2.930370, 1.411500, -0.133594],
            [-2.930370, 1.411500, 0.133594],
            [-2.921880, 1.325530, -0.098438],
            [-2.921880, 1.325530, 0.098438],
            [-2.912780, 1.844170, -0.133594],
            [-2.912780, 1.844170, 0.133594],
            [-2.906250, 1.910160, 0.000000],
            [-2.894230, 1.904570, -0.098438],
            [-2.894230, 1.904570, 0.098438],
            [-2.891380, 1.579100, -0.196875],
            [-2.891380, 1.579100, 0.196875],
            [-2.890990, 1.339800, -0.168750],
            [-2.890990, 1.339800, 0.168750],
            [-2.890650, 1.712080, -0.196875],
            [-2.890650, 1.712080, 0.196875],
            [-2.883460, 1.245790, -0.048343],
            [-2.883460, 1.245790, 0.048343],
            [-2.863460, 1.257130, -0.132718],
            [-2.863460, 1.257130, 0.132718],
            [-2.862660, 1.434830, -0.196875],
            [-2.862660, 1.434830, 0.196875],
            [-2.862550, 1.889830, -0.168750],
            [-2.862550, 1.889830, 0.168750],
            [-2.850000, 1.650000, -0.225000],
            [-2.850000, 1.650000, 0.225000],
            [-2.849710, 1.161550, 0.000000],
            [-2.847100, 1.820820, -0.196875],
            [-2.847100, 1.820820, 0.196875],
            [-2.841940, 1.946920, -0.049219],
            [-2.841940, 1.946920, 0.049219],
            [-2.829000, 1.761400, -0.225000],
            [-2.829000, 1.761400, 0.225000],
            [-2.828670, 1.175980, -0.094933],
            [-2.828670, 1.175980, 0.094933],
            [-2.824700, 1.521940, -0.225000],
            [-2.824700, 1.521940, 0.225000],
            [-2.821150, 1.935200, -0.133594],
            [-2.821150, 1.935200, 0.133594],
            [-2.812310, 1.187190, -0.168750],
            [-2.812310, 1.187190, 0.168750],
            [-2.805010, 1.289970, -0.196875],
            [-2.805010, 1.289970, 0.196875],
            [-2.797270, 1.383110, -0.225000],
            [-2.797270, 1.383110, 0.225000],
            [-2.789060, 1.990140, 0.000000],
            [-2.788360, 1.699320, -0.196875],
            [-2.788360, 1.699320, 0.196875],
            [-2.778210, 1.982830, -0.098438],
            [-2.778210, 1.982830, 0.098438],
            [-2.774420, 1.527380, -0.196875],
            [-2.774420, 1.527380, 0.196875],
            [-2.773560, 1.098600, -0.084375],
            [-2.773560, 1.098600, 0.084375],
            [-2.766410, 1.845120, -0.225000],
            [-2.766410, 1.845120, 0.225000],
            [-2.760340, 1.900900, -0.196875],
            [-2.760340, 1.900900, 0.196875],
            [-2.749600, 1.963560, -0.168750],
            [-2.749600, 1.963560, 0.168750],
            [-2.748310, 1.785700, -0.196875],
            [-2.748310, 1.785700, 0.196875],
            [-2.746880, 1.650000, -0.168750],
            [-2.746880, 1.650000, 0.168750],
            [-2.731250, 1.007810, 0.000000],
            [-2.727560, 1.735870, -0.168750],
            [-2.727560, 1.735870, 0.168750],
            [-2.720360, 1.690830, -0.133594],
            [-2.720360, 1.690830, 0.133594],
            [-2.719480, 1.249770, -0.225000],
            [-2.719480, 1.249770, 0.225000],
            [-2.716780, 1.144680, -0.196875],
            [-2.716780, 1.144680, 0.196875],
            [-2.712890, 1.650000, -0.098438],
            [-2.712890, 1.650000, 0.098438],
            [-2.708990, 1.541770, -0.133594],
            [-2.708990, 1.541770, 0.133594],
            [-2.703540, 1.426410, -0.168750],
            [-2.703540, 1.426410, 0.168750],
            [-2.700980, 1.037840, -0.168750],
            [-2.700980, 1.037840, 0.168750],
            [-2.700000, 1.650000, 0.000000],
            [-2.699650, 2.010790, -0.048346],
            [-2.699650, 2.010790, 0.048346],
            [-2.697120, 1.687930, -0.049219],
            [-2.697120, 1.687930, 0.049219],
            [-2.694130, 1.727460, -0.098438],
            [-2.694130, 1.727460, 0.098438],
            [-2.686620, 1.546690, -0.049219],
            [-2.686620, 1.546690, 0.049219],
            [-2.682630, 1.762350, -0.133594],
            [-2.682630, 1.762350, 0.133594],
            [-2.681480, 1.996460, -0.132721],
            [-2.681480, 1.996460, 0.132721],
            [-2.681440, 1.724270, 0.000000],
            [-2.675740, 1.270850, -0.196875],
            [-2.675740, 1.270850, 0.196875],
            [-2.672650, 1.440680, -0.098438],
            [-2.672650, 1.440680, 0.098438],
            [-2.670260, 1.800400, -0.168750],
            [-2.670260, 1.800400, 0.168750],
            [-2.667800, 1.846230, -0.196875],
            [-2.667800, 1.846230, 0.196875],
            [-2.662790, 1.905100, -0.225000],
            [-2.662790, 1.905100, 0.225000],
            [-2.660940, 1.446090, 0.000000],
            [-2.660180, 1.754370, -0.049219],
            [-2.660180, 1.754370, 0.049219],
            [-2.638580, 1.785670, -0.098438],
            [-2.638580, 1.785670, 0.098438],
            [-2.634380, 1.103910, -0.225000],
            [-2.634380, 1.103910, 0.225000],
            [-2.630740, 1.956740, -0.196875],
            [-2.630740, 1.956740, 0.196875],
            [-2.626560, 1.780080, 0.000000],
            [-2.625000, 2.043750, 0.000000],
            [-2.624640, 1.305020, -0.132813],
            [-2.624640, 1.305020, 0.132813],
            [-2.606420, 1.317450, -0.048438],
            [-2.606420, 1.317450, 0.048438],
            [-2.606320, 2.026440, -0.094945],
            [-2.606320, 2.026440, 0.094945],
            [-2.591800, 2.012990, -0.168750],
            [-2.591800, 2.012990, 0.168750],
            [-2.571730, 1.834290, -0.168750],
            [-2.571730, 1.834290, 0.168750],
            [-2.567770, 1.169970, -0.168750],
            [-2.567770, 1.169970, 0.168750],
            [-2.554600, 1.183040, -0.095315],
            [-2.554600, 1.183040, 0.095315],
            [-2.549750, 1.890590, -0.196875],
            [-2.549750, 1.890590, 0.196875],
            [-2.549540, 0.878984, -0.084375],
            [-2.549540, 0.878984, 0.084375],
            [-2.546430, 1.831970, -0.132721],
            [-2.546430, 1.831970, 0.132721],
            [-2.537500, 1.200000, 0.000000],
            [-2.527210, 1.819200, -0.048346],
            [-2.527210, 1.819200, 0.048346],
            [-2.518750, 1.945310, -0.225000],
            [-2.518750, 1.945310, 0.225000],
            [-2.516830, 0.932671, -0.196875],
            [-2.516830, 0.932671, 0.196875],
            [-2.471840, 1.006490, -0.196875],
            [-2.471840, 1.006490, 0.196875],
            [-2.445700, 1.877640, -0.168750],
            [-2.445700, 1.877640, 0.168750],
            [-2.439130, 1.060180, -0.084375],
            [-2.439130, 1.060180, 0.084375],
            [-2.431180, 1.864180, -0.094945],
            [-2.431180, 1.864180, 0.094945],
            [-2.412500, 1.846870, 0.000000],
            [-2.388280, 0.716602, 0.000000],
            [-2.382250, 0.737663, -0.095854],
            [-2.382250, 0.737663, 0.095854],
            [-2.378840, 2.052020, -0.084375],
            [-2.378840, 2.052020, 0.084375],
            [-2.377660, 0.753680, -0.168750],
            [-2.377660, 0.753680, 0.168750],
            [-2.364750, 0.798761, -0.199836],
            [-2.364750, 0.798761, 0.199836],
            [-2.354300, 0.835254, -0.225000],
            [-2.354300, 0.835254, 0.225000],
            [-2.343840, 0.871747, -0.199836],
            [-2.343840, 0.871747, 0.199836],
            [-2.341150, 1.999720, -0.196875],
            [-2.341150, 1.999720, 0.196875],
            [-2.330930, 0.916827, -0.168750],
            [-2.330930, 0.916827, 0.168750],
            [-2.320310, 0.953906, 0.000000],
            [-2.289320, 1.927820, -0.196875],
            [-2.289320, 1.927820, 0.196875],
            [-2.251620, 1.875520, -0.084375],
            [-2.251620, 1.875520, 0.084375],
            [-2.247410, 0.882285, -0.084375],
            [-2.247410, 0.882285, 0.084375],
            [-2.173630, 0.844043, 0.000000],
            [-2.168530, 0.826951, -0.097184],
            [-2.168530, 0.826951, 0.097184],
            [-2.164770, 0.814364, -0.168750],
            [-2.164770, 0.814364, 0.168750],
            [-2.156880, 0.786694, -0.187068],
            [-2.156880, 0.786694, 0.187068],
            [-2.156250, 2.092970, 0.000000],
            [-2.154120, 0.740520, -0.215193],
            [-2.154120, 0.740520, 0.215193],
            [-2.150170, 0.694734, -0.215193],
            [-2.150170, 0.694734, 0.215193],
            [-2.147420, 0.648560, -0.187068],
            [-2.147420, 0.648560, 0.187068],
            [-2.144960, 0.612777, -0.132948],
            [-2.144960, 0.612777, 0.132948],
            [-2.143710, 0.591789, -0.048573],
            [-2.143710, 0.591789, 0.048573],
            [-2.142330, 2.058360, -0.168750],
            [-2.142330, 2.058360, 0.168750],
            [-2.111720, 1.982230, -0.225000],
            [-2.111720, 1.982230, 0.225000],
            [-2.084470, 0.789526, -0.048905],
            [-2.084470, 0.789526, 0.048905],
            [-2.081100, 1.906090, -0.168750],
            [-2.081100, 1.906090, 0.168750],
            [-2.078340, 0.770387, -0.133280],
            [-2.078340, 0.770387, 0.133280],
            [-2.067190, 1.871480, 0.000000],
            [-2.000000, 0.750000, 0.000000],
            [-1.995700, 0.737109, -0.098438],
            [-1.995700, 0.737109, 0.098438],
            [-1.984380, 0.703125, -0.168750],
            [-1.984380, 0.703125, 0.168750],
            [-1.978520, 0.591650, 0.000000],
            [-1.969370, 0.670825, -0.202656],
            [-1.969370, 0.670825, 0.202656],
            [-1.968360, 0.655078, -0.210938],
            [-1.968360, 0.655078, 0.210938],
            [-1.960000, 0.750000, -0.407500],
            [-1.960000, 0.750000, 0.407500],
            [-1.958730, 0.925195, -0.201561],
            [-1.958730, 0.925195, 0.201561],
            [-1.957030, 1.100390, 0.000000],
            [-1.950000, 0.600000, -0.225000],
            [-1.950000, 0.600000, 0.225000],
            [-1.938950, 0.591650, -0.403123],
            [-1.938950, 0.591650, 0.403123],
            [-1.931640, 0.544922, -0.210938],
            [-1.931640, 0.544922, 0.210938],
            [-1.930690, 0.522583, -0.198676],
            [-1.930690, 0.522583, 0.198676],
            [-1.921880, 0.453516, 0.000000],
            [-1.917890, 1.100390, -0.398745],
            [-1.917890, 1.100390, 0.398745],
            [-1.915620, 0.496875, -0.168750],
            [-1.915620, 0.496875, 0.168750],
            [-1.904300, 0.462891, -0.098438],
            [-1.904300, 0.462891, 0.098438],
            [-1.900000, 0.450000, 0.000000],
            [-1.892280, 0.670825, -0.593047],
            [-1.892280, 0.670825, 0.593047],
            [-1.883440, 0.453516, -0.391582],
            [-1.883440, 0.453516, 0.391582],
            [-1.882060, 0.925195, -0.589845],
            [-1.882060, 0.925195, 0.589845],
            [-1.881390, 1.286130, -0.193602],
            [-1.881390, 1.286130, 0.193602],
            [-1.855120, 0.522583, -0.581402],
            [-1.855120, 0.522583, 0.581402],
            [-1.845000, 0.750000, -0.785000],
            [-1.845000, 0.750000, 0.785000],
            [-1.843750, 1.471870, 0.000000],
            [-1.833170, 1.890680, -0.084375],
            [-1.833170, 1.890680, 0.084375],
            [-1.831800, 1.946490, -0.196875],
            [-1.831800, 1.946490, 0.196875],
            [-1.829920, 2.023230, -0.196875],
            [-1.829920, 2.023230, 0.196875],
            [-1.828550, 2.079040, -0.084375],
            [-1.828550, 2.079040, 0.084375],
            [-1.825180, 0.591650, -0.776567],
            [-1.825180, 0.591650, 0.776567],
            [-1.817580, 0.343945, -0.187036],
            [-1.817580, 0.343945, 0.187036],
            [-1.807750, 1.286130, -0.566554],
            [-1.807750, 1.286130, 0.566554],
            [-1.806870, 1.471870, -0.375664],
            [-1.806870, 1.471870, 0.375664],
            [-1.805360, 1.100390, -0.768135],
            [-1.805360, 1.100390, 0.768135],
            [-1.772930, 0.453516, -0.754336],
            [-1.772930, 0.453516, 0.754336],
            [-1.750000, 0.234375, 0.000000],
            [-1.746440, 0.343945, -0.547339],
            [-1.746440, 0.343945, 0.547339],
            [-1.744330, 0.670825, -0.949871],
            [-1.744330, 0.670825, 0.949871],
            [-1.734910, 0.925195, -0.944741],
            [-1.734910, 0.925195, 0.944741],
            [-1.715000, 0.234375, -0.356563],
            [-1.715000, 0.234375, 0.356562],
            [-1.710080, 0.522583, -0.931218],
            [-1.710080, 0.522583, 0.931218],
            [-1.700860, 1.471870, -0.723672],
            [-1.700860, 1.471870, 0.723672],
            [-1.666400, 1.286130, -0.907437],
            [-1.666400, 1.286130, 0.907437],
            [-1.662500, 0.750000, -1.125000],
            [-1.662500, 0.750000, 1.125000],
            [-1.655160, 1.860940, -0.170322],
            [-1.655160, 1.860940, 0.170322],
            [-1.647420, 0.159961, -0.169526],
            [-1.647420, 0.159961, 0.169526],
            [-1.644640, 0.591650, -1.112920],
            [-1.644640, 0.591650, 1.112920],
            [-1.626780, 1.100390, -1.100830],
            [-1.626780, 1.100390, 1.100830],
            [-1.614370, 0.234375, -0.686875],
            [-1.614370, 0.234375, 0.686875],
            [-1.609890, 0.343945, -0.876660],
            [-1.609890, 0.343945, 0.876660],
            [-1.600000, 1.875000, 0.000000],
            [-1.597560, 0.453516, -1.081060],
            [-1.597560, 0.453516, 1.081060],
            [-1.590370, 1.860940, -0.498428],
            [-1.590370, 1.860940, 0.498428],
            [-1.584380, 1.910160, -0.168750],
            [-1.584380, 1.910160, 0.168750],
            [-1.582940, 0.159961, -0.496099],
            [-1.582940, 0.159961, 0.496099],
            [-1.578130, 0.085547, 0.000000],
            [-1.550000, 1.987500, -0.225000],
            [-1.550000, 1.987500, 0.225000],
            [-1.546560, 0.085547, -0.321543],
            [-1.546560, 0.085547, 0.321543],
            [-1.532970, 0.670825, -1.265670],
            [-1.532970, 0.670825, 1.265670],
            [-1.532620, 1.471870, -1.037110],
            [-1.532620, 1.471870, 1.037110],
            [-1.524690, 0.925195, -1.258830],
            [-1.524690, 0.925195, 1.258830],
            [-1.523670, 0.042773, -0.156792],
            [-1.523670, 0.042773, 0.156792],
            [-1.515630, 2.064840, -0.168750],
            [-1.515630, 2.064840, 0.168750],
            [-1.502870, 0.522583, -1.240810],
            [-1.502870, 0.522583, 1.240810],
            [-1.500000, 0.000000, 0.000000],
            [-1.500000, 2.100000, 0.000000],
            [-1.500000, 2.250000, 0.000000],
            [-1.470000, 0.000000, -0.305625],
            [-1.470000, 0.000000, 0.305625],
            [-1.470000, 2.250000, -0.305625],
            [-1.470000, 2.250000, 0.305625],
            [-1.466020, 1.860940, -0.798320],
            [-1.466020, 1.860940, 0.798320],
            [-1.464490, 1.286130, -1.209120],
            [-1.464490, 1.286130, 1.209120],
            [-1.464030, 0.042773, -0.458833],
            [-1.464030, 0.042773, 0.458833],
            [-1.459860, 2.286910, -0.150226],
            [-1.459860, 2.286910, 0.150226],
            [-1.459170, 0.159961, -0.794590],
            [-1.459170, 0.159961, 0.794590],
            [-1.455820, 0.085547, -0.619414],
            [-1.455820, 0.085547, 0.619414],
            [-1.454690, 0.234375, -0.984375],
            [-1.454690, 0.234375, 0.984375],
            [-1.449220, 2.323830, 0.000000],
            [-1.420230, 2.323830, -0.295278],
            [-1.420230, 2.323830, 0.295278],
            [-1.420000, 0.750000, -1.420000],
            [-1.420000, 0.750000, 1.420000],
            [-1.414820, 0.343945, -1.168120],
            [-1.414820, 0.343945, 1.168120],
            [-1.411910, 2.336130, -0.145291],
            [-1.411910, 2.336130, 0.145291],
            [-1.404750, 0.591650, -1.404750],
            [-1.404750, 0.591650, 1.404750],
            [-1.403130, 2.348440, 0.000000],
            [-1.402720, 2.286910, -0.439618],
            [-1.402720, 2.286910, 0.439618],
            [-1.400000, 2.250000, 0.000000],
            [-1.389490, 1.100390, -1.389490],
            [-1.389490, 1.100390, 1.389490],
            [-1.383750, 0.000000, -0.588750],
            [-1.383750, 0.000000, 0.588750],
            [-1.383750, 2.250000, -0.588750],
            [-1.383750, 2.250000, 0.588750],
            [-1.380470, 2.323830, 0.000000],
            [-1.377880, 2.336130, -0.141789],
            [-1.377880, 2.336130, 0.141789],
            [-1.376330, 2.286910, -0.141630],
            [-1.376330, 2.286910, 0.141630],
            [-1.375060, 2.348440, -0.285887],
            [-1.375060, 2.348440, 0.285887],
            [-1.372000, 2.250000, -0.285250],
            [-1.372000, 2.250000, 0.285250],
            [-1.364530, 0.453516, -1.364530],
            [-1.364530, 0.453516, 1.364530],
            [-1.356650, 2.336130, -0.425177],
            [-1.356650, 2.336130, 0.425177],
            [-1.352860, 2.323830, -0.281271],
            [-1.352860, 2.323830, 0.281271],
            [-1.349570, 0.042773, -0.734902],
            [-1.349570, 0.042773, 0.734902],
            [-1.336900, 2.323830, -0.568818],
            [-1.336900, 2.323830, 0.568818],
            [-1.323950, 2.336130, -0.414929],
            [-1.323950, 2.336130, 0.414929],
            [-1.322460, 2.286910, -0.414464],
            [-1.322460, 2.286910, 0.414464],
            [-1.311820, 0.085547, -0.887695],
            [-1.311820, 0.085547, 0.887695],
            [-1.309060, 1.471870, -1.309060],
            [-1.309060, 1.471870, 1.309060],
            [-1.300000, 2.250000, 0.000000],
            [-1.294380, 2.348440, -0.550727],
            [-1.294380, 2.348440, 0.550727],
            [-1.293050, 2.286910, -0.704126],
            [-1.293050, 2.286910, 0.704126],
            [-1.291500, 2.250000, -0.549500],
            [-1.291500, 2.250000, 0.549500],
            [-1.288390, 1.860940, -1.063730],
            [-1.288390, 1.860940, 1.063730],
            [-1.282370, 0.159961, -1.058760],
            [-1.282370, 0.159961, 1.058760],
            [-1.274000, 2.250000, -0.264875],
            [-1.274000, 2.250000, 0.264875],
            [-1.273480, 2.323830, -0.541834],
            [-1.273480, 2.323830, 0.541834],
            [-1.267660, 2.274900, -0.130448],
            [-1.267660, 2.274900, 0.130448],
            [-1.265670, 0.670825, -1.532970],
            [-1.265670, 0.670825, 1.532970],
            [-1.260940, 2.299800, 0.000000],
            [-1.258830, 0.925195, -1.524690],
            [-1.258830, 0.925195, 1.524690],
            [-1.250570, 2.336130, -0.680997],
            [-1.250570, 2.336130, 0.680997],
            [-1.246880, 0.000000, -0.843750],
            [-1.246880, 0.000000, 0.843750],
            [-1.246880, 2.250000, -0.843750],
            [-1.246880, 2.250000, 0.843750],
            [-1.242500, 0.234375, -1.242500],
            [-1.242500, 0.234375, 1.242500],
            [-1.240810, 0.522583, -1.502870],
            [-1.240810, 0.522583, 1.502870],
            [-1.235720, 2.299800, -0.256916],
            [-1.235720, 2.299800, 0.256916],
            [-1.220430, 2.336130, -0.664583],
            [-1.220430, 2.336130, 0.664583],
            [-1.219060, 2.286910, -0.663837],
            [-1.219060, 2.286910, 0.663837],
            [-1.218050, 2.274900, -0.381740],
            [-1.218050, 2.274900, 0.381740],
            [-1.209120, 1.286130, -1.464490],
            [-1.209120, 1.286130, 1.464490],
            [-1.204660, 2.323830, -0.815186],
            [-1.204660, 2.323830, 0.815186],
            [-1.199250, 2.250000, -0.510250],
            [-1.199250, 2.250000, 0.510250],
            [-1.196510, 2.319430, -0.123125],
            [-1.196510, 2.319430, 0.123125],
            [-1.186040, 0.042773, -0.979229],
            [-1.186040, 0.042773, 0.979229],
            [-1.168120, 0.343945, -1.414820],
            [-1.168120, 0.343945, 1.414820],
            [-1.166350, 2.348440, -0.789258],
            [-1.166350, 2.348440, 0.789258],
            [-1.163750, 2.250000, -0.787500],
            [-1.163750, 2.250000, 0.787500],
            [-1.163220, 2.299800, -0.494918],
            [-1.163220, 2.299800, 0.494918],
            [-1.156250, 2.339060, 0.000000],
            [-1.149680, 2.319430, -0.360312],
            [-1.149680, 2.319430, 0.360312],
            [-1.147520, 2.323830, -0.776514],
            [-1.147520, 2.323830, 0.776514],
            [-1.136370, 2.286910, -0.938220],
            [-1.136370, 2.286910, 0.938220],
            [-1.133120, 2.339060, -0.235586],
            [-1.133120, 2.339060, 0.235586],
            [-1.125000, 0.750000, -1.662500],
            [-1.125000, 0.750000, 1.662500],
            [-1.122810, 2.274900, -0.611424],
            [-1.122810, 2.274900, 0.611424],
            [-1.120470, 0.085547, -1.120470],
            [-1.120470, 0.085547, 1.120470],
            [-1.112920, 0.591650, -1.644640],
            [-1.112920, 0.591650, 1.644640],
            [-1.100830, 1.100390, -1.626780],
            [-1.100830, 1.100390, 1.626780],
            [-1.099040, 2.336130, -0.907402],
            [-1.099040, 2.336130, 0.907402],
            [-1.081060, 0.453516, -1.597560],
            [-1.081060, 0.453516, 1.597560],
            [-1.080630, 2.250000, -0.731250],
            [-1.080630, 2.250000, 0.731250],
            [-1.072550, 2.336130, -0.885531],
            [-1.072550, 2.336130, 0.885531],
            [-1.071350, 2.286910, -0.884537],
            [-1.071350, 2.286910, 0.884537],
            [-1.066640, 2.339060, -0.453828],
            [-1.066640, 2.339060, 0.453828],
            [-1.065000, 0.000000, -1.065000],
            [-1.065000, 0.000000, 1.065000],
            [-1.065000, 2.250000, -1.065000],
            [-1.065000, 2.250000, 1.065000],
            [-1.063730, 1.860940, -1.288390],
            [-1.063730, 1.860940, 1.288390],
            [-1.059790, 2.319430, -0.577104],
            [-1.059790, 2.319430, 0.577104],
            [-1.058760, 0.159961, -1.282370],
            [-1.058760, 0.159961, 1.282370],
            [-1.048150, 2.299800, -0.709277],
            [-1.048150, 2.299800, 0.709277],
            [-1.037110, 1.471870, -1.532620],
            [-1.037110, 1.471870, 1.532620],
            [-1.028940, 2.323830, -1.028940],
            [-1.028940, 2.323830, 1.028940],
            [-0.996219, 2.348440, -0.996219],
            [-0.996219, 2.348440, 0.996219],
            [-0.994000, 2.250000, -0.994000],
            [-0.994000, 2.250000, 0.994000],
            [-0.986761, 2.274900, -0.814698],
            [-0.986761, 2.274900, 0.814698],
            [-0.984375, 0.234375, -1.454690],
            [-0.984375, 0.234375, 1.454690],
            [-0.980719, 2.369530, -0.100920],
            [-0.980719, 2.369530, 0.100920],
            [-0.980133, 2.323830, -0.980133],
            [-0.980133, 2.323830, 0.980133],
            [-0.979229, 0.042773, -1.186040],
            [-0.979229, 0.042773, 1.186040],
            [-0.961133, 2.339060, -0.650391],
            [-0.961133, 2.339060, 0.650391],
            [-0.949871, 0.670825, -1.744330],
            [-0.949871, 0.670825, 1.744330],
            [-0.944741, 0.925195, -1.734910],
            [-0.944741, 0.925195, 1.734910],
            [-0.942332, 2.369530, -0.295330],
            [-0.942332, 2.369530, 0.295330],
            [-0.938220, 2.286910, -1.136370],
            [-0.938220, 2.286910, 1.136370],
            [-0.931373, 2.319430, -0.768968],
            [-0.931373, 2.319430, 0.768968],
            [-0.931218, 0.522583, -1.710080],
            [-0.931218, 0.522583, 1.710080],
            [-0.923000, 2.250000, -0.923000],
            [-0.923000, 2.250000, 0.923000],
            [-0.907437, 1.286130, -1.666400],
            [-0.907437, 1.286130, 1.666400],
            [-0.907402, 2.336130, -1.099040],
            [-0.907402, 2.336130, 1.099040],
            [-0.895266, 2.299800, -0.895266],
            [-0.895266, 2.299800, 0.895266],
            [-0.887695, 0.085547, -1.311820],
            [-0.887695, 0.085547, 1.311820],
            [-0.885531, 2.336130, -1.072550],
            [-0.885531, 2.336130, 1.072550],
            [-0.884537, 2.286910, -1.071350],
            [-0.884537, 2.286910, 1.071350],
            [-0.876660, 0.343945, -1.609890],
            [-0.876660, 0.343945, 1.609890],
            [-0.868654, 2.369530, -0.473023],
            [-0.868654, 2.369530, 0.473023],
            [-0.843750, 0.000000, -1.246880],
            [-0.843750, 0.000000, 1.246880],
            [-0.843750, 2.250000, -1.246880],
            [-0.843750, 2.250000, 1.246880],
            [-0.825000, 2.400000, 0.000000],
            [-0.820938, 2.339060, -0.820938],
            [-0.820938, 2.339060, 0.820938],
            [-0.815186, 2.323830, -1.204660],
            [-0.815186, 2.323830, 1.204660],
            [-0.814698, 2.274900, -0.986761],
            [-0.814698, 2.274900, 0.986761],
            [-0.808500, 2.400000, -0.168094],
            [-0.808500, 2.400000, 0.168094],
            [-0.798320, 1.860940, -1.466020],
            [-0.798320, 1.860940, 1.466020],
            [-0.794590, 0.159961, -1.459170],
            [-0.794590, 0.159961, 1.459170],
            [-0.789258, 2.348440, -1.166350],
            [-0.789258, 2.348440, 1.166350],
            [-0.787500, 2.250000, -1.163750],
            [-0.787500, 2.250000, 1.163750],
            [-0.785000, 0.750000, -1.845000],
            [-0.785000, 0.750000, 1.845000],
            [-0.776567, 0.591650, -1.825180],
            [-0.776567, 0.591650, 1.825180],
            [-0.776514, 2.323830, -1.147520],
            [-0.776514, 2.323830, 1.147520],
            [-0.768968, 2.319430, -0.931373],
            [-0.768968, 2.319430, 0.931373],
            [-0.768135, 1.100390, -1.805360],
            [-0.768135, 1.100390, 1.805360],
            [-0.763400, 2.369530, -0.630285],
            [-0.763400, 2.369530, 0.630285],
            [-0.761063, 2.400000, -0.323813],
            [-0.761063, 2.400000, 0.323813],
            [-0.754336, 0.453516, -1.772930],
            [-0.754336, 0.453516, 1.772930],
            [-0.734902, 0.042773, -1.349570],
            [-0.734902, 0.042773, 1.349570],
            [-0.731250, 2.250000, -1.080630],
            [-0.731250, 2.250000, 1.080630],
            [-0.723672, 1.471870, -1.700860],
            [-0.723672, 1.471870, 1.700860],
            [-0.709277, 2.299800, -1.048150],
            [-0.709277, 2.299800, 1.048150],
            [-0.704126, 2.286910, -1.293050],
            [-0.704126, 2.286910, 1.293050],
            [-0.686875, 0.234375, -1.614370],
            [-0.686875, 0.234375, 1.614370],
            [-0.685781, 2.400000, -0.464063],
            [-0.685781, 2.400000, 0.464063],
            [-0.680997, 2.336130, -1.250570],
            [-0.680997, 2.336130, 1.250570],
            [-0.664583, 2.336130, -1.220430],
            [-0.664583, 2.336130, 1.220430],
            [-0.663837, 2.286910, -1.219060],
            [-0.663837, 2.286910, 1.219060],
            [-0.650391, 2.339060, -0.961133],
            [-0.650391, 2.339060, 0.961133],
            [-0.631998, 2.430470, -0.064825],
            [-0.631998, 2.430470, 0.064825],
            [-0.630285, 2.369530, -0.763400],
            [-0.630285, 2.369530, 0.763400],
            [-0.619414, 0.085547, -1.455820],
            [-0.619414, 0.085547, 1.455820],
            [-0.611424, 2.274900, -1.122810],
            [-0.611424, 2.274900, 1.122810],
            [-0.607174, 2.430470, -0.190548],
            [-0.607174, 2.430470, 0.190548],
            [-0.593047, 0.670825, -1.892280],
            [-0.593047, 0.670825, 1.892280],
            [-0.589845, 0.925195, -1.882060],
            [-0.589845, 0.925195, 1.882060],
            [-0.588750, 0.000000, -1.383750],
            [-0.588750, 0.000000, 1.383750],
            [-0.588750, 2.250000, -1.383750],
            [-0.588750, 2.250000, 1.383750],
            [-0.585750, 2.400000, -0.585750],
            [-0.585750, 2.400000, 0.585750],
            [-0.581402, 0.522583, -1.855120],
            [-0.581402, 0.522583, 1.855120],
            [-0.577104, 2.319430, -1.059790],
            [-0.577104, 2.319430, 1.059790],
            [-0.568818, 2.323830, -1.336900],
            [-0.568818, 2.323830, 1.336900],
            [-0.566554, 1.286130, -1.807750],
            [-0.566554, 1.286130, 1.807750],
            [-0.559973, 2.430470, -0.304711],
            [-0.559973, 2.430470, 0.304711],
            [-0.550727, 2.348440, -1.294380],
            [-0.550727, 2.348440, 1.294380],
            [-0.549500, 2.250000, -1.291500],
            [-0.549500, 2.250000, 1.291500],
            [-0.547339, 0.343945, -1.746440],
            [-0.547339, 0.343945, 1.746440],
            [-0.541834, 2.323830, -1.273480],
            [-0.541834, 2.323830, 1.273480],
            [-0.510250, 2.250000, -1.199250],
            [-0.510250, 2.250000, 1.199250],
            [-0.498428, 1.860940, -1.590370],
            [-0.498428, 1.860940, 1.590370],
            [-0.496099, 0.159961, -1.582940],
            [-0.496099, 0.159961, 1.582940],
            [-0.494918, 2.299800, -1.163220],
            [-0.494918, 2.299800, 1.163220],
            [-0.491907, 2.430470, -0.406410],
            [-0.491907, 2.430470, 0.406410],
            [-0.473023, 2.369530, -0.868654],
            [-0.473023, 2.369530, 0.868654],
            [-0.464063, 2.400000, -0.685781],
            [-0.464063, 2.400000, 0.685781],
            [-0.458833, 0.042773, -1.464030],
            [-0.458833, 0.042773, 1.464030],
            [-0.456250, 2.460940, 0.000000],
            [-0.453828, 2.339060, -1.066640],
            [-0.453828, 2.339060, 1.066640],
            [-0.439618, 2.286910, -1.402720],
            [-0.439618, 2.286910, 1.402720],
            [-0.438241, 2.460940, -0.091207],
            [-0.438241, 2.460940, 0.091207],
            [-0.425177, 2.336130, -1.356650],
            [-0.425177, 2.336130, 1.356650],
            [-0.420891, 2.460940, -0.179078],
            [-0.420891, 2.460940, 0.179078],
            [-0.414929, 2.336130, -1.323950],
            [-0.414929, 2.336130, 1.323950],
            [-0.414464, 2.286910, -1.322460],
            [-0.414464, 2.286910, 1.322460],
            [-0.407500, 0.750000, -1.960000],
            [-0.407500, 0.750000, 1.960000],
            [-0.406410, 2.430470, -0.491907],
            [-0.406410, 2.430470, 0.491907],
            [-0.403123, 0.591650, -1.938950],
            [-0.403123, 0.591650, 1.938950],
            [-0.398745, 1.100390, -1.917890],
            [-0.398745, 1.100390, 1.917890],
            [-0.391582, 0.453516, -1.883440],
            [-0.391582, 0.453516, 1.883440],
            [-0.381740, 2.274900, -1.218050],
            [-0.381740, 2.274900, 1.218050],
            [-0.375664, 1.471870, -1.806870],
            [-0.375664, 1.471870, 1.806870],
            [-0.372159, 2.460940, -0.251889],
            [-0.372159, 2.460940, 0.251889],
            [-0.362109, 2.897170, 0.000000],
            [-0.360312, 2.319430, -1.149680],
            [-0.360312, 2.319430, 1.149680],
            [-0.356563, 0.234375, 1.715000],
            [-0.356562, 0.234375, -1.715000],
            [-0.340625, 2.950780, 0.000000],
            [-0.337859, 2.923970, -0.069278],
            [-0.337859, 2.923970, 0.069278],
            [-0.334238, 2.897170, -0.142705],
            [-0.334238, 2.897170, 0.142705],
            [-0.330325, 2.864210, -0.067672],
            [-0.330325, 2.864210, 0.067672],
            [-0.325000, 2.831250, 0.000000],
            [-0.323938, 2.460940, -0.323938],
            [-0.323938, 2.460940, 0.323938],
            [-0.323813, 2.400000, -0.761063],
            [-0.323813, 2.400000, 0.761063],
            [-0.321543, 0.085547, -1.546560],
            [-0.321543, 0.085547, 1.546560],
            [-0.315410, 2.505470, -0.064395],
            [-0.315410, 2.505470, 0.064395],
            [-0.314464, 2.950780, -0.134407],
            [-0.314464, 2.950780, 0.134407],
            [-0.305625, 0.000000, -1.470000],
            [-0.305625, 0.000000, 1.470000],
            [-0.305625, 2.250000, -1.470000],
            [-0.305625, 2.250000, 1.470000],
            [-0.304711, 2.430470, -0.559973],
            [-0.304711, 2.430470, 0.559973],
            [-0.299953, 2.831250, -0.127984],
            [-0.299953, 2.831250, 0.127984],
            [-0.295330, 2.369530, -0.942332],
            [-0.295330, 2.369530, 0.942332],
            [-0.295278, 2.323830, -1.420230],
            [-0.295278, 2.323830, 1.420230],
            [-0.287197, 2.923970, -0.194300],
            [-0.287197, 2.923970, 0.194300],
            [-0.285887, 2.348440, -1.375060],
            [-0.285887, 2.348440, 1.375060],
            [-0.285250, 2.250000, -1.372000],
            [-0.285250, 2.250000, 1.372000],
            [-0.281271, 2.323830, -1.352860],
            [-0.281271, 2.323830, 1.352860],
            [-0.280732, 2.864210, -0.189856],
            [-0.280732, 2.864210, 0.189856],
            [-0.274421, 2.968800, -0.056380],
            [-0.274421, 2.968800, 0.056380],
            [-0.267832, 2.505470, -0.180879],
            [-0.267832, 2.505470, 0.180879],
            [-0.264875, 2.250000, -1.274000],
            [-0.264875, 2.250000, 1.274000],
            [-0.257610, 2.897170, -0.257610],
            [-0.257610, 2.897170, 0.257610],
            [-0.256916, 2.299800, -1.235720],
            [-0.256916, 2.299800, 1.235720],
            [-0.251889, 2.460940, -0.372159],
            [-0.251889, 2.460940, 0.372159],
            [-0.250872, 2.757420, -0.051347],
            [-0.250872, 2.757420, 0.051347],
            [-0.242477, 2.950780, -0.242477],
            [-0.242477, 2.950780, 0.242477],
            [-0.235586, 2.339060, -1.133120],
            [-0.235586, 2.339060, 1.133120],
            [-0.233382, 2.968800, -0.158018],
            [-0.233382, 2.968800, 0.158018],
            [-0.231125, 2.831250, -0.231125],
            [-0.231125, 2.831250, 0.231125],
            [-0.230078, 2.986820, 0.000000],
            [-0.213159, 2.757420, -0.144103],
            [-0.213159, 2.757420, 0.144103],
            [-0.212516, 2.986820, -0.091113],
            [-0.212516, 2.986820, 0.091113],
            [-0.202656, 0.670825, -1.969370],
            [-0.202656, 0.670825, 1.969370],
            [-0.201561, 0.925195, -1.958730],
            [-0.201561, 0.925195, 1.958730],
            [-0.200000, 2.550000, 0.000000],
            [-0.198676, 0.522583, -1.930690],
            [-0.198676, 0.522583, 1.930690],
            [-0.196875, 2.683590, 0.000000],
            [-0.194300, 2.923970, -0.287197],
            [-0.194300, 2.923970, 0.287197],
            [-0.193602, 1.286130, -1.881390],
            [-0.193602, 1.286130, 1.881390],
            [-0.190548, 2.430470, -0.607174],
            [-0.190548, 2.430470, 0.607174],
            [-0.189856, 2.864210, -0.280732],
            [-0.189856, 2.864210, 0.280732],
            [-0.187036, 0.343945, -1.817580],
            [-0.187036, 0.343945, 1.817580],
            [-0.184500, 2.550000, -0.078500],
            [-0.184500, 2.550000, 0.078500],
            [-0.181661, 2.683590, -0.077405],
            [-0.181661, 2.683590, 0.077405],
            [-0.180879, 2.505470, -0.267832],
            [-0.180879, 2.505470, 0.267832],
            [-0.179078, 2.460940, -0.420891],
            [-0.179078, 2.460940, 0.420891],
            [-0.176295, 2.581200, -0.036001],
            [-0.176295, 2.581200, 0.036001],
            [-0.174804, 2.648000, -0.035727],
            [-0.174804, 2.648000, 0.035727],
            [-0.170322, 1.860940, -1.655160],
            [-0.170322, 1.860940, 1.655160],
            [-0.169526, 0.159961, -1.647420],
            [-0.169526, 0.159961, 1.647420],
            [-0.168094, 2.400000, -0.808500],
            [-0.168094, 2.400000, 0.808500],
            [-0.166797, 2.612400, 0.000000],
            [-0.164073, 2.986820, -0.164073],
            [-0.164073, 2.986820, 0.164073],
            [-0.158018, 2.968800, -0.233382],
            [-0.158018, 2.968800, 0.233382],
            [-0.156792, 0.042773, -1.523670],
            [-0.156792, 0.042773, 1.523670],
            [-0.153882, 2.612400, -0.065504],
            [-0.153882, 2.612400, 0.065504],
            [-0.150226, 2.286910, -1.459860],
            [-0.150226, 2.286910, 1.459860],
            [-0.149710, 2.581200, -0.101116],
            [-0.149710, 2.581200, 0.101116],
            [-0.148475, 2.648000, -0.100316],
            [-0.148475, 2.648000, 0.100316],
            [-0.145291, 2.336130, -1.411910],
            [-0.145291, 2.336130, 1.411910],
            [-0.144103, 2.757420, -0.213159],
            [-0.144103, 2.757420, 0.213159],
            [-0.142705, 2.897170, -0.334238],
            [-0.142705, 2.897170, 0.334238],
            [-0.142000, 2.550000, -0.142000],
            [-0.142000, 2.550000, 0.142000],
            [-0.141789, 2.336130, -1.377880],
            [-0.141789, 2.336130, 1.377880],
            [-0.141630, 2.286910, -1.376330],
            [-0.141630, 2.286910, 1.376330],
            [-0.139898, 2.683590, -0.139898],
            [-0.139898, 2.683590, 0.139898],
            [-0.134407, 2.950780, -0.314464],
            [-0.134407, 2.950780, 0.314464],
            [-0.130448, 2.274900, -1.267660],
            [-0.130448, 2.274900, 1.267660],
            [-0.127984, 2.831250, -0.299953],
            [-0.127984, 2.831250, 0.299953],
            [-0.123125, 2.319430, -1.196510],
            [-0.123125, 2.319430, 1.196510],
            [-0.118458, 2.612400, -0.118458],
            [-0.118458, 2.612400, 0.118458],
            [-0.110649, 2.993410, -0.022778],
            [-0.110649, 2.993410, 0.022778],
            [-0.101116, 2.581200, -0.149710],
            [-0.101116, 2.581200, 0.149710],
            [-0.100920, 2.369530, -0.980719],
            [-0.100920, 2.369530, 0.980719],
            [-0.100316, 2.648000, -0.148475],
            [-0.100316, 2.648000, 0.148475],
            [-0.094147, 2.993410, -0.063797],
            [-0.094147, 2.993410, 0.063797],
            [-0.091207, 2.460940, -0.438241],
            [-0.091207, 2.460940, 0.438241],
            [-0.091113, 2.986820, -0.212516],
            [-0.091113, 2.986820, 0.212516],
            [-0.078500, 2.550000, -0.184500],
            [-0.078500, 2.550000, 0.184500],
            [-0.077405, 2.683590, -0.181661],
            [-0.077405, 2.683590, 0.181661],
            [-0.069278, 2.923970, -0.337859],
            [-0.069278, 2.923970, 0.337859],
            [-0.067672, 2.864210, -0.330325],
            [-0.067672, 2.864210, 0.330325],
            [-0.065504, 2.612400, -0.153882],
            [-0.065504, 2.612400, 0.153882],
            [-0.064825, 2.430470, -0.631998],
            [-0.064825, 2.430470, 0.631998],
            [-0.064395, 2.505470, -0.315410],
            [-0.064395, 2.505470, 0.315410],
            [-0.063797, 2.993410, -0.094147],
            [-0.063797, 2.993410, 0.094147],
            [-0.056380, 2.968800, -0.274421],
            [-0.056380, 2.968800, 0.274421],
            [-0.051347, 2.757420, -0.250872],
            [-0.051347, 2.757420, 0.250872],
            [-0.036001, 2.581200, -0.176295],
            [-0.036001, 2.581200, 0.176295],
            [-0.035727, 2.648000, -0.174804],
            [-0.035727, 2.648000, 0.174804],
            [-0.022778, 2.993410, -0.110649],
            [-0.022778, 2.993410, 0.110649],
            [0.000000, 0.000000, -1.500000],
            [0.000000, 0.000000, 1.500000],
            [0.000000, 0.085547, -1.578130],
            [0.000000, 0.085547, 1.578130],
            [0.000000, 0.234375, -1.750000],
            [0.000000, 0.234375, 1.750000],
            [0.000000, 0.453516, -1.921880],
            [0.000000, 0.453516, 1.921880],
            [0.000000, 0.591650, -1.978520],
            [0.000000, 0.591650, 1.978520],
            [0.000000, 0.750000, -2.000000],
            [0.000000, 0.750000, 2.000000],
            [0.000000, 1.100390, -1.957030],
            [0.000000, 1.100390, 1.957030],
            [0.000000, 1.471870, -1.843750],
            [0.000000, 1.471870, 1.843750],
            [0.000000, 2.250000, -1.500000],
            [0.000000, 2.250000, -1.400000],
            [0.000000, 2.250000, -1.300000],
            [0.000000, 2.250000, 1.300000],
            [0.000000, 2.250000, 1.400000],
            [0.000000, 2.250000, 1.500000],
            [0.000000, 2.299800, -1.260940],
            [0.000000, 2.299800, 1.260940],
            [0.000000, 2.323830, -1.449220],
            [0.000000, 2.323830, -1.380470],
            [0.000000, 2.323830, 1.380470],
            [0.000000, 2.323830, 1.449220],
            [0.000000, 2.339060, -1.156250],
            [0.000000, 2.339060, 1.156250],
            [0.000000, 2.348440, -1.403130],
            [0.000000, 2.348440, 1.403130],
            [0.000000, 2.400000, -0.825000],
            [0.000000, 2.400000, 0.825000],
            [0.000000, 2.460940, -0.456250],
            [0.000000, 2.460940, 0.456250],
            [0.000000, 2.550000, -0.200000],
            [0.000000, 2.550000, 0.200000],
            [0.000000, 2.612400, -0.166797],
            [0.000000, 2.612400, 0.166797],
            [0.000000, 2.683590, -0.196875],
            [0.000000, 2.683590, 0.196875],
            [0.000000, 2.831250, -0.325000],
            [0.000000, 2.831250, 0.325000],
            [0.000000, 2.897170, -0.362109],
            [0.000000, 2.897170, 0.362109],
            [0.000000, 2.950780, -0.340625],
            [0.000000, 2.950780, 0.340625],
            [0.000000, 2.986820, -0.230078],
            [0.000000, 2.986820, 0.230078],
            [0.000000, 3.000000, 0.000000],
            [0.022778, 2.993410, -0.110649],
            [0.022778, 2.993410, 0.110649],
            [0.035727, 2.648000, -0.174804],
            [0.035727, 2.648000, 0.174804],
            [0.036001, 2.581200, -0.176295],
            [0.036001, 2.581200, 0.176295],
            [0.051347, 2.757420, -0.250872],
            [0.051347, 2.757420, 0.250872],
            [0.056380, 2.968800, -0.274421],
            [0.056380, 2.968800, 0.274421],
            [0.063797, 2.993410, -0.094147],
            [0.063797, 2.993410, 0.094147],
            [0.064395, 2.505470, -0.315410],
            [0.064395, 2.505470, 0.315410],
            [0.064825, 2.430470, -0.631998],
            [0.064825, 2.430470, 0.631998],
            [0.065504, 2.612400, -0.153882],
            [0.065504, 2.612400, 0.153882],
            [0.067672, 2.864210, -0.330325],
            [0.067672, 2.864210, 0.330325],
            [0.069278, 2.923970, -0.337859],
            [0.069278, 2.923970, 0.337859],
            [0.077405, 2.683590, -0.181661],
            [0.077405, 2.683590, 0.181661],
            [0.078500, 2.550000, -0.184500],
            [0.078500, 2.550000, 0.184500],
            [0.091113, 2.986820, -0.212516],
            [0.091113, 2.986820, 0.212516],
            [0.091207, 2.460940, -0.438241],
            [0.091207, 2.460940, 0.438241],
            [0.094147, 2.993410, -0.063797],
            [0.094147, 2.993410, 0.063797],
            [0.100316, 2.648000, -0.148475],
            [0.100316, 2.648000, 0.148475],
            [0.100920, 2.369530, -0.980719],
            [0.100920, 2.369530, 0.980719],
            [0.101116, 2.581200, -0.149710],
            [0.101116, 2.581200, 0.149710],
            [0.110649, 2.993410, -0.022778],
            [0.110649, 2.993410, 0.022778],
            [0.118458, 2.612400, -0.118458],
            [0.118458, 2.612400, 0.118458],
            [0.123125, 2.319430, -1.196510],
            [0.123125, 2.319430, 1.196510],
            [0.127984, 2.831250, -0.299953],
            [0.127984, 2.831250, 0.299953],
            [0.130448, 2.274900, -1.267660],
            [0.130448, 2.274900, 1.267660],
            [0.134407, 2.950780, -0.314464],
            [0.134407, 2.950780, 0.314464],
            [0.139898, 2.683590, -0.139898],
            [0.139898, 2.683590, 0.139898],
            [0.141630, 2.286910, -1.376330],
            [0.141630, 2.286910, 1.376330],
            [0.141789, 2.336130, -1.377880],
            [0.141789, 2.336130, 1.377880],
            [0.142000, 2.550000, -0.142000],
            [0.142000, 2.550000, 0.142000],
            [0.142705, 2.897170, -0.334238],
            [0.142705, 2.897170, 0.334238],
            [0.144103, 2.757420, -0.213159],
            [0.144103, 2.757420, 0.213159],
            [0.145291, 2.336130, -1.411910],
            [0.145291, 2.336130, 1.411910],
            [0.148475, 2.648000, -0.100316],
            [0.148475, 2.648000, 0.100316],
            [0.149710, 2.581200, -0.101116],
            [0.149710, 2.581200, 0.101116],
            [0.150226, 2.286910, -1.459860],
            [0.150226, 2.286910, 1.459860],
            [0.153882, 2.612400, -0.065504],
            [0.153882, 2.612400, 0.065504],
            [0.156792, 0.042773, -1.523670],
            [0.156792, 0.042773, 1.523670],
            [0.158018, 2.968800, -0.233382],
            [0.158018, 2.968800, 0.233382],
            [0.164073, 2.986820, -0.164073],
            [0.164073, 2.986820, 0.164073],
            [0.166797, 2.612400, 0.000000],
            [0.168094, 2.400000, -0.808500],
            [0.168094, 2.400000, 0.808500],
            [0.169526, 0.159961, -1.647420],
            [0.169526, 0.159961, 1.647420],
            [0.170322, 1.860940, -1.655160],
            [0.170322, 1.860940, 1.655160],
            [0.174804, 2.648000, -0.035727],
            [0.174804, 2.648000, 0.035727],
            [0.176295, 2.581200, -0.036001],
            [0.176295, 2.581200, 0.036001],
            [0.179078, 2.460940, -0.420891],
            [0.179078, 2.460940, 0.420891],
            [0.180879, 2.505470, -0.267832],
            [0.180879, 2.505470, 0.267832],
            [0.181661, 2.683590, -0.077405],
            [0.181661, 2.683590, 0.077405],
            [0.184500, 2.550000, -0.078500],
            [0.184500, 2.550000, 0.078500],
            [0.187036, 0.343945, -1.817580],
            [0.187036, 0.343945, 1.817580],
            [0.189856, 2.864210, -0.280732],
            [0.189856, 2.864210, 0.280732],
            [0.190548, 2.430470, -0.607174],
            [0.190548, 2.430470, 0.607174],
            [0.193602, 1.286130, -1.881390],
            [0.193602, 1.286130, 1.881390],
            [0.194300, 2.923970, -0.287197],
            [0.194300, 2.923970, 0.287197],
            [0.196875, 2.683590, 0.000000],
            [0.198676, 0.522583, -1.930690],
            [0.198676, 0.522583, 1.930690],
            [0.200000, 2.550000, 0.000000],
            [0.201561, 0.925195, -1.958730],
            [0.201561, 0.925195, 1.958730],
            [0.202656, 0.670825, -1.969370],
            [0.202656, 0.670825, 1.969370],
            [0.212516, 2.986820, -0.091113],
            [0.212516, 2.986820, 0.091113],
            [0.213159, 2.757420, -0.144103],
            [0.213159, 2.757420, 0.144103],
            [0.230078, 2.986820, 0.000000],
            [0.231125, 2.831250, -0.231125],
            [0.231125, 2.831250, 0.231125],
            [0.233382, 2.968800, -0.158018],
            [0.233382, 2.968800, 0.158018],
            [0.235586, 2.339060, -1.133120],
            [0.235586, 2.339060, 1.133120],
            [0.242477, 2.950780, -0.242477],
            [0.242477, 2.950780, 0.242477],
            [0.250872, 2.757420, -0.051347],
            [0.250872, 2.757420, 0.051347],
            [0.251889, 2.460940, -0.372159],
            [0.251889, 2.460940, 0.372159],
            [0.256916, 2.299800, -1.235720],
            [0.256916, 2.299800, 1.235720],
            [0.257610, 2.897170, -0.257610],
            [0.257610, 2.897170, 0.257610],
            [0.264875, 2.250000, -1.274000],
            [0.264875, 2.250000, 1.274000],
            [0.267832, 2.505470, -0.180879],
            [0.267832, 2.505470, 0.180879],
            [0.274421, 2.968800, -0.056380],
            [0.274421, 2.968800, 0.056380],
            [0.280732, 2.864210, -0.189856],
            [0.280732, 2.864210, 0.189856],
            [0.281271, 2.323830, -1.352860],
            [0.281271, 2.323830, 1.352860],
            [0.285250, 2.250000, -1.372000],
            [0.285250, 2.250000, 1.372000],
            [0.285887, 2.348440, -1.375060],
            [0.285887, 2.348440, 1.375060],
            [0.287197, 2.923970, -0.194300],
            [0.287197, 2.923970, 0.194300],
            [0.295278, 2.323830, -1.420230],
            [0.295278, 2.323830, 1.420230],
            [0.295330, 2.369530, -0.942332],
            [0.295330, 2.369530, 0.942332],
            [0.299953, 2.831250, -0.127984],
            [0.299953, 2.831250, 0.127984],
            [0.304711, 2.430470, -0.559973],
            [0.304711, 2.430470, 0.559973],
            [0.305625, 0.000000, -1.470000],
            [0.305625, 0.000000, 1.470000],
            [0.305625, 2.250000, -1.470000],
            [0.305625, 2.250000, 1.470000],
            [0.314464, 2.950780, -0.134407],
            [0.314464, 2.950780, 0.134407],
            [0.315410, 2.505470, -0.064395],
            [0.315410, 2.505470, 0.064395],
            [0.321543, 0.085547, -1.546560],
            [0.321543, 0.085547, 1.546560],
            [0.323813, 2.400000, -0.761063],
            [0.323813, 2.400000, 0.761063],
            [0.323938, 2.460940, -0.323938],
            [0.323938, 2.460940, 0.323938],
            [0.325000, 2.831250, 0.000000],
            [0.330325, 2.864210, -0.067672],
            [0.330325, 2.864210, 0.067672],
            [0.334238, 2.897170, -0.142705],
            [0.334238, 2.897170, 0.142705],
            [0.337859, 2.923970, -0.069278],
            [0.337859, 2.923970, 0.069278],
            [0.340625, 2.950780, 0.000000],
            [0.356562, 0.234375, 1.715000],
            [0.356563, 0.234375, -1.715000],
            [0.360312, 2.319430, -1.149680],
            [0.360312, 2.319430, 1.149680],
            [0.362109, 2.897170, 0.000000],
            [0.372159, 2.460940, -0.251889],
            [0.372159, 2.460940, 0.251889],
            [0.375664, 1.471870, -1.806870],
            [0.375664, 1.471870, 1.806870],
            [0.381740, 2.274900, -1.218050],
            [0.381740, 2.274900, 1.218050],
            [0.391582, 0.453516, -1.883440],
            [0.391582, 0.453516, 1.883440],
            [0.398745, 1.100390, -1.917890],
            [0.398745, 1.100390, 1.917890],
            [0.403123, 0.591650, -1.938950],
            [0.403123, 0.591650, 1.938950],
            [0.406410, 2.430470, -0.491907],
            [0.406410, 2.430470, 0.491907],
            [0.407500, 0.750000, -1.960000],
            [0.407500, 0.750000, 1.960000],
            [0.414464, 2.286910, -1.322460],
            [0.414464, 2.286910, 1.322460],
            [0.414929, 2.336130, -1.323950],
            [0.414929, 2.336130, 1.323950],
            [0.420891, 2.460940, -0.179078],
            [0.420891, 2.460940, 0.179078],
            [0.425177, 2.336130, -1.356650],
            [0.425177, 2.336130, 1.356650],
            [0.438241, 2.460940, -0.091207],
            [0.438241, 2.460940, 0.091207],
            [0.439618, 2.286910, -1.402720],
            [0.439618, 2.286910, 1.402720],
            [0.453828, 2.339060, -1.066640],
            [0.453828, 2.339060, 1.066640],
            [0.456250, 2.460940, 0.000000],
            [0.458833, 0.042773, -1.464030],
            [0.458833, 0.042773, 1.464030],
            [0.464063, 2.400000, -0.685781],
            [0.464063, 2.400000, 0.685781],
            [0.473023, 2.369530, -0.868654],
            [0.473023, 2.369530, 0.868654],
            [0.491907, 2.430470, -0.406410],
            [0.491907, 2.430470, 0.406410],
            [0.494918, 2.299800, -1.163220],
            [0.494918, 2.299800, 1.163220],
            [0.496099, 0.159961, -1.582940],
            [0.496099, 0.159961, 1.582940],
            [0.498428, 1.860940, -1.590370],
            [0.498428, 1.860940, 1.590370],
            [0.510250, 2.250000, -1.199250],
            [0.510250, 2.250000, 1.199250],
            [0.541834, 2.323830, -1.273480],
            [0.541834, 2.323830, 1.273480],
            [0.547339, 0.343945, -1.746440],
            [0.547339, 0.343945, 1.746440],
            [0.549500, 2.250000, -1.291500],
            [0.549500, 2.250000, 1.291500],
            [0.550727, 2.348440, -1.294380],
            [0.550727, 2.348440, 1.294380],
            [0.559973, 2.430470, -0.304711],
            [0.559973, 2.430470, 0.304711],
            [0.566554, 1.286130, -1.807750],
            [0.566554, 1.286130, 1.807750],
            [0.568818, 2.323830, -1.336900],
            [0.568818, 2.323830, 1.336900],
            [0.577104, 2.319430, -1.059790],
            [0.577104, 2.319430, 1.059790],
            [0.581402, 0.522583, -1.855120],
            [0.581402, 0.522583, 1.855120],
            [0.585750, 2.400000, -0.585750],
            [0.585750, 2.400000, 0.585750],
            [0.588750, 0.000000, -1.383750],
            [0.588750, 0.000000, 1.383750],
            [0.588750, 2.250000, -1.383750],
            [0.588750, 2.250000, 1.383750],
            [0.589845, 0.925195, -1.882060],
            [0.589845, 0.925195, 1.882060],
            [0.593047, 0.670825, -1.892280],
            [0.593047, 0.670825, 1.892280],
            [0.607174, 2.430470, -0.190548],
            [0.607174, 2.430470, 0.190548],
            [0.611424, 2.274900, -1.122810],
            [0.611424, 2.274900, 1.122810],
            [0.619414, 0.085547, -1.455820],
            [0.619414, 0.085547, 1.455820],
            [0.630285, 2.369530, -0.763400],
            [0.630285, 2.369530, 0.763400],
            [0.631998, 2.430470, -0.064825],
            [0.631998, 2.430470, 0.064825],
            [0.650391, 2.339060, -0.961133],
            [0.650391, 2.339060, 0.961133],
            [0.663837, 2.286910, -1.219060],
            [0.663837, 2.286910, 1.219060],
            [0.664583, 2.336130, -1.220430],
            [0.664583, 2.336130, 1.220430],
            [0.680997, 2.336130, -1.250570],
            [0.680997, 2.336130, 1.250570],
            [0.685781, 2.400000, -0.464063],
            [0.685781, 2.400000, 0.464063],
            [0.686875, 0.234375, -1.614370],
            [0.686875, 0.234375, 1.614370],
            [0.704126, 2.286910, -1.293050],
            [0.704126, 2.286910, 1.293050],
            [0.709277, 2.299800, -1.048150],
            [0.709277, 2.299800, 1.048150],
            [0.723672, 1.471870, -1.700860],
            [0.723672, 1.471870, 1.700860],
            [0.731250, 2.250000, -1.080630],
            [0.731250, 2.250000, 1.080630],
            [0.734902, 0.042773, -1.349570],
            [0.734902, 0.042773, 1.349570],
            [0.754336, 0.453516, -1.772930],
            [0.754336, 0.453516, 1.772930],
            [0.761063, 2.400000, -0.323813],
            [0.761063, 2.400000, 0.323813],
            [0.763400, 2.369530, -0.630285],
            [0.763400, 2.369530, 0.630285],
            [0.768135, 1.100390, -1.805360],
            [0.768135, 1.100390, 1.805360],
            [0.768968, 2.319430, -0.931373],
            [0.768968, 2.319430, 0.931373],
            [0.776514, 2.323830, -1.147520],
            [0.776514, 2.323830, 1.147520],
            [0.776567, 0.591650, -1.825180],
            [0.776567, 0.591650, 1.825180],
            [0.785000, 0.750000, -1.845000],
            [0.785000, 0.750000, 1.845000],
            [0.787500, 2.250000, -1.163750],
            [0.787500, 2.250000, 1.163750],
            [0.789258, 2.348440, -1.166350],
            [0.789258, 2.348440, 1.166350],
            [0.794590, 0.159961, -1.459170],
            [0.794590, 0.159961, 1.459170],
            [0.798320, 1.860940, -1.466020],
            [0.798320, 1.860940, 1.466020],
            [0.808500, 2.400000, -0.168094],
            [0.808500, 2.400000, 0.168094],
            [0.814698, 2.274900, -0.986761],
            [0.814698, 2.274900, 0.986761],
            [0.815186, 2.323830, -1.204660],
            [0.815186, 2.323830, 1.204660],
            [0.820938, 2.339060, -0.820938],
            [0.820938, 2.339060, 0.820938],
            [0.825000, 2.400000, 0.000000],
            [0.843750, 0.000000, -1.246880],
            [0.843750, 0.000000, 1.246880],
            [0.843750, 2.250000, -1.246880],
            [0.843750, 2.250000, 1.246880],
            [0.868654, 2.369530, -0.473023],
            [0.868654, 2.369530, 0.473023],
            [0.876660, 0.343945, -1.609890],
            [0.876660, 0.343945, 1.609890],
            [0.884537, 2.286910, -1.071350],
            [0.884537, 2.286910, 1.071350],
            [0.885531, 2.336130, -1.072550],
            [0.885531, 2.336130, 1.072550],
            [0.887695, 0.085547, -1.311820],
            [0.887695, 0.085547, 1.311820],
            [0.895266, 2.299800, -0.895266],
            [0.895266, 2.299800, 0.895266],
            [0.907402, 2.336130, -1.099040],
            [0.907402, 2.336130, 1.099040],
            [0.907437, 1.286130, -1.666400],
            [0.907437, 1.286130, 1.666400],
            [0.923000, 2.250000, -0.923000],
            [0.923000, 2.250000, 0.923000],
            [0.931218, 0.522583, -1.710080],
            [0.931218, 0.522583, 1.710080],
            [0.931373, 2.319430, -0.768968],
            [0.931373, 2.319430, 0.768968],
            [0.938220, 2.286910, -1.136370],
            [0.938220, 2.286910, 1.136370],
            [0.942332, 2.369530, -0.295330],
            [0.942332, 2.369530, 0.295330],
            [0.944741, 0.925195, -1.734910],
            [0.944741, 0.925195, 1.734910],
            [0.949871, 0.670825, -1.744330],
            [0.949871, 0.670825, 1.744330],
            [0.961133, 2.339060, -0.650391],
            [0.961133, 2.339060, 0.650391],
            [0.979229, 0.042773, -1.186040],
            [0.979229, 0.042773, 1.186040],
            [0.980133, 2.323830, -0.980133],
            [0.980133, 2.323830, 0.980133],
            [0.980719, 2.369530, -0.100920],
            [0.980719, 2.369530, 0.100920],
            [0.984375, 0.234375, -1.454690],
            [0.984375, 0.234375, 1.454690],
            [0.986761, 2.274900, -0.814698],
            [0.986761, 2.274900, 0.814698],
            [0.994000, 2.250000, -0.994000],
            [0.994000, 2.250000, 0.994000],
            [0.996219, 2.348440, -0.996219],
            [0.996219, 2.348440, 0.996219],
            [1.028940, 2.323830, -1.028940],
            [1.028940, 2.323830, 1.028940],
            [1.037110, 1.471870, -1.532620],
            [1.037110, 1.471870, 1.532620],
            [1.048150, 2.299800, -0.709277],
            [1.048150, 2.299800, 0.709277],
            [1.058760, 0.159961, -1.282370],
            [1.058760, 0.159961, 1.282370],
            [1.059790, 2.319430, -0.577104],
            [1.059790, 2.319430, 0.577104],
            [1.063730, 1.860940, -1.288390],
            [1.063730, 1.860940, 1.288390],
            [1.065000, 0.000000, -1.065000],
            [1.065000, 0.000000, 1.065000],
            [1.065000, 2.250000, -1.065000],
            [1.065000, 2.250000, 1.065000],
            [1.066640, 2.339060, -0.453828],
            [1.066640, 2.339060, 0.453828],
            [1.071350, 2.286910, -0.884537],
            [1.071350, 2.286910, 0.884537],
            [1.072550, 2.336130, -0.885531],
            [1.072550, 2.336130, 0.885531],
            [1.080630, 2.250000, -0.731250],
            [1.080630, 2.250000, 0.731250],
            [1.081060, 0.453516, -1.597560],
            [1.081060, 0.453516, 1.597560],
            [1.099040, 2.336130, -0.907402],
            [1.099040, 2.336130, 0.907402],
            [1.100830, 1.100390, -1.626780],
            [1.100830, 1.100390, 1.626780],
            [1.112920, 0.591650, -1.644640],
            [1.112920, 0.591650, 1.644640],
            [1.120470, 0.085547, -1.120470],
            [1.120470, 0.085547, 1.120470],
            [1.122810, 2.274900, -0.611424],
            [1.122810, 2.274900, 0.611424],
            [1.125000, 0.750000, -1.662500],
            [1.125000, 0.750000, 1.662500],
            [1.133120, 2.339060, -0.235586],
            [1.133120, 2.339060, 0.235586],
            [1.136370, 2.286910, -0.938220],
            [1.136370, 2.286910, 0.938220],
            [1.147520, 2.323830, -0.776514],
            [1.147520, 2.323830, 0.776514],
            [1.149680, 2.319430, -0.360312],
            [1.149680, 2.319430, 0.360312],
            [1.156250, 2.339060, 0.000000],
            [1.163220, 2.299800, -0.494918],
            [1.163220, 2.299800, 0.494918],
            [1.163750, 2.250000, -0.787500],
            [1.163750, 2.250000, 0.787500],
            [1.166350, 2.348440, -0.789258],
            [1.166350, 2.348440, 0.789258],
            [1.168120, 0.343945, -1.414820],
            [1.168120, 0.343945, 1.414820],
            [1.186040, 0.042773, -0.979229],
            [1.186040, 0.042773, 0.979229],
            [1.196510, 2.319430, -0.123125],
            [1.196510, 2.319430, 0.123125],
            [1.199250, 2.250000, -0.510250],
            [1.199250, 2.250000, 0.510250],
            [1.204660, 2.323830, -0.815186],
            [1.204660, 2.323830, 0.815186],
            [1.209120, 1.286130, -1.464490],
            [1.209120, 1.286130, 1.464490],
            [1.218050, 2.274900, -0.381740],
            [1.218050, 2.274900, 0.381740],
            [1.219060, 2.286910, -0.663837],
            [1.219060, 2.286910, 0.663837],
            [1.220430, 2.336130, -0.664583],
            [1.220430, 2.336130, 0.664583],
            [1.235720, 2.299800, -0.256916],
            [1.235720, 2.299800, 0.256916],
            [1.240810, 0.522583, -1.502870],
            [1.240810, 0.522583, 1.502870],
            [1.242500, 0.234375, -1.242500],
            [1.242500, 0.234375, 1.242500],
            [1.246880, 0.000000, -0.843750],
            [1.246880, 0.000000, 0.843750],
            [1.246880, 2.250000, -0.843750],
            [1.246880, 2.250000, 0.843750],
            [1.250570, 2.336130, -0.680997],
            [1.250570, 2.336130, 0.680997],
            [1.258830, 0.925195, -1.524690],
            [1.258830, 0.925195, 1.524690],
            [1.260940, 2.299800, 0.000000],
            [1.265670, 0.670825, -1.532970],
            [1.265670, 0.670825, 1.532970],
            [1.267660, 2.274900, -0.130448],
            [1.267660, 2.274900, 0.130448],
            [1.273480, 2.323830, -0.541834],
            [1.273480, 2.323830, 0.541834],
            [1.274000, 2.250000, -0.264875],
            [1.274000, 2.250000, 0.264875],
            [1.282370, 0.159961, -1.058760],
            [1.282370, 0.159961, 1.058760],
            [1.288390, 1.860940, -1.063730],
            [1.288390, 1.860940, 1.063730],
            [1.291500, 2.250000, -0.549500],
            [1.291500, 2.250000, 0.549500],
            [1.293050, 2.286910, -0.704126],
            [1.293050, 2.286910, 0.704126],
            [1.294380, 2.348440, -0.550727],
            [1.294380, 2.348440, 0.550727],
            [1.300000, 2.250000, 0.000000],
            [1.309060, 1.471870, -1.309060],
            [1.309060, 1.471870, 1.309060],
            [1.311820, 0.085547, -0.887695],
            [1.311820, 0.085547, 0.887695],
            [1.322460, 2.286910, -0.414464],
            [1.322460, 2.286910, 0.414464],
            [1.323950, 2.336130, -0.414929],
            [1.323950, 2.336130, 0.414929],
            [1.336900, 2.323830, -0.568818],
            [1.336900, 2.323830, 0.568818],
            [1.349570, 0.042773, -0.734902],
            [1.349570, 0.042773, 0.734902],
            [1.352860, 2.323830, -0.281271],
            [1.352860, 2.323830, 0.281271],
            [1.356650, 2.336130, -0.425177],
            [1.356650, 2.336130, 0.425177],
            [1.364530, 0.453516, -1.364530],
            [1.364530, 0.453516, 1.364530],
            [1.372000, 2.250000, -0.285250],
            [1.372000, 2.250000, 0.285250],
            [1.375060, 2.348440, -0.285887],
            [1.375060, 2.348440, 0.285887],
            [1.376330, 2.286910, -0.141630],
            [1.376330, 2.286910, 0.141630],
            [1.377880, 2.336130, -0.141789],
            [1.377880, 2.336130, 0.141789],
            [1.380470, 2.323830, 0.000000],
            [1.383750, 0.000000, -0.588750],
            [1.383750, 0.000000, 0.588750],
            [1.383750, 2.250000, -0.588750],
            [1.383750, 2.250000, 0.588750],
            [1.389490, 1.100390, -1.389490],
            [1.389490, 1.100390, 1.389490],
            [1.400000, 2.250000, 0.000000],
            [1.402720, 2.286910, -0.439618],
            [1.402720, 2.286910, 0.439618],
            [1.403130, 2.348440, 0.000000],
            [1.404750, 0.591650, -1.404750],
            [1.404750, 0.591650, 1.404750],
            [1.411910, 2.336130, -0.145291],
            [1.411910, 2.336130, 0.145291],
            [1.414820, 0.343945, -1.168120],
            [1.414820, 0.343945, 1.168120],
            [1.420000, 0.750000, -1.420000],
            [1.420000, 0.750000, 1.420000],
            [1.420230, 2.323830, -0.295278],
            [1.420230, 2.323830, 0.295278],
            [1.449220, 2.323830, 0.000000],
            [1.454690, 0.234375, -0.984375],
            [1.454690, 0.234375, 0.984375],
            [1.455820, 0.085547, -0.619414],
            [1.455820, 0.085547, 0.619414],
            [1.459170, 0.159961, -0.794590],
            [1.459170, 0.159961, 0.794590],
            [1.459860, 2.286910, -0.150226],
            [1.459860, 2.286910, 0.150226],
            [1.464030, 0.042773, -0.458833],
            [1.464030, 0.042773, 0.458833],
            [1.464490, 1.286130, -1.209120],
            [1.464490, 1.286130, 1.209120],
            [1.466020, 1.860940, -0.798320],
            [1.466020, 1.860940, 0.798320],
            [1.470000, 0.000000, -0.305625],
            [1.470000, 0.000000, 0.305625],
            [1.470000, 2.250000, -0.305625],
            [1.470000, 2.250000, 0.305625],
            [1.500000, 0.000000, 0.000000],
            [1.500000, 2.250000, 0.000000],
            [1.502870, 0.522583, -1.240810],
            [1.502870, 0.522583, 1.240810],
            [1.523670, 0.042773, -0.156792],
            [1.523670, 0.042773, 0.156792],
            [1.524690, 0.925195, -1.258830],
            [1.524690, 0.925195, 1.258830],
            [1.532620, 1.471870, -1.037110],
            [1.532620, 1.471870, 1.037110],
            [1.532970, 0.670825, -1.265670],
            [1.532970, 0.670825, 1.265670],
            [1.546560, 0.085547, -0.321543],
            [1.546560, 0.085547, 0.321543],
            [1.578130, 0.085547, 0.000000],
            [1.582940, 0.159961, -0.496099],
            [1.582940, 0.159961, 0.496099],
            [1.590370, 1.860940, -0.498428],
            [1.590370, 1.860940, 0.498428],
            [1.597560, 0.453516, -1.081060],
            [1.597560, 0.453516, 1.081060],
            [1.609890, 0.343945, -0.876660],
            [1.609890, 0.343945, 0.876660],
            [1.614370, 0.234375, -0.686875],
            [1.614370, 0.234375, 0.686875],
            [1.626780, 1.100390, -1.100830],
            [1.626780, 1.100390, 1.100830],
            [1.644640, 0.591650, -1.112920],
            [1.644640, 0.591650, 1.112920],
            [1.647420, 0.159961, -0.169526],
            [1.647420, 0.159961, 0.169526],
            [1.655160, 1.860940, -0.170322],
            [1.655160, 1.860940, 0.170322],
            [1.662500, 0.750000, -1.125000],
            [1.662500, 0.750000, 1.125000],
            [1.666400, 1.286130, -0.907437],
            [1.666400, 1.286130, 0.907437],
            [1.700000, 0.450000, 0.000000],
            [1.700000, 0.485449, -0.216563],
            [1.700000, 0.485449, 0.216563],
            [1.700000, 0.578906, -0.371250],
            [1.700000, 0.578906, 0.371250],
            [1.700000, 0.711035, -0.464063],
            [1.700000, 0.711035, 0.464063],
            [1.700000, 0.862500, -0.495000],
            [1.700000, 0.862500, 0.495000],
            [1.700000, 1.013970, -0.464063],
            [1.700000, 1.013970, 0.464063],
            [1.700000, 1.146090, -0.371250],
            [1.700000, 1.146090, 0.371250],
            [1.700000, 1.239550, -0.216563],
            [1.700000, 1.239550, 0.216563],
            [1.700000, 1.275000, 0.000000],
            [1.700860, 1.471870, -0.723672],
            [1.700860, 1.471870, 0.723672],
            [1.710080, 0.522583, -0.931218],
            [1.710080, 0.522583, 0.931218],
            [1.715000, 0.234375, -0.356562],
            [1.715000, 0.234375, 0.356563],
            [1.734910, 0.925195, -0.944741],
            [1.734910, 0.925195, 0.944741],
            [1.744330, 0.670825, -0.949871],
            [1.744330, 0.670825, 0.949871],
            [1.746440, 0.343945, -0.547339],
            [1.746440, 0.343945, 0.547339],
            [1.750000, 0.234375, 0.000000],
            [1.772930, 0.453516, -0.754336],
            [1.772930, 0.453516, 0.754336],
            [1.805360, 1.100390, -0.768135],
            [1.805360, 1.100390, 0.768135],
            [1.806870, 1.471870, -0.375664],
            [1.806870, 1.471870, 0.375664],
            [1.807750, 1.286130, -0.566554],
            [1.807750, 1.286130, 0.566554],
            [1.808680, 0.669440, -0.415335],
            [1.808680, 0.669440, 0.415335],
            [1.815230, 0.556498, -0.292881],
            [1.815230, 0.556498, 0.292881],
            [1.817580, 0.343945, -0.187036],
            [1.817580, 0.343945, 0.187036],
            [1.818500, 0.493823, -0.107904],
            [1.818500, 0.493823, 0.107904],
            [1.825180, 0.591650, -0.776567],
            [1.825180, 0.591650, 0.776567],
            [1.843750, 1.471870, 0.000000],
            [1.844080, 1.273110, -0.106836],
            [1.844080, 1.273110, 0.106836],
            [1.845000, 0.750000, -0.785000],
            [1.845000, 0.750000, 0.785000],
            [1.849890, 1.212450, -0.289984],
            [1.849890, 1.212450, 0.289984],
            [1.855120, 0.522583, -0.581402],
            [1.855120, 0.522583, 0.581402],
            [1.860070, 1.106280, -0.412082],
            [1.860070, 1.106280, 0.412082],
            [1.872860, 0.972820, -0.473131],
            [1.872860, 0.972820, 0.473131],
            [1.881390, 1.286130, -0.193602],
            [1.881390, 1.286130, 0.193602],
            [1.882060, 0.925195, -0.589845],
            [1.882060, 0.925195, 0.589845],
            [1.883440, 0.453516, -0.391582],
            [1.883440, 0.453516, 0.391582],
            [1.886520, 0.830257, -0.473131],
            [1.886520, 0.830257, 0.473131],
            [1.892280, 0.670825, -0.593047],
            [1.892280, 0.670825, 0.593047],
            [1.908980, 0.762851, -0.457368],
            [1.908980, 0.762851, 0.457368],
            [1.917890, 1.100390, -0.398745],
            [1.917890, 1.100390, 0.398745],
            [1.921880, 0.453516, 0.000000],
            [1.925720, 0.624968, -0.368660],
            [1.925720, 0.624968, 0.368660],
            [1.930690, 0.522583, -0.198676],
            [1.930690, 0.522583, 0.198676],
            [1.935200, 0.536667, -0.215052],
            [1.935200, 0.536667, 0.215052],
            [1.938790, 0.503174, 0.000000],
            [1.938950, 0.591650, -0.403123],
            [1.938950, 0.591650, 0.403123],
            [1.957030, 1.100390, 0.000000],
            [1.958730, 0.925195, -0.201561],
            [1.958730, 0.925195, 0.201561],
            [1.960000, 0.750000, -0.407500],
            [1.960000, 0.750000, 0.407500],
            [1.969370, 0.670825, -0.202656],
            [1.969370, 0.670825, 0.202656],
            [1.978520, 0.591650, 0.000000],
            [1.984960, 1.304590, 0.000000],
            [1.991360, 1.273310, -0.210782],
            [1.991360, 1.273310, 0.210782],
            [2.000000, 0.750000, 0.000000],
            [2.007990, 0.721263, -0.409761],
            [2.007990, 0.721263, 0.409761],
            [2.008210, 1.190840, -0.361340],
            [2.008210, 1.190840, 0.361340],
            [2.024710, 0.614949, -0.288958],
            [2.024710, 0.614949, 0.288958],
            [2.032050, 1.074240, -0.451675],
            [2.032050, 1.074240, 0.451675],
            [2.033790, 0.556062, -0.106458],
            [2.033790, 0.556062, 0.106458],
            [2.059380, 0.940576, -0.481787],
            [2.059380, 0.940576, 0.481787],
            [2.086440, 1.330480, -0.101581],
            [2.086440, 1.330480, 0.101581],
            [2.086700, 0.806915, -0.451675],
            [2.086700, 0.806915, 0.451675],
            [2.101410, 1.278150, -0.275720],
            [2.101410, 1.278150, 0.275720],
            [2.110530, 0.690317, -0.361340],
            [2.110530, 0.690317, 0.361340],
            [2.127390, 0.607845, -0.210782],
            [2.127390, 0.607845, 0.210782],
            [2.127600, 1.186560, -0.391812],
            [2.127600, 1.186560, 0.391812],
            [2.133790, 0.576563, 0.000000],
            [2.160540, 1.071430, -0.449859],
            [2.160540, 1.071430, 0.449859],
            [2.169220, 0.790259, -0.399360],
            [2.169220, 0.790259, 0.399360],
            [2.179690, 1.385160, 0.000000],
            [2.189760, 1.358870, -0.195542],
            [2.189760, 1.358870, 0.195542],
            [2.194810, 0.691761, -0.281559],
            [2.194810, 0.691761, 0.281559],
            [2.195710, 0.948444, -0.449859],
            [2.195710, 0.948444, 0.449859],
            [2.208370, 0.637082, -0.103732],
            [2.208370, 0.637082, 0.103732],
            [2.216310, 1.289570, -0.335215],
            [2.216310, 1.289570, 0.335215],
            [2.220200, 0.891314, -0.434457],
            [2.220200, 0.891314, 0.434457],
            [2.248570, 1.433000, -0.092384],
            [2.248570, 1.433000, 0.092384],
            [2.253840, 1.191600, -0.419019],
            [2.253840, 1.191600, 0.419019],
            [2.259440, 0.772489, -0.349967],
            [2.259440, 0.772489, 0.349967],
            [2.268570, 1.390160, -0.250758],
            [2.268570, 1.390160, 0.250758],
            [2.281890, 0.696393, -0.204147],
            [2.281890, 0.696393, 0.204147],
            [2.290410, 0.667529, 0.000000],
            [2.296880, 1.079300, -0.446953],
            [2.296880, 1.079300, 0.446953],
            [2.299250, 0.874953, -0.384664],
            [2.299250, 0.874953, 0.384664],
            [2.303580, 1.315200, -0.356340],
            [2.303580, 1.315200, 0.356340],
            [2.306440, 1.504400, 0.000000],
            [2.318380, 1.483560, -0.173996],
            [2.318380, 1.483560, 0.173996],
            [2.330690, 0.784406, -0.271218],
            [2.330690, 0.784406, 0.271218],
            [2.339910, 0.966989, -0.419019],
            [2.339910, 0.966989, 0.419019],
            [2.347590, 0.734271, -0.099922],
            [2.347590, 0.734271, 0.099922],
            [2.347590, 1.220960, -0.409131],
            [2.347590, 1.220960, 0.409131],
            [2.349840, 1.428640, -0.298279],
            [2.349840, 1.428640, 0.298279],
            [2.353180, 1.568160, -0.080823],
            [2.353180, 1.568160, 0.080823],
            [2.375750, 1.535310, -0.219377],
            [2.375750, 1.535310, 0.219377],
            [2.377440, 0.869019, -0.335215],
            [2.377440, 0.869019, 0.335215],
            [2.387500, 1.650000, 0.000000],
            [2.394320, 1.350980, -0.372849],
            [2.394320, 1.350980, 0.372849],
            [2.394600, 1.120300, -0.409131],
            [2.394600, 1.120300, 0.409131],
            [2.400390, 1.634690, -0.149297],
            [2.400390, 1.634690, 0.149297],
            [2.403990, 0.799722, -0.195542],
            [2.403990, 0.799722, 0.195542],
            [2.414060, 0.773438, 0.000000],
            [2.415240, 1.477810, -0.311747],
            [2.415240, 1.477810, 0.311747],
            [2.434380, 1.594340, -0.255938],
            [2.434380, 1.594340, 0.255938],
            [2.438610, 1.026060, -0.356340],
            [2.438610, 1.026060, 0.356340],
            [2.445310, 1.261960, -0.397705],
            [2.445310, 1.261960, 0.397705],
            [2.451680, 1.805340, -0.063087],
            [2.451680, 1.805340, 0.063087],
            [2.464890, 1.405520, -0.357931],
            [2.464890, 1.405520, 0.357931],
            [2.473620, 0.951099, -0.250758],
            [2.473620, 0.951099, 0.250758],
            [2.477680, 1.786380, -0.171237],
            [2.477680, 1.786380, 0.171237],
            [2.482420, 1.537280, -0.319922],
            [2.482420, 1.537280, 0.319922],
            [2.493620, 0.908264, -0.092384],
            [2.493620, 0.908264, 0.092384],
            [2.496300, 1.172950, -0.372849],
            [2.496300, 1.172950, 0.372849],
            [2.501560, 1.971090, 0.000000],
            [2.517270, 1.965550, -0.103052],
            [2.517270, 1.965550, 0.103052],
            [2.517920, 1.328310, -0.357931],
            [2.517920, 1.328310, 0.357931],
            [2.523180, 1.753220, -0.243336],
            [2.523180, 1.753220, 0.243336],
            [2.537500, 1.471870, -0.341250],
            [2.537500, 1.471870, 0.341250],
            [2.540780, 1.095290, -0.298279],
            [2.540780, 1.095290, 0.298279],
            [2.549110, 2.044640, -0.047716],
            [2.549110, 2.044640, 0.047716],
            [2.558690, 1.950950, -0.176660],
            [2.558690, 1.950950, 0.176660],
            [2.567570, 1.256030, -0.311747],
            [2.567570, 1.256030, 0.311747],
            [2.572250, 1.040360, -0.173996],
            [2.572250, 1.040360, 0.173996],
            [2.579100, 2.121970, 0.000000],
            [2.580390, 1.711530, -0.279386],
            [2.580390, 1.711530, 0.279386],
            [2.581010, 2.037730, -0.129515],
            [2.581010, 2.037730, 0.129515],
            [2.584180, 1.019530, 0.000000],
            [2.592580, 1.406470, -0.319922],
            [2.592580, 1.406470, 0.319922],
            [2.598490, 2.119920, -0.087812],
            [2.598490, 2.119920, 0.087812],
            [2.601780, 1.554720, -0.304019],
            [2.601780, 1.554720, 0.304019],
            [2.607070, 1.198530, -0.219377],
            [2.607070, 1.198530, 0.219377],
            [2.611620, 1.691280, -0.287908],
            [2.611620, 1.691280, 0.287908],
            [2.617250, 1.930310, -0.220825],
            [2.617250, 1.930310, 0.220825],
            [2.629630, 1.165680, -0.080823],
            [2.629630, 1.165680, 0.080823],
            [2.637880, 2.025550, -0.180818],
            [2.637880, 2.025550, 0.180818],
            [2.640630, 1.349410, -0.255938],
            [2.640630, 1.349410, 0.255938],
            [2.649600, 2.114510, -0.150535],
            [2.649600, 2.114510, 0.150535],
            [2.650840, 2.185470, -0.042461],
            [2.650840, 2.185470, 0.042461],
            [2.653910, 1.504200, -0.264113],
            [2.653910, 1.504200, 0.264113],
            [2.665420, 1.649250, -0.266995],
            [2.665420, 1.649250, 0.266995],
            [2.674610, 1.309060, -0.149297],
            [2.674610, 1.309060, 0.149297],
            [2.678230, 1.782540, -0.252819],
            [2.678230, 1.782540, 0.252819],
            [2.684380, 1.906640, -0.235547],
            [2.684380, 1.906640, 0.235547],
            [2.687500, 1.293750, 0.000000],
            [2.691900, 2.183610, -0.115251],
            [2.691900, 2.183610, 0.115251],
            [2.696450, 1.463800, -0.185857],
            [2.696450, 1.463800, 0.185857],
            [2.700000, 2.250000, 0.000000],
            [2.708080, 2.010370, -0.208084],
            [2.708080, 2.010370, 0.208084],
            [2.717030, 1.611670, -0.213596],
            [2.717030, 1.611670, 0.213596],
            [2.720760, 1.440720, -0.068474],
            [2.720760, 1.440720, 0.068474],
            [2.725780, 2.250000, -0.082031],
            [2.725780, 2.250000, 0.082031],
            [2.725990, 2.106430, -0.175250],
            [2.725990, 2.106430, 0.175250],
            [2.736000, 1.751550, -0.219519],
            [2.736000, 1.751550, 0.219519],
            [2.750210, 2.269190, -0.039734],
            [2.750210, 2.269190, 0.039734],
            [2.751500, 1.882970, -0.220825],
            [2.751500, 1.882970, 0.220825],
            [2.753540, 1.585080, -0.124598],
            [2.753540, 1.585080, 0.124598],
            [2.767380, 1.575000, 0.000000],
            [2.775560, 2.284000, 0.000000],
            [2.780990, 1.994370, -0.208084],
            [2.780990, 1.994370, 0.208084],
            [2.783030, 1.726700, -0.154476],
            [2.783030, 1.726700, 0.154476],
            [2.793750, 2.250000, -0.140625],
            [2.793750, 2.250000, 0.140625],
            [2.797820, 2.271750, -0.107849],
            [2.797820, 2.271750, 0.107849],
            [2.799490, 2.292750, -0.076904],
            [2.799490, 2.292750, 0.076904],
            [2.800000, 2.250000, 0.000000],
            [2.804690, 2.098100, -0.200713],
            [2.804690, 2.098100, 0.200713],
            [2.809900, 1.712500, -0.056912],
            [2.809900, 1.712500, 0.056912],
            [2.810060, 1.862330, -0.176660],
            [2.810060, 1.862330, 0.176660],
            [2.812010, 2.178150, -0.169843],
            [2.812010, 2.178150, 0.169843],
            [2.812740, 2.297540, -0.035632],
            [2.812740, 2.297540, 0.035632],
            [2.817190, 2.250000, -0.049219],
            [2.817190, 2.250000, 0.049219],
            [2.825000, 2.306250, 0.000000],
            [2.830110, 2.271290, -0.025891],
            [2.830110, 2.271290, 0.025891],
            [2.840630, 2.292190, 0.000000],
            [2.844790, 2.299640, -0.029993],
            [2.844790, 2.299640, 0.029993],
            [2.850920, 2.307160, -0.065625],
            [2.850920, 2.307160, 0.065625],
            [2.851180, 1.979190, -0.180818],
            [2.851180, 1.979190, 0.180818],
            [2.851480, 1.847730, -0.103052],
            [2.851480, 1.847730, 0.103052],
            [2.860480, 2.300930, -0.096716],
            [2.860480, 2.300930, 0.096716],
            [2.862500, 2.250000, -0.084375],
            [2.862500, 2.250000, 0.084375],
            [2.862630, 2.292980, -0.054346],
            [2.862630, 2.292980, 0.054346],
            [2.865740, 2.272010, -0.070276],
            [2.865740, 2.272010, 0.070276],
            [2.867190, 1.842190, 0.000000],
            [2.872280, 2.294250, -0.131836],
            [2.872280, 2.294250, 0.131836],
            [2.883390, 2.089770, -0.175250],
            [2.883390, 2.089770, 0.175250],
            [2.888360, 2.301190, -0.081409],
            [2.888360, 2.301190, 0.081409],
            [2.898270, 2.170880, -0.194382],
            [2.898270, 2.170880, 0.194382],
            [2.908050, 1.967000, -0.129515],
            [2.908050, 1.967000, 0.129515],
            [2.919240, 2.309550, -0.112500],
            [2.919240, 2.309550, 0.112500],
            [2.920640, 2.295070, -0.093164],
            [2.920640, 2.295070, 0.093164],
            [2.932790, 2.131030, -0.172211],
            [2.932790, 2.131030, 0.172211],
            [2.939800, 2.273260, -0.158936],
            [2.939800, 2.273260, 0.158936],
            [2.939960, 1.960100, -0.047716],
            [2.939960, 1.960100, 0.047716],
            [2.959780, 2.081680, -0.150535],
            [2.959780, 2.081680, 0.150535],
            [2.969950, 2.274120, -0.103564],
            [2.969950, 2.274120, 0.103564],
            [3.000000, 2.250000, -0.187500],
            [3.000000, 2.250000, -0.112500],
            [3.000000, 2.250000, 0.112500],
            [3.000000, 2.250000, 0.187500],
            [3.002810, 2.304840, -0.142529],
            [3.002810, 2.304840, 0.142529],
            [3.010890, 2.076270, -0.087812],
            [3.010890, 2.076270, 0.087812],
            [3.015780, 2.305710, -0.119971],
            [3.015780, 2.305710, 0.119971],
            [3.030270, 2.074220, 0.000000],
            [3.041500, 2.125670, -0.116276],
            [3.041500, 2.125670, 0.116276],
            [3.043230, 2.211080, -0.166431],
            [3.043230, 2.211080, 0.166431],
            [3.068420, 2.173450, -0.143215],
            [3.068420, 2.173450, 0.143215],
            [3.079290, 2.123060, -0.042838],
            [3.079290, 2.123060, 0.042838],
            [3.093160, 2.298780, -0.175781],
            [3.093160, 2.298780, 0.175781],
            [3.096680, 2.301420, -0.124219],
            [3.096680, 2.301420, 0.124219],
            [3.126560, 2.316800, -0.150000],
            [3.126560, 2.316800, 0.150000],
            [3.126720, 2.277290, -0.103564],
            [3.126720, 2.277290, 0.103564],
            [3.126910, 2.171280, -0.083542],
            [3.126910, 2.171280, 0.083542],
            [3.137500, 2.250000, -0.084375],
            [3.137500, 2.250000, 0.084375],
            [3.149100, 2.170460, 0.000000],
            [3.153370, 2.275520, -0.158936],
            [3.153370, 2.275520, 0.158936],
            [3.168950, 2.211180, -0.112353],
            [3.168950, 2.211180, 0.112353],
            [3.182810, 2.250000, -0.049219],
            [3.182810, 2.250000, 0.049219],
            [3.200000, 2.250000, 0.000000],
            [3.206250, 2.250000, -0.140625],
            [3.206250, 2.250000, 0.140625],
            [3.207460, 2.312510, -0.119971],
            [3.207460, 2.312510, 0.119971],
            [3.212560, 2.210430, -0.041393],
            [3.212560, 2.210430, 0.041393],
            [3.216920, 2.310730, -0.142529],
            [3.216920, 2.310730, 0.142529],
            [3.230940, 2.279400, -0.070276],
            [3.230940, 2.279400, 0.070276],
            [3.267240, 2.278140, -0.025891],
            [3.267240, 2.278140, 0.025891],
            [3.272720, 2.307760, -0.093164],
            [3.272720, 2.307760, 0.093164],
            [3.274220, 2.250000, -0.082031],
            [3.274220, 2.250000, 0.082031],
            [3.295340, 2.277030, -0.107849],
            [3.295340, 2.277030, 0.107849],
            [3.300000, 2.250000, 0.000000],
            [3.314050, 2.303310, -0.131836],
            [3.314050, 2.303310, 0.131836],
            [3.330730, 2.309850, -0.054346],
            [3.330730, 2.309850, 0.054346],
            [3.333890, 2.324050, -0.112500],
            [3.333890, 2.324050, 0.112500],
            [3.334890, 2.317020, -0.081409],
            [3.334890, 2.317020, 0.081409],
            [3.342360, 2.280060, -0.039734],
            [3.342360, 2.280060, 0.039734],
            [3.355430, 2.302700, 0.000000],
            [3.359250, 2.314650, -0.096716],
            [3.359250, 2.314650, 0.096716],
            [3.379120, 2.316580, -0.029993],
            [3.379120, 2.316580, 0.029993],
            [3.386840, 2.304810, -0.076904],
            [3.386840, 2.304810, 0.076904],
            [3.402210, 2.326440, -0.065625],
            [3.402210, 2.326440, 0.065625],
            [3.406390, 2.318500, -0.035632],
            [3.406390, 2.318500, 0.035632],
            [3.408380, 2.315430, 0.000000],
            [3.428120, 2.327340, 0.000000]
        ];

        var indices = [
            [1454,1468,1458],
            [1448,1454,1458],
            [1461,1448,1458],
            [1468,1461,1458],
            [1429,1454,1440],
            [1421,1429,1440],
            [1448,1421,1440],
            [1454,1448,1440],
            [1380,1429,1398],
            [1373,1380,1398],
            [1421,1373,1398],
            [1429,1421,1398],
            [1327,1380,1349],
            [1319,1327,1349],
            [1373,1319,1349],
            [1380,1373,1349],
            [1448,1461,1460],
            [1456,1448,1460],
            [1471,1456,1460],
            [1461,1471,1460],
            [1421,1448,1442],
            [1433,1421,1442],
            [1456,1433,1442],
            [1448,1456,1442],
            [1373,1421,1400],
            [1382,1373,1400],
            [1433,1382,1400],
            [1421,1433,1400],
            [1319,1373,1351],
            [1329,1319,1351],
            [1382,1329,1351],
            [1373,1382,1351],
            [1264,1327,1289],
            [1258,1264,1289],
            [1319,1258,1289],
            [1327,1319,1289],
            [1192,1264,1228],
            [1188,1192,1228],
            [1258,1188,1228],
            [1264,1258,1228],
            [1100,1192,1157],
            [1098,1100,1157],
            [1188,1098,1157],
            [1192,1188,1157],
            [922,1100,1006],
            [928,922,1006],
            [1098,928,1006],
            [1100,1098,1006],
            [1258,1319,1291],
            [1266,1258,1291],
            [1329,1266,1291],
            [1319,1329,1291],
            [1188,1258,1230],
            [1194,1188,1230],
            [1266,1194,1230],
            [1258,1266,1230],
            [1098,1188,1159],
            [1102,1098,1159],
            [1194,1102,1159],
            [1188,1194,1159],
            [928,1098,1008],
            [933,928,1008],
            [1102,933,1008],
            [1098,1102,1008],
            [1456,1471,1475],
            [1481,1456,1475],
            [1482,1481,1475],
            [1471,1482,1475],
            [1433,1456,1450],
            [1444,1433,1450],
            [1481,1444,1450],
            [1456,1481,1450],
            [1382,1433,1412],
            [1392,1382,1412],
            [1444,1392,1412],
            [1433,1444,1412],
            [1329,1382,1357],
            [1331,1329,1357],
            [1392,1331,1357],
            [1382,1392,1357],
            [1481,1482,1490],
            [1500,1481,1490],
            [1502,1500,1490],
            [1482,1502,1490],
            [1444,1481,1470],
            [1465,1444,1470],
            [1500,1465,1470],
            [1481,1500,1470],
            [1392,1444,1431],
            [1410,1392,1431],
            [1465,1410,1431],
            [1444,1465,1431],
            [1331,1392,1371],
            [1345,1331,1371],
            [1410,1345,1371],
            [1392,1410,1371],
            [1266,1329,1297],
            [1276,1266,1297],
            [1331,1276,1297],
            [1329,1331,1297],
            [1194,1266,1232],
            [1200,1194,1232],
            [1276,1200,1232],
            [1266,1276,1232],
            [1102,1194,1163],
            [1106,1102,1163],
            [1200,1106,1163],
            [1194,1200,1163],
            [933,1102,1016],
            [929,933,1016],
            [1106,929,1016],
            [1102,1106,1016],
            [1276,1331,1307],
            [1283,1276,1307],
            [1345,1283,1307],
            [1331,1345,1307],
            [1200,1276,1238],
            [1210,1200,1238],
            [1283,1210,1238],
            [1276,1283,1238],
            [1106,1200,1167],
            [1116,1106,1167],
            [1210,1116,1167],
            [1200,1210,1167],
            [929,1106,1022],
            [923,929,1022],
            [1116,923,1022],
            [1106,1116,1022],
            [755,922,849],
            [757,755,849],
            [928,757,849],
            [922,928,849],
            [663,755,698],
            [667,663,698],
            [757,667,698],
            [755,757,698],
            [591,663,627],
            [597,591,627],
            [667,597,627],
            [663,667,627],
            [528,591,566],
            [536,528,566],
            [597,536,566],
            [591,597,566],
            [757,928,847],
            [753,757,847],
            [933,753,847],
            [928,933,847],
            [667,757,696],
            [661,667,696],
            [753,661,696],
            [757,753,696],
            [597,667,625],
            [589,597,625],
            [661,589,625],
            [667,661,625],
            [536,597,564],
            [526,536,564],
            [589,526,564],
            [597,589,564],
            [475,528,506],
            [482,475,506],
            [536,482,506],
            [528,536,506],
            [426,475,457],
            [434,426,457],
            [482,434,457],
            [475,482,457],
            [401,426,415],
            [407,401,415],
            [434,407,415],
            [426,434,415],
            [386,401,397],
            [393,386,397],
            [407,393,397],
            [401,407,397],
            [482,536,504],
            [473,482,504],
            [526,473,504],
            [536,526,504],
            [434,482,455],
            [422,434,455],
            [473,422,455],
            [482,473,455],
            [407,434,413],
            [399,407,413],
            [422,399,413],
            [434,422,413],
            [393,407,395],
            [383,393,395],
            [399,383,395],
            [407,399,395],
            [753,933,839],
            [749,753,839],
            [929,749,839],
            [933,929,839],
            [661,753,692],
            [655,661,692],
            [749,655,692],
            [753,749,692],
            [589,661,623],
            [579,589,623],
            [655,579,623],
            [661,655,623],
            [526,589,558],
            [524,526,558],
            [579,524,558],
            [589,579,558],
            [749,929,833],
            [741,749,833],
            [923,741,833],
            [929,923,833],
            [655,749,688],
            [647,655,688],
            [741,647,688],
            [749,741,688],
            [579,655,617],
            [574,579,617],
            [647,574,617],
            [655,647,617],
            [524,579,548],
            [512,524,548],
            [574,512,548],
            [579,574,548],
            [473,526,498],
            [463,473,498],
            [524,463,498],
            [526,524,498],
            [422,473,443],
            [411,422,443],
            [463,411,443],
            [473,463,443],
            [399,422,405],
            [374,399,405],
            [411,374,405],
            [422,411,405],
            [383,399,380],
            [372,383,380],
            [374,372,380],
            [399,374,380],
            [463,524,484],
            [447,463,484],
            [512,447,484],
            [524,512,484],
            [411,463,424],
            [392,411,424],
            [447,392,424],
            [463,447,424],
            [374,411,385],
            [357,374,385],
            [392,357,385],
            [411,392,385],
            [372,374,365],
            [353,372,365],
            [357,353,365],
            [374,357,365],
            [400,386,396],
            [406,400,396],
            [393,406,396],
            [386,393,396],
            [425,400,414],
            [433,425,414],
            [406,433,414],
            [400,406,414],
            [474,425,456],
            [481,474,456],
            [433,481,456],
            [425,433,456],
            [527,474,505],
            [535,527,505],
            [481,535,505],
            [474,481,505],
            [406,393,394],
            [398,406,394],
            [383,398,394],
            [393,383,394],
            [433,406,412],
            [421,433,412],
            [398,421,412],
            [406,398,412],
            [481,433,454],
            [472,481,454],
            [421,472,454],
            [433,421,454],
            [535,481,503],
            [525,535,503],
            [472,525,503],
            [481,472,503],
            [590,527,565],
            [596,590,565],
            [535,596,565],
            [527,535,565],
            [662,590,626],
            [666,662,626],
            [596,666,626],
            [590,596,626],
            [754,662,697],
            [756,754,697],
            [666,756,697],
            [662,666,697],
            [919,754,848],
            [927,919,848],
            [756,927,848],
            [754,756,848],
            [596,535,563],
            [588,596,563],
            [525,588,563],
            [535,525,563],
            [666,596,624],
            [660,666,624],
            [588,660,624],
            [596,588,624],
            [756,666,695],
            [752,756,695],
            [660,752,695],
            [666,660,695],
            [927,756,846],
            [932,927,846],
            [752,932,846],
            [756,752,846],
            [398,383,379],
            [373,398,379],
            [372,373,379],
            [383,372,379],
            [421,398,404],
            [410,421,404],
            [373,410,404],
            [398,373,404],
            [472,421,442],
            [462,472,442],
            [410,462,442],
            [421,410,442],
            [525,472,497],
            [523,525,497],
            [462,523,497],
            [472,462,497],
            [373,372,364],
            [356,373,364],
            [353,356,364],
            [372,353,364],
            [410,373,384],
            [391,410,384],
            [356,391,384],
            [373,356,384],
            [462,410,423],
            [446,462,423],
            [391,446,423],
            [410,391,423],
            [523,462,483],
            [511,523,483],
            [446,511,483],
            [462,446,483],
            [588,525,557],
            [578,588,557],
            [523,578,557],
            [525,523,557],
            [660,588,622],
            [654,660,622],
            [578,654,622],
            [588,578,622],
            [752,660,691],
            [748,752,691],
            [654,748,691],
            [660,654,691],
            [932,752,838],
            [926,932,838],
            [748,926,838],
            [752,748,838],
            [578,523,547],
            [573,578,547],
            [511,573,547],
            [523,511,547],
            [654,578,616],
            [646,654,616],
            [573,646,616],
            [578,573,616],
            [748,654,687],
            [740,748,687],
            [646,740,687],
            [654,646,687],
            [926,748,832],
            [918,926,832],
            [740,918,832],
            [748,740,832],
            [1099,919,1005],
            [1097,1099,1005],
            [927,1097,1005],
            [919,927,1005],
            [1191,1099,1156],
            [1187,1191,1156],
            [1097,1187,1156],
            [1099,1097,1156],
            [1263,1191,1227],
            [1257,1263,1227],
            [1187,1257,1227],
            [1191,1187,1227],
            [1326,1263,1288],
            [1318,1326,1288],
            [1257,1318,1288],
            [1263,1257,1288],
            [1097,927,1007],
            [1101,1097,1007],
            [932,1101,1007],
            [927,932,1007],
            [1187,1097,1158],
            [1193,1187,1158],
            [1101,1193,1158],
            [1097,1101,1158],
            [1257,1187,1229],
            [1265,1257,1229],
            [1193,1265,1229],
            [1187,1193,1229],
            [1318,1257,1290],
            [1328,1318,1290],
            [1265,1328,1290],
            [1257,1265,1290],
            [1379,1326,1348],
            [1372,1379,1348],
            [1318,1372,1348],
            [1326,1318,1348],
            [1428,1379,1397],
            [1420,1428,1397],
            [1372,1420,1397],
            [1379,1372,1397],
            [1453,1428,1439],
            [1447,1453,1439],
            [1420,1447,1439],
            [1428,1420,1439],
            [1468,1453,1457],
            [1461,1468,1457],
            [1447,1461,1457],
            [1453,1447,1457],
            [1372,1318,1350],
            [1381,1372,1350],
            [1328,1381,1350],
            [1318,1328,1350],
            [1420,1372,1399],
            [1432,1420,1399],
            [1381,1432,1399],
            [1372,1381,1399],
            [1447,1420,1441],
            [1455,1447,1441],
            [1432,1455,1441],
            [1420,1432,1441],
            [1461,1447,1459],
            [1471,1461,1459],
            [1455,1471,1459],
            [1447,1455,1459],
            [1101,932,1015],
            [1105,1101,1015],
            [926,1105,1015],
            [932,926,1015],
            [1193,1101,1162],
            [1199,1193,1162],
            [1105,1199,1162],
            [1101,1105,1162],
            [1265,1193,1231],
            [1275,1265,1231],
            [1199,1275,1231],
            [1193,1199,1231],
            [1328,1265,1296],
            [1330,1328,1296],
            [1275,1330,1296],
            [1265,1275,1296],
            [1105,926,1021],
            [1115,1105,1021],
            [918,1115,1021],
            [926,918,1021],
            [1199,1105,1166],
            [1209,1199,1166],
            [1115,1209,1166],
            [1105,1115,1166],
            [1275,1199,1237],
            [1282,1275,1237],
            [1209,1282,1237],
            [1199,1209,1237],
            [1330,1275,1306],
            [1344,1330,1306],
            [1282,1344,1306],
            [1275,1282,1306],
            [1381,1328,1356],
            [1391,1381,1356],
            [1330,1391,1356],
            [1328,1330,1356],
            [1432,1381,1411],
            [1443,1432,1411],
            [1391,1443,1411],
            [1381,1391,1411],
            [1455,1432,1449],
            [1480,1455,1449],
            [1443,1480,1449],
            [1432,1443,1449],
            [1471,1455,1474],
            [1482,1471,1474],
            [1480,1482,1474],
            [1455,1480,1474],
            [1391,1330,1370],
            [1409,1391,1370],
            [1344,1409,1370],
            [1330,1344,1370],
            [1443,1391,1430],
            [1464,1443,1430],
            [1409,1464,1430],
            [1391,1409,1430],
            [1480,1443,1469],
            [1499,1480,1469],
            [1464,1499,1469],
            [1443,1464,1469],
            [1482,1480,1489],
            [1502,1482,1489],
            [1499,1502,1489],
            [1480,1499,1489],
            [1500,1502,1533],
            [1572,1500,1533],
            [1585,1572,1533],
            [1502,1585,1533],
            [1465,1500,1519],
            [1555,1465,1519],
            [1572,1555,1519],
            [1500,1572,1519],
            [1410,1465,1496],
            [1510,1410,1496],
            [1555,1510,1496],
            [1465,1555,1496],
            [1345,1410,1427],
            [1436,1345,1427],
            [1510,1436,1427],
            [1410,1510,1427],
            [1283,1345,1341],
            [1333,1283,1341],
            [1436,1333,1341],
            [1345,1436,1341],
            [1210,1283,1270],
            [1242,1210,1270],
            [1333,1242,1270],
            [1283,1333,1270],
            [1116,1210,1184],
            [1143,1116,1184],
            [1242,1143,1184],
            [1210,1242,1184],
            [923,1116,1037],
            [917,923,1037],
            [1143,917,1037],
            [1116,1143,1037],
            [1572,1585,1599],
            [1611,1572,1599],
            [1622,1611,1599],
            [1585,1622,1599],
            [1555,1572,1574],
            [1570,1555,1574],
            [1611,1570,1574],
            [1572,1611,1574],
            [1510,1555,1537],
            [1527,1510,1537],
            [1570,1527,1537],
            [1555,1570,1537],
            [1436,1510,1494],
            [1467,1436,1494],
            [1527,1467,1494],
            [1510,1527,1494],
            [1611,1622,1624],
            [1626,1611,1624],
            [1633,1626,1624],
            [1622,1633,1624],
            [1570,1611,1601],
            [1589,1570,1601],
            [1626,1589,1601],
            [1611,1626,1601],
            [1527,1570,1561],
            [1535,1527,1561],
            [1589,1535,1561],
            [1570,1589,1561],
            [1467,1527,1508],
            [1479,1467,1508],
            [1535,1479,1508],
            [1527,1535,1508],
            [1333,1436,1394],
            [1359,1333,1394],
            [1467,1359,1394],
            [1436,1467,1394],
            [1242,1333,1299],
            [1254,1242,1299],
            [1359,1254,1299],
            [1333,1359,1299],
            [1143,1242,1198],
            [1149,1143,1198],
            [1254,1149,1198],
            [1242,1254,1198],
            [917,1143,1057],
            [915,917,1057],
            [1149,915,1057],
            [1143,1149,1057],
            [1359,1467,1414],
            [1367,1359,1414],
            [1479,1367,1414],
            [1467,1479,1414],
            [1254,1359,1311],
            [1262,1254,1311],
            [1367,1262,1311],
            [1359,1367,1311],
            [1149,1254,1212],
            [1155,1149,1212],
            [1262,1155,1212],
            [1254,1262,1212],
            [915,1149,1065],
            [913,915,1065],
            [1155,913,1065],
            [1149,1155,1065],
            [741,923,818],
            [712,741,818],
            [917,712,818],
            [923,917,818],
            [647,741,671],
            [613,647,671],
            [712,613,671],
            [741,712,671],
            [574,647,585],
            [522,574,585],
            [613,522,585],
            [647,613,585],
            [512,574,514],
            [419,512,514],
            [522,419,514],
            [574,522,514],
            [447,512,428],
            [342,447,428],
            [419,342,428],
            [512,419,428],
            [392,447,359],
            [308,392,359],
            [342,308,359],
            [447,342,359],
            [357,392,329],
            [291,357,329],
            [308,291,329],
            [392,308,329],
            [353,357,314],
            [275,353,314],
            [291,275,314],
            [357,291,314],
            [712,917,798],
            [706,712,798],
            [915,706,798],
            [917,915,798],
            [613,712,657],
            [601,613,657],
            [706,601,657],
            [712,706,657],
            [522,613,556],
            [496,522,556],
            [601,496,556],
            [613,601,556],
            [419,522,461],
            [388,419,461],
            [496,388,461],
            [522,496,461],
            [706,915,790],
            [700,706,790],
            [913,700,790],
            [915,913,790],
            [601,706,643],
            [593,601,643],
            [700,593,643],
            [706,700,643],
            [496,601,544],
            [488,496,544],
            [593,488,544],
            [601,593,544],
            [388,496,441],
            [376,388,441],
            [488,376,441],
            [496,488,441],
            [342,419,361],
            [320,342,361],
            [388,320,361],
            [419,388,361],
            [308,342,310],
            [293,308,310],
            [320,293,310],
            [342,320,310],
            [291,308,289],
            [257,291,289],
            [293,257,289],
            [308,293,289],
            [275,291,270],
            [246,275,270],
            [257,246,270],
            [291,257,270],
            [320,388,344],
            [312,320,344],
            [376,312,344],
            [388,376,344],
            [293,320,302],
            [274,293,302],
            [312,274,302],
            [320,312,302],
            [257,293,268],
            [243,257,268],
            [274,243,268],
            [293,274,268],
            [246,257,245],
            [232,246,245],
            [243,232,245],
            [257,243,245],
            [356,353,313],
            [290,356,313],
            [275,290,313],
            [353,275,313],
            [391,356,328],
            [307,391,328],
            [290,307,328],
            [356,290,328],
            [446,391,358],
            [341,446,358],
            [307,341,358],
            [391,307,358],
            [511,446,427],
            [418,511,427],
            [341,418,427],
            [446,341,427],
            [573,511,513],
            [521,573,513],
            [418,521,513],
            [511,418,513],
            [646,573,584],
            [612,646,584],
            [521,612,584],
            [573,521,584],
            [740,646,670],
            [711,740,670],
            [612,711,670],
            [646,612,670],
            [918,740,817],
            [916,918,817],
            [711,916,817],
            [740,711,817],
            [290,275,269],
            [256,290,269],
            [246,256,269],
            [275,246,269],
            [307,290,288],
            [292,307,288],
            [256,292,288],
            [290,256,288],
            [341,307,309],
            [319,341,309],
            [292,319,309],
            [307,292,309],
            [418,341,360],
            [387,418,360],
            [319,387,360],
            [341,319,360],
            [256,246,244],
            [242,256,244],
            [232,242,244],
            [246,232,244],
            [292,256,267],
            [273,292,267],
            [242,273,267],
            [256,242,267],
            [319,292,301],
            [311,319,301],
            [273,311,301],
            [292,273,301],
            [387,319,343],
            [375,387,343],
            [311,375,343],
            [319,311,343],
            [521,418,460],
            [495,521,460],
            [387,495,460],
            [418,387,460],
            [612,521,555],
            [600,612,555],
            [495,600,555],
            [521,495,555],
            [711,612,656],
            [705,711,656],
            [600,705,656],
            [612,600,656],
            [916,711,797],
            [914,916,797],
            [705,914,797],
            [711,705,797],
            [495,387,440],
            [487,495,440],
            [375,487,440],
            [387,375,440],
            [600,495,543],
            [592,600,543],
            [487,592,543],
            [495,487,543],
            [705,600,642],
            [699,705,642],
            [592,699,642],
            [600,592,642],
            [914,705,789],
            [912,914,789],
            [699,912,789],
            [705,699,789],
            [1115,918,1036],
            [1142,1115,1036],
            [916,1142,1036],
            [918,916,1036],
            [1209,1115,1183],
            [1241,1209,1183],
            [1142,1241,1183],
            [1115,1142,1183],
            [1282,1209,1269],
            [1332,1282,1269],
            [1241,1332,1269],
            [1209,1241,1269],
            [1344,1282,1340],
            [1435,1344,1340],
            [1332,1435,1340],
            [1282,1332,1340],
            [1409,1344,1426],
            [1509,1409,1426],
            [1435,1509,1426],
            [1344,1435,1426],
            [1464,1409,1495],
            [1554,1464,1495],
            [1509,1554,1495],
            [1409,1509,1495],
            [1499,1464,1518],
            [1571,1499,1518],
            [1554,1571,1518],
            [1464,1554,1518],
            [1502,1499,1532],
            [1585,1502,1532],
            [1571,1585,1532],
            [1499,1571,1532],
            [1142,916,1056],
            [1148,1142,1056],
            [914,1148,1056],
            [916,914,1056],
            [1241,1142,1197],
            [1253,1241,1197],
            [1148,1253,1197],
            [1142,1148,1197],
            [1332,1241,1298],
            [1358,1332,1298],
            [1253,1358,1298],
            [1241,1253,1298],
            [1435,1332,1393],
            [1466,1435,1393],
            [1358,1466,1393],
            [1332,1358,1393],
            [1148,914,1064],
            [1154,1148,1064],
            [912,1154,1064],
            [914,912,1064],
            [1253,1148,1211],
            [1261,1253,1211],
            [1154,1261,1211],
            [1148,1154,1211],
            [1358,1253,1310],
            [1366,1358,1310],
            [1261,1366,1310],
            [1253,1261,1310],
            [1466,1358,1413],
            [1478,1466,1413],
            [1366,1478,1413],
            [1358,1366,1413],
            [1509,1435,1493],
            [1526,1509,1493],
            [1466,1526,1493],
            [1435,1466,1493],
            [1554,1509,1536],
            [1569,1554,1536],
            [1526,1569,1536],
            [1509,1526,1536],
            [1571,1554,1573],
            [1610,1571,1573],
            [1569,1610,1573],
            [1554,1569,1573],
            [1585,1571,1598],
            [1622,1585,1598],
            [1610,1622,1598],
            [1571,1610,1598],
            [1526,1466,1507],
            [1534,1526,1507],
            [1478,1534,1507],
            [1466,1478,1507],
            [1569,1526,1560],
            [1588,1569,1560],
            [1534,1588,1560],
            [1526,1534,1560],
            [1610,1569,1600],
            [1625,1610,1600],
            [1588,1625,1600],
            [1569,1588,1600],
            [1622,1610,1623],
            [1633,1622,1623],
            [1625,1633,1623],
            [1610,1625,1623],
            [1626,1633,1628],
            [1621,1626,1628],
            [1629,1621,1628],
            [1633,1629,1628],
            [1589,1626,1607],
            [1584,1589,1607],
            [1621,1584,1607],
            [1626,1621,1607],
            [1621,1629,1616],
            [1603,1621,1616],
            [1612,1603,1616],
            [1629,1612,1616],
            [1584,1621,1593],
            [1568,1584,1593],
            [1603,1568,1593],
            [1621,1603,1593],
            [1535,1589,1563],
            [1529,1535,1563],
            [1584,1529,1563],
            [1589,1584,1563],
            [1479,1535,1512],
            [1473,1479,1512],
            [1529,1473,1512],
            [1535,1529,1512],
            [1529,1584,1557],
            [1521,1529,1557],
            [1568,1521,1557],
            [1584,1568,1557],
            [1473,1529,1504],
            [1452,1473,1504],
            [1521,1452,1504],
            [1529,1521,1504],
            [1603,1612,1580],
            [1559,1603,1580],
            [1566,1559,1580],
            [1612,1566,1580],
            [1568,1603,1565],
            [1525,1568,1565],
            [1559,1525,1565],
            [1603,1559,1565],
            [1521,1568,1523],
            [1484,1521,1523],
            [1525,1484,1523],
            [1568,1525,1523],
            [1452,1521,1477],
            [1406,1452,1477],
            [1484,1406,1477],
            [1521,1484,1477],
            [1367,1479,1417],
            [1361,1367,1417],
            [1473,1361,1417],
            [1479,1473,1417],
            [1262,1367,1313],
            [1260,1262,1313],
            [1361,1260,1313],
            [1367,1361,1313],
            [1361,1473,1404],
            [1355,1361,1404],
            [1452,1355,1404],
            [1473,1452,1404],
            [1260,1361,1303],
            [1248,1260,1303],
            [1355,1248,1303],
            [1361,1355,1303],
            [1155,1262,1214],
            [1151,1155,1214],
            [1260,1151,1214],
            [1262,1260,1214],
            [913,1155,1067],
            [911,913,1067],
            [1151,911,1067],
            [1155,1151,1067],
            [1151,1260,1204],
            [1147,1151,1204],
            [1248,1147,1204],
            [1260,1248,1204],
            [911,1151,1062],
            [909,911,1062],
            [1147,909,1062],
            [1151,1147,1062],
            [1355,1452,1384],
            [1323,1355,1384],
            [1406,1323,1384],
            [1452,1406,1384],
            [1248,1355,1287],
            [1236,1248,1287],
            [1323,1236,1287],
            [1355,1323,1287],
            [1147,1248,1190],
            [1135,1147,1190],
            [1236,1135,1190],
            [1248,1236,1190],
            [909,1147,1051],
            [907,909,1051],
            [1135,907,1051],
            [1147,1135,1051],
            [1559,1566,1531],
            [1514,1559,1531],
            [1515,1514,1531],
            [1566,1515,1531],
            [1525,1559,1517],
            [1486,1525,1517],
            [1514,1486,1517],
            [1559,1514,1517],
            [1484,1525,1488],
            [1438,1484,1488],
            [1486,1438,1488],
            [1525,1486,1488],
            [1406,1484,1425],
            [1363,1406,1425],
            [1438,1363,1425],
            [1484,1438,1425],
            [1514,1515,1506],
            [1498,1514,1506],
            [1501,1498,1506],
            [1515,1501,1506],
            [1486,1514,1492],
            [1463,1486,1492],
            [1498,1463,1492],
            [1514,1498,1492],
            [1438,1486,1446],
            [1408,1438,1446],
            [1463,1408,1446],
            [1486,1463,1446],
            [1363,1438,1386],
            [1343,1363,1386],
            [1408,1343,1386],
            [1438,1408,1386],
            [1323,1406,1337],
            [1293,1323,1337],
            [1363,1293,1337],
            [1406,1363,1337],
            [1236,1323,1268],
            [1220,1236,1268],
            [1293,1220,1268],
            [1323,1293,1268],
            [1135,1236,1182],
            [1122,1135,1182],
            [1220,1122,1182],
            [1236,1220,1182],
            [907,1135,1035],
            [905,907,1035],
            [1122,905,1035],
            [1135,1122,1035],
            [1293,1363,1317],
            [1281,1293,1317],
            [1343,1281,1317],
            [1363,1343,1317],
            [1220,1293,1246],
            [1208,1220,1246],
            [1281,1208,1246],
            [1293,1281,1246],
            [1122,1220,1172],
            [1114,1122,1172],
            [1208,1114,1172],
            [1220,1208,1172],
            [905,1122,1026],
            [903,905,1026],
            [1114,903,1026],
            [1122,1114,1026],
            [700,913,788],
            [704,700,788],
            [911,704,788],
            [913,911,788],
            [593,700,641],
            [595,593,641],
            [704,595,641],
            [700,704,641],
            [704,911,793],
            [708,704,793],
            [909,708,793],
            [911,909,793],
            [595,704,651],
            [607,595,651],
            [708,607,651],
            [704,708,651],
            [488,593,542],
            [494,488,542],
            [595,494,542],
            [593,595,542],
            [376,488,438],
            [382,376,438],
            [494,382,438],
            [488,494,438],
            [494,595,552],
            [500,494,552],
            [607,500,552],
            [595,607,552],
            [382,494,451],
            [403,382,451],
            [500,403,451],
            [494,500,451],
            [708,909,804],
            [718,708,804],
            [907,718,804],
            [909,907,804],
            [607,708,665],
            [619,607,665],
            [718,619,665],
            [708,718,665],
            [500,607,568],
            [532,500,568],
            [619,532,568],
            [607,619,568],
            [403,500,471],
            [449,403,471],
            [532,449,471],
            [500,532,471],
            [312,376,340],
            [318,312,340],
            [382,318,340],
            [376,382,340],
            [274,312,300],
            [285,274,300],
            [318,285,300],
            [312,318,300],
            [318,382,350],
            [327,318,350],
            [403,327,350],
            [382,403,350],
            [285,318,306],
            [295,285,306],
            [327,295,306],
            [318,327,306],
            [243,274,264],
            [250,243,264],
            [285,250,264],
            [274,285,264],
            [232,243,239],
            [237,232,239],
            [250,237,239],
            [243,250,239],
            [250,285,272],
            [266,250,272],
            [295,266,272],
            [285,295,272],
            [237,250,254],
            [255,237,254],
            [266,255,254],
            [250,266,254],
            [327,403,378],
            [371,327,378],
            [449,371,378],
            [403,449,378],
            [295,327,324],
            [322,295,324],
            [371,322,324],
            [327,371,324],
            [266,295,298],
            [304,266,298],
            [322,304,298],
            [295,322,298],
            [255,266,287],
            [296,255,287],
            [304,296,287],
            [266,304,287],
            [718,907,820],
            [733,718,820],
            [905,733,820],
            [907,905,820],
            [619,718,673],
            [635,619,673],
            [733,635,673],
            [718,733,673],
            [532,619,587],
            [562,532,587],
            [635,562,587],
            [619,635,587],
            [449,532,518],
            [492,449,518],
            [562,492,518],
            [532,562,518],
            [733,905,829],
            [739,733,829],
            [903,739,829],
            [905,903,829],
            [635,733,683],
            [645,635,683],
            [739,645,683],
            [733,739,683],
            [562,635,609],
            [572,562,609],
            [645,572,609],
            [635,645,609],
            [492,562,538],
            [510,492,538],
            [572,510,538],
            [562,572,538],
            [371,449,430],
            [417,371,430],
            [492,417,430],
            [449,492,430],
            [322,371,367],
            [369,322,367],
            [417,369,367],
            [371,417,367],
            [304,322,333],
            [338,304,333],
            [369,338,333],
            [322,369,333],
            [296,304,316],
            [334,296,316],
            [338,334,316],
            [304,338,316],
            [417,492,469],
            [445,417,469],
            [510,445,469],
            [492,510,469],
            [369,417,409],
            [390,369,409],
            [445,390,409],
            [417,445,409],
            [338,369,363],
            [355,338,363],
            [390,355,363],
            [369,390,363],
            [334,338,346],
            [351,334,346],
            [355,351,346],
            [338,355,346],
            [242,232,238],
            [249,242,238],
            [237,249,238],
            [232,237,238],
            [273,242,263],
            [284,273,263],
            [249,284,263],
            [242,249,263],
            [249,237,253],
            [265,249,253],
            [255,265,253],
            [237,255,253],
            [284,249,271],
            [294,284,271],
            [265,294,271],
            [249,265,271],
            [311,273,299],
            [317,311,299],
            [284,317,299],
            [273,284,299],
            [375,311,339],
            [381,375,339],
            [317,381,339],
            [311,317,339],
            [317,284,305],
            [326,317,305],
            [294,326,305],
            [284,294,305],
            [381,317,349],
            [402,381,349],
            [326,402,349],
            [317,326,349],
            [265,255,286],
            [303,265,286],
            [296,303,286],
            [255,296,286],
            [294,265,297],
            [321,294,297],
            [303,321,297],
            [265,303,297],
            [326,294,323],
            [370,326,323],
            [321,370,323],
            [294,321,323],
            [402,326,377],
            [448,402,377],
            [370,448,377],
            [326,370,377],
            [487,375,437],
            [493,487,437],
            [381,493,437],
            [375,381,437],
            [592,487,541],
            [594,592,541],
            [493,594,541],
            [487,493,541],
            [493,381,450],
            [499,493,450],
            [402,499,450],
            [381,402,450],
            [594,493,551],
            [606,594,551],
            [499,606,551],
            [493,499,551],
            [699,592,640],
            [703,699,640],
            [594,703,640],
            [592,594,640],
            [912,699,787],
            [910,912,787],
            [703,910,787],
            [699,703,787],
            [703,594,650],
            [707,703,650],
            [606,707,650],
            [594,606,650],
            [910,703,792],
            [908,910,792],
            [707,908,792],
            [703,707,792],
            [499,402,470],
            [531,499,470],
            [448,531,470],
            [402,448,470],
            [606,499,567],
            [618,606,567],
            [531,618,567],
            [499,531,567],
            [707,606,664],
            [719,707,664],
            [618,719,664],
            [606,618,664],
            [908,707,803],
            [906,908,803],
            [719,906,803],
            [707,719,803],
            [303,296,315],
            [337,303,315],
            [334,337,315],
            [296,334,315],
            [321,303,332],
            [368,321,332],
            [337,368,332],
            [303,337,332],
            [370,321,366],
            [416,370,366],
            [368,416,366],
            [321,368,366],
            [448,370,429],
            [491,448,429],
            [416,491,429],
            [370,416,429],
            [337,334,345],
            [354,337,345],
            [351,354,345],
            [334,351,345],
            [368,337,362],
            [389,368,362],
            [354,389,362],
            [337,354,362],
            [416,368,408],
            [444,416,408],
            [389,444,408],
            [368,389,408],
            [491,416,468],
            [509,491,468],
            [444,509,468],
            [416,444,468],
            [531,448,517],
            [561,531,517],
            [491,561,517],
            [448,491,517],
            [618,531,586],
            [634,618,586],
            [561,634,586],
            [531,561,586],
            [719,618,672],
            [732,719,672],
            [634,732,672],
            [618,634,672],
            [906,719,819],
            [904,906,819],
            [732,904,819],
            [719,732,819],
            [561,491,537],
            [571,561,537],
            [509,571,537],
            [491,509,537],
            [634,561,608],
            [644,634,608],
            [571,644,608],
            [561,571,608],
            [732,634,682],
            [738,732,682],
            [644,738,682],
            [634,644,682],
            [904,732,828],
            [902,904,828],
            [738,902,828],
            [732,738,828],
            [1154,912,1066],
            [1150,1154,1066],
            [910,1150,1066],
            [912,910,1066],
            [1261,1154,1213],
            [1259,1261,1213],
            [1150,1259,1213],
            [1154,1150,1213],
            [1150,910,1061],
            [1146,1150,1061],
            [908,1146,1061],
            [910,908,1061],
            [1259,1150,1203],
            [1247,1259,1203],
            [1146,1247,1203],
            [1150,1146,1203],
            [1366,1261,1312],
            [1360,1366,1312],
            [1259,1360,1312],
            [1261,1259,1312],
            [1478,1366,1416],
            [1472,1478,1416],
            [1360,1472,1416],
            [1366,1360,1416],
            [1360,1259,1302],
            [1354,1360,1302],
            [1247,1354,1302],
            [1259,1247,1302],
            [1472,1360,1403],
            [1451,1472,1403],
            [1354,1451,1403],
            [1360,1354,1403],
            [1146,908,1050],
            [1136,1146,1050],
            [906,1136,1050],
            [908,906,1050],
            [1247,1146,1189],
            [1235,1247,1189],
            [1136,1235,1189],
            [1146,1136,1189],
            [1354,1247,1286],
            [1322,1354,1286],
            [1235,1322,1286],
            [1247,1235,1286],
            [1451,1354,1383],
            [1405,1451,1383],
            [1322,1405,1383],
            [1354,1322,1383],
            [1534,1478,1511],
            [1528,1534,1511],
            [1472,1528,1511],
            [1478,1472,1511],
            [1588,1534,1562],
            [1583,1588,1562],
            [1528,1583,1562],
            [1534,1528,1562],
            [1528,1472,1503],
            [1520,1528,1503],
            [1451,1520,1503],
            [1472,1451,1503],
            [1583,1528,1556],
            [1567,1583,1556],
            [1520,1567,1556],
            [1528,1520,1556],
            [1625,1588,1606],
            [1620,1625,1606],
            [1583,1620,1606],
            [1588,1583,1606],
            [1633,1625,1627],
            [1629,1633,1627],
            [1620,1629,1627],
            [1625,1620,1627],
            [1620,1583,1592],
            [1602,1620,1592],
            [1567,1602,1592],
            [1583,1567,1592],
            [1629,1620,1615],
            [1612,1629,1615],
            [1602,1612,1615],
            [1620,1602,1615],
            [1520,1451,1476],
            [1483,1520,1476],
            [1405,1483,1476],
            [1451,1405,1476],
            [1567,1520,1522],
            [1524,1567,1522],
            [1483,1524,1522],
            [1520,1483,1522],
            [1602,1567,1564],
            [1558,1602,1564],
            [1524,1558,1564],
            [1567,1524,1564],
            [1612,1602,1579],
            [1566,1612,1579],
            [1558,1566,1579],
            [1602,1558,1579],
            [1136,906,1034],
            [1121,1136,1034],
            [904,1121,1034],
            [906,904,1034],
            [1235,1136,1181],
            [1219,1235,1181],
            [1121,1219,1181],
            [1136,1121,1181],
            [1322,1235,1267],
            [1292,1322,1267],
            [1219,1292,1267],
            [1235,1219,1267],
            [1405,1322,1336],
            [1362,1405,1336],
            [1292,1362,1336],
            [1322,1292,1336],
            [1121,904,1025],
            [1113,1121,1025],
            [902,1113,1025],
            [904,902,1025],
            [1219,1121,1171],
            [1207,1219,1171],
            [1113,1207,1171],
            [1121,1113,1171],
            [1292,1219,1245],
            [1280,1292,1245],
            [1207,1280,1245],
            [1219,1207,1245],
            [1362,1292,1316],
            [1342,1362,1316],
            [1280,1342,1316],
            [1292,1280,1316],
            [1483,1405,1424],
            [1437,1483,1424],
            [1362,1437,1424],
            [1405,1362,1424],
            [1524,1483,1487],
            [1485,1524,1487],
            [1437,1485,1487],
            [1483,1437,1487],
            [1558,1524,1516],
            [1513,1558,1516],
            [1485,1513,1516],
            [1524,1485,1516],
            [1566,1558,1530],
            [1515,1566,1530],
            [1513,1515,1530],
            [1558,1513,1530],
            [1437,1362,1385],
            [1407,1437,1385],
            [1342,1407,1385],
            [1362,1342,1385],
            [1485,1437,1445],
            [1462,1485,1445],
            [1407,1462,1445],
            [1437,1407,1445],
            [1513,1485,1491],
            [1497,1513,1491],
            [1462,1497,1491],
            [1485,1462,1491],
            [1515,1513,1505],
            [1501,1515,1505],
            [1497,1501,1505],
            [1513,1497,1505],
            [331,325,277],
            [228,331,277],
            [231,228,277],
            [325,231,277],
            [336,331,279],
            [224,336,279],
            [228,224,279],
            [331,228,279],
            [228,231,200],
            [173,228,200],
            [178,173,200],
            [231,178,200],
            [224,228,198],
            [167,224,198],
            [173,167,198],
            [228,173,198],
            [348,336,281],
            [222,348,281],
            [224,222,281],
            [336,224,281],
            [352,348,283],
            [210,352,283],
            [222,210,283],
            [348,222,283],
            [222,224,193],
            [150,222,193],
            [167,150,193],
            [224,167,193],
            [210,222,183],
            [142,210,183],
            [150,142,183],
            [222,150,183],
            [177,178,165],
            [136,177,165],
            [141,136,165],
            [178,141,165],
            [173,177,162],
            [127,173,162],
            [136,127,162],
            [177,136,162],
            [167,173,158],
            [131,167,158],
            [152,131,158],
            [173,152,158],
            [131,152,129],
            [82,131,129],
            [127,82,129],
            [152,127,129],
            [136,141,134],
            [114,136,134],
            [121,114,134],
            [141,121,134],
            [127,136,118],
            [93,127,118],
            [114,93,118],
            [136,114,118],
            [114,121,112],
            [101,114,112],
            [108,101,112],
            [121,108,112],
            [93,114,95],
            [90,93,95],
            [101,90,95],
            [114,101,95],
            [82,127,88],
            [59,82,88],
            [93,59,88],
            [127,93,88],
            [59,93,74],
            [52,59,74],
            [90,52,74],
            [93,90,74],
            [150,167,140],
            [86,150,140],
            [131,86,140],
            [167,131,140],
            [86,131,84],
            [50,86,84],
            [82,50,84],
            [131,82,84],
            [148,150,120],
            [76,148,120],
            [86,76,120],
            [150,86,120],
            [142,148,110],
            [72,142,110],
            [76,72,110],
            [148,76,110],
            [76,86,65],
            [36,76,65],
            [50,36,65],
            [86,50,65],
            [72,76,57],
            [34,72,57],
            [36,34,57],
            [76,36,57],
            [50,82,55],
            [27,50,55],
            [59,27,55],
            [82,59,55],
            [27,59,42],
            [18,27,42],
            [52,18,42],
            [59,52,42],
            [36,50,33],
            [12,36,33],
            [27,12,33],
            [50,27,33],
            [34,36,24],
            [8,34,24],
            [12,8,24],
            [36,12,24],
            [12,27,16],
            [2,12,16],
            [18,2,16],
            [27,18,16],
            [8,12,7],
            [0,8,7],
            [2,0,7],
            [12,2,7],
            [347,352,282],
            [221,347,282],
            [210,221,282],
            [352,210,282],
            [335,347,280],
            [223,335,280],
            [221,223,280],
            [347,221,280],
            [221,210,182],
            [149,221,182],
            [142,149,182],
            [210,142,182],
            [223,221,192],
            [166,223,192],
            [149,166,192],
            [221,149,192],
            [330,335,278],
            [227,330,278],
            [223,227,278],
            [335,223,278],
            [325,330,276],
            [231,325,276],
            [227,231,276],
            [330,227,276],
            [227,223,197],
            [172,227,197],
            [166,172,197],
            [223,166,197],
            [231,227,199],
            [178,231,199],
            [172,178,199],
            [227,172,199],
            [147,142,109],
            [75,147,109],
            [72,75,109],
            [142,72,109],
            [149,147,119],
            [85,149,119],
            [75,85,119],
            [147,75,119],
            [75,72,56],
            [35,75,56],
            [34,35,56],
            [72,34,56],
            [85,75,64],
            [49,85,64],
            [35,49,64],
            [75,35,64],
            [166,149,139],
            [130,166,139],
            [85,130,139],
            [149,85,139],
            [130,85,83],
            [81,130,83],
            [49,81,83],
            [85,49,83],
            [35,34,23],
            [11,35,23],
            [8,11,23],
            [34,8,23],
            [49,35,32],
            [26,49,32],
            [11,26,32],
            [35,11,32],
            [11,8,6],
            [1,11,6],
            [0,1,6],
            [8,0,6],
            [26,11,15],
            [17,26,15],
            [1,17,15],
            [11,1,15],
            [81,49,54],
            [58,81,54],
            [26,58,54],
            [49,26,54],
            [58,26,41],
            [51,58,41],
            [17,51,41],
            [26,17,41],
            [172,166,157],
            [151,172,157],
            [130,151,157],
            [166,130,157],
            [151,130,128],
            [126,151,128],
            [81,126,128],
            [130,81,128],
            [176,172,161],
            [135,176,161],
            [126,135,161],
            [172,126,161],
            [178,176,164],
            [141,178,164],
            [135,141,164],
            [176,135,164],
            [126,81,87],
            [92,126,87],
            [58,92,87],
            [81,58,87],
            [92,58,73],
            [89,92,73],
            [51,89,73],
            [58,51,73],
            [135,126,117],
            [113,135,117],
            [92,113,117],
            [126,92,117],
            [141,135,133],
            [121,141,133],
            [113,121,133],
            [135,113,133],
            [113,92,94],
            [100,113,94],
            [89,100,94],
            [92,89,94],
            [121,113,111],
            [108,121,111],
            [100,108,111],
            [113,100,111],
            [101,108,116],
            [125,101,116],
            [132,125,116],
            [108,132,116],
            [90,101,103],
            [105,90,103],
            [125,105,103],
            [101,125,103],
            [52,90,78],
            [71,52,78],
            [105,71,78],
            [90,105,78],
            [125,132,146],
            [156,125,146],
            [163,156,146],
            [132,163,146],
            [105,125,144],
            [154,105,144],
            [156,154,144],
            [125,156,144],
            [71,105,123],
            [138,71,123],
            [154,138,123],
            [105,154,123],
            [18,52,38],
            [22,18,38],
            [63,22,38],
            [52,63,38],
            [22,63,48],
            [40,22,48],
            [71,40,48],
            [63,71,48],
            [2,18,14],
            [10,2,14],
            [22,10,14],
            [18,22,14],
            [0,2,4],
            [5,0,4],
            [10,5,4],
            [2,10,4],
            [10,22,29],
            [31,10,29],
            [40,31,29],
            [22,40,29],
            [5,10,20],
            [25,5,20],
            [31,25,20],
            [10,31,20],
            [40,71,69],
            [67,40,69],
            [97,67,69],
            [71,97,69],
            [67,97,99],
            [107,67,99],
            [138,107,99],
            [97,138,99],
            [31,40,46],
            [61,31,46],
            [67,61,46],
            [40,67,46],
            [25,31,44],
            [53,25,44],
            [61,53,44],
            [31,61,44],
            [53,67,80],
            [91,53,80],
            [107,91,80],
            [67,107,80],
            [154,163,175],
            [195,154,175],
            [196,195,175],
            [163,196,175],
            [138,154,171],
            [189,138,171],
            [195,189,171],
            [154,195,171],
            [195,196,202],
            [207,195,202],
            [203,207,202],
            [196,203,202],
            [205,203,226],
            [234,205,226],
            [232,234,226],
            [203,232,226],
            [207,205,230],
            [236,207,230],
            [234,236,230],
            [205,234,230],
            [191,195,209],
            [241,191,209],
            [236,241,209],
            [195,236,209],
            [189,191,212],
            [248,189,212],
            [241,248,212],
            [191,241,212],
            [107,138,169],
            [185,107,169],
            [189,185,169],
            [138,189,169],
            [91,107,160],
            [179,91,160],
            [185,179,160],
            [107,185,160],
            [187,189,214],
            [252,187,214],
            [248,252,214],
            [189,248,214],
            [185,187,216],
            [259,185,216],
            [252,259,216],
            [187,252,216],
            [181,185,218],
            [261,181,218],
            [259,261,218],
            [185,259,218],
            [179,181,220],
            [262,179,220],
            [261,262,220],
            [181,261,220],
            [1,0,3],
            [9,1,3],
            [5,9,3],
            [0,5,3],
            [17,1,13],
            [21,17,13],
            [9,21,13],
            [1,9,13],
            [9,5,19],
            [30,9,19],
            [25,30,19],
            [5,25,19],
            [21,9,28],
            [39,21,28],
            [30,39,28],
            [9,30,28],
            [51,17,37],
            [62,51,37],
            [21,62,37],
            [17,21,37],
            [62,21,47],
            [70,62,47],
            [39,70,47],
            [21,39,47],
            [30,25,43],
            [60,30,43],
            [53,60,43],
            [25,53,43],
            [39,30,45],
            [66,39,45],
            [60,66,45],
            [30,60,45],
            [66,53,79],
            [106,66,79],
            [91,106,79],
            [53,91,79],
            [70,39,68],
            [96,70,68],
            [66,96,68],
            [39,66,68],
            [96,66,98],
            [137,96,98],
            [106,137,98],
            [66,106,98],
            [89,51,77],
            [104,89,77],
            [70,104,77],
            [51,70,77],
            [100,89,102],
            [124,100,102],
            [104,124,102],
            [89,104,102],
            [108,100,115],
            [132,108,115],
            [124,132,115],
            [100,124,115],
            [104,70,122],
            [153,104,122],
            [137,153,122],
            [70,137,122],
            [124,104,143],
            [155,124,143],
            [153,155,143],
            [104,153,143],
            [132,124,145],
            [163,132,145],
            [155,163,145],
            [124,155,145],
            [106,91,159],
            [184,106,159],
            [179,184,159],
            [91,179,159],
            [137,106,168],
            [188,137,168],
            [184,188,168],
            [106,184,168],
            [180,179,219],
            [260,180,219],
            [262,260,219],
            [179,262,219],
            [184,180,217],
            [258,184,217],
            [260,258,217],
            [180,260,217],
            [186,184,215],
            [251,186,215],
            [258,251,215],
            [184,258,215],
            [188,186,213],
            [247,188,213],
            [251,247,213],
            [186,251,213],
            [153,137,170],
            [194,153,170],
            [188,194,170],
            [137,188,170],
            [163,153,174],
            [196,163,174],
            [194,196,174],
            [153,194,174],
            [190,188,211],
            [240,190,211],
            [247,240,211],
            [188,247,211],
            [194,190,208],
            [235,194,208],
            [240,235,208],
            [190,240,208],
            [196,194,201],
            [203,196,201],
            [206,203,201],
            [194,206,201],
            [204,206,229],
            [233,204,229],
            [235,233,229],
            [206,235,229],
            [203,204,225],
            [232,203,225],
            [233,232,225],
            [204,233,225],
            [1552,1553,1587],
            [1632,1552,1587],
            [1630,1632,1587],
            [1553,1630,1587],
            [1550,1552,1591],
            [1637,1550,1591],
            [1632,1637,1591],
            [1552,1632,1591],
            [1632,1630,1647],
            [1665,1632,1647],
            [1663,1665,1647],
            [1630,1663,1647],
            [1637,1632,1651],
            [1673,1637,1651],
            [1665,1673,1651],
            [1632,1665,1651],
            [1548,1550,1595],
            [1641,1548,1595],
            [1637,1641,1595],
            [1550,1637,1595],
            [1546,1548,1597],
            [1645,1546,1597],
            [1641,1645,1597],
            [1548,1641,1597],
            [1641,1637,1657],
            [1679,1641,1657],
            [1673,1679,1657],
            [1637,1673,1657],
            [1645,1641,1660],
            [1688,1645,1660],
            [1679,1688,1660],
            [1641,1679,1660],
            [1665,1663,1677],
            [1695,1665,1677],
            [1693,1695,1677],
            [1663,1693,1677],
            [1673,1665,1683],
            [1705,1673,1683],
            [1695,1705,1683],
            [1665,1695,1683],
            [1695,1693,1707],
            [1718,1695,1707],
            [1712,1718,1707],
            [1693,1712,1707],
            [1705,1695,1709],
            [1725,1705,1709],
            [1718,1725,1709],
            [1695,1718,1709],
            [1679,1673,1692],
            [1714,1679,1692],
            [1705,1714,1692],
            [1673,1705,1692],
            [1688,1679,1703],
            [1729,1688,1703],
            [1714,1729,1703],
            [1679,1714,1703],
            [1714,1705,1723],
            [1739,1714,1723],
            [1725,1739,1723],
            [1705,1725,1723],
            [1729,1714,1733],
            [1752,1729,1733],
            [1739,1752,1733],
            [1714,1739,1733],
            [1544,1546,1605],
            [1649,1544,1605],
            [1645,1649,1605],
            [1546,1645,1605],
            [1542,1544,1576],
            [1614,1542,1576],
            [1609,1614,1576],
            [1544,1609,1576],
            [1614,1609,1635],
            [1653,1614,1635],
            [1649,1653,1635],
            [1609,1649,1635],
            [1649,1645,1669],
            [1699,1649,1669],
            [1688,1699,1669],
            [1645,1688,1669],
            [1653,1649,1662],
            [1681,1653,1662],
            [1675,1681,1662],
            [1649,1675,1662],
            [1681,1675,1690],
            [1711,1681,1690],
            [1699,1711,1690],
            [1675,1699,1690],
            [1540,1542,1578],
            [1618,1540,1578],
            [1614,1618,1578],
            [1542,1614,1578],
            [1618,1614,1639],
            [1655,1618,1639],
            [1653,1655,1639],
            [1614,1653,1639],
            [1538,1540,1582],
            [1619,1538,1582],
            [1618,1619,1582],
            [1540,1618,1582],
            [1619,1618,1643],
            [1658,1619,1643],
            [1655,1658,1643],
            [1618,1655,1643],
            [1655,1653,1667],
            [1685,1655,1667],
            [1681,1685,1667],
            [1653,1681,1667],
            [1685,1681,1697],
            [1720,1685,1697],
            [1711,1720,1697],
            [1681,1711,1697],
            [1658,1655,1671],
            [1686,1658,1671],
            [1685,1686,1671],
            [1655,1685,1671],
            [1686,1685,1701],
            [1721,1686,1701],
            [1720,1721,1701],
            [1685,1720,1701],
            [1699,1688,1716],
            [1743,1699,1716],
            [1729,1743,1716],
            [1688,1729,1716],
            [1711,1699,1727],
            [1754,1711,1727],
            [1743,1754,1727],
            [1699,1743,1727],
            [1743,1729,1748],
            [1770,1743,1748],
            [1752,1770,1748],
            [1729,1752,1748],
            [1754,1743,1760],
            [1786,1754,1760],
            [1770,1786,1760],
            [1743,1770,1760],
            [1720,1711,1735],
            [1762,1720,1735],
            [1754,1762,1735],
            [1711,1754,1735],
            [1721,1720,1741],
            [1768,1721,1741],
            [1762,1768,1741],
            [1720,1762,1741],
            [1762,1754,1776],
            [1796,1762,1776],
            [1786,1796,1776],
            [1754,1786,1776],
            [1768,1762,1782],
            [1801,1768,1782],
            [1796,1801,1782],
            [1762,1796,1782],
            [1718,1712,1731],
            [1746,1718,1731],
            [1744,1746,1731],
            [1712,1744,1731],
            [1725,1718,1737],
            [1758,1725,1737],
            [1746,1758,1737],
            [1718,1746,1737],
            [1739,1725,1750],
            [1780,1739,1750],
            [1758,1780,1750],
            [1725,1758,1750],
            [1752,1739,1765],
            [1800,1752,1765],
            [1780,1800,1765],
            [1739,1780,1765],
            [1746,1744,1756],
            [1772,1746,1756],
            [1763,1772,1756],
            [1744,1763,1756],
            [1758,1746,1767],
            [1788,1758,1767],
            [1772,1788,1767],
            [1746,1772,1767],
            [1772,1763,1790],
            [1814,1772,1790],
            [1806,1814,1790],
            [1763,1806,1790],
            [1788,1772,1803],
            [1832,1788,1803],
            [1814,1832,1803],
            [1772,1814,1803],
            [1780,1758,1784],
            [1816,1780,1784],
            [1788,1816,1784],
            [1758,1788,1784],
            [1800,1780,1808],
            [1839,1800,1808],
            [1816,1839,1808],
            [1780,1816,1808],
            [1839,1788,1845],
            [1898,1839,1845],
            [1832,1898,1845],
            [1788,1832,1845],
            [1770,1752,1774],
            [1794,1770,1774],
            [1778,1794,1774],
            [1752,1778,1774],
            [1786,1770,1792],
            [1810,1786,1792],
            [1794,1810,1792],
            [1770,1794,1792],
            [1794,1778,1798],
            [1822,1794,1798],
            [1800,1822,1798],
            [1778,1800,1798],
            [1810,1794,1818],
            [1843,1810,1818],
            [1822,1843,1818],
            [1794,1822,1818],
            [1796,1786,1805],
            [1824,1796,1805],
            [1810,1824,1805],
            [1786,1810,1805],
            [1801,1796,1812],
            [1825,1801,1812],
            [1824,1825,1812],
            [1796,1824,1812],
            [1824,1810,1830],
            [1861,1824,1830],
            [1843,1861,1830],
            [1810,1843,1830],
            [1825,1824,1841],
            [1870,1825,1841],
            [1861,1870,1841],
            [1824,1861,1841],
            [1822,1800,1828],
            [1874,1822,1828],
            [1839,1874,1828],
            [1800,1839,1828],
            [1843,1822,1859],
            [1892,1843,1859],
            [1874,1892,1859],
            [1822,1874,1859],
            [1892,1839,1886],
            [1911,1892,1886],
            [1878,1911,1886],
            [1839,1878,1886],
            [1911,1878,1909],
            [1935,1911,1909],
            [1898,1935,1909],
            [1878,1898,1909],
            [1861,1843,1880],
            [1902,1861,1880],
            [1892,1902,1880],
            [1843,1892,1880],
            [1870,1861,1890],
            [1905,1870,1890],
            [1902,1905,1890],
            [1861,1902,1890],
            [1902,1892,1907],
            [1923,1902,1907],
            [1911,1923,1907],
            [1892,1911,1907],
            [1923,1911,1930],
            [1949,1923,1930],
            [1935,1949,1930],
            [1911,1935,1930],
            [1905,1902,1913],
            [1926,1905,1913],
            [1923,1926,1913],
            [1902,1923,1913],
            [1926,1923,1939],
            [1952,1926,1939],
            [1949,1952,1939],
            [1923,1949,1939],
            [1539,1538,1581],
            [1617,1539,1581],
            [1619,1617,1581],
            [1538,1619,1581],
            [1617,1619,1642],
            [1654,1617,1642],
            [1658,1654,1642],
            [1619,1658,1642],
            [1541,1539,1577],
            [1613,1541,1577],
            [1617,1613,1577],
            [1539,1617,1577],
            [1613,1617,1638],
            [1652,1613,1638],
            [1654,1652,1638],
            [1617,1654,1638],
            [1654,1658,1670],
            [1684,1654,1670],
            [1686,1684,1670],
            [1658,1686,1670],
            [1684,1686,1700],
            [1719,1684,1700],
            [1721,1719,1700],
            [1686,1721,1700],
            [1652,1654,1666],
            [1680,1652,1666],
            [1684,1680,1666],
            [1654,1684,1666],
            [1680,1684,1696],
            [1710,1680,1696],
            [1719,1710,1696],
            [1684,1719,1696],
            [1543,1541,1575],
            [1608,1543,1575],
            [1613,1608,1575],
            [1541,1613,1575],
            [1608,1613,1634],
            [1648,1608,1634],
            [1652,1648,1634],
            [1613,1652,1634],
            [1545,1543,1604],
            [1644,1545,1604],
            [1648,1644,1604],
            [1543,1648,1604],
            [1648,1652,1661],
            [1674,1648,1661],
            [1680,1674,1661],
            [1652,1680,1661],
            [1674,1680,1689],
            [1698,1674,1689],
            [1710,1698,1689],
            [1680,1710,1689],
            [1644,1648,1668],
            [1687,1644,1668],
            [1698,1687,1668],
            [1648,1698,1668],
            [1719,1721,1740],
            [1761,1719,1740],
            [1768,1761,1740],
            [1721,1768,1740],
            [1710,1719,1734],
            [1753,1710,1734],
            [1761,1753,1734],
            [1719,1761,1734],
            [1761,1768,1781],
            [1795,1761,1781],
            [1801,1795,1781],
            [1768,1801,1781],
            [1753,1761,1775],
            [1785,1753,1775],
            [1795,1785,1775],
            [1761,1795,1775],
            [1698,1710,1726],
            [1742,1698,1726],
            [1753,1742,1726],
            [1710,1753,1726],
            [1687,1698,1715],
            [1728,1687,1715],
            [1742,1728,1715],
            [1698,1742,1715],
            [1742,1753,1759],
            [1769,1742,1759],
            [1785,1769,1759],
            [1753,1785,1759],
            [1728,1742,1747],
            [1751,1728,1747],
            [1769,1751,1747],
            [1742,1769,1747],
            [1547,1545,1596],
            [1640,1547,1596],
            [1644,1640,1596],
            [1545,1644,1596],
            [1549,1547,1594],
            [1636,1549,1594],
            [1640,1636,1594],
            [1547,1640,1594],
            [1640,1644,1659],
            [1678,1640,1659],
            [1687,1678,1659],
            [1644,1687,1659],
            [1636,1640,1656],
            [1672,1636,1656],
            [1678,1672,1656],
            [1640,1678,1656],
            [1551,1549,1590],
            [1631,1551,1590],
            [1636,1631,1590],
            [1549,1636,1590],
            [1553,1551,1586],
            [1630,1553,1586],
            [1631,1630,1586],
            [1551,1631,1586],
            [1631,1636,1650],
            [1664,1631,1650],
            [1672,1664,1650],
            [1636,1672,1650],
            [1630,1631,1646],
            [1663,1630,1646],
            [1664,1663,1646],
            [1631,1664,1646],
            [1678,1687,1702],
            [1713,1678,1702],
            [1728,1713,1702],
            [1687,1728,1702],
            [1672,1678,1691],
            [1704,1672,1691],
            [1713,1704,1691],
            [1678,1713,1691],
            [1713,1728,1732],
            [1738,1713,1732],
            [1751,1738,1732],
            [1728,1751,1732],
            [1704,1713,1722],
            [1724,1704,1722],
            [1738,1724,1722],
            [1713,1738,1722],
            [1664,1672,1682],
            [1694,1664,1682],
            [1704,1694,1682],
            [1672,1704,1682],
            [1663,1664,1676],
            [1693,1663,1676],
            [1694,1693,1676],
            [1664,1694,1676],
            [1694,1704,1708],
            [1717,1694,1708],
            [1724,1717,1708],
            [1704,1724,1708],
            [1693,1694,1706],
            [1712,1693,1706],
            [1717,1712,1706],
            [1694,1717,1706],
            [1795,1801,1811],
            [1823,1795,1811],
            [1825,1823,1811],
            [1801,1825,1811],
            [1785,1795,1804],
            [1809,1785,1804],
            [1823,1809,1804],
            [1795,1823,1804],
            [1823,1825,1840],
            [1860,1823,1840],
            [1870,1860,1840],
            [1825,1870,1840],
            [1809,1823,1829],
            [1842,1809,1829],
            [1860,1842,1829],
            [1823,1860,1829],
            [1769,1785,1791],
            [1793,1769,1791],
            [1809,1793,1791],
            [1785,1809,1791],
            [1751,1769,1773],
            [1777,1751,1773],
            [1793,1777,1773],
            [1769,1793,1773],
            [1793,1809,1817],
            [1821,1793,1817],
            [1842,1821,1817],
            [1809,1842,1817],
            [1777,1793,1797],
            [1799,1777,1797],
            [1821,1799,1797],
            [1793,1821,1797],
            [1860,1870,1889],
            [1901,1860,1889],
            [1905,1901,1889],
            [1870,1905,1889],
            [1842,1860,1879],
            [1891,1842,1879],
            [1901,1891,1879],
            [1860,1901,1879],
            [1901,1905,1912],
            [1922,1901,1912],
            [1926,1922,1912],
            [1905,1926,1912],
            [1922,1926,1938],
            [1948,1922,1938],
            [1952,1948,1938],
            [1926,1952,1938],
            [1891,1901,1906],
            [1910,1891,1906],
            [1922,1910,1906],
            [1901,1922,1906],
            [1910,1922,1929],
            [1934,1910,1929],
            [1948,1934,1929],
            [1922,1948,1929],
            [1821,1842,1858],
            [1873,1821,1858],
            [1891,1873,1858],
            [1842,1891,1858],
            [1799,1821,1827],
            [1838,1799,1827],
            [1873,1838,1827],
            [1821,1873,1827],
            [1838,1891,1885],
            [1877,1838,1885],
            [1910,1877,1885],
            [1891,1910,1885],
            [1877,1910,1908],
            [1895,1877,1908],
            [1934,1895,1908],
            [1910,1934,1908],
            [1738,1751,1764],
            [1779,1738,1764],
            [1799,1779,1764],
            [1751,1799,1764],
            [1724,1738,1749],
            [1757,1724,1749],
            [1779,1757,1749],
            [1738,1779,1749],
            [1717,1724,1736],
            [1745,1717,1736],
            [1757,1745,1736],
            [1724,1757,1736],
            [1712,1717,1730],
            [1744,1712,1730],
            [1745,1744,1730],
            [1717,1745,1730],
            [1779,1799,1807],
            [1815,1779,1807],
            [1838,1815,1807],
            [1799,1838,1807],
            [1757,1779,1783],
            [1787,1757,1783],
            [1815,1787,1783],
            [1779,1815,1783],
            [1787,1838,1844],
            [1831,1787,1844],
            [1895,1831,1844],
            [1838,1895,1844],
            [1745,1757,1766],
            [1771,1745,1766],
            [1787,1771,1766],
            [1757,1787,1766],
            [1744,1745,1755],
            [1763,1744,1755],
            [1771,1763,1755],
            [1745,1771,1755],
            [1771,1787,1802],
            [1813,1771,1802],
            [1831,1813,1802],
            [1787,1831,1802],
            [1763,1771,1789],
            [1806,1763,1789],
            [1813,1806,1789],
            [1771,1813,1789],
            [1814,1806,1820],
            [1836,1814,1820],
            [1826,1836,1820],
            [1806,1826,1820],
            [1832,1814,1834],
            [1872,1832,1834],
            [1836,1872,1834],
            [1814,1836,1834],
            [1898,1832,1888],
            [1915,1898,1888],
            [1872,1915,1888],
            [1832,1872,1888],
            [1836,1826,1847],
            [1857,1836,1847],
            [1850,1857,1847],
            [1826,1850,1847],
            [1872,1836,1863],
            [1882,1872,1863],
            [1857,1882,1863],
            [1836,1857,1863],
            [1915,1872,1900],
            [1919,1915,1900],
            [1882,1919,1900],
            [1872,1882,1900],
            [1935,1898,1928],
            [1954,1935,1928],
            [1915,1954,1928],
            [1898,1915,1928],
            [1949,1935,1951],
            [1969,1949,1951],
            [1954,1969,1951],
            [1935,1954,1951],
            [1952,1949,1962],
            [1974,1952,1962],
            [1969,1974,1962],
            [1949,1969,1962],
            [1954,1915,1941],
            [1958,1954,1941],
            [1919,1958,1941],
            [1915,1919,1941],
            [1969,1954,1965],
            [1971,1969,1965],
            [1958,1971,1965],
            [1954,1958,1965],
            [1974,1969,1973],
            [1975,1974,1973],
            [1971,1975,1973],
            [1969,1971,1973],
            [1857,1850,1855],
            [1867,1857,1855],
            [1853,1867,1855],
            [1850,1853,1855],
            [1882,1857,1876],
            [1884,1882,1876],
            [1867,1884,1876],
            [1857,1867,1876],
            [1919,1882,1904],
            [1917,1919,1904],
            [1884,1917,1904],
            [1882,1884,1904],
            [1867,1853,1852],
            [1849,1867,1852],
            [1837,1849,1852],
            [1853,1837,1852],
            [1884,1867,1869],
            [1865,1884,1869],
            [1849,1865,1869],
            [1867,1849,1869],
            [1917,1884,1894],
            [1897,1917,1894],
            [1865,1897,1894],
            [1884,1865,1894],
            [1958,1919,1937],
            [1947,1958,1937],
            [1917,1947,1937],
            [1919,1917,1937],
            [1971,1958,1960],
            [1956,1971,1960],
            [1947,1956,1960],
            [1958,1947,1960],
            [1975,1971,1967],
            [1963,1975,1967],
            [1956,1963,1967],
            [1971,1956,1967],
            [1947,1917,1921],
            [1925,1947,1921],
            [1897,1925,1921],
            [1917,1897,1921],
            [1956,1947,1943],
            [1932,1956,1943],
            [1925,1932,1943],
            [1947,1925,1943],
            [1963,1956,1945],
            [1933,1963,1945],
            [1932,1933,1945],
            [1956,1932,1945],
            [1948,1952,1961],
            [1968,1948,1961],
            [1974,1968,1961],
            [1952,1974,1961],
            [1934,1948,1950],
            [1953,1934,1950],
            [1968,1953,1950],
            [1948,1968,1950],
            [1895,1934,1927],
            [1914,1895,1927],
            [1953,1914,1927],
            [1934,1953,1927],
            [1968,1974,1972],
            [1970,1968,1972],
            [1975,1970,1972],
            [1974,1975,1972],
            [1953,1968,1964],
            [1957,1953,1964],
            [1970,1957,1964],
            [1968,1970,1964],
            [1914,1953,1940],
            [1918,1914,1940],
            [1957,1918,1940],
            [1953,1957,1940],
            [1831,1895,1887],
            [1871,1831,1887],
            [1914,1871,1887],
            [1895,1914,1887],
            [1813,1831,1833],
            [1835,1813,1833],
            [1871,1835,1833],
            [1831,1871,1833],
            [1806,1813,1819],
            [1826,1806,1819],
            [1835,1826,1819],
            [1813,1835,1819],
            [1871,1914,1899],
            [1881,1871,1899],
            [1918,1881,1899],
            [1914,1918,1899],
            [1835,1871,1862],
            [1856,1835,1862],
            [1881,1856,1862],
            [1871,1881,1862],
            [1826,1835,1846],
            [1850,1826,1846],
            [1856,1850,1846],
            [1835,1856,1846],
            [1970,1975,1966],
            [1955,1970,1966],
            [1963,1955,1966],
            [1975,1963,1966],
            [1957,1970,1959],
            [1946,1957,1959],
            [1955,1946,1959],
            [1970,1955,1959],
            [1918,1957,1936],
            [1916,1918,1936],
            [1946,1916,1936],
            [1957,1946,1936],
            [1955,1963,1944],
            [1931,1955,1944],
            [1933,1931,1944],
            [1963,1933,1944],
            [1946,1955,1942],
            [1924,1946,1942],
            [1931,1924,1942],
            [1955,1931,1942],
            [1916,1946,1920],
            [1896,1916,1920],
            [1924,1896,1920],
            [1946,1924,1920],
            [1881,1918,1903],
            [1883,1881,1903],
            [1916,1883,1903],
            [1918,1916,1903],
            [1856,1881,1875],
            [1866,1856,1875],
            [1883,1866,1875],
            [1881,1883,1875],
            [1850,1856,1854],
            [1853,1850,1854],
            [1866,1853,1854],
            [1856,1866,1854],
            [1883,1916,1893],
            [1864,1883,1893],
            [1896,1864,1893],
            [1916,1896,1893],
            [1866,1883,1868],
            [1848,1866,1868],
            [1864,1848,1868],
            [1883,1864,1868],
            [1853,1866,1851],
            [1837,1853,1851],
            [1848,1837,1851],
            [1866,1848,1851],
            [1069,952,992],
            [1072,1069,992],
            [952,1072,992],
            [1069,1072,1094],
            [1118,1069,1094],
            [1134,1118,1094],
            [1072,1134,1094],
            [1030,952,984],
            [1069,1030,984],
            [952,1069,984],
            [1030,1069,1076],
            [1080,1030,1076],
            [1118,1080,1076],
            [1069,1118,1076],
            [1118,1134,1133],
            [1131,1118,1133],
            [1139,1131,1133],
            [1134,1139,1133],
            [1131,1139,1129],
            [1110,1131,1129],
            [1127,1110,1129],
            [1139,1127,1129],
            [1080,1118,1104],
            [1088,1080,1104],
            [1131,1088,1104],
            [1118,1131,1104],
            [1088,1131,1096],
            [1074,1088,1096],
            [1110,1074,1096],
            [1131,1110,1096],
            [980,952,964],
            [1030,980,964],
            [952,1030,964],
            [980,1030,1028],
            [1002,980,1028],
            [1080,1002,1028],
            [1030,1080,1028],
            [951,952,954],
            [980,951,954],
            [952,980,954],
            [951,980,962],
            [949,951,962],
            [1002,949,962],
            [980,1002,962],
            [1002,1080,1059],
            [1012,1002,1059],
            [1088,1012,1059],
            [1080,1088,1059],
            [1012,1088,1053],
            [998,1012,1053],
            [1074,998,1053],
            [1088,1074,1053],
            [949,1002,974],
            [947,949,974],
            [1012,947,974],
            [1002,1012,974],
            [947,1012,972],
            [945,947,972],
            [998,945,972],
            [1012,998,972],
            [1110,1127,1082],
            [1047,1110,1082],
            [1060,1047,1082],
            [1127,1060,1082],
            [1074,1110,1071],
            [1004,1074,1071],
            [1047,1004,1071],
            [1110,1047,1071],
            [1047,1060,1039],
            [1024,1047,1039],
            [1031,1024,1039],
            [1060,1031,1039],
            [1024,1031,1041],
            [1049,1024,1041],
            [1063,1049,1041],
            [1031,1063,1041],
            [1004,1047,1018],
            [994,1004,1018],
            [1024,994,1018],
            [1047,1024,1018],
            [994,1024,1020],
            [1010,994,1020],
            [1049,1010,1020],
            [1024,1049,1020],
            [998,1074,1014],
            [976,998,1014],
            [1004,976,1014],
            [1074,1004,1014],
            [945,998,960],
            [943,945,960],
            [976,943,960],
            [998,976,960],
            [976,1004,986],
            [970,976,986],
            [994,970,986],
            [1004,994,986],
            [970,994,990],
            [978,970,990],
            [1010,978,990],
            [994,1010,990],
            [943,976,956],
            [941,943,956],
            [970,941,956],
            [976,970,956],
            [941,970,958],
            [939,941,958],
            [978,939,958],
            [970,978,958],
            [875,952,901],
            [951,875,901],
            [952,951,901],
            [875,951,893],
            [853,875,893],
            [949,853,893],
            [951,949,893],
            [825,952,891],
            [875,825,891],
            [952,875,891],
            [825,875,827],
            [775,825,827],
            [853,775,827],
            [875,853,827],
            [853,949,881],
            [843,853,881],
            [947,843,881],
            [949,947,881],
            [843,947,883],
            [857,843,883],
            [945,857,883],
            [947,945,883],
            [775,853,796],
            [767,775,796],
            [843,767,796],
            [853,843,796],
            [767,843,802],
            [781,767,802],
            [857,781,802],
            [843,857,802],
            [786,952,871],
            [825,786,871],
            [952,825,871],
            [786,825,779],
            [737,786,779],
            [775,737,779],
            [825,775,779],
            [782,952,863],
            [786,782,863],
            [952,786,863],
            [782,786,761],
            [720,782,761],
            [737,720,761],
            [786,737,761],
            [737,775,751],
            [724,737,751],
            [767,724,751],
            [775,767,751],
            [724,767,759],
            [745,724,759],
            [781,745,759],
            [767,781,759],
            [720,737,722],
            [715,720,722],
            [724,715,722],
            [737,724,722],
            [715,724,726],
            [727,715,726],
            [745,727,726],
            [724,745,726],
            [857,945,895],
            [879,857,895],
            [943,879,895],
            [945,943,895],
            [781,857,841],
            [851,781,841],
            [879,851,841],
            [857,879,841],
            [879,943,899],
            [885,879,899],
            [941,885,899],
            [943,941,899],
            [885,941,897],
            [877,885,897],
            [939,877,897],
            [941,939,897],
            [851,879,869],
            [861,851,869],
            [885,861,869],
            [879,885,869],
            [861,885,865],
            [845,861,865],
            [877,845,865],
            [885,877,865],
            [745,781,784],
            [808,745,784],
            [851,808,784],
            [781,851,784],
            [727,745,773],
            [794,727,773],
            [808,794,773],
            [745,808,773],
            [808,851,837],
            [831,808,837],
            [861,831,837],
            [851,861,837],
            [831,861,835],
            [806,831,835],
            [845,806,835],
            [861,845,835],
            [794,808,816],
            [823,794,816],
            [831,823,816],
            [808,831,816],
            [823,831,814],
            [791,823,814],
            [806,791,814],
            [831,806,814],
            [785,952,862],
            [782,785,862],
            [952,782,862],
            [785,782,760],
            [736,785,760],
            [720,736,760],
            [782,720,760],
            [824,952,870],
            [785,824,870],
            [952,785,870],
            [824,785,778],
            [774,824,778],
            [736,774,778],
            [785,736,778],
            [736,720,721],
            [723,736,721],
            [715,723,721],
            [720,715,721],
            [723,715,725],
            [744,723,725],
            [727,744,725],
            [715,727,725],
            [774,736,750],
            [766,774,750],
            [723,766,750],
            [736,723,750],
            [766,723,758],
            [780,766,758],
            [744,780,758],
            [723,744,758],
            [874,952,890],
            [824,874,890],
            [952,824,890],
            [874,824,826],
            [852,874,826],
            [774,852,826],
            [824,774,826],
            [950,952,900],
            [874,950,900],
            [952,874,900],
            [950,874,892],
            [948,950,892],
            [852,948,892],
            [874,852,892],
            [852,774,795],
            [842,852,795],
            [766,842,795],
            [774,766,795],
            [842,766,801],
            [856,842,801],
            [780,856,801],
            [766,780,801],
            [948,852,880],
            [946,948,880],
            [842,946,880],
            [852,842,880],
            [946,842,882],
            [944,946,882],
            [856,944,882],
            [842,856,882],
            [744,727,772],
            [807,744,772],
            [794,807,772],
            [727,794,772],
            [780,744,783],
            [850,780,783],
            [807,850,783],
            [744,807,783],
            [807,794,815],
            [830,807,815],
            [823,830,815],
            [794,823,815],
            [830,823,813],
            [805,830,813],
            [791,805,813],
            [823,791,813],
            [850,807,836],
            [860,850,836],
            [830,860,836],
            [807,830,836],
            [860,830,834],
            [844,860,834],
            [805,844,834],
            [830,805,834],
            [856,780,840],
            [878,856,840],
            [850,878,840],
            [780,850,840],
            [944,856,894],
            [942,944,894],
            [878,942,894],
            [856,878,894],
            [878,850,868],
            [884,878,868],
            [860,884,868],
            [850,860,868],
            [884,860,864],
            [876,884,864],
            [844,876,864],
            [860,844,864],
            [942,878,898],
            [940,942,898],
            [884,940,898],
            [878,884,898],
            [940,884,896],
            [938,940,896],
            [876,938,896],
            [884,876,896],
            [979,952,953],
            [950,979,953],
            [952,950,953],
            [979,950,961],
            [1001,979,961],
            [948,1001,961],
            [950,948,961],
            [1029,952,963],
            [979,1029,963],
            [952,979,963],
            [1029,979,1027],
            [1079,1029,1027],
            [1001,1079,1027],
            [979,1001,1027],
            [1001,948,973],
            [1011,1001,973],
            [946,1011,973],
            [948,946,973],
            [1011,946,971],
            [997,1011,971],
            [944,997,971],
            [946,944,971],
            [1079,1001,1058],
            [1087,1079,1058],
            [1011,1087,1058],
            [1001,1011,1058],
            [1087,1011,1052],
            [1073,1087,1052],
            [997,1073,1052],
            [1011,997,1052],
            [1068,952,983],
            [1029,1068,983],
            [952,1029,983],
            [1068,1029,1075],
            [1117,1068,1075],
            [1079,1117,1075],
            [1029,1079,1075],
            [1072,952,991],
            [1068,1072,991],
            [952,1068,991],
            [1072,1068,1093],
            [1134,1072,1093],
            [1117,1134,1093],
            [1068,1117,1093],
            [1117,1079,1103],
            [1130,1117,1103],
            [1087,1130,1103],
            [1079,1087,1103],
            [1130,1087,1095],
            [1109,1130,1095],
            [1073,1109,1095],
            [1087,1073,1095],
            [1134,1117,1132],
            [1139,1134,1132],
            [1130,1139,1132],
            [1117,1130,1132],
            [1139,1130,1128],
            [1127,1139,1128],
            [1109,1127,1128],
            [1130,1109,1128],
            [997,944,959],
            [975,997,959],
            [942,975,959],
            [944,942,959],
            [1073,997,1013],
            [1003,1073,1013],
            [975,1003,1013],
            [997,975,1013],
            [975,942,955],
            [969,975,955],
            [940,969,955],
            [942,940,955],
            [969,940,957],
            [977,969,957],
            [938,977,957],
            [940,938,957],
            [1003,975,985],
            [993,1003,985],
            [969,993,985],
            [975,969,985],
            [993,969,989],
            [1009,993,989],
            [977,1009,989],
            [969,977,989],
            [1109,1073,1070],
            [1046,1109,1070],
            [1003,1046,1070],
            [1073,1003,1070],
            [1127,1109,1081],
            [1060,1127,1081],
            [1046,1060,1081],
            [1109,1046,1081],
            [1046,1003,1017],
            [1023,1046,1017],
            [993,1023,1017],
            [1003,993,1017],
            [1023,993,1019],
            [1048,1023,1019],
            [1009,1048,1019],
            [993,1009,1019],
            [1060,1046,1038],
            [1031,1060,1038],
            [1023,1031,1038],
            [1046,1023,1038],
            [1031,1023,1040],
            [1063,1031,1040],
            [1048,1063,1040],
            [1023,1048,1040],
            [1049,1063,1120],
            [1161,1049,1120],
            [1170,1161,1120],
            [1063,1170,1120],
            [1010,1049,1092],
            [1126,1010,1092],
            [1161,1126,1092],
            [1049,1161,1092],
            [1165,1170,1224],
            [1272,1165,1224],
            [1279,1272,1224],
            [1170,1279,1224],
            [1161,1165,1216],
            [1250,1161,1216],
            [1272,1250,1216],
            [1165,1272,1216],
            [1141,1161,1196],
            [1234,1141,1196],
            [1250,1234,1196],
            [1161,1250,1196],
            [1126,1141,1178],
            [1206,1126,1178],
            [1234,1206,1178],
            [1141,1234,1178],
            [978,1010,1045],
            [1043,978,1045],
            [1126,1043,1045],
            [1010,1126,1045],
            [939,978,966],
            [937,939,966],
            [1043,937,966],
            [978,1043,966],
            [1084,1126,1153],
            [1174,1084,1153],
            [1206,1174,1153],
            [1126,1206,1153],
            [1043,1084,1112],
            [1124,1043,1112],
            [1174,1124,1112],
            [1084,1174,1112],
            [982,1043,1055],
            [1033,982,1055],
            [1124,1033,1055],
            [1043,1124,1055],
            [937,982,968],
            [935,937,968],
            [1033,935,968],
            [982,1033,968],
            [1272,1279,1321],
            [1369,1272,1321],
            [1376,1369,1321],
            [1279,1376,1321],
            [1250,1272,1309],
            [1347,1250,1309],
            [1369,1347,1309],
            [1272,1369,1309],
            [1234,1250,1285],
            [1315,1234,1285],
            [1347,1315,1285],
            [1250,1347,1285],
            [1206,1234,1252],
            [1278,1206,1252],
            [1315,1278,1252],
            [1234,1315,1252],
            [1369,1376,1388],
            [1402,1369,1388],
            [1415,1402,1388],
            [1376,1415,1388],
            [1347,1369,1375],
            [1378,1347,1375],
            [1402,1378,1375],
            [1369,1402,1375],
            [1402,1415,1419],
            [1423,1402,1419],
            [1434,1423,1419],
            [1415,1434,1419],
            [1378,1402,1396],
            [1390,1378,1396],
            [1423,1390,1396],
            [1402,1423,1396],
            [1315,1347,1339],
            [1335,1315,1339],
            [1378,1335,1339],
            [1347,1378,1339],
            [1278,1315,1305],
            [1295,1278,1305],
            [1335,1295,1305],
            [1315,1335,1305],
            [1335,1378,1365],
            [1353,1335,1365],
            [1390,1353,1365],
            [1378,1390,1365],
            [1295,1335,1325],
            [1301,1295,1325],
            [1353,1301,1325],
            [1335,1353,1325],
            [1174,1206,1222],
            [1226,1174,1222],
            [1278,1226,1222],
            [1206,1278,1222],
            [1124,1174,1176],
            [1169,1124,1176],
            [1226,1169,1176],
            [1174,1226,1176],
            [1033,1124,1108],
            [1078,1033,1108],
            [1169,1078,1108],
            [1124,1169,1108],
            [935,1033,988],
            [931,935,988],
            [1078,931,988],
            [1033,1078,988],
            [1226,1278,1256],
            [1240,1226,1256],
            [1295,1240,1256],
            [1278,1295,1256],
            [1169,1226,1202],
            [1180,1169,1202],
            [1240,1180,1202],
            [1226,1240,1202],
            [1240,1295,1274],
            [1244,1240,1274],
            [1301,1244,1274],
            [1295,1301,1274],
            [1180,1240,1218],
            [1186,1180,1218],
            [1244,1186,1218],
            [1240,1244,1218],
            [1078,1169,1138],
            [1086,1078,1138],
            [1180,1086,1138],
            [1169,1180,1138],
            [931,1078,996],
            [925,931,996],
            [1086,925,996],
            [1078,1086,996],
            [1086,1180,1145],
            [1090,1086,1145],
            [1186,1090,1145],
            [1180,1186,1145],
            [925,1086,1000],
            [921,925,1000],
            [1090,921,1000],
            [1086,1090,1000],
            [877,939,889],
            [812,877,889],
            [937,812,889],
            [939,937,889],
            [845,877,810],
            [729,845,810],
            [812,729,810],
            [877,812,810],
            [873,937,887],
            [822,873,887],
            [935,822,887],
            [937,935,887],
            [812,873,800],
            [731,812,800],
            [822,731,800],
            [873,822,800],
            [771,812,743],
            [681,771,743],
            [731,681,743],
            [812,731,743],
            [729,771,702],
            [649,729,702],
            [681,649,702],
            [771,681,702],
            [806,845,763],
            [694,806,763],
            [729,694,763],
            [845,729,763],
            [791,806,735],
            [684,791,735],
            [694,684,735],
            [806,694,735],
            [714,729,677],
            [621,714,677],
            [649,621,677],
            [729,649,677],
            [694,714,659],
            [605,694,659],
            [621,605,659],
            [714,621,659],
            [690,694,639],
            [583,690,639],
            [605,583,639],
            [694,605,639],
            [684,690,631],
            [575,684,631],
            [583,575,631],
            [690,583,631],
            [822,935,867],
            [777,822,867],
            [931,777,867],
            [935,931,867],
            [731,822,747],
            [686,731,747],
            [777,686,747],
            [822,777,747],
            [681,731,679],
            [629,681,679],
            [686,629,679],
            [731,686,679],
            [649,681,633],
            [577,649,633],
            [629,577,633],
            [681,629,633],
            [777,931,859],
            [769,777,859],
            [925,769,859],
            [931,925,859],
            [686,777,717],
            [675,686,717],
            [769,675,717],
            [777,769,717],
            [769,925,855],
            [765,769,855],
            [921,765,855],
            [925,921,855],
            [675,769,710],
            [669,675,710],
            [765,669,710],
            [769,765,710],
            [629,686,653],
            [615,629,653],
            [675,615,653],
            [686,675,653],
            [577,629,599],
            [560,577,599],
            [615,560,599],
            [629,615,599],
            [615,675,637],
            [611,615,637],
            [669,611,637],
            [675,669,637],
            [560,615,581],
            [554,560,581],
            [611,554,581],
            [615,611,581],
            [621,649,603],
            [540,621,603],
            [577,540,603],
            [649,577,603],
            [605,621,570],
            [508,605,570],
            [540,508,570],
            [621,540,570],
            [583,605,546],
            [486,583,546],
            [508,486,546],
            [605,508,546],
            [575,583,534],
            [478,575,534],
            [486,478,534],
            [583,486,534],
            [540,577,550],
            [520,540,550],
            [560,520,550],
            [577,560,550],
            [508,540,516],
            [477,508,516],
            [520,477,516],
            [540,520,516],
            [520,560,530],
            [502,520,530],
            [554,502,530],
            [560,554,530],
            [477,520,490],
            [465,477,490],
            [502,465,490],
            [520,502,490],
            [486,508,480],
            [453,486,480],
            [477,453,480],
            [508,477,480],
            [478,486,467],
            [439,478,467],
            [453,439,467],
            [486,453,467],
            [453,477,459],
            [432,453,459],
            [465,432,459],
            [477,465,459],
            [439,453,436],
            [420,439,436],
            [432,420,436],
            [453,432,436],
            [805,791,734],
            [693,805,734],
            [684,693,734],
            [791,684,734],
            [844,805,762],
            [728,844,762],
            [693,728,762],
            [805,693,762],
            [689,684,630],
            [582,689,630],
            [575,582,630],
            [684,575,630],
            [693,689,638],
            [604,693,638],
            [582,604,638],
            [689,582,638],
            [713,693,658],
            [620,713,658],
            [604,620,658],
            [693,604,658],
            [728,713,676],
            [648,728,676],
            [620,648,676],
            [713,620,676],
            [876,844,809],
            [811,876,809],
            [728,811,809],
            [844,728,809],
            [938,876,888],
            [936,938,888],
            [811,936,888],
            [876,811,888],
            [770,728,701],
            [680,770,701],
            [648,680,701],
            [728,648,701],
            [811,770,742],
            [730,811,742],
            [680,730,742],
            [770,680,742],
            [872,811,799],
            [821,872,799],
            [730,821,799],
            [811,730,799],
            [936,872,886],
            [934,936,886],
            [821,934,886],
            [872,821,886],
            [582,575,533],
            [485,582,533],
            [478,485,533],
            [575,478,533],
            [604,582,545],
            [507,604,545],
            [485,507,545],
            [582,485,545],
            [620,604,569],
            [539,620,569],
            [507,539,569],
            [604,507,569],
            [648,620,602],
            [576,648,602],
            [539,576,602],
            [620,539,602],
            [485,478,466],
            [452,485,466],
            [439,452,466],
            [478,439,466],
            [507,485,479],
            [476,507,479],
            [452,476,479],
            [485,452,479],
            [452,439,435],
            [431,452,435],
            [420,431,435],
            [439,420,435],
            [476,452,458],
            [464,476,458],
            [431,464,458],
            [452,431,458],
            [539,507,515],
            [519,539,515],
            [476,519,515],
            [507,476,515],
            [576,539,549],
            [559,576,549],
            [519,559,549],
            [539,519,549],
            [519,476,489],
            [501,519,489],
            [464,501,489],
            [476,464,489],
            [559,519,529],
            [553,559,529],
            [501,553,529],
            [519,501,529],
            [680,648,632],
            [628,680,632],
            [576,628,632],
            [648,576,632],
            [730,680,678],
            [685,730,678],
            [628,685,678],
            [680,628,678],
            [821,730,746],
            [776,821,746],
            [685,776,746],
            [730,685,746],
            [934,821,866],
            [930,934,866],
            [776,930,866],
            [821,776,866],
            [628,576,598],
            [614,628,598],
            [559,614,598],
            [576,559,598],
            [685,628,652],
            [674,685,652],
            [614,674,652],
            [628,614,652],
            [614,559,580],
            [610,614,580],
            [553,610,580],
            [559,553,580],
            [674,614,636],
            [668,674,636],
            [610,668,636],
            [614,610,636],
            [776,685,716],
            [768,776,716],
            [674,768,716],
            [685,674,716],
            [930,776,858],
            [924,930,858],
            [768,924,858],
            [776,768,858],
            [768,674,709],
            [764,768,709],
            [668,764,709],
            [674,668,709],
            [924,768,854],
            [920,924,854],
            [764,920,854],
            [768,764,854],
            [977,938,965],
            [1042,977,965],
            [936,1042,965],
            [938,936,965],
            [1009,977,1044],
            [1125,1009,1044],
            [1042,1125,1044],
            [977,1042,1044],
            [981,936,967],
            [1032,981,967],
            [934,1032,967],
            [936,934,967],
            [1042,981,1054],
            [1123,1042,1054],
            [1032,1123,1054],
            [981,1032,1054],
            [1083,1042,1111],
            [1173,1083,1111],
            [1123,1173,1111],
            [1042,1123,1111],
            [1125,1083,1152],
            [1205,1125,1152],
            [1173,1205,1152],
            [1083,1173,1152],
            [1048,1009,1091],
            [1160,1048,1091],
            [1125,1160,1091],
            [1009,1125,1091],
            [1063,1048,1119],
            [1170,1063,1119],
            [1160,1170,1119],
            [1048,1160,1119],
            [1140,1125,1177],
            [1233,1140,1177],
            [1205,1233,1177],
            [1125,1205,1177],
            [1160,1140,1195],
            [1249,1160,1195],
            [1233,1249,1195],
            [1140,1233,1195],
            [1164,1160,1215],
            [1271,1164,1215],
            [1249,1271,1215],
            [1160,1249,1215],
            [1170,1164,1223],
            [1279,1170,1223],
            [1271,1279,1223],
            [1164,1271,1223],
            [1032,934,987],
            [1077,1032,987],
            [930,1077,987],
            [934,930,987],
            [1123,1032,1107],
            [1168,1123,1107],
            [1077,1168,1107],
            [1032,1077,1107],
            [1173,1123,1175],
            [1225,1173,1175],
            [1168,1225,1175],
            [1123,1168,1175],
            [1205,1173,1221],
            [1277,1205,1221],
            [1225,1277,1221],
            [1173,1225,1221],
            [1077,930,995],
            [1085,1077,995],
            [924,1085,995],
            [930,924,995],
            [1168,1077,1137],
            [1179,1168,1137],
            [1085,1179,1137],
            [1077,1085,1137],
            [1085,924,999],
            [1089,1085,999],
            [920,1089,999],
            [924,920,999],
            [1179,1085,1144],
            [1185,1179,1144],
            [1089,1185,1144],
            [1085,1089,1144],
            [1225,1168,1201],
            [1239,1225,1201],
            [1179,1239,1201],
            [1168,1179,1201],
            [1277,1225,1255],
            [1294,1277,1255],
            [1239,1294,1255],
            [1225,1239,1255],
            [1239,1179,1217],
            [1243,1239,1217],
            [1185,1243,1217],
            [1179,1185,1217],
            [1294,1239,1273],
            [1300,1294,1273],
            [1243,1300,1273],
            [1239,1243,1273],
            [1233,1205,1251],
            [1314,1233,1251],
            [1277,1314,1251],
            [1205,1277,1251],
            [1249,1233,1284],
            [1346,1249,1284],
            [1314,1346,1284],
            [1233,1314,1284],
            [1271,1249,1308],
            [1368,1271,1308],
            [1346,1368,1308],
            [1249,1346,1308],
            [1279,1271,1320],
            [1376,1279,1320],
            [1368,1376,1320],
            [1271,1368,1320],
            [1314,1277,1304],
            [1334,1314,1304],
            [1294,1334,1304],
            [1277,1294,1304],
            [1346,1314,1338],
            [1377,1346,1338],
            [1334,1377,1338],
            [1314,1334,1338],
            [1334,1294,1324],
            [1352,1334,1324],
            [1300,1352,1324],
            [1294,1300,1324],
            [1377,1334,1364],
            [1389,1377,1364],
            [1352,1389,1364],
            [1334,1352,1364],
            [1368,1346,1374],
            [1401,1368,1374],
            [1377,1401,1374],
            [1346,1377,1374],
            [1376,1368,1387],
            [1415,1376,1387],
            [1401,1415,1387],
            [1368,1401,1387],
            [1401,1377,1395],
            [1422,1401,1395],
            [1389,1422,1395],
            [1377,1389,1395],
            [1415,1401,1418],
            [1434,1415,1418],
            [1422,1434,1418],
            [1401,1422,1418]
        ];

        // @private
        var calculateNormals = function(positions, indices) {
            var nvecs = new Array(positions.length);

            for (var i = 0; i < indices.length; i++) {
                var j0 = indices[i][0];
                var j1 = indices[i][1];
                var j2 = indices[i][2];

                var v1 = positions[j0];
                var v2 = positions[j1];
                var v3 = positions[j2];

                var va = SceneJS_math_subVec4(v2, v1);
                var vb = SceneJS_math_subVec4(v3, v1);

                var n = SceneJS_math_normalizeVec4(SceneJS_math_cross3Vec4(va, vb));

                if (!nvecs[j0]) nvecs[j0] = [];
                if (!nvecs[j1]) nvecs[j1] = [];
                if (!nvecs[j2]) nvecs[j2] = [];

                nvecs[j0].push(n);
                nvecs[j1].push(n);
                nvecs[j2].push(n);
            }

            var normals = new Array(positions.length);

            // now go through and average out everything
            for (var i = 0; i < nvecs.length; i++) {
                var count = nvecs[i].length;
                var x = 0;
                var y = 0;
                var z = 0;
                for (var j = 0; j < count; j++) {
                    x += nvecs[i][j][0];
                    y += nvecs[i][j][1];
                    z += nvecs[i][j][2];
                }
                normals[i] = [x / count, y / count, z / count];
            }
            return normals;
        };

        // @private
        var flatten = function (ar, numPerElement) {
            var result = [];
            for (var i = 0; i < ar.length; i++) {
                if (numPerElement && ar[i].length != numPerElement)
                    throw new SceneJS.InvalidNodeConfigException("Bad geometry array element");
                for (var j = 0; j < ar[i].length; j++)
                    result.push(ar[i][j]);
            }
            return result;
        };
        return {
            primitive:"triangles",
            positions: flatten(positions, 3),
            indices:flatten(indices, 3),
            normals:flatten(calculateNormals(positions, indices), 3)
        };
    };
};

SceneJS._inherit(SceneJS.objects.Teapot, SceneJS.Geometry);

/** Returns a new SceneJS.objects.Teapot instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.objects.Teapot constructor
 * @returns {SceneJS.objects.Teapot}
 */
SceneJS.objects.teapot = function() {
    return new SceneJS.objects.Teapot();
};
SceneJS._namespace("SceneJS.objects");

/**
 * @class A scene node that defines cube geometry.
 * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
 * texture-mapping. A Cube may be configured with an optional half-size for each axis. Where
 * not specified, the half-size on each axis will be 1 by default. It can also be configured as solid (default),
 * to construct it from triangles with normals for shading and one layer of UV coordinates for texture-mapping
 * one made of triangles. When not solid, it will be a wireframe drawn as line segments.</p>
 * <p><b>Example Usage</b></p><p>Definition of solid cube that is 6 units long on the X axis and 2 units long on the
 * Y and Z axis:</b></p><pre><code>
 * var c = new SceneJS.objects.Cube({
 *          xSize : 3,
 *          solid: true // Optional - when true (default) cube is solid, otherwise it is wireframe
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @constructor
 * Create a new SceneJS.objects.Cube
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.objects.Cube = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "cube";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.objects.Cube, SceneJS.Geometry);

// @private
SceneJS.objects.Cube.prototype._init = function(params) {
    var x = params.xSize || 1;
    var y = params.ySize || 1;
    var z = params.zSize || 1;
    var solid = (params.solid != undefined) ? params.solid : true;

    /* Type ID ensures that we reuse any scube that has already been created with
     * these parameters instead of wasting memory
     */
    this._type = "cube_" + x + "_" + y + "_" + z + (solid ? "_solid" : "wire");

    /* Callback that does the creation in case we can't find matching cube to reuse
     */
    this._create = function() {
        var positions = [
            x, y, z,
            -x, y, z,
            -x,-y, z,
            x,-y, z,
            // v0-v1-v2-v3 front
            x, y, z,
            x,-y, z,
            x,-y,-z,
            x, y,-z,
            // v0-v3-v4-v5 right
            x, y, z,
            x, y,-z,
            -x, y,-z,
            -x, y, z,
            // v0-v5-v6-v1 top
            -x, y, z,
            -x, y,-z,
            -x,-y,-z,
            -x,-y, z,
            // v1-v6-v7-v2 left
            -x,-y,-z,
            x,-y,-z,
            x,-y, z,
            -x,-y, z,
            // v7-v4-v3-v2 bottom
            x,-y,-z,
            -x,-y,-z,
            -x, y,-z,
            x, y,-z
        ];   // v4-v7-v6-v5 back

        var normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            // v0-v1-v2-v3 front
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            // v0-v3-v4-v5 right
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            // v0-v5-v6-v1 top
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            // v1-v6-v7-v2 left
            0,1, 0,
            0,1, 0,
            0,1, 0,
            0,1, 0,
            // v7-v4-v3-v2 bottom
            0, 0,1,
            0, 0,1,
            0, 0,1,
            0, 0,1
        ];    // v4-v7-v6-v5 back

        var uv = [
            x, y,
            0, y,
            0, 0,
            x, 0,
            // v0-v1-v2-v3 front
            0, y,
            0, 0,
            x, 0,
            x, y,
            // v0-v3-v4-v5 right
            x, 0,
            x, y,
            0, y,
            0, 0,
            // v0-v5-v6-v1 top
            x, y,
            0, y,
            0, 0,
            x, 0,
            // v1-v6-v7-v2 left
            0, 0,
            x, 0,
            x, y,
            0, y,
            // v7-v4-v3-v2 bottom
            0, 0,
            x, 0,
            x, y,
            0, y
        ];   // v4-v7-v6-v5 back

        var indices = [
            0, 1, 2,
            0, 2, 3,
            // front
            4, 5, 6,
            4, 6, 7,
            // right
            8, 9,10,
            8,10,11,
            // top
            12,13,14,
            12,14,15,
            // left
            16,17,18,
            16,18,19,
            // bottom
            20,21,22,
            20,22,23
        ] ;  // back

        return {
            primitive : solid ? "triangles" : "lines",
            positions : positions,
            normals: normals,
            uv : uv,
            indices : indices,
            colors:[]
        };
    };
};

/** Returns a new SceneJS.objects.Cube instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.objects.Cube constructor
 * @returns {SceneJS.objects.Cube}
 */
SceneJS.objects.cube = function() {
    var n = new SceneJS.objects.Cube();
    SceneJS.objects.Cube.prototype.constructor.apply(n, arguments);
    return n;
};
SceneJS._namespace("SceneJS.objects");


/**
 * @class A scene node that defines sphere geometry.
 * <p>The geometry is complete with normals for shading and one layer of UV coordinates for
 * texture-mapping. A Sphere may be configured with an optional radius, which will be 1 by default.</p>
 * <p><b>Example Usage</b></p><p>Definition of sphere with a radius of 6 units:</b></p><pre><code>
 * var c = new SceneJS.objects.Sphere({
 *          slices: 30,     // Optional number of longitudinal slices (30 is default)
 *          rings: 30,      // Optional number of latitudinal slices (30 is default)
 *          radius : 6      // Optional radius (1 is default)
 *     })
 * </pre></code>
* @extends SceneJS.Geometry
 * @constructor
 * Create a new SceneJS.objects.Sphere
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.objects.Sphere = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "sphere";
};

SceneJS._inherit(SceneJS.objects.Sphere, SceneJS.Geometry);

// @private
SceneJS.objects.Sphere.prototype._init = function(params) {
    var slices = params.slices || 30;
    var rings = params.rings || 30;

    /* Type ID ensures that we reuse any sphere that has already been created with
     * these parameters instead of wasting memory
     */
    this._type = "sphere_" + rings + "_" + slices;

    /* Callback that does the creation in case we can't find matching sphere to reuse     
     */
    this._create = function() {
        var radius = 1;
        var positions = [];
        var normals = [];
        var uv = [];
        for (var sliceNum = 0; sliceNum <= slices; sliceNum++) {
            var theta = sliceNum * Math.PI / slices;
            var sinTheta = Math.sin(theta);
            var cosTheta = Math.cos(theta);

            for (var ringNum = 0; ringNum <= rings; ringNum++) {
                var phi = ringNum * 2 * Math.PI / rings;
                var sinPhi = Math.sin(phi);
                var cosPhi = Math.cos(phi);

                var x = cosPhi * sinTheta;
                var y = cosTheta;
                var z = sinPhi * sinTheta;
                var u = 1 - (ringNum / rings);
                var v = sliceNum / slices;

                normals.push(-x);
                normals.push(-y);
                normals.push(-z);
                uv.push(u);
                uv.push(v);
                positions.push(radius * x);
                positions.push(radius * y);
                positions.push(radius * z);
            }
        }

        var indices = [];
        for (var sliceNum = 0; sliceNum < slices; sliceNum++) {
            for (var ringNum = 0; ringNum < rings; ringNum++) {
                var first = (sliceNum * (rings + 1)) + ringNum;
                var second = first + rings + 1;
                indices.push(first);
                indices.push(second);
                indices.push(first + 1);

                indices.push(second);
                indices.push(second + 1);
                indices.push(first + 1);
            }
        }

        return {
            primitive : "triangles",
            positions : positions,
            normals: normals,
            uv : uv,
            indices : indices
        };
    };
};


/** Returns a new SceneJS.objects.Sphere instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.objects.Sphere constructor
 * @returns {SceneJS.objects.Sphere}
 */
SceneJS.objects.sphere = function() {
    var n = new SceneJS.objects.Sphere();
    SceneJS.objects.Sphere.prototype.constructor.apply(n, arguments);
    return n;
};
/** Backend module that creates vector geometry repreentations of text
 *  @private
 */
var SceneJS_vectorTextModule = new (function() {

    var letters = {
        ' ': { width: 16, points: [] },
        '!': { width: 10, points: [
            [5,21],
            [5,7],
            [-1,-1],
            [5,2],
            [4,1],
            [5,0],
            [6,1],
            [5,2]
        ] },
        '"': { width: 16, points: [
            [4,21],
            [4,14],
            [-1,-1],
            [12,21],
            [12,14]
        ] },
        '#': { width: 21, points: [
            [11,25],
            [4,-7],
            [-1,-1],
            [17,25],
            [10,-7],
            [-1,-1],
            [4,12],
            [18,12],
            [-1,-1],
            [3,6],
            [17,6]
        ] },
        '$': { width: 20, points: [
            [8,25],
            [8,-4],
            [-1,-1],
            [12,25],
            [12,-4],
            [-1,-1],
            [17,18],
            [15,20],
            [12,21],
            [8,21],
            [5,20],
            [3,18],
            [3,16],
            [4,14],
            [5,13],
            [7,12],
            [13,10],
            [15,9],
            [16,8],
            [17,6],
            [17,3],
            [15,1],
            [12,0],
            [8,0],
            [5,1],
            [3,3]
        ] },
        '%': { width: 24, points: [
            [21,21],
            [3,0],
            [-1,-1],
            [8,21],
            [10,19],
            [10,17],
            [9,15],
            [7,14],
            [5,14],
            [3,16],
            [3,18],
            [4,20],
            [6,21],
            [8,21],
            [10,20],
            [13,19],
            [16,19],
            [19,20],
            [21,21],
            [-1,-1],
            [17,7],
            [15,6],
            [14,4],
            [14,2],
            [16,0],
            [18,0],
            [20,1],
            [21,3],
            [21,5],
            [19,7],
            [17,7]
        ] },
        '&': { width: 26, points: [
            [23,12],
            [23,13],
            [22,14],
            [21,14],
            [20,13],
            [19,11],
            [17,6],
            [15,3],
            [13,1],
            [11,0],
            [7,0],
            [5,1],
            [4,2],
            [3,4],
            [3,6],
            [4,8],
            [5,9],
            [12,13],
            [13,14],
            [14,16],
            [14,18],
            [13,20],
            [11,21],
            [9,20],
            [8,18],
            [8,16],
            [9,13],
            [11,10],
            [16,3],
            [18,1],
            [20,0],
            [22,0],
            [23,1],
            [23,2]
        ] },
        '\'': { width: 10, points: [
            [5,19],
            [4,20],
            [5,21],
            [6,20],
            [6,18],
            [5,16],
            [4,15]
        ] },
        '(': { width: 14, points: [
            [11,25],
            [9,23],
            [7,20],
            [5,16],
            [4,11],
            [4,7],
            [5,2],
            [7,-2],
            [9,-5],
            [11,-7]
        ] },
        ')': { width: 14, points: [
            [3,25],
            [5,23],
            [7,20],
            [9,16],
            [10,11],
            [10,7],
            [9,2],
            [7,-2],
            [5,-5],
            [3,-7]
        ] },
        '*': { width: 16, points: [
            [8,21],
            [8,9],
            [-1,-1],
            [3,18],
            [13,12],
            [-1,-1],
            [13,18],
            [3,12]
        ] },
        '+': { width: 26, points: [
            [13,18],
            [13,0],
            [-1,-1],
            [4,9],
            [22,9]
        ] },
        ',': { width: 10, points: [
            [6,1],
            [5,0],
            [4,1],
            [5,2],
            [6,1],
            [6,-1],
            [5,-3],
            [4,-4]
        ] },
        '-': { width: 26, points: [
            [4,9],
            [22,9]
        ] },
        '.': { width: 10, points: [
            [5,2],
            [4,1],
            [5,0],
            [6,1],
            [5,2]
        ] },
        '/': { width: 22, points: [
            [20,25],
            [2,-7]
        ] },
        '0': { width: 20, points: [
            [9,21],
            [6,20],
            [4,17],
            [3,12],
            [3,9],
            [4,4],
            [6,1],
            [9,0],
            [11,0],
            [14,1],
            [16,4],
            [17,9],
            [17,12],
            [16,17],
            [14,20],
            [11,21],
            [9,21]
        ] },
        '1': { width: 20, points: [
            [6,17],
            [8,18],
            [11,21],
            [11,0]
        ] },
        '2': { width: 20, points: [
            [4,16],
            [4,17],
            [5,19],
            [6,20],
            [8,21],
            [12,21],
            [14,20],
            [15,19],
            [16,17],
            [16,15],
            [15,13],
            [13,10],
            [3,0],
            [17,0]
        ] },
        '3': { width: 20, points: [
            [5,21],
            [16,21],
            [10,13],
            [13,13],
            [15,12],
            [16,11],
            [17,8],
            [17,6],
            [16,3],
            [14,1],
            [11,0],
            [8,0],
            [5,1],
            [4,2],
            [3,4]
        ] },
        '4': { width: 20, points: [
            [13,21],
            [3,7],
            [18,7],
            [-1,-1],
            [13,21],
            [13,0]
        ] },
        '5': { width: 20, points: [
            [15,21],
            [5,21],
            [4,12],
            [5,13],
            [8,14],
            [11,14],
            [14,13],
            [16,11],
            [17,8],
            [17,6],
            [16,3],
            [14,1],
            [11,0],
            [8,0],
            [5,1],
            [4,2],
            [3,4]
        ] },
        '6': { width: 20, points: [
            [16,18],
            [15,20],
            [12,21],
            [10,21],
            [7,20],
            [5,17],
            [4,12],
            [4,7],
            [5,3],
            [7,1],
            [10,0],
            [11,0],
            [14,1],
            [16,3],
            [17,6],
            [17,7],
            [16,10],
            [14,12],
            [11,13],
            [10,13],
            [7,12],
            [5,10],
            [4,7]
        ] },
        '7': { width: 20, points: [
            [17,21],
            [7,0],
            [-1,-1],
            [3,21],
            [17,21]
        ] },
        '8': { width: 20, points: [
            [8,21],
            [5,20],
            [4,18],
            [4,16],
            [5,14],
            [7,13],
            [11,12],
            [14,11],
            [16,9],
            [17,7],
            [17,4],
            [16,2],
            [15,1],
            [12,0],
            [8,0],
            [5,1],
            [4,2],
            [3,4],
            [3,7],
            [4,9],
            [6,11],
            [9,12],
            [13,13],
            [15,14],
            [16,16],
            [16,18],
            [15,20],
            [12,21],
            [8,21]
        ] },
        '9': { width: 20, points: [
            [16,14],
            [15,11],
            [13,9],
            [10,8],
            [9,8],
            [6,9],
            [4,11],
            [3,14],
            [3,15],
            [4,18],
            [6,20],
            [9,21],
            [10,21],
            [13,20],
            [15,18],
            [16,14],
            [16,9],
            [15,4],
            [13,1],
            [10,0],
            [8,0],
            [5,1],
            [4,3]
        ] },
        ':': { width: 10, points: [
            [5,14],
            [4,13],
            [5,12],
            [6,13],
            [5,14],
            [-1,-1],
            [5,2],
            [4,1],
            [5,0],
            [6,1],
            [5,2]
        ] },
        ',': { width: 10, points: [
            [5,14],
            [4,13],
            [5,12],
            [6,13],
            [5,14],
            [-1,-1],
            [6,1],
            [5,0],
            [4,1],
            [5,2],
            [6,1],
            [6,-1],
            [5,-3],
            [4,-4]
        ] },
        '<': { width: 24, points: [
            [20,18],
            [4,9],
            [20,0]
        ] },
        '=': { width: 26, points: [
            [4,12],
            [22,12],
            [-1,-1],
            [4,6],
            [22,6]
        ] },
        '>': { width: 24, points: [
            [4,18],
            [20,9],
            [4,0]
        ] },
        '?': { width: 18, points: [
            [3,16],
            [3,17],
            [4,19],
            [5,20],
            [7,21],
            [11,21],
            [13,20],
            [14,19],
            [15,17],
            [15,15],
            [14,13],
            [13,12],
            [9,10],
            [9,7],
            [-1,-1],
            [9,2],
            [8,1],
            [9,0],
            [10,1],
            [9,2]
        ] },
        '@': { width: 27, points: [
            [18,13],
            [17,15],
            [15,16],
            [12,16],
            [10,15],
            [9,14],
            [8,11],
            [8,8],
            [9,6],
            [11,5],
            [14,5],
            [16,6],
            [17,8],
            [-1,-1],
            [12,16],
            [10,14],
            [9,11],
            [9,8],
            [10,6],
            [11,5],
            [-1,-1],
            [18,16],
            [17,8],
            [17,6],
            [19,5],
            [21,5],
            [23,7],
            [24,10],
            [24,12],
            [23,15],
            [22,17],
            [20,19],
            [18,20],
            [15,21],
            [12,21],
            [9,20],
            [7,19],
            [5,17],
            [4,15],
            [3,12],
            [3,9],
            [4,6],
            [5,4],
            [7,2],
            [9,1],
            [12,0],
            [15,0],
            [18,1],
            [20,2],
            [21,3],
            [-1,-1],
            [19,16],
            [18,8],
            [18,6],
            [19,5]
        ] },
        'A': { width: 18, points: [
            [9,21],
            [1,0],
            [-1,-1],
            [9,21],
            [17,0],
            [-1,-1],
            [4,7],
            [14,7]
        ] },
        'B': { width: 21, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [13,21],
            [16,20],
            [17,19],
            [18,17],
            [18,15],
            [17,13],
            [16,12],
            [13,11],
            [-1,-1],
            [4,11],
            [13,11],
            [16,10],
            [17,9],
            [18,7],
            [18,4],
            [17,2],
            [16,1],
            [13,0],
            [4,0]
        ] },
        'C': { width: 21, points: [
            [18,16],
            [17,18],
            [15,20],
            [13,21],
            [9,21],
            [7,20],
            [5,18],
            [4,16],
            [3,13],
            [3,8],
            [4,5],
            [5,3],
            [7,1],
            [9,0],
            [13,0],
            [15,1],
            [17,3],
            [18,5]
        ] },
        'D': { width: 21, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [11,21],
            [14,20],
            [16,18],
            [17,16],
            [18,13],
            [18,8],
            [17,5],
            [16,3],
            [14,1],
            [11,0],
            [4,0]
        ] },
        'E': { width: 19, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [17,21],
            [-1,-1],
            [4,11],
            [12,11],
            [-1,-1],
            [4,0],
            [17,0]
        ] },
        'F': { width: 18, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [17,21],
            [-1,-1],
            [4,11],
            [12,11]
        ] },
        'G': { width: 21, points: [
            [18,16],
            [17,18],
            [15,20],
            [13,21],
            [9,21],
            [7,20],
            [5,18],
            [4,16],
            [3,13],
            [3,8],
            [4,5],
            [5,3],
            [7,1],
            [9,0],
            [13,0],
            [15,1],
            [17,3],
            [18,5],
            [18,8],
            [-1,-1],
            [13,8],
            [18,8]
        ] },
        'H': { width: 22, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [18,21],
            [18,0],
            [-1,-1],
            [4,11],
            [18,11]
        ] },
        'I': { width: 8, points: [
            [4,21],
            [4,0]
        ] },
        'J': { width: 16, points: [
            [12,21],
            [12,5],
            [11,2],
            [10,1],
            [8,0],
            [6,0],
            [4,1],
            [3,2],
            [2,5],
            [2,7]
        ] },
        'K': { width: 21, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [18,21],
            [4,7],
            [-1,-1],
            [9,12],
            [18,0]
        ] },
        'L': { width: 17, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,0],
            [16,0]
        ] },
        'M': { width: 24, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [12,0],
            [-1,-1],
            [20,21],
            [12,0],
            [-1,-1],
            [20,21],
            [20,0]
        ] },
        'N': { width: 22, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [18,0],
            [-1,-1],
            [18,21],
            [18,0]
        ] },
        'O': { width: 22, points: [
            [9,21],
            [7,20],
            [5,18],
            [4,16],
            [3,13],
            [3,8],
            [4,5],
            [5,3],
            [7,1],
            [9,0],
            [13,0],
            [15,1],
            [17,3],
            [18,5],
            [19,8],
            [19,13],
            [18,16],
            [17,18],
            [15,20],
            [13,21],
            [9,21]
        ] },
        'P': { width: 21, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [13,21],
            [16,20],
            [17,19],
            [18,17],
            [18,14],
            [17,12],
            [16,11],
            [13,10],
            [4,10]
        ] },
        'Q': { width: 22, points: [
            [9,21],
            [7,20],
            [5,18],
            [4,16],
            [3,13],
            [3,8],
            [4,5],
            [5,3],
            [7,1],
            [9,0],
            [13,0],
            [15,1],
            [17,3],
            [18,5],
            [19,8],
            [19,13],
            [18,16],
            [17,18],
            [15,20],
            [13,21],
            [9,21],
            [-1,-1],
            [12,4],
            [18,-2]
        ] },
        'R': { width: 21, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,21],
            [13,21],
            [16,20],
            [17,19],
            [18,17],
            [18,15],
            [17,13],
            [16,12],
            [13,11],
            [4,11],
            [-1,-1],
            [11,11],
            [18,0]
        ] },
        'S': { width: 20, points: [
            [17,18],
            [15,20],
            [12,21],
            [8,21],
            [5,20],
            [3,18],
            [3,16],
            [4,14],
            [5,13],
            [7,12],
            [13,10],
            [15,9],
            [16,8],
            [17,6],
            [17,3],
            [15,1],
            [12,0],
            [8,0],
            [5,1],
            [3,3]
        ] },
        'T': { width: 16, points: [
            [8,21],
            [8,0],
            [-1,-1],
            [1,21],
            [15,21]
        ] },
        'U': { width: 22, points: [
            [4,21],
            [4,6],
            [5,3],
            [7,1],
            [10,0],
            [12,0],
            [15,1],
            [17,3],
            [18,6],
            [18,21]
        ] },
        'V': { width: 18, points: [
            [1,21],
            [9,0],
            [-1,-1],
            [17,21],
            [9,0]
        ] },
        'W': { width: 24, points: [
            [2,21],
            [7,0],
            [-1,-1],
            [12,21],
            [7,0],
            [-1,-1],
            [12,21],
            [17,0],
            [-1,-1],
            [22,21],
            [17,0]
        ] },
        'X': { width: 20, points: [
            [3,21],
            [17,0],
            [-1,-1],
            [17,21],
            [3,0]
        ] },
        'Y': { width: 18, points: [
            [1,21],
            [9,11],
            [9,0],
            [-1,-1],
            [17,21],
            [9,11]
        ] },
        'Z': { width: 20, points: [
            [17,21],
            [3,0],
            [-1,-1],
            [3,21],
            [17,21],
            [-1,-1],
            [3,0],
            [17,0]
        ] },
        '[': { width: 14, points: [
            [4,25],
            [4,-7],
            [-1,-1],
            [5,25],
            [5,-7],
            [-1,-1],
            [4,25],
            [11,25],
            [-1,-1],
            [4,-7],
            [11,-7]
        ] },
        '\\': { width: 14, points: [
            [0,21],
            [14,-3]
        ] },
        ']': { width: 14, points: [
            [9,25],
            [9,-7],
            [-1,-1],
            [10,25],
            [10,-7],
            [-1,-1],
            [3,25],
            [10,25],
            [-1,-1],
            [3,-7],
            [10,-7]
        ] },
        '^': { width: 16, points: [
            [6,15],
            [8,18],
            [10,15],
            [-1,-1],
            [3,12],
            [8,17],
            [13,12],
            [-1,-1],
            [8,17],
            [8,0]
        ] },
        '_': { width: 16, points: [
            [0,-2],
            [16,-2]
        ] },
        '`': { width: 10, points: [
            [6,21],
            [5,20],
            [4,18],
            [4,16],
            [5,15],
            [6,16],
            [5,17]
        ] },
        'a': { width: 19, points: [
            [15,14],
            [15,0],
            [-1,-1],
            [15,11],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'b': { width: 19, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,11],
            [6,13],
            [8,14],
            [11,14],
            [13,13],
            [15,11],
            [16,8],
            [16,6],
            [15,3],
            [13,1],
            [11,0],
            [8,0],
            [6,1],
            [4,3]
        ] },
        'c': { width: 18, points: [
            [15,11],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'd': { width: 19, points: [
            [15,21],
            [15,0],
            [-1,-1],
            [15,11],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'e': { width: 18, points: [
            [3,8],
            [15,8],
            [15,10],
            [14,12],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'f': { width: 12, points: [
            [10,21],
            [8,21],
            [6,20],
            [5,17],
            [5,0],
            [-1,-1],
            [2,14],
            [9,14]
        ] },
        'g': { width: 19, points: [
            [15,14],
            [15,-2],
            [14,-5],
            [13,-6],
            [11,-7],
            [8,-7],
            [6,-6],
            [-1,-1],
            [15,11],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'h': { width: 19, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [4,10],
            [7,13],
            [9,14],
            [12,14],
            [14,13],
            [15,10],
            [15,0]
        ] },
        'i': { width: 8, points: [
            [3,21],
            [4,20],
            [5,21],
            [4,22],
            [3,21],
            [-1,-1],
            [4,14],
            [4,0]
        ] },
        'j': { width: 10, points: [
            [5,21],
            [6,20],
            [7,21],
            [6,22],
            [5,21],
            [-1,-1],
            [6,14],
            [6,-3],
            [5,-6],
            [3,-7],
            [1,-7]
        ] },
        'k': { width: 17, points: [
            [4,21],
            [4,0],
            [-1,-1],
            [14,14],
            [4,4],
            [-1,-1],
            [8,8],
            [15,0]
        ] },
        'l': { width: 8, points: [
            [4,21],
            [4,0]
        ] },
        'm': { width: 30, points: [
            [4,14],
            [4,0],
            [-1,-1],
            [4,10],
            [7,13],
            [9,14],
            [12,14],
            [14,13],
            [15,10],
            [15,0],
            [-1,-1],
            [15,10],
            [18,13],
            [20,14],
            [23,14],
            [25,13],
            [26,10],
            [26,0]
        ] },
        'n': { width: 19, points: [
            [4,14],
            [4,0],
            [-1,-1],
            [4,10],
            [7,13],
            [9,14],
            [12,14],
            [14,13],
            [15,10],
            [15,0]
        ] },
        'o': { width: 19, points: [
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3],
            [16,6],
            [16,8],
            [15,11],
            [13,13],
            [11,14],
            [8,14]
        ] },
        'p': { width: 19, points: [
            [4,14],
            [4,-7],
            [-1,-1],
            [4,11],
            [6,13],
            [8,14],
            [11,14],
            [13,13],
            [15,11],
            [16,8],
            [16,6],
            [15,3],
            [13,1],
            [11,0],
            [8,0],
            [6,1],
            [4,3]
        ] },
        'q': { width: 19, points: [
            [15,14],
            [15,-7],
            [-1,-1],
            [15,11],
            [13,13],
            [11,14],
            [8,14],
            [6,13],
            [4,11],
            [3,8],
            [3,6],
            [4,3],
            [6,1],
            [8,0],
            [11,0],
            [13,1],
            [15,3]
        ] },
        'r': { width: 13, points: [
            [4,14],
            [4,0],
            [-1,-1],
            [4,8],
            [5,11],
            [7,13],
            [9,14],
            [12,14]
        ] },
        's': { width: 17, points: [
            [14,11],
            [13,13],
            [10,14],
            [7,14],
            [4,13],
            [3,11],
            [4,9],
            [6,8],
            [11,7],
            [13,6],
            [14,4],
            [14,3],
            [13,1],
            [10,0],
            [7,0],
            [4,1],
            [3,3]
        ] },
        't': { width: 12, points: [
            [5,21],
            [5,4],
            [6,1],
            [8,0],
            [10,0],
            [-1,-1],
            [2,14],
            [9,14]
        ] },
        'u': { width: 19, points: [
            [4,14],
            [4,4],
            [5,1],
            [7,0],
            [10,0],
            [12,1],
            [15,4],
            [-1,-1],
            [15,14],
            [15,0]
        ] },
        'v': { width: 16, points: [
            [2,14],
            [8,0],
            [-1,-1],
            [14,14],
            [8,0]
        ] },
        'w': { width: 22, points: [
            [3,14],
            [7,0],
            [-1,-1],
            [11,14],
            [7,0],
            [-1,-1],
            [11,14],
            [15,0],
            [-1,-1],
            [19,14],
            [15,0]
        ] },
        'x': { width: 17, points: [
            [3,14],
            [14,0],
            [-1,-1],
            [14,14],
            [3,0]
        ] },
        'y': { width: 16, points: [
            [2,14],
            [8,0],
            [-1,-1],
            [14,14],
            [8,0],
            [6,-4],
            [4,-6],
            [2,-7],
            [1,-7]
        ] },
        'z': { width: 17, points: [
            [14,14],
            [3,0],
            [-1,-1],
            [3,14],
            [14,14],
            [-1,-1],
            [3,0],
            [14,0]
        ] },
        '{': { width: 14, points: [
            [9,25],
            [7,24],
            [6,23],
            [5,21],
            [5,19],
            [6,17],
            [7,16],
            [8,14],
            [8,12],
            [6,10],
            [-1,-1],
            [7,24],
            [6,22],
            [6,20],
            [7,18],
            [8,17],
            [9,15],
            [9,13],
            [8,11],
            [4,9],
            [8,7],
            [9,5],
            [9,3],
            [8,1],
            [7,0],
            [6,-2],
            [6,-4],
            [7,-6],
            [-1,-1],
            [6,8],
            [8,6],
            [8,4],
            [7,2],
            [6,1],
            [5,-1],
            [5,-3],
            [6,-5],
            [7,-6],
            [9,-7]
        ] },
        '|': { width: 8, points: [
            [4,25],
            [4,-7]
        ] },
        '}': { width: 14, points: [
            [5,25],
            [7,24],
            [8,23],
            [9,21],
            [9,19],
            [8,17],
            [7,16],
            [6,14],
            [6,12],
            [8,10],
            [-1,-1],
            [7,24],
            [8,22],
            [8,20],
            [7,18],
            [6,17],
            [5,15],
            [5,13],
            [6,11],
            [10,9],
            [6,7],
            [5,5],
            [5,3],
            [6,1],
            [7,0],
            [8,-2],
            [8,-4],
            [7,-6],
            [-1,-1],
            [8,8],
            [6,6],
            [6,4],
            [7,2],
            [8,1],
            [9,-1],
            [9,-3],
            [8,-5],
            [7,-6],
            [5,-7]
        ] },
        '~': { width: 24, points: [
            [3,6],
            [3,8],
            [4,11],
            [6,12],
            [8,12],
            [10,11],
            [14,8],
            [16,7],
            [18,7],
            [20,8],
            [21,10],
            [-1,-1],
            [3,8],
            [4,10],
            [6,11],
            [8,11],
            [10,10],
            [14,7],
            [16,6],
            [18,6],
            [20,7],
            [21,10],
            [21,12]
        ] }
    };

    // @private
    function letter(ch) {
        return letters[ch];
    }

    // @private
    function ascent(font, size) {
        return size;
    }

    // @private
    function descent(font, size) {
        return 7.0 * size / 25.0;
    }

    // @private
    function measure(font, size, str)
    {
        var total = 0;
        var len = str.length;

        for (var i = 0; i < len; i++) {
            var c = letter(str.charAt(i));
            if (c) total += c.width * size / 25.0;
        }
        return total;
    }

    // @private
    this.getGeometry = function(size, xPos, yPos, text) {
        var geo = {
            positions : [],
            indices : []
        };

        var lines = text.split("\n");
        var countVerts = 0;
        var y = yPos;

        for (var iLine = 0; iLine < lines.length; iLine++) {
            var x = xPos;

            var str = lines[iLine];

            var len = str.length;
            var mag = size / 25.0;

            for (var i = 0; i < len; i++) {
                var c = letter(str.charAt(i));
                if (c == '\n') {
                    alert("newline");
                }
                if (!c) {
                    continue;
                }

                var penUp = 1;

                var p1 = -1;
                var p2 = -1;

                var needLine = false;
                for (var j = 0; j < c.points.length; j++) {
                    var a = c.points[j];

                    if (a[0] == -1 && a[1] == -1) {
                        penUp = 1;
                        needLine = false;
                        continue;
                    }

                    geo.positions.push(x + a[0] * mag);
                    geo.positions.push(y + a[1] * mag);
                    geo.positions.push(0);


                    if (p1 == -1) {
                        p1 = countVerts;
                    } else if (p2 == -1) {
                        p2 = countVerts;
                    } else {
                        p1 = p2;
                        p2 = countVerts;
                    }
                    countVerts++;

                    if (penUp) {
                        penUp = false;
                    } else {

                        geo.indices.push(p1);
                        geo.indices.push(p2);


                    }
                    needLine = true;
                }
                x += c.width * mag;

            }
            y -= 25 * mag;
        }
        return geo;
    };

})();
/**
 * @class A scene node that defines vector text.
 * <p>.</p>
 * <p><b>Example Usage</b></p><p>Definition of text:</b></p><pre><code>
 * var c = new SceneJS.Text({
 *          text : "in morning sunlight\nrising steam from the cats yawn\n a smell of salmon"
 *     })
 * </pre></code>
 * @extends SceneJS.Geometry
 * @constructor
 * Create a new SceneJS.Text
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Text = function() {
    SceneJS.Geometry.apply(this, arguments);
    this._nodeType = "text";
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Text, SceneJS.Geometry);

// @private
SceneJS.Text.prototype._init = function(params) {

    /* Callback that creates the text geometry
     */
    this._create = function() {
        var geo = SceneJS_vectorTextModule.getGeometry(1, 0, 0, params.text); // Unit size
        return {
            primitive : "lines",
            positions : geo.positions,
            normals: [],
            uv : [],
            indices : geo.indices,
            colors:[]
        };
    };
};

/** Returns a new SceneJS.Text instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Text constructor
 * @returns {SceneJS.Text}
 */
SceneJS.text = function() {
    var n = new SceneJS.Text();
    SceneJS.Text.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that manages the current modelling transform matrices (modelling and normal).
 *
 * Services the scene modelling transform nodes, such as SceneJS.rotate, providing them with methods to set and
 * get the current modelling transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the modelling matrix and inverse normal matrix as WebGLFloatArrays to the
 * shading backend.
 *
 * Normal matrix and WebGLFloatArrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_modelTransformModule = new (function() {

    var transform;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true,
                    identity : true
                };
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {

                if (dirty) {

                    if (!transform.matrixAsArray) {
                        transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                    }

                    if (!transform.normalMatrixAsArray) {
                        transform.normalMatrixAsArray = new WebGLFloatArray(
                                SceneJS_math_transposeMat4(
                                        SceneJS_math_inverseMat4(transform.matrix)));
                    }

                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.MODEL_TRANSFORM_EXPORTED,
                            transform);

                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setTransform = function(t) {
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.MODEL_TRANSFORM_UPDATED, transform);
    };

    this.getTransform = function() {
        return transform;
    };
})();
/**
 * @class A scene node that applies a model-space rotation transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p>The rotation is described as a vector about which the rotation occurs, along with the angle or rotation in degrees.</p>
 * <p><b>Example</b></p><p>A cube rotated 45 degrees about its Y axis.</b></p><pre><code>
 * var rotate = new SceneJS.Rotate({
 *       angle: 45.0,    // Angle in degrees
 *       x: 0.0,         // Rotation vector points along positive Y axis
 *       y: 1.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Rotate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Rotate = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "rotate";
    this._mat = null;
    this._xform = null;
    this._angle = 0;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Rotate, SceneJS.Node);

/** Sets the rotation angle
 * @param {float} angle Rotation angle in degrees
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setAngle = function(angle) {
    this._angle = angle || 0;
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation angle
 * @returns {float} The angle in degrees
 */
SceneJS.Rotate.prototype.getAngle = function() {
    return this._angle;
};

/**
 * Sets the rotation axis vector. The vector must not be of zero length.
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setXYZ = function(xyz) {
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;   
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation axis vector.
 * @returns {object} The vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Rotate.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets rotation axis vector's X component
 *
 * @param x
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setX = function(x) {
    this._x = x;
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation axis vector's X component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getX = function() {
    return this._x;
};

/** Sets the rotation axis vector's Y component
 *
 * @param y
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setY = function(y) {
    this._y = y;
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation axis vector's Y component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getY = function() {
    return this._y;
};

/** Sets the rotation axis vector's Z component
 *
 * @param z
 * @returns {SceneJS.Rotate} this
 */
SceneJS.Rotate.prototype.setZ = function(z) {
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Returns the rotation axis vector's Z component

 * @returns {float}
 */
SceneJS.Rotate.prototype.getZ = function() {
    return this._z;
};

SceneJS.Rotate.prototype._init = function(params) {
    if (params.angle) {
        this.setAngle(params.angle);
    }
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Rotate.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_rotationMat4v(this._angle * Math.PI / 180.0, [this._x, this._y, this._z]);
    }
    var superXform = SceneJS_modelTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.rotate = function() {
    var n = new SceneJS.Rotate();
    SceneJS.Rotate.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that applies a model-space translate transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube translated along the X axis.</b></p><pre><code>
 * var translate = new SceneJS.Translate({
 *       x: 5.0,
 *       y: 0.0,
 *       z: 0.0
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Translate
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Translate = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "translate";
    this._mat = null;
    this._xform = null;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Translate, SceneJS.Node);

/**
 * Sets the translation vector
 * @param {object} xyz The vector - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setXYZ = function(xyz) {
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Returns the translation vector
 * @returns {Object} the vector, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Translate.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets the X component of the translation vector
 *
 * @param x
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setX = function(x) {
    this._x = x;
    this._memoLevel = 0;
    return this;
};

/** Returns the X component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getX = function() {
    return this._x;
};

/** Sets the Y component of the translation vector
 *
 * @param y
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setY = function(y) {
    this._y = y;
    this._memoLevel = 0;
    return this;
};

/** Returns the Y component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getY = function() {
    return this._y;
};

/** Sets the Z component of the translation vector
 *
 * @param z
 * @returns {SceneJS.Translate} this
 */
SceneJS.Translate.prototype.setZ = function(z) {
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Gets the Z component of the translation vector

 * @returns {float}
 */
SceneJS.Translate.prototype.getZ = function() {
    return this._z;
};

SceneJS.Translate.prototype._init = function(params) {
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Translate.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_translationMat4v([this._x, this._y, this._z]);
    }
    var superXform = SceneJS_modelTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.translate = function() {
    var n = new SceneJS.Translate();
    SceneJS.Translate.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that applies a model-space scale transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube scaled to become a flat square tile.</b></p><pre><code>
 * var scale = new SceneJS.Scale({
 *       x: 5.0,
 *       y: 5.0,
 *       z: 0.5
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Scale
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Scale = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scale";
    this._mat = null;
    this._xform = null;
    this._x = 0;
    this._y = 0;
    this._z = 1;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Scale, SceneJS.Node);

/**
 * Sets all scale factors.
 * @param {object} xyz The factors - eg. {x: 0, y: 1, z: 0}
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setXYZ = function(xyz) {
    var x = xyz.x || 0;
    var y = xyz.y || 0;
    var z = xyz.z || 0;
    this._x = x;
    this._y = y;
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Returns the scale factors.
 * @returns {Object} the factors, eg. {x: 0, y: 1, z: 0}
 */
SceneJS.Scale.prototype.getXYZ = function() {
    return {
        x: this._x,
        y: this._y,
        z: this._z
    };
};

/** Sets the X scale factor
 *
 * @param x
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setX = function(x) {
    this._x = x;
    this._memoLevel = 0;
    return this;
};

/** Returns the X scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getX = function() {
    return this._x;
};

/** Sets the Y scale factor
 *
 * @param y
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setY = function(y) {
    this._y = y;
    this._memoLevel = 0;
    return this;
};

/** Returns the Y scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getY = function() {
    return this._y;
};

/** Sets the Z scale factor
 *
 * @param z
 * @returns {SceneJS.Scale} this
 */
SceneJS.Scale.prototype.setZ = function(z) {
    this._z = z;
    this._memoLevel = 0;
    return this;
};

/** Gets the Z scale factor

 * @returns {float}
 */
SceneJS.Scale.prototype.getZ = function() {
    return this._z;
};

SceneJS.Scale.prototype._init = function(params) {
    this.setXYZ({x : params.x, y: params.y, z: params.z });
};

SceneJS.Scale.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_scalingMat4v([this._x, this._y, this._z]);
    }
    var superXform = SceneJS_modelTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.scale = function() {
    var n = new SceneJS.Scale();
    SceneJS.Scale.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that applies a model-space transform to the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube translated along the X, Y and Z axis.</b></p><pre><code>
 * var mat = new SceneJS.ModelMatrix({
 *       elements : [
 *              1, 0, 0, 10,
 *              0, 1, 0, 5,
 *              0, 0, 1, 3,
 *              0, 0, 0, 1
 *          ]
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.ModelMatrix
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.ModelMatrix = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "modelMatrix";
    this._mat = SceneJS_math_identityMat4();
    this._xform = null;
    if (this._fixedParams) {

        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.ModelMatrix, SceneJS.Node);

/**
 * Sets the matrix elements
 * @param {Array} elements One-dimensional array of matrix elements
 * @returns {SceneJS.ModelMatrix} this
 */
SceneJS.ModelMatrix.prototype.setElements = function(elements) {
    if (!elements) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ModelMatrix elements undefined"));
    }
    if (elements.length != 16) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ModelMatrix elements should number 16"));
    }
    for (var i = 0; i < 16; i++) {
        this._mat[i] = elements[i];
    }
    this._memoLevel = 0;
    return this;
};

/** Returns the matrix elements
 * @returns {Object} One-dimensional array of matrix elements
 */
SceneJS.ModelMatrix.prototype.getElements = function() {
    var elements = new Array(16);
    for (var i = 0; i < 16; i++) {
        elements[i] = this._mat[i];
    }
    return elements;
};

SceneJS.ModelMatrix.prototype._init = function(params) {
    if (params.elements) {
        this.setElements(params.elements);
    }
};

SceneJS.ModelMatrix.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    var superXform = SceneJS_modelTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.modelMatrix = function() {
    var n = new SceneJS.ModelMatrix();
    SceneJS.ModelMatrix.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that manages the current projection transform matrix.
 *
 * Services the scene projection transform nodes, such as SceneJS.frustum, providing them with methods to set and
 * get the current projection matrix.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * PROJECTION_TRANSFORM_EXPORTED to pass the projection matrix as a WebGLFloatArray to the shading backend.
 *
 * The WebGLFloatArray is lazy-computed and cached on export to avoid repeatedly regenerating it.
 *
 * Avoids redundant export of the matrix with a dirty flag; the matrix is only exported when the flag is set, which
 * occurs when the matrix is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a PROJECTION_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 *
 *  @private
 */
var SceneJS_projectionModule = new (function() {

    var transform;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true
                };
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    if (!transform.matrixAsArray) {
                        transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                    }
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.PROJECTION_TRANSFORM_EXPORTED,
                            transform);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setTransform = function(t) {
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
                transform);
    };

    this.getTransform = function() {
        return transform;
    };
})();
/**
 @class A scene node that defines a perspective transformation for the nodes within its subgraph.
 @extends SceneJS.Node
 <p><b>Example:</b></p><p>Defining perspective, specifying parameters that happen to be the default values</b></p><pre><code>
 var p = new SceneJS.Perspective({
 fovy : 55.0,
 aspect : 1.0,
 near : 0.10,
 far : 5000.0 },

 // ... child nodes
 )
 </pre></code>

 @constructor
 Create a new SceneJS.Perspective
 @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Perspective = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "perspective";
    this._fovy = 45.0;
    this._aspect = 1.0;
    this._near = 0.1;
    this._far = 1.0;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Perspective, SceneJS.Node);

/** Sets the field-of-view angle in degrees
 *
 * @param {float} fovy
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setFovY = function(fovy) {
    this._fovy = fovy;
    this._memoLevel = 0;
};

/** Returns the field-of-view angle in degrees
 * @returns {float} field-of-view
 */
SceneJS.Perspective.prototype.getFovyY = function() {
    return this._fovy;
};

/** Sets the height-width aspect ratio
 *
 * @param {float} aspect
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setAspect = function(aspect) {
    this._aspect = aspect;
    this._memoLevel = 0;
};

/** Returns the height-width aspect ratio
 * @returns {float} aspect ratio
 */
SceneJS.Perspective.prototype.getAspect = function() {
    return this._aspect;
};

/** Sets the distance of the near clipping plane on the Z-axis
 *
 * @param {float} near
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setNear = function(near) {
    this._near = near;
    this._memoLevel = 0;
};

/** Returns the distance of the near clipping plane on the Z-axis
 *
 * @returns {float} near
 */
SceneJS.Perspective.prototype.getNear = function() {
    return this._near;
};

/** Sets the distance of the far clipping plane on the Z-axis
 *
 * @param {float} far
 * @returns {SceneJS.Perspective} this
 */
SceneJS.Perspective.prototype.setFar = function(far) {
    this._far = far;
    this._memoLevel = 0;
};

/** Returns the distance of the far clipping plane on the Z-axis
 *
 * @returns {float} far
 */
SceneJS.Perspective.prototype.getFar = function() {
    return this._far;
};

SceneJS.Perspective.prototype._init = function(params) {
    if (params.fovy != undefined) {
        this.setFovY(params.fovy);
    }
    if (params.aspect != undefined) {
        this.setAspect(params.aspect);
    }
    if (params.near != undefined) {
        this.setNear(params.near);
    }
    if (params.far != undefined) {
        this.setFar(params.far);
    }
};

// Override
SceneJS.Perspective.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        var tempMat = SceneJS_math_perspectiveMatrix4(
                this._fovy * Math.PI / 180.0,
                this._aspect,
                this._near,
                this._far);
        this._transform = {
            type: "perspective",
            matrix:tempMat
        };
    }
    var prevTransform = SceneJS_projectionModule.getTransform();
    SceneJS_projectionModule.setTransform(this._transform);
    this._renderNodes(traversalContext, data);
    SceneJS_projectionModule.setTransform(prevTransform);
};


/** Function wrapper to support functional scene definition
 */
SceneJS.perspective = function() {
    var n = new SceneJS.Perspective();
    SceneJS.Perspective.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Scene node that constructs an ortographic projection matrix and sets it on the current shader.
 * @private
 */
SceneJS.ortho = function() {
    var cfg = SceneJS.getNodeConfig(arguments);
   
    var transform;

    return SceneJS.createNode(
            "ortho",
            cfg.children,

            new (function() {
                this._render = function(traversalContext, data) {
                    if (!transform || !cfg.fixed) {
                        var params = cfg.getParams(data);
                        var volume = {
                            left: params.left || -1.0,
                            right: params.right || 1.0,
                            bottom: params.bottom || -1.0,
                            top: params.top || 1.0,
                            near: params.near || 0.1,
                            far: params.far || 100.0
                        };
                        var tempMat = SceneJS_math_orthoMat4c(
                                volume.left,
                                volume.right,
                                volume.bottom,
                                volume.top,
                                volume.near,
                                volume.far
                                );
                        transform = {
                            type: "ortho",
                            matrix: tempMat
                        };
                    }
                    var prevTransform = SceneJS_projectionModule.getTransform();
                    SceneJS_projectionModule.setTransform(transform);
                    this._renderNodes(traversalContext, data);
                    SceneJS_projectionModule.setTransform(prevTransform);
                };
            })());
};
/**
 * Scene node that specifies the current viewing volume and projection matrix
 * @private
 */
SceneJS.frustum = function() {
    var cfg = SceneJS.getNodeConfig(arguments);

    return SceneJS.createNode(
            "frustum",
            cfg.children,

            new (function() {

                var transform;

                this._render = function(traversalContext, data) {
                    if (!transform || cfg.fixed) {    // Memoize matrix if node config is constant
                        var params = cfg.getParams(data);
                        var volume = {
                            xmin: params.left || -1.0,
                            xmax: params.right || 1.0,
                            ymin: params.bottom || -1.0,
                            ymax: params.top || 1.0,
                            zmin: params.near || 0.1,
                            zmax: params.far || 100.0
                        };
                        var tempMat = SceneJS_math_frustumMatrix4(
                                volume.xmin,
                                volume.xmax,
                                volume.ymin,
                                volume.ymax,
                                volume.zmin,
                                volume.zmax
                                );
                        transform = {
                            type: "frustum",
                            matrix: tempMat
                        };
                    }
                    var prevTransform = SceneJS_projectionModule.getTransform();
                    SceneJS_projectionModule.setTransform(transform);
                    this._renderNodes(traversalContext, data);
                    SceneJS_projectionModule.setTransform(prevTransform);
                };
            })());
};
/**
 * Backend that manages the current view transform matrices (view and normal).
 *
 * Services the scene view transform nodes, such as SceneJS.lookAt, providing them with methods to set and
 * get the current view transform matrices.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MODEL_TRANSFORM_EXPORTED to pass the view matrix and normal matrix as WebGLFloatArrays to the
 * shading backend.
 *
 * Normal matrix and WebGLFloatArrays are lazy-computed and cached on export to avoid repeatedly regenerating them.
 *
 * Avoids redundant export of the matrices with a dirty flag; they are only exported when that is set, which occurs
 * when transform is set by scene node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and SHADER_DEACTIVATED events.
 *
 * Whenever a scene node sets the matrix, this backend publishes it with a VIEW_TRANSFORM_UPDATED to allow other
 * dependent backends (such as "view-frustum") to synchronise their resources.
 *
 *  @private
 */
var SceneJS_viewTransformModule = new (function() {

    var transform;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                transform = {
                    matrix : SceneJS_math_identityMat4(),
                    fixed: true
                };
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {

                    if (!transform.matrixAsArray) {
                        transform.matrixAsArray = new WebGLFloatArray(transform.matrix);
                    }

                    if (!transform.normalMatrixAsArray) {
                        transform.normalMatrixAsArray = new WebGLFloatArray(
                                SceneJS_math_transposeMat4(
                                        SceneJS_math_inverseMat4(transform.matrix)));
                    }

                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.VIEW_TRANSFORM_EXPORTED,
                            transform);

                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    this.setTransform = function(t) {
        transform = t;
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
                transform);
    };

    this.getTransform = function() {
        return transform;
    };

})();
/**
 * @class A scene node that defines a viewing transform by specifing location of the eye position, the point being looked
 * at, and the direction of "up".
 * @extends SceneJS.Node
 * <p><b>Usage Example:</b></p><p>Defining perspective, specifying parameters that happen to be the default values</b></p><pre><code>
 * var l = new SceneJS.LookAt({
 *     eye : { x: 0.0, y: 10.0, z: -15 },
 *    look : { y:1.0 },
 *    up : { y: 1.0 },
 *
 * // .. Child nodes ...
 *
 * </pre></code>
 *
 * @constructor
 * Create a new SceneJS.Perspective
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.LookAt = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "lookAt";
    this._mat = null;
    this._xform = null;

    this._eyeX = 0;
    this._eyeY = 0;
    this._eyeZ = 1;

    this._lookX = 0;
    this._lookY = 0;
    this._lookZ = 0;

    this._upX = 0;
    this._upY = 1;
    this._upZ = 0;

    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.LookAt, SceneJS.Node);

/** Sets the eye position.
 * Don't allow this position to be the same as the position being looked at.
 *
 * @param {Object} eye - Eg. { x: 0.0, y: 10.0, z: -15 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setEye = function(eye) {
    this._eyeX = eye.x || 0;
    this._eyeY = eye.y || 0;
    this._eyeZ = eye.z || 0;
    this._memoLevel = 0;
    return this;
};

/** Returns the eye position.
 *
 * @returns {Object} Eye position - Eg. { x: 0.0, y: 10.0, z: -15 }
 */
SceneJS.LookAt.prototype.getEye = function() {
    return {
        x: this._eyeX,
        y: this._eyeY,
        z: this._eyeZ
    };
};

/** Sets the point being looked at.
 * Don't allow this point to be the same as the eye position.
 *
 * @param {Object} look - Eg. { x: 0.0, y: 2.0, z: 0.0 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setLook = function(look) {
    this._lookX = look.x || 0;
    this._lookY = look.y || 0;
    this._lookZ = look.z || 0;
    this._memoLevel = 0;
    return this;
};

/** Returns the position being looked at.
 * @returns {Object} Point looked at - Eg. { x: 0.0, y: 2.0, z: 0.0 }
 */
SceneJS.LookAt.prototype.getLook = function() {
    return {
        x: this._lookX,
        y: this._lookY,
        z: this._lookZ
    };
};

/** Sets the "up" vector - the direction that is considered "upwards".
 *
 * @param {Object} up - Eg. { x: 0.0, y: 1.0, z: 0.0 }
 * @returns {SceneJS.LookAt} this
 */
SceneJS.LookAt.prototype.setUp = function(up) {
    var x = up.x || 0;
    var y = up.y || 0;
    var z = up.z || 0;
    if (x + y + z == 0) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException(
                        "SceneJS.lookAt up vector is zero length - at least one of its x,y and z components must be non-zero"));
    }
    this._upX = x;
    this._upY = y;
    this._upZ = z;
    this._memoLevel = 0;
    return this;
};


/** Returns the "up" vector - the direction that is considered "upwards".
 *
 * @returns {Object} Up vector - Eg. { x: 0.0, y: 1.0, z: 0.0 }
 */
SceneJS.LookAt.prototype.getUp = function() {
    return {
        x: this._upX,
        y: this._upY,
        z: this._upZ
    };
};

SceneJS.LookAt.prototype._init = function(params) {
    if (params.eye) {
        this.setEye(params.eye);
    }
    if (params.look) {
        this.setLook(params.look);
    }
    if (params.up) {
        this.setUp(params.up);
    }
};

SceneJS.LookAt.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        this._mat = SceneJS_math_lookAtMat4c(
                this._eyeX, this._eyeY, this._eyeZ,
                this._lookX, this._lookY, this._lookZ,
                this._upX, this._upY, this._upZ);
    }
    var superXform = SceneJS_viewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            type: "lookat",
            matrix: tempMat,
            lookAt : {
                eye: { x: this._eyeX, y: this._eyeY, z: this._eyeZ },
                look: { x: this._lookX, y: this._lookY, z: this._lookZ },
                up:  { x: this._upX, y: this._upY, z: this._upZ }
            },
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_viewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_viewTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.lookAt = function() {
    var n = new SceneJS.LookAt();
    SceneJS.LookAt.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that applies a model-space transform to the nodes within its subgraph.
 * @extends SceneJS.Node

 * <p><b>Example</b></p><p>A cube translated along the X, Y and Z axis.</b></p><pre><code>
 * var mat = new SceneJS.ViewMatrix({
 *       elements : [
 *              1, 0, 0, 10,
 *              0, 1, 0, 5,
 *              0, 0, 1, 3,
 *              0, 0, 0, 1
 *          ]
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.ViewMatrix
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.ViewMatrix = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "viewMatrix";
    this._mat = SceneJS_math_identityMat4();
    this._xform = null;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.ViewMatrix, SceneJS.Node);

/**
 * Sets the matrix elements
 * @param {Array} elements One-dimensional array of matrix elements
 * @returns {SceneJS.ViewMatrix} this
 */
SceneJS.ViewMatrix.prototype.setElements = function(elements) {
    if (!elements) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ViewMatrix elements undefined"));
    }
    if (elements.length != 16) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.ViewMatrix elements should number 16"));
    }
    for (var i = 0; i < 16; i++) {
        this._mat[i] = elements[i];
    }
    this._memoLevel = 0;
    return this;
};

/** Returns the matrix elements
 * @returns {Object} One-dimensional array of matrix elements
 */
SceneJS.ViewMatrix.prototype.getElements = function() {
    var elements = new Array(16);
    for (var i = 0; i < 16; i++) {
        elements[i] = this._mat[i];
    }
    return elements;
};

SceneJS.ViewMatrix.prototype._init = function(params) {
    this.setElements(params.elements);
};

SceneJS.ViewMatrix.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    var superXform = SceneJS_viewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams
        };
        if (this._memoLevel == 1 && superXform.fixed) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.viewMatrix = function() {
    var n = new SceneJS.ViewMatrix();
    SceneJS.ViewMatrix.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A Scene node that defines a region within a SceneJS.LookAt in which the translations specified by that node have no effect.
 * @extends SceneJS.Node
 *
 * <p> As the parameters of the SceneJS.lookAt are modified, the content in the subgraph
 * of this node will rotate about the eye position, but will not translate as the eye position moves. You could therefore
 * define a skybox within the subgraph of this node, that will always stay in the distance.</p>
 *
 * <p><b>Example:</b></p><p>A box that the eye position never appears to move outside of</b></p><pre><code>
 * var l = new SceneJS.LookAt({
 *     eye  : { x: 0.0, y: 10.0, z: -15 },
 *     look : { y:1.0 },
 *     up   : { y: 1.0 },
 *
 *      new SceneJS.Stationary(
 *          new SceneJS.Scale({ x: 100.0, y: 100.0, z: 100.0 },
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 *
 * </pre></code>
 *
 *  @constructor
 * Create a new SceneJS.Stationary
 * @param {args} args Zero or more child nodes
 */
SceneJS.Stationary = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "stationary";
    this._xform = null;
};

SceneJS._inherit(SceneJS.Stationary, SceneJS.Node);

SceneJS.Stationary.prototype._render = function(traversalContext, data) {
    var superXform = SceneJS_viewTransformModule.getTransform();
    var lookAt = superXform.lookAt;
    if (lookAt) {
        if (this._memoLevel == 0) {
            this._xform = {
                matrix: SceneJS_math_mulMat4(
                        superXform.matrix,
                        SceneJS_math_translationMat4c(
                                lookAt.eye.x,
                                lookAt.eye.y,
                                lookAt.eye.z)),
                lookAt: lookAt,
                fixed: superXform.fixed
            };
            if (superXform.fixed) {
                this._memoLevel = 1;
            }
        }
        SceneJS_viewTransformModule.setTransform(this._xform);
        this._renderNodes(traversalContext, data);
        SceneJS_viewTransformModule.setTransform(superXform);
    } else {
        this._renderNodes(traversalContext, data);
    }
};

/** Function wrapper to support functional scene definition
 */
SceneJS.stationary = function() {
    var n = new SceneJS.Stationary();
    SceneJS.Stationary.prototype.constructor.apply(n, arguments);
    return n;
};

/**
 * Backend that manages scene lighting.
 *
 * Holds the sources on a stack and provides the SceneJS.light node with methods to push and pop them.
 *
 * Tracks the view and modelling transform matrices through incoming VIEW_TRANSFORM_UPDATED and
 * MODEL_TRANSFORM_UPDATED events. As each light are pushed, its position and/or direction is multipled by the
 * matrices. The stack will therefore contain sources that are instanced in view space by different modelling
 * transforms, with positions and directions that may be animated,
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * LIGHTS_EXPORTED to pass the entire light stack to the shading backend.
 *
 * Avoids redundant export of the sources with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the lights node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a scene node pushes or pops the stack, this backend publishes it with a LIGHTS_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_lightingModule = new (function() {

    var viewMat;
    var modelMat;
    var lightStack = [];
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                modelMat = viewMat = SceneJS_math_identityMat4();
                lightStack = [];
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.MODEL_TRANSFORM_UPDATED,
            function(params) {
                modelMat = params.matrix;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.LIGHTS_EXPORTED,
                            lightStack);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /**
     * @private
     */
    function instanceSources(sources) {
        for (var i = 0; i < sources.length; i++) {
            var source = sources[i];
            if (source._type == "point") {
                source._viewPos =  SceneJS_math_transformPoint3(viewMat, SceneJS_math_transformPoint3(modelMat, source._pos));
            } else if (source._type == "dir") {
                source._viewDir = SceneJS_math_transformVector3(viewMat, SceneJS_math_transformVector3(modelMat, source._dir));
            }
        }
    };

    // @private
    this.pushLightSources = function(sources) {
        instanceSources(sources);
        for (var i = 0; i < sources.length; i++) {
            lightStack.push(sources[i]);
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.LIGHTS_UPDATED,
                lightStack);
    };

    // @private
    this.popLightSources = function(numSources) {
        for (var i = 0; i < numSources; i++) {
            lightStack.pop();
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.LIGHTS_UPDATED,
                lightStack);
    };
})();

/*
 class SceneJS.LightSource

 A light source for containment within a SceneJS.Lights node.

 @constructor
 Create a new SceneJS.LightSource
 @param {Object} cfg The config object
 */
SceneJS.LightSource = function(cfg) {
    this._type = "point";
    this._color = [1.0, 1.0, 1.0];
    this._diffuse = true;
    this._specular = true;
    this._pos = [0.0, 0.0, 0.0];
    this._viewPos = [0.0, 0.0, 0.0]; // Transformed view-space pos - accessed by lights module and shading module
    this._dir = [0.0, 0.0, 0.0];
    this._constantAttenuation = 1.0;
    this._linearAttenuation = 0.0;
    this._quadraticAttenuation = 0.0;

    if (cfg) {
        this._init(cfg);
    }
};

/** Sets the light source type
 * @param {String} type Light source type - "dir" or "point"
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setType = function(type) {
    if (type != "dir" && type != "point") {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                "SceneJS.LightSource unsupported type - should be 'dir' or 'point'"));
    }
    this._type = type;
    return this;
};

/** Gets the light source type
 * @return {String} Light source type - "dir" or "point"
 */
SceneJS.LightSource.prototype.getType = function() {
    return this._type;
};

/** Sets the light source color
 *
 * @param color {Object} - Eg. {r: 1.0, g: 1.0, b: 1.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setColor = function(color) {
    this._color = [
        color.r != undefined ? color.r : 1.0,
        color.g != undefined ? color.g : 1.0,
        color.b != undefined ? color.b : 1.0
    ];
    return this;
};

/** Gets the light source color
 * @return {Object} Eg. {r: 1.0, g: 1.0, b: 1.0 }
 */
SceneJS.LightSource.prototype.getColor = function() {
    return {
        r: this._color[0],
        g: this._color[1],
        b: this._color[2] };
};

/** Sets whether the light source contributes to diffuse lighting or not
 *
 * @param diffuse {boolean}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setDiffuse = function (diffuse) {
    this._diffuse = diffuse;
    return this;
};

/** Gets whether the light source contributes to diffuse lighting or not
 *
 * @return {boolean}
 */
SceneJS.LightSource.prototype.getDiffuse = function() {
    return this._diffuse;
};

/** Sets whether the light source contributes to specular lighting or not
 *
 * @param specular {boolean}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setSpecular = function (specular) {
    this._specular = specular;
    return this;
};

/** Gets whether the light source contributes to specular lighting or not
 *
 * @return {boolean}
 */
SceneJS.LightSource.prototype.getSpecular = function() {
    return this._specular;
};

/** Sets the light source object-space position.
 * This is only used when the source is of type "point".
 *
 * @param pos {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setPos = function(pos) {
    this._pos = [ pos.x || 0.0, pos.y || 0.0, pos.z || 0.0 ];
    return this;
};

/** Gets the light source object-space position
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.LightSource.prototype.getPos = function() {
    return { x: this._pos[0], y: this._pos[1], z: this._pos[2] };
};

/** Sets the light source object-space direction vector.
 * This is only used when the source is of type "dir".
 *
 * @param dir {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setDir = function(dir) {
    this._dir = [ dir.x || 0.0, dir.y || 0.0, dir.z || 0.0 ];
    return this;
};

/** Gets the light source object-space direction vector
 *
 * @return {Object} - Eg. {x: 5.0, y: 5.0, z: 5.0 }
 */
SceneJS.LightSource.prototype.getDir = function() {
    return { x: this._dir[0], y: this._dir[1], z: this._dir[2] };
};

/** Sets the light source constant attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param constantAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setConstantAttenuation = function (constantAttenuation) {
    this._constantAttenuation = constantAttenuation;
    return this;
};

/** Gets the light source constant attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getConstantAttenuation = function() {
    return this._constantAttenuation;
};

/** Sets the light source linear attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param linearAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setLinearAttenuation = function (linearAttenuation) {
    this._linearAttenuation = linearAttenuation;
    return this;
};

/** Gets the light source linear attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getLinearAttenuation = function() {
    return this._linearAttenuation;
};

/** Sets the light source quadratic attenuation factor.
 * This is only used wen the source is of type "point".
 *
 * @param quadraticAttenuation {double}
 * @return {SceneJS.LightSource} this
 */
SceneJS.LightSource.prototype.setQuadraticAttenuation = function (quadraticAttenuation) {
    this._quadraticAttenuation = quadraticAttenuation;
    return this;
};

/** Gets the light source quadratic attenuation factor
 *
 * @return {double}
 */
SceneJS.LightSource.prototype.getQuadraticAttenuation = function() {
    return this._quadraticAttenuation;
};


// @private
SceneJS.LightSource.prototype._init = function(cfg) {
    if (cfg) {
        if (cfg.type) {
            this.setType(cfg.type);
        }
        if (cfg.color) {
            this.setColor(cfg.color);
        }
        if (cfg.diffuse != undefined) {
            this._diffuse = cfg.diffuse;
        }
        if (cfg.specular != undefined) {
            this._specular = cfg.specular;
        }
        if (cfg.pos) {
            this.setPos(cfg.pos);
        }
        if (cfg.dir) {
            this.setDir(cfg.dir);
        }
        if (cfg.constantAttenuation) {
            this.setConstantAttenuation(cfg.constantAttenuation);
        }
        if (cfg.linearAttenuation) {
            this.setLinearAttenuation(cfg.linearAttenuation);
        }
        if (cfg.quadraticAttenuation) {
            this.setQuadraticAttenuation(cfg.quadraticAttenuation);
        }
    }
};


/** Function wrapper to support functional scene definition
 */
SceneJS.lightSource = function() {
    var n = new SceneJS.LightSource();
    SceneJS.LightSource.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * @class A scene node that defines a set of light sources for its subgraph.
 * <p>Multiple instances of this  node may appear at
 * any location in a scene graph, to define multiple sources of light, the number of which is only limited
 * by video memory.</p>
 * <p>Currently, two kinds of light are supported: point and directional. Point lights have a location, like a lightbulb,
 * while directional only have a vector that describes their direction, where they have no actual location since they
 * are an infinite distance away.</p>
 * <p>Therefore, each of these two light types have slightly different properties, as shown in the usage example below.</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-dir-lighting-example">Directional Lighting</a></li>
 * <li><a target = "other" href="http://bit.ly/scenejs-point-lighting-exam">Point Lighting</a></li>
 * </ul>
 * <p><b>Example Usage</b></p><p>This example defines a cube that is illuminated by two light sources, point and directional.
 * The cube has material properties that define how it reflects the light.</b></p><pre><code>
 *  var l = new SceneJS.Lights({
 *      sources: [
 *          {
 *              type: "point",
 *              pos: { x: 100.0, y: 30.0, z: -100.0 }, // Position
 *              color: { r: 0.0, g: 1.0, b: 1.0 },
 *              diffuse: true,   // Contribute to diffuse lighting
 *              specular: true,  // Contribute to specular lighting
 *
 *              // Since this light source has a position, it therefore has
 *              // a distance over which its intensity can attenuate.
 *              // Consult any OpenGL book for how to use these factors.
 *
 *              constantAttenuation: 1.0,
 *              quadraticAttenuation: 0.0,
 *              linearAttenuation: 0.0
 *          },
 *          {
 *              type: "dir",
 *              color: { r: 1.0, g: 1.0, b: 0.0 },
 *              diffuse: true,
 *              specular: true,
 *              dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction of light from coordinate space origin
 *          }
 *      ]
 *  },
 *
 *      new SceneJS.material({
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          new SceneJS.objects.cube()))
 *</pre></code>
 *
 *<p><b>Example 2:</b></p><p>Creates same content as Example 1.</b></p><pre><code>
 *  var lights = new SceneJS.Lights();
 *
 *  var pointSource = new SceneJS.LightSource({
 *      type: "point",
 *      pos: { x: 100.0, y: 30.0, z: -100.0 },
 *      color: { r: 0.0, g: 1.0, b: 1.0 },
 *      diffuse: true,
 *      specular: true,
 *      constantAttenuation: 1.0,
 *      quadraticAttenuation: 0.0,
 *      linearAttenuation: 0.0
 *  });
 *
 *  var dirSource = new SceneJS.LightSource({
 *      type: "dir",
 *      color: { r: 1.0, g: 1.0, b: 0.0 },
 *      diffuse: true,
 *      specular: true,
 *      dir: { x: 1.0, y: 2.0, z: 0.0 }
 *  });
 *
 *  lights.addSource(pointSource);
 *
 *  lights.addSource(dirSource);
 *
 *  var material = new SceneJS.Material({
 *          baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *          specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *          emit:           0.0,
 *          specular:       0.9,
 *          shine:          6.0
 *      });
 *
 *  lights.addChild(material);
 *
 *  material.addChild(new SceneJS.objects.Cube())
 *
 *  // Move the light back a bit just to show off a setter method
 *
 *  pointSource.setPos({ z: -150.0 });
 *
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Lights
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Lights = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "lights";
    this._sources = [];
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Lights, SceneJS.Node);

/**
 Adds a light source.
 @param {SceneJS.LightSource} source
 @returns {SceneJS.Lights} this
 */
SceneJS.Lights.prototype.addSource = function(source) {
    this._sources.push(source);
    return this;
};

/**
 Get sources
 @return {Array} Array of  SceneJS.LightSource objects
 */
SceneJS.Lights.prototype.getSources = function() {
    var list = [];
    for (var i = 0; i < this._sources.length; i++) {
        list.push(this._sources[i]);
    }
    return list;
};

/** Set sources
 @param {Array} Array of  SceneJS.LightSource objects
 @returns {SceneJS.Lights} this
 */
SceneJS.Lights.prototype.setSources = function(sources) {
    this._sources = [];
    for (var i = 0; i < sources.length; i++) {
        this._sources.push(sources[i]);
    }
    return this;
};

/** Get number of sources
 @return {int}
 */
SceneJS.Lights.prototype.getNumSources = function() {
    return this._sources.length;
};

/** Get light source at given index
 * @return {SceneJS.lightSource} Light source
 */
SceneJS.Lights.prototype.getSourceAt = function(index) {
    return this._sources[index];
};

/**
 Removes and returns the light source at the given index. Returns null if no such source.
 @param {int} index Light source index
 @returns {SceneJS.LightSource}
 */
SceneJS.Lights.prototype.removeSourceAt = function(index) {
    var r = this._sources.splice(index, 1);
    if (r.length > 0) {
        return r[0];
    } else {
        return null;
    }
};

// @private
SceneJS.Lights.prototype._init = function(params) {
    if (params.sources) {
        this._sources = [];
        for (var i = 0; i < params.sources.length; i++) {
            this._sources.push(new SceneJS.LightSource(params.sources[i])); // TODO: allow either config or object
        }
    }
};

// @private
SceneJS.Lights.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }
        SceneJS_lightingModule.pushLightSources(this._sources);
        this._renderNodes(traversalContext, data);
        SceneJS_lightingModule.popLightSources(this._sources.length);
    }
};

/** Returns a new SceneJS.Lights instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Lights constructor
 * @returns {SceneJS.Lights}
 */
SceneJS.lights = function() {
    var n = new SceneJS.Lights();
    SceneJS.Lights.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that manages the current material properties.
 *
 * Services the SceneJS.material scene node, providing it with methods to set and get the current material.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * MATERIAL_EXPORTED to pass the material properties to the shading backend.
 *
 * Avoids redundant export of the material properties with a dirty flag; they are only exported when that is set, which
 * occurs when material is set by the SceneJS.material node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Sets the properties to defaults on SCENE_ACTIVATED.
 *
 * Whenever a SceneJS.material sets the material properties, this backend publishes it with a MATERIAL_UPDATED to allow
 * other dependent backends to synchronise their resources. One such backend is the shader backend, which taylors the
 * active shader according to the material properties.
 *
 *  @private
 */
var SceneJS_materialModule = new (function() {

    var material;
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                material = {
                    baseColor : [ 0.5, 0.5, 0.5 ],
                    specularColor: [ 0.0,  0.0,  0.0 ],
                    specular : 0,
                    shine : 0,
                    reflect : 0,
                    alpha : 1.0,
                    emit : 0.0
                };
                dirty = true;
            });


    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.MATERIAL_EXPORTED,
                            material);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    // @private
    this.setMaterial = function(m) {
        material = m;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.MATERIAL_UPDATED,
                material);
        dirty = true;
    };

    // @private
    this.getMaterial = function() {
        return material;
    };
})();
/**
 * @class A scene node that defines how light is reflected by the geometry within its subgraph.
 * <p> These may be defined anywhere within a scene graph and may be nested. When nested, the properties on an inner material
 * node will override those on outer material nodes for the inner node's subgraph. These nodes are to be defined either
 * above or below SceneJS.Lights nodes, which provide light for geometry to reflect.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-material-example">Example 1</a></li></ul>
 * <p><b>Usage Example</b></p><p>A cube illuminated by a directional light source and wrapped
 * with material properties that define how it reflects the light.</b></p><pre><code>
 * var l = new SceneJS.Lights({
 *          sources: [
 *              {
 *                  type: "dir",
 *                  color: { r: 1.0, g: 1.0, b: 0.0 },
 *                  diffuse: true,
 *                  specular: true,
 *                  dir: { x: 1.0, y: 2.0, z: 0.0 } // Direction of light from coordinate space origin
 *              }
 *          ]
 *      },
 *
 *      new SceneJS.Material({
 *              baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *              specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *              emit:           0.0,
 *              specular:       0.9,
 *              shine:          6.0
 *          },
 *
 *          new SceneJS.objects.Cube()
 *     )
 * )
 * </pre></code>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Material
 * @param {Object} config The config object or function, followed by zero or more child nodes
 *
 */
SceneJS.Material = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "material";
    this._material = {
        baseColor : [ 0.0, 0.0, 0.0 ],
        specularColor: [ 0.0,  0.0,  0.0 ],
        specular : 0,
        shine : 0,
        reflect : 0,
        alpha : 1.0,
        emit : 0.0
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Material, SceneJS.Node);

/**
 * Sets the material base color
 * @function {SceneJS.Material} setBaseColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setBaseColor = function(color) {
    this._material.baseColor = [
        color.r != undefined ? color.r : 0.0,
        color.g != undefined ? color.g : 0.0,
        color.b != undefined ? color.b : 0.0
    ];
    return this;
};

/**
 Returns the base color
 @function {Object} getBaseColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getBaseColor = function() {
    return {
        r: this._material.baseColor,
        g: this._material.baseColor,
        b: this._material.baseColor
    };
};

/**
 * Sets the material specular
 * @function {SceneJS.Material} setSpecularColor
 * @param {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecularColor = function(color) {
    this._material.specularColor = [
        color.r != undefined ? color.r : 0.5,
        color.g != undefined ? color.g : 0.5,
        color.b != undefined ? color.b : 0.5
    ];
    return this;
};

/**
 Returns the specular color
 @function {Object} getSpecularColor
 @returns {Object} color Eg. { r: 1.0, g: 1.0, b: 0.0 }
 */
SceneJS.Material.prototype.getSpecularColor = function() {
    return {
        r: this._material.specularColor[0],
        g: this._material.specularColor[1],
        b: this._material.specularColor[2]
    };
};

/**
 * Sets the specular reflection factor
 * @function {SceneJS.Material} setSpecular
 * @param {float} specular
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setSpecular = function(specular) {
    this._material.specular = specular || 0;
    return this;
};

/**
 Returns the specular reflection factor
 @function {float} getSpecular
 @returns {float}
 */
SceneJS.Material.prototype.getSpecular = function() {
    return this._material.specular;
};

/**
 * Sets the shininess factor
 * @function {SceneJS.Material} setShine
 * @param {float} shine
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setShine = function(shine) {
    this._material.shine = shine || 0;
    return this;
};

/**
 Returns the shininess factor
 @function {float} getShine
 @returns {float}
 */
SceneJS.Material.prototype.getShine = function() {
    return this._material.shine;
};

/**
 * Sets the reflectivity factor
 * @function {SceneJS.Material} setReflect
 * @param {float} reflect
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setReflect = function(reflect) {
    this._material.reflect = reflect || 0;
    return this;
};

/**
 Returns the reflectivity factor
 @function {float} getReflect
 @returns {float}
 */
SceneJS.Material.prototype.getReflect = function() {
    return this._material.reflect;
};

/**
 * Sets the emission factor
 * @function {SceneJS.Material} setEmit
 * @param {float} emit
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setEmit = function(emit) {
    this._material.emit = emit || 0;
    return this;
};

/**
 Returns the emission factor
 @function {float} getEmit
 @returns {float}
 */
SceneJS.Material.prototype.getEmit = function() {
    return this._material.emit;
};

/**
 * Sets the amount of alpha
 * @function {SceneJS.Material} setAlpha
 * @param {float} alpha
 * @returns {SceneJS.Material} this
 */
SceneJS.Material.prototype.setAlpha = function(alpha) {
    this._material.alpha = alpha == undefined ? 1.0 : alpha;
    return this;
};

/**
 Returns the amount of alpha
 @function {float} getAlpha
 @returns {float}
 */
SceneJS.Material.prototype.getAlpha = function() {
    return this._material.alpha;
};

  // @private
SceneJS.Material.prototype._init = function(params) {
    if (params.baseColor) {
        this.setBaseColor(params.baseColor);
    }
    if (params.specularColor) {
        this.setSpecularColor(params.specularColor);
    }
    if (params.specular) {
        this.setSpecular(params.specular);
    }
    if (params.shine) {
        this.setShine(params.shine);
    }
    if (params.reflect) {
        this.setReflect(params.reflect);
    }
    if (params.emit) {
        this.setEmit(params.emit);
    }
    if (params.alpha) {
        this.setAlpha(params.alpha);
    }
};

// @private
SceneJS.Material.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }
        var saveMaterial = SceneJS_materialModule.getMaterial();
        SceneJS_materialModule.setMaterial(this._material);
        this._renderNodes(traversalContext, data);
        SceneJS_materialModule.setMaterial(saveMaterial);
    }
};

/** Returns a new SceneJS.Material instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Material constructor
 * @returns {SceneJS.Material}
 */
SceneJS.material = function() {
    var n = new SceneJS.Material();
    SceneJS.Material.prototype.constructor.apply(n, arguments);
    return n;
};

/**
 * @class A scene node that animates interpolates a scalar value by interpolating within a sequence of key values.
 * <p>This nodes reads an <i>alpha</i> value from the current data scope and writes the output to a child data scope
 * for nodes in its subgraph to configure themselves with.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-scalarinterpolator-example">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>This example defines a cube with rotation that is animated by a SceneJS.ScalarInterpolator, which is
 * in turn driven by an alpha value supplied by a higher SceneJS.WithData. If we thought of <em>alpha</em> as
 * elapsed seconds, then this cube will rotate 360 degrees over one second, then rotate 180 in the reverse direction
 * over the next 0.5 seconds. In this example however, the alpha is actually fixed, where the cube is stuck at
 * 180 degrees - you would need to vary the "alpha" property on the WithData node to actually animate it.</p><pre><code>
 * var wd = new SceneJS.WithData({ "alpha" : 0.5 }, // Interpolates the rotation to 180 degrees
 *
 *      new SceneJS.ScalarInterpolator({
 *              type:"linear",   // or 'cosine', 'cubic' or 'constant'
 *              input:"alpha",
 *              output:"angle",
 *              keys: [0.0, 1.0, 1.5],
 *              values: [0.0, 360.0, 180.0]
 *          },
 *
 *          new SceneJS.Rotate(function(data) {
 *                 return { angle : data.get("angle"), y: 1.0 };
 *              },
 *
 *                  new SceneJS.objects.Cube()
 *              )
 *          )
 *      )
 *
 *  // Bump the rotation along a notch:
 *
 *  wd.setProperty("alpha", 0.6);
 *
 *  </pre></code>
 *
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.ScalarInterpolator
 * @param {Object} config The config object, followed by zero or more child nodes
 *
 */
SceneJS.ScalarInterpolator = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "scalar-interpolator";
    this._input = null;
    this._output = null;
    this._outputValue = null;
    this._keys = null;
    this._values = null;
    this._key1 = 0;
    this._key2 = 0;
    this._type = null;
};

SceneJS._inherit(SceneJS.ScalarInterpolator, SceneJS.Node);

/* ScalarInterpolator attempts to track the pair of keys that enclose the current alpha value -
 * these are the node's current states with regard to that:
 */

// @private
SceneJS.ScalarInterpolator.prototype._NOT_FOUND = 0;        // Alpha outside of key sequence

// @private
SceneJS.ScalarInterpolator.prototype._BEFORE_FIRST = 1;     // Alpha before first key

// @private
SceneJS.ScalarInterpolator.prototype._AFTER_LAST = 2;       // Alpha after last key

// @private
SceneJS.ScalarInterpolator.prototype._FOUND = 3;            // Found keys before and after alpha

// @private
SceneJS.ScalarInterpolator.prototype._linearInterpolate = function(k) {
    var u = this._keys[this._key2] - this._keys[this._key1];
    var v = k - this._keys[this._key1];
    var w = this._values[this._key2] - this._values[this._key1];
    return this._values[this._key1] + ((v / u) * w);
};

// @private
SceneJS.ScalarInterpolator.prototype._constantInterpolate = function(k) {
    if (Math.abs((k - this._keys[this._key1])) < Math.abs((k - this._keys[this._key2]))) {
        return this._keys[this._key1];
    } else {
        return this._keys[this._key2];
    }
};

// @private
SceneJS.ScalarInterpolator.prototype._cosineInterpolate = function(k) {
    var mu2 = (1 - Math.cos(k * Math.PI) / 2.0);
    return (this._keys[this._key1] * (1 - mu2) + this._keys[this._key2] * mu2);
};

// @private
SceneJS.ScalarInterpolator.prototype._cubicInterpolate = function(k) {
    if (this._key1 == 0 || this._key2 == (this._keys.length - 1)) {

        /* Between first or last pair of keyframes - need four keyframes for cubic, so fall back on cosine
         */
        return this._cosineInterpolate(k);
    }
    var y0 = this._keys[this._key1 - 1];
    var y1 = this._keys[this._key1];
    var y2 = this._keys[this._key2];
    var y3 = this._keys[this._key2 + 1];
    var mu2 = k * k;
    var a0 = y3 - y2 - y0 + y1;
    var a1 = y0 - y1 - a0;
    var a2 = y2 - y0;
    var a3 = y1;
    return (a0 * k * mu2 + a1 * mu2 + a2 * k + a3);
};

// @private
SceneJS.ScalarInterpolator.prototype._findEnclosingFrame = function(key) {
    if (this._keys.length == 0) {
        return this._NOT_FOUND;
    }
    if (key < this._keys[0]) {
        return this._BEFORE_FIRST;
    }
    if (key > this._keys[this._keys.length - 1]) {
        return this._AFTER_LAST;
    }
    while (this._keys[this._key1] > key) {
        this._key1--;
        this._key2--;
    }
    while (this._keys[this._key2] < key) {
        this._key1++;
        this._key2++;
    }
    return this._FOUND;
};

// @private
SceneJS.ScalarInterpolator.prototype._interpolate = function(k) {
    switch (this._type) {
        case 'linear':
            return this._linearInterpolate(k);
        case 'cosine':
            return this._cosineInterpolate(k);
        case 'cubic':
            return this._cubicInterpolate(k);
        case 'constant':
            return this._constantInterpolate(k);
        default:
            SceneJS_errorModule.fatalError(
                    new SceneJS.InternalException("SceneJS.ScalarInterpolator internal error - interpolation type not switched: '"
                            + this._type + "'"));
    }
};

// @private
SceneJS.ScalarInterpolator.prototype._update = function(key) {
    switch (this._findEnclosingFrame(key)) {
        case this._NOT_FOUND:
            break;
        case this._BEFORE_FIRST:
            break; // time delay before interpolation begins
        case this._AFTER_LAST:
            this._outputValue = this._values[this._values.length - 1];
            break;
        case this._FOUND:
            this._outputValue = this._interpolate((key));
            break;
        default:
            break;
    }
};

// @private
SceneJS.ScalarInterpolator.prototype._init = function(params) {

    /* Name of input property in data scope
     */
    if (!params.input) {
        SceneJS_errorModule.fatalError(
                new SceneJS.NodeConfigExpectedException(
                        "SceneJS.ScalarInterpolator config property expected: input"));
    }
    this._input = params.input;

    /* Name of output property on child data scope
     */
    if (!params.output) {
        SceneJS_errorModule.fatalError(
                new SceneJS.NodeConfigExpectedException(
                        "SceneJS.ScalarInterpolator config property expected: output"));
    }
    this._output = params.output;
    this._outputValue = null;

    /* Keys and values
     */
    if (params.keys) {
        if (!params.values) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration incomplete: " +
                            "keys supplied but no values - must supply a value for each key"));
        }
    } else if (params.values) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException(
                        "SceneJS.ScalarInterpolator configuration incomplete: " +
                        "values supplied but no keys - must supply a key for each value"));
    }
    for (var i = 1; i < params.keys.length; i++) {
        if (params.keys[i - 1] >= params.keys[i]) {
            SceneJS_errorModule.fatalError(
                    new SceneJS.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration invalid: " +
                            "two invalid keys found ("
                                    + i - 1 + " and " + i + ") - key list should contain distinct values in ascending order"));
        }
    }
    this._keys = params.keys;
    this._values = params.values;
    this._key1 = 0;
    this._key2 = 1;

    /* Interpolation type
     */
    params.type = params.type || 'linear';
    switch (params.type) {
        case 'linear':
            break;
        case 'constant':
            break;
        case 'cosine':
            break;
        case 'cubic':
            if (params.keys.length < 4) {
                SceneJS_errorModule.fatalError(
                        new SceneJS.InvalidNodeConfigException(
                                "SceneJS.ScalarInterpolator configuration invalid: minimum of four keyframes " +
                                "required for cubic - only "
                                        + params.keys.length
                                        + " are specified"));
            }
            break;
        default:
            SceneJS_errorModule.fatalError(
                    new SceneJS.InvalidNodeConfigException(
                            "SceneJS.ScalarInterpolator configuration invalid:  type not supported - " +
                            "only 'linear', 'cosine', 'cubic' and 'constant' are supported"));
        /*


         case 'hermite':
         break;
         */
    }
    this._type = params.type;
};

// @private
SceneJS.ScalarInterpolator.prototype._render = function(traversalContext, data) {
    if (!this.type) {
        /* Allow one-shot dynamic config
         */
        this._init(this._getParams(data));
    }
    var key = data.get(this._input);
    if (key == undefined || key == null) {
        SceneJS_errorModule.fatalError(
                new SceneJS.DataExpectedException(
                        "SceneJS.ScalarInterpolator failed to find input on data: '" + params.input + "'"));
    }
    this._update(key);
    var obj = {};
    obj[this._output] = this._outputValue;
    this._renderNodes(traversalContext, new SceneJS.Data(data, false, obj));
};


/** Returns a new SceneJS.ScalarInterpolator instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.ScalarInterpolator constructor
 * @returns {SceneJS.objects.ScalarInterpolator}
 */
SceneJS.scalarInterpolator = function() {
    var n = new SceneJS.ScalarInterpolator();
    SceneJS.ScalarInterpolator.prototype.constructor.apply(n, arguments);
    return n;
};





/**
 * @class A scene node that creates data in a scope for its subgraph.
 * @extends SceneJS.Node
 * <p>This node provides a simple yet flexible mechanism for passing data down into a scene graph at runtime, analogous to
 * creation of a closure's data scope in JavaScript .</p>.
 * <p>The data scope is implemented by a SceneJS.Data instance. On each render a SceneJS.Scene creates a global
 * SceneJS.Data populated with any properties that were given to the SceneJS.Scene's render method. That Data forms a
 * chain on which SceneJS.With nodes will push and pop as they are visited and departed from during scene traversal.</p>
 * <p>When some node, or node config callback, looks for a property on its local SceneJS.Data, it will hunt up the chain
 * to get the first occurance of that property it finds.</p>
 * <p><b>Example:</b></p><p>Creating data for a child SceneJS.Scale node, which has a callback to configure itself from
 * the data:</b></p><pre><code>
 * var wd = new SceneJS.WithData({
 *         sizeX: 5,
 *         sizeY: 10,
 *         sizeZ: 2
 *      },
 *      new SceneJS.Translate({ x: 100 },
 *
 *          new SceneJS.Scale(function(data) {        // Function in this case, instead of a config object
 *                   return {
 *                       x: data.get("sizeX"),
 *                       y: data.get("sizeY"),
 *                       z: data.get("sizeZ")
 *                   }
 *          },
 *
 *              new SceneJS.objects.Cube()
 *          )
 *      )
 *  )
 *
 * </code></pre>
 * @constructor
 * Create a new SceneJS.WithData
 * @param {Object} config The config object, followed by zero or more child nodes
 *
 */
SceneJS.WithData = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "withData";
    this._data = {};
    this._childData = {};
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.WithData, SceneJS.Node);

/**
 Sets a property
 @param {String} key Name of property
 @param {Object} value Value of property
 @returns {SceneJS.WithData} this
 */
SceneJS.WithData.prototype.setProperty = function(key, value) {
    this._data[key] = value;
    this._memoLevel = 0;
    return this;
};

/**
 * Returns the value of a property
 *
 * @param {String} key Name of property
 * @returns {Object} Value of property
 */
SceneJS.WithData.prototype.getProperty = function(key) {
    return this._data[key];
};


/** Clears all properties
 *@returns {SceneJS.WithData} this
 */
SceneJS.WithData.prototype.clearProperties = function() {
    this._data = {};
    this._memoLevel = 0;
    return this;
};

SceneJS.WithData.prototype._init = function(params) {
    for (var key in params) {
        this._data[key] = params[key];
    }
};

SceneJS.WithData.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    if (this._memoLevel < 2) {
        if (this._memoLevel == 1 && data.isFixed()) {
            this._memoLevel = 2;
        }
    }
    this._renderNodes(traversalContext, new SceneJS.Data(data, this._fixedParams, this._data));
};

/** Function wrapper to support functional scene definition
 */
SceneJS.withData = function() {
    var n = new SceneJS.WithData();
    SceneJS.WithData.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 *  @class A scene node that performs procedural scene generation by causing its child nodes to be rendered multiple times
 * in a loop within a scene traversal, while varying the data available to them in each loop.
 *
 *  <p>Each time a SceneJS.Generator loops over its children it creates a child data scope for them from the result of its
 *  configuration callback function, then repeats the process as long as the function returns something.</p>
 *
 *  <p>This node type must be configured dynamically therefore, in the SceneJS style, with a configuration function.</p>
 *
 *  <p>This node type is useful for procedurally generating scene subtrees. Its most common application would be
 *  to dynamically instance elements of primitive geometry to build complex objects.</p>
 *
 *  <p>Note that generator nodes can have a negative impact on performance, where they will often prevent subnodes from
 *  employing memoization strategies that fast scene graphs often depend upon. Use them carefully when high performance
 *  is desired in large scenes. The impact will depend on the type of subnode that receives the generated data.
 *  For example, inability to memoize will cascade downwards through  modelling transform node hierarchies since they
 *  will have to re-multiply matrices by dynamic parent modelling transforms etc.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/c9ySdG">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Below is a SceneJS.Generator that loops over its subgraph to create a ring of cubes, 45 degrees apart.</b></p><pre><code>
 * var g = new SceneJS.Generator(
 *        (function() {                        // Higher order function tracks the angle in closure
 *            var angle = 0;
 *            return function() {              // Generator function
 *                angle += 45.0;
 *                if (angle <= 360.0) {
 *                    return { angle: angle }; // Angle still less than 360, return config object
 *                } else {  // Reset the generator
 *                    angle = 0;               // Angle at max, reset and return nothing,
 *                }                            // causing loop to finish for this frame
 *            };
 *        })(),
 *
 *        new SceneJS.Rotate(function(data) {
 *            return { angle : data.get("angle"), y: 1.0 };
 *        },
 *                new SceneJS.Translate(function(data) {
 *                    return { x: 10.0 };
 *                },
 *
 *                new SceneJS.objects.cube()
 *            )
 *         )
 *   );
 *  </pre></code>
 *  @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Generator
 * @param {Object} func  Config function, followed by one or more child nodes
 */

SceneJS.Generator = function(cfg) {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "generator";
};

SceneJS._inherit(SceneJS.Generator, SceneJS.Node);

// @private
SceneJS.Generator.prototype._render = function(traversalContext, data) {
    if (this._fixedParams) {
        SceneJS_errorModule.fatalError(
                new SceneJS.InvalidNodeConfigException
                        ("SceneJS.Generator may only be configured with a function"));
    }
    var params = this._getParams(data);
    while (params) {
        this._renderNodes(traversalContext, new SceneJS.Data(data, false, params));
        params = this._getParams(data);
    }
};

/** Returns a new SceneJS.Generator instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Generator constructor
 * @returns {SceneJS.Generator}
 */
SceneJS.generator = function() {
    var n = new SceneJS.Generator();
    SceneJS.Generator.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that maintains a model-space viewing frustum computed from the current viewport and projection
 * and view transform matrices.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the viewport and matrices through incoming VIEWPORT_UPDATED, PROJECTION_TRANSFORM_UPDATED and
 * VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the frustum on demand, caching it until any of the viewport or matrices is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes against the frustum,
 * eg. to query their intersection or projected size.
 *  @private
 *
 */
var SceneJS_frustumModule = new (function() {

    var viewport;
    var projMat;
    var viewMat;
    var frustum;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                projMat = viewMat = SceneJS_math_identityMat4();
                viewport = [0,0,1,1];
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEWPORT_UPDATED,
            function(v) {
                viewport = [v.x, v.y, v.width, v.height];
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(params) {
                projMat = params.matrix;
                frustum = null;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
                frustum = null;
            });

    /**
     * @private
     */
    var getFrustum = function() {
        if (!frustum) {
            frustum = new SceneJS_math_Frustum(viewMat, projMat, viewport);
        }
        return frustum;
    };

    /**
     * Tests the given axis-aligned box for intersection with the frustum
     * @private
     * @param box
     */
    this.testAxisBoxIntersection = function(box) {
        return getFrustum().textAxisBoxIntersection(box);
    };

    /**
     * Returns the projected size of the given axis-aligned box with respect to the frustum
     * @private
     * @param box
     */
    this.getProjectedSize = function(box) {
        return getFrustum().getProjectedSize(box);
    };
})();
/**
 * Backend that maintains a model-space sphere centered about the current eye position, computed from the
 * current view transform matrix.
 *
 * Services queries on it from scene nodes (ie. intersections etc.).
 *
 * Tracks the matrix through incoming VIEW_TRANSFORM_UPDATED events.
 *
 * Lazy-computes the sphere on demand, caching it until the matrix is updated.
 *
 * Provides an interface through which scene nodes can test axis-aligned bounding boxes for intersection
 * with the sphere.
 *
 * @private
 */
var SceneJS_localityModule = new (function() {

    var eye;
    var radii;
    var radii2;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                eye = { x: 0, y: 0, z: 0 };
                radii = {
                    inner : 100000,
                    outer : 200000
                };
                radii2 = {
                    inner : radii.inner * radii.inner,
                    outer : radii.outer * radii.outer
                };
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.VIEW_TRANSFORM_UPDATED,
            function(transform) {
                if (transform.lookAt) {
                    var e = transform.lookAt.eye;
                    eye = [e.x, e.y, e.z];
                } else {
                    eye = [0,0,0];
                }
            });

    /**
     * @private
     */
    function intersects(radius2, box) { // Simple Arvo method - TODO: Larsson-Arkenine-Moller-Lengyel method
        var dmin = 0;
        var e;
        for (var i = 0; i < 3; i++) {
            if (eye[i] < box.min[i]) {
                e = eye[i] - box.min[i];
                dmin += (e * e);
            } else {
                if (eye[i] > box.max[i]) {
                    e = eye[i] - box.max[i];
                    dmin += (e * e);
                }
            }
        }
        return (dmin <= radius2);
    }

    /** Sets radii of inner and outer locality spheres
     * @private
     */
    this.setRadii = function(r) {
        radii = {
            outer : r.inner,
            inner : r.outer
        };
        radii2 = {
            inner : r.inner * r.inner,
            outer : r.outer * r.outer
        };
    };

    /** Returns current inner and ouer sphere radii
     * @private
     */
    this.getRadii = function() {
        return radii;
    };

    /** Tests the given axis-aligned bounding box for intersection with the outer locality sphere
     *
     * @param box
     * @private
     */
    this.testAxisBoxIntersectOuterRadius = function(box) {
        return intersects(radii2.outer, box);
    };

    /** Tests the given axis-aligned bounding box for intersection with the inner locality sphere
     *
     * @param box
     * @private
     */
    this.testAxisBoxIntersectInnerRadius = function(box) {
        return intersects(radii2.inner, box);
    };
})();
/**
 * @class A scene node that specifies the spatial boundaries of scene graph subtrees to support visibility and
 * level-of-detail culling.
 *
 * <p>The subgraphs of these are only traversed when the boundary intersect the current view frustum. When this node
 * is within the subgraph of a SceneJS.Locality node, it the boundary must also intersect the inner radius of the Locality.
 * the outer radius of the Locality is used internally by SceneJS to support content staging strategies.</p> 
 *  
 * <p>When configured with a projected size threshold for each child, they can also function as level-of-detail (LOD) selectors.</p>
 * <p><b>Live Demo</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/scenejs-lod-boundingbox-example">Level of Detail Example</a></li></ul>
 *  <p><b>Example 1.</b></p><p>This BoundingBox is configured to work as a level-of-detail selector. The 'levels'
 * property specifies thresholds for the boundary's projected size, each corresponding to one of the node's children,
 * such that the child corresponding to the threshold imediately below the boundary's current projected size is only one
 * currently traversable.</p><p>This boundingBox will select exactly one of its child nodes to render for its current projected size, where the
 * levels parameter specifies for each child the size threshold above which the child becomes selected. No child is
 * selected (nothing is drawn) when the projected size is below the lowest level.</p>
 * <pre><code>
 * var bb = new SceneJS.BoundingBox({
 *          xmin: -2,
 *          ymin: -2,
 *          zmin: -2,
 *          xmax:  2,
 *          ymax:  2,
 *          zmax:  2,
 *
 *           // Levels are optional - acts as regular
 *          // frustum-culling bounding box when not specified
 *
 *          levels: [
 *             10,
 *             200,
 *             400,
 *             600
 *         ]
 *     },
 *
 *     // When size > 10px, draw a cube
 *
 *     new SceneJS.objects.Cube(),
 *
 *     // When size > 200px,  draw a low-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:10,
 *         rings:10
 *     }),
 *
 *     // When size > 400px, draw a medium-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:20,
 *         rings:20
 *     }),
 *
 *     // When size > 600px, draw a high-detail sphere
 *
 *     new SceneJS.objects.Sphere({
 *         radius: 1,
 *         slices:120,
 *         rings:120
 *     })
 * )
 * </code></pre>
 * @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.boundingBox
 * @param {Object} config Configuration object, followed by zero or more child nodes
 */
SceneJS.BoundingBox = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType="boundingBox";
    this._xmin = 0;
    this._ymin = 0;
    this._zmin = 0;
    this._xmax = 0;
    this._ymax = 0;
    this._zmax = 0;
    this._levels = null;
    this._states = [];
    this._objectsCoords = null;  // Six object-space vertices for memo level 1
    this._viewBox = null;         // Axis-aligned view-space box for memo level 2
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.BoundingBox, SceneJS.Node);

/**
 * Sets the minimum X extent
 *
 * @function {SceneJS.BoundingBox} setXMin
 * @param {float} xmin Minimum X extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setXMin = function(xmin) {
    this._xmin = xmin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum X extent
 *
 * @function {float} getXMin
 * @returns {float} Minimum X extent
 */
SceneJS.BoundingBox.prototype.getXMin = function() {
    return this._xmin;
};

/**
 * Sets the minimum Y extent
 *
 * @function  {SceneJS.BoundingBox} setYMin
 * @param {float} ymin Minimum Y extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setYMin = function(ymin) {
    this._ymin = ymin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Y extent
 * @function {float} getYMin
 * @returns {float} Minimum Y extent
 */
SceneJS.BoundingBox.prototype.getYMin = function() {
    return this._ymin;
};

/**
 * Sets the minimum Z extent
 *
 * @function {SceneJS.BoundingBox} setZMin
 * @param {float} zmin Minimum Z extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setZMin = function(zmin) {
    this._zmin = zmin;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the minimum Z extent
 * @function {float} getZMin
 * @returns {float} Minimum Z extent
 */
SceneJS.BoundingBox.prototype.getZMin = function() {
    return this._zmin;
};

/**
 * Sets the maximum X extent
 *
 * @function  {SceneJS.BoundingBox} setXMax
 * @param {float} xmax Maximum X extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setXMax = function(xmax) {
    this._xmax = xmax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum X extent
 * @function  {SceneJS.BoundingBox} setXMax
 * @returns {float} Maximum X extent
 */
SceneJS.BoundingBox.prototype.getXMax = function() {
    return this._xmax;
};

/**
 * Sets the maximum Y extent
 *
 * @function {SceneJS.BoundingBox} setYMax
 * @param {float} ymax Maximum Y extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setYMax = function(ymax) {
    this._ymax = ymax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Y extent
 * @function {float} getYMax
 * @return {float} Maximum Y extent
 */
SceneJS.BoundingBox.prototype.getYMax = function() {
    return this._ymax;
};

/**
 * Sets the maximum Z extent
 *
 * @function {SceneJS.BoundingBox} setZMax
 * @param {float} zmax Maximum Z extent
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setZMax = function(zmax) {
    this._zmax = zmax;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets the maximum Z extent
 * @function {float} getZMax
 * @returns {float} Maximum Z extent
 */
SceneJS.BoundingBox.prototype.getZMax = function() {
    return this._zmax;
};

/**
 * Sets all extents
 * @function {SceneJS.BoundingBox} setBoundary
 * @param {Object} boundary All extents, Eg. { xmin: -1.0, ymin: -1.0, zmin: -1.0, xmax: 1.0, ymax: 1.0, zmax: 1.0}
 * @returns {SceneJS.BoundingBox} this
 */
SceneJS.BoundingBox.prototype.setBoundary = function(boundary) {
    this._xmin = boundary.xmin || 0;
    this._ymin = boundary.ymin || 0;
    this._zmin = boundary.zmin || 0;
    this._xmax = boundary.xmax || 0;
    this._ymax = boundary.ymax || 0;
    this._zmax = boundary.zmax || 0;
    this._memoLevel = 0;
    return this;
};

/**
 * Gets all extents
 * @function {Object} getBoundary
 * @returns {Object} All extents, Eg. { xmin: -1.0, ymin: -1.0, zmin: -1.0, xmax: 1.0, ymax: 1.0, zmax: 1.0}
 */
SceneJS.BoundingBox.prototype.getBoundary = function() {
    return {
        xmin: this._xmin,
        ymin: this._ymin,
        zmin: this._zmin,
        xmax: this._xmax,
        ymax: this._ymax,
        zmax: this._zmax
    };
};

// @private
SceneJS.BoundingBox.prototype._init = function(params) {
    this._xmin = params.xmin || 0;
    this._ymin = params.ymin || 0;
    this._zmin = params.zmin || 0;
    this._xmax = params.xmax || 0;
    this._ymax = params.ymax || 0;
    this._zmax = params.zmax || 0;
    if (params.levels) {
        if (params.levels.length != this._children.length) {
            SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                    ("SceneJS.boundingBox levels property should have a value for each child node"));
        }

        for (var i = 1; i < params.levels.length; i++) {
            if (params.levels[i - 1] >= params.levels[i]) {
                SceneJS_errorModule.fatalError(new SceneJS.NodeConfigExpectedException
                        ("SceneJS.boundingBox levels property should be an ascending list of unique values"));
            }
        }
        this._levels = params.levels;
    }
};

// @private
SceneJS.BoundingBox.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
        var modelTransform = SceneJS_modelTransformModule.getTransform();
        if (!modelTransform.identity) {

            /* Model transform exists
             */
            this._objectCoords = [
                [this._xmin, this._ymin, this._zmin],
                [this._xmax, this._ymin, this._zmin],
                [this._xmax, this._ymax, this._zmin],
                [this._xmin, this._ymax, this._zmin],
                [this._xmin, this._ymin, this._zmax],
                [this._xmax, this._ymin, this._zmax],
                [this._xmax, this._ymax, this._zmax],
                [this._xmin, this._ymax, this._zmax]
            ];
        } else {

            /* No model transform
             */
            this._viewBox = {
                min: [this._xmin, this._ymin, this._zmin],
                max: [this._xmax, this._ymax, this._zmax]
            };
            this._memoLevel = 2;
        }
    }

    if (this._memoLevel < 2) {
        var modelTransform = SceneJS_modelTransformModule.getTransform();
        this._viewBox = new SceneJS_math_Box3().fromPoints(
                SceneJS_math_transformPoints3(
                        modelTransform.matrix,
                        this._objectCoords)
                );
        if (modelTransform.fixed && this._memoLevel == 1) {
            this._objectCoords = null;
            this._memoLevel = 2;
        }
    }
    if (SceneJS_localityModule.testAxisBoxIntersectOuterRadius(this._viewBox)) {
        if (SceneJS_localityModule.testAxisBoxIntersectInnerRadius(this._viewBox)) {
            var result = SceneJS_frustumModule.testAxisBoxIntersection(this._viewBox);
            switch (result) {
                case SceneJS_math_INTERSECT_FRUSTUM:  // TODO: GL clipping hints
                case SceneJS_math_INSIDE_FRUSTUM:
                    if (this._levels) { // Level-of-detail mode
                        var size = SceneJS_frustumModule.getProjectedSize(this._viewBox);
                        for (var i = this._levels.length - 1; i >= 0; i--) {
                            if (this._levels[i] <= size) {
                                var state = this._states[i];
                                this._renderNode(i, traversalContext, data);
                                return;
                            }
                        }
                    } else {
                        this._renderNodes(traversalContext, data);
                    }
                    break;

                case SceneJS_math_OUTSIDE_FRUSTUM:
                    break;
            }
        } else {

            /* Allow content staging for subgraph
             */

            // TODO:

            this._renderNodes(traversalContext, data);
        }
    }
};

/** Returns a new SceneJS.BoundingBox instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.BoundingBox constructor
 * @returns {SceneJS.BoundingBox}
 */
SceneJS.boundingBox = function() {
    var n = new SceneJS.BoundingBox();
    SceneJS.BoundingBox.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 *@class A scene node that defines inner and outer spheres of locality centered about the viewpoint.
 *<p>The subgraphs of contained SceneJS.BoundingBox nodes will only be rendered when their boundaries intersect
 *the inner radius.</p><p>The outer radius is used internally by SceneJS to support content staging strategies.</p> 
 *<p>You can have as many of these as neccessary throughout your scene.</p>
 * <p>When you don't specify a Locality node, SceneJS has default inner and outer radii of 100000
 * and 200000, respectively.</p>
 *<p><b>Example:</b></p><p>Defining a locality</b></p><pre><code>
 *  var locality = new SceneJS.Locality({
 *      inner: 100000,  // Default node values, override these where needed
 *      outer: 200000
 *      },
 *
 *      // ... child nodes containing SceneJS.BoundingBox nodes ...
 *  )
 *</pre></code>
 *  @extends SceneJS.Node
 *@constructor
 *Create a new SceneJS.Locality
 * @param {Object} cfg  Config object or function, followed by zero or more child nodes
 */
SceneJS.Locality = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "locality";
    this._radii = {
        inner : 100000,
        outer : 200000
    };
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Locality, SceneJS.Node);

/**
 Sets the inner radius
 @function setInner
 @param {double} inner
 @returns {SceneJS.Locality} this
 */
SceneJS.Locality.prototype.setInner = function(inner) {
    this._radii.inner = inner;
    return this;
};

/**
 Returns the inner radius
 @function {double} getInner
 @returns {double} Inner radius
 */
SceneJS.Locality.prototype.getInner = function() {
    return this._radii.inner;
};

/**
 Sets the outer radius
 @function setOuter
 @param {int} outer
 @returns {SceneJS.Locality} this
 */
SceneJS.Locality.prototype.setOuter = function(outer) {
    this._radii.outer = outer;
    return this;
};

/**
 Returns the outer radius
 @function {double} getOuter
 @returns {double} Outer radius
 */
SceneJS.Locality.prototype.getOuter = function() {
    return this._radii.outer;
};

// @private
SceneJS.Locality.prototype._init = function(params) {
    if (params.inner) {
        this.setInner(params.inner);
    }
    if (params.outer) {
        this.setOuter(params.outer);
    }
};

// @private
SceneJS.Locality.prototype._render = function(traversalContext, data) {
    if (!this._fixedParams) {
        this._init(this._getParams(data));
    }
    var prevRadii = SceneJS_localityModule.getRadii();
    SceneJS_localityModule.setRadii(this._radii);
    this._renderNodes(traversalContext, data);
    SceneJS_localityModule.setRadii(prevRadii);
};

/** Returns a new SceneJS.Locality instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Locality constructor
 * @returns {SceneJS.Locality}
 */
SceneJS.locality = function() {
    var n = new SceneJS.Locality();
    SceneJS.Locality.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that manages material texture layers.
 *
 * Manages asynchronous load of texture images.
 *
 * Caches textures with a least-recently-used eviction policy.
 *
 * Holds currently-applied textures as "layers". Each layer specifies a texture and a set of parameters for
 * how the texture is to be applied, ie. to modulate ambient, diffuse, specular material colors, geometry normals etc.
 *
 * Holds the layers on a stack and provides the SceneJS.texture node with methods to push and pop them.
 *
 * Interacts with the shading backend through events; on a SHADER_RENDERING event it will respond with a
 * TEXTURES_EXPORTED to pass the entire layer stack to the shading backend.
 *
 * Avoids redundant export of the layers with a dirty flag; they are only exported when that is set, which occurs
 * when the stack is pushed or popped by the texture node, or on SCENE_ACTIVATED, SHADER_ACTIVATED and
 * SHADER_DEACTIVATED events.
 *
 * Whenever a texture node pushes or pops the stack, this backend publishes it with a TEXTURES_UPDATED to allow other
 * dependent backends to synchronise their resources.
 *
 *  @private
 */
var SceneJS_textureModule = new (function() {

    var time = (new Date()).getTime();      // Current system time for LRU caching
    var canvas;
    var textures = {};
    var layerStack = [];
    var dirty;

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.TIME_UPDATED,
            function(t) {
                time = t;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                layerStack = [];
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_ACTIVATED,
            function(c) {
                canvas = c;
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.CANVAS_DEACTIVATED,
            function() {
                canvas = null;
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.TEXTURES_EXPORTED,
                            layerStack
                            );
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /** Removes texture from shader (if canvas exists in DOM) and deregisters it from backend
     * @private
     */
    function deleteTexture(texture) {
        textures[texture.textureId] = undefined;
        if (document.getElementById(texture.canvas.canvasId)) {
            texture.destroy();
        }
    }

    /**
     * Deletes all textures from their GL contexts - does not attempt
     * to delete them when their canvases no longer exist in the DOM.
     * @private
     */
    function deleteTextures() {
        for (var textureId in textures) {
            var texture = textures[textureId];
            deleteTexture(texture);
        }
        textures = {};
        layerStack = [];
        dirty = true;
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.RESET, // Framework reset - delete textures
            function() {
                deleteTextures();
            });

    /**
     * Registers this backend module with the memory management module as willing
     * to attempt to destroy a texture when asked, in order to free up memory. Eviction
     * is done on a least-recently-used basis, where a texture may be evicted if the
     * time that it was last used is the earliest among all textures, and after the current
     * system time. Since system time is updated just before scene traversal, this ensures that
     * textures previously or currently active during this traversal are not suddenly evicted.
     */
    SceneJS_memoryModule.registerEvictor(
            function() {
                var earliest = time; // Doesn't evict textures that are current in layers
                var evictee;
                for (var id in textures) {
                    if (id) {
                        var texture = textures[id];
                        if (texture.lastUsed < earliest) {
                            evictee = texture;
                            earliest = texture.lastUsed;
                        }
                    }
                }
                if (evictee) { // Delete LRU texture
                    SceneJS_loggingModule.info("Evicting texture: " + id);
                    deleteTexture(evictee);
                    return true;
                }
                return false;   // Couldnt find suitable evictee
            });

    /**
     * Translates a SceneJS param value to a WebGL enum value,
     * or to default if undefined. Throws exception when defined
     * but not mapped to an enum.
     * @private
     */
    function getGLOption(name, context, cfg, defaultVal) {
        var value = cfg[name];
        if (value == undefined) {
            return defaultVal;
        }
        var glName = SceneJS_webgl_enumMap[value];
        if (glName == undefined) {
            SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                    "Unrecognised value for SceneJS.texture node property '" + name + "' value: '" + value + "'"));
        }
        var glValue = context[glName];
        //                if (!glValue) {
        //                    throw new SceneJS.WebGLUnsupportedNodeConfigException(
        //                            "This browser's WebGL does not support value of SceneJS.texture node property '" + name + "' value: '" + value + "'");
        //                }
        return glValue;
    }

    /** Returns default value for when given value is undefined
     * @private
     */
    function getOption(value, defaultVal) {
        return (value == undefined) ? defaultVal : value;
    }


    /** Verifies that texture still cached - it may have been evicted after lack of recent use,
     * in which case client texture node will have to recreate it.
     * @private
     */
    this.textureExists = function(texture) {
        return textures[texture.textureId];
    };

    /**
     * Starts load of texture image
     *
     * @private
     * @param uri Image location
     * @param onSuccess Callback returns image on success
     * @param onError Callback fired on failure
     * @param onAbort Callback fired when load aborted, eg. user hits "stop" button in browser
     */
    this.loadImage = function(uri, onSuccess, onError, onAbort) {
        var image = new Image();
        image.onload = function() {
            onSuccess(image);
        };
        image.onerror = function() {
            onError();
        };
        image.onabort = function() {
            onAbort();
        };
        image.src = uri;  // Starts image load
        return image;
    };

    /**
     * Creates and returns a new texture, or re-uses existing one if possible
     * @private
     */
    this.createTexture = function(image, cfg) {
        if (!canvas) {
            SceneJS_errorModule.fatalError(new SceneJS.NoCanvasActiveException("No canvas active"));
        }
        var context = canvas.context;
        var textureId = SceneJS._createKeyForMap(textures, "tex");

        SceneJS_memoryModule.allocate(
                "texture '" + textureId + "'",
                function() {
                    textures[textureId] = new SceneJS_webgl_Texture2D(context, {
                        textureId : textureId,
                        canvas: canvas,
                        image : image,
                        texels :cfg.texels,
                        minFilter : getGLOption("minFilter", context, cfg, context.LINEAR),
                        magFilter :  getGLOption("magFilter", context, cfg, context.LINEAR),
                        wrapS : getGLOption("wrapS", context, cfg, context.CLAMP_TO_EDGE),
                        wrapT :   getGLOption("wrapT", context, cfg, context.CLAMP_TO_EDGE),
                        isDepth :  getOption(cfg.isDepth, false),
                        depthMode : getGLOption("depthMode", context, cfg, context.LUMINANCE),
                        depthCompareMode : getGLOption("depthCompareMode", context, cfg, context.COMPARE_R_TO_TEXTURE),
                        depthCompareFunc : getGLOption("depthCompareFunc", context, cfg, context.LEQUAL),
                        flipY : getOption(cfg.flipY, true),
                        width: getOption(cfg.width, 1),
                        height: getOption(cfg.height, 1),
                        internalFormat : getGLOption("internalFormat", context, cfg, context.LEQUAL),
                        sourceFormat : getGLOption("sourceType", context, cfg, context.ALPHA),
                        sourceType : getGLOption("sourceType", context, cfg, context.UNSIGNED_BYTE),
                        logging: SceneJS_loggingModule
                    });
                });
        //   SceneJS_loggingModule.info("texture created: '" + textureId + "'");
        return textures[textureId];
    };

    // @private
    this.pushLayer = function(texture, params) {
        if (!textures[texture.textureId]) {
            SceneJS_errorModule.fatalError("No such texture loaded \"" + texture.textureId + "\"");
        }
        texture.lastUsed = time;

        if (params.matrix && !params.matrixAsArray) {
            params.matrixAsArray = new WebGLFloatArray(params.matrix);
        }
        layerStack.push({
            texture: texture,
            params: params
        });
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.TEXTURES_UPDATED, layerStack);
    };

    // @private
    this.popLayers = function(nLayers) {
        for (var i = 0; i < nLayers; i++) {
            layerStack.pop();
        }
        dirty = true;
        SceneJS_eventModule.fireEvent(SceneJS_eventModule.TEXTURES_UPDATED, layerStack);
    };
})();
/**
 @class A layer within a SceneJS.Texture node.

 @constructor
 Create a new SceneJS.TextureLayer
 @param {Object} cfg The config object
 */
SceneJS.TextureLayer = function(cfg) {
        this._imageURL = null;
        this._minFilter = "linear";
        this._magFilter = "linear";
        this._wrapS = "clampToEdge";
        this._wrapT = "clampToEdge";
        this._isDepth = false;
        this._depthMode = "luminance";
        this._depthCompareMode = "compareRToTexture";
        this._depthCompareFunc = "lequal";
        this._flipY = true;
        this._width = 1;
        this._height = 1;
        this._internalFormat = "alpha";
        this._sourceFormat = "alpha";
        this._sourceType = "unsignedByte";
        this._dirty = true; // Needs recreate when this is dirty        
};


/**
 * @class A scene node that defines one or more layers of texture to apply to all geometries within its subgraph that have UV coordinates.
 * @extends SceneJS.node
 * <p>Texture layers are applied to specified material reflection cooficients, and may be transformed.</p>
 * <p><b>Live Examples</b></p>
 * <li><a target = "other" href="http://bit.ly/scenejs-animated-texture">Animated Texture</a></li>
 * </ul>
 * <p>A cube wrapped with a material which specifies its base (diffuse) color coefficient, and a texture with
 * one layer which applies a texture image to that particular coefficient. The texture is also translated, scaled and
 * rotated, in that order. All the texture properties are specified here to show what they are. </p>
 *  <pre><code>
 * var subGraph =
 *       new SceneJS.Material({
 *           baseColor: { r: 1.0, g: 1.0, b: 1.0 }
 *       },
 *               new SceneJS.Texture({
 *                   layers: [
 *                       {
 *                           // Only the image URI is mandatory:
 *
 *                           uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
 *
 *                          // Optional params:
 *
 *                           minFilter: "linear",                   // Options are ”nearest”, “linear” (default), “nearestMipMapNearest”,
 *                                                                  //        ”nearestMipMapLinear” or “linearMipMapLinear”
 *                           magFilter: "linear",                   // Options are “nearest” or “linear” (default)
 *                           wrapS: "repeat",                       // Options are “clampToEdge” (default) or “repeat”
 *                           wrapT: "repeat",                       // Options are "clampToEdge” (default) or “repeat”
 *                           isDepth: false,                        // Options are false (default) or true
 *                           depthMode:"luminance"                  // (default)
 *                           depthCompareMode: "compareRToTexture", // (default)
 *                           depthCompareFunc: "lequal",            // (default)
 *                           flipY: false,                          // Options are true (default) or false
 *                           width: 1,
 *                           height: 1,
 *                           internalFormat:"lequal",               // (default)
 *                           sourceFormat:"alpha",                  // (default)
 *                           sourceType: "unsignedByte",            // (default)
 *                           applyTo:"baseColor",                   // Options so far are “baseColor” (default) or “diffuseColor”
 *
 *                           // Optional transforms - these can also be functions, as shown in the next example
 *
 *                           rotate: {      // Currently textures are 2-D, so only rotation about Z makes sense
 *                               z: 45.0
 *                           },
 *
 *                           translate : {
 *                               x: 10,
 *                               y: 0,
 *                               z: 0
 *                           },
 *
 *                           scale : {
 *                               x: 1,
 *                               y: 2,
 *                               z: 1
 *                           }
 *                       }
 *                   ]
 *               },
 *
 *               new SceneJS.objects.Cube()
 *           )
 *     );
 *  </code></pre>
 *
 * <p><b>Example 2</b></p>
 * <p>You can animate texture transformations - this example shows how the rotate, scale and translate properties
 * can be functions to take their values from the data scope, in this case created by a higher WithData node:</p>
 *  <pre><code>
 * var subGraph =
 *       new SceneJS.WithData({
 *           angle: 45.0   // Vary this value to rotate the texture
 *       },
 *               new SceneJS.Texture({
 *                   layers: [
 *                       {
 *                           uri:"http://scenejs.org/library/textures/misc/general-zod.jpg",
 *
 *                           rotate: function(data) {
 *                               return { z: data.get("angle") }
 *                           }
 *                       }
 *                   ]
 *               },
 *               new SceneJS.objects.Cube()
 *         )
 *   );
 *  </code></pre>
 * @constructor
 * Create a new SceneJS.texture
 * @param {Object} The config object or function, followed by zero or more child nodes
 */
SceneJS.Texture = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "texture";
    this._layers = null;
};

SceneJS._inherit(SceneJS.Texture, SceneJS.Node);

// @private
SceneJS.Texture.prototype._getMatrix = function(translate, rotate, scale) {
    var matrix = null;
    var t;
    if (translate) {
        matrix = SceneJS_math_translationMat4v([ translate.x || 0, translate.y || 0, translate.z || 0]);
    }
    if (scale) {
        t = SceneJS_math_scalingMat4v([ scale.x || 1, scale.y || 1, scale.z || 1]);
        matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
    }
    if (rotate) {
        if (rotate.x) {
            t = SceneJS_math_rotationMat4v(rotate.x * 0.0174532925, [1,0,0]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (rotate.y) {
            t = SceneJS_math_rotationMat4v(rotate.y * 0.0174532925, [0,1,0]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
        if (rotate.z) {
            t = SceneJS_math_rotationMat4v(rotate.z * 0.0174532925, [0,0,1]);
            matrix = matrix ? SceneJS_math_mulMat4(matrix, t) : t;
        }
    }
    return matrix;
};

SceneJS.Texture.prototype._STATE_INITIAL = 0;            // Ready to get texture
SceneJS.Texture.prototype._STATE_IMAGE_LOADING = 2;      // Texture image load in progress
SceneJS.Texture.prototype._STATE_IMAGE_LOADED = 3;       // Texture image load completed
SceneJS.Texture.prototype._STATE_TEXTURE_CREATED = 4;    // Texture created
SceneJS.Texture.prototype._STATE_ERROR = -1;             // Image load or texture creation failed

SceneJS.Texture.prototype._render = function(traversalContext, data) {
    if (!this._layers) { // One-shot dynamic config
        this._layers = [];
        var params = this._getParams(data);
        if (!params.layers) {
            throw new SceneJS.NodeConfigExpectedException(
                    "SceneJS.Texture.layers is undefined");
        }
        for (var i = 0; i < params.layers.length; i++) {
            var layerParam = params.layers[i];
            if (!layerParam.uri) {
                throw new SceneJS.NodeConfigExpectedException(
                        "SceneJS.Texture.layers[" + i + "].uri is undefined");
            }
            if (layerParam.applyFrom) {
                if (layerParam.applyFrom != "uv" &&
                    layerParam.applyFrom != "uv2" &&
                    layerParam.applyFrom != "normal" &&
                    layerParam.applyFrom != "geometry") {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.InvalidNodeConfigException(
                                    "SceneJS.Texture.layers[" + i + "].applyFrom value is unsupported - " +
                                    "should be either 'uv', 'uv2', 'normal' or 'geometry'"));
                }
            }
            if (layerParam.applyTo) {
                if (layerParam.applyTo != "baseColor" && // Colour map
                    layerParam.applyTo != "diffuseColor") {
                    SceneJS_errorModule.fatalError(
                            new SceneJS.InvalidNodeConfigException(
                                    "SceneJS.Texture.layers[" + i + "].applyTo value is unsupported - " +
                                    "should be either 'baseColor', 'diffuseColor'"));
                }
            }

            this._layers.push({
                state : this._STATE_INITIAL,
                process: null,                      // Image load process handle
                image : null,                       // Initialised when state == IMAGE_LOADED
                creationParams: layerParam,         // Create texture using this
                texture: null,                      // Initialised when state == TEXTURE_LOADED
                createMatrix : new (function() {
                    var translate = layerParam.translate;
                    var rotate = layerParam.rotate;
                    var scale = layerParam.scale;
                    var dynamic = ((translate instanceof Function) ||
                                   (rotate instanceof Function) ||
                                   (scale instanceof Function));
                    var defined = dynamic || translate || rotate || scale;
                    return function(data) {
                        var matrix = null;
                        if (defined && (dynamic || !matrix)) {
                            matrix = SceneJS.Texture.prototype._getMatrix(
                                    (translate instanceof Function) ? translate(data) : translate,
                                    (rotate instanceof Function) ? rotate(data) : rotate,
                                    (scale instanceof Function) ? scale(data) : scale);
                        }
                        return matrix;
                    };
                })(),
                applyFrom: layerParam.applyFrom || "uv",
                applyTo: layerParam.applyTo || "baseColor",
                blendMode: layerParam.blendMode || "multiply"
            });
        }
    }

    /* Update state of each texture layer and
     * count how many are created and ready to apply
     */
    var countLayersReady = 0;
    for (var i = 0; i < this._layers.length; i++) {
        var layer = this._layers[i];
        if (layer.state == this._STATE_TEXTURE_CREATED) {
            if (!SceneJS_textureModule.textureExists(layer.texture)) {  // Texture evicted from cache
                layer.state = this._STATE_INITIAL;
            }
        }
        switch (layer.state) {
            case this._STATE_TEXTURE_CREATED:
                countLayersReady++;
                break;

            case this._STATE_INITIAL:

                /* Start loading image - in a new closure so that the right layer gets the process result.
                 */
                (function(l) {
                    var _this = this;
                    l.state = this._STATE_IMAGE_LOADING;

                    /* Logging each image load slows things down a lot
                     */
                    // loggingBackend.getLogger().info("SceneJS.texture image loading: "
                    //  + _layer.creationParams.uri);

                    SceneJS_textureModule.loadImage(
                            l.creationParams.uri,
                            function(_image) {

                                /* Image loaded successfully. Note that this callback will
                                 * be called in the idle period between render traversals (ie. scheduled by a
                                 * setInterval), so we're not actually visiting this node at this point. We'll
                                 * defer creation and application of the texture to the subsequent visit.
                                 */
                                l.image = _image;
                                l.state = _this._STATE_IMAGE_LOADED;
                            },

                        /* General error, probably a 404
                         */
                            function() {
                                l.state = _this._STATE_ERROR;
                                var message = "SceneJS.texture image load failed: " + l.creationParams.uri;
                                SceneJS_loggingModule.getLogger().warn(message);

                                /* Currently recovering from failed texture load
                                 */

                               
                            },

                        /* Load aborted - eg. user stopped browser
                         */
                            function() {
                                SceneJS_loggingModule.getLogger().warn("SceneJS.texture image load aborted: " + l.creationParams.uri);
                                l.state = _this._STATE_ERROR;
                            });
                }).call(this, layer);
                break;

            case this._STATE_IMAGE_LOADING:

                /* Continue loading this texture layer
                 */
                break;

            case this._STATE_IMAGE_LOADED:

                /* Create this texture layer
                 */
                layer.texture = SceneJS_textureModule.createTexture(layer.image, layer.creationParams);
                layer.state = this._STATE_TEXTURE_CREATED;
                countLayersReady++;
                break;

            case this._STATE_ERROR:

                /* Give up on this texture layer, but we'll keep updating the others
                 * to at least allow diagnostics to log
                 */
                break;
        }
    }

    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if ((countLayersReady == this._layers.length)) { // All or none - saves on generating/destroying shaders
            var countPushed = 0;
            for (var i = 0; i < this._layers.length; i++) {
                var layer = this._layers[i];
              //   if (layer.state == this._STATE_TEXTURE_CREATED) {
                SceneJS_textureModule.pushLayer(layer.texture, {
                    applyFrom : layer.applyFrom,
                    applyTo : layer.applyTo,
                    blendMode : layer.blendMode,
                    matrix: layer.createMatrix(data)
                });
                countPushed++;
                }
           // }
            this._renderNodes(traversalContext, data);
            SceneJS_textureModule.popLayers(countPushed);
        }
    }
};


/** Function wrapper to support functional scene definition
 */
SceneJS.texture = function() {
    var n = new SceneJS.Texture();
    SceneJS.Texture.prototype.constructor.apply(n, arguments);
    return n;
};
/**
 * Backend that manages scene fog.
 *
 * @private
 */
var SceneJS_fogModule = new (function() {

    var fog;
    var dirty;

    // @private
    function colourToArray(v, fallback) {
        return v ?
               [
                   v.r != undefined ? v.r : fallback[0],
                   v.g != undefined ? v.g : fallback[1],
                   v.b != undefined ? v.b : fallback[2]
               ] : fallback;
    }

    // @private
    function _createFog(f) {
        if (f.mode &&
            (f.mode != "disabled"
                    && f.mode != "exp"
                    && f.mode != "exp2"
                    && f.mode != "linear")) {
            ctx.fatalError(new SceneJS.InvalidNodeConfigException(
                    "SceneJS.fog node has a mode of unsupported type - should be 'none', 'exp', 'exp2' or 'linear'"));
        }
        if (f.mode == "disabled") {
            return {
                mode: f.mode || "exp"
            };
        } else {
            return {
                mode: f.mode || "exp",
                color: colourToArray(f.color, [ 0.5,  0.5, 0.5 ]),
                density: f.density || 1.0,
                start: f.start || 0,
                end: f.end || 1.0
            };
        }
    }

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SCENE_ACTIVATED,
            function() {
                _createFog({});
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_ACTIVATED,
            function() {
                dirty = true;
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_RENDERING,
            function() {
                if (dirty) {
                    SceneJS_eventModule.fireEvent(
                            SceneJS_eventModule.FOG_EXPORTED,
                            fog);
                    dirty = false;
                }
            });

    SceneJS_eventModule.onEvent(
            SceneJS_eventModule.SHADER_DEACTIVATED,
            function() {
                dirty = true;
            });

    /** Sets the current fog
     *
     * @private
     * @param f
     */
    this.setFog = function(f) {
        fog = f ? _createFog(f) : null;
        dirty = true;
        SceneJS_eventModule.fireEvent(
                SceneJS_eventModule.FOG_UPDATED,
                fog);
    };

    /** Returns the current fog
     * @private
     */
    this.getFog = function() {
        return fog;
    };

})();

/**
 * @class A scene node that defines fog for nodes in its sub graph.

 * <p>Fog is effectively a region on the Z-axis of the view coordinate system within which
 * the colour of elements will blend with the scene ambient colour in proportion to their depth. You can define the
 * points on the Z axis at which the fog region starts and ends, along with the proportion as a linear, exponential
 * or quadratic mode. Scene content falling in front of the start point will have no fog applied, while content
 * after the end point will be invisible, having blended completely into the ambient colour.</p>
 * <p><b>Live Examples</b></p>
 * <ul><li><a target = "other" href="http://bit.ly/9d8wLu">Example 1</a></li></ul>
 * <p><b>Example Usage</b></p><p>Definition of fog with parameters that happen to be the defaults -
 * starting at Z=1, extending until Z=1000, linear mode, gray colour. Objects beyond Z=1000 will be entirely merged
 * into the background.</b></p><pre><code>
 * var fog = new SceneJS.Fog({
 *         mode:"linear",
 *         color: { r: 0.5, g: 0.5, b: 0.5 },
 *         density: 1.0,
 *         start: 1,
 *         end: 1000
 *     },
 *
 *     // ... child nodes
 * )
 * </pre></code>
 *  @extends SceneJS.Node
 * @constructor
 * Create a new SceneJS.Fog
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Fog = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "fog";
    this._mode = "linear";
    this._color = { r: 0.5, g: 0.5, b: 0.5 };
    this._density = 1.0;
    this._start = 0;
    this._end = 1000.0;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Fog, SceneJS.Node);

/**
 Sets the fogging mode
 @function setMode
 @param {string} mode - "disabled", "exp", "exp2" or "linear"
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setMode = function(mode) {
    if (mode != "disabled" && mode != "exp" && mode != "exp2" && mode != "linear") {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException(
                "SceneJS.fog has a mode of unsupported type: '" + mode + " - should be 'none', 'exp', 'exp2' or 'linear'"));
    }
    this._mode = mode;
    return this;
};

/**
 Returns fogging mode
 @function {string} getMode
 @returns {string} The fog mode - "disabled", "exp", "exp2" or "linear"
 */
SceneJS.Fog.prototype.getMode = function() {
    return this._mode;
};

/**
 Sets the fog color
 @function setColor
 @param {object} color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setColor = function(color) {
    this._color.r = color.r != undefined ? color.r : 0.5;
    this._color.g = color.g != undefined ? color.g : 0.5;
    this._color.b = color.b != undefined ? color.b : 0.5;
    return this;
};

/**
 Returns the fog color
 @function getColor
 @returns {object} Fog color - eg. bright red: {r: 1.0, g: 0, b: 0 }
 */
SceneJS.Fog.prototype.getColor = function() {
    return {
        r: this._color.r,
        g: this._color.g,
        b: this._color.b
    };
};

/**
 Sets the fog density
 @function setDensity
 @param {double} density - density factor
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setDensity = function(density) {
    this._density = density || 1.0;
    return this;
};

/**
 Returns the fog density
 @function {double} getDensity
 @returns {double} Fog density factor
 */
SceneJS.Fog.prototype.getDensity = function() {
    return this._density;
};

/**
 Sets the near point on the Z view-axis at which fog begins
 @function setStart
 @param {double} start - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setStart = function(start) {
    this._start = start || 0;
    return this;
};

/**
 Returns the near point on the Z view-axis at which fog begins
 @function {double} getStart
 @returns {double} Position on Z view axis
 */
SceneJS.Fog.prototype.getStart = function() {
    return this._start;
};

/**
 Sets the farr point on the Z view-axis at which fog ends
 @function setEnd
 @param {double} end - location on Z-axis
 @returns {SceneJS.Fog} This fog node
 */
SceneJS.Fog.prototype.setEnd = function(end) {
    this._end = end || 1000.0;
    return this;
};

/**
 Returns the far point on the Z view-axis at which fog ends
 @function {double} getEnd
 @returns {double} Position on Z view axis
 */
SceneJS.Fog.prototype.getEnd = function() {
    return this._end;
};

// @private
SceneJS.Fog.prototype._init = function(params) {
    if (params.mode) {
        this.setMode(params.mode);
    }
    if (params.color) {
        this.setColor(params.color);
    }
    if (params.density != undefined) {
        this.setDensity(params.density);
    }
    if (params.start != undefined) {
        this.setStart(params.start);
    }
    if (params.end != undefined) {
        this.setEnd(params.end);
    }
};

// @private
SceneJS.Fog.prototype._render = function(traversalContext, data) {
    if (SceneJS._traversalMode == SceneJS.TRAVERSAL_MODE_PICKING) {
        this._renderNodes(traversalContext, data);
    } else {
        if (!this._fixedParams) {
            this._init(this._getParams(data));
        }
        var f = SceneJS_fogModule.getFog();
        SceneJS_fogModule.setFog({
            mode: this._mode,
            color: this._color,
            density: this._density,
            start: this._start,
            end: this._end
        });
        this._renderNodes(traversalContext, data);
        SceneJS_fogModule.setFog(f);
    }
};

/** Returns a new SceneJS.Fog instance
 * @param {Arguments} args Variable arguments that are passed to the SceneJS.Fog constructor
 * @returns {SceneJS.Fog}
 */
SceneJS.fog = function() {
    var n = new SceneJS.Fog();
    SceneJS.Fog.prototype.constructor.apply(n, arguments);
    return n;
};
