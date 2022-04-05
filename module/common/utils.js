import { MAXHEROISM } from "./config.js";

export class Utils {

    static getMaxHeroism() {
         const nbPlayers = game.settings.get("cleenmain", "numberOfPlayers");
         if (nbPlayers == "two") return MAXHEROISM.TWO_PLAYERS;
         if (nbPlayers == "three") return MAXHEROISM.THREE_PLAYERS;
         if (nbPlayers == "four") return MAXHEROISM.FOUR_PLAYERS;
         if (nbPlayers == "five") return MAXHEROISM.FIVE_PLAYERS;
    }
}