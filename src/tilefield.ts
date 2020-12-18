import { EventEmitter } from "events";
import { Tile } from "./tile";

export abstract class TileContainer extends EventEmitter {
  public tiles: Tile[] = [];
  public abstract getTileAt(x: number, y: number): Tile | null;
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
    // Init Canvas

    // Adjust canvas size and color
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.canvas.style.background = "#000000";

    this.tileWidth = Math.floor(
      (this.width - this.offset) / this.columns - this.offset
    );
    this.tileHeight = Math.floor(
      (this.height - this.offset) / this.rows - this.offset
    );

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
  public getTileAt(x: number, y: number): Tile | null {
    for (const tile of this.tiles) {
      if (tile.isBelow(x, y)) {
        return tile;
      }
    }
    return null;
  }
  ///////////////////////////////////////////////////////////////


  ///////////////////////////////////////////////////////////////
  private registerListeners(): void {
    this.canvas.onmousedown = (event) => {
      this.onMouseDown(event);
    };
    this.canvas.onmouseup = (event) => {
      this.onMouseUp(event);
    };
    this.canvas.onmousemove = (event) => {
      this.onMouseMove(event);
    };
  }

  public mouseUpdate(x: number, y: number): Tile | null {
    const clickedX = x - this.offset;
    const clickedY = y - this.offset;

    const tile = this.getTileAt(clickedX, clickedY);
    if (tile == null) {
      console.log("Updated no tile!");
      return null;
    }

    console.log("Update:", tile);
    tile.updateRandomColor(this.ctx);

    return tile;
  }

  public onMouseDown(event: MouseEvent): void {
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    const updated = this.mouseUpdate(event.clientX, event.clientY);
    if (updated != null) {
      this.mouseDown = true;

      // set last mouse location to tile center
      this.lastX = updated.x + updated.width / 2;
      this.lastY = updated.y + updated.height / 2;
    }
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.mouseDown) {
      return;
    }

    if (
      Math.abs(event.clientX - this.lastX) < this.tileWidth &&
      Math.abs(event.clientY - this.lastY) < this.tileHeight
    ) {
      return;
    }

    this.lastX = event.clientX;
    this.lastY = event.clientY;

    this.mouseUpdate(this.lastX, this.lastY);
  }

  public onMouseUp(event: MouseEvent): void {
    this.mouseDown = false;
  }
  ///////////////////////////////////////////////////////////////

}
