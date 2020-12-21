import { Controller } from "./controller";
import { TileField } from "./tilefield";

export class Pathfinder {
  constructor(public field: TileField, public controller: Controller) {}
}
