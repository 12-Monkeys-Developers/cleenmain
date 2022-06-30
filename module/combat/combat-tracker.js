export default class CemCombatTracker extends CombatTracker {

    get template() {
        return "systems/cleenmain/templates/combat/combat-tracker.html";
    }

    async getData(options) {
        const data = await super.getData(options);
    
        if (!data.hasCombat) {
          return data;
        }
    
        for (let [i, combatant] of data.combat.turns.entries()) {
          data.turns[i].hasActed = combatant.getFlag("world", "hasActed");
          data.turns[i].isPlayer = combatant.actor.data.type == "player";
          data.turns[i].isNpc = combatant.actor.data.type == "npc";
        }
        return data;
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
        const btn = event.currentTarget;
        const li = btn.closest(".combatant");
        const combatant = this.viewed.combatants.get(li.dataset.combatantId);

        if (!combatant.data.flags.world.hasActed)
            await combatant.setFlag("world", "hasActed", true);
        else   
            await combatant.setFlag("world", "hasActed", false);

        this.render();
    }
}