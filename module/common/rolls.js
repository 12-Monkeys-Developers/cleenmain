import { CemChat } from "./chat.js";

export class Rolls {


      /**
     * Rolls dices 
     * @param actor The actor which performs the action
     * @param item  The purpose of the action, that is the item, the attribute
     * @param type  The type of roll 
     * @param data  The action data
     */
       static async check(actor, item, type, data) {       
        
        // Create the dialog panel to display.
        const html = await renderTemplate('systems/cleenmain/templates/chat/rollDialog.html', {
                actor: actor,
                item: item,
                type: type,
                action: data,
                introText: game.i18n.format("CLEENMAIN.dialog.introskill", {actingCharName: data.actingCharacterName, itemName: item.name}),
                actingCharImg: data.actingCharacterImage,
                skillRollFormula: "3d6 + " + item.data.data.value.toString()
        });

        // Display the action panel
        await new Dialog({
            title: "Jet de " + type,
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("CLEENMAIN.dialog.button.roll"),
                    callback: async (html) => {

                        // The optional modifier
                        const modifier = parseInt(Math.floor(parseInt(html.find("#rollmodifier")[0].value)));
                        if (modifier.length > 0) {
                            data.modifier = modifier;
                        }

                        // The optional heroism use
                        data.useHeroism = html.find("#heroism")[0].checked;

                        // Define the formula
                        const skillValue = item.data.data.value;
                        data.formula = "3d6 + " + skillValue.toString();

                        // Calculate the final difficulty
                        // data.difficulty = parseInt(data.difficulty) + (isNaN(modifier) ? 0 : modifier) + (skipWoundModifier ? 0 : woundModifier) + additionalKa + approche;

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

    /**
     * This method is used to display a roll result.
     * @param {*} actor    The actor which performs the action.
     * @param {*} item     The purpose of the action, that is the item, the attribute or the ka. 
     * @param {*} data 
     */
     static async displayRoll(actor, item, data) {

        // Roll the dice
        const result = await Rolls.getRollResult({
            actor: actor.id,
            alias: actor.name,
            scene: null,
            token: null,
        }, data.formula, data.difficulty);

        // Display the roll action
        await new CemChat(actor)
            .withTemplate("systems/cleenmain/templates/chat/rollResult.html")
            .withData({
                actor: actor,
                item: item,
                sentence: data.sentence,
                difficulty: data.difficulty,
                introText: game.i18n.format("CLEENMAIN.dialog.introskill", {actingCharName: actor.name, itemName: item.name}),
                actingCharImg: data.actingCharacterImage,
                formula: data.formula,
                result: result         
            })
            .withRoll(true)
            .create();        
    }

    /**
     * Rolls dices and displays the specified message and returns the result.
     * @param {*} speaker 
     * @param {*} difficulty 
     * @returns the roll result. 
     */
     static async getRollResult(speaker, formula, difficulty) {
        const roll = new Roll(formula, {}).roll({ async: false });
        // const tp = await roll.getTooltip();
        // await roll.toMessage({ speaker: speaker }, { async: true });
        // await new Promise(r => setTimeout(r, 2000));
        return Rolls.getResult(roll, difficulty);
    }

    /**
     * @param {*} roll  The roll value is 1d100.
     * @param {*} level The difficulty level, multiply by 10 to get %.
     * @return the roll result according to the difficulty level.
     */
     static async getResult(roll, difficulty) {
        /*const fail = roll === 100 || (roll > (level * 10) && roll !== 1);
        const fumble = Rolls.isDouble(roll) && fail;
        const critical = Rolls.isDouble(roll) && !fail;
        const margin = fail ? 0 : Math.floor(roll / 10) + (level > 10 ? level - 10 : 0);
        */
        let toolTip = new Handlebars.SafeString(await roll.getTooltip());
        return {
            /*success: !fail,
            fumble: fumble,
            critical: critical,
            margin: margin
            success: true*/
            total: roll._total,
            tooltip: toolTip
        }
    }

}