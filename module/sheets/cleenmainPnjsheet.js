export default class CleenmainPnjSheet extends ActorSheet {

    static get defaultOptions(){
      return mergeObject(super.defaultOptions, {
        template: "systems/cleenmain/templates/sheets/pnj-sheet.html",
        classes: ["cleenmain", "sheet", "actor", "pnj"],
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
      context.isPj= false;
      context.config= CONFIG.cleenmain;
      context.editable= this.isEditable,
      context.atouts= context.actor.data.items.filter(function(item){return item.type==="atout"});
      context.skills= context.actor.data.items.filter(function(item){return item.type==="skill"});
      context.weapons= context.actor.data.items.filter(function(item){return item.type==="weapon"});
      context.equipments= context.actor.data.items.filter(function(item){return item.type==="equipment"});
      context.unlocked = true;
      context.numberofpj = game.settings.get('cleenmain', 'numberOfPlayers');
  
      return context;
    }
  

    activateListeners(html){
        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".inline-edit").change(this._onAtoutEdit.bind(this));
        html.find("item-edit").click(this._onItemEdit.bind(this));
        html.find("item-delete").click(this._onItemDelete.bind(this));
    
    
        html.find(".item-roll").click(this._onItemRoll.bind(this));
    
        super.activateListeners(html)
      }
    
      _onItemCreate(event){
        event.preventDefault();
        let element=event.currentTarget;
        let itemData = {
          name: game.i18n.localize("cleenmain.atout.newatout"),
          type: element.dataset.type
        }
        console.log("itemdata: ",itemData);
        return(this.actor.createEmbeddedDocuments("Item", [itemData]));
      }
      _onAtoutEdit(event){
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
        console.log("element: ", element);
        let itemId = element.closest(".item").dataset.itemId;
        let item = this.actor.items.get(itemId);
      
        item.sheet.render(true);
      }    
    
      _onItemDelete(event){
        event.preventDefault();
        let element= event.currentTarget;
        let itemId = element.closest(".item").dataset.itemId;
      
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      }
      
      _onItemRoll(event){
        event.preventDefault();
        let element= event.currentTarget;
        let itemId = element.dataset.id;
        let itemType = element.dataset.type;
        this.actor.roll({type: itemType, itemId: itemId});
      }
    
    }
    