
export class CemBaseActorSheet extends ActorSheet {

    /**
     * @constructor
     * @param  {...any} args
     */
    constructor(...args) {
        super(...args);
        this.options.submitOnClose = true;
    }

    /** @override */
    getData(options) {
      const context = super.getData(options);
      context.actorSystem = context.actor.system;      
      context.flags = context.actor.flags;
      context.id = context.actor.id;
      context.config = CONFIG.CLEENMAIN;
      context.editable = this.isEditable;
      context.isGm = game.user.isGM;

      context.boons = context.items.filter(item => item.type == "boon");
      context.weapons = context.items.filter(item => item.type == "weapon");	
      context.armors = context.items.filter(item => item.type == "armor");
      context.equipments = context.items.filter(item => ["equipment", "armor", "weapon"].includes(item.type));

      // Alphabetic order for skills
      context.skills = context.items.filter(item => item.type == "skill").sort(function (a, b) {return a.name.localeCompare(b.name);});

      context.unlocked = this.actor.getFlag(game.system.id, "SheetUnlocked");

      context.isPlayer = this.actor.isPlayer();
      context.isNpc = this.actor.isNpc();

      context.badShape = this.actor.isInBadShape();

      return context;
    }


    /** @override */
    activateListeners(html){
        super.activateListeners(html);
        
        html.find(".sheet-change-lock").click(this._onSheetChangelock.bind(this));

        html.find(".item-create").click(this._onItemCreate.bind(this));
        html.find(".item-edit").click(this._onItemEdit.bind(this));
        html.find(".item-open-sheet").click(this._onItemEdit.bind(this));

        html.find(".inline-edit").change(this._onEmbeddedItemEdit.bind(this));        
        html.find(".inline-delete").click(this._onEmbeddedItemDelete.bind(this));               
        
        html.find(".skill-roll").click(this._onSkillRoll.bind(this));
        html.find(".weapon-attack-roll").click(this._onWeaponAttackRoll.bind(this));
        html.find(".weapon-damage-roll").click(this._onWeaponDamageRoll.bind(this));
        html.find(".badshape-roll").click(this._onBadShapeRoll.bind(this));
    }


  /**
   * @description Manage the lock/unlock button on the sheet
   * @param {*} event 
   */
  async _onSheetChangelock(event){
    event.preventDefault();

    let flagData = await this.actor.getFlag(game.system.id, "SheetUnlocked");
    flagData ? await this.actor.unsetFlag(game.system.id, "SheetUnlocked") : await this.actor.setFlag(game.system.id, "SheetUnlocked", "SheetUnlocked");
    
    this.actor.sheet.render(true);
  }

  /**
   * 
   * @param {*} event 
   * @returns 
   */
  _onItemCreate(event){
      event.preventDefault();
      let element = event.currentTarget;
      let newName = "New";
      switch (element.dataset.type){
        case "boon":
          newName = game.i18n.localize("CLEENMAIN.boon.add");
          break;
        case "weapon":
          newName = game.i18n.localize("CLEENMAIN.weapon.add");
          break;
        case "skill":
          newName = game.i18n.localize("CLEENMAIN.skill.add");
          break;
        case "armor":
          newName = game.i18n.localize("CLEENMAIN.armor.add");
          break;
        case "equipment":
          newName = game.i18n.localize("CLEENMAIN.equipment.add");
          break;
      }
      
      let itemData = {
        name: newName,
        type: element.dataset.type
      }
      return(this.actor.createEmbeddedDocuments("Item", [itemData]));
  }

  /**
   * 
   * @param {*} event 
   */
  _onItemEdit(event){
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data('itemId');    
    let item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  /**
   * 
   * @param {*} event 
   * @returns 
   */
  _onEmbeddedItemEdit(event){
    event.preventDefault();  
    const itemId = $(event.currentTarget).parents(".item").data('itemId');    
    let item = this.actor.items.get(itemId);

    const element  = event.currentTarget;
    let field = element.dataset.field;
    let newValue;
    if(element.type === "checkbox") newValue = element.checked;
    else if(element.type === "number") newValue = element.valueAsNumber;
    else newValue = element.value;
    return item.update({[field]: newValue});
  }
  
  /**
   * 
   * @param {*} event 
   * @returns 
   */
  _onEmbeddedItemDelete(event){
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data('itemId');    
    return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  /**
   * 
   * @param {*} event 
   * @returns 
   */
  async _onSkillRoll(event){
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data('itemId');  
   
    return this.actor.check(itemId, "skill");
  }

  /**
   * 
   * @param {*} event 
   * @returns 
   */
   async _onWeaponAttackRoll(event){
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data('itemId');  
   
    return this.actor.check(itemId, "weapon-attack");    
  }

  /**
 * 
 * @param {*} event 
 * @returns 
 */
  async _onWeaponDamageRoll(event){
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").data('itemId');  
   
    return this.actor.check(itemId, "weapon-damage");    
  }

  /**
   * @description Handle the two rolls in case of bad shape
   * resistance roll or willpower roll
   * @param {*} event 
   * @returns a roll
   */
  async _onBadShapeRoll(event){
    event.preventDefault();
    const element  = event.currentTarget;
    let skillName = element.dataset.field;
    const itemId = $(event.currentTarget).parents(".item").data('itemId');

    const rollSkill = this.actor.items.filter(i => (i.type === "skill" && i.system.reference === skillName))[0];
    let malusValue = this.actor.system.wounds*5;
    let options = {
      badShapeRoll: true,
      bonuses: [{value : ' - ' + malusValue.toString(), tooltip: game.i18n.format("CLEENMAIN.label.wounds") + ": -" + malusValue.toString()}]
    };
    return this.actor.check(rollSkill.id, "skill", options);
  }
}