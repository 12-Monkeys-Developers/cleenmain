export class Utils {

    static getMaxHeroism() {
         const nbPlayers = game.settings.get("cleenmain", "numberOfPlayers");
         if (nbPlayers == "two") return game.cleenmain.config.max_heroism.TWO_PLAYERS;
         if (nbPlayers == "three") return game.cleenmain.config.max_heroism.THREE_PLAYERS;
         if (nbPlayers == "four") return game.cleenmain.config.max_heroism.FOUR_PLAYERS;
         if (nbPlayers == "five") return game.cleenmain.config.max_heroism.FIVE_PLAYERS;
    }
}