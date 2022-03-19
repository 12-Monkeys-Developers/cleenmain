import { Rolls } from "../common/rolls.js";
import { Utils } from "../common/utils.js";
export default class CemBaseActor extends Actor {

    /** @override */
    prepareBaseData(){
        super.prepareBaseData();

        if (this.data.type === "player") this._prepareBaseDataPlayer();
    }

    _prepareBaseDataPlayer() {

        this.data.data.heroism.max = Utils.getMaxHeroism() + (this.data.data.heroism.developed ? 1 : 0);
    }

    /**
     * @name check
     * @description Rolls dices
     * @param {*} itemId Id of the Item used for roll
     * @param {*} rollType  skill, weapon attack, weapon damage
     * @returns 
     */
    async check(itemId, rollType) {
        const item = this.items.get(itemId);
        if (!item) return;

        // Get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];

        // If there is a token active for this actor, we use its name and image instead of the actor's
        const actingCharacterName = actingToken?.data?.name ?? this.name;
        const actingCharacterImage = actingToken?.data?.img ?? this.img; 

        return Rolls.check(this, item, rollType, {
            ...item.data,
            owner: this.id,
            actingCharacterName: actingCharacterName,
            actingCharacterImage: actingCharacterImage
        });
    }

    /* roll a player action
    arguments: {
        type: : weapon/armor/skill/boon/pbjskill,
        itemId: the id of the item (if relevant),
        attribute : the name of the npcskill (if relevant)
        }*/
    async roll(elements){
        let skillData= {
            weaponRoll: false,
            skillRoll: false,
            damageRoll: false,
            modifierText: "",
            rollModifier: "",
            heroismText: ""
        };
        //get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];
//if there is a token active for this actor, we use its name and image instead of the actor's
        skillData.actingCharName = actingToken?.data?.name ?? this.name;
        skillData.actingCharImg= actingToken?.data?.img ?? this.data.img;

        if(elements.attribute){ //npc skill roll
            if(elements.attribute === "defence"){
                skillData.itemName= game.i18n.localize("CLEENMAIN.skill.defence.name");
                if(this.data.data.elite) skillData.skillValue = this.data.data.defence.skillValueNpcElite;
                else skillData.skillValue = this.data.data.defence.skillValueNpc;
            }
            else{
                skillData.itemName= game.i18n.localize(this.data.data.npcskills[elements.attribute].label);
                if(this.data.data.elite) skillData.skillValue = this.data.data.npcskills[elements.attribute].elite;
                else skillData.skillValue = this.data.data.npcskills[elements.attribute].normal;
            }
            skillData.skillRollFormula = "3d6 + " + skillData.skillValue.toString();
            skillData.introText = game.i18n.format("CLEENMAIN.dialog.introskill", skillData);
            
            skillData.subImg= "icons/skills/trades/woodcutting-logging-splitting.webp"; //to be replaced
        }
        else{
            let item = this.items.get(elements.itemId);
            if (typeof(item) === 'undefined') return;
            skillData.itemName= item.name;
            skillData.subImg= item.data.img;

            if(elements.type === "weapon"){
                skillData.damageFormula=item.data.data.damage;
                
                if(this.data.type==="player"){
                    let damageBonus = this.data.data.damageBonus[item.data.data.type];
                    if(damageBonus) skillData.damageFormula += " + "+damageBonus.toString();
                }
                if(elements.rolltype !== "damage"){
                    skillData.weaponRoll = true;
                    if(this.data.type==="npc"){
                        skillData.skillValue = this.data.data.elite ? item.data.data.skillValueNpcElite : item.data.data.skillValueNpc;
                    }
                    else{
                        skillData.skillValue = item.data.data.skillValue;
                    }
                    skillData.skillRollFormula = "3d6 + " + skillData.skillValue.toString();
                    skillData.introText = game.i18n.format("CLEENMAIN.dialog.introweapon", skillData);
                }
                else{
                    skillData.damageRoll = true;
                    skillData.skillRollFormula = skillData.damageFormula;
                    skillData.introText = game.i18n.format("CLEENMAIN.dialog.introdamage", skillData);
                }
            } else{
                skillData.skillValue = item.data.data.value;
                skillData.skillRoll = true;
                skillData.skillRollFormula = "3d6 + " + skillData.skillValue.toString();
                skillData.introText = game.i18n.format("CLEENMAIN.dialog.introskill", skillData);
            }
        };
        
        const html = await renderTemplate('systems/cleenmain/templates/chat/rollDialog.html', {
            skillData: skillData
        });

        let dialog = new Dialog({
            title: skillData.name,
            content: html,
            buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("CLEENMAIN.dialog.button.roll"),
                callback: async (html) => {
                    //parsing of the dialog window
                    let rollModifier = html.find("#rollmodifier")[0].value;
                    if(rollModifier.length > 0){
                        skillData.rollModifier = rollModifier;
                    }
                    if(skillData.damageRoll){}
                    else{
                        skillData.useHeroism = html.find("#heroism")[0].checked;

                        if(skillData.weaponRoll){
                            let lethalattack = html.find("#lethalattack")[0].value;
                            skillData.lethalattack = parseInt(lethalattack) ?? 0;

                            let mutlipleattacks = html.find("#mutlipleattacks")[0].value;
                            skillData.mutlipleattacks = parseInt(mutlipleattacks) ?? 0;
                    
                            let efficiency = html.find("#efficiency")[0].value;
                            skillData.efficiency = parseInt(efficiency) ?? 0;
                    
                            let caution = html.find("#caution")[0].value;
                            skillData.caution = parseInt(caution) ?? 0;
                    
                            let quick = html.find("#quick")[0].value;
                            skillData.quick = parseInt(quick) ?? 0;
                    
                            let lightwound = html.find("#lightwound")[0].value;
                            skillData.lightwound = parseInt(lightwound) ?? 0;
                    
                            let exposed = html.find("#exposed")[0].value;
                            skillData.exposed = parseInt(exposed) ?? 0;
                    
                            let difficulty = html.find("#difficulty")[0].value;
                            skillData.difficulty = parseInt(difficulty) ?? 0;
                    
                            let slow = html.find("#slow")[0].value;
                            skillData.slow = parseInt(slow) ?? 0;
                    
                            let jeopardy = html.find("#jeopardy")[0].value;
                            skillData.jeopardy = parseInt(jeopardy) ?? 0;
                        }
                    }
                    //modify roll formula
                    skillData.applyModifier=[];
                    if(skillData.rollModifier.length > 0){
                        skillData.skillRollFormula += " + " +skillData.rollModifier;
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.chatmessage.custommodifier", skillData));
                    }
                    
                    if(skillData.useHeroism){
                        skillData.skillRollFormula += " +1d6";
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.chatmessage.heroismmodifier", skillData));
                    }

                    if(skillData.lethalattack){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.bonus.lethalattack.chatmessage", skillData));
                    }
                    if(skillData.mutlipleattacks){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.bonus.mutlipleattacks.chatmessage", skillData));
                    }
                    if(skillData.efficiency){
                        skillData.skillRollFormula += " +"+ (skillData.efficiency*2).toString();
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.bonus.efficiency.chatmessage", skillData));
                    }
                    if(skillData.caution){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.bonus.caution.chatmessage", skillData));
                    }
                    if(skillData.quick){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.bonus.quick.chatmessage", skillData));
                    }
                    if(skillData.lightwound){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.penalty.lightwound.chatmessage", skillData));
                    }
                    if(skillData.exposed){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.penalty.exposed.chatmessage", skillData));
                    }
                    if(skillData.difficulty){
                        skillData.skillRollFormula += " -"+ (skillData.difficulty*2).toString();
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.penalty.difficulty.chatmessage", skillData));
                    }
                    if(skillData.slow){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.penalty.slow.chatmessage", skillData));
                    }
                    if(skillData.jeopardy){
                        skillData.applyModifier.push(game.i18n.format("CLEENMAIN.penalty.jeopardy.chatmessage", skillData));
                    }
                    skillData.skillRoll = new Roll(skillData.skillRollFormula).evaluate({async:false});
                    skillData.tooltip= new Handlebars.SafeString(await skillData.skillRoll.getTooltip());
                    const chatTemplate = await renderTemplate("systems/cleenmain/templates/chat/rollResult.html", {
                        skillData: skillData,
                    });
                    const chatData = {
                        user: game.user.id,
                        speaker: ChatMessage.getSpeaker({ 
                            alias: game.user.name
                        }),
                        rollMode: game.settings.get('core', 'rollMode'),    
                        content: chatTemplate
                    }

                    //NPC rolls only visible in GM chat
                    if(!this.hasPlayerOwner){
                        let gmList =  ChatMessage.getWhisperRecipients('GM');
                        if(gmList.length > 0){
                            chatData.whisper = gmList
                        }
                    }
                    let NewMessage = await ChatMessage.create(chatData);


                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("CLEENMAIN.dialog.button.cancel"),
                callback: () => {},
            },
            },
            default: 'roll',
            close: () => {},
        });
        dialog.render(true);
    }
}
