export default class CemBaseItem extends Item {

    prepareData(){
        super.prepareData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    
        // Get the Item's data
        const itemData = this.data;
        const data = itemData.data;
    
        // Classes
        if ( itemData.type === "skill" ) {
          data.value = parseInt(data.base) + parseInt(data.bonus) + parseInt((data.developed ? 2 : 0));
        }
    }
}