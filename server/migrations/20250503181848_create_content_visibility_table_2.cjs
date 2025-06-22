exports.up = function(knex) {
    return knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_content_visibility_content_id
        ON content_visibility USING btree
        (content_id COLLATE pg_catalog."default" ASC NULLS LAST);
    `);
  };
  
  exports.down = function(knex) {
    return knex.raw(`
      DROP INDEX "idx_content_visibility_content_id";
    `);
  };