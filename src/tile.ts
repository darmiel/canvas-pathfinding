import { getRandomColor } from "./colors";
import { Selection } from "./controller";

export class Tile {
  public selection: Selection = Selection.NONE;
  public parent: Tile | null = null;

  constructor(
    public id: number, // should be unique
    public ctx: CanvasRenderingContext2D,
    public x: number,
    public y: number,
    public xId: number,
    public yId: number,
    public width: number,
    public height: number
  ) {}

  public draw(): void {
    this.updateColor("#FFFFFF");
  }

  public isBelow(x: number, y: number): boolean {
    return (
      x >= this.x &&
      y >= this.y &&
      x <= this.x + this.width &&
      y <= this.y + this.height
    );
  }

  public updateColor(color: string, debug = true, includeParents = false): void {
    if (debug) {
      console.log(`[Tile #${this.id}]: Changing color to ${color}`);
    }

    // save fill style
    const oldFillStyle = this.ctx.fillStyle;

    this.ctx.fillStyle = color; //white
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    // reset fill style
    this.ctx.fillStyle = oldFillStyle;

    if (includeParents && this.parent != null) {
      this.parent.updateColor(color, debug, includeParents);
    }
  }

  public updateRandomColor(): void {
    this.updateColor(getRandomColor());
  }

  public updateSelection(selection: Selection): Selection {
    // revert
    if (selection == Selection.NONE || this.selection == selection) {
      this.selection = Selection.NONE;
      this.draw();
    } else {
      this.selection = selection;

      switch (selection) {
        case Selection.MARK_START_POINT:
          console.log("update color und so");
          this.updateColor("#e67e22");
          break;
        case Selection.MARK_END_POINT:
          this.updateColor("#e74c3c");
          break;
        case Selection.OBSTACLES:
          this.updateColor("#34495e");
          break;
      }
    }

    return this.selection;
  }

  public niceDistanceTo(tile: Tile): number {
    return Math.floor(
      Math.sqrt(
        Math.pow(tile.xId - this.xId, 2) + Math.pow(tile.yId - this.yId, 2)
      ) * 10
    );
  }

  public fCost(start: Tile, end: Tile): number {
    return this.niceDistanceTo(start) + this.niceDistanceTo(end);
  }

  public getPathLength(): number {
    if (this.parent == null) {
      return 1;
    }

    return this.parent.getPathLength() + 1;
  }

}
