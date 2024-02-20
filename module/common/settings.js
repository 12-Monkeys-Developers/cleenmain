export default function registerSystemSettings() {
  const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

  async function setAllActorsHealthToMax() {
    for (let actor of game.actors) {
      if (actor.type === "npc") {
        actor._initializeNpcHealth();
        actor.setHealthToMax();
      } else {
        actor._prepareBaseDataPlayer();
      }
    }
  }

  game.settings.register("cleenmain", "numberOfPlayers", {
    name: "CLEENMAIN.options.numberofplayers.name",
    hint: "CLEENMAIN.options.numberofplayers.hint",
    scope: "world",
    config: true,
    default: "two",
    type: String,
    choices: {
      two: "CLEENMAIN.options.numberofplayers.two",
      three: "CLEENMAIN.options.numberofplayers.three",
      four: "CLEENMAIN.options.numberofplayers.four",
      five: "CLEENMAIN.options.numberofplayers.five",
    },
    onChange: () => setAllActorsHealthToMax(),
  });

  game.settings.register("cleenmain", "advancedRules", {
    name: "CLEENMAIN.options.advancedrules.name",
    hint: "CLEENMAIN.options.advancedrules.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => debouncedReload(),
  });

  game.settings.register("cleenmain", "pointsbiotech", {
    name: "Points Biotech",
    hint: "Pour utiliser les points Biotech plutot que l'héroïsme",
    scope: "world",
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register("cleenmain", "experiencePoints", {
    name: "CLEENMAIN.options.experiencepoints.name",
    hint: "CLEENMAIN.options.experiencepoints.hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: () => debouncedReload(),
  });

  game.settings.register("cleenmain", "worldKey", {
    name: "Unique world key",
    scope: "world",
    config: false,
    type: String,
    default: "",
  });

  game.settings.register("cleenmain", "visibiliteJetsPNJ", {
    name: "Visibilité des jets de dés des PNJs",
    hint: "Détermine si les jets de dés des PNJs contrôlés par le MJ sont visibles par les joueurs et joueuses: invisibles, visibles, ou selon le paramétrage du chat du MJ au moment du jet.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      private: "Privés : seul le MJ les voit (par défaut)",
      public: "Publics : tout le monde les voit",
      depends: "Selon le réglage dans le chat",
    },
    default: "private",
  });
}
