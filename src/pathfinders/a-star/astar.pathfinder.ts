import Swal from "sweetalert2";
import { Tile } from "../../tile/tile";
import { TileField } from "../../tile/tilefield";
import { Pathfinder } from "../pathfinder.a";
import { Controller, Selection } from "../../controller";
import { findNeighbours, getTileWithLowestFCost } from "./astar.utils";

export class AStarPathfinder extends Pathfinder {
  public open: Set<Tile> = new Set();
  public closed: Set<Tile> = new Set();

  /* Settings */
  public delay = 50;
  public strave = false;
  public rainbow = false;

  constructor(public field: TileField, public controller: Controller) {
    super(field, controller);
  }

  ////////////////////////////////////////////////////////////////////////////

  private resetValues(): void {
    this.open.clear();
    this.closed.clear();
  }

  public onUpdateStart(tile: Tile): void {
    this.resetValues();
    this.open.add(tile);
  }

  public onUpdateEnd(tile: Tile): void {
    this.resetValues();
    if (this.controller.startTile != null) {
      this.open.add(this.controller.startTile);
    }
  }

  ////////////////////////////////////////////////////////////////////////////

  public async start(): Promise<void> {
    super.start();

    if (this.controller.startTile == null || this.controller.endTile == null) {
      this.started = false;

      alert("Start or end missing!");
      return;
    }

    const search = true; // Small hack, so that my IDE doesn't complain.
    while (search) {
      // ugly hack atm, better thange this later
      await new Promise<void>((accept) => {
        setTimeout(accept, this.delay);
      });

      // h cost = distance from end
      // g cost = distance from start
      // f cost = g cost + h cost
      const current = getTileWithLowestFCost(this);
      if (current == null) {
        this.started = false;

        Swal.fire({
          title: ":(",
          html: "Could not determine the path.",
          icon: "error",
        });
        return;
      }
      console.log("[Debug] Current with lowest f-cost:", current);

      // make tile red
      current.updateColor("#FF0000", false);

      // remove current from open
      this.open.delete(current);

      // add current to closed
      this.closed.add(current);

      // check if target node has been found
      if (current == this.controller.endTile) {
        this.started = false;
        this.found = true;

        // Easteregg
        if (this.rainbow) {
          // Make the background colors more pale
          this.open.forEach((open) => open.updateColor("#BBFFFF"));
          this.closed.forEach((open) => open.updateColor("#FFBBFF"));
          this.controller.field.tiles
            .filter((tile) => tile.selection == Selection.OBSTACLES)
            .forEach((tile) => tile.updateColor("FFFFFF"));

          this.controller.endTile.updateRandomColor(true, true);
        } else {
          this.controller.endTile.updateColor("#0000FF", false, true);
        }

        Swal.fire({
          title: ":)",
          html: "Path found!",
          icon: "success",
        });

        return;
      }

      let pl = -1;
      for (const neighbour of findNeighbours(
        this,
        current,
        true,
        this.strave
      )) {
        // check if already closed
        if (this.closed.has(neighbour)) {
          continue;
        }

        const pathLength = neighbour.getPathLength() + 1;
        const isInOpen = this.open.has(neighbour);
        if (pl == -1 || pathLength < pl || !isInOpen) {
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
}
