
/**
 * @description Create a macro when dropping an entity on the hotbar
 * Item : open roll dialog for item
 * Actor : open actor sheet
 * Journal :open journal sheet
 * @param {*} bar 
 * @param {*} data 
 * @param {*} slot 
 */
export default async function onHotbarDrop(bar, data, slot) {

    if (data.type == "Item") {
        const actor = game.actors.get(data.actorId);
        const tokenId = data.tokenId;
        const item = actor.items.get(data.data._id);

        if (item !== undefined) {
            let command = null;
            if (['weapon'].includes(item.type)) {
                
                if (!tokenId) {
                    if (actor) { 
                        command = `
                        let action = "weapon-attack";
                        if (event) {
                            if (event.shiftKey) { 
                                action = "weapon-damage"; 
                            }
                            else if (event.ctrlKey) { action = "sheet"; }
                        }
                        if (action == "sheet") {
                            game.actors.get("${actor.id}").items.get("${item.id}").sheet.render(true); 
                        }
                        else {
                            game.actors.get("${actor.id}").check("${item.id}", action); 
                        }                      
                        `; 
                    }
                }
                else { command = `game.actors.tokens["${tokenId}"].items.get("${item.id}").sheet.render(true)`; }
            }        
            if (command !== null) { createMacro(slot, item.name, command, item.img); }        
        }
    }
    // Create a macro to open the actor sheet of the actor dropped on the hotbar
    else if (data.type == "Actor") {
        let actor = game.actors.get(data.id);
        let command = `game.actors.get("${data.id}").sheet.render(true)`;
        createMacro(slot, actor.data.name, command, actor.data.img);
       
    }
    // Create a macro to open the journal sheet of the journal dropped on the hotbar
    else if (data.type == "JournalEntry") {
        let journal = game.journal.get(data.id);
        let command = `game.journal.get("${data.id}").sheet.render(true)`;
        createMacro(slot, journal.name, command, (journal.data.img) ? journal.data.img : "icons/svg/book.svg");     
    }
}

/**
 * @private
 */
async function createMacro(slot, name, command, img){
    let macro = game.macros.contents.find(m => (m.name === name) && (m.data.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: name,
            type: "script",
            img: img,
            command: command,
            flags: {"cleenmain.macro": true}
        }, {displaySheet: false});
        game.user.assignHotbarMacro(macro, slot);
    } 
}