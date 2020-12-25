import Swal from "sweetalert2";
import { TileField } from "./tile/tilefield";
import { Tile } from "./tile/tile";
import { Pathfinder } from "./pathfinders/pathfinder.a";
import { AStarPathfinder } from "./pathfinders/a-star/astar.pathfinder";

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

  public pathfinder: Pathfinder;
  private dragging = false;

  constructor(public field: TileField) {
    this.pathfinder = new AStarPathfinder(field, this);

    // Update "Control Tiles"
    this.field.getTileMatrix(0, 0)?.updateColor("#2ecc71");
    this.field.on("mousedown", (event: MouseEvent) => this.updateMouse(event));

    this.registerDragging();
  }

  public updateTile(tile: Tile): void {
    // Top left
    // Change selection
    if (tile.id === 0) {
      this.dragging = false;

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
      this.dragging = true;

      // Update
      switch (this.selection) {
        case Selection.MARK_START_POINT: {
          if (this.startTile != null) {
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
          if (this.pathfinder.started) {
            showTimed(1000, "Error", "Pathfinding already started!");
          } else if (this.pathfinder.found) {
            showTimed(
              1000,
              "Error",
              "Pathfinding already finished! Please reload page"
            );
          } else {
            this.pathfinder.start();
          }
        }
      }
    }
  }

  public updateMouse(event: MouseEvent): void {
    const tile = this.field.getTileAbsolute(event.clientX, event.clientY);
    if (tile == null) {
      return;
    }

    this.updateTile(tile);
  }

  public registerDragging(): void {
    this.field.on("mouseup", () => {
      this.dragging = false;
    });

    this.field.on("enter", (tile: Tile) => {

      // if special tile, ignore
      if (tile.xId == 0 && tile.yId == 0) {
        return;
      }

      // check if dragging
      if (this.dragging) {
        // check if selection is not start
        if (this.selection == Selection.OBSTACLES) {
          this.updateTile(tile);
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
  });
}
