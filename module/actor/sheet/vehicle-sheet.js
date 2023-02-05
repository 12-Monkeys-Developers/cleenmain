import { CemBaseActorSheet } from "./base-sheet.js";

export default class VehicleSheet extends CemBaseActorSheet {
  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cleenmain/templates/actor/vehicle.html",
      classes: ["cleenmain", "sheet", "actor", "vehicle"],
      width: 650,
      height: 600,
      tabs: [],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".roll-damage-collision").click(this._onRollCollisionDamage.bind(this));
    html.find(".roll-damage-distance").click(this._onRollDistanceDamage.bind(this));
  }

  _onRollCollisionDamage(event) {
    event.preventDefault();
    const damage = event.currentTarget.dataset.damage;
    this.actor.rollDamage('vehicle-collision', damage);
  }

  _onRollDistanceDamage(event) {
    event.preventDefault();   
    const damage = event.currentTarget.dataset.damage;
    this.actor.rollDamage('vehicle-distance', damage);
  }
}
