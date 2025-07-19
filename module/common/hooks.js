import { Rolls } from "./rolls.js";
import { CLEENMAIN } from "./config.js";

export default function registerHooks() {
  Hooks.once("ready", () => {
    _showUserGuide();
  });

  Hooks.on("createActor", async (document, options, userId) => {
    if (game.user.isGM) {
      let createChanges = {};
      foundry.utils.mergeObject(createChanges, {
        "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      });
      // Player
      if (document.type === "player") {
        createChanges.token.vision = true;
        createChanges.token.actorLink = true;

        // Add all the base skills to the new player actor
        for (const skill of game.cleenmain.config.skills) {
          let skillData = {
            name: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".name"),
            type: "skill",
            system: {
              description: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".description"),
              reference: skill.name,
              physical: skill.physical,
            },
          };
          let alreadySkill = document.items.filter((item) => item.type === "skill" && item.system.reference === skill.name);
          if (alreadySkill.length == 0) {
            await document.createEmbeddedDocuments("Item", [skillData]);
          }
        }
      }

      // NPC
      if (document.type === "npc" && !options.fromImport) {
        // Add all the base skills to the new npc actor
        for (const skill of game.cleenmain.config.npcSkills) {
          let skillData = {
            name: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".name"),
            type: "skill",
            system: {
              description: game.i18n.localize("CLEENMAIN.skill." + skill.name + ".description"),
              reference: skill.name,
              physical: skill.physical,
              skills: skill.skills,
            },
          };
          let alreadySkill = document.items.filter((item) => item.type === "skill" && item.system.reference === skill.name);
          if (alreadySkill.length == 0) {
            await document.createEmbeddedDocuments("Item", [skillData]);
          }
        }
      }

      document.update(createChanges);
    }
  });
  
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const actionButtons = html.querySelectorAll(".reroll");
    for (const actionButton of actionButtons) {
      actionButton.addEventListener("click", async (ev) => {
        Rolls.reroll(ev, message)
      });
    }
  });

  async function _showUserGuide() {
    if (game.user.isGM) {
      const newVer = game.system.version;
      const userGuideJournalName = "Présentation du Système Clé en main";
      const userGuideCompendiumLabel = "systemuserguidefr";

      let currentVer = "0";
      let oldUserGuide = game.journal.getName(userGuideJournalName);
      if (oldUserGuide !== undefined && oldUserGuide !== null && oldUserGuide.getFlag("cleenmain", "ver") !== undefined) {
        currentVer = oldUserGuide.getFlag("cleenmain", "ver");
      }
      if (newVer === currentVer) {
        // Up to date
        return;
      }

      let newReleasePack = game.packs.find((p) => p.metadata.name === userGuideCompendiumLabel);
      if (newReleasePack === null || newReleasePack === undefined) {
        console.log("No conpendium found for the system guide");
        return;
      }
      await newReleasePack.getIndex();

      let newUserGuide = newReleasePack.index.find((j) => j.name === userGuideJournalName);
      if (newUserGuide === undefined || newUserGuide === null) {
        console.log("No system guide found in the compendium");
        return;
      }

      // Don't delete until we have new release Pack
      if (oldUserGuide !== null && oldUserGuide !== undefined) {
        await oldUserGuide.delete();
      }

      await game.journal.importFromCompendium(newReleasePack, newUserGuide._id);
      let newReleaseJournal = game.journal.getName(newUserGuide.name);

      await newReleaseJournal.setFlag("cleenmain", "ver", newVer);

      // Show journal
      await newReleaseJournal.sheet.render(true, { sheetMode: "text" });
    }
  }
}

Hooks.once("i18nInit", function () {
  // Prélocalisation des objets de configuration
  preLocalizeConfig();
});

function preLocalizeConfig() {
  const localizeConfigObject = (obj, keys) => {
    for (let o of Object.values(obj)) {
      for (let k of keys) {
        o[k] = game.i18n.localize(o[k]);
      }
    }
  };

  localizeConfigObject(CLEENMAIN.armor.category, ["label"]);
  localizeConfigObject(CLEENMAIN.weapon.category, ["label"]);
  localizeConfigObject(CLEENMAIN.weapon.type, ["label"]);
  localizeConfigObject(CLEENMAIN.npcCategory, ["label"]);
}
