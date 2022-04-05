import { CemBaseActorSheet } from "./base-sheet.js";

export default class NpcSheet extends CemBaseActorSheet {

  /**
   * @constructor
   * @param  {...any} args
   */
  constructor(...args) {
    super(...args);
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/cleenmain/templates/actor/npc.html",
      classes: ["cleenmain", "sheet", "actor", "npc"],
      width: 900,
      height: 900,
      tabs: [],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    context.skills = context.items.filter(function(item){return item.type === "skill"});

    context.isPlayer = false;
    context.isNpc = true;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    //html.find(".npcskill-roll").click(this._onNpcSkillRoll.bind(this));
  }

  _onNpcSkillRoll(event) {
    event.preventDefault();

    const itemId = $(event.currentTarget).parents(".item").data('itemId');  
   
    return this.actor.check(itemId, "weapon-attack"); 
    /*
    let element = event.currentTarget;
    let attribute = element.dataset.attribute;
    let itemType = element.dataset.type;
    this.actor.roll({ type: itemType, attribute: attribute });
    */
  }
}
