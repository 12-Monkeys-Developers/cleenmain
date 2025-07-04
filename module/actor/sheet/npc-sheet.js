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
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/cleenmain/templates/actor/npc.html",
      classes: ["cleenmain", "sheet", "actor", "npc"],
      width: 800,
      height: 700,
      tabs: [],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }]
    });
  }

  /** @override */
  async getData(options) {
    const context = await super.getData(options);

    context.skills = context.items.filter(item => item.type === "skill" && item.system.reference !== "defence");
    context.defenceSkill = context.items.filter(item => item.type === "skill" && item.system.reference === "defence")[0];
    context.isBoss = this.actor.isBoss();
    context.isSupport = this.actor.isSupport();
    context.eliteRuleset = game.settings.get('cleenmain', 'advancedRules');
    context.eliteRulesetModif = context.eliteRuleset && context.unlocked;
    context.equipmenthtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.equipment, {async:false});

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
    let defenceSkill = this.actor.items.filter(item => item.type === "skill" && item.system.reference === "defence")[0];
    return this.actor.check(defenceSkill._id, "skill");
  }

  _onNpcDefenceEdit(event){
    event.preventDefault();
    let defenceSkill = this.actor.items.filter(item => item.type === "skill" && item.system.reference === "defence")[0];
    if(defenceSkill === undefined) return;
    const element  = event.currentTarget;
    let field = element.dataset.field;
    let newValue;
    if (element.type === "checkbox") newValue = element.checked;
    else if(element.type === "number") newValue = element.valueAsNumber;
    else newValue = element.value;
    return defenceSkill.update({[field]: newValue});
  }

}
