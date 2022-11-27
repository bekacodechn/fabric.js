//@ts-nocheck
'use strict';

var fabric = global.fabric || (global.fabric = {}),
  filters = fabric.Image.filters,
  createClass = createClass;

/**
 * HueRotation filter class
 * @class fabric.Image.HueRotation
 * @memberOf fabric.Image.filters
 * @extends fabric.Image.filters.BaseFilter
 * @see {@link fabric.Image.HueRotation#initialize} for constructor definition
 * @see {@link http://fabricjs.com/image-filters|ImageFilters demo}
 * @example
 * var filter = new fabric.Image.HueRotation({
 *   rotation: -0.5
 * });
 * object.filters.push(filter);
 * object.applyFilters();
 */
export class HueRotation extends filters.ColorMatrix {
  /**
   * Filter type
   * @param {String} type
   * @default
   */
  type: string;

  /**
   * HueRotation value, from -1 to 1.
   * the unit is radians
   * @param {Number} myParameter
   * @default
   */
  rotation: number;

  /**
   * Describe the property that is the filter parameter
   * @param {String} m
   * @default
   */
  mainParameter: string;

  calculateMatrix() {
    var rad = this.rotation * Math.PI,
      cos = cos(rad),
      sin = sin(rad),
      aThird = 1 / 3,
      aThirdSqtSin = Math.sqrt(aThird) * sin,
      OneMinusCos = 1 - cos;
    this.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
    this.matrix[0] = cos + OneMinusCos / 3;
    this.matrix[1] = aThird * OneMinusCos - aThirdSqtSin;
    this.matrix[2] = aThird * OneMinusCos + aThirdSqtSin;
    this.matrix[5] = aThird * OneMinusCos + aThirdSqtSin;
    this.matrix[6] = cos + aThird * OneMinusCos;
    this.matrix[7] = aThird * OneMinusCos - aThirdSqtSin;
    this.matrix[10] = aThird * OneMinusCos - aThirdSqtSin;
    this.matrix[11] = aThird * OneMinusCos + aThirdSqtSin;
    this.matrix[12] = cos + aThird * OneMinusCos;
  }

  /**
   * HueRotation isNeutralState implementation
   * Used only in image applyFilters to discard filters that will not have an effect
   * on the image
   * @param {Object} options
   **/
  isNeutralState(options) {
    this.calculateMatrix();
    return filters.BaseFilter.prototype.isNeutralState.call(this, options);
  }

  /**
   * Apply this filter to the input image data provided.
   *
   * Determines whether to use WebGL or Canvas2D based on the options.webgl flag.
   *
   * @param {Object} options
   * @param {Number} options.passes The number of filters remaining to be executed
   * @param {Boolean} options.webgl Whether to use webgl to render the filter.
   * @param {WebGLTexture} options.sourceTexture The texture setup as the source to be filtered.
   * @param {WebGLTexture} options.targetTexture The texture where filtered output should be drawn.
   * @param {WebGLRenderingContext} options.context The GL context used for rendering.
   * @param {Object} options.programCache A map of compiled shader programs, keyed by filter type.
   */
  applyTo(options) {
    this.calculateMatrix();
    filters.BaseFilter.prototype.applyTo.call(this, options);
  }
}

export const hueRotationDefaultValues: Partial<TClassProperties<HueRotation>> =
  {
    type: 'HueRotation',
    rotation: 0,
    mainParameter: 'rotation',
  };

Object.assign(HueRotation.prototype, hueRotationDefaultValues);

/**
 * Create filter instance from an object representation
 * @static
 * @param {Object} object Object to create an instance from
 * @returns {Promise<fabric.Image.HueRotation>}
 */
fabric.Image.HueRotation.fromObject =
  fabric.Image.filters.BaseFilter.fromObject;
