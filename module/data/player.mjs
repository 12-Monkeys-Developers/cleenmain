//import { CabinetUtils } from "../utils.mjs";

/**
 * Qualités, Aspects, Acquis, Profil, Périsprit, Contacts, Routine, Adversaires, Pouvoirs, Objets, Corruption et expérience
 */
export default class CemPlayer extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // health
    schema.health = new fields.SchemaField({
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    // heroism
    schema.heroism = new fields.SchemaField({
      max: new fields.NumberField({ ...requiredInteger, initial: 8 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 8 }),
      developed: new fields.BooleanField({ initial: false }),
    });
    // trainings
    schema.trainings = new fields.SchemaField({
      weapons: new fields.SchemaField({
        war: new fields.BooleanField({ initial: false }),
        heavy: new fields.BooleanField({ initial: false }),
      }),
      armors: new fields.SchemaField({
        war: new fields.BooleanField({ initial: false }),
        heavy: new fields.BooleanField({ initial: false }),
        shield: new fields.BooleanField({ initial: false }),
      }),
    });

    schema.wounds = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.damageBonus = new fields.SchemaField({
      melee: new fields.NumberField({ ...requiredInteger, initial: 4 }),
      ranged: new fields.NumberField({ ...requiredInteger, initial: 4 }),
    });
    schema.notebook = new fields.HTMLField({ textSearch: true });
    schema.experience = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.experience_total = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.modifiers = new fields.ArrayField(
      new fields.SchemaField({
        type: new fields.StringField(),
        value: new fields.NumberField(),
      })
    );

    schema.description = new fields.HTMLField({ textSearch: true });
    schema.activity = new fields.HTMLField({ textSearch: true });
    schema.traits = new fields.HTMLField({ textSearch: true });

    return schema;
  }
}
