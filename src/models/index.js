const { sequelize } = require("../config/database");
const User = require("./user.model");

async function initModels() {
    await sequelize.sync();
}

module.exports = {
    sequelize,
    User,
    initModels,
};