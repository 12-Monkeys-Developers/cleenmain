import { CLEENMAIN } from "../common/config.js";

export default class CemSkill extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.HTMLField({ textSearch: true });

    schema.base = new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 });
    schema.baseNpcElite = new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 });
    schema.bonus = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.value = new fields.NumberField({ ...requiredInteger, initial: 2, min: 0 });
    schema.developed = new fields.BooleanField({ initial: false });
    schema.physical = new fields.BooleanField({ initial: false });
    schema.reference = new fields.StringField({ initial: "" });

    schema.skills = new fields.ArrayField(new fields.StringField());

    return schema;
  }
}
