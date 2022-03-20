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
    
        // Skill item        
        if ( itemData.type === "skill" ) {
          data.value = Skills.getSkillValue(data.base, data.bonus, data.developed);
        }        
    }

    /**
     * @name weaponSkill
     * @description For weapon Item, calculates the walue of the skill by using the linked skill
     * @param {*} actor 
     * @returns The value of the skill
     */
    weaponSkill(actor) {
        if (this.data.type !== "weapon") return;
        const skillId = this.data.data.skillId;
        if (!skillId) return;
        const skill = actor.items.get(skillId);
        if (skill.type !== "skill") return;
        const skillValue = skill.data.data.value;
        return skillValue;
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
     calculateWeaponDamage(actor, dices, useHeroism, lethalattack) {
        if (this.data.type !== "weapon") return;
        if (actor.data.type !== "player") return;

        let nbDices = parseInt(this.data.data.damageBase.substring(0,1));
        let damage = 0;
        let otherRoll = null;

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
        if (useHeroism) {
            damage += dices[3].result;
        }
        if (lethalattack > 0) {
            const lethalFormula = lethalattack + "d6";
            const lethalRoll = new Roll(lethalFormula, {}).roll({ async: false });
            console.log("lethalRoll = ", lethalRoll);
            otherRoll = lethalRoll;
            damage += lethalRoll._total;
        }
        if (this.data.data.range > 0) {
            damage += parseInt(actor.data.data.damageBonus.ranged);
        }
        else damage += parseInt(actor.data.data.damageBonus.melee);
        return {
            damage: damage,
            otherRoll: otherRoll
        }
    }
}