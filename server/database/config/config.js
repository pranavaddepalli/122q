require('dotenv').config()

module.exports = {
  development: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    dialect: 'postgres',
  },
  test: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    dialect: 'postgres'
  },
  production: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    dialect: 'postgres'
  },
}
