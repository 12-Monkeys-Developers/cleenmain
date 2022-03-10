import CemBaseItemSheet from "./base-sheet.js";

export class WeaponSheet extends CemBaseItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          width: 300,
          height: 200
        });
      }
    
      getData(options) {
        let data = mergeObject(
          super.getData(options), {
        });
        return data;
      }
    
      activateListeners(html) {
        super.activateListeners(html);
      } 

    /** @override */
    _onDrop(event) {
        event.preventDefault();
        if (!this.options.editable) return false;
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }
        // Case 2 - Dropped Actor
        if (data.type === "Actor") {
            return false;
        }
    }

     /**
     * Handle dropping of an item reference or item data onto an Item Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
         _onDropItem(event, data) {
            Item.fromDropData(data).then(item => {
                const itemData = duplicate(item.data);
                switch (itemData.type) {
                    case "skill":
                        return this._onDropSkillItem(event, itemData);
                    default:
                        return false;
                }
            });
        }

    /**
     * 
     * @param {*} event 
     * @param {*} itemData 
     * @returns 
     */
     _onDropSkillItem(event, itemData) {
        event.preventDefault();
        console.log(itemData);
    }
}