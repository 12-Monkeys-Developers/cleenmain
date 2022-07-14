export default class CemCombatTracker extends CombatTracker {

    get template() {
        return "systems/cleenmain/templates/combat/combat-tracker.html";
    }

    async getData(options) {
        const context = await super.getData(options);
    
        if (!context.hasCombat) {
          return context;
        }
    
        for (let [i, combatant] of context.combat.turns.entries()) {
            context.turns[i].hasActed = combatant.getFlag("world", "hasActed");
            context.turns[i].isPlayer = combatant.actor.type == "player";
            context.turns[i].isNpc = combatant.actor.type == "npc";
        }
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".act").click(this._onAct.bind(this));        
    }

    /**
     * @description Use to indicate that a player or npc has acted or not acted
     * @param {*} event 
     */
    async _onAct(event) {
        event.preventDefault();
        event.stopPropagation();
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combat = this.viewed;
        const combatant = combat.combatants.get(li.dataset.combatantId);

        if (!combatant.flags.world.hasActed)
            await combatant.setFlag("world", "hasActed", true);
        else   
            await combatant.setFlag("world", "hasActed", false);

        //this.render();
    }
}