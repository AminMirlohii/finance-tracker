const { Router } = require("express");
const analyticsController = require("../controllers/analytics.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = Router();

router.use(authenticate);
router.get("/summary", analyticsController.getSummary);

module.exports = router;