import { Skills } from "../common/skills.js";
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
     * @name weaponSkillName
     * @description For weapon Item, get the Name
     * @param {*} actor 
     * @returns The name of the skill used 
     */
     weaponSkillName(actor) {
        if (this.type !== "weapon") return;
        
        const skillId = this.getSystemData('skillId');
        if (!skillId) return;
        const skill = actor.items.get(skillId);
        if (skill === undefined || skill.type !== "skill") return;
        const skillName = skill.name;
        return skillName;
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
            if (skill === undefined || skill.type !== "skill") return;
            const skillValue = actor.getSkillValue(skill);
            return skillValue;
        }
        if (actor.type === "npc") {
            if (game.settings.get('cleenmain', 'advancedRules') && (actor.system.level === game.cleenmain.config.npc_level.secondfiddle) && actor.system.elite) return this.getSystemData('skillValueNpcElite');
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
     * @param {*} dices The dices results of a roll, if there are 3 dices it's an attack
     * @param {boolean} useHeroism 
     * @param {int} lethalattack Number of Letah Attack boon
     * @param {int} minorinjury  Number of Minor Injury penalty
     * @param {int} multipleattacks Number of Multiple Attacks boon
     * @param {*} badShapeDamageBonus 
     * @returns 
     */
     calculateWeaponDamage(actor, dices, useHeroism, lethalattack, minorinjury, multipleattacks, badShapeDamageBonus) {
        if (this.type !== "weapon") return;

        const nbDamageDices= this.getSystemData('damageBase').match(/([0-9])d6/) ? parseInt(this.getSystemData('damageBase').match(/([0-9])d6/)[1]) : 0;
        const baseBonusDamage= this.getSystemData('damageBase').match(/d6[ ]?\+[ ]?([0-9])/) ? parseInt(this.getSystemData('damageBase').match(/d6[ ]?\+[ ]?([0-9])/)[1]) : 0;
        let damageFormula = null;
        let damage = 0;
        let nbSix = 0;
        let rolls=[];

        // Damage ToolTip creation
        let damageToolTipInfos = Rolls.createDamageToolTip("weapon", nbDamageDices, dices);

        // If it's a damage roll, there are as many nbDamageDices than dices
        if (dices.length == nbDamageDices) {
            for (let index = 0; index < nbDamageDices; index++) {
                damage += dices[index].result;
                if (dices[index].result == 6) nbSix++;  
            }
        }
        else {
            for (let index = 0; index < nbDamageDices; index++) {
                let indexMod = nbDamageDices == 2 ? index + 1 : index;
                damage += dices[indexMod].result;
                if (dices[indexMod].result == 6) nbSix++;  
            }
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
            damageFormula = this.getSystemData('damageBase');
            damage += baseBonusDamage;
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

        // Bad shape damage bonus from boon
        if (badShapeDamageBonus) {
            let badShapeFormula = badShapeDamageBonus + "[black]";
             
            if (this.getSystemData('sixPlus')) {
                damageFormula += " + " + badShapeDamageBonus + "x";
                badShapeFormula = badShapeDamageBonus + "x[black]";
            } else {
                damageFormula += " + " + badShapeDamageBonus;
            }

            const badShapeRoll = new Roll(badShapeFormula, {}).roll({ async: false });
            let badShapeDices = [];
            for (let index = 0; index < badShapeRoll.dice.length; index++) {
                const dice = badShapeRoll.dice[index];
                badShapeDices.push(...dice.results);
            }

            damageToolTipInfos.push(...Rolls.createDamageToolTip("badshapedamage", badShapeRoll.dice[0].results.length, badShapeDices));
            damage += badShapeRoll._total;
            rolls.push(badShapeRoll);
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
