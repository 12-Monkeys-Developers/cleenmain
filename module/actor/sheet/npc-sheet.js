import { CemBaseActorSheet } from "./base-sheet.js";

export default class NpcSheet extends CemBaseActorSheet {

  /**
    * @constructor
    * @param  {...any} args
    */
   constructor(...args) {
    super(...args);
  } 
  
  /**
   * @override
   */
  static get defaultOptions(){
      return mergeObject(super.defaultOptions, {
        template: "systems/cleenmain/templates/actor/npc.html",
        classes: ["cleenmain", "sheet", "actor", "npc"],
        width: 900,
        height: 900,
        tabs: [
        ]
      });
  }

  /**
   * @override
   */
  getData() {
    const context = super.getData();

    const actorData = this.actor.data.toObject(false);
    context.data = actorData.data;
    context.flags = actorData.flags;
    context.id= this.actor.id;
    context.isPlayer= false;
    context.config= CONFIG.CLEENMAIN;
    context.editable= this.isEditable,
    context.boons= context.actor.data.items.filter(function(item){return item.type==="boon"});
    context.skills= context.actor.data.items.filter(function(item){return item.type==="skill"});
    context.weapons= context.actor.data.items.filter(function(item){return item.type==="weapon"});
    context.equipments = context.actor.data.items.filter(function(item){return item.type==="equipment"});
    context.numberofplayers = game.settings.get('cleenmain', 'numberOfPlayers');

    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked"); 
    return context;
  }
  

  activateListeners(html){
    super.activateListeners(html);
    
    html.find(".npcskill-roll").click(this._onNpcSkillRoll.bind(this));
  }
  
  _onNpcSkillRoll(event){
    event.preventDefault();
    let element= event.currentTarget;
    let attribute = element.dataset.attribute;
    let itemType = element.dataset.type;
    this.actor.roll({type: itemType, attribute: attribute});
  }
}
    