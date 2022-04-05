import { MAX_HEROISM } from "./config.js";

export class Utils {

    static getMaxHeroism() {
         const nbPlayers = game.settings.get("cleenmain", "numberOfPlayers");
         if (nbPlayers == "two") return MAX_HEROISM.TWO_PLAYERS;
         if (nbPlayers == "three") return MAX_HEROISM.THREE_PLAYERS;
         if (nbPlayers == "four") return MAX_HEROISM.FOUR_PLAYERS;
         if (nbPlayers == "five") return MAX_HEROISM.FIVE_PLAYERS;
    }
}