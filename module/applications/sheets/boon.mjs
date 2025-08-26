import CemItemSheet from "./item.mjs";

export default class CemBoonSheet extends CemItemSheet {
    static DEFAULT_OPTIONS = {
  };

//TODO DRagDRop

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "boon";
  
    static PARTS = {
      header: {
        template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
      },
      body: {
        template: `systems/cleenmain/templates/sheets/boon.hbs`,
      },
      description: {
        template: `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
      },
    };
}