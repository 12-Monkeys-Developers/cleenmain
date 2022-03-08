export default function registerSystemSettings() {

    game.settings.register('cleenmain', 'numberOfPlayers', {
        name: 'cleenmain.options.numberofplayers.name',
        hint: 'cleenmain.options.numberofplayers.hint',
        scope: 'world',
        config: true,
        default: 3,
        type: Number,
        onChange: foundry.utils.debounce(() => window.location.reload(), 100)
    });
    game.settings.register('cleenmain', 'advancedRules', {
        name: 'cleenmain.options.advancedrules.name',
        hint: 'cleenmain.options.advancedrules.hint',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        onChange: foundry.utils.debounce(() => window.location.reload(), 100)
    });
}