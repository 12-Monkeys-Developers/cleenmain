import { CemBaseActorSheet } from "./base-sheet.js";

export default class PlayerSheet extends CemBaseActorSheet {

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
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "combat"}],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: ".droppable" }]
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
    context.config = CONFIG.CLEENMAIN;
    context.editable = this.isEditable,
    context.boons = context.actor.data.items.filter(function(item){return item.type==="boon"});
    context.armors = context.actor.data.items.filter(function(item){return item.type==="armor"});
    context.weapons = context.actor.data.items.filter(function(item){return item.type==="weapon"});
    context.equipments = context.actor.data.items.filter(function(item){return item.type==="equipment"});

    //alphabetic order for skills
    let skilllist = this.actor.data.items.filter(function(item){return item.type==="skill"});
    context.skills =  skilllist.sort(function (a, b) {
      return a.data.name.localeCompare(b.data.name);
    });

    context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

    return context;
  }

      /** @override */
      _onDrop(event) {
        event.preventDefault();
        if (!this.options.editable) return false;
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }
        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return false;
        }
    }

     /**
     * Handle dropping of an item reference or item data onto an Item Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
    _onDropItem(event, data) {
        Item.fromDropData(data).then(item => {
              const itemData = duplicate(item.data);
              switch (itemData.type) {
                  case "skill":
                      return this._onDropSkillItem(event, itemData);
                  default:
                      return super._onDropItem(event,data);
              }
      });
    }

    /**
     * 
     * @param {*} event 
     * @param {*} itemData 
     * @returns 
     */
     _onDropSkillItem(event, itemData) {
        console.log('skill',itemData);
        event.preventDefault();
        //const li = event.target.closest(".item");
        const id = event.target.parentElement.dataset['itemId'];
        const target = this.actor.items.get(id);
        if (target.type !== "weapon") return;
        console.log('target',target);
        let targetData = duplicate(target.data);
        targetData.data.skillname = itemData.name;
        targetData.data.skillvalue = parseInt(itemData.data.value);
        this.actor.updateEmbeddedDocuments('Item', [targetData]);
    }
}
