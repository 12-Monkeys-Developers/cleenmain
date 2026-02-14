import CemItemSheet from "./item.mjs";

export default class CemEquipmentSheet extends CemItemSheet {
    static DEFAULT_OPTIONS = {
  };

//TODO DRagDRop

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "equipment";
  
    static PARTS = {
      header: {
        template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
      },
      description: {
        template: `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
      },
    };
}