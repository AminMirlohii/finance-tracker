const transactionService = require("../services/transaction.service");

async function create(req, res, next) {
    try {
        const transaction = await transactionService.createForUser(req.user.id, req.body);
        res.status(201).json({ transaction });
    } catch (error) {
        next(error);
    }
}

async function list(req, res, next) {
    try {
        const transactions = await transactionService.listForUser(req.user.id);
        res.status(200).json({ transactions });
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const transaction = await transactionService.updateForUser(req.user.id, req.params.id, req.body);
        res.status(200).json({ transaction });
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        const result = await transactionService.deleteForUser(req.user.id, req.params.id);
        res.status(200).json({ deleted: true, ...result });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    list,
    update,
    remove,
};