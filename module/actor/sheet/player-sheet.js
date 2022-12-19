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
      height: 750,
      width: 850,
      template: "systems/cleenmain/templates/actor/player.html",
      classes: ["cleenmain", "sheet", "actor", "player"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "boons" }],
      dragDrop: [{ dragSelector: ".draggable", dropSelector: ".droppable" }],
    });
  }

  /** @override */
  getData(options) {
    const context = super.getData(options);

    context.protection = this.actor.getArmorProtection();
    let defenceModifier = this.actor.getModifiers().find( modifier => modifier.type === "behaviour");
    context.defenceModifier = defenceModifier ? defenceModifier.value : 0;
    context.notebookhtml = TextEditor.enrichHTML(this.actor.system.notebook, {async:false});
    context.healthMax = this.actor.healthMax();
    //biotech for wwk module
    context.useBiotech = game.settings.get('cleenmain', 'pointsbiotech');
    return context;
  }

  /** @override */
  activateListeners(html){
    super.activateListeners(html);

    html.find(".spend-heroism").click(this._onSpendHeroismOnePoint.bind(this));
    html.find(".spend-heroism").contextmenu(this._onSpendHeroismTwoPoints.bind(this));
    html.find(".spend-biotechboon").click(this._onSpendBiotechBoon.bind(this));
    html.find('.item-state').click(async (ev) => await this._onItemStateUpdate(ev));
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
      const itemData = duplicate(item);
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
    let targetData = duplicate(target);
    targetData.system.skillName = itemData.name;
    targetData.system.skillValue = this.actor.getSkillValue(itemData);

    targetData.system.skillId = itemData._id;

    this.actor.updateEmbeddedDocuments("Item", [targetData]);
  }

  /**
   * 
   * @param {*} event 
   */
   _onSpendHeroismOnePoint(event) {
    event.preventDefault();
    this.actor.useHeroism(1);
  }

  /**
   * 
   * @param {*} event 
   */
   _onSpendHeroismTwoPoints(event) {
    event.preventDefault();
    this.actor.useHeroism(2);
  }

  _onSpendBiotechBoon(event){
    event.preventDefault();
    this.actor.useBiotech();
  }

  async _onItemStateUpdate(event) {
    event.preventDefault();
    const div = $(event.currentTarget).parents('.item');
    const item = this.actor.items.get(div.data('itemId'));

    if (item === null || item === undefined) {
      return;
    }
    let data;
    switch (item.system.state) {
      case 'active':
        data = { _id: item.id, id: item.id, 'system.state': 'equipped' };
        break;
      case 'equipped':
        data = { _id: item.id, id: item.id, 'system.state': 'other' };
        break;
      default:
        data = { _id: item.id, id: item.id, 'system.state': 'active' };
        break;
    }    
    
    this.actor.updateEmbeddedDocuments("Item", [data]);
  }

}
