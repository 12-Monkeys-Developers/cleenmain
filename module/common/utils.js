import { MAXHEROISM } from "./config.js";

export class Utils {

    static getMaxHeroism() {
         const nbPlayers = game.settings.get("cleenmain", "numberOfPlayers");
         if (nbPlayers == 2) return MAXHEROISM.TWO_PLAYERS;
         if (nbPlayers == 3) return MAXHEROISM.THREE_PLAYERS;
         if (nbPlayers == 4) return MAXHEROISM.FOUR_PLAYERS;
         if (nbPlayers == 5) return MAXHEROISM.FIVE_PLAYERS;
    }
}