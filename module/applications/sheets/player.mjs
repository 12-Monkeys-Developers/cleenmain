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
    id: "player",
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

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#dragDrop.forEach((d) => d.bind(this.element));
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

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent.
   * @protected
   */
  async _onDrop(event) {
    const data = ux.TextEditor.implementation.getDragEventData(event);
    console.log("eventdrop", event);
    console.log("datat", data);

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
   * @name _onDropItem
   * @description Handle dropping of an item reference or item data onto an Item Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropItem(event, data) {
    Item.fromDropData(data).then((item) => {
      const itemData = foundry.utils.duplicate(item);
      switch (itemData.type) {
        case "skill":
          return this._onDropSkillItem(event, itemData);
        default:
          return super._onDropItem(event, data);
      }
    });
  }

  /**
   * @name _onDropSkillItem
   * @description Handle the drop of a skill on a weapon item
   * @param {*} event
   * @param {*} itemData
   * @returns
   */
  _onDropSkillItem(event, itemData) {
    event.preventDefault();

    // Get the target
    const id = event.target.parentElement.dataset["itemId"];
    const target = this.actor.items.get(id);
    if (!target || target.type !== "weapon") return;
    let targetData = foundry.utils.duplicate(target);
    targetData.system.skillName = itemData.name;
    targetData.system.skillValue = this.actor.getSkillValue(itemData);

    targetData.system.skillId = itemData._id;

    this.actor.updateEmbeddedDocuments("Item", [targetData]);
  }

  /**
   * Create drag-and-drop workflow handlers for this Application.
   * @returns {DragDrop[]}     An array of DragDrop handlers.
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new ux.DragDrop.implementation(d);
    });
  }

  /* -------------------------------------------------- */

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop = this.#createDragDropHandlers();

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
