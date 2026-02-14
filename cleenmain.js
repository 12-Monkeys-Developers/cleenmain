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

import * as models from "./module/data/_module.mjs";

// Import modules
import * as applications from "./module/applications/_module.mjs";

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

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemItemSheet, { makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemArmorSheet, { types: ["armor"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemBiodataSheet, { types: ["biodata"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemBoonSheet, { types: ["boon"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemEquipmentSheet, { types: ["equipment"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemSkillSheet, { types: ["skill"], makeDefault: true });
  foundry.documents.collections.Items.registerSheet("cleenmain", applications.CemWeaponSheet, { types: ["weapon"], makeDefault: true });

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("cleenmain", applications.CemPlayerSheet, { types: ["player"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("cleenmain", applications.CemNpcSheet, { types: ["npc"], makeDefault: true });
  foundry.documents.collections.Actors.registerSheet("cleenmain", applications.CemVehicleSheet, { types: ["vehicle"], makeDefault: true });

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
      worldKey = foundry.utils.randomID(32);
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
