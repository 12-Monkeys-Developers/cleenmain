import { CLEENMAIN } from "../common/config.js";

export default class CemEquipment extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.HTMLField({ textSearch: true });
    schema.state = new fields.StringField({ required: true, blank: false, choices: CLEENMAIN.state, initial: "active" });

    schema.quantity = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });

    return schema;
  }
}
