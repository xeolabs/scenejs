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
