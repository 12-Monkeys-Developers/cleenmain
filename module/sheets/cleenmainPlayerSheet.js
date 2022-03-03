export default class CleenmainPlayerSheet extends ActorSheet {

  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      template: "systems/cleenmain/templates/sheets/player-sheet.html",
      classes: ["cleenmain", "sheet", "actor", "player"],
      width: 700,
      height: 800,
      tabs: [
          {
              navSelector: ".sheet-tabs",
              contentSelector: ".sheet-body",
              initial: "combat"
          },
      ]
    });
  }
  
  itemContextMenu = [{
    name: game.i18n.localize("cleenmain.sheet.edit"),
    icon: '<i class="fas fa-edit"></i>',
    callback: element => {
      console.log("element: ", element);
      const item = this.actor.items.get(element.data("item-id"));
      item.sheet.render(true);
    }
  },
  {
    name: game.i18n.localize("cleenmain.sheet.delete"),
    icon: '<i class="fas fa-trash"></i>',
    callback: element => {
      this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")])
    }
  }];

  async getData() {
    const context = super.getData();

    const actorData = this.actor.data.toObject(false);
    context.data = actorData.data;
    context.flags = actorData.flags;
    context.id= this.actor.id;
    context.isPlayer= true;
    context.config= CONFIG.cleenmain;
    context.editable= this.isEditable,
    context.boons= context.actor.data.items.filter(function(item){return item.type==="boon"});
    context.skills= context.actor.data.items.filter(function(item){return item.type==="skill"});
    context.armors= context.actor.data.items.filter(function(item){return item.type==="armor"});
    context.weapons= context.actor.data.items.filter(function(item){return item.type==="weapon"});
    context.equipments= context.actor.data.items.filter(function(item){return item.type==="equipment"});

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if(flagData){
      context.unlocked = true;
    }
    else{
      context.unlocked = false;
    }

    /*let sheetData = {
      id:this.actor.id,
      editable: this.editable,
      actor: foundry.utils.deepClone(this.actor),
      data: foundry.utils.deepClone(this.actor.data.data),
      config: CONFIG.cleenmain,
      boons: context.actor.data.items.filter(function(item){return item.type==="boon"}),
      armor: context.actor.data.items.filter(function(item){return item.type==="armor"}),
      weapons: context.actor.data.items.filter(function(item){return item.type==="weapon"}),
      equipments: context.actor.data.items.filter(function(item){return item.type==="equipment"})
    }*/

    return context;
  }

  activateListeners(html){
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".inline-edit").change(this._onEmbeddedItemEdit.bind(this));
    html.find("item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-open-sheet").click(this._onItemEdit.bind(this));
    html.find(".inline-delete").click(this._onEmbeddedItemDelete.bind(this));
    html.find(".sheet-unlock").click(this._onSheetUnlock.bind(this));

    new ContextMenu(html, ".boon-card", this.itemContextMenu);

    html.find(".item-roll").click(this._onItemRoll.bind(this));

    super.activateListeners(html)
  }

  _onItemCreate(event){
    event.preventDefault();
    let element=event.currentTarget;
    let newName = "New";
    switch (element.type){
      case "boon":
        newName = game.i18n.localize("cleenmain.boon.add");
        break;
      case "weapon":
        newName = game.i18n.localize("cleenmain.weapon.add");
        break;
      case "skill":
        newName = game.i18n.localize("cleenmain.skill.add");
        break;
      case "armor":
        newName = game.i18n.localize("cleenmain.armor.add");
        break;
      case "equipment":
        newName = game.i18n.localize("cleenmain.equipment.add");
        break;
}
    
    let itemData = {
      name: newName,
      type: element.dataset.type
    }
    return(this.actor.createEmbeddedDocuments("Item", [itemData]));
  }
  _onEmbeddedItemEdit(event){
    event.preventDefault();
    let element=event.currentTarget;
    const itemId = element.id;
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    let newValue;
    if(element.type === "checkbox"){
      newValue = element.value == "1";
    }
    else newValue = element.value;
    return item.update({[field]: newValue});
  }
  
  _onItemEdit(event){
    event.preventDefault();
    let element= event.currentTarget;
    let itemId = element.dataset.id;
    let item = this.actor.items.get(itemId);
  
    item.sheet.render(true);
  }

  _ontrainingsEdit(event){
    event.preventDefault();
    let element=event.currentTarget;
    console.log("element: ", element);
    const itemId = element.id
    let item = this.actor.items.get(itemId);
    let field = element.dataset.field;
    let newValue;
    if(element.type === "checkbox"){
      newValue = element.value == "1";
    }
    else newValue = element.value
    return item.update({[field]: newValue});
  }


  _onEmbeddedItemDelete(event){
    event.preventDefault();
    let element=event.currentTarget;
    let itemId = element.dataset.id;
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onSheetUnlock(event){
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if(flagData){
        await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    }
    else{
        await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    }
    this.actor.sheet.render(true);
  }

  
  _onItemRoll(event){
    event.preventDefault();
    let element= event.currentTarget;
    let itemId = element.dataset.id;
    let itemType = element.dataset.type;
    this.actor.roll({type: itemType, itemId: itemId});
  }

}
