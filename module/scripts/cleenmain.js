
import {cleenmain} from "./config.js";
import CleenmainItem from "./cleenmainItem.js";
import CleenmainActor from "./cleenmainActor.js";
import CleenmainItemSheet from "../sheets/cleenmainItemSheet.js";
import CleenmainPlayerSheet from "../sheets/cleenmainPlayerSheet.js";
import CleenmainNpcSheet from "../sheets/cleenmainNpcSheet.js";
import { initializeHandlebars } from './handlebars.js';

Hooks.once("init", function(){

    CONFIG.cleenmain = cleenmain;
    CONFIG.Item.documentClass = CleenmainItem;
    CONFIG.Actor.documentClass = CleenmainActor;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('cleenmain', CleenmainItemSheet, {makeDefault: true });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cleenmain', CleenmainPlayerSheet, {types: ['player'], makeDefault: true });
    Actors.registerSheet('cleenmain', CleenmainNpcSheet, {types: ['npc'], makeDefault: true });

    initializeHandlebars();

    game.settings.register('cleenmain', 'numberOfPlayers', {
        name: 'cleenmain.options.numberofplayers.name',
        hint: 'cleenmain.options.numberofplayers.hint',
        scope: 'world',
        config: true,
        default: 3,
        type: Number,
        onChange: foundry.utils.debounce(() => window.location.reload(), 100)
    });
}   )

Hooks.on('createActor', async (document, options, userId) => {
    if (game.user.isGM) {
        let createChanges = {};
        mergeObject(createChanges, {
            'token.disposition': CONST.TOKEN_DISPOSITIONS.NEUTRAL,
        });
        
        if (document.data.type === 'player') {
            createChanges.token.vision = true;
            createChanges.token.actorLink = true;

            //add all the base skills to the new actor
            for (var prop of CONFIG.cleenmain.skill) {
                let skillData = {
                name: game.i18n.localize("cleenmain.skill."+prop+".name"),
                type: 'skill',
                data: {
                    description: game.i18n.localize("cleenmain.skill."+prop+".description"),
                    reference: prop
                }
                };
                await Item.create(skillData, { parent: document }, { renderSheet: true });
                }
        }
        document.data.update(createChanges);
    }

});