export default class CleenmainActor extends Actor {
    static async create(data, options) {
        super.create(data, options);
/*
        let createChanges = {};
        mergeObject(createChanges, {
          'token.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        });
        
        if (this.data.type === 'pj') {
          createChanges.token.vision = true;
          createChanges.token.actorLink = true;
      
          let skillData = {
            name: game.i18n.localize('cleenmain.skill.autorite'),
            type: 'skill',
            data: {}
          };
          await Item.create(skillData, { parent: this }, { renderSheet: true });
        }
        console.log("createChanges",createChanges);
        this.data.update(createChanges);*/
    }

    prepareData(){
        super.prepareData();

        if(this.type === "pnj"){
            let numberofpj = game.settings.get('cleenmain', 'numberOfPlayers');
            if (numberofpj < 2) numberofpj=2;
            else if (numberofpj > 5) numberofpj=5;
            
            if(this.data.data.level === "figurant"){
                this.data.data.vitalite.value = this.data.data.vitalite.max = 1;
            }
            else{
                let test = numberofpj.toString();
                console.log(this.data);
                let vitaliteMax = this.data.data.vitalite2couteau[test];
                if(this.data.data.level === "boss")  vitaliteMax = vitaliteMax*2;
                if(this.data.data.vitalite.value === this.data.data.vitalite.max){
                    this.data.data.vitalite.value = this.data.data.vitalite.max = vitaliteMax;
                }
                else this.data.data.vitalite.max = vitaliteMax;
            }
        }
    }

    /* roll a player action
    arguments: {type: itemType, itemId}*/
    async roll(elements){
        let item = this.items.get(elements.itemId);
        if (typeof(item) === 'undefined') return;
        let skillData= {};
        if(elements.type === "weapon"){
            /*let skillName = item.data.type ==="melee" ? "combatcac" : "combatdist";
            let skill = this.actor.items.filter(element => element.data.data.type === "skill" && element.name === skillName);
            if(skill.length == 0){
                console.log("No skill found for item ", item.name);
                return;
            }
            skillData.value = skill[0].data.data.value + (skill[0].data.data.developed ? 2 : 0);
            skillData.name = skill[0].name;*/

            skillData={name: "cac", value: 5};//

            let skillFormula = "3d6 + " + skillData.value.toString();
            let damageFormula=item.data.data.degats;

            let skillRoll = new Roll(skillFormula, {});
            let messageData = {
                speaker : ChatMessage.getSpeaker()
            }
            skillRoll.toMessage(messageData);




        }
    }
}
