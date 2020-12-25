import { EventEmitter } from "events";
import { Controller } from "../controller";
import { Tile } from "../tile/tile";
import { TileField } from "../tile/tilefield";

export abstract class Pathfinder extends EventEmitter {
  public started = false;
  public found = false;

  constructor(public field: TileField, public controller: Controller) {
    super();
  }

  public start(): void {
    this.started = true;
  }

  public abstract onUpdateStart(tile: Tile): void;
  public abstract onUpdateEnd(tile: Tile): void;
}