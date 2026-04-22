const { sequelize } = require("../config/database");
const User = require("./user.model");
const Transaction = require("./transaction.model");

User.hasMany(Transaction, { foreignKey: "userId", onDelete: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "userId" });

async function initModels() {
    await sequelize.sync();
}

module.exports = {
    sequelize,
    User,
    Transaction,
    initModels,
};