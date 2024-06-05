//import { CabinetUtils } from "../utils.mjs";
import { CLEENMAIN } from "../common/config.js";

export default class CemNpc extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    // health
    schema.health = new fields.SchemaField({
      max: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
    });
    schema.healthByNumberPlayers = new fields.SchemaField({
      two: new fields.NumberField({ ...requiredInteger, initial: 6 }),
      three: new fields.NumberField({ ...requiredInteger, initial: 9 }),
      four: new fields.NumberField({ ...requiredInteger, initial: 12 }),
      five: new fields.NumberField({ ...requiredInteger, initial: 15 }),
    });

    schema.description = new fields.HTMLField({ textSearch: true });
    schema.activity = new fields.HTMLField({ textSearch: true });
    schema.traits = new fields.HTMLField({ textSearch: true });

    schema.level = new fields.StringField({ required: true, blank: false, choices: CLEENMAIN.npcCategory, initial: "secondfiddle" });
    schema.elite = new fields.BooleanField({ initial: false });

    schema.wounds = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 });
    schema.equipment = new fields.HTMLField({ textSearch: true });
    schema.tactic = new fields.HTMLField({ textSearch: true });
    schema.modifiers = new fields.ArrayField(
      new fields.SchemaField({
        type: new fields.StringField(),
        value: new fields.NumberField(),
      })
    );

    schema.defence = new fields.SchemaField({
      protection: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      name: new fields.StringField({ initial: "No armor" }),
      special: new fields.StringField({ initial: "" }),
      relance: new fields.BooleanField({ initial: false }),
    });

    return schema;
  }
}
