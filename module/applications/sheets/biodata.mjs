import CemItemSheet from "./item.mjs";

export default class CemBiodataSheet extends CemItemSheet {
    static DEFAULT_OPTIONS = {
  };

//TODO DRagDRop

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "biodata";
  
    static PARTS = {
      header: {
        template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
      },
      description: {
        template: `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
      },
    };
}