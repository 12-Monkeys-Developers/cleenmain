import CemActorSheet from "./actor.mjs";
export default class CemVehicleSheet extends CemActorSheet {
  static DEFAULT_OPTIONS = {
    //classes: ["cleenmain", "cleenmain-scrollable", "actor", "sheet", "app", "window-app"],
    classes: ["vehicle"],
    id: "vehicle",
    actions: {
      rollDamageCollision: this._onRollCollisionDamage,
      rollDamageDistance: this._onRollDistanceDamage,
    },
    position: {
      width: 650,
      height: 600,
    },
  };

  /**
   * the type of the item
   * @type {string}
   */
  static actorType = "vehicle";

  static PARTS = {
    body: {
      template: `systems/cleenmain/templates/sheets/vehicle.hbs`,
    },
  };

  static async _onRollCollisionDamage(event, target) {
    event.preventDefault();
    const damage = target.dataset.damage;
    this.actor.rollDamage("vehicle-collision", damage);
  }

  static async _onRollDistanceDamage(event, target) {
    event.preventDefault();
    const damage = target.dataset.damage;
    this.actor.rollDamage("vehicle-distance", damage);
  }
}
