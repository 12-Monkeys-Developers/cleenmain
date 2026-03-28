export default class CemCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static DEFAULT_OPTIONS = {
    actions: {
      combatantAct: CemCombatTracker.#onCombatantAct,
    },
  };

  /** @override */
  static PARTS = {
    header: {
      template: "templates/sidebar/tabs/combat/header.hbs",
    },
    tracker: {
      template: "systems/cleenmain/templates/combat/combat-tracker.hbs",
      scrollable: [""],
    },
    footer: {
      template: "templates/sidebar/tabs/combat/footer.hbs",
    },
  };

  /** @override */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    turn.hasActed = combatant.getFlag("world", "hasActed");
    turn.isPlayer = combatant.actor.type == "player";
    turn.isNpc = combatant.actor.type == "npc";
    return turn;
  }

  /* -------------------------------------------------- */
  /*   Actions                                          */
  /* -------------------------------------------------- */ /**
   * Handle clicking on combattant.
   * @this {CombatTracker}
   * @param {...any} args
   */
  static #onCombatantAct(...args) {
    return this._onAct(...args);
  }

  /**
   * @description Use to indicate that a player or npc has acted or not acted
   * @param {*} event
   */
  async _onAct(event, target) {
    event.preventDefault();
    const combat = this.viewed;
    const combatant = combat.combatants.get(target.dataset.combatantId);

    if (!combatant.flags.world.hasActed) await combatant.setFlag("world", "hasActed", true);
    else await combatant.setFlag("world", "hasActed", false);
  }
}
