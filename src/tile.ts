import { getRandomColor } from "./colors";
import { Location } from "./location";

export class Tile {
  constructor(
    public id: number, // should be unique
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  public draw(ctx: CanvasRenderingContext2D): void {
    this.updateColor(ctx, "#FFFFFF");
  }

  public isBelow(x: number, y: number): boolean {
    return (
      x >= this.x &&
      y >= this.y &&
      x <= this.x + this.width &&
      y <= this.y + this.height
    );
  }

  public updateColor(ctx: CanvasRenderingContext2D, color: string, debug = true): void {
    if (debug) {
      console.log(`[Tile #${this.id}]: Changing color to ${color}`);
    }

    // save fill style
    const oldFillStyle = ctx.fillStyle;

    ctx.fillStyle = color; //white
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // reset fill style
    ctx.fillStyle = oldFillStyle;
  }

  public updateRandomColor(ctx: CanvasRenderingContext2D): void {
    this.updateColor(ctx, getRandomColor());
  }

  public getAbsoluteLocation(offset: number): Location {
    return {
      x: this.x + offset,
      y: this.y + offset
    };
  }
}