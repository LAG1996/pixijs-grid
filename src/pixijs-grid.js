/**
 * @author: Luis Angel Garcia
 */
/** */
const DEFAULT_LINE_STYLE = {
  width: 1,
  color: 0xffffff,
  alpha: 1,
  alignment: 0.5,
  native: true,
}

/**
 * @description Utility class that draws a grid on the screen.
 * @extends PIXI.Graphics
 */
class PixiJSGrid extends PIXI.Graphics {
  /**
   * @param {number} cellSize number. Optional. default: the square root of the grid's side length
   */
  set cellSize(cellSize=null) {
    this._cellSize = cellSize || Math.sqrt(this._correctedWidth);
  }

  get cellSize() {
    return this._cellSize;
  }

  /**
   * The amount of equally spaced lines along the grid's side.
   */
  get amtLines() {
    return this._correctedWidth / this.cellSize;
  }

  /**
   * The coordinates for each corner of the grid.
   * @returns {{ x1: number, y1: number, x2: number, y2: number}}
   * The leftmost (**x1**), topmost (**y1**), rightmost (**x2**), and bottommost (**y2**) coordinates.
   */
  get bounds() {
    return {
      x1: this.x,
      y1: this.y,
      x2: this.x + this._correctedWidth,
      y2: this.y + this._correctedWidth,
    }
  }

  /**
   * The width of the grid.
   * @returns {number}
   */
  get gridWidth() {
    return this._correctedWidth;
  }
  /**
    * 
    * @param {number} width number. Required.
    * 
    * The target sidelength of the grid. It is best for `width` to be a perfect square (i.e., 2, 4, 9, 16, 25, etc.). If
    * not and the parameter `doCorrectWidth` is set to **false**, then the grid will use a corrected width,
    * which is the smallest perfect square greater than `width`.
    * 
    * @param {number} cellSize. number. Optional, default: square root of corrected width
    * 
    * The size of each cell in the grid.
    * 
    * @param {{
    *  width: number,
    *  color: number,
    *  alpha: number,
    *  alignment: number,
    *  native: boolean
    *  }}. Object. Optional. 
    * 
    *  default:
    *  **{
    *    width: 1,
    *    color: 0xffffff,
    *    alpha: 1,
    *    alignment: 0.5,
    *    native: true
    *  }**
    *  
    * Configuration for the line style on the object. See documentation on `PIXI.Graphics` for more on the `LineStyle` class.
    * 
    * @param {boolean} doCorrectWidth boolean. Optional. default: **true**
    * If **true**, the grid will use the smallest perfect square greater than `width`.
    * Otherwise, the grid will use the exact value given by `width`.
    * 
    * @param {boolean} drawBoundaries boolean. Optional. default: **true**
    * If **true**, the grid will draw its boundaries.
    * Otherwise, the grid will not draw its boundaries. Mouse pointer detection is not affected.
   */
  constructor(
    width,
    cellSize=null,
    lineConfig = null,
    doCorrectWidth = true,
    drawBoundaries = true,
  ) {
    super();

    this._cellSize = null;
    this._amtLines = null;
    
    this._gridWidth = width;
    this._doCorrectWidth = doCorrectWidth;
    this._correctedWidth = null;
    this._correctWidth(width);

    this._drawBoundaries = drawBoundaries;

    this.cellSize = cellSize;
    
    const lConfig = (lineConfig || DEFAULT_LINE_STYLE);
    this.lineStyle(
      lConfig.width,
      lConfig.color,
      lConfig.alpha,
      lConfig.alignment,
      lConfig.native,
    );

    // handle mouse move
    this.interactive = true;
    this.on('mousemove', (evt) => {
      const mouseCoords = evt.data.global;
      // check if the mouse is within the bounds of this grid. If not, do nothing.
      if (
        mouseCoords.x >= this.bounds.x1 &&
        mouseCoords.x <= this.bounds.x2 &&
        mouseCoords.y >= this.bounds.y1 &&
        mouseCoords.y <= this.bounds.y2
      ) {
        const gridCoords = this.getCellCoordinates(mouseCoords.x, mouseCoords.y);
        this.onMousemove(evt, gridCoords);
      }
    });
  }
  
  /**
   * Draws the grid to the containing PIXI stage
   */
  drawGrid() {
    this.clearGrid(true);
    for (let i = (this._drawBoundaries ? 0 : 1); i <= this.amtLines - (this._drawBoundaries ? 0 : 1); i += 1) {
      const startCoord = i * this._cellSize;

      // draw the column
      this.moveTo(startCoord, 0);
      this.lineTo(startCoord, this._correctedWidth);

      // draw the row
      this.moveTo(0, startCoord);
      this.lineTo(this._correctedWidth, startCoord);
    }
    this.endFill();

    return this;
  }

  /**
   * Clears the grid from the containing PIXI stage.
   * 
   * @param {boolean} retainLineStyle Optional, default: **true**
   * 
   * When **true**, the configuration for the line style object is preserved.
   * Otherwise, the object's line style will revert to the defaults specified by the `PIXI.Graphics` object.
   */
  clearGrid(retainLineStyle = true) {
    const { width, alignment, color, alpha, native } = this.line;
    this.clear();
    
    if (!retainLineStyle) { return; }
    this.lineStyle(width, color, alpha, alignment, native);

    return this;
  }

  /**
   * Transforms global coordinates to grid coordinates.
   * @param {number} x
   * The global X coordinate.
   * 
   * @param {number} y
   * The global Y coordinate. 
   */
  getCellCoordinates(x, y)  {
    return {
      x: Math.floor((x - this.bounds.x1) / this.cellSize),
      y: Math.floor((y - this.bounds.y1) / this.cellSize),
    };
  }

  /**
   * Callback fired after detecting a mousemove event.
   * 
   * @param {PIXI.InteractionData} evt
   * The `PIXI.InteractionData` captured by the event.
   *  
   * @param {{x: number, y: number}} gridCoords
   * The grid-level coordinates captured by the event.
   */
  onMousemove(evt, gridCoords) {}

  /**
   * Calculates the corrected width. If the `doCorrectWidth` constructor parameter is set to **false**,
   * then it simply keeps the given value for `width` as the corrected width.
   */
  _correctWidth() {
    if (!this._doCorrectWidth) {
      this._correctedWidth = this._gridWidth;
    }

    this._correctedWidth = Math.ceil(Math.sqrt(this._gridWidth)) ** 2;
  }
}