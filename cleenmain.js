
import { preloadTemplates } from "./module/common/templates.js";
import { cleenmain } from "./module/common/config.js";
import { registerHandlebarsHelpers } from "./module/common/helpers.js"
import registerHooks from './module/common/hooks.js';
import registerSystemSettings from './module/common/settings.js';

import CleenmainItem from "./module/item/item.js";
import CleenmainActor from "./module/actor/actor.js";

import CleenmainItemSheet from "./module/item/sheet/base.js";
import CleenmainPlayerSheet from "./module/actor/sheet/player.js";
import CleenmainNpcSheet from "./module/actor/sheet/npc.js";

Hooks.once("init", function(){

    console.log("Cleeenmain | Initializing Cles en mains System");

    CONFIG.cleenmain = cleenmain;
    CONFIG.Item.documentClass = CleenmainItem;
    CONFIG.Actor.documentClass = CleenmainActor;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('cleenmain', CleenmainItemSheet, {makeDefault: true });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cleenmain', CleenmainPlayerSheet, {types: ['player'], makeDefault: true });
    Actors.registerSheet('cleenmain', CleenmainNpcSheet, {types: ['npc'], makeDefault: true });

	// Preload Handlebars Templates
	preloadTemplates();

	// Register Handlebars Helpers
	registerHandlebarsHelpers();

	// Register System Settings
	registerSystemSettings();

	// Register Hooks
	registerHooks();

});