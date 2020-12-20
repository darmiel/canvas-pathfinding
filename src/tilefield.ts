import { EventEmitter } from "events";
import { Tile } from "./tile";

export abstract class TileContainer extends EventEmitter {
  public tiles: Tile[] = [];
  public abstract getTileRelative(x: number, y: number): Tile | null;
  public abstract getTileAbsolute(x: number, y: number): Tile | null;
}

export class TileField extends TileContainer {
  // Mouse information
  public mouseDown = false;
  private lastX = 0;
  private lastY = 0;
  //
  public tileWidth: number;
  public tileHeight: number;
  //
  private areaTile: Tile | null;
  private areaFromX: number;
  private areaFromY: number;
  private areaToX: number;
  private areaToY: number;
  //

  constructor(
    public canvas: HTMLCanvasElement,
    public ctx: CanvasRenderingContext2D,
    public width: number,
    public height: number,
    public rows: number = 5,
    public columns: number = Math.floor(rows * 2.9),
    public offset: number = 10
  ) {
    super();

    // Adjust canvas size and color
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.canvas.style.background = "#000000";

    // Calculate tile width and height based on the canvas' size
    this.tileWidth = Math.floor(
      (this.width - this.offset) / this.columns - this.offset
    );
    this.tileHeight = Math.floor(
      (this.height - this.offset) / this.rows - this.offset
    );

    this.areaTile = null;
    this.areaFromX = this.width;
    this.areaFromY = this.height;
    this.areaToX = this.width;
    this.areaToY = this.height;

    // Listeners
    this.registerListeners();
  }

  // creates the tiles
  public init(): void {
    let id = 0;
    for (
      let x = this.offset;
      x < this.width - this.offset;
      x += this.tileWidth + this.offset
    ) {
      for (
        let y = this.offset;
        y < this.height - this.offset;
        y += this.tileHeight + this.offset
      ) {
        const tile = new Tile(id++, x, y, this.tileWidth, this.tileHeight);
        tile.updateColor(this.ctx, "#EEEEEE");

        // save tile
        this.tiles.push(tile);

        console.log("Filled rect:", x, y, this.tileWidth, this.tileHeight);
      }
    }
  }

  ///////////////////////////////////////////////////////////////
  public getTileRelative(x: number, y: number): Tile | null {
    for (const tile of this.tiles) {
      if (tile.isBelow(x, y)) {
        return tile;
      }
    }
    return null;
  }

  public getTileAbsolute(x: number, y: number): Tile | null {
    return this.getTileRelative(x - this.offset, y - this.offset);
  }
  ///////////////////////////////////////////////////////////////
  private registerListeners(): void {
    this.canvas.onmousemove = (event) => {
      this.onMouseMove(event);
    };
    this.canvas.onkeydown = (event) => {
      console.log(event);
    };
  }
  ///////////////////////////////////////////////////////////////
  public onMouseMove(event: MouseEvent): void {
    const x = event.clientX;
    const y = event.clientY;

    // Left current tile
    if (
      x < this.areaFromX ||
      x > this.areaToX ||
      y < this.areaFromY ||
      y > this.areaToY
    ) {
      if (this.areaTile != null) {
        this.emit("leave", this.areaTile);
      }

      const newTile = this.getTileAbsolute(x, y);

      this.areaTile = newTile;
      if (this.areaTile != null) {
        const {x: absX, y: absY} = this.areaTile.getAbsoluteLocation(this.offset);

        this.areaFromX = absX;
        this.areaToX = absX + this.areaTile.width;
        this.areaFromY = absY;
        this.areaToY = absY + this.areaTile.height;

        console.log(x, y, this.areaFromX, this.areaFromY);

        this.emit("enter", this.areaTile);
      } else {
        this.areaFromX = this.width;
        this.areaFromY = this.height;
      }
    }
  }
  ///////////////////////////////////////////////////////////////
}