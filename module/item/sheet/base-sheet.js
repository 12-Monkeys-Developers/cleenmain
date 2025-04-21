import { CLEENMAIN } from "../../common/config.js";
export default class CemBaseItemSheet extends foundry.appv1.sheets.ItemSheet {

  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
    this.options.submitOnClose = true;
  }

  /**
   * @return the path of the specified item sheet.
   */  
   get template() {
    return `systems/cleenmain/templates/item/${this.item.type}.html`;
  }

  /** 
   * @override
   */  
  static get defaultOptions(){
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      resizable: true,
      classes: ["cleenmain", "sheet", "item"],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  /** 
   * @override
   */
  async getData(options) {
    const context = await super.getData(options);
    let sheetData = {
      id: this.item.id,
      owner: this.object.isOwner,
      editable : this.isEditable,
      item: context.item,
      system: context.item.system,
      config: game.cleenmain.config,
      hasNpcOwner: this.item.parent?.type === "npc"
    }

    return sheetData;
  }

}