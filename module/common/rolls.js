import CemBaseItem from "../item/base-item.js";
import { CemChat } from "./chat.js";
import { CLEENMAIN } from "./config.js";

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
        let heroismBonus1d6 = false;
        let skillBonus1d6 = false;

        if (actor.type ==="npc" && game.user.isGM) data.rollMode = "gmroll";

        // Skill Roll
        if (rollType === "skill") {
            titleDialog += game.i18n.format("CLEENMAIN.dialog.titleskill", {itemName: item.name});
            skillRoll = true;
            let value = actor.getSkillValue(item).toString();

            //rollBonus : +fixed value to roll, from boon 
            let rollBonus = item.system.rollBonus;
            if (rollBonus) value += " + " + rollBonus.toString();

            //rollBonus1d6 : +1d6 to roll, from boon 
            if (item.system.rollBonus1d6) {
                rollFormulaDisplay = "4d6 + " + value;
                rollFormula = "1d6[red] + 2d6[white] + 1d6[green] + " + value;
                skillBonus1d6 = true;
            }
            else {
                rollFormulaDisplay = "3d6 + " + value;
                rollFormula = "1d6[red] + 2d6[white] + " + value;
            }
            formulaTooltip += game.i18n.format("CLEENMAIN.tooltip.skill") + value;
            //heroismBonus1d6 : +1d6 when using heroism, from boon 
            heroismBonus1d6 = item.system.heroismBonus1d6 ? true:false;

            introText = game.i18n.format("CLEENMAIN.dialog.introskill", {actingCharName: data.actingChar.name, itemName: item.name});

            // Check armors training
            if (item.system.physical) {
                const armorMalus = actor.getArmorMalus();
                if (armorMalus > 0) {
                    rollFormulaDisplay = rollFormulaDisplay.concat(' - ', armorMalus);
                    rollFormula += ' - ' + armorMalus;
                    formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.armormalus") + "-" + armorMalus;
                } 
            }   

            // Bonuses
            if (data.options?.bonuses) {
                for(let bonus of data.options.bonuses){
                    rollFormulaDisplay = rollFormulaDisplay += bonus.value;
                    rollFormula += bonus.value;
                    formulaTooltip += ", " + bonus.tooltip;
                }
            }

            // Bad Shape for player
            if (actor.isPlayer() && actor.isInBadShape() && !data.options?.badShapeRoll) {
                let modValue = actor.system.health.badShapeSkillBonus ? " + "+actor.system.health.badShapeSkillBonus.toString() : ' - 2';
                let tooltipModValue =  actor.system.health.badShapeSkillBonus ? "+"+actor.system.health.badShapeSkillBonus.toString() : '-2';
                rollFormulaDisplay = rollFormulaDisplay.concat(modValue);
                rollFormula += modValue;
                formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.badshape") + tooltipModValue;
            }

            // Defence check : bonus or malus from boon or penality
            if (CLEENMAIN.skillsModifiedBehaviour.includes(item.system.reference)) {
                const mod = actor.getBehaviourValue();
                if (mod) {
                    if (mod > 0) {
                        rollFormulaDisplay = rollFormulaDisplay.concat(' + ').concat(mod);
                        rollFormula += ' + ' + mod.toString();
                        formulaTooltip += ", " + game.i18n.format("CLEENMAIN.bonus.caution.label") + ": " + mod;
                    }
                    else if (mod < 0) {
                        rollFormulaDisplay = rollFormulaDisplay.concat(' - ').concat(Math.abs(mod));
                        rollFormula += ' - ' + Math.abs(mod).toString();
                        formulaTooltip += ", " + game.i18n.format("CLEENMAIN.penalty.danger.label")  + ": " + mod;
                    }                    
                }
            }
        }

        // Attack roll
        if (rollType === "weapon-attack") {
            titleDialog += game.i18n.format("CLEENMAIN.dialog.titleweapon", {itemName: item.name});
            attackRoll = true;

            rollFormula = "1d6[red] + 2d6[white] " + this._getTerm(item.weaponSkill(actor)) + this._getTerm(item.system.skillBonus);
            rollFormulaDisplay = "3d6" + this._getTerm(item.weaponSkill(actor)) + this._getTerm(item.system.skillBonus);
       
            formulaTooltip += game.i18n.format("CLEENMAIN.tooltip.skill") + item.weaponSkill(actor) + (item.system.skillBonus ? ", " + game.i18n.format("CLEENMAIN.tooltip.weaponbonus") + item.system.skillBonus.toString():"");

            introText = game.i18n.format("CLEENMAIN.dialog.introweapon", {actingCharName: data.actingChar.name, itemName: item.name});

            // Check weapons trainings
            if (item.system.category === "war") {
                if (!actor.system.trainings.weapons.war && !actor.system.trainings.weapons.heavy) {
                    data.difficulty = 1;
                    data.risk = 1;
                    formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.untrained");
                }
            }
            if (item.system.category === "heavy") {
                if (!actor.system.trainings.weapons.war && !actor.system.trainings.weapons.heavy) {
                    data.difficulty = 2;
                    data.risk = 1;
                    formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.untrained");
                }
                if (actor.system.trainings.weapons.war) {
                    data.difficulty = 1;
                    data.risk = 1;
                    formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.untrained");
                }
            }
            if (actor.isPlayer() && actor.isInBadShape()) {
                let modValue = actor.system.health.badShapeSkillBonus ? " + "+actor.system.health.badShapeSkillBonus.toString() : ' - 2';
                let tooltipModValue =  actor.system.health.badShapeSkillBonus ? "+"+actor.system.health.badShapeSkillBonus.toString() : '-2';
                rollFormulaDisplay = rollFormulaDisplay.concat(modValue);
                rollFormula += modValue;
                formulaTooltip += ", " + game.i18n.format("CLEENMAIN.tooltip.badshape") + tooltipModValue;
            }
        }

        // Damage roll
        if (rollType === "weapon-damage") {
            if (actor.type == "npc") return;
            titleDialog += game.i18n.format("CLEENMAIN.dialog.titledamage", {itemName: item.name});
            damageRoll = true;
            rollFormula = item.weaponDamage(actor);
            rollFormulaDisplay = rollFormula;
            
            introText = game.i18n.format("CLEENMAIN.dialog.introdamage", {actingCharName: data.actingChar.name, itemName: item.name});
        }

        // Create the dialog panel to display.
        const html = await renderTemplate('systems/cleenmain/templates/chat/roll-dialog.html', {
                actor: actor,
                item: item,
                type: rollType,
                action: data,
                introText: introText,
                actingCharImg: data.actingChar.img,
                isPlayer: actor.isPlayer(),
                hasHeroism: actor.hasHeroismPoints(),
                rollFormula: rollFormulaDisplay,
                rollFormulaColor: rollFormula,
                formulaTooltip: formulaTooltip,
                skillRoll: skillRoll,
                attackRoll: attackRoll,
                damageRoll: damageRoll,
                heroismBonus1d6: heroismBonus1d6
        });

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

                        data.formula = rollFormulaDisplay;
                        data.formulaColor = rollFormula;

                        if (data.modifier) {
                            data.formula = data.formula.concat(' + ', data.modifier.toString());
                            data.formulaColor = data.formulaColor.concat(' + ', data.modifier.toString());
                            data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.custommodifier", {rollModifier: data.modifier}));
                        }

                        // The optional heroism use
                        data.useHeroism = false;

                        if (html.find("#heroism")[0]?.checked) {
                            data.useHeroism = true;
                            let dice = item.system.heroismBonus1d6 ? "2":"1";
                            data.formula += ' + '+dice+'d6';
                            data.formulaColor += ' + '+dice+'d6[bronze]';
                            data.applyModifiers.push(game.i18n.format("CLEENMAIN.chatmessage.heroismmodifier", {dice:dice}));
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
                                data.formula = data.formula.concat(' + ').concat((data.efficiency*2).toString());
                                data.formulaColor = data.formulaColor.concat(' + ').concat((data.efficiency*2).toString());
                                data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.efficiency.chatmessage", data));
                            }
                    
                            let caution = html.find("#caution")[0].value;
                            data.caution = parseInt(caution) ?? 0;
                            if (data.caution > 0) {
                                data.applyModifiers.push(game.i18n.format("CLEENMAIN.bonus.caution.chatmessage", data));                              
                                behaviourModifier += data.caution;
                            }
                    
                            if (game.settings.get('cleenmain', 'advancedRules')) {
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
                            if (data.difficulty > 0)  {
                                data.formula = data.formula.concat(' - ').concat((data.difficulty*2).toString());
                                data.formulaColor = data.formulaColor.concat(' - ').concat((data.difficulty*2).toString());
                                data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.difficulty.chatmessage", data));
                            }                                
                    
                            let risk = html.find("#risk")[0].value;
                            data.risk = parseInt(risk) ?? 0;
                            if (data.risk > 0) data.applyModifiers.push(game.i18n.format("CLEENMAIN.penalty.risk.chatmessage", data));
                    
                            if (game.settings.get('cleenmain', 'advancedRules')) {
                                let slowness = html.find("#slowness")[0].value;
                                data.slowness = parseInt(slowness) ?? 0;
                                if (data.slowness > 0) data.applyModifiers.push(game.i18n.localize("CLEENMAIN.penalty.slowness.chatmessage"));
                            }

                            if (behaviourModifier != 0) {
                                actor.addBehaviourModifier(behaviourModifier);
                            }

                        }

                        // Remove one bonus or malus for a defence roll
                        if (skillRoll) {
                            if (item.system.reference === "defence") {
                                actor.useBehaviourModifier();
                            }
                        }

                        // Status
                        if (actor.isPlayer() && actor.isInBadShape()) {
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
                    callback: () => { },
                },
            },
            default: "roll",
            close: () => { },

        }).render(true);
    }

    static _getTerm(element) {
        if (element && element != 0) {
            if (typeof element === 'string') return ' + '.concat(element);
            else if (typeof element === 'number') return ' + '.concat(element.toString());
        }
        return '';
    }

    /**
     * This method is used to display a roll result.
     * @param {CemBaseActor} actor   The actor which performs the action
     * @param {CemBaseItem} item     The purpose of the action, that is the item, the attribute
     * @param {Object} data 
     */
     static async displayRoll(actor, item, data) {
        
        // Roll the dice
        const result = await Rolls.getRollResult({actor: actor.id, alias: actor.name, scene: null, token: null}, typeof(data.formulaColor) !== 'undefined' ? data.formulaColor : data.formula, data.targetDifficulty);

        // Rolls is an array of roll
        let rolls = [result.roll];

        // Reroll
        let reRollNb = 0;
        let reRollDices = [];

        // Calculate damages
        let attackDamage = null;
        if (item.type === "weapon") {
            attackDamage = item.calculateWeaponDamage(actor, result.dices, data.useHeroism, data.lethalattack, data.minorinjury, data.multipleattacks, data.badShapeDamageBonus);
            attackDamage.rolls.forEach(r => {rolls.push(r)});
            reRollNb = item.system.diceRerollNb;
        }
        
        // Display the roll action
        let chatData = {
            actorId: actor.id,
            item: item,
            difficulty: data.targetDifficulty,
            introText: data.introText,
            actingCharImg: data.actingChar.img,
            formula: data.formula,
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
            reRollDices: reRollDices
        };

        // If Reroll available, put the roll in actor's flags
        if (reRollNb > 0) {
            actor.setFlag("world", "canReRoll", true);
            actor.setFlag("world", "reRoll", chatData);

            // Get the dices
            result.dices.forEach(dice => {
                chatData.reRollDices.push(dice.result);
            });
        }

        let chat = await new CemChat(actor)
            .withTemplate("systems/cleenmain/templates/chat/roll-result.html")
            .withData(chatData)
            .withRoll(true)
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
     static async getRollResult(speaker, formula, targetDifficulty) {
        const roll = new Roll(formula, {}).roll({ async: false });
        return Rolls.getResult(roll, targetDifficulty);
    }

    /**
     * @param {*} roll The roll value is several d6
     * @param {*} targetDifficulty The difficulty to succeed //TO DO : NOT USED RIGHT NOW
     * @return the roll result
     */
     static async getResult(roll, targetDifficulty) {
        /*
        const fail = roll === 100 || (roll > (level * 10) && roll !== 1);
        const fumble = Rolls.isDouble(roll) && fail;
        const critical = Rolls.isDouble(roll) && !fail;
        */
        const critical = Rolls._isTriple(roll,1);
        const fumble = Rolls._isTriple(roll,6);
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
            total: roll._total,
            tooltip: toolTip,
            dices: dices,
            roll: roll
        }
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
    const parts = damageToolTipInfos.map(d => 
        {
            return {
                source: d.source,
                total: d.total,
                dices: d.dices
            }
        });
    return renderTemplate(Rolls.TOOLTIP_DAMAGE_TEMPLATE, { parts });
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
        damageToolTipInfosDetails.source = game.i18n.format("CLEENMAIN.chatmessage." + source, {nbDices: nbDamageDices});
        damageToolTipInfosDetails.dices = [];
                
        let totalAttack = 0;

        for (let index = 0; index < nbDamageDices; index++) {
            let indexMod = (nbDamageDices == 2 && dices.length == 3) ? index+1 : index;
            damageToolTipInfosDetails.dices[index] = dices[indexMod].result;
            totalAttack += dices[indexMod].result;            
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

        const actorId = $(event.currentTarget).parents(".chatroll").data("actorId");
        const actor = game.actors.get(actorId);

        const canReroll = await actor.getFlag("world", "canReRoll");
        if (!canReroll) return;

        // Get the dice which is rerolled (from 0 to 2)
        const btn = $(event.currentTarget);
        const dice = btn.data("diceNb");

        // Roll 1d6
        const newDice = new Roll("1d6", {}).roll({ async: false });

        // Take the existing roll
        let jsonRoll = message.rolls[0];
        let roll = Roll.fromJSON(jsonRoll);

        // Replace in the roll : the dice rerolled and the new total
        let newTotal = roll._total;
     
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
     
        roll._total = newTotal;   

        // Get the chat data stored in the actor
        let chatData = actor.getFlag("world", "reRoll");
        chatData.rolls[0] = roll;
        
        // Generate the new result
        chatData.result = await this.getResult(roll, null);
        
        // Update the reroll number
        chatData.reRollNb = chatData.reRollNb - 1;

        // If Reroll available, put the roll in actor's flags
        if (chatData.reRollNb > 0) {
            await actor.setFlag("world", "canReRoll", true);

            // Get the dices
            chatData.reRollDices = [];
            chatData.result.dices.forEach(dice => {
                chatData.reRollDices.push(dice.result);
            });

            await actor.setFlag("world", "reRoll", chatData);
        }
        /*
        else {
            await actor.setFlag("world", "canReRoll", false);
            await actor.unsetFlag("world", "reRoll");
        }*/


        // Calculate damage if it's a weapon
        if (chatData.item.type == "weapon") {
           
        }

        // Create the chat message
        let chatMessage = await new CemChat(actor)
            .withTemplate("systems/cleenmain/templates/chat/roll-result.html")
            .withData(chatData)
            .withRoll(true)
            .create();

        // Update the chat message content and rolls
        const messageId = message._id;
        const newMessage = game.messages.get(messageId);
        await newMessage.update({ content: chatMessage.content, rolls: [roll.toJSON()] });
    }

}