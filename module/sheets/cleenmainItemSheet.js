export default class CleenmainItemSheet extends ItemSheet {

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      resizable: true,
      classes: ["cleenmain", "sheet", "item"]
    });
  }

  get template() {
    return `systems/cleenmain/templates/sheets/${this.item.data.type}-sheet.html`;
  }

  getData() {
      const context = super.getData();

      let sheetData = {
        id:this.item.id,
        owner: this.object.isOwner,
        editable : this.isEditable,
        item: context.item,
        data: context.item.data.data,
        config: CONFIG.cleenmain
      }
  
      return sheetData;
    }

}