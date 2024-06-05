import { CLEENMAIN } from "./module/common/config.js";
import { LOG_HEAD, DEV_MODE } from "./module/common/constants.js";

import preloadTemplates from "./module/common/templates.js";
import registerHandlebarsHelpers from "./module/common/helpers.js";
import registerSystemSettings from "./module/common/settings.js";
import registerHooks from "./module/common/hooks.js";

import CemBaseItem from "./module/item/base-item.js";
import CemBaseActor from "./module/actor/base-actor.js";
import CemCombat from "./module/combat/combat.js";
import CemCombatTracker from "./module/combat/combat-tracker.js";
import CemCombatant from "./module/combat/combatant.js";

import CemBaseItemSheet from "./module/item/sheet/base-sheet.js";
import { WeaponSheet } from "./module/item/sheet/weapon-sheet.js";
import PlayerSheet from "./module/actor/sheet/player-sheet.js";
import NpcSheet from "./module/actor/sheet/npc-sheet.js";
import VehicleSheet from "./module/actor/sheet/vehicle-sheet.js";

import * as models from "./module/data/_module.mjs";

Hooks.once("init", function () {
  console.log(LOG_HEAD + "Initializing System");

  //CONFIG.CLEENMAIN = CLEENMAIN;   displaced in game.cleenmain.config
  CONFIG.Item.documentClass = CemBaseItem;
  CONFIG.Actor.documentClass = CemBaseActor;
  CONFIG.Combat.documentClass = CemCombat;
  CONFIG.Combatant.documentClass = CemCombatant;
  CONFIG.ui.combat = CemCombatTracker;

  CONFIG.Actor.dataModels = {
    player: models.CemPlayer,
    npc: models.CemNpc,
    vehicle: models.CemVehicle,
  };
  CONFIG.Item.dataModels = {
    armor: models.CemArmor,
    boon: models.CemBoon,
    equipment: models.CemEquipment,
    skill: models.CemSkill,
    weapon: models.CemWeapon,
  };

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cleenmain", CemBaseItemSheet, { makeDefault: true });
  Items.registerSheet("cleenmain", WeaponSheet, { label: "WeaponSheet", makeDefault: true, types: ["weapon"] });

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cleenmain", PlayerSheet, { types: ["player"], makeDefault: true });
  Actors.registerSheet("cleenmain", NpcSheet, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("cleenmain", VehicleSheet, { types: ["vehicle"], makeDefault: true });

  game.cleenmain = {
    config: CLEENMAIN,
  };
  // Preload Handlebars Templates
  preloadTemplates();

  // Register Handlebars Helpers
  registerHandlebarsHelpers();

  // Register System Settings
  registerSystemSettings();

  // Register Hooks
  registerHooks();

  console.log(LOG_HEAD + "System initialized");
});

// Register world usage statistics
function registerWorldCount(registerKey) {
  if (game.user.isGM) {
    let worldKey = game.settings.get(registerKey, "worldKey");
    if (worldKey == undefined || worldKey == "") {
      worldKey = randomID(32);
      game.settings.set(registerKey, "worldKey", worldKey);
    }

    // Simple API counter
    const worldData = {
      register_key: registerKey,
      world_key: worldKey,
      foundry_version: `${game.release.generation}.${game.release.build}`,
      system_name: game.system.id,
      system_version: game.system.version,
    };

    let apiURL = "https://worlds.qawstats.info/worlds-counter";
    $.ajax({
      url: apiURL,
      type: "POST",
      data: JSON.stringify(worldData),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      async: false,
    });
  }
}

Hooks.once("ready", async function () {
  if (!DEV_MODE) {
    registerWorldCount("cleenmain");
  }
  console.log(LOG_HEAD + "System ready");
});
