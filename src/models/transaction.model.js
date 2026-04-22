const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Transaction = sequelize.define(
    "Transaction",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("income", "expense"),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    },
    {
        tableName: "transactions",
    }
);

module.exports = Transaction;