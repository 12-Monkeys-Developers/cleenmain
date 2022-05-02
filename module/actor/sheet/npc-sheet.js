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
      width: 800,
      height: 700,
      tabs: [],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    context.skills = context.items.filter(item => item.type === "skill" && item.data.reference!=="defence");
    context.defenceSkill = context.items.filter(item => item.type === "skill" && item.data.reference==="defence")[0];
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
    html.find(".npcdefence-edit").change(this._onNpcDefenceEdit.bind(this)); 
  }

  _onNpcDefenceRoll(event) {
    event.preventDefault();
    let defenceSkill = this.actor.items.filter(item => item.type === "skill" && item.data.data.reference==="defence")[0];
    return this.actor.check(defenceSkill.data._id, "skill");
  }

  _onNpcDefenceEdit(event){
    event.preventDefault();
    let defenceSkill = this.actor.items.filter(item => item.type === "skill" && item.data.data.reference==="defence")[0];
    if(defenceSkill === undefined) return;
    const element  = event.currentTarget;
    let field = element.dataset.field;
    let newValue;
    if(element.type === "checkbox") newValue = element.checked;
    else if(element.type === "number") newValue = element.valueAsNumber;
    else newValue = element.value;
    return defenceSkill.update({[field]: newValue});
  }
}
