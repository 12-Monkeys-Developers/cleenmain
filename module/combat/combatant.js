export default class CemCombatant extends Combatant {

    _onCreate(data, options, userID) {
        super._onCreate(data, options, userID);
        if(game.user.isGM) this.setFlag("world", "hasActed", false);        
    }
   
}