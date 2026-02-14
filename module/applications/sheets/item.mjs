const { api, sheets } = foundry.applications;
import { CLEENMAIN } from "../../common/config.js";

export default class CemItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  //gerer le dragdrop?
  //anciennement   dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
  static DEFAULT_OPTIONS = {
    classes: ["cleenmain", "cleenmain-scrollable", "item", "sheet", "app", "window-app"],
    actions: {
      toggleLockMode: this._toggleLockMode,
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
    return `${game.i18n.localize("TYPES.Item." + this.item.type)}`;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.document = this.document;
    context.item = this.item;
    context.system = this.item.system;
    context.fields = this.document.schema.fields;
    context.systemFields = this.document.system.schema.fields;
    context.id = this.item.id;
    context.editable = this.isEditable;
    context.config = CLEENMAIN;
    context.hasNpcOwner = this.item.parent?.type === "npc";
    context.unlocked = this.item.isUnlocked;
    context.locked = !this.item.isUnlocked;
    if (this.item.parent?.type !== "skill") {
      context.descriptionHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.description, { async: false });
    }
    return context;
  }

  /* -------------------------------------------------- */
  /*   Actions                                          */
  /* -------------------------------------------------- */

  /**
   * Toggle Lock vs. Unlock sheet
   *
   * @this ItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   */
  static async _toggleLockMode(event, target) {
    let flagData = await this.item.getFlag(game.system.id, "SheetUnlocked");
    if (flagData) await this.item.unsetFlag(game.system.id, "SheetUnlocked");
    else await this.item.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    this.render();
  }
}
