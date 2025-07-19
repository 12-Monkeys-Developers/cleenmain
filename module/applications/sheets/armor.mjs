import CemItemSheet from "./item.mjs";

export default class CemArmorSheet extends CemItemSheet {
    static DEFAULT_OPTIONS = {
    id: "armor",
  };

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "armor";
  
    static PARTS = {
      header: {
        template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
      },
      body: {
        template: `systems/cleenmain/templates/sheets/armor.hbs`,
      },
      description: {
        template: `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
      },
    };
}