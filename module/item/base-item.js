import { Skills } from "../common/skills.js";
export default class CemBaseItem extends Item {

    prepareData(){
        super.prepareData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();
    
        // Get the Item's data
        const itemData = this.data;
        const data = itemData.data;
    
        // Skill item
        if ( itemData.type === "skill" ) {
          data.value = Skills.getSkillValue(data.base, data.bonus, data.developed);
        }
    }
}