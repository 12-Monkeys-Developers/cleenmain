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
      config: CONFIG.cleenmain,
      atouts: context.actor.data.items.filter(function(item){return item.type="atout"}),
      armor: context.actor.data.items.filter(function(item){return item.type="armor"}),
      weapons: context.actor.data.items.filter(function(item){return item.type="weapon"}),
      equipments: context.actor.data.items.filter(function(item){return item.type="equipment"})
    }

    return sheetData;
  }

  activateListeners(html){
    html.find(".item-create").click(this._onItemCreate.bind(this));
    super.activateListeners(html)
  }

  _onItemCreate(event){
    event.preventDefault();
    let element=event.currentTarget;
    let itemData = {
      name: game.i18n.localize("cleenmain.atout.newatout"),
      type: element.dataset.type
    }
    return(this.actor.createOwnedItem(itemData));
  }
}