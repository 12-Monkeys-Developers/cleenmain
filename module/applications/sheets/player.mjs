import { Skills } from "../../common/skills.js";
import CemActorSheet from "./actor.mjs";
const { ux } = foundry.applications;

export default class CemPlayerSheet extends CemActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["player"],
    actions: {
      spendHeroism: this._onSpendHeroismOnePoint,
      spendBiotechboon: this._onSpendBiotechBoon,
      itemState: this._onItemStateUpdate,
      editHTML: this._editHTML,
    },
    position: {
      height: 750,
      width: 850,
    },
    // Custom property that's merged into `this.options`
    dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
  };

  /**
   * the type of the item
   * @type {string}
   */
  static actorType = "player";

  static PARTS = {
    body: {
      template: `systems/cleenmain/templates/sheets/player.hbs`,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.xprules = game.settings.get("cleenmain", "experiencePoints");
    context.protection = this.actor.getArmorProtection();
    let defenceModifier = this.actor.getModifiers().find((modifier) => modifier.type === "behaviour");
    context.defenceModifier = defenceModifier ? defenceModifier.value : 0;
    context.notebookhtml = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.notebook, { async: false });
    context.healthMax = this.actor.healthMax();
    context.rangedBonus = this.actor.rangedBonus();
    context.meleeBonus = this.actor.meleeBonus();
    context.tabs = this._getTabs(["combat", "boons", "equipment", "bio", "notes"]);
    //biotech for wwk module
    context.useBiotech = game.settings.get("cleenmain", "pointsbiotech");

    return context;
  }

  /**
   * Generates the data for the generic tab navigation template
   * @param {string[]} parts An array of named template parts to render
   * @returns {Record<string, Partial<ApplicationTab>>}
   * @protected
   */
  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = "primary";
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "boons";
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: "",
        group: tabGroup,
        // Matches tab property to
        id: "",
        // FontAwesome Icon, if you so choose
        icon: "",
        // Run through localization
        label: "CLEENMAIN.sheet.tab.",
        active: false,
      };
      switch (partId) {
        case "body":
        case "tabs":
          return tabs;
        case "combat":
          tab.id = "combat";
          tab.label += "combat";
          tab.file = "systems/cleenmain/templates/sheets/partials/combat.hbs";
          break;
        case "boons":
          tab.id = "boons";
          tab.label += "boons";
          tab.file = "systems/cleenmain/templates/sheets/partials/boons.hbs";
          break;
        case "equipment":
          tab.id = "equipment";
          tab.label += "equipment";
          tab.file = "systems/cleenmain/templates/sheets/partials/equipment.hbs";
          break;
        case "bio":
          tab.id = "bio";
          tab.label += "bio";
          tab.file = "systems/cleenmain/templates/sheets/partials/bio.hbs";
          break;
        case "notes":
          tab.id = "notes";
          tab.label += "notes";
          tab.file = "systems/cleenmain/templates/sheets/partials/notes.hbs";
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) {
        tab.cssClass = "active";
        tab.active = true;
      }
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  /** @override */
  async _preparePartContext(partId, context, options) {
    await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "combat":
        context.tab = context.tabs[partId];
        break;
      case "boons":
        context.tab = context.tabs[partId];
        break;
      case "equipment":
        context.tab = context.tabs[partId];
        break;
      case "bio":
        context.tab = context.tabs[partId];
        break;
      case "notes":
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }


  /* -------------------------------------------------- */
  /*   DragDrop                                         */
  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector.
   * @param {string} selector       The candidate HTML selector for dragging.
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.actor.isUnlocked;
  }

  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector.
   * @param {string} selector       The candidate HTML selector for the drop target.
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.actor.isUnlocked;
  }

  /* -------------------------------------------------- */

  async _onDropItem(event, item) {
      switch (item.type) {
        case "skill":
          return this._onDropSkillItem(event, item);
        default:
          return super._onDropItem(event, item);
      }
   // });
  }

  /**
   * @name _onDropSkillItem
   * @description Handle the drop of a skill on a weapon item
   * @param {*} event
   * @param {*} item
   * @returns
   */
  _onDropSkillItem(event, item) {
    event.preventDefault();

    // Get the target
    const id = event.target.parentElement.dataset["itemId"];
    const target = this.actor.items.get(id);
    if (!target || target.type !== "weapon") return super._onDropItem(event, item);
    let targetData = foundry.utils.duplicate(target);
    targetData.system.skillName = item.name;
    targetData.system.skillValue = this.actor.getSkillValue(item);

    targetData.system.skillId = item._id;

    this.actor.updateEmbeddedDocuments("Item", [targetData]);
  }


  /* -------------------------------------------------- */


  /**
   *
   * @param {*} event
   */
  static async _onSpendHeroismOnePoint(event, target) {
    event.preventDefault();
    this.actor.useHeroism(1);
  }

  static async _onSpendBiotechBoon(event, target) {
    event.preventDefault();
    this.actor.useBiotech();
  }

  static async _onItemStateUpdate(event, target) {
    event.preventDefault();
    const itemId = target.dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (item === null || item === undefined) {
      return;
    }
    let data;
    switch (item.system.state) {
      case "active":
        data = { _id: item.id, id: item.id, "system.state": "equipped" };
        break;
      case "equipped":
        data = { _id: item.id, id: item.id, "system.state": "other" };
        break;
      default:
        data = { _id: item.id, id: item.id, "system.state": "active" };
        break;
    }

    this.actor.updateEmbeddedDocuments("Item", [data]);
  }
}
