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

function formatMonthKey(dateValue) {
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) {
        return null;
    }
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function mean(values) {
    if (!values.length) {
        return 0;
    }
    return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function stddev(values, avg) {
    if (!values.length) {
        return 0;
    }
    const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / values.length;
    return Math.sqrt(variance);
}

async function getInsightsForUser(userId) {
    const expenseTransactions = await Transaction.findAll({
        where: { userId, type: "expense" },
        attributes: ["id", "amount", "category", "date", "description"],
        order: [["date", "ASC"], ["id", "ASC"]],
        raw: true,
    });

    if (!expenseTransactions.length) {
        return {
            topSpendingCategory: null,
            averageSpendingPerCategory: [],
            monthlyTrend: [],
            predictedNextMonthSpending: 0,
            unusualTransactions: [],
        };
    }

    const categoryTotals = new Map();
    const categoryAveragesBucket = new Map();
    const monthlyTotals = new Map();
    const amounts = [];

    for (const tx of expenseTransactions) {
        const amount = toNumber(tx.amount);
        amounts.push(amount);

        categoryTotals.set(tx.category, (categoryTotals.get(tx.category) || 0) + amount);

        if (!categoryAveragesBucket.has(tx.category)) {
            categoryAveragesBucket.set(tx.category, []);
        }
        categoryAveragesBucket.get(tx.category).push(amount);

        const monthKey = formatMonthKey(tx.date);
        if (monthKey) {
            monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + amount);
        }
    }

    const topCategoryEntry = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0];
    const topSpendingCategory = topCategoryEntry
        ? { category: topCategoryEntry[0], total: toNumber(topCategoryEntry[1]) }
        : null;

    const averageSpendingPerCategory = [...categoryAveragesBucket.entries()]
        .map(([category, values]) => ({
            category,
            average: toNumber(mean(values)),
        }))
        .sort((a, b) => b.average - a.average);

    const monthlyTrend = [...monthlyTotals.entries()]
        .map(([month, total]) => ({ month, total: toNumber(total) }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const lastThreeMonths = monthlyTrend.slice(-3);
    const predictedNextMonthSpending = toNumber(mean(lastThreeMonths.map((m) => m.total)));

    const avgAmount = mean(amounts);
    const sdAmount = stddev(amounts, avgAmount);
    const anomalyThreshold = avgAmount + sdAmount * 2;
    const unusualTransactions = expenseTransactions
        .filter((tx) => toNumber(tx.amount) > anomalyThreshold)
        .map((tx) => ({
            id: tx.id,
            amount: toNumber(tx.amount),
            category: tx.category,
            date: tx.date,
            description: tx.description || null,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return {
        topSpendingCategory,
        averageSpendingPerCategory,
        monthlyTrend,
        predictedNextMonthSpending,
        unusualTransactions,
    };
}

module.exports = {
    getSummaryForUser,
    getInsightsForUser,
}