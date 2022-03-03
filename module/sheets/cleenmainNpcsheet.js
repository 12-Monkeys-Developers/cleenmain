export default class CleenmainNpcSheet extends ActorSheet {

    static get defaultOptions(){
      return mergeObject(super.defaultOptions, {
        template: "systems/cleenmain/templates/sheets/npc-sheet.html",
        classes: ["cleenmain", "sheet", "actor", "npc"],
        width: 900,
        height: 900,
        tabs: [
        ]
      });
    }
    async getData() {
      const context = super.getData();
  
      const actorData = this.actor.data.toObject(false);
      context.data = actorData.data;
      context.flags = actorData.flags;
      context.id= this.actor.id;
      context.isPlayer= false;
      context.config= CONFIG.cleenmain;
      context.editable= this.isEditable,
      context.boons= context.actor.data.items.filter(function(item){return item.type==="boon"});
      context.skills= context.actor.data.items.filter(function(item){return item.type==="skill"});
      context.weapons= context.actor.data.items.filter(function(item){return item.type==="weapon"});
      context.numberofplayers = game.settings.get('cleenmain', 'numberOfPlayers');

      let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
      if(flagData){
        context.unlocked = true;
      }
      else{
        context.unlocked = false;
      }  
      return context;
    }
  

    activateListeners(html){
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".inline-edit").change(this._onBoonEdit.bind(this));
        html.find(".inline-delete").click(this._onEmbeddedItemDelete.bind(this));
        html.find(".sheet-unlock").click(this._onSheetUnlock.bind(this));
        html.find(".item-open-sheet").click(this._onItemEdit.bind(this));
    
    
        html.find(".item-roll").click(this._onItemRoll.bind(this));
        html.find(".npcskill-roll").click(this._onNpcSkillRoll.bind(this));
    
        super.activateListeners(html)
      }
    
      _onItemCreate(event){
        event.preventDefault();
        let element=event.currentTarget;
        let itemData = {
          name: game.i18n.localize("cleenmain.boon.newboon"),
          type: element.dataset.type
        }
        console.log("itemdata: ",itemData);
        return(this.actor.createEmbeddedDocuments("Item", [itemData]));
      }
      _onBoonEdit(event){
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
      
      _onItemEdit(event){
        event.preventDefault();
        let element= event.currentTarget;
        let itemId = element.dataset.id;
        let item = this.actor.items.get(itemId);
      
        item.sheet.render(true);
      }
    
  _onEmbeddedItemDelete(event){
    event.preventDefault();
    let element=event.currentTarget;
    let itemId = element.dataset.id;
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }
      
      _onItemRoll(event){
        event.preventDefault();
        let element= event.currentTarget;
        let itemId = element.dataset.id;
        let itemType = element.dataset.type;
        this.actor.roll({type: itemType, itemId: itemId});
      }

      _onNpcSkillRoll(event){
        event.preventDefault();
        let element= event.currentTarget;
        let attribute = element.dataset.attribute;
        let itemType = element.dataset.type;
        this.actor.roll({type: itemType, attribute: attribute});
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
    
    }
    