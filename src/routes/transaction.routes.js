const { Router } = require("express");
const transactionController = require("../controllers/transaction.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = Router();

router.use(authenticate);

router.post("/", transactionController.create);
router.get("/", transactionController.list);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);

module.exports = router;