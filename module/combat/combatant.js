export default class CemCombatant extends Combatant {

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        this.setFlag("world", "hasActed", false);        
    }
   
}