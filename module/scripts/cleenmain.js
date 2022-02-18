
import {cleenmain} from "./config.js";
import CleenmainItemSheet from "../sheets/cleenmainItemSheet.js";
import CleenmainPjSheet from "../sheets/cleenmainPjSheet.js";

Hooks.once("init", function(){

    CONFIG.cleenmain = cleenmain;
    
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('cleenmain', CleenmainItemSheet, {makeDefault: true });

    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('cleenmain', CleenmainPjSheet, {makeDefault: true });
})