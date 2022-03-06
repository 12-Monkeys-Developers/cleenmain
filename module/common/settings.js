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
}