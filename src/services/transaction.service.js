const { Transaction } = require("../models");

const ALLOWED_TYPES = ["income", "expense"];

function badRequest(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function parseId(idParam) {
    const id = Number.parseInt(idParam, 10);
    if (!Number.isInteger(id) || id < 1) {
        throw badRequest("Invalid transaction id");
    }
    return id;
}

function normalizeType(type) {
    if (typeof type !== "string") {
        return null;
    }
    const normalized = type.trim().toLowerCase();
    return ALLOWED_TYPES.includes(normalized) ? normalized : null;
}

function parseAmount(amount) {
    if (amount === undefined || amount === null || amount === "") {
        return null;
    }
    const num = typeof amount === "string" ? Number.parseFloat(amount) : Number(amount);
    if (!Number.isFinite(num)) {
        return null;
    }
    return num;
}

function parseDate(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    if (typeof value === "string") {
        const trimmed = value.trim();
        const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
        if (dateOnly) {
            return trimmed;
        }
        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime())) {
            return null;
        }
        return parsed.toISOString().slice(0, 10);
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toISOString().slice(0, 10);
    }
    return null;
}

function validateCategory(category) {
    if (category === undefined || category === null) {
        return null;
    }
    if (typeof category !== "string") {
        return null;
    }
    const trimmed = category.trim();
    if (trimmed.length === 0) {
        return null;
    }
    if (trimmed.length > 120) {
        throw badRequest("Category must be at most 120 characters");
    }
    return trimmed;
}

function validateDescription(description) {
    if (description === undefined || description === null || description === "") {
        return null;
    }
    if (typeof description !== "string") {
        throw badRequest("Description must be a string");
    }
    return description.trim() || null;
}

function validateCreatePayload(body) {
    const { amount, type, category, description, date } = body;

    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) {
        throw badRequest("Amount is required and must be a valid number");
    }
    if (parsedAmount <= 0) {
        throw badRequest("Amount must be greater than zero");
    }

    const normalizedType = normalizeType(type);
    if (!normalizedType) {
        throw badRequest("Type must be either income or expense");
    }

    const normalizedCategory = validateCategory(category);
    if (!normalizedCategory) {
        throw badRequest("Category is required");
    }

    const normalizedDescription = validateDescription(description);

    const normalizedDate = parseDate(date);
    if (!normalizedDate) {
        throw badRequest("Date is required and must be a valid date (YYYY-MM-DD)");
    }

    return {
        amount: parsedAmount,
        type: normalizedType,
        category: normalizedCategory,
        description: normalizedDescription,
        date: normalizedDate,
    };
}

function validateUpdatePayload(body) {
    const patch = {};
    const keys = ["amount", "type", "category", "description", "date"];
    const present = keys.filter((k) => Object.prototype.hasOwnProperty.call(body, k));
    if (present.length === 0) {
        throw badRequest("At least one field must be provided to update");
    }

    if (Object.prototype.hasOwnProperty.call(body, "amount")) {
        const parsedAmount = parseAmount(body.amount);
        if (parsedAmount === null) {
            throw badRequest("Amount must be a valid number");
        }
        if (parsedAmount <= 0) {
            throw badRequest("Amount must be greater than zero");
        }
        patch.amount = parsedAmount;
    }

    if (Object.prototype.hasOwnProperty.call(body, "type")) {
        const normalizedType = normalizeType(body.type);
        if (!normalizedType) {
            throw badRequest("Type must be either income or expense");
        }
        patch.type = normalizedType;
    }

    if (Object.prototype.hasOwnProperty.call(body, "category")) {
        const normalizedCategory = validateCategory(body.category);
        if (!normalizedCategory) {
            throw badRequest("Category cannot be empty");
        }
        patch.category = normalizedCategory;
    }

    if (Object.prototype.hasOwnProperty.call(body, "description")) {
        patch.description = validateDescription(body.description);
    }

    if (Object.prototype.hasOwnProperty.call(body, "date")) {
        const normalizedDate = parseDate(body.date);
        if (!normalizedDate) {
            throw badRequest("Date must be a valid date (YYYY-MM-DD)");
        }
        patch.date = normalizedDate;
    }

    return patch;
}

function toPublic(transaction) {
    return {
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
    };
}

async function createForUser(userId, body) {
    const data = validateCreatePayload(body);
    const transaction = await Transaction.create({
        userId,
        ...data,
    });
    return toPublic(transaction);
}

async function listForUser(userId) {
    const rows = await Transaction.findAll({
        where: { userId },
        order: [["date", "DESC"], ["id", "DESC"]],
    });
    return rows.map(toPublic);
}

async function assertOwnedTransaction(userId, id) {
    const transaction = await Transaction.findOne({
        where: { id, userId },
    });
    if (!transaction) {
        const error = new Error("Transaction not found");
        error.statusCode = 404;
        throw error;
    }
    return transaction;
}

async function updateForUser(userId, idParam, body) {
    const id = parseId(idParam);
    const patch = validateUpdatePayload(body);
    const transaction = await assertOwnedTransaction(userId, id);
    await transaction.update(patch);
    await transaction.reload();
    return toPublic(transaction);
}

async function deleteForUser(userId, idParam) {
    const id = parseId(idParam);
    const transaction = await assertOwnedTransaction(userId, id);
    await transaction.destroy();
    return { id: transaction.id };
}

module.exports = {
    createForUser,
    listForUser,
    updateForUser,
    deleteForUser,
};