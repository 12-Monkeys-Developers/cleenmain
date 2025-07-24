/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export default async function preloadTemplates() {
  return foundry.applications.handlebars.loadTemplates([

    "systems/cleenmain/templates/chat/roll-dialog.html",
    "systems/cleenmain/templates/chat/roll-result.html",

    "systems/cleenmain/templates/dice/damage-tooltip.html",

    `systems/cleenmain/templates/sheets/parts/unlock-icon.hbs`,
    "systems/cleenmain/templates/sheets/npc.hbs",
    "systems/cleenmain/templates/sheets/player.hbs",
    "systems/cleenmain/templates/sheets/partials/bio.hbs",
    "systems/cleenmain/templates/sheets/partials/boons.hbs",
    "systems/cleenmain/templates/sheets/partials/combat.hbs",
    "systems/cleenmain/templates/sheets/partials/equipment.hbs",
    "systems/cleenmain/templates/sheets/partials/notes.hbs",

    `systems/cleenmain/templates/sheets/partials/item-description.hbs`,
    `systems/cleenmain/templates/sheets/partials/item-header.hbs`,
    `systems/cleenmain/templates/sheets/boon.hbs`,
    `systems/cleenmain/templates/sheets/weapon.hbs`,
  ]);
}
