import { TileField } from "./tilefield";
import Swal from "sweetalert2";
import { Tile } from "./tile";
import { AStarPathfinder, Pathfinder } from "./pathfinder";

export enum State {}
export enum Selection {
  NONE,
  MARK_START_POINT,
  MARK_END_POINT,
  OBSTACLES,
  START,
}

export class Controller {
  public selection: Selection = Selection.MARK_START_POINT;

  public startTile: Tile | null = null;
  public endTile: Tile | null = null;

  private pathfinder: Pathfinder;

  constructor(public field: TileField) {
    this.pathfinder = new AStarPathfinder(field, this);

    // Update "Control Tiles"
    this.field.getTileMatrix(0, 0)?.updateColor("#2ecc71");

    this.field.on("mousedown", (event: MouseEvent) => {
      const tile = this.field.getTileAbsolute(event.clientX, event.clientY);
      if (tile == null) {
        return;
      }

      // Top left
      // Change selection
      if (tile.id === 0) {
        this.selection++;
        if (this.selection >= Object.keys(Selection).length / 2) {
          this.selection = 0;
        }

        showTimed(
          100,
          "Updated Selection",
          "Selected: <strong>" +
            Selection[this.selection] +
            "</strong> | Closes in <b></b>"
        );
      } else {
        // Update
        switch (this.selection) {
          case Selection.MARK_START_POINT: {
            console.log("Start tile:", this.startTile);
            if (this.startTile != null) {
              console.log("Found!");
              this.startTile.updateSelection(Selection.NONE);
            }
            if (
              tile.updateSelection(Selection.MARK_START_POINT) ==
              Selection.MARK_START_POINT
            ) {
              this.startTile = tile;
              this.pathfinder.onUpdateStart(this.startTile);
            } else {
              showTimed(1000, "Error", "Start-Tile not updated!");
            }
            break;
          }
          case Selection.MARK_END_POINT: {
            if (this.endTile != null) {
              this.endTile.updateSelection(Selection.NONE);
            }
            if (
              tile.updateSelection(Selection.MARK_END_POINT) ==
              Selection.MARK_END_POINT
            ) {
              this.endTile = tile;
              this.pathfinder.onUpdateEnd(this.endTile);
            } else {
              showTimed(1000, "Error", "End-Tile not updated!");
            }
            break;
          }
          case Selection.OBSTACLES: {
            tile.updateSelection(this.selection);
            break;
          }
          case Selection.START: {
            this.pathfinder.start();
            this.pathfinder.onMouseDown(event, tile);
          }
        }
      }
    });
  }
}

function showTimed(duration: number, title: string, html: string): void {
  let timerInterval: NodeJS.Timeout;

  Swal.fire({
    title: title,
    html: html,
    timer: duration,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      timerInterval = setInterval(() => {
        const content = Swal.getContent();
        if (content) {
          const b = content.querySelector("b");
          if (b) {
            b.textContent = "" + Swal.getTimerLeft();
          }
        }
      }, 100);
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });
}
