const { fn, col } = require("sequelize");
const { Transaction } = require("../models");

function toNumber(value) {
    if (value === null || value === undefined) {
        return 0;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

async function getSummaryForUser(userId) {
    const totalsByTypeRows = await Transaction.findAll({
        where: { userId },
        attributes: ["type", [fn("SUM", col("amount")), "total"]],
        group: ["type"],
        raw: true,
    });
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const row of totalsByTypeRows) {
        const total = toNumber(row.total);
        if (row.type === "income") {
            totalIncome = total;
            continue;
        }
        if (row.type === "expense") {
            totalExpenses = total;
        }
    }
    const totalsPerCategoryRows = await Transaction.findAll({
        where: { userId },
        attributes: ["category", [fn("SUM", col("amount")), "total"]],
        group: ["category"],
        order: [[fn("SUM", col("amount")), "DESC"]],
        raw: true,
    });
    const totalsPerCategory = totalsPerCategoryRows.map((row) => ({
        category: row.category,
        total: toNumber(row, total),
    }));
    return {
        totalIncome,
        totalExpenses,
        currentBalance: totalIncome - totalExpenses,
        totalsPerCategory,
    };
}

module.exports = {
    getSummaryForUser,
}