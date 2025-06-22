import { Skills } from "../common/skills.js";
import { Rolls } from "../common/rolls.js";
import { DAMAGE_TOOLTIP_SOURCE } from "../common/constants.js";
export default class CemBaseItem extends Item {
  /** @override */
  prepareData() {
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

    const skillId = this.getSystemData("skillId");
    if (!skillId) return;
    const skill = actor.items.get(skillId);
    if (skill === undefined || skill.type !== "skill") return;
    const skillName = skill.name;
    return skillName;
  }

  checkNoWeaponSkill(actor) {
    if (this.type !== "weapon") return;

    const skillId = this.getSystemData("skillId");
    return skillId ? false : true;
  }

  /**
   * @name weaponSkillValue
   * @description For weapon Item, calculates the walue of the skill by using the linked skill
   * @param {*} actor
   * @returns The value of the skill
   */
  weaponSkillValue(actor) {
    if (this.type !== "weapon") return;

    if (actor.type === "player") {
      const skill = this.weaponSkill(actor);
      if (skill === undefined || skill.type !== "skill") return;
      const skillValue = actor.getSkillValue(skill);
      return skillValue;
    }
    if (actor.type === "npc") {
      if (game.settings.get("cleenmain", "advancedRules") && actor.system.elite) return this.getSystemData("skillValueNpcElite");
      return this.getSystemData("skillValue");
    }
  }

  weaponSkill(actor) {
    const skillId = this.getSystemData("skillId");
    if (!skillId) return;
    const skill = actor.items.get(skillId);
    return skill;
  }
  /**
   * @name weaponDamage
   * @description For weapon Item, calculates the value of the damage
   *  damage = damageBase + melee/range bonus
   * @param {*} actor
   */
  weaponDamage(actor) {
    if (this.type !== "weapon") return;

    let damage = this.getSystemData("damageBase");

    if (this.getSystemData("type") === "ranged") {
      damage += " + " + actor.rangedBonus().toString();
    } else if (this.getSystemData("type") === "melee") {
      damage += " + " + actor.meleeBonus().toString();
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
   * @param {boolean} useHeroism
   * @param {int} lethalattack Number of Letah Attack boon
   * @param {int} minorinjury  Number of Minor Injury penalty
   * @param {int} multipleattacks Number of Multiple Attacks boon
   * @param {*} badShapeDamageBonus
   * @param {String} damageBonus 0, +1 , +2, +3 D6 added to damage
   * @param {*} rollbiotech 2nd bonus dice for biotech
   * @returns
   */
  async calculateWeaponDamage(actor, dices, useHeroism, lethalattack, minorinjury, multipleattacks, badShapeDamageBonus, damageBonus, rollbiotech) {
    if (this.type !== "weapon") return;

    const nbDamageDices = this.getSystemData("damageBase").match(/([0-9])d6/) ? parseInt(this.getSystemData("damageBase").match(/([0-9])d6/)[1]) : 0;
    const baseBonusDamage = this.getSystemData("damageBase").match(/d6[ ]?\+[ ]?([0-9])/) ? parseInt(this.getSystemData("damageBase").match(/d6[ ]?\+[ ]?([0-9])/)[1]) : 0;
    let damageFormula = null;
    let damage = 0;
    let nbSix = 0;
    let rolls = [];

    // Damage ToolTip creation
    let damageToolTipInfos = Rolls.createDamageToolTip("weapon", nbDamageDices, dices);

    switch (nbDamageDices) {
      case 1:
        damage += dices[0].result;
        if (dices[0].result == 6) nbSix++;
        break;

      case 2:
        damage += dices[1].result + dices[2].result;
        if (dices[1].result == 6) nbSix++;
        if (dices[2].result == 6) nbSix++;
        break;
      case 3:
        damage += dices[0].result + dices[1].result + dices[2].result;
        if (dices[0].result == 6) nbSix++;
        if (dices[1].result == 6) nbSix++;
        if (dices[2].result == 6) nbSix++;
        break;
      default:
        break;
    }

    // Damage formula for npc
    if (actor.type === "npc") {
      damageFormula = this.getSystemData("damageBase");

      // xd6 + value : 2d6 + 2
      if (damageFormula.includes("+")) {
        let damageFormulaWithoutSpace = damageFormula.replace(/\s+/g, "");
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
      damageFormula = this.getSystemData("damageBase");
      damage += baseBonusDamage;

      if (this.getSystemData("type") === "ranged") {
        damageFormula += " + " + actor.rangedBonus().toString();
        damage += actor.rangedBonus();
      } else {
        damageFormula += " + " + actor.meleeBonus().toString();
        damage += actor.meleeBonus();
      }

      // Heroism is the 4th dice
      if (useHeroism) {
        damageFormula += " + 1d6";
        damage += dices[3].result;
        if (rollbiotech) {
          damageFormula += " (+1d6 bonus)";
          damage += rollbiotech._total;
        }
        damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.HEROISM, 1, dices.slice(3)));
      }
    }
    // Damage bonus 1, 2 or 3 d6
    if (damageBonus > 0) {
      let damageBonusFormula = damageBonus + "d6" + "[black]";
      const damageBonusRoll = await new Roll(damageBonusFormula, {}).roll();
      let damageBonusDices = [];
      for (let index = 0; index < damageBonusRoll.dice.length; index++) {
        const dice = damageBonusRoll.dice[index];
        damageBonusDices.push(...dice.results);
      }

      damageFormula += " + " + damageBonus + "d6";
      damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.DAMAGE_BONUS, damageBonusRoll.dice[0].results.length, damageBonusDices));
      damage += damageBonusRoll._total;
      rolls.push(damageBonusRoll);
    }

