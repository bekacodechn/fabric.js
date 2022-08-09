/**
 * BaseBrush class
 * @class fabric.BaseBrush
 * @see {@link http://fabricjs.com/freedrawing|Freedrawing demo}
 */
fabric.BaseBrush = fabric.util.createClass(/** @lends fabric.BaseBrush.prototype */ {

  /**
   * Color of a brush
   * @type String
   * @default
   */
  color: 'rgb(0, 0, 0)',

  /**
   * Width of a brush, has to be a Number, no string literals
   * @type Number
   * @default
   */
  width: 1,

  /**
   * Shadow object representing shadow of this shape.
   * <b>Backwards incompatibility note:</b> This property replaces "shadowColor" (String), "shadowOffsetX" (Number),
   * "shadowOffsetY" (Number) and "shadowBlur" (Number) since v1.2.12
   * @type fabric.Shadow
   * @default
   */
  shadow: null,

  /**
   * Line endings style of a brush (one of "butt", "round", "square")
   * @type String
   * @default
   */
  strokeLineCap: 'round',

  /**
   * Corner style of a brush (one of "bevel", "round", "miter")
   * @type String
   * @default
   */
  strokeLineJoin: 'round',

  /**
   * Maximum miter length (used for strokeLineJoin = "miter") of a brush's
   * @type Number
   * @default
   */
  strokeMiterLimit: 10,

  /**
   * Stroke Dash Array.
   * @type Array
   * @default
   */
  strokeDashArray: null,

  /**
   * When `true`, the free drawing is limited to the whiteboard size. Default to false.
   * @type Boolean
   * @default false
  */
  limitedToCanvasSize: false,

  /**
   * Same as fabric.Object `clipPath` property.
   * The clip path is positioned relative to the top left corner of the viewport.
   * The `absolutePositioned` property renders the clip path w/o viewport transform.
   */
  clipPath: undefined,

  /**
   * Sets brush styles
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _setBrushStyles: function (ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = this.strokeLineCap;
    ctx.miterLimit = this.strokeMiterLimit;
    ctx.lineJoin = this.strokeLineJoin;
    ctx.setLineDash(this.strokeDashArray || []);
  },

  /**
   * Sets the transformation on given context
   * @param {RenderingContext2d} ctx context to render on
   * @private
   */
  _saveAndTransform: function(ctx) {
    var v = this.canvas.viewportTransform;
    ctx.save();
    ctx.transform(v[0], v[1], v[2], v[3], v[4], v[5]);
  },

  /**
   * Sets brush shadow styles
   * @private
   */
  _setShadow: function() {
    if (!this.shadow) {
      return;
    }

    var canvas = this.canvas,
        shadow = this.shadow,
        ctx = canvas.contextTop,
        zoom = canvas.getZoom();
    if (canvas && canvas._isRetinaScaling()) {
      zoom *= fabric.devicePixelRatio;
    }

    ctx.shadowColor = shadow.color;
    ctx.shadowBlur = shadow.blur * zoom;
    ctx.shadowOffsetX = shadow.offsetX * zoom;
    ctx.shadowOffsetY = shadow.offsetY * zoom;
  },

  needsFullRender: function() {
    var color = new fabric.Color(this.color);
    return color.getAlpha() < 1 || !!this.shadow || (this.clipPath && this.clipPath.isCacheDirty());
  },

  /**
   * needed for `absolutePositioned` `clipPath`
   * @private
   */
  calcTransformMatrix: function () {
    return this.canvas.viewportTransform;
  },

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx
   * @param {fabric.Object} clipPath
   */
  drawClipPathOnCache: function (ctx, clipPath) {
    fabric.Object.prototype.drawClipPathOnCache.call(this, ctx, clipPath);
  },

  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx
   * @param {fabric.Object} clipPath
   */
  _drawClipPath: function (ctx, clipPath) {
    if (!clipPath) {
      return;
    }
    ctx.save();
    fabric.Object.prototype._drawClipPath.call(this, ctx, clipPath);
    ctx.restore();
  },

  /**
   * Adds the clip path to the resulting object created by the brush
   * @private
   * @param {fabric.Object} result
   */
  _addClipPathToResult: function (result) {
    if (!this.clipPath) {
      return Promise.resolve();
    }
    var t = result.calcTransformMatrix();
    if (this.clipPath.absolutePositioned) {
      t = fabric.util.multiplyTransformMatrices(this.calcTransformMatrix(), t);
    }
    return this.clipPath.clone(['inverted'])
      .then(function (clipPath) {
        var desiredTransform = fabric.util.multiplyTransformMatrices(
          fabric.util.invertTransform(t),
          clipPath.calcTransformMatrix()
        );
        fabric.util.applyTransformToObject(clipPath, desiredTransform);
        result.set('clipPath', clipPath);
      });
  },

  /**
   * Subclasses should override this method
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _render: function (ctx) {  // eslint-disable-line no-unused-vars

  },

  /**
   * Render the full state of the brush
   * @private
   */
  render: function () {
    var ctx = this.canvas.contextTop;
    this._saveAndTransform(ctx);
    this._render(ctx);
    this._drawClipPath(ctx, this.clipPath);
    ctx.restore();
  },

  /**
   * Removes brush shadow styles
   * @private
   * @param {CanvasRenderingContext2D} ctx
   */
  _resetShadow: function(ctx) {
    ctx.shadowColor = '';
    ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
  },

  /**
   * Check is pointer is outside canvas boundaries
   * @param {Object} pointer
   * @private
  */
  _isOutSideCanvas: function(pointer) {
    return pointer.x < 0 || pointer.x > this.canvas.getWidth() || pointer.y < 0 || pointer.y > this.canvas.getHeight();
  }
});