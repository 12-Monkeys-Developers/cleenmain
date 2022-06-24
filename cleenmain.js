import { CLEENMAIN } from "./module/common/config.js";
import { LOG_HEAD } from "./module/common/constants.js";

import { preloadTemplates } from "./module/common/templates.js";
import { registerHandlebarsHelpers } from "./module/common/helpers.js"
import registerSystemSettings from './module/common/settings.js';
import registerHooks from './module/common/hooks.js';

import CemBaseItem from "./module/item/base-item.js";
import CemBaseActor from "./module/actor/base-actor.js";
import CemCombat from "./module/combat/combat.js";
import CemCombatTracker from "./module/combat/combat-tracker.js";
import CemCombatant from "./module/combat/combatant.js";

import CemBaseItemSheet from "./module/item/sheet/base-sheet.js";
import { WeaponSheet } from "./module/item/sheet/weapon-sheet.js";

import PlayerSheet from "./module/actor/sheet/player-sheet.js";
import NpcSheet from "./module/actor/sheet/npc-sheet.js";

Hooks.once("init", function(){

    console.log(LOG_HEAD + "Initializing Cles en mains System");

    CONFIG.CLEENMAIN = CLEENMAIN;
    CONFIG.Item.documentClass = CemBaseItem;
    CONFIG.Actor.documentClass = CemBaseActor;
    CONFIG.Combat.documentClass = CemCombat;
    CONFIG.Combatant.documentClass = CemCombatant;
    CONFIG.ui.combat = CemCombatTracker;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('cleenmain', CemBaseItemSheet, {makeDefault: true });
    Items.registerSheet('cleenmain', WeaponSheet, {label: "WeaponSheet", makeDefault: true, types: ['weapon']});

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cleenmain', PlayerSheet, {types: ['player'], makeDefault: true });
    Actors.registerSheet('cleenmain', NpcSheet, {types: ['npc'], makeDefault: true });

	// Preload Handlebars Templates
	preloadTemplates();

	// Register Handlebars Helpers
	registerHandlebarsHelpers();

	// Register System Settings
	registerSystemSettings();

	// Register Hooks
	registerHooks();

});