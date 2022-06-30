export default class CemCombat extends Combat {

    /**
     * @description Sort the combatants
     * First : combatant which have not acted
     * Second : combat which have already acted
     * In each group, it's player then npc
     * For the same type it's ordered by name
     * @param {*} a Combatant
     * @param {*} b Combatabt
     * @returns -1 if a is before b, elsewhere 1
     * @override
     */
    _sortCombatants(a, b) {

        const typeA = a.actor.data.type;
        const typeB = b.actor.data.type;

        const hasActedA = a.getFlag("world", "hasActed");
        const hasActedB = b.getFlag("world", "hasActed");

        if (!hasActedA && hasActedB ) {
            return -1;
        }

        if (hasActedA && !hasActedB ) {
            return 1;
        }
      
        if (typeA != typeB) {
            if (typeA == "player") {
                return -1;
            }
            if (typeB == "player") {
                return 1;
            }
        }
        else {
            return a.name < b.name ? -1 : 1;
        }

    }  

    /**
     * @description Reset the hasActed flag to false to all combattants
     * @override
     */
    async nextRound() {     

        let turn = this.data.turn === null ? null : 0; // Preserve the fact that it's no-one's turn currently.
        if ( this.settings.skipDefeated && (turn !== null) ) {
          turn = this.turns.findIndex(t => !t.isDefeated);
          if (turn === -1) {
            ui.notifications.warn("COMBAT.NoneRemaining", {localize: true});
            turn = 0;
          }
        }

        this.combatants.forEach(c => c.setFlag("world", "hasActed", false));

        let advanceTime = Math.max(this.turns.length - (this.data.turn || 0), 0) * CONFIG.time.turnTime;
        advanceTime += CONFIG.time.roundTime;
        return this.update({round: this.round + 1, turn}, {advanceTime});

      }
    
}