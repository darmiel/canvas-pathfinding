export class Location {
  public xAbs: number;
  public yAbs: number;

  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly offset: number = 0
  ) {
    this.xAbs = x + offset;
    this.yAbs = y + offset;
  }

  public static empty(): Location {
    return emptyLocation;
  }

  public isEmpty(): boolean {
    return this.x == -1 || this.y == -1;
  }

  public between(
    x: number,
    y: number,
    to: Location,
    absolute = false
  ): boolean {
    return (
      x >= (absolute ? this.xAbs : this.x) &&
      y >= (absolute ? this.yAbs : this.y) &&
      x <= (absolute ? to.xAbs : to.x) &&
      y <= (absolute ? to.yAbs : to.y)
    );
  }

  public add(x: number, y: number): Location {
    return new Location(this.x + x, this.y + y, this.offset);
  }
}

const emptyLocation = new Location(-1, -1, 0);
