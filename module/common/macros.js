
/**
 * @description Create a macro when dropping an entity on the hotbar
 * Item : open roll dialog for item
 *  Weapon
 *      player : click to atack roll, SHIFT + Click for damage roll, CTRL + Click for open Item Sheet
 *      npc : click to atack roll, CTRL + Click for open Item Sheet
 * Actor : open actor sheet
 * Journal :open journal sheet
 * @param {*} bar 
 * @param {*} data 
 * @param {*} slot 
 */
export default async function onHotbarDrop(bar, data, slot) {

    // Manage macro for Item
    if (data.type == "Item") {
        const item = await fromUuid(data.uuid);
        const actor = item.actor;

        if (item !== undefined) {
            let command = null;
            let macroName = null;

            // Create macro for weapon
            if (['weapon'].includes(item.type)) {                
                // From token
                if (item.parent.isToken) {
                    const tokenId = actor.token.id;
                    command = `
                        let action = "weapon-attack";
                        if (event) {
                            if (event.shiftKey) { 
                                action = "weapon-damage"; 
                            }
                            else if (event.ctrlKey) { 
                                action = "sheet"; 
                            }
                        }
                        if (action == "sheet") {
                            game.actors.tokens["${tokenId}"].items.get("${item.id}").sheet.render(true); 
                        }
                        else {
                            game.actors.tokens["${tokenId}"].check("${item.id}", action); 
                        }                      
                        `;
                    macroName = item.name + " (" + game.actors.tokens[tokenId].name + ")";
                }
                // From actor
                else {
                    command = `
                        let action = "weapon-attack";
                        if (event) {
                            if (event.shiftKey) { 
                                action = "weapon-damage"; 
                            }
                            else if (event.ctrlKey) { 
                                action = "sheet"; 
                            }
                        }
                        if (action == "sheet") {
                            game.actors.get("${actor.id}").items.get("${item.id}").sheet.render(true); 
                        }
                        else {
                            game.actors.get("${actor.id}").check("${item.id}", action); 
                        }                      
                        `;
                    macroName = item.name + " (" + game.actors.get(actor.id).name + ")";
                }                   
        }
        if (command !== null) { createMacro(slot, macroName, command, item.img); } 
        }
    }

    // Create a macro to open the actor sheet of the actor dropped on the hotbar
    else if (data.type == "Actor") {
        const actor = await fromUuid(data.uuid);
        const command = `game.actors.get("${actor.id}").sheet.render(true)`;
        createMacro(slot, actor.name, command, actor.img);
        
    }

    // Create a macro to open the journal sheet of the journal dropped on the hotbar
    else if (data.type == "JournalEntry") {
        const journal = await fromUuid(data.uuid);
        const command = `game.journal.get("${journal.id}").sheet.render(true)`;
        createMacro(slot, journal.name, command, (journal.img) ? journal.img : "icons/svg/book.svg");     
    }
}

/**
 * @description Create a macro
 *  All macros are flaged with a cleenmain.macro flag at true
 * @param {*} slot 
 * @param {*} name 
 * @param {*} command 
 * @param {*} img 
 */
async function createMacro(slot, name, command, img){
    let macro = game.macros.contents.find(m => (m.name === name) && (m.command === command));
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