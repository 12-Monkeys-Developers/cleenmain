export default function registerSystemSettings() {

    game.settings.register('cleenmain', 'numberOfPlayers', {
        name: 'CLEENMAIN.options.numberofplayers.name',
        hint: 'CLEENMAIN.options.numberofplayers.hint',
        scope: 'world',
        config: true,
        type: Number,
        choices: {
            2 : "2",
            3 : "3",
            4 : "4",
            5 : "5"
        },
        default: "0",        
        type: Number,
        onChange: foundry.utils.debounce(() => window.location.reload(), 100)
    });
    game.settings.register('cleenmain', 'advancedRules', {
        name: 'CLEENMAIN.options.advancedrules.name',
        hint: 'CLEENMAIN.options.advancedrules.hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: foundry.utils.debounce(() => window.location.reload(), 100)
    });
}