module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: 'localhost',
      port: 5430,
      user: 'postgres',
      password: 'Dima2117',
      database: 'one_piece'
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};