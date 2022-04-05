
export default function registerHooks() {

    Hooks.on('createActor', async (document, options, userId) => {
        if (game.user.isGM) {
            let createChanges = {};
            mergeObject(createChanges, {
                'token.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            });
            
            // Player 
            if (document.data.type === 'player') {
                createChanges.token.vision = true;
                createChanges.token.actorLink = true;
    
                // Add all the base skills to the new player actor
                for (const skill of CONFIG.CLEENMAIN.skills) {
                    let skillData = {
                        name: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".name"),
                        type: 'skill',
                        data: {
                            description: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".description"),
                            reference: skill.name,
                            physical: skill.physical
                        }
                    };
                    await document.createEmbeddedDocuments("Item", [skillData]);
                }
            }

            // NPC
            if (document.data.type === 'npc' && !options.fromImport) {
                // Add all the base skills to the new npc actor
                for (const skill of CONFIG.CLEENMAIN.npcSkills) {
                    let skillData = {
                        name: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".name"),
                        type: 'skill',
                        data: {
                            description: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".description"),
                            reference: skill.name,
                            physical: skill.physical,
                            skills: skill.skills
                        }
                    };
                    await document.createEmbeddedDocuments("Item", [skillData]);
                }
            }

            document.data.update(createChanges);
        }
    
    });
}