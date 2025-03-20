const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/:communityId", orderController.getOrders);
router.get("/:communityId/member/:memberId", orderController.getMemberOrders); // New route


module.exports = router;