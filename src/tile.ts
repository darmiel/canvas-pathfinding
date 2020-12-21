import { getRandomColor } from "./colors";
import { Selection } from "./controller";

export class Tile {
  public selection: Selection = Selection.NONE;

  constructor(
    public id: number, // should be unique
    private ctx: CanvasRenderingContext2D,
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

  public updateColor(color: string, debug = true): void {
    if (debug) {
      console.log(`[Tile #${this.id}]: Changing color to ${color}`);
    }

    // save fill style
    const oldFillStyle = this.ctx.fillStyle;

    this.ctx.fillStyle = color; //white
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    // reset fill style
    this.ctx.fillStyle = oldFillStyle;
  }

  public updateRandomColor(): void {
    this.updateColor(getRandomColor());
  }

  public updateSelection(selection: Selection): Selection {
    console.log("Selection:", selection, "Current Selection:", this.selection, "Same?", this.selection == selection);

    // revert
    if (selection == Selection.NONE || this.selection == selection) {
      this.selection = Selection.NONE;
      this.draw();
    } else {
      this.selection = selection;

      console.log("Updating")

      switch (selection) {
        case Selection.MARK_START_POINT:
          console.log("update color und so")
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

    console.log("New Selection:", this.selection);

    return this.selection;
  }
}
