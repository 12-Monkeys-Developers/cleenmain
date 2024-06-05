export default class CemBoon extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};

    schema.description = new fields.HTMLField({ textSearch: true });
    schema.developed = new fields.BooleanField({ initial: false });
    schema.limitedUse = new fields.BooleanField({ initial: false });
    schema.used = new fields.BooleanField({ initial: false });
    schema.limitedUse2 = new fields.BooleanField({ initial: false });
    schema.used2 = new fields.BooleanField({ initial: false });
    schema.limitedUse3 = new fields.BooleanField({ initial: false });
    schema.used3 = new fields.BooleanField({ initial: false });

    schema.effect = new fields.ArrayField(
      new fields.SchemaField({
        name: new fields.StringField(),
        options: new fields.SchemaField({
          value: new fields.AnyField(), //AnyField required for compatibility with old modules
          reference: new fields.StringField(),
          limitedUse2: new fields.BooleanField({ initial: false }),
          limitedUse3: new fields.BooleanField({ initial: false }),
          referenceList: new fields.ArrayField(new fields.StringField()),
        }),
      })
    );

    return schema;
  }
}
