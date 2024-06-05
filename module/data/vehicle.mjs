export default class CemVehicle extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // health
    schema.health = new fields.SchemaField({
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.description = new fields.HTMLField({ textSearch: true });
    schema.resistance = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.protection = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.attack = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.dodge = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.pursuit = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.damageCollision = new fields.StringField({ initial: "0" });
    schema.damageDistance = new fields.StringField({ initial: "0" });

    return schema;
  }
}
