
export default function registerHooks() {

    Hooks.on('createActor', async (document, options, userId) => {
        if (game.user.isGM) {
            let createChanges = {};
            mergeObject(createChanges, {
                'token.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            });
            
            if (document.data.type === 'player') {
                createChanges.token.vision = true;
                createChanges.token.actorLink = true;
    
                //add all the base skills to the new actor
                for (const skill of CONFIG.CLEENMAIN.skills) {
                    let skillData = {
                        name: game.i18n.localize("cleenmain.skill."+skill+".name"),
                        type: 'skill',
                        data: {
                            description: game.i18n.localize("cleenmain.skill."+skill+".description"),
                            reference: skill
                        }
                    };
                    await document.createEmbeddedDocuments("Item", [skillData]);
                }
            }
            document.data.update(createChanges);
        }
    
    });
}