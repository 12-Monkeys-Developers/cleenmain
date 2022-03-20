import { Rolls } from "../common/rolls.js";
import { Utils } from "../common/utils.js";
export default class CemBaseActor extends Actor {

    /** @override */
    prepareBaseData(){
        super.prepareBaseData();

        if (this.data.type === "player") this._prepareBaseDataPlayer();
    }

    _prepareBaseDataPlayer() {

        this.data.data.heroism.max = Utils.getMaxHeroism() + (this.data.data.heroism.developed ? 1 : 0);
    }

    /**
     * @name check
     * @description Rolls dices
     * @param {*} itemId Id of the Item used for roll
     * @param {*} rollType  skill, weapon attack, weapon damage
     * @returns 
     */
    async check(itemId, rollType) {
        const item = this.items.get(itemId);
        if (!item) return;

        // Get the active token
        let tokenList = this.getActiveTokens();
        let actingToken = tokenList[0];

        // If there is a token active for this actor, we use its name and image instead of the actor's
        const actingCharacterName = actingToken?.data?.name ?? this.name;
        const actingCharacterImage = actingToken?.data?.img ?? this.img; 

        return Rolls.check(this, item, rollType, {
            ...item.data,
            owner: this.id,
            actingCharacterName: actingCharacterName,
            actingCharacterImage: actingCharacterImage
        });
    }

    /**
     * @description Use nbPoints of Heroism
     * @param {*} nbPoints 
     */
    async useHeroism(nbPoints) {
        let newValue = this.data.data.heroism.value - nbPoints;
        await this.update({'data.heroism.value': newValue});
    }

}
