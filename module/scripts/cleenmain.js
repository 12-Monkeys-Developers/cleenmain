
import {cleenmain} from "./config.js";
import CleenmainItemSheet from "../sheets/cleenmainItemSheet.js";
import CleenmainPjSheet from "../sheets/cleenmainPjSheet.js";

async function preloadHandlebarsTemplates(){
    const templatePaths = [
        "systems/cleenmain/templates/partials/atout-card.html"
    ];

    return(loadTemplates(templatePaths))
}

Hooks.once("init", function(){

    CONFIG.cleenmain = cleenmain;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('cleenmain', CleenmainItemSheet, {makeDefault: true });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cleenmain', CleenmainPjSheet, {makeDefault: true });

    preloadHandlebarsTemplates()
})