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
  public open: Set<Tile> = new Set();
  public closed: Set<Tile> = new Set();

  constructor(public field: TileField, public controller: Controller) {
    super(field, controller);
  }

  private resetValues(): void {
    this.open.clear();
    this.closed.clear();
  }

  public onUpdateStart(tile: Tile): void {
    this.resetValues();
    this.open.add(tile);

    console.log("Updated start with tile:", tile, "open:", this.open);
  }
  public onUpdateEnd(tile: Tile): void {
    //this.resetValues();
  }

  public async onMouseDown(event: MouseEvent, tile: Tile) {
    if (this.controller.startTile == null || this.controller.endTile == null) {
      alert("Start or end missing!");
      return;
    }

    for (let i = 0; i < 25; i++) {

      await new Promise((accept) => {
        setTimeout(() => {
          accept("");
        }, 500);
      });

      // h cost = distance from end
      // g cost = distance from start
      // f cost = g cost + h cost
      const current = this.getTileWithLowestFCost();
      if (current == null) {
        alert("Something went horribly wrong!");
        return;
      }
      console.log("Current with lowest f-cost:", current);

      // make tile red
      current.updateColor("#FF0000", false);

      // remove current from open
      this.open.delete(current);

      // add current to closed
      this.closed.add(current);

      // check if target node has been found
      if (current == this.controller.endTile) {
        this.controller.endTile.updateColor("#0000FF", false, true);
        alert("Found!");
        return;
      }

      let pl = -1;
      for (const neighbour of this.findNeighbours(current)) {
        // check if already closed
        if (this.closed.has(neighbour)) {
          continue;
        }

        const pathLength = neighbour.getPathLength() + 1;
        const isInOpen = this.open.has(neighbour);
        if (pl == -1 || pl > pathLength || !isInOpen) {
          pl = pathLength;

          // set parent to current
          neighbour.parent = current;

          // if neighbour is not in open -> add
          if (!isInOpen) {
            this.open.add(neighbour);

            // make tile green
            neighbour.updateColor("#00FF00");
          }
        }
      }
    }
  }

  public getTileWithLowestFCost(): Tile | null {
  
    let cost = -1;
    let lt: Tile | null = null;

    this.open.forEach((tile) => {
      console.log("Checking:", tile);
      if (this.controller.startTile == null || this.controller.endTile == null) {
        return;
      }

      const f = tile.fCost(this.controller.startTile, this.controller.endTile);
      console.log("F-Cost:", f);
      if (cost == -1 || cost > f) {
        cost = f;
        lt = tile;
      }
    });

    console.log("Res:", cost, lt);

    return lt;
  }

  private findNeighbours(tile: Tile, skipObstacles = true): Tile[] {
    const res: Tile[] = [];

    const x = tile.xId;
    const y = tile.yId;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        // skip center (clicked)
        if (i == 1 && j == 1) {
          continue;
        }

        const tile = this.field.getTileMatrix(x - 1 + i, y - 1 + j);

        if (tile != null) {
          // check if tile is obstacle
          if (skipObstacles && tile.selection != Selection.NONE) {
            // INCLUDE end node
            if (tile.selection != Selection.MARK_END_POINT) {
              continue;
            }
          }

          res.push(tile);
        }
      }
    }

    return res;
  }
}
