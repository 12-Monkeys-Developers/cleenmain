import CemBaseActor from "./base-actor.js";

export class NpcActor extends CemBaseActor {

  /** @override */
  prepareData() {
    super.prepareData();

    if (this.data.data.level === "boss") this.data.data.elite = true;
    this._initializeNpcHealth();
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
  }


  /**
   * @description  Evaluate the max health of the NPC depending of the number of players option 
   */
  // To Do Check if it could be done in another way
  _initializeNpcHealth(){
      const numberofplayers = game.settings.get('cleenmain', 'numberOfPlayers');
      let numberofplayersString = "fivepcs";
      if (numberofplayers <= 2) numberofplayersString = "twopcs";
      else if (numberofplayers == 3) numberofplayersString = "threepcs";
      else if (numberofplayers == 4) numberofplayersString = "fourpcs";
      
      if (this.data.data.level === "support") {
          this.data.data.health.value = this.data.data.health.max = 1;
      }
      else {
        let healthMax = this.data.data.healthsecondfiddle[numberofplayersString];
        if (this.data.data.level === "boss") healthMax = healthMax*2;
        if (this.data.data.health.value === this.data.data.health.max) {
            this.data.data.health.value = healthMax;
        }
        this.data.data.health.max = healthMax;
      }
  }
}