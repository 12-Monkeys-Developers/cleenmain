export default class CleenmainActor extends Actor {

    prepareData(){
        super.prepareData();

        //evaluate the max health of the NPC depending of the number of players option
        if(this.type === "npc"){
            let numberofplayers = game.settings.get('cleenmain', 'numberOfPlayers');
            let numberofplayersString="fivepcs";
            if (numberofplayers <= 2) numberofplayersString="twopcs";
            else if (numberofplayers == 3) numberofplayersString="threepcs";
            else if (numberofplayers == 4) numberofplayersString="fourpcs";
            
            if(this.data.data.level === "support"){
                this.data.data.health.value = this.data.data.health.max = 1;
            }
            else{
                let healthMax = this.data.data.healthsecondfiddle[numberofplayersString];
                if(this.data.data.level === "boss")  healthMax = healthMax*2;
                if(this.data.data.health.value === this.data.data.health.max){
                    this.data.data.health.value = this.data.data.health.max = healthMax;
                }
                else this.data.data.health.max = healthMax;
            }
        }
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
            modifierText: "",
            rollModifier: "",
            heroismText: ""
        };
        if(elements.attribute){ //npc skill roll
            if(elements.attribute === "defence"){
                skillData.itemName= game.i18n.localize("cleenmain.skill.defence.name");
                if(this.data.data.elite) skillData.skillvalue = this.data.data.defence.skillvaluenpcelite;
                else skillData.skillvalue = this.data.data.defence.skillvaluenpc;
            }
            else{
                skillData.itemName= game.i18n.localize(this.data.data.npcskills[elements.attribute].label);
                if(this.data.data.elite) skillData.skillvalue = this.data.data.npcskills[elements.attribute].elite;
                else skillData.skillvalue = this.data.data.npcskills[elements.attribute].normal;
            }
            
            skillData.subImg= "icons/skills/trades/woodcutting-logging-splitting.webp"; //to be replaced
        }
        else{
            let item = this.items.get(elements.itemId);
            if (typeof(item) === 'undefined') return;
            skillData.itemName= item.name;
            skillData.subImg= item.data.img;

            if(elements.type === "weapon"){
                skillData.weaponRoll = true;
                if(this.type==="npc"){
                    skillData.skillvalue = this.data.data.elite ? item.data.data.skillvaluenpcelite : item.data.data.skillvaluenpc;
                }
                else skillData.skillvalue = item.data.data.skillvalue;
    
                skillData.damageFormula=item.data.data.damage;
            } else skillData.skillvalue = item.data.data.value;
        };
        //get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];
//if there is a token active for this actor, we use its name and image instead of the actor's
        skillData.actingCharName = actingToken?.data?.name ?? this.name;
        skillData.actingCharImg= actingToken?.data?.img ?? this.data.img;
        

        skillData.skillRollFormula = "3d6 + " + skillData.skillvalue.toString();
        skillData.introText = game.i18n.format("cleenmain.dialog.intro", skillData);

        
        const html = await renderTemplate('systems/cleenmain/templates/chat/rollDialog.html', {
            skillData: skillData
        });

        let dialog = new Dialog({
            title: skillData.name,
            content: html,
            buttons: {
            roll: {
                icon: '<i class="fas fa-check"></i>',
                label: game.i18n.localize("cleenmain.dialog.button.roll"),
                callback: async (html) => {
                    //parsing of the dialog window
                    let rollModifier = html.find("#rollmodifier")[0].value;
                    if(rollModifier.length > 0){
                        skillData.rollModifier = rollModifier;
                    }
                    skillData.useHeroism = html.find("#heroism")[0].checked;

                    if(skillData.weaponRoll){
                        let murderous = html.find("#murderous")[0].value;
                        skillData.murderous = parseInt(murderous) ?? 0;

                        let manytargets = html.find("#manytargets")[0].value;
                        skillData.manytargets = parseInt(manytargets) ?? 0;
                
                        let efficient = html.find("#efficient")[0].value;
                        skillData.efficient = parseInt(efficient) ?? 0;
                
                        let cover = html.find("#cover")[0].value;
                        skillData.cover = parseInt(cover) ?? 0;
                
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
                    //modify roll formula
                    skillData.applyModifier=[];
                    if(skillData.rollModifier.length > 0){
                        skillData.skillRollFormula += " + " +skillData.rollModifier;
                        skillData.applyModifier.push(game.i18n.format("cleenmain.chatmessage.custommodifier", skillData));
                    }
                    
                    if(skillData.useHeroism){
                        skillData.skillRollFormula += " +1d6";
                        skillData.applyModifier.push(game.i18n.format("cleenmain.chatmessage.heroismmodifier", skillData));
                    }

                    if(skillData.murderous){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.bonus.murderous.chatmessage", skillData));
                    }
                    if(skillData.manytargets){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.bonus.manytargets.chatmessage", skillData));
                    }
                    if(skillData.efficient){
                        skillData.skillRollFormula += " +"+ (skillData.efficient*2).toString();
                        skillData.applyModifier.push(game.i18n.format("cleenmain.bonus.efficient.chatmessage", skillData));
                    }
                    if(skillData.cover){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.bonus.cover.chatmessage", skillData));
                    }
                    if(skillData.quick){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.bonus.quick.chatmessage", skillData));
                    }
                    if(skillData.lightwound){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.penalty.lightwound.chatmessage", skillData));
                    }
                    if(skillData.exposed){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.penalty.exposed.chatmessage", skillData));
                    }
                    if(skillData.difficulty){
                        skillData.skillRollFormula += " -"+ (skillData.difficulty*2).toString();
                        skillData.applyModifier.push(game.i18n.format("cleenmain.penalty.difficulty.chatmessage", skillData));
                    }
                    if(skillData.slow){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.penalty.slow.chatmessage", skillData));
                    }
                    if(skillData.jeopardy){
                        skillData.applyModifier.push(game.i18n.format("cleenmain.penalty.jeopardy.chatmessage", skillData));
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
                label: game.i18n.localize("cleenmain.dialog.button.cancel"),
                callback: () => {},
            },
            },
            default: 'roll',
            close: () => {},
        });
        dialog.render(true);
    }
}
