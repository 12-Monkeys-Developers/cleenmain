/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadTemplates = async function () {

    return loadTemplates([
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
        "systems/cleenmain/templates/item/ammunition.html",

        "systems/cleenmain/templates/partials/boon-card.html",
                
        "systems/cleenmain/templates/chat/rollDialog.html",
        "systems/cleenmain/templates/chat/rollResult.html",
        
        "systems/cleenmain/templates/dice/damageTooltip.html"
    ]);

};
