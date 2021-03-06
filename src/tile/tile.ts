import { getRandomColor } from "../colors";
import { Selection } from "../controller";

export class Tile {
  public selection: Selection = Selection.NONE;
  public parent: Tile | null = null;
  public distToStart: number = 0;
  public distToEnd: number = 0;

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

  public updateColor(
    color: string,
    debug = false,
    includeParents = false
  ): void {
    if (debug) {
      console.log(`[Tile #${this.id}]: Changing color to ${color}`);
    }

    // save fill style
    const oldFillStyle = this.ctx.fillStyle;

    this.ctx.fillStyle = color; //white
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = "#000000";
    this.ctx.fillText(`${this.distToStart}`,this.x + 5,this.y + 10);
    this.ctx.fillText(`${this.distToEnd}`,this.x + this.width - 20,this.y + 10);
    
    // reset fill style
    this.ctx.fillStyle = oldFillStyle;

    if (includeParents && this.parent != null) {
      this.parent.updateColor(color, debug, includeParents);
    }
  }

  public updateRandomColor(includeParents = false, vibrantOnly = false): void {
    this.updateColor(getRandomColor(vibrantOnly));

    if (includeParents && this.parent != null) {
      this.parent.updateRandomColor(includeParents);
    }
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
    const cost : number = this.getPathLength() + this.niceDistanceTo(end)
    this.distToStart = this.getPathLength()
    this.distToEnd = this.niceDistanceTo(end)
    return cost;
  }

  public getPathLength(): number {
    if (this.parent == null) {
      return 0;
    }

    return this.parent.getPathLength() + 10;
  }
}
