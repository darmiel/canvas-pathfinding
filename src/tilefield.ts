import { EventEmitter } from "events";
import { Tile } from "./tile";
import { Location } from "./location";

export abstract class TileContainer extends EventEmitter {
  public tiles: Tile[] = [];
  public abstract getTileRelative(x: number, y: number): Tile | null;
  public abstract getTileAbsolute(x: number, y: number): Tile | null;
}

class TileUpdater {
  private areaTile: Tile | null = null;

  private from: Location = Location.empty();
  private to: Location = Location.empty();

  constructor(private field: TileField) {}

  public hasLeft(x: number, y: number, absolute = false): boolean {
    return (
      this.from.isEmpty() ||
      this.to.isEmpty() ||
      !this.from.between(x, y, this.to, absolute)
    );
  }

  public onMove(mouseX: number, mouseY: number): boolean {
    if (!this.hasLeft(mouseX - this.field.offset, mouseY - this.field.offset, false)) {
      return false;
    }

    if (this.areaTile != null) {
      this.field.emit("leave", this.areaTile);
    }

    // Get new
    const newTile = this.field.getTileAbsolute(mouseX, mouseY);
    if (newTile == null) {
      if (this.areaTile != null) {

        // From: old tile - offset
        // TODO: Change these two to Locaion#add
        this.from = new Location(
          this.areaTile.x - this.field.offset,
          this.areaTile.y - this.field.offset,
          this.field.offset
        );

        // To: old tile + offset
        this.to = new Location(
          this.areaTile.x + this.areaTile.width + this.field.offset,
          this.areaTile.y + this.areaTile.height + this.field.offset,
          this.field.offset
        );
      } else {
        this.from = Location.empty();
        this.to = Location.empty();
      }
    } else {
      this.field.emit("enter", newTile);

      this.from = new Location(newTile.x, newTile.y, this.field.offset);
      this.to = new Location(
        newTile.x + newTile.width,
        newTile.y + newTile.height
      );
    }

    this.areaTile = newTile;

    // console.log(this.from, this.to);
    return true;
  }
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
  public tileUpdater: TileUpdater;

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
    if (this.tileUpdater.onMove(x, y)) {
      // Something changed
    }
  }
  ///////////////////////////////////////////////////////////////
}
