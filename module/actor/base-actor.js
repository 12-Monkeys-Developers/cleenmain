import { Rolls } from "../common/rolls.js";
import { Utils } from "../common/utils.js";
import { NPC_LEVEL } from "../common/constants.js";
export default class CemBaseActor extends Actor {

    /** @override */
    prepareBaseData(){
        super.prepareBaseData();

        if (this.isPlayer()) this._prepareBaseDataPlayer();
        if (this.isNpc()) this._prepareBaseDataNpc();
    }

    /**
     * @private
     */
    _prepareBaseDataPlayer() {

        this.data.data.heroism.max = Utils.getMaxHeroism() + (this.data.data.heroism.developed ? 1 : 0);
    }

    /**
     * @private
     */
    _prepareBaseDataNpc() {

        // TODO Check if ELite is necessary
        if (this.isBoss()) this.data.data.elite = true;
        this._initializeNpcHealth();
    }

   /**
   * @description  Evaluate the max health of the NPC depending of the number of players option 
   * @returns The max health
   * @private
   */
    _initializeNpcHealth(){
        let numberOfPlayers = game.settings.get('cleenmain', 'numberOfPlayers');

        if(game.settings.get('cleenmain', 'advancedRules') && (this.data.data.level === NPC_LEVEL.secondfiddle) && this.data.data.elite){
            this.data.data.health.max = this.data.data.healthByNumberPlayers[numberOfPlayers]*2;
        }
        else this.data.data.health.max =  this.data.data.healthByNumberPlayers[numberOfPlayers];
        if (this.data.data.health.value > this.data.data.health.max) {
            this.data.data.health.value = this.data.data.health.max;
        }
    }

    isPlayer() {
        return this.data.type === "player";
    }

    isNpc() {
        return this.data.type === "npc";
    }

    isBoss() {
        return this.isNpc() ? this.data.data.level === NPC_LEVEL.boss : false;   
    }

    isSupport() {
        return this.isNpc() ? this.data.data.level === NPC_LEVEL.support : false;
    }
    
    /**
     * @description Used for NPC, if the Defence skill is defined, return this value elsewhere return 0
     * @returns the value of Defense
     */
    getDefenceValue() {
        const defenceSkill = this.items.filter(i=>(i.type === "skill" && i.data.data.reference==="defence"));
        if(defenceSkill.length) return this.getSkillValue(defenceSkill[0].data);
        return(0);
    }

    hasHeroismPoints() {
        return this.isPlayer() && this.data.data.heroism.value > 0;
    }
    
    /**
     * @name getSkillValue
     * @description Return the value of a specific skill
     * PC : Base + Bonus + 2 if developed
     * NPC : Base + Bonus, if the advanced rules are used, the base changes if it's an elite
     * @param {*} skill 
     * @returns 
     */
    getSkillValue(skill){
        let newValue = 0;
        if(this.isNpc()){
            if(game.settings.get('cleenmain', 'advancedRules') && (this.data.data.level === NPC_LEVEL.secondfiddle) && this.data.data.elite){
                newValue = skill.data.baseNpcElite + skill.data.bonus;
            }
            else newValue = skill.data.base + skill.data.bonus;
        }
        else newValue = skill.data.base + skill.data.bonus + (skill.data.developed ? 2 : 0);
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
        return this.data.data.modifiers;
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
        this.update({'data.modifiers': modifiers});
    }

    /**
     * @name useBehaviourModifier
     * @description Add or remove 1 to the behaviour modifier
     * @returns 
     */
    useBehaviourModifier() {
        const actualModifier = this.getModifier("behaviour");
        if (actualModifier.value == 0) return;
        if (actualModifier.value < 0) {
            return this.addBehaviourModifier(1);
        }
        if (actualModifier.value > 0) {
            return this.addBehaviourModifier(-1);
        }
    }

    /**
     * @name check
     * @description Rolls dices and display chat messages
     * @param {*} itemId Id of the Item used for roll
     * @param {*} rollType  skill, weapon attack, weapon damage
     * @returns 
     */
    async check(itemId, rollType) {
        let item = this.items.get(itemId);
        if (!item) return;

        // Get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];

        // If there is a token active for this actor, we use its name and image instead of the actor's
        const actingCharacterName = actingToken?.data?.name ?? this.name;
        const actingCharacterImage = actingToken?.data?.img ?? this.img; 

        return Rolls.check(this, item, rollType, {
            ...item.data,
            owner: this.id,
            actingCharacterName: actingCharacterName,
            actingCharacterImage: actingCharacterImage
        });
    }

    /**
     * @description Use nbPoints of Heroism
     * @param {*} nbPoints 
     */
    async useHeroism(nbPoints) {
        if (nbPoints > this.data.data.heroism.value) return;
        let newValue = this.data.data.heroism.value - nbPoints;
        await this.update({'data.heroism.value': newValue});
    }

    /**
     * @description Calculates the armor malus
     * @returns the malus or 0
     */
    getArmorMalus() {
        let malus = 0;
        const armors = this.items.filter(i=>i.type === "armor");
        armors.forEach(armor => {
            if (armor.data.data.category === "war") {
                if (!this.isTrainedWithWarArmor() && !this.isTrainedWithHeavyArmor()) malus+= 2;
            }
            else if (armor.data.data.category === "heavy") {
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
        let protection = 0;
        const armors = this.items.filter(i=>i.type === "armor");
        armors.forEach(armor => {
            if (armor.data.data.category !== "shield") protection += parseInt(armor.data.data.protection);
            if (armor.data.data.category === "shield")  {
                if (this.isTrainedWithShield()) protection += parseInt(armor.data.data.protection);
                else {
                    if (armors.length == 1) protection += parseInt(armor.data.data.protection);
                }
            }
            
        });
        return protection;
    }

    isTrainedWithWarArmor() {
        return this.data.data.trainings.armors.war;
    }

    isTrainedWithHeavyArmor() {
        return this.data.data.trainings.armors.heavy;
    }

    isTrainedWithShield() {
        return this.data.data.trainings.armors.shield;
    }

    isInBadShape() {
        return this.isPlayer() ? this.data.data.health.value <= 0 : false;
    }

    setHealthToMax(){
        this.update({'data.health.value': this.data.data.health.max});
    }
}
