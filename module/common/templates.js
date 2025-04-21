/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export default async function preloadTemplates() {

    return foundry.applications.handlebars.loadTemplates([
        "systems/cleenmain/templates/actor/npc.html",  
        "systems/cleenmain/templates/actor/player.html",        
        "systems/cleenmain/templates/actor/tab/bio.html",
        "systems/cleenmain/templates/actor/tab/boons.html",
        "systems/cleenmain/templates/actor/tab/combat.html",
        "systems/cleenmain/templates/actor/tab/equipment.html",        
        "systems/cleenmain/templates/actor/tab/notes.html",

        "systems/cleenmain/templates/item/armor.html",
        "systems/cleenmain/templates/item/boon.html",
        "systems/cleenmain/templates/item/equipment.html",
        "systems/cleenmain/templates/item/skill.html",
        "systems/cleenmain/templates/item/weapon.html",
                
        "systems/cleenmain/templates/chat/roll-dialog.html",
        "systems/cleenmain/templates/chat/roll-result.html",
        
        "systems/cleenmain/templates/dice/damage-tooltip.html"
    ]);

};
