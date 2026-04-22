const { Router } = require("express");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const transactionRoutes = require("./transaction.routes");
const analyticsRoutes = require("./analytics.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/analytics", analyticsRoutes);

module.exports = router;