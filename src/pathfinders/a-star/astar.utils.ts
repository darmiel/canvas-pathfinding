import { Tile } from "../../tile/tile";
import { AStarPathfinder } from "./astar.pathfinder";
import { Selection } from "../../controller";

export function getTileWithLowestFCost(astar: AStarPathfinder): Tile | null {
  let cost = -1;
  let lt: Tile | null = null;

  astar.open.forEach((tile) => {
    if (
      astar.controller.startTile == null ||
      astar.controller.endTile == null
    ) {
      return;
    }

    const f = tile.fCost(astar.controller.startTile, astar.controller.endTile);
    if (cost == -1 || cost > f) {
      cost = f;
      lt = tile;
    }
  });

  return lt;
}

export function findNeighbours(
  astar: AStarPathfinder,
  test: Tile,
  skipObstacles = true,
  canStrave = true
): Tile[] {
  const res: Tile[] = [];

  const x = test.xId;
  const y = test.yId;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // skip center (clicked)
      if (i == 1 && j == 1) {
        continue;
      }

      if (!canStrave) {
        if (
          (i == 0 && j == 0) ||
          (i == 0 && j == 2) ||
          (i == 2 && j == 0) ||
          (i == 2 && j == 2)
        ) {
          continue;
        }
      }

      const tile = astar.field.getTileMatrix(x - 1 + i, y - 1 + j);

      if (tile != null) {
        // x 0 and y 0 is a special node
        if (tile.xId == 0 && tile.yId == 0) {
          continue;
        }

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
