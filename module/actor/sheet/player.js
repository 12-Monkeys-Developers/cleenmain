import { BaseSheet } from "./base.js";

export default class CleenmainPlayerSheet extends BaseSheet {

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
      height: 800,
      width: 700,
      template: "systems/cleenmain/templates/actor/player.html",
      classes: ["cleenmain", "sheet", "actor", "player"],
      tabs: [
          {
              navSelector: ".sheet-tabs",
              contentSelector: ".sheet-body",
              initial: "combat"
          },
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
    context.id = this.actor.id;
    context.isPlayer = true;
    context.config = CONFIG.cleenmain;
    context.editable = this.isEditable,
    context.boons = context.actor.data.items.filter(function(item){return item.type==="boon"});
    context.armors = context.actor.data.items.filter(function(item){return item.type==="armor"});
    context.weapons = context.actor.data.items.filter(function(item){return item.type==="weapon"});
    context.equipments = context.actor.data.items.filter(function(item){return item.type==="equipment"});
    context.biodatas = context.actor.data.items.filter(function(item){return item.type==="biodata"});

    //alphabetic order for skills
    let skilllist = this.actor.data.items.filter(function(item){return item.type==="skill"});
    context.skills =  skilllist.sort(function (a, b) {
      return a.data.name.localeCompare(b.data.name);
    });

    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    return context;
  }
}
