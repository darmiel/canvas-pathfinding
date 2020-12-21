import { EventEmitter } from "events";
import Swal from "sweetalert2";
import { Controller, Selection } from "./controller";
import { Tile } from "./tile";
import { TileField } from "./tilefield";

export abstract class Pathfinder extends EventEmitter {
  public started = false;

  constructor(public field: TileField, public controller: Controller) {
    super();
  }

  public start(): void {
    this.started = true;
  }
  public abstract onUpdateStart(tile: Tile): void;
  public abstract onUpdateEnd(tile: Tile): void;

  public abstract onMouseDown(event: MouseEvent, tile: Tile): void;
}

export class AStarPathfinder extends Pathfinder {
  public open: Tile[] = [];
  public closed: Tile[] = [];

  constructor(public field: TileField, public controller: Controller) {
    super(field, controller);
  }

  public onUpdateStart(tile: Tile): void {
    this.open = [];
    this.closed = [];
    this.open.push(tile);
  }
  public onUpdateEnd(tile: Tile): void {
    this.open = [];
    this.closed = [];
  }

  public onMouseDown(event: MouseEvent, tile: Tile): void {
    if (this.controller.endTile == null || this.controller.startTile == null) {
      Swal.fire("Error", "No Start or End marker set!");
      return;
    }

    const { xId: x, yId: y } = tile;
    console.log("x and y:", x, y);

    // non-open node clicked
    if (!this.open.includes(tile)) {
      Swal.fire("Warning", "Non-Open Node clicked!");
      return;
    }

    // remove from open
    {
      const index = this.open.indexOf(tile);
      if (index !== -1) {
        this.open.splice(index, 1);
      } else {
        Swal.fire("Warning", "Did not remove open node!");
      }
    }

    // add node to closed nodes
    this.closed.push(tile);

    // change color to red
    tile.updateColor("#FF0000");

    // print f_ and g_ cost
    this.calcAndDraw(tile);

    // if node is the end node, exit
    if (tile == this.controller.endTile) {
      this.started = false;
      Swal.fire("Found!");
      this.emit("finished", true);
      return;
    }

    // open all nodes around
    for (const nb of this.findNb(x, y)) {

      // check if neighbour was already checked
      if (this.closed.includes(nb)) {
        continue;
      }

      // change color to green
      nb.updateColor("#00FF00");

      // print f_ and g_ cost
      this.calcAndDraw(nb);

      this.open.push(nb);
    }
  }

  private calcAndDraw(tile: Tile) {
    if (this.controller.endTile == null || this.controller.startTile == null) {
      return;
    }

    const { xId: x, yId: y, height } = tile;

    const fCost = Math.floor(
      Math.sqrt(
        Math.pow(Math.abs(x - this.controller.endTile.xId), 2) +
          Math.pow(Math.abs(y - this.controller.endTile.yId), 2)
      ) * 10
    );
    const gCost = Math.floor(
      Math.sqrt(
        Math.pow(Math.abs(x - this.controller.startTile.xId), 2) +
          Math.pow(Math.abs(y - this.controller.startTile.yId), 2)
      ) * 10
    );
    tile.ctx.fillStyle = "#000000";
    tile.ctx.font = "20px courier";
    tile.ctx.fillText("" + fCost, tile.x + 5, tile.y + height / 2 - 10);
    tile.ctx.fillText("" + gCost, tile.x + 5, tile.y + height / 2 + 20);
  }

  private findNb(x: number, y: number): Tile[] {
    const res: Tile[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
          console.log("ignored center");
          // center
          continue;
        }

        const _x = x - 1 + i;
        const _y = y - 1 + j;

        console.log(_x, _y);

        const tile = this.field.getTileMatrix(_x, _y);
        if (tile != null) {
          console.log(" -> Found tile!");
          res.push(tile);
        }
      }
    }

    return res;
  }
}
