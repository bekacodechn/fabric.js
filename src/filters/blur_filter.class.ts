//@ts-nocheck
'use strict';

var fabric = global.fabric || (global.fabric = {}),
  filters = fabric.Image.filters,
  createClass = createClass;

/**
 * Blur filter class
 * @class fabric.Image.Blur
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.Blur#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.Blur({
 *   blur: 0.5
 * });
 * object.filters.push(filter);
 * object.applyFilters();
 * canvas.renderAll();
 */
export class Blur extends filters.BaseFilter {
  /** @lends fabric.Image.Blur.prototype */
  type: string;

  /* eslint-disable max-len */
  fragmentSource;

  /**
   * blur value, in percentage of image dimensions.
   * specific to keep the image blur constant at different resolutions
   * range between 0 and 1.
   * @type Number
   * @default
   */
  blur: number;

  mainParameter: string;

  applyTo(options) {
    if (options.webgl) {
      // this aspectRatio is used to give the same blur to vertical and horizontal
      this.aspectRatio = options.sourceWidth / options.sourceHeight;
      options.passes++;
      this._setupFrameBuffer(options);
      this.horizontal = true;
      this.applyToWebGL(options);
      this._swapTextures(options);
      this._setupFrameBuffer(options);
      this.horizontal = false;
      this.applyToWebGL(options);
      this._swapTextures(options);
    } else {
      this.applyTo2d(options);
    }
  }

  applyTo2d(options) {
    options.imageData = this.simpleBlur(options);
  }

  simpleBlur(options) {
    var resources = options.filterBackend.resources,
      canvas1,
      canvas2,
      width = options.imageData.width,
      height = options.imageData.height;

    if (!resources.blurLayer1) {
      resources.blurLayer1 = createCanvasElement();
      resources.blurLayer2 = createCanvasElement();
    }
    canvas1 = resources.blurLayer1;
    canvas2 = resources.blurLayer2;
    if (canvas1.width !== width || canvas1.height !== height) {
      canvas2.width = canvas1.width = width;
      canvas2.height = canvas1.height = height;
    }
    var ctx1 = canvas1.getContext('2d'),
      ctx2 = canvas2.getContext('2d'),
      nSamples = 15,
      random,
      percent,
      j,
      i,
      blur = this.blur * 0.06 * 0.5;

    // load first canvas
    ctx1.putImageData(options.imageData, 0, 0);
    ctx2.clearRect(0, 0, width, height);

    for (i = -nSamples; i <= nSamples; i++) {
      random = (Math.random() - 0.5) / 4;
      percent = i / nSamples;
      j = blur * percent * width + random;
      ctx2.globalAlpha = 1 - Math.abs(percent);
      ctx2.drawImage(canvas1, j, random);
      ctx1.drawImage(canvas2, 0, 0);
      ctx2.globalAlpha = 1;
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
    for (i = -nSamples; i <= nSamples; i++) {
      random = (Math.random() - 0.5) / 4;
      percent = i / nSamples;
      j = blur * percent * height + random;
      ctx2.globalAlpha = 1 - Math.abs(percent);
      ctx2.drawImage(canvas1, random, j);
      ctx1.drawImage(canvas2, 0, 0);
      ctx2.globalAlpha = 1;
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    }
    options.ctx.drawImage(canvas1, 0, 0);
    var newImageData = options.ctx.getImageData(
      0,
      0,
      canvas1.width,
      canvas1.height
    );
    ctx1.globalAlpha = 1;
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    return newImageData;
  }

  /**
   * Return WebGL uniform locations for this filter's shader.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {WebGLShaderProgram} program This filter's compiled shader program.
   */
  getUniformLocations(gl, program) {
    return {
      delta: gl.getUniformLocation(program, 'uDelta'),
    };
  }

  /**
   * Send data from this filter to its shader program's uniforms.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
   */
  sendUniformData(gl, uniformLocations) {
    var delta = this.chooseRightDelta();
    gl.uniform2fv(uniformLocations.delta, delta);
  }

  /**
   * choose right value of image percentage to blur with
   * @returns {Array} a numeric array with delta values
   */
  chooseRightDelta() {
    var blurScale = 1,
      delta = [0, 0],
      blur;
    if (this.horizontal) {
      if (this.aspectRatio > 1) {
        // image is wide, i want to shrink radius horizontal
        blurScale = 1 / this.aspectRatio;
      }
    } else {
      if (this.aspectRatio < 1) {
        // image is tall, i want to shrink radius vertical
        blurScale = this.aspectRatio;
      }
    }
    blur = blurScale * this.blur * 0.12;
    if (this.horizontal) {
      delta[0] = blur;
    } else {
      delta[1] = blur;
    }
    return delta;
  }

  /**
   * Create filter instance from an object representation
   * @static
   * @param {Object} object Object to create an instance from
   * @returns {Promise<fabric.Image.Blur>}
   */
  static fromObject = fabric.Image.filters.BaseFilter.fromObject;
}

export const blurDefaultValues: Partial<TClassProperties<Blur>> = {
  type: 'Blur',
  fragmentSource:
    'precision highp float;\n' +
    'uniform sampler2D uTexture;\n' +
    'uniform vec2 uDelta;\n' +
    'varying vec2 vTexCoord;\n' +
    'const float nSamples = 15.0;\n' +
    'vec3 v3offset = vec3(12.9898, 78.233, 151.7182);\n' +
    'float random(vec3 scale) {\n' +
    /* use the fragment position for a different seed per-pixel */
    'return fract(sin(dot(gl_FragCoord.xyz, scale)) * 43758.5453);\n' +
    '}\n' +
    'void main() {\n' +
    'vec4 color = vec4(0.0);\n' +
    'float total = 0.0;\n' +
    'float offset = random(v3offset);\n' +
    'for (float t = -nSamples; t <= nSamples; t++) {\n' +
    'float percent = (t + offset - 0.5) / nSamples;\n' +
    'float weight = 1.0 - abs(percent);\n' +
    'color += texture2D(uTexture, vTexCoord + uDelta * percent) * weight;\n' +
    'total += weight;\n' +
    '}\n' +
    'gl_FragColor = color / total;\n' +
    '}',
  blur: 0,
  mainParameter: 'blur',
};

Object.assign(Blur.prototype, blurDefaultValues);
