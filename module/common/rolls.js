import CemBaseItem from "../item/base-item.js";
import { CemChat } from "./chat.js";
import { CLEENMAIN } from "./config.js";
import { ROLL_TYPE } from "./constants.js";

export class Rolls {
  static TOOLTIP_DAMAGE_TEMPLATE = "systems/cleenmain/templates/dice/damage-tooltip.html";

  /**
   * Rolls dices
   * @param actor The actor which performs the action
   * @param item  The purpose of the action, that is the item, the attribute
   * @param rollType  The type of roll
   * @param data  The action data : ll specific data used to display the roll <br>
   * rollMode
   * formula :
   * formulaColor : formula with colored dices
   * targetDifficulty
   * To calculate weapon damage :
   *      boolean : useHeroism
   *      int : lethalattack (boon), minorinjury (penalty), multipleattacks (boon)
   *      ? : badShapeDamageBonus
   * For display : introText, actingChar (object with name and image)
   * applyModifiers : Array[String] all modifiers' description
   * Type of roll (boolean) : skillRoll, attackRoll, damageRoll
   * options.bonuses : {value, tooltip}
   */
  static async check(actor, item, rollType, data) {
    let skillRoll = false;
    let attackRoll = false;
    let damageRoll = false;

    let titleDialog = "";
    let introText;
    let rollFormulaDisplay;
    let rollFormula;
    let formulaTooltip = "";
    let heroismBonus1d6 = item.system.heroismBonus1d6;
    let skillBonus1d6 = false;

    // Si rollMode n'est pas défini, on prend celui par défaut (celui du chat)
    let visibilityMode = data.rollMode ?? game.settings.get("core", "rollMode");

    // Visibilité des jet des PNJs en fonction de l'option choisie
    if (actor.type === "npc" && game.user.isGM) {
      let visibilityChoice = game.settings.get("cleenmain", "visibiliteJetsPNJ");
      if (visibilityChoice === "public") visibilityMode = "publicroll";
      else if (visibilityChoice === "private") visibilityMode = "gmroll";
      else if (visibilityChoice === "depends") visibilityMode = game.settings.get("core", "rollMode");
    }

    data.rollMode = visibilityMode;

    // Skill Roll
    if (rollType === ROLL_TYPE.SKILL) {
      skillRoll = true;
      const roll = this._skillRoll(actor, item, data);
      titleDialog = roll.titleDialog;
      introText = roll.introText;
      rollFormulaDisplay = roll.rollFormulaDisplay;
      rollFormula = roll.rollFormula;
      formulaTooltip = roll.formulaTooltip;
      skillBonus1d6 = roll.skillBonus1d6;
    }

    // Attack roll
    if (rollType === ROLL_TYPE.ATTACK) {
      attackRoll = true;
      const roll = this._attackRoll(actor, item, data);
      titleDialog = roll.titleDialog;
      introText = roll.introText;
      rollFormulaDisplay = roll.rollFormulaDisplay;
      rollFormula = roll.rollFormula;
      formulaTooltip = roll.formulaTooltip;
    }

    // Damage roll
    if (rollType === ROLL_TYPE.DAMAGE) {
      if (actor.type == "npc") return;
      damageRoll = true;

      const roll = this._damageRoll(actor, item, data);
      titleDialog = roll.titleDialog;
      introText = roll.introText;
      rollFormulaDisplay = roll.rollFormulaDisplay;
      rollFormula = roll.rollFormula;
    }

    // Create the dialog panel to display.
    const html = await foundry.applications.handlebars.renderTemplate("systems/cleenmain/templates/chat/roll-dialog.hbs", {
      actor: actor,
      item: item,
      type: rollType,
      action: data,
      introText: introText,
      actingCharImg: data.actingChar.img,
      isPlayer: actor.isPlayer(),
      hasHeroism: actor.hasHeroismPoints(),
      hasBiotech: game.settings.get("cleenmain", "pointsbiotech"),
      rollFormula: rollFormulaDisplay,
      rollFormulaColor: rollFormula,
      formulaTooltip: formulaTooltip,
      skillRoll: skillRoll,
      attackRoll: attackRoll,
      damageRoll: damageRoll,
      heroismBonus1d6: heroismBonus1d6,
    });

    // App V2
    new foundry.applications.api.DialogV2({
      window: { title: titleDialog },
    position: {
      width: 400,
    },
      content: html,
      buttons: [
        { action: "apply", icon: 'fas fa-check', label: game.i18n.localize("CLEENMAIN.dialog.button.roll"), type: "submit", default: true },
        { action: "cancel", icon: '<i class="fas fa-times"></i>', label: game.i18n.localize("Abandonner"), type: "cancel" },
      ],
      submit: async (result) => {
        if (result !== "apply") return;

        data.skillRoll = skillRoll;
        data.attackRoll = attackRoll;
        data.damageRoll = damageRoll;

        data.introText = introText;

        data.applyModifiers = [];

        // The optional modifier
        const modifierInput = document.querySelectorAll(".modifierChange");
        for (const input of modifierInput) {
          const newValue = input.valueAsNumber;
          if (newValue) {
            data.modifier = newValue;
          }
        }
        // The optional damage bonus
        if (!skillRoll) {
          const damageBonusSelect = document.querySelectorAll('select[class="damageBonus"]');
          for (const select of damageBonusSelect) {
            data.damageBonus = parseInt(select.value);
          }
        }

        data.formula = rollFormulaDisplay;
        data.formulaColor = rollFormula;
        data.formulaTooltip = formulaTooltip;

        if (data.modifier) {
          data.formula = data.formula.concat(" + ", data.modifier.toString());
          data.formulaColor = data.formulaColor.concat(" + ", data.modifier.toString());
          data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.custommodifier", { rollModifier: data.modifier }));
        }
        // The optional heroism use
        data.useHeroism = false;

        const heroismInput = document.querySelectorAll(".heroism");
        for (const input of heroismInput) {
          const newValue = input.checked;
          if (newValue) {
            data.useHeroism = true;
            let dice = item.system.heroismBonus1d6 ? "2" : "1";
            data.formula += " + " + dice + "d6";
            data.formulaColor += " + " + dice + "d6[bronze]";
            data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.heroismmodifier", { dice: dice }));
            actor.useHeroism(1);
          }
        }
        if (attackRoll) {
          let behaviourModifier = 0;
          // Boons
          const lethalattackInput = document.querySelectorAll(".lethalattack");
          for (const input of lethalattackInput) {
            data.lethalattack = input.valueAsNumber ?? 0;
            if (data.lethalattack > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.lethalattack.chatmessage", data));
          }
          const multipleattacksInput = document.querySelectorAll(".multipleattacks");
          for (const input of multipleattacksInput) {
            data.multipleattacks = input.valueAsNumber ?? 0;
            if (data.multipleattacks > 0) data.applyModifiers.push(game.i18n.localize("CLEENMAIN.bonus.multipleattacks.chatmessage"));
          }
          const efficiencyInput = document.querySelectorAll(".efficiency");
          for (const input of efficiencyInput) {
            data.efficiency = input.valueAsNumber ?? 0;
            if (data.efficiency > 0) {
              data.formula = data.formula.concat(" + ").concat((data.efficiency * 2).toString());
              data.formulaColor = data.formulaColor.concat(" + ").concat((data.efficiency * 2).toString());
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.efficiency.chatmessage", data));
            }
          }
          const cautionInput = document.querySelectorAll(".caution");
          for (const input of cautionInput) {
            data.caution = input.valueAsNumber ?? 0;
            if (data.caution > 0) {
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.caution.chatmessage", data));
              behaviourModifier += data.caution;
            }
          }
          if (game.settings.get("cleenmain", "advancedRules")) {
            const quickInput = document.querySelectorAll(".quick");
            for (const input of quickInput) {
              data.quick = input.valueAsNumber ?? 0;
              if (data.quick > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.quick.chatmessage"));
            }
          }
          // Penalties
          const minorinjuryInput = document.querySelectorAll(".minorinjury");
          for (const input of minorinjuryInput) {
            data.minorinjury = input.valueAsNumber ?? 0;
            if (data.minorinjury > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.minorinjury.chatmessage"));
          }
          const dangerInput = document.querySelectorAll(".danger");
          for (const input of dangerInput) {
            data.danger = input.valueAsNumber ?? 0;
            if (data.danger > 0) {
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.danger.chatmessage", data));
              behaviourModifier -= data.danger;
            }
          }
          const difficultyInput = document.querySelectorAll(".difficulty");
          for (const input of difficultyInput) {
            data.difficulty = input.valueAsNumber ?? 0;
            if (data.difficulty > 0) {
              data.formula = data.formula.concat(" - ").concat((data.difficulty * 2).toString());
              data.formulaColor = data.formulaColor.concat(" - ").concat((data.difficulty * 2).toString());
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.difficulty.chatmessage", data));
            }
          }
          const riskInput = document.querySelectorAll(".risk");
          for (const input of riskInput) {
            data.risk = input.valueAsNumber ?? 0;
            if (data.risk > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.risk.chatmessage", data));
          }
          if (game.settings.get("cleenmain", "advancedRules")) {
            const slownessInput = document.querySelectorAll(".slowness");
            for (const input of slownessInput) {
              data.slowness = input.valueAsNumber ?? 0;
              if (data.slowness > 0) data.applyModifiers.push(game.i18n.localize("CLEENMAIN.penalty.slowness.chatmessage"));
            }
          }
          if (behaviourModifier != 0) {
            actor.addBehaviourModifier(behaviourModifier);
          }
        }

        // Reroll if it's not an attack
        if (!attackRoll) {
          const nbRerollInput = document.querySelectorAll(".nbReroll");
          for (const input of nbRerollInput) {
            data.nbReroll = input.valueAsNumber ?? 0;
          }
        }
        // Remove one bonus or malus for a defence roll
        if (skillRoll) {
          if (item.system.reference === "defence") {
            actor.useBehaviourModifier();
          }
        }

        // Status
        if (actor.isInBadShape()) {
          data.applyModifiers.push(game.i18n.localize("CLEENMAIN.health.status.badshape"));
          data.badShapeDamageBonus = actor.system.health.badShapeDamageBonus ?? 0;
        }

        // Calculate the final difficulty
        // data.targetDifficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipWoundModifier ? 0 : woundModifier) + additionalKa + approche;

        // Process to the roll
        await Rolls.displayRoll(actor, item, data);
      },
    }).render(true);

    /*
    // Display the action panel
    await new Dialog({
      title: titleDialog,
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CLEENMAIN.dialog.button.roll"),
          callback: async (html) => {
            data.skillRoll = skillRoll;
            data.attackRoll = attackRoll;
            data.damageRoll = damageRoll;

            data.introText = introText;

            data.applyModifiers = [];

            // The optional modifier
            const modifierInput = html.find("#rollmodifier")[0].value;
            if (modifierInput !== "") {
              data.modifier = parseInt(Math.floor(parseInt(modifierInput)));
            }

            // The optional damage bonus
            if (!skillRoll) {
              const damageBonus = html.find("#damageBonus")[0].value;
              data.damageBonus = parseInt(damageBonus);
            }

            data.formula = rollFormulaDisplay;
            data.formulaColor = rollFormula;
            data.formulaTooltip = formulaTooltip;

            if (data.modifier) {
              data.formula = data.formula.concat(" + ", data.modifier.toString());
              data.formulaColor = data.formulaColor.concat(" + ", data.modifier.toString());
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.custommodifier", { rollModifier: data.modifier }));
            }

            // The optional heroism use
            data.useHeroism = false;

            if (html.find("#heroism")[0]?.checked) {
              data.useHeroism = true;
              let dice = item.system.heroismBonus1d6 ? "2" : "1";
              data.formula += " + " + dice + "d6";
              data.formulaColor += " + " + dice + "d6[bronze]";
              data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.heroismmodifier", { dice: dice }));
              actor.useHeroism(1);
            }

            if (attackRoll) {
              let behaviourModifier = 0;

              // Boons
              let lethalattack = html.find("#lethalattack")[0].value;
              data.lethalattack = parseInt(lethalattack) ?? 0;
              if (data.lethalattack > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.lethalattack.chatmessage", data));

              let multipleattacks = html.find("#multipleattacks")[0].value;
              data.multipleattacks = parseInt(multipleattacks) ?? 0;
              if (data.multipleattacks > 0) data.applyModifiers.push(game.i18n.localize("CLEENMAIN.bonus.multipleattacks.chatmessage"));

              let efficiency = html.find("#efficiency")[0].value;
              data.efficiency = parseInt(efficiency) ?? 0;
              if (data.efficiency > 0) {
                data.formula = data.formula.concat(" + ").concat((data.efficiency * 2).toString());
                data.formulaColor = data.formulaColor.concat(" + ").concat((data.efficiency * 2).toString());
                data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.efficiency.chatmessage", data));
              }

              let caution = html.find("#caution")[0].value;
              data.caution = parseInt(caution) ?? 0;
              if (data.caution > 0) {
                data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.caution.chatmessage", data));
                behaviourModifier += data.caution;
              }

              if (game.settings.get("cleenmain", "advancedRules")) {
                let quick = html.find("#quick")[0].value;
                data.quick = parseInt(quick) ?? 0;
                if (data.quick > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.quick.chatmessage"));
              }

              // Penalties
              let minorinjury = html.find("#minorinjury")[0].value;
              data.minorinjury = parseInt(minorinjury) ?? 0;
              if (data.minorinjury > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.minorinjury.chatmessage"));

              let danger = html.find("#danger")[0].value;
              data.danger = parseInt(danger) ?? 0;
              if (data.danger > 0) {
                data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.danger.chatmessage", data));
                behaviourModifier -= data.danger;
              }

              let difficulty = html.find("#difficulty")[0].value;
              data.difficulty = parseInt(difficulty) ?? 0;
              if (data.difficulty > 0) {
                data.formula = data.formula.concat(" - ").concat((data.difficulty * 2).toString());
                data.formulaColor = data.formulaColor.concat(" - ").concat((data.difficulty * 2).toString());
                data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.difficulty.chatmessage", data));
              }

              let risk = html.find("#risk")[0].value;
              data.risk = parseInt(risk) ?? 0;
              if (data.risk > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.risk.chatmessage", data));

              if (game.settings.get("cleenmain", "advancedRules")) {
                let slowness = html.find("#slowness")[0].value;
                data.slowness = parseInt(slowness) ?? 0;
                if (data.slowness > 0) data.applyModifiers.push(game.i18n.localize("CLEENMAIN.penalty.slowness.chatmessage"));
              }

              if (behaviourModifier != 0) {
                actor.addBehaviourModifier(behaviourModifier);
              }
            }

            // Reroll if it's not an attack
            if (!attackRoll) {
              let nbReroll = html.find("#nbReroll")[0].value;
              data.nbReroll = parseInt(nbReroll) ?? 0;
            }

            // Remove one bonus or malus for a defence roll
            if (skillRoll) {
              if (item.system.reference === "defence") {
                actor.useBehaviourModifier();
              }
            }

            // Status
            if (actor.isInBadShape()) {
              data.applyModifiers.push(game.i18n.localize("CLEENMAIN.health.status.badshape"));
              data.badShapeDamageBonus = actor.system.health.badShapeDamageBonus ?? 0;
            }

            // Calculate the final difficulty
            // data.targetDifficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipWoundModifier ? 0 : woundModifier) + additionalKa + approche;

            // Process to the roll
            await Rolls.displayRoll(actor, item, data);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("Abandonner"),
          callback: () => {},
        },
      },
      default: "roll",
      close: () => {},
    }).render(true);*/
  }

  /**
   *
   * @param {*} actor
   * @param {*} item
   * @param {*} data
   * @returns titleDialog, introText, rollFormulaDisplay, rollFormula, formulaTooltip, skillBonus1d6
   */
  static _skillRoll(actor, item, data) {
    let titleDialog = game.i18n.format("CLEENMAIN.dialog.titleskill", { itemName: item.name });
    let introText = game.i18n.format("CLEENMAIN.dialog.introskill", { actingCharName: data.actingChar.name, itemName: item.name });

    let rollFormulaDisplay;
    let rollFormula;
    let skillBonus1d6 = false;

    let value = actor.getSkillValue(item).toString();
    // rollBonus : +fixed value to roll, from boon
    let rollBonus = item.system.rollBonus;
    if (rollBonus) value += " + " + rollBonus.toString();

    // rollBonus1d6 : +1d6 to roll, from boon
    if (item.system.rollBonus1d6) {
      rollFormulaDisplay = "4d6 + " + value;
      rollFormula = "1d6[red] + 2d6[white] + 1d6[green] + " + value;
      skillBonus1d6 = true;
    } else {
      rollFormulaDisplay = "3d6 + " + value;
      rollFormula = "1d6[red] + 2d6[white] + " + value;
    }

    let formulaTooltip = game.i18n.format("CLEENMAIN.tooltip.skill") + value;

    // heroismBonus1d6 : +1d6 when using heroism, from boon
    let heroismBonus1d6 = item.system.heroismBonus1d6 ? true : false;

    // Check armors training
    if (item.system.physical) {
      const armorMalus = actor.getArmorMalus();
      if (armorMalus > 0) {
        rollFormulaDisplay = rollFormulaDisplay.concat(" - ", armorMalus);
        rollFormula = rollFormula.concat(" - ", armorMalus);
        formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.armormalus"), "-", armorMalus);
      }
    }

    // Bonuses
    if (data.options?.bonuses) {
      for (let bonus of data.options.bonuses) {
        rollFormulaDisplay = rollFormulaDisplay.concat(" + ", bonus.value);
        rollFormula = rollFormula.concat(bonus.value);
        formulaTooltip = formulaTooltip.concat(", ", bonus.tooltip);
      }
    }

    // Bad Shape for player and boss
    if (actor.isInBadShape() && !data.options?.badShapeRoll) {
      let modValue = actor.system.health.badShapeSkillBonus ? " + " + actor.system.health.badShapeSkillBonus.toString() : " - 2";
      let tooltipModValue = actor.system.health.badShapeSkillBonus ? "+" + actor.system.health.badShapeSkillBonus.toString() : "-2";
      rollFormulaDisplay = rollFormulaDisplay.concat(modValue);
      rollFormula = rollFormula.concat(modValue);
      formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.badshape"), tooltipModValue);
    }

    // Defence check : bonus or malus from boon or penality
    if (CLEENMAIN.skillsModifiedBehaviour.includes(item.system.reference)) {
      const mod = actor.getBehaviourValue();
      if (mod) {
        if (mod > 0) {
          rollFormulaDisplay = rollFormulaDisplay.concat(" + ").concat(mod * 2);
          rollFormula = rollFormula.concat(" + ", (mod * 2).toString());
          formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.bonus.caution.label"), " + ", mod * 2);
        } else if (mod < 0) {
          rollFormulaDisplay = rollFormulaDisplay.concat(" - ").concat(Math.abs(mod * 2));
          rollFormula = rollFormula.concat(" - ", Math.abs(mod * 2).toString());
          formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.penalty.danger.label"), ": ", mod * 2);
        }
      }
    }

    return { titleDialog, introText, rollFormulaDisplay, rollFormula, formulaTooltip, skillBonus1d6 };
  }

  /**
   *
   * @param {*} actor
   * @param {*} item
   * @param {*} data
   * @returns titleDialog, introText, rollFormulaDisplay, rollFormula, formulaTooltip, skillBonus1d6
   */
  static _attackRoll(actor, item, data) {
    let titleDialog = game.i18n.format("CLEENMAIN.dialog.titleweapon", { itemName: item.name });
    let introText = game.i18n.format("CLEENMAIN.dialog.introweapon", { actingCharName: data.actingChar.name, itemName: item.name });

    let rollFormulaDisplay = "3d6" + this._getTerm(item.weaponSkillValue(actor)) + this._getTerm(item.system.skillBonus);
    let rollFormula = "1d6[red] + 2d6[white] " + this._getTerm(item.weaponSkillValue(actor)) + this._getTerm(item.system.skillBonus);

    // rollBonus : +fixed value to roll, from boon
    if (actor.isPlayer()) {
      let skill = item.weaponSkill(actor);
      let rollBonus = skill.system.rollBonus;
      if (rollBonus) {
        rollFormulaDisplay += " + " + rollBonus.toString();
        rollFormula += " + " + rollBonus.toString();
      }
    }
    let formulaTooltip =
      game.i18n.format("CLEENMAIN.tooltip.skill") +
      item.weaponSkillValue(actor) +
      (item.system.skillBonus ? ", " + game.i18n.format("CLEENMAIN.tooltip.weaponbonus") + item.system.skillBonus.toString() : "");

    if (actor.isPlayer()) {
      // Check weapons trainings
      if (item.system.category === "war") {
        if (!actor.system.trainings.weapons.war) {
          data.difficulty = 1;
          data.risk = 1;
          formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.untrained"));
        }
      }
      if (item.system.category === "heavy") {
        if (!actor.system.trainings.weapons.war && !actor.system.trainings.weapons.heavy) {
          data.difficulty = 2;
          data.risk = 1;
          formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.untrained"));
        }
        if (actor.system.trainings.weapons.war && !actor.system.trainings.weapons.heavy) {
          data.difficulty = 1;
          data.risk = 1;
          formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.untrained"));
        }
      }
    }
    // Bad Shape for player and boss
    if (actor.isInBadShape()) {
      let modValue = actor.system.health.badShapeSkillBonus ? " + " + actor.system.health.badShapeSkillBonus.toString() : " - 2";
      let tooltipModValue = actor.system.health.badShapeSkillBonus ? "+" + actor.system.health.badShapeSkillBonus.toString() : "-2";
      rollFormulaDisplay = rollFormulaDisplay.concat(modValue);
      rollFormula = rollFormula.concat(modValue);
      formulaTooltip = formulaTooltip.concat(", ", game.i18n.format("CLEENMAIN.tooltip.badshape"), tooltipModValue);
    }

    return { titleDialog, introText, rollFormulaDisplay, rollFormula, formulaTooltip };
  }

  /**
   *
   * @param {*} actor
   * @param {*} item
   * @param {*} data
   * @returns titleDialog, introText, rollFormulaDisplay, rollFormula, formulaTooltip, skillBonus1d6
   */
  static _damageRoll(actor, item, data) {
    let titleDialog = game.i18n.format("CLEENMAIN.dialog.titledamage", { itemName: item.name });
    let introText = game.i18n.format("CLEENMAIN.dialog.introdamage", { actingCharName: data.actingChar.name, itemName: item.name });

    let rollFormulaDisplay = item.weaponDamage(actor);
    let rollFormula = rollFormulaDisplay;

    return { titleDialog, introText, rollFormulaDisplay, rollFormula };
  }

  /**
   * Transforme l'élément en fonction du type
   * @param {string|number} element
   * @returns "" ou + element
   */
  static _getTerm(element) {
    if (element && element != 0) {
      if (typeof element === "string") return " + ".concat(element);
      else if (typeof element === "number") return " + ".concat(element.toString());
    }
    return "";
  }

  /**
   * This method is used to display a roll result.
   * @param {CemBaseActor} actor   The actor which performs the action
   * @param {CemBaseItem} item     The purpose of the action, that is the item, the attribute
   * @param {Object} data
   */
  static async displayRoll(actor, item, data) {
    // Roll the dice
    const result = await Rolls.getRollResult(actor, typeof data.formulaColor !== "undefined" ? data.formulaColor : data.formula, data.targetDifficulty);

    // Rolls is an array of roll
    let rolls = [result.roll];

    // Reroll
    let reRollNb = 0;
    let reRollDone = 0;
    let reRollDices = [];

    // Skill or damage reroll
    if (data.skillRoll || data.damageRoll) {
      reRollNb = data.nbReroll;
    }
    if (result.rollbiotech) data.formula = data.formula + " (+1d6 bonus)";
    // Calculate damages
    let attackDamage = null;
    if (data.attackRoll && item.type === "weapon") {
      attackDamage = await item.calculateWeaponDamage(
        actor,
        result.dices,
        data.useHeroism,
        data.lethalattack,
        data.minorinjury,
        data.multipleattacks,
        data.badShapeDamageBonus,
        data.damageBonus,
        result.rollbiotech
      );
      attackDamage.rolls.forEach((r) => {
        rolls.push(r);
      });
      reRollNb = item.system.diceRerollNb;
    }

    // Display the roll action
    let chatData = {
      actorId: actor.id,
      itemId: item.id,
      item: item,
      useHeroism: data.useHeroism,
      lethalattack: data.lethalattack,
      minorinjury: data.minorinjury,
      multipleattacks: data.multipleattacks,
      badShapeDamageBonus: data.badShapeDamageBonus,
      damageBonus: data.damageBonus,
      difficulty: data.targetDifficulty,
      introText: data.introText,
      actingCharImg: data.actingChar.img,
      formula: data.formula,
      formulaTooltip: data.formulaTooltip,
      applyModifiers: data.applyModifiers,
      result: result,
      damage: attackDamage?.damage,
      damageFormula: attackDamage?.damageFormula,
      damageToolTip: attackDamage !== null ? await Rolls.getDamageTooltip(attackDamage.damageToolTipInfos) : null,
      skillRoll: data.skillRoll,
      attackRoll: data.attackRoll,
      damageRoll: data.damageRoll,
      rolls: rolls,
      rollMode: data.rollMode,
      reRollNb: reRollNb,
      reRollDices: reRollDices,
      reRollDone: reRollDone,
    };

    let flagCanReRoll = false;
    let flagReRoll = {};

    // If Reroll available, put the roll in actor's flags
    if (reRollNb > 0) {
      flagCanReRoll = true;
      flagReRoll = chatData;

      let i = 1;
      let color = "#ff0000";
      let spelledNb;
      // Get the dices
      for (let dice of result.dices) {
        if (i > 1) {
          color = "#ffffff";
        }
        if (i > 3) {
          color = "#cd7f32";
        }
        switch (dice.result) {
          case 1:
            spelledNb = "one";
            break;
          case 2:
            spelledNb = "two";
            break;
          case 3:
            spelledNb = "three";
            break;
          case 4:
            spelledNb = "four";
            break;
          case 5:
            spelledNb = "five";
            break;
          case 6:
            spelledNb = "six";
            break;
        }
        chatData.reRollDices.push({ nb: spelledNb, color: color });
        i++;
      }
    }

    let chat = await new CemChat(actor)
      .withTemplate("systems/cleenmain/templates/chat/roll-result.hbs")
      .withData(chatData)
      .withFlags(
        flagCanReRoll
          ? {
              world: {
                canReRoll: true,
                reRoll: flagReRoll,
              },
            }
          : {}
      )
      .withRolls(rolls)
      .create();

    await chat.display();
  }

  /**
   * @description Rolls dices, calculate some results as critical or fumble and returns the result.
   * @param {*} speaker
   * @param {*} formula
   * @param {*} targetDifficulty //TO DO : NOT USED RIGHT NOW
   * @returns the roll result
   */
  static async getRollResult(actor, formula, targetDifficulty) {
    const roll = await new Roll(formula, {}).roll();
    return Rolls.getResult(actor, roll, targetDifficulty);
  }

  /**
   * @param {*} roll The roll value is several d6
   * @param {*} targetDifficulty The difficulty to succeed //TO DO : NOT USED RIGHT NOW
   * @return the roll result with fumble, critical, total, tolltip, dices, roll
   */
  static async getResult(actor, roll, targetDifficulty) {
    let rollbiotech;
    if (game.settings.get("cleenmain", "pointsbiotech")) {
      let firstBiotechTerm;
      roll.terms.forEach((element) => {
        if (element.options.flavor === "bronze") firstBiotechTerm = foundry.utils.duplicate(element);
      });
      if (firstBiotechTerm) {
        if (firstBiotechTerm?.results[0]?.result < 4 || actor.system.always2dice) {
          rollbiotech = await new Roll("1d6", {}).roll();
          roll._formula = roll._formula + " + 1d6[yellow]";
          roll._total = roll._total + rollbiotech._total;
          roll.terms.push(rollbiotech.terms[0]);
        }
      }
    }
    /*
        const fail = roll === 100 || (roll > (level * 10) && roll !== 1);
    */
    const critical = Rolls._isTriple(roll, 1);
    const fumble = Rolls._isTriple(roll, 6);
    let toolTip = new Handlebars.SafeString(await roll.getTooltip());

    let dices = [];
    for (let index = 0; index < roll.dice.length; index++) {
      const dice = roll.dice[index];
      dices.push(...dice.results);
    }
    return {
      /*success: !fail,*/
      fumble: fumble,
      critical: critical,
      rollbiotech: rollbiotech,
      total: roll._total,
      tooltip: toolTip,
      dices: dices,
      roll: roll,
    };
  }

  /**
   * @description Same value for the 3 first dices of the roll
   * @param {*} roll
   * @param {*} value
   * @returns true if the 3 dices have the same value
   */
  static _isTriple(roll, value) {
    if (roll.dice[0].results[0] == value && roll.dice[0].results[1] == value && roll.dice[0].results[2] == value) return true;
    return false;
  }

  /**
   * Render the tooltip HTML for a Roll instance
   * @return {Promise<string>}      The rendered HTML tooltip as a string
   */
  static async getDamageTooltip(damageToolTipInfos) {
    const parts = damageToolTipInfos.map((d) => {
      return {
        source: d.source,
        total: d.total,
        dices: d.dices,
      };
    });
    return foundry.applications.handlebars.renderTemplate(Rolls.TOOLTIP_DAMAGE_TEMPLATE, { parts });
  }

  /**
   * @name createDamageToolTip
   * @description Create a new entry for a Tool Type
   * @param {*} source
   * @param {*} nbDamageDices Number of dices used for damage, must be equal or less than the total of dices
   * @param {*} dices Array of dice result {result: x, active: true, explosive: true}
   * @returns
   */
  static createDamageToolTip(source, nbDamageDices, dices) {
    let damageToolTipInfos = [];
    let damageToolTipInfosDetails = {};
    damageToolTipInfosDetails.source = game.i18n.format("CLEENMAIN.chatmessage." + source, { nbDices: nbDamageDices });
    damageToolTipInfosDetails.dices = [];

    let totalAttack = 0;

    if (source == "weapon") {
      // First dice
      if (nbDamageDices == 1) {
        damageToolTipInfosDetails.dices[0] = dices[0].result;
        totalAttack += dices[0].result;
      }
      // Second and third dices
      else if (nbDamageDices == 2) {
        damageToolTipInfosDetails.dices[0] = dices[1].result;
        damageToolTipInfosDetails.dices[1] = dices[2].result;
        totalAttack += dices[1].result + dices[2].result;
      }
      // All three dices
      else if (nbDamageDices == 3) {
        damageToolTipInfosDetails.dices[0] = dices[0].result;
        damageToolTipInfosDetails.dices[1] = dices[1].result;
        damageToolTipInfosDetails.dices[2] = dices[2].result;
        totalAttack += dices[0].result + dices[1].result + dices[2].result;
      }
    } else {
      for (let index = 0; index < dices.length; index++) {
        damageToolTipInfosDetails.dices[index] = dices[index].result;
        totalAttack += dices[index].result;
      }
    }

    damageToolTipInfosDetails.total = totalAttack.toString();
    damageToolTipInfos.push(damageToolTipInfosDetails);

    return damageToolTipInfos;
  }

  /**
   * @description Handles the reroll button in the chat message
   * @param {*} event
   * @param {*} message
   */
  static async reroll(event, message) {
    // Get the actor who has sent the chat message
    const actorId = $(event.currentTarget).parents(".chatroll").data("actorId");
    const actor = game.actors.get(actorId);

    // Get the message
    const messageId = message._id;
    const newMessage = game.messages.get(messageId);

    // Only the GM and the actor who has sent the message can reroll
    if (!game.user.isGM) {
      let found = false;
      let userArray = await actor.getOwnerPlayer();
      let userId = game.user._id;
      for (let user of userArray) {
        if (user._id == userId) found = true;
      }
      if (!found) return;
    }

    const canReroll = newMessage.getFlag("world", "canReRoll");
    if (!canReroll) return;

    // Get the dice which is rerolled (start at 0)
    const btn = $(event.currentTarget);
    const dice = btn.data("diceNb");

    // Roll 1d6
    let diceColor;
    // Red dice
    if (dice == 0) {
      diceColor = "red";
    }
    // White dices
    else if (dice == 1 || dice == 2) {
      diceColor = "white";
    }
    // Bronze dice
    else if (dice == 3) {
      diceColor = "bronze";
    }
    const newDice = await new Roll("1d6[" + diceColor + "]", {}).roll();

    // display the roll in Dice So Nice if the module is active
    if (game.modules.get("dice-so-nice")?.active) {
      let synchro = actor.type === "player" || !game.user.isGM;
      game.dice3d.showForRoll(newDice, game.user, synchro);
    }

    // Take the existing roll
    let roll = newMessage.rolls[0];

    // rolls[0].terms[0].rolls : simple jet 1 seul Roll, sinon plusieurs Roll, le premier est le jet, les autres les bonus à conserver

    // Get the chat data stored in the message's flag
    let chatData = newMessage.getFlag("world", "reRoll");

    // Pas de bonus de dés particuliers : juste éventuellement l'héroïsme
    if (roll.terms[0].rolls.length == 1) {
      // Replace in the roll : the dice rerolled and the new total
      let newTotal = roll._total;

      // Attack or skill Roll
      if (chatData.attackRoll || chatData.skillRoll) {
        // Red dice
        if (dice == 0) {
          newTotal = newTotal - roll.dice[0].results[0].result + newDice.total;
          roll.dice[0].results[0].result = newDice.total;
        }
        // White dices
        else if (dice == 1 || dice == 2) {
          newTotal = newTotal - roll.dice[1].results[dice - 1].result + newDice.total;
          roll.dice[1].results[dice - 1].result = newDice.total;
        }
        // Bronze dice
        else if (dice == 3) {
          newTotal = newTotal - roll.dice[2].results[0].result + newDice.total;
          roll.dice[2].results[0].result = newDice.total;
        }
      } else if (chatData.damageRoll) {
        newTotal = newTotal - roll.dice[0].results[dice].result + newDice.total;
        roll.dice[0].results[dice].result = newDice.total;
      }

      roll._total = newTotal;
      chatData.rolls[0] = roll;

      // Generate the new result
      chatData.result = await this.getResult(actor, roll, null);

      // Update the reroll number
      chatData.reRollNb = chatData.reRollNb - 1;
      chatData.reRollDone = chatData.reRollDone + 1;

      // Calculate damage if it's a weapon
      if (chatData.attackRoll && chatData.item.type == "weapon") {
        const itemId = chatData.itemId;
        const item = game.actors.get(actorId).items.get(itemId);
        let attackDamage = await item.calculateRerolleWeaponDamage(
          actor,
          chatData.result.dices,
          null,
          chatData.useHeroism,
          chatData.lethalattack,
          chatData.minorinjury,
          chatData.multipleattacks,
          chatData.badShapeDamageBonus,
          chatData.damageBonus,
          chatData.result.rollbiotech
        ); /*
      attackDamage.otherRolls.forEach((r) => {
        chatData.rolls.push(r);
      });*/

        chatData.damage = attackDamage?.damage;
        chatData.damageFormula = attackDamage?.damageFormula;
        chatData.damageToolTip = attackDamage !== null ? await Rolls.getDamageTooltip(attackDamage.damageToolTipInfos) : null;
      }
    }
    // Several Rolls roll.terms[O].rolls : Array de Roll, le premier c'est l'attaque
    else {
      // Replace in the roll : the dice rerolled and the new total
      let mainRoll = roll.terms[0].rolls[0]; // roll =  newMessage.rolls[0]; et mainRoll =  newMessage.rolls[0].terms[0].rolls[0]

      // Red dice
      if (dice == 0) {
        mainRoll.dice[0].results[0].result = newDice.total;
      }
      // White dices
      else if (dice == 1 || dice == 2) {
        mainRoll.dice[1].results[dice - 1].result = newDice.total;
      }
      // Bronze dice
      else if (dice == 3) {
        mainRoll.dice[2].results[0].result = newDice.total;
      }

      let newRolls = [mainRoll];

      // On transforme les rolls de type Object restants en Roll
      for (let index = 1; index < chatData.rolls.length; index++) {
        const element = Roll.fromData(chatData.rolls[index]);
        newRolls[index] = element;
      }
      const pool = PoolTerm.fromRolls(newRolls);
      roll = Roll.fromTerms([pool]);

      // Generate the new result
      chatData.result = await this.getResult(actor, mainRoll, null);

      // Update the reroll number
      chatData.reRollNb = chatData.reRollNb - 1;
      chatData.reRollDone = chatData.reRollDone + 1;

      // Calculate damage if it's a weapon
      if (chatData.attackRoll && chatData.item.type == "weapon") {
        const itemId = chatData.itemId;
        const item = game.actors.get(actorId).items.get(itemId);
        let attackDamage = await item.calculateRerolleWeaponDamage(
          actor,
          chatData.result.dices,
          newRolls,
          chatData.useHeroism,
          chatData.lethalattack,
          chatData.minorinjury,
          chatData.multipleattacks,
          chatData.badShapeDamageBonus,
          chatData.damageBonus
        );

        chatData.damage = attackDamage?.damage;
        chatData.damageFormula = attackDamage?.damageFormula;
        chatData.damageToolTip = attackDamage !== null ? await Rolls.getDamageTooltip(attackDamage.damageToolTipInfos) : null;

        // Ajouter les damage damageFormula et damageToolTip des autres
      }
    }

    // If Reroll available, put the roll in actor's flags
    if (chatData.reRollNb > 0) {
      await newMessage.setFlag("world", "canReRoll", true);

      // Get the dices
      chatData.reRollDices = [];
      let i = 1;
      let color = "#ff0000";
      let spelledNb;
      // Get the dices
      for (let dice of chatData.result.dices) {
        if (i > 1) {
          color = "#ffffff";
        }
        if (i > 3) {
          color = "#cd7f32";
        }
        switch (dice.result) {
          case 1:
            spelledNb = "one";
            break;
          case 2:
            spelledNb = "two";
            break;
          case 3:
            spelledNb = "three";
            break;
          case 4:
            spelledNb = "four";
            break;
          case 5:
            spelledNb = "five";
            break;
          case 6:
            spelledNb = "six";
            break;
        }
        chatData.reRollDices.push({ nb: spelledNb, color: color });
        i++;
      }

      await newMessage.setFlag("world", "reRoll", chatData);
    } else {
      await newMessage.setFlag("world", "canReRoll", false);
      await newMessage.unsetFlag("world", "reRoll");
    }

    // Create the chat message
    let newChatMessage = await new CemChat(actor).withTemplate("systems/cleenmain/templates/chat/roll-result.hbs").withData(chatData).withRolls(chatData.rolls).create();

    // Update the chat message content and rolls

    await newMessage.update({ content: newChatMessage.content, rolls: [JSON.stringify(roll)] });
  }

  /**
   *
   * @param {*} actor
   * @param {*} rollType
   * @param {*} data
   */
  static async simpleDamage(actor, rollType, data) {
    const damageRoll = await new Roll(data.formula, {}).roll();

    let introText;
    switch (rollType) {
      case "vehicle-collision":
        introText = game.i18n.localize("CLEENMAIN.chatmessage.damageVehicleCollision");
        break;

      case "vehicle-distance":
        introText = game.i18n.localize("CLEENMAIN.chatmessage.damageVehicleDistance");
        break;

      default:
        break;
    }

    let chatData = {
      owner: data.owner,
      introText: introText,
      actingCharName: data.actingChar.name,
      actingCharImg: data.actingChar.img,
      rolls: [],
      formula: data.formula,
      result: damageRoll._total,
      tooltip: new Handlebars.SafeString(await damageRoll.getTooltip()),
    };

    chatData.rolls[0] = damageRoll;

    let newChatMessage = await new CemChat(actor).withTemplate("systems/cleenmain/templates/chat/damage-roll-result.hbs").withData(chatData).withRolls(chatData.rolls).create();
    newChatMessage.display();
  }
}
