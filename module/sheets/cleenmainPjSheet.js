export default class CleenmainPjSheet extends ActorSheet {

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      template: "systems/cleenmain/templates/sheets/pj-sheet.html",
      classes: ["cleenmain", "sheet", "pj"]
    });
  }
  
  getData() {
    const context = super.getData();

    let sheetData = {
      id:this.actor.id,
      editable: this.isEditable,
      actor: context.actor,
      data: context.actor.data.data,
      config: CONFIG.cleenmain
    }

    return sheetData;
  }
}