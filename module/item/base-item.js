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
}