import { Tile } from "./tile";
import { Location } from "../location";
import { TileField } from "./tilefield";

export class TileUpdater {
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
    if (
      !this.hasLeft(
        mouseX - this.field.offset,
        mouseY - this.field.offset,
        false
      )
    ) {
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
    return true;
  }
}