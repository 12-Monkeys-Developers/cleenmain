import { Skills } from "../common/skills.js";
export default class CemBaseItem extends Item {

    /** @override */
    prepareData(){
        super.prepareData();
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
    
        // Get the Item's data
        const itemData = this.data;
        const data = itemData.data;
    /*
        // Skill item        
        if ( itemData.type === "skill" ) {
          data.value = Skills.getSkillValue(data.base, data.bonus, data.developed);
        }*/  
    }

    /**
     * @name weaponSkill
     * @description For weapon Item, calculates the walue of the skill by using the linked skill
     * @param {*} actor 
     * @returns The value of the skill
     */
    weaponSkill(actor) {
        if (this.data.type !== "weapon") return;
        
        if (actor.type === "player") {            
            const skillId = this.data.data.skillId;
            if (!skillId) return;
            const skill = actor.items.get(skillId);
            if (skill.type !== "skill") return;
            const skillValue = actor.getSkillValue(skill.data);
            return skillValue;
        }
        if (actor.type === "npc") {
            if (game.settings.get('cleenmain', 'advancedRules') && (actor.data.data.level === "secondfiddle") && actor.data.data.elite) return this.data.data.skillValueNpcElite;
            return this.data.data.skillValue;
        }        
    }

    /**
     * @name weaponDamage
     * @description For weapon Item, calculates the value of the damage
     *  damage = damageBase + melee/range bonus
     * @param {*} actor 
     */
    weaponDamage(actor) {
        if (this.data.type !== "weapon") return;

        let damage = this.data.data.damageBase;
        if (this.data.data.range > 0) {
            damage += " + " + actor.data.data.damageBonus.ranged;
        }
        else damage += " + " + actor.data.data.damageBonus.melee;
        return damage;
    }

    /**
     * @name calculateWeaponDamage
     * @description For weapon Item, calculates the value of the damage depending of the damageBase and the results of the dices
     *  damage = damageBase + melee/range bonus
     * @param {*} actor 
     * @param {*} dices The dices results of a roll
     * @param {*} useHeroism 
     * @param {*} lethalattack 
    * @returns 
     */
     calculateWeaponDamageForPlayer(actor, dices, useHeroism, lethalattack) {
        if (this.data.type !== "weapon") return;
        if (actor.data.type !== "player") return;

        let nbDices = parseInt(this.data.data.damageBase.substring(0,1));
        let damageFormula = null;
        let damage = 0;
        let totalAttackDices;
        let otherRoll = null;
        let damageToolTipInfos = [];
        let damageToolTipInfosWeapon = {};
        damageToolTipInfosWeapon.source = game.i18n.format("CLEENMAIN.chatmessage.weapon", {nbDices: nbDices});
        damageToolTipInfosWeapon.dices = [];

        switch (nbDices) {
            case 1:                
            totalAttackDices = dices[0].result;
                damageToolTipInfosWeapon.total = totalAttackDices;
                damage += dices[0].result;
                damageToolTipInfosWeapon.dices[0] = dices[0].result;
                break;
            case 2:
                totalAttackDices = dices[0].result + dices[1].result;
                damageToolTipInfosWeapon.total = totalAttackDices;
                damage += total;
                damageToolTipInfosWeapon.dices[0] = dices[0].result;
                damageToolTipInfosWeapon.dices[1] = dices[1].result;
                break;
            case 3:
                totalAttackDices = dices[0].result + dices[1].result + dices[2].result;
                damageToolTipInfosWeapon.total = totalAttackDices
                damage += dices[0].result + dices[1].result + dices[2].result;
                damageToolTipInfosWeapon.dices[0] = dices[0].result;
                damageToolTipInfosWeapon.dices[1] = dices[1].result;
                damageToolTipInfosWeapon.dices[2] = dices[2].result;
                break;
            default:
                break;
        }
        damageFormula = nbDices + "d6";
        damageToolTipInfos.push(damageToolTipInfosWeapon);

        if (this.data.data.range > 0) {
            damageFormula += " + " + parseInt(actor.data.data.damageBonus.ranged);
            damage += parseInt(actor.data.data.damageBonus.ranged);
        }
        else {
            damageFormula += " + " + parseInt(actor.data.data.damageBonus.melee);
            damage += parseInt(actor.data.data.damageBonus.melee);
        }

        if (useHeroism) {
            damageFormula += " + 1d6";
            damage += dices[3].result;
            //damageToolTip.heroism = + dices[3].result;
            damageToolTipInfos.push({"source": game.i18n.localize("CLEENMAIN.chatmessage.heroism"), "total": "", "dices": [dices[3].result]});
        }
        if (lethalattack > 0) {
            const lethalFormula = lethalattack + "d6";
            const lethalRoll = new Roll(lethalFormula, {}).roll({ async: false });
            console.log("lethalRoll = ", lethalRoll);
            otherRoll = lethalRoll;
            damage += lethalRoll._total;
        }
        
        return {
            damage: damage,
            damageFormula: damageFormula,
            damageToolTipInfos: damageToolTipInfos,
            otherRoll: otherRoll
        }
    }

    /**
     * @name calculateWeaponDamage
     * @description For weapon Item, calculates the value of the damage
     * @param {*} actor 
    * @returns 
     */
     calculateWeaponDamageForNpc(actor) {
        if (this.data.type !== "weapon") return;
        if (actor.data.type !== "npc") return;

        const damage = this.data.data.damageBase;

        if (!damage.includes("d") && !damage.includes("D")){
            return {
                damage: parseInt(damage),
                otherRoll: null
            }
        }

        const damageRoll = new Roll(damage, {}).roll({ async: false });
        return {
            damage: damageRoll._total,
            otherRoll: damageRoll
        }
    }    
}
