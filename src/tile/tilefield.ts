import { EventEmitter } from "events";
import { Tile } from "./tile";
import { TileUpdater } from "./tileupdater";

export abstract class TileContainer extends EventEmitter {
  public tiles: Tile[] = [];
  public abstract getTileRelative(x: number, y: number): Tile | null;
  public abstract getTileAbsolute(x: number, y: number): Tile | null;
}

export class TileField extends TileContainer {
  // Mouse information
  public mouseDown = false;
  //
  public tileWidth: number;
  public tileHeight: number;
  //
  public tileUpdater: TileUpdater;
  public tileMatrix: Tile[][] = [];

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

    this.tileUpdater = new TileUpdater(this);

    // Listeners
    this.registerListeners();
  }

  // creates the tiles
  public init(): void {
    let id = 0;

    let xId = -1;
    let yId = -1;

    for (
      let y = this.offset;
      y < this.height - this.offset;
      y += this.tileHeight + this.offset
    ) {
      yId++;
      xId = -1; // reset x

      for (
        let x = this.offset;
        x < this.width - this.offset;
        x += this.tileWidth + this.offset
      ) {
        xId++;

        const tile = new Tile(
          id++,
          this.ctx,
          x,
          y,
          xId,
          yId,
          this.tileWidth,
          this.tileHeight
        );
        tile.updateColor("#EEEEEE", false);

        // save tile
        this.tiles.push(tile);

        if (this.tileMatrix[xId] == null) {
          this.tileMatrix[xId] = [];
        }
        this.tileMatrix[xId][yId] = tile;
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

  public getTileMatrix(x: number, y: number): Tile | null {
    return (this.tileMatrix[x] ?? [])[y] ?? null;
  }
  ///////////////////////////////////////////////////////////////
  private registerListeners(): void {
    this.canvas.onmousemove = (event) => {
      const x = event.clientX;
      const y = event.clientY;

      // Left current tile
      this.tileUpdater.onMove(x, y);

      this.emit("mousemove", event);
    };
    this.canvas.onkeydown = (event) => {
      this.emit("keydown", event);
    };
    this.canvas.onmousedown = (event) => {
      this.emit("mousedown", event);
    };
    this.canvas.onmouseup = (event) => {
      this.emit("mouseup", event);
    };
  }
  ///////////////////////////////////////////////////////////////
}
