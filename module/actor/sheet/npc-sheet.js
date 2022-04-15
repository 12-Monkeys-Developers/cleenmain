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
      width: 600,
      height: 700,
      tabs: [],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    context.skills = context.items.filter(item => item.type == "skill");
    context.isBoss = this.actor.isBoss();
    context.isSupport = this.actor.isSupport();
    context.eliteRuleset = (this.actor.data.data.level === "secondfiddle") && game.settings.get('cleenmain', 'advancedRules');
    context.eliteRulesetModif = context.eliteRuleset && context.unlocked;

    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".npcdefence-roll").click(this._onNpcDefenceRoll.bind(this));
  }

  _onNpcDefenceRoll(event) {
    event.preventDefault();  
    return this.actor.check(null, "npcdefence");
  }
}
