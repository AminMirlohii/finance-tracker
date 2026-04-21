const { Sequelize } = require("sequelize");
const { database, env } = require("./env");

const sequelize = new Sequelize(database.name, database.user, database.password, {
    host: database.host,
    port: database.port,
    dialect: "mysql",
    logging: env === "development" ? console.log : false,
    define: {
        underscored: true,
        timestamps: true,
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

async function connectDatabase() {
    await sequelize.authenticate();
}

module.exports = {
    sequelize,
    connectDatabase,
}