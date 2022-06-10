import { Skills } from "../common/skills.js";
import { NPC_LEVEL } from "../common/constants.js";
import { Rolls } from "../common/rolls.js";
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
            if (game.settings.get('cleenmain', 'advancedRules') && (actor.data.data.level === NPC_LEVEL.secondfiddle) && actor.data.data.elite) return this.data.data.skillValueNpcElite;
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
     *  For a player : damage = damageBase + melee/range bonus
     *  For a npc : damage = damageBase
     * @param {*} actor 
     * @param {*} dices The dices results of a roll
     * @param {*} useHeroism 
     * @param {*} lethalattack 
    * @returns 
     */
     calculateWeaponDamage(actor, dices, useHeroism, lethalattack, minorinjury, multipleattacks) {
        if (this.data.type !== "weapon") return;

        let nbDices = parseInt(this.data.data.damageBase.substring(0,1));
        let damageFormula = null;
        let damage = 0;
        let otherRoll = null;

        // Damage ToolTip
        let damageToolTipInfos = Rolls.createDamageToolTip("weapon", nbDices, dices);

        switch (nbDices) {
            case 1:                
                damage += dices[0].result;
                break;
            case 2:
                damage += dices[0].result + dices[1].result;
                break;
            case 3:
                damage += dices[0].result + dices[1].result + dices[2].result;
                break;
            default:
                break;
        }

        // Damage formula for npc
        if (actor.data.type === "npc") {
            damageFormula = this.data.data.damageBase;

            // xd6 + value
            if (damageFormula.includes("+")) {
                let damageFormulaWithoutSpace = damageFormula.replace(/\s+/g, '');
                let bonus = damageFormulaWithoutSpace.substring(damageFormulaWithoutSpace.indexOf("+"));
                damage += parseInt(bonus);
            }

            // single value
            if (!damageFormula.includes("d") && !damageFormula.includes("D")) {
                damage += parseInt(damageFormula);
            };
        } 

        // Damage formula and bonus for player
        if (actor.data.type === "player") {
            damageFormula = nbDices + "d6";
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
                damageToolTipInfos.push(...Rolls.createDamageToolTip("heroism", 1, dices.slice(3)));
            }
        }

        // Lethal attack boon
        if (lethalattack > 0) {
            damageFormula += " + " + lethalattack + "d6";
            const lethalFormula = lethalattack + "d6";
            const lethalRoll = new Roll(lethalFormula, {}).roll({ async: false })
            console.log("lethalRoll = ", lethalRoll);
            let lethalDices = [];
            for (let index = 0; index < lethalRoll.dice.length; index++) {
                const dice = lethalRoll.dice[index];
                lethalDices.push(...dice.results);
            }
            damageToolTipInfos.push(...Rolls.createDamageToolTip("lethalattack", lethalattack, lethalDices));
            damage += lethalRoll._total;
        }
        
        // Minor injury penalty
        if (minorinjury > 0) {
            damage = Math.ceil(damage / 2);
        }

        // Multiple attacks
        if (multipleattacks > 0) {
            damage = Math.ceil(damage / 2);
        }

        return {
            damage: damage,
            damageFormula: damageFormula,
            damageToolTipInfos: damageToolTipInfos
        }
    }   
}
