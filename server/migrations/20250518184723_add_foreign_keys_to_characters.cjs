// migrations/20250520120000_add_foreign_keys_to_characters.cjs
exports.up = async function(knex) {
    const hasSubclassId = await knex.schema.hasColumn('characters', 'subclass_id');
    const hasRaceId = await knex.schema.hasColumn('characters', 'race_id');
    const hasDevilFruitId = await knex.schema.hasColumn('characters', 'devil_fruit_id');
    const hasRoleId = await knex.schema.hasColumn('characters', 'role_id');
    const hasArmorClass = await knex.schema.hasColumn('characters', 'armor_class');
  
    return knex.schema.alterTable('characters', table => {
      if (!hasSubclassId) {
        table.integer('subclass_id').references('id').inTable('subclasses').onDelete('SET NULL');
      }
      if (!hasRaceId) {
        table.integer('race_id').references('id').inTable('races').onDelete('SET NULL');
      }
      if (!hasDevilFruitId) {
        table.integer('devil_fruit_id').references('id').inTable('devil_fruits').onDelete('SET NULL');
      }
      if (!hasRoleId) {
        table.integer('role_id').references('id').inTable('roles').onDelete('SET NULL');
      }
      if (!hasArmorClass) {
        table.integer('armor_class').defaultTo(10);
      }
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('characters', table => {
      table.dropColumn('subclass_id');
      table.dropColumn('race_id');
      table.dropColumn('devil_fruit_id');
      table.dropColumn('role_id');
      table.dropColumn('armor_class');
    });
  };