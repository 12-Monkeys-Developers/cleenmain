import { ROLL_TYPE } from "../../common/constants.js";
import { CLEENMAIN } from "../../common/config.js";
const { api, sheets } = foundry.applications;

export default class CemActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cleenmain", "cleenmain-scrollable", "actor", "sheet", "app", "window-app"],
    actions: {
      toggleLockMode: this._toggleLockMode,
      itemCreate: this._onItemCreate,
      itemEdit: this._onItemEdit,
      itemDelete: this._onEmbeddedItemDelete,
      skillRoll: this._onSkillRoll,
      weaponAttackRoll: this._onWeaponAttackRoll,
      weaponDamageRoll: this._onWeaponDamageRoll,
      badShapeRoll: this._onBadShapeRoll,
      infoWindow: this._onInfoClick,
      editHTML: this._editHTML,
    },
    form: {
      submitOnChange: true,
    },
    position: {
      width: 530,
      height: 340,
    },
    tag: "form",
    window: {
      resizable: true,
      icon: "fas fa-gear",
    },
  };
  get title() {
    return `${game.i18n.localize("TYPES.Actor." + this.id)}`;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.document = this.document;
    context.actor = this.actor;
    context.system = this.actor.system;
    context.actorSystem = this.actor.system;
    context.flags = this.actor.flags;
    context.fields = this.document.schema.fields;
    context.systemFields = this.document.system.schema.fields;
    context.id = this.actor.id;
    context.editable = this.isEditable;
    context.config = CLEENMAIN;
    context.isGm = game.user.isGM;
    context.unlocked = this.actor.isUnlocked;
    context.locked = !this.actor.isUnlocked;
    context.boons = this.actor.items.filter((item) => item.type == "boon");
    context.weapons = this.actor.items.filter((item) => item.type == "weapon");
    context.armors = this.actor.items.filter((item) => item.type == "armor");

    // Alphabetic order for equipments
    context.equipments = this.actor.items
      .filter((item) => ["equipment", "armor", "weapon"].includes(item.type))
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    for (let item of context.equipments) {
      item.system.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: false });
    }

    // Alphabetic order for skills
    context.skills = this.actor.items
      .filter((item) => item.type == "skill")
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });

    context.isPlayer = this.actor.isPlayer();
    context.isNpc = this.actor.isNpc();
    context.badShape = this.actor.isInBadShape();
    context.descriptionhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.description, { async: false });

    return context;
  }

  /* -------------------------------------------------- */
  /*   Actions                                          */
  /* -------------------------------------------------- */

  /**
   * Toggle Lock vs. Unlock sheet
   *
   * @this ActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async _toggleLockMode(event, target) {
    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) {
      await this.actor.unsetFlag(game.system.id, "SheetUnlocked");
    } else await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.render();
  }

  /**
   *
   * @param {*} event
   * @returns
   */
  static async _onItemCreate(event, target) {
    let itemData = {
      type: target.dataset.type,
    };
    switch (target.dataset.type) {
      case "boon":
        itemData.name = game.i18n.localize("CLEENMAIN.boon.add");
        break;
      case "weapon":
        itemData.name = game.i18n.localize("CLEENMAIN.weapon.add");
        itemData.system = {
          state: "active",
        };
        break;
      case "skill":
        itemData.name = game.i18n.localize("CLEENMAIN.skill.add");
        break;
      case "armor":
        itemData.name = game.i18n.localize("CLEENMAIN.armor.add");
        itemData.system = {
          state: "active",
        };
        break;
      case "equipment":
        itemData.name = game.i18n.localize("CLEENMAIN.equipment.add");
        break;
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  static async _onItemEdit(event, target) {
    const itemId = target.dataset.itemId;
    let item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  static async _onEmbeddedItemDelete(event, target) {
    const itemId = target.dataset.itemId;
    // Special case : for skill, delete if used in weapon
    if (target.dataset.type == "skill") {
      let items = this.actor.items.filter((i) => i.type == "weapon" && i.system.skillId === itemId);
      items.forEach((element) => {
        //element.update({skillId: null, skillName: "", skillValue: 0, skillValueNpcElite: 0});
        const updates = { _id: element.id, "system.skillId": null, "system.skillName": "", "system.skillValue": 0, "system.skillValueNpcElite": 0 };
        this.actor.updateEmbeddedDocuments("Item", [updates]);
      });
    }
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static async _onSkillRoll(event, target) {
    const itemId = target.dataset.itemId;

    return this.actor.check(itemId, ROLL_TYPE.SKILL);
  }

  static async _onWeaponAttackRoll(event, target) {
    const itemId = target.dataset.itemId;
    return this.actor.check(itemId, ROLL_TYPE.ATTACK);
  }

  static async _onWeaponDamageRoll(event, target) {
    const itemId = target.dataset.itemId;
    return this.actor.check(itemId, ROLL_TYPE.DAMAGE);
  }

  /**
   * @description Handle the two rolls in case of bad shape  resistance roll or willpower roll
   * @param {*} event
   * @returns a roll
   */
  static async _onBadShapeRoll(event, target) {
    let skillName = target.dataset.field;
    const rollSkill = this.actor.items.filter((i) => i.type === "skill" && i.system.reference === skillName)[0];
    if (!rollSkill) return;
    let malusValue = this.actor.system.badShape_noWoundMalus ? 0 : this.actor.system.wounds * 5;
    let options = {
      badShapeRoll: true,
      bonuses: [{ value: " - " + malusValue.toString(), tooltip: game.i18n.format("CLEENMAIN.label.wounds") + ": -" + malusValue.toString() }],
    };
    return this.actor.check(rollSkill.id, "skill", options);
  }
  /**
   * @description Click on Mal en point Icon display an informative Dialog
   * @param {*} event
   * @returns a Dialog about Mal en point
   */
  static async _onInfoClick(event, target) {
    let infoReference = target.dataset.field;
    let infoTemplate = CLEENMAIN.infoTemplate[infoReference];
    if (!infoTemplate) return;
    foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.localize("CLEENMAIN.dialog.display_help_title"), classes: ["cleenmain", "dialog"] },
      cssClasses: ["cleenmain", "dialog"],
      content: infoTemplate,
      rejectClose: false,
      ok: {
        label: game.i18n.localize("CLEENMAIN.dialog.button.close"),
        callback: (event, button, dialog) => this.close,
      },
    });
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
    const skill = this.element.querySelectorAll(".skillEdit");
    for (const input of skill) {
      // keep in mind that if your callback is a named function instead of an arrow function expression
      // you'll need to use `bind(this)` to maintain context
      input.addEventListener("change", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const itemId = $(e.currentTarget).parents(".item").data("itemId");
        let item = this.actor.items.get(itemId);
        const element = e.currentTarget;
        let field = element.dataset.field;
        let newValue;
        if (element.type === "checkbox") newValue = element.checked;
        else if (element.type === "number") newValue = element.valueAsNumber;
        else newValue = element.value;
        return item.update({ [field]: newValue });
      });
    }
  }
}
