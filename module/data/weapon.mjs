import { CLEENMAIN } from "../common/config.js";

export default class CemWeapon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.HTMLField({ textSearch: true });
    schema.state = new fields.StringField({ required: true, blank: false, choices: CLEENMAIN.state, initial: "active" });
    schema.category = new fields.StringField({ required: true, blank: false, choices: CLEENMAIN.weapon.category, initial: "standard" });
    schema.type = new fields.StringField({ initial: "1d6" });
    schema.damageBase = new fields.StringField({ initial: "" });
    schema.quality = new fields.StringField({ initial: "" });
    schema.skillName = new fields.StringField({ initial: "" });
    schema.special = new fields.StringField({ initial: "" });
    schema.zone = new fields.StringField({ initial: "" });
    schema.diceRerollNb = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.range = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.skillBonus = new fields.NumberField({ ...requiredInteger, initial: 0 });
    schema.skillValue = new fields.NumberField({ ...requiredInteger, initial: 4 });
    schema.skillValueNpcElite = new fields.NumberField({ ...requiredInteger, initial: 4 });
    schema.targets = new fields.NumberField({ ...requiredInteger, initial: 1 });
    schema.sixPlus = new fields.BooleanField({ initial: false });
    schema.skillId = new fields.StringField({ initial: "" });

    return schema;
  }
}