    // Explosive weapon (6+)
    if (this.getSystemData("sixPlus")) {
      if (nbSix > 0) {
        const explosiveFormula = nbSix + "d6x[inspired]";
        const explosiveRoll = await new Roll(explosiveFormula, {}).roll();
        let explosiveDices = [];
        for (let index = 0; index < explosiveRoll.dice.length; index++) {
          const dice = explosiveRoll.dice[index];
          explosiveDices.push(...dice.results);
        }
        damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.EXPLOSIVE, explosiveRoll.dice[0].results.length, explosiveDices));
        damage += explosiveRoll._total;
        rolls.push(explosiveRoll);
      }
    }

    // Lethal attack boon
    if (lethalattack > 0) {
      let lethalFormula = lethalattack + "d6[black]";
      if (this.getSystemData("sixPlus")) {
        damageFormula += " + " + lethalattack + "d6x";
        lethalFormula = lethalattack + "d6x[black]";
      } else {
        damageFormula += " + " + lethalattack + "d6";
      }
      const lethalRoll = await new Roll(lethalFormula, {}).roll();
      let lethalDices = [];
      for (let index = 0; index < lethalRoll.dice.length; index++) {
        const dice = lethalRoll.dice[index];
        lethalDices.push(...dice.results);
      }
      damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.LETHAL_ATTACK, lethalRoll.dice[0].results.length, lethalDices));
      damage += lethalRoll._total;
      rolls.push(lethalRoll);
    }

    // Bad shape damage bonus from boon
    if (badShapeDamageBonus) {
      let badShapeFormula = badShapeDamageBonus + "[black]";

      if (this.getSystemData("sixPlus")) {
        damageFormula += " + " + badShapeDamageBonus + "x";
        badShapeFormula = badShapeDamageBonus + "x[black]";
      } else {
        damageFormula += " + " + badShapeDamageBonus;
      }

      const badShapeRoll = await new Roll(badShapeFormula, {}).roll();
      let badShapeDices = [];
      for (let index = 0; index < badShapeRoll.dice.length; index++) {
        const dice = badShapeRoll.dice[index];
        badShapeDices.push(...dice.results);
      }

      damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.BAD_SHAPE, badShapeRoll.dice[0].results.length, badShapeDices));
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
      rolls: rolls,
    };
  }

  /**
   * @name calculateRerolleWeaponDamage
   * @description For weapon Item, calculates the value of the damage depending of the damageBase and the results of the dices WHEN there is a reroll
   * The first Roll is standard damage with eventually heroism, others Rolls depend on option
   *  For a player : damage = damageBase + melee/range bonus
   *  For a npc : damage = damageBase
   * @param {*} actor
   * @param {*} dices The dices results of a roll
   * @param {boolean} useHeroism
   * @param {int} lethalattack Number of Letah Attack boon
   * @param {int} minorinjury  Number of Minor Injury penalty
   * @param {int} multipleattacks Number of Multiple Attacks boon
   * @param {*} badShapeDamageBonus
   * @param {String} damageBonus 0, +1 , +2, +3 D6 added to damage
   * @returns
   */
  calculateRerolleWeaponDamage(actor, dices, rolls, useHeroism, lethalattack, minorinjury, multipleattacks, badShapeDamageBonus, damageBonus) {
    if (this.type !== "weapon") return;

    const nbDamageDices = this.getSystemData("damageBase").match(/([0-9])d6/) ? parseInt(this.getSystemData("damageBase").match(/([0-9])d6/)[1]) : 0;
    const baseBonusDamage = this.getSystemData("damageBase").match(/d6[ ]?\+[ ]?([0-9])/) ? parseInt(this.getSystemData("damageBase").match(/d6[ ]?\+[ ]?([0-9])/)[1]) : 0;
    let damageFormula = null;
    let damage = 0;
    //let nbSix = 0;

    // Damage ToolTip creation
    let damageToolTipInfos = Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.WEAPON, nbDamageDices, dices);

    switch (nbDamageDices) {
      case 1:
        damage += dices[0].result;
        // if (dices[0].result == 6) nbSix++;
        break;

      case 2:
        damage += dices[1].result + dices[2].result;
        // if (dices[1].result == 6) nbSix++;
        // if (dices[2].result == 6) nbSix++;
        break;
      case 3:
        damage += dices[0].result + dices[1].result + dices[2].result;
        // if (dices[0].result == 6) nbSix++;
        // if (dices[1].result == 6) nbSix++;
        // if (dices[2].result == 6) nbSix++;
        break;
      default:
        break;
    }

    // Damage formula for npc
    if (actor.type === "npc") {
      damageFormula = this.getSystemData("damageBase");

      // xd6 + value : 2d6 + 2
      if (damageFormula.includes("+")) {
        let damageFormulaWithoutSpace = damageFormula.replace(/\s+/g, "");
        let bonus = damageFormulaWithoutSpace.substring(damageFormulaWithoutSpace.indexOf("+"));
        damage += parseInt(bonus);
      }

      // single value : +2
      if (!damageFormula.includes("d") && !damageFormula.includes("D")) {
        damage += parseInt(damageFormula);
      }
    }

    // Damage formulafor player : base + baseBonus
    if (actor.type === "player") {
      damageFormula = this.getSystemData("damageBase");
      damage += baseBonusDamage;
      if (this.getSystemData("type") === "ranged") {
        damageFormula += " + " + actor.rangedBonus().toString();
        damage += actor.rangedBonus();
      } else {
        damageFormula += " + " + actor.meleeBonus().toString();
        damage += actor.meleeBonus();
      }

      if (useHeroism) {
        damageFormula += " + 1d6";
        damage += dices[3].result;
        damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.HEROISM, 1, dices.slice(3)));
      }

      // If there is a damageBonus it's the second roll
      // Not reroll
      if (damageBonus > 0) {
        const damageBonusRoll = rolls[1];
        let damageBonusDices = [];
        for (let index = 0; index < damageBonusRoll.dice.length; index++) {
          const dice = damageBonusRoll.dice[index];
          damageBonusDices.push(...dice.results);
        }
        damageFormula += " + " + damageBonus + "d6";
        damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.DAMAGE_BONUS, damageBonus, damageBonusDices));
        damage += damageBonusRoll._total;
      }

      // Lethal attack boon
      if (lethalattack > 0) {
        // If there is also a damageBonus, it's the third roll, elsewhere it's the second one
        const lethalRoll = damageBonus > 0 ? rolls[2] : rolls[1];
        let lethalDices = [];
        for (let index = 0; index < lethalRoll.dice.length; index++) {
          const dice = lethalRoll.dice[index];
          lethalDices.push(...dice.results);
        }
        damageToolTipInfos.push(...Rolls.createDamageToolTip(DAMAGE_TOOLTIP_SOURCE.LETHAL_ATTACK, lethalRoll.dice[0].results.length, lethalDices));
        damage += lethalRoll._total;
      }
    }

    // Explosive weapon (6+)
    /*
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
        }*/

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
      rolls: rolls,
    };
  }

  getArmorMalus(actor) {
    if (this.type != "armor") return null;
    let malus = 0;
    if (this.system.category === "war") {
      if (!actor.isTrainedWithWarArmor() && !actor.isTrainedWithHeavyArmor()) malus += 2;
    } else if (this.system.category === "heavy") {
      if (!actor.isTrainedWithHeavyArmor()) {
        if (actor.isTrainedWithWarArmor()) {
          malus += 2;
        } else malus += 4;
      }
    }
    return malus;
  }
}
