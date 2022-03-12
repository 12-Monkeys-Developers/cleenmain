import { CemBaseActorSheet } from "./base-sheet.js";
import { Skills } from "../../common/skills.js";

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
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      height: 840,
      width: 950,
      template: "systems/cleenmain/templates/actor/player.html",
      classes: ["cleenmain", "sheet", "actor", "player"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "combat" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    context.isPlayer = true;

    return context;
  }

  /** @override */
  _onDrop(event) {
    event.preventDefault();
    if (!this.options.editable) return false;
    // Get dropped data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
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
   * @name _onDropItem
   * @description Handle dropping of an item reference or item data onto an Item Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @private
   */
  _onDropItem(event, data) {
    Item.fromDropData(data).then((item) => {
      const itemData = duplicate(item.data);
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
    console.log("skill", itemData);
    event.preventDefault();
    const id = event.target.parentElement.dataset["id"];
    const target = this.actor.items.get(id);
    if (!target || target.type !== "weapon") return;
    console.log("target", target);
    let targetData = duplicate(target.data);
    targetData.data.skillName = itemData.name;
    targetData.data.skillValue = Skills.getSkillValue(itemData.data.base, itemData.data.bonus, itemData.data.developed);
    targetData.data.skillId = id;
    this.actor.updateEmbeddedDocuments("Item", [targetData]);
  }
}
