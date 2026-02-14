import CemActorSheet from "./actor.mjs";
export default class CemNpcSheet extends CemActorSheet {
  static DEFAULT_OPTIONS = {
    //classes: ["cleenmain", "cleenmain-scrollable", "actor", "sheet", "app", "window-app"],
    classes: ["npc"],
    actions: {
      npcdefenceRoll: this._onNpcDefenceRoll,
    },
    position: {
      width: 800,
      height: 700,
    },
  };

  /**
   * the type of the actor
   * @type {string}
   */
  static actorType = "npc";

  static PARTS = {
    body: {
      template: `systems/cleenmain/templates/sheets/npc.hbs`,
    },
    boons: {
      template: `systems/cleenmain/templates/sheets/partials/boons.hbs`,
    },
    bio: {
      template: `systems/cleenmain/templates/sheets/partials/bio.hbs`,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.skills = this.actor.items.filter((item) => item.type === "skill" && item.system.reference !== "defence");
    context.defenceSkill = this.actor.items.filter((item) => item.type === "skill" && item.system.reference === "defence")[0];
    context.isBoss = this.actor.isBoss();
    context.isSupport = this.actor.isSupport();
    context.eliteRuleset = game.settings.get("cleenmain", "advancedRules");
    context.eliteRulesetModif = context.eliteRuleset && context.unlocked;
    context.equipmenthtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.equipment, { async: false });

    return context;
  }

  static async _onNpcDefenceRoll(event, target) {
    let defenceSkill = this.actor.items.filter((item) => item.type === "skill" && item.system.reference === "defence")[0];
    return this.actor.check(defenceSkill._id, "skill");
  }

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    // Inputs with on class `skillEdit`
    const skill = this.element.querySelectorAll(".npcdefence-edit");
    for (const input of skill) {
      // keep in mind that if your callback is a named function instead of an arrow function expression
      // you'll need to use `bind(this)` to maintain context
      input.addEventListener("change", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        let defenceSkill = this.actor.items.filter((item) => item.type === "skill" && item.system.reference === "defence")[0];
        if (defenceSkill === undefined) return;
        const element = e.currentTarget;
        let field = element.dataset.field;
        let newValue;
        if (element.type === "checkbox") newValue = element.checked;
        else if (element.type === "number") newValue = element.valueAsNumber;
        else newValue = element.value;
        return defenceSkill.update({ [field]: newValue });
      });
    }
  }
}
