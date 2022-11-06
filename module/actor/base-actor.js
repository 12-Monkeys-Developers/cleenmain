import { Rolls } from "../common/rolls.js";
import { Utils } from "../common/utils.js";
export default class CemBaseActor extends Actor {

    /** @override */
    prepareBaseData(){
        super.prepareBaseData();
        this._computeBoons();
        if (this.isPlayer()) this._prepareBaseDataPlayer();
        if (this.isNpc()) this._prepareBaseDataNpc();
    }

    /**
     * @private
     */
    _prepareBaseDataPlayer() {

        this.system.heroism.max = Utils.getMaxHeroism() + (this.system.heroism.developed ? 1 : 0);
    }

    /**
     * @private
     */
    _prepareBaseDataNpc() {

        // TODO Check if ELite is necessary
        if (this.isBoss()) this.system.elite = true;
        this._initializeNpcHealth();
    }

   /**
   * @description  Evaluate the max health of the NPC depending of the number of players option 
   * @returns The max health
   * @private
   */
    _initializeNpcHealth(){
        let numberOfPlayers = game.settings.get('cleenmain', 'numberOfPlayers');

        if(game.settings.get('cleenmain', 'advancedRules') && (this.system.level === game.cleenmain.config.npc_level.secondfiddle) && this.system.elite){
            this.system.health.max = this.system.healthByNumberPlayers[numberOfPlayers]*2;
        }
        else this.system.health.max =  this.system.healthByNumberPlayers[numberOfPlayers];
        if (this.system.health.value > this.system.health.max) {
            this.system.health.value = this.system.health.max;
        }
    }

    isPlayer() {
        return this.type === "player";
    }

    isNpc() {
        return this.type === "npc";
    }

    isBoss() {
        return this.isNpc() ? this.system.level === game.cleenmain.config.npc_level.boss : false;   
    }

    isSupport() {
        return this.isNpc() ? this.system.level === game.cleenmain.config.npc_level.support : false;
    }
    
    /**
     * @description Used for NPC, if the Defence skill is defined, return this value elsewhere return 0
     * @returns the value of Defense
     */
    get defence() {
        const defenceSkill = this.items.filter(i => (i.type === "skill" && i.system.reference === "defence"));
        if (defenceSkill.length > 0) return this.getSkillValue(defenceSkill[0]);
        return(0);
    }

    hasHeroismPoints() {
        return this.isPlayer() && this.system.heroism.value > 0;
    }
    
    /**
     * @name getSkillValue
     * @description Return the value of a specific skill Item
     * PC : Base + Bonus + 2 if developed
     * NPC : Base + Bonus, if the advanced rules are used, the base changes if it's an elite
     * @param {Item} skill 
     * @returns 
     */
    getSkillValue(skill){
        let newValue = 0;
        if(this.isNpc()){
            if(game.settings.get('cleenmain', 'advancedRules') && (this.system.level === game.cleenmain.config.npc_level.secondfiddle) && this.system.elite){
                newValue = skill.system.baseNpcElite + skill.system.bonus;
            }
            else newValue = skill.system.base + skill.system.bonus;
        }
        else newValue = skill.system.base + skill.system.bonus + (skill.system.developed ? 2 : 0);
        return newValue;
    }

    /**
     * @description Modifiers is a table of modifiers like
     *   {"type" : type,
     *    "value" value}
     * 
     * @returns 
     */
    getModifiers() {
        return this.system.modifiers;
    }

    /**
     * @name useBehaviourModifier
     * @description Get a specific modifier
     * @param {*} type 
     * @returns a specific modifier {type, value}
     */
     getModifier(type) {
        return this.getModifiers().find(mod => mod.type === type);
    }

    /**
     * @description Get the behaviour modifier which is used for Boon Caution and Penalty Risk
     * @returns 
     */
    getBehaviourValue() {
        return this.getModifier("behaviour") ? this.getModifier("behaviour").value : null;
    }

    /**
     * @name addBehaviourModifier
     * @description Add a value (positive or negative) to the Behaviour Modifier
     * @param {int} value to add to the behaviour modifier
     */
    addBehaviourModifier(value) {
        const actualModifier = this.getModifier("behaviour");
        const actualValue =  actualModifier ? actualModifier.value : 0;
        let newValue = actualValue + value;
        let modifiers = [];
        if (!actualModifier) {
            modifiers.push({"type": "behaviour", "value": newValue});           
        }
        else {
            modifiers = foundry.utils.deepClone(this.getModifiers());
            modifiers.find(mod => mod.type === "behaviour").value = newValue;
        }
        this.update({'system.modifiers': modifiers});
    }

    /**
     * @name useBehaviourModifier
     * @description Add or remove 1 to the behaviour modifier
     * @returns 
     */
    useBehaviourModifier() {
        const actualModifier = this.getModifier("behaviour");
        if (typeof(actualModifier) === 'undefined' || actualModifier.value == 0) return;
        if (actualModifier.value < 0) {
            return this.addBehaviourModifier(1);
        }
        if (actualModifier.value > 0) {
            return this.addBehaviourModifier(-1);
        }
    }

    get actingChar(){
        // Get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];

        // If there is a token active for this actor, we use its name and image instead of the actor's
        const actingCharacterName = actingToken?.document?.name ?? this.name;
        const actingCharacterImage = actingToken?.document?.img ?? this.img; 

        return({
            name: actingCharacterName,
            img: actingCharacterImage
        })
    }

