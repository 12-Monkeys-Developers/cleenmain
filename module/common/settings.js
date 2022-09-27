export default function registerSystemSettings() {

    const debouncedReload = foundry.utils.debounce(() => window.location.reload(), 100);

    async function setAllActorsHealthToMax(){
        for(let actor of game.actors){
            if(actor.type==="npc") {
                actor._initializeNpcHealth();
                actor.setHealthToMax();
            }
            else{
                actor._prepareBaseDataPlayer()
            }
        }
    }

    game.settings.register('cleenmain', 'numberOfPlayers', {
        name: 'CLEENMAIN.options.numberofplayers.name',
        hint: 'CLEENMAIN.options.numberofplayers.hint',
        scope: 'world',
        config: true,
        default: "two",
        type: String,
        choices: {
            "two" : 'CLEENMAIN.options.numberofplayers.two',
            "three" : 'CLEENMAIN.options.numberofplayers.three',
            "four" : 'CLEENMAIN.options.numberofplayers.four',
            "five" : 'CLEENMAIN.options.numberofplayers.five'
        },
        onChange: () => setAllActorsHealthToMax(),
    });
    game.settings.register('cleenmain', 'advancedRules', {
        name: 'CLEENMAIN.options.advancedrules.name',
        hint: 'CLEENMAIN.options.advancedrules.hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: () => debouncedReload(),
    });
}