import Swal from "sweetalert2";
import { Controller } from "./controller";
import { AStarPathfinder } from "./pathfinders/a-star/astar.pathfinder";
import { TileField } from "./tile/tilefield";

class Startup {
  public static main(): void {
    const canvas = <HTMLCanvasElement>document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    if (canvas == null || ctx == null) {

      Swal.fire({
        title: "Error",
        html: "Canvas not found.",
        icon: "error"
      });

      return;
    }

    const height = (document.defaultView?.innerHeight ?? 100) - 25; // 25 offset
    const width = (document.defaultView?.innerWidth ?? 100) - 25; // 25 offset

    const field = new TileField(canvas, ctx, width, height, 13);
    field.init();

    const controller = new Controller(field);
    if (controller.pathfinder instanceof AStarPathfinder) {
      const params = new URLSearchParams(location.search);
      if (params.has("delay")) {
        controller.pathfinder.delay = parseInt(params.get("delay") ?? "50");
      }
      if (params.has("strave")) {
        controller.pathfinder.strave = true;
      }
      if (params.has("rainbow")) {
        controller.pathfinder.rainbow = true;
      }
    }
  }
}

Startup.main();
