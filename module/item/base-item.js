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
        const system = this.system;
    /*
        // Skill item        
        if ( this.type === "skill" ) {
          data.value = Skills.getSkillValue(data.base, data.bonus, data.developed);
        }*/  
    }
    
    getSystemData(field) {
        return eval(`this.system.${field}`);
    }
    
    /**
     * @name weaponSkill
     * @description For weapon Item, calculates the walue of the skill by using the linked skill
     * @param {*} actor 
     * @returns The value of the skill
     */
    weaponSkill(actor) {
        if (this.type !== "weapon") return;
        
        if (actor.type === "player") {            
            const skillId = this.getSystemData('skillId');
            if (!skillId) return;
            const skill = actor.items.get(skillId);
            if (skill.type !== "skill") return;
            const skillValue = actor.getSkillValue(skill);
            return skillValue;
        }
        if (actor.type === "npc") {
            if (game.settings.get('cleenmain', 'advancedRules') && (actor.system.level === NPC_LEVEL.secondfiddle) && actor.system.elite) return this.getSystemData('skillValueNpcElite');
            return this.getSystemData('skillValue');
        }        
    }

    /**
     * @name weaponDamage
     * @description For weapon Item, calculates the value of the damage
     *  damage = damageBase + melee/range bonus
     * @param {*} actor 
     */
    weaponDamage(actor) {
        if (this.type !== "weapon") return;

        let damage = this.getSystemData('damageBase');
        
        if (this.getSystemData('type') === 'ranged') {
            damage += " + " + actor.system.damageBonus.ranged;
        }
        else damage += " + " + actor.system.damageBonus.melee;
        else if (this.getSystemData('type') === 'melee') {
            damage += " + " + actor.system.damageBonus.melee;
        }
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
     * @param {*} lethalattack Number of Letah Attack boon
     * @param {*} minorinjury  Number of Minor Injury penalty
     * @param {*} multipleattacks Number of Multiple Attacks boon
     * @returns 
     */
     calculateWeaponDamage(actor, dices, useHeroism, lethalattack, minorinjury, multipleattacks) {
        if (this.type !== "weapon") return;

        let nbDamageDices = parseInt(this.getSystemData('damageBase').substring(0,1));
        let damageFormula = null;
        let damage = 0;
        let nbSix = 0;
        let rolls=[];

        // Damage ToolTip creation
        let damageToolTipInfos = Rolls.createDamageToolTip("weapon", nbDamageDices, dices);

        for (let index = 0; index < nbDamageDices; index++) {
            let indexMod = nbDamageDices == 2 ? index+1 : index;
            damage += dices[indexMod].result;
            if (dices[indexMod].result == 6) nbSix++;  
        }

        // Damage formula for npc
        if (actor.type === "npc") {
            damageFormula = this.getSystemData('damageBase');

            // xd6 + value : 2d6 + 2
            if (damageFormula.includes("+")) {
                let damageFormulaWithoutSpace = damageFormula.replace(/\s+/g, '');
                let bonus = damageFormulaWithoutSpace.substring(damageFormulaWithoutSpace.indexOf("+"));
                damage += parseInt(bonus);
            }

            // single value : +2
            if (!damageFormula.includes("d") && !damageFormula.includes("D")) {
                damage += parseInt(damageFormula);
            }
        } 

        // Damage formula and bonus for player
        if (actor.type === "player") {
            damageFormula = nbDamageDices + "d6";
            if (this.getSystemData('range') > 0) {
                damageFormula += " + " + parseInt(actor.system.damageBonus.ranged);
                damage += parseInt(actor.system.damageBonus.ranged);
            }
            else {
                damageFormula += " + " + parseInt(actor.system.damageBonus.melee);
                damage += parseInt(actor.system.damageBonus.melee);
            }

            if (useHeroism) {
                damageFormula += " + 1d6";
                damage += dices[3].result;
                damageToolTipInfos.push(...Rolls.createDamageToolTip("heroism", 1, dices.slice(3)));
            }            
        }

        // Explosive weapon (6+)
        if (this.getSystemData('sixPlus')) {
            if (nbSix > 0) {
                const explosiveFormula = nbSix + 'd6x[inspired]';
                const explosiveRoll = new Roll(explosiveFormula, {}).roll({ async: false })
                let explosiveDices = [];
                for (let index = 0; index < explosiveRoll.dice.length; index++) {
                    const dice = explosiveRoll.dice[index];
                    explosiveDices.push(...dice.results);
                }
                damageToolTipInfos.push(...Rolls.createDamageToolTip("explosive", explosiveRoll.dice[0].results.length, explosiveDices));
                damage += explosiveRoll._total;
                rolls.push(explosiveRoll);
            }
        }

        // Lethal attack boon
        if (lethalattack > 0) {
            let lethalFormula = lethalattack + "d6[black]";
            if (this.getSystemData('sixPlus')) {
                damageFormula += " + " + lethalattack + "d6x";
                lethalFormula = lethalattack + "d6x[black]";
            } else {
                damageFormula += " + " + lethalattack + "d6";
            }
            const lethalRoll = new Roll(lethalFormula, {}).roll({ async: false });
            let lethalDices = [];
            for (let index = 0; index < lethalRoll.dice.length; index++) {
                const dice = lethalRoll.dice[index];
                lethalDices.push(...dice.results);
            }
            damageToolTipInfos.push(...Rolls.createDamageToolTip("lethalattack", lethalRoll.dice[0].results.length, lethalDices));
            damage += lethalRoll._total;
            rolls.push(lethalRoll);
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
            damageToolTipInfos: damageToolTipInfos,
            rolls: rolls
        }
    }   
}
