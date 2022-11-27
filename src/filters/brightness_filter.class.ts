//@ts-nocheck
'use strict';

var fabric = global.fabric || (global.fabric = {}),
  filters = fabric.Image.filters,
  createClass = createClass;

/**
 * Brightness filter class
 * @class fabric.Image.Brightness
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.Brightness#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.Brightness({
 *   brightness: 0.05
 * });
 * object.filters.push(filter);
 * object.applyFilters();
 */
export class Brightness extends filters.BaseFilter {
  /**
   * Filter type
   * @param {String} type
   * @default
   */
  type: string;

  /**
   * Fragment source for the brightness program
   */
  fragmentSource;

  /**
   * Brightness value, from -1 to 1.
   * translated to -255 to 255 for 2d
   * 0.0039215686 is the part of 1 that get translated to 1 in 2d
   * @param {Number} brightness
   * @default
   */
  brightness: number;

  /**
   * Describe the property that is the filter parameter
   * @param {String} m
   * @default
   */
  mainParameter: string;

  /**
   * Apply the Brightness operation to a Uint8ClampedArray representing the pixels of an image.
   *
   * @param {Object} options
   * @param {ImageData} options.imageData The Uint8ClampedArray to be filtered.
   */
  applyTo2d(options) {
    if (this.brightness === 0) {
      return;
    }
    var imageData = options.imageData,
      data = imageData.data,
      i,
      len = data.length,
      brightness = Math.round(this.brightness * 255);
    for (i = 0; i < len; i += 4) {
      data[i] = data[i] + brightness;
      data[i + 1] = data[i + 1] + brightness;
      data[i + 2] = data[i + 2] + brightness;
    }
  }

  /**
   * Return WebGL uniform locations for this filter's shader.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {WebGLShaderProgram} program This filter's compiled shader program.
   */
  getUniformLocations(gl, program) {
    return {
      uBrightness: gl.getUniformLocation(program, 'uBrightness'),
    };
  }

  /**
   * Send data from this filter to its shader program's uniforms.
   *
   * @param {WebGLRenderingContext} gl The GL canvas context used to compile this filter's shader.
   * @param {Object} uniformLocations A map of string uniform names to WebGLUniformLocation objects
   */
  sendUniformData(gl, uniformLocations) {
    gl.uniform1f(uniformLocations.uBrightness, this.brightness);
  }
}

export const brightnessDefaultValues: Partial<TClassProperties<Brightness>> = {
  type: 'Brightness',
  fragmentSource:
    'precision highp float;\n' +
    'uniform sampler2D uTexture;\n' +
    'uniform float uBrightness;\n' +
    'varying vec2 vTexCoord;\n' +
    'void main() {\n' +
    'vec4 color = texture2D(uTexture, vTexCoord);\n' +
    'color.rgb += uBrightness;\n' +
    'gl_FragColor = color;\n' +
    '}',
  brightness: 0,
  mainParameter: 'brightness',
};

Object.assign(Brightness.prototype, brightnessDefaultValues);

/**
 * Create filter instance from an object representation
 * @static
 * @param {Object} object Object to create an instance from
 * @returns {Promise<fabric.Image.Brightness>}
 */
fabric.Image.Brightness.fromObject = fabric.Image.filters.BaseFilter.fromObject;
