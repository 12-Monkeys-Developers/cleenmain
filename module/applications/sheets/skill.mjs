import CemItemSheet from "./item.mjs";

export default class CemBoonSheet extends CemItemSheet {
    static DEFAULT_OPTIONS = {
    id: "skill",
  };

//TODO DRagDRop

  /**
   * the type of the item
   * @type {string}
   */
  static itemType = "skill";
  
    static PARTS = {
      header: {
        template: `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
      },
      body: {
        template: `systems/cleenmain/templates/sheets/skill.hbs`,
      }
    };
}