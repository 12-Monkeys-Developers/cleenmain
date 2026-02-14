import CemItemSheet from "./item.mjs";

export default class CemWeaponSheet extends CemItemSheet {
  static DEFAULT_OPTIONS = {
    position: {
      width: 740,
      height: 340,
    },
  };

  //TODO DRagDRop

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "weapon";

  static PARTS = {
    header: {
      template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
    },
    body: {
      template: `systems/cleenmain/templates/sheets/weapon.hbs`,
    },
    description: {
      template: `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
    },
  };
}