    /**
     * @name check
     * @description Rolls dices and display chat messages
     * @param {*} itemId Id of the Item used for roll
     * @param {*} rollType  skill, weapon attack, weapon damage
     * @param options { bonuses }
     * @returns 
     */
    async check(itemId, rollType, options) {
        let item = this.items.get(itemId);
        if (!item) return;
        let actingChar = this.actingChar;
        return Rolls.check(this, item, rollType, {
            ...item.system,
            actingChar: actingChar,
            owner: this.id,
            options: options
        });
    }

    /**
     * @description Use nbPoints of Heroism
     * @param {*} nbPoints 
     */
    async useHeroism(nbPoints) {
        if (this.system.heroism.value == 0) return ui.notifications.warn("CLEENMAIN.notification.heroismNoMorePoints", {localize: true});
        if (nbPoints > this.system.heroism.value) return ui.notifications.warn("CLEENMAIN.notification.heroismNotEnoughPoints", {localize: true});
        let newValue = this.system.heroism.value - nbPoints;
        await this.update({'system.heroism.value': newValue});
    }

    /**
     * @description Calculates the armor malus
     * @returns the malus or 0
     */
    getArmorMalus() {
        let malus = 0;
        const armors = this.items.filter(i=>i.type === "armor");
        armors.forEach(armor => {
            if (armor.system.category === "war") {
                if (!this.isTrainedWithWarArmor() && !this.isTrainedWithHeavyArmor()) malus+= 2;
            }
            else if (armor.system.category === "heavy") {
                if (!this.isTrainedWithHeavyArmor()) {
                    if (this.isTrainedWithWarArmor()) {
                        malus += 2;
                    }
                    else malus +=4;
                }
            }
        });
        return malus;
    }

    /**
     * @name getArmorProtection
     * @description Calculate the total of protection depending of armors and shield
     * @returns The total of protection
     */
    getArmorProtection() {
        let protection = this.system.health.bonusProtection ?? 0;
        const armors = this.items.filter(i=>i.type === "armor");
        armors.forEach(armor => {
            if (armor.system.category !== "shield" && armor.system.state==="active") protection += parseInt(armor.system.protection);
            if (armor.system.category === "shield" && armor.system.state==="active")  {
                if (this.isTrainedWithShield()) protection += parseInt(armor.system.protection);
                else {
                    if (armors.length == 1) protection += parseInt(armor.system.protection);
                }
            }
            
        });
        return protection;
    }

    isTrainedWithWarArmor() {
        return this.system.trainings.armors.war;
    }

    isTrainedWithHeavyArmor() {
        return this.system.trainings.armors.heavy;
    }

    isTrainedWithShield() {
        return this.system.trainings.armors.shield;
    }

    isInBadShape() {
        return this.isPlayer() ? this.system.health.value <= 0 : false;
    }

    healthMax(){
        return(this.system.health.max + this.system.health.bonus)
    }

    setHealthToMax(){
        this.update({'system.health.value': this.system.health.max + this.system.health.bonus});
    }

    _computeBoons() {
        const boonsList = this.items.filter(element => element.type === "boon" && (element.system.developed || !this.isPlayer()) && element.system?.effect.length>0);
        if(!this.system.health.bonus) this.system.health.bonus = 0;
        for(let boon of boonsList){
            for(let boonEffect of boon.system.effect){
                if( typeof this["boonEffect_"+boonEffect.name] == "function" ) {
                    this["boonEffect_"+boonEffect.name](boonEffect.options, boon._id);
                }
            }
        }
    }
    boonEffect_health_bonus(options, boonId){
        if(!options?.value) return;
        this.system.health.bonus+=options.value;
        return;
    }
    boonEffect_protection_bonus(options, boonId){
        if(!options?.value) return;
        this.system.health.bonusProtection = options.value;
    }
    boonEffect_skill_bonus(options, boonId){
        if(!options?.reference || !options?.value) return;
        const skillList = this.items.filter(element => element.type === "skill" && element.system.reference===options.reference);
        for (let skill of skillList){
            skill.system.rollBonus=skill.system.rollBonus? skill.system.rollBonus+options.value:options.value;
        }
        return;
    }
    boonEffect_skill_bonus_1d6(options, boonId){
        if(!options?.reference) return;
        const skillList = this.items.filter(element => element.type === "skill" && element.system.reference===options.reference);
        for (let skill of skillList){
            skill.system.rollBonus1d6=true;
        }
        return;
    }
    boonEffect_skill_heroism_bonus1d6(options, boonId){
        if(!options?.reference) return;
        const skillList = this.items.filter(element => element.type === "skill" && element.system.reference===options.reference);
        for (let skill of skillList){
            skill.system.heroismBonus1d6=true;
        }
        return;
    }
    boonEffect_badShape_skillBonus(options, boonId){
        if(!options?.value) return;
        this.system.health.badShapeSkillBonus=options.value;
    }
    boonEffect_badShape_damageBonus(options, boonId){
        if(!options?.value) return;
        this.system.health.badShapeDamageBonus=options.value;
    }
    boonEffect_badShape_skill_heroism_bonus1d6(options, boonId){
        if(!options?.reference || !this.isInBadShape()) return;
        const skillList = this.items.filter(element => element.type === "skill" && element.system.reference===options.reference);
        for (let skill of skillList){
            skill.system.heroismBonus1d6=true;
        }
    }
    boonEffect_boon_uses(options, boonId){
        if(!options) return;
        const boon = this.items.get(boonId);
        if(!boon) return;
        const updates = {"_id": boonId, "system" : {}};
        
        console.log("options",options);
        for (let element in options){
            updates.system[element] = true;
            };
        this.updateEmbeddedDocuments('Item', [updates]);

    }
}
