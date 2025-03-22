const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/:communityId", orderController.getOrders);
router.get("/:communityId/member/:consumerId", orderController.getMemberOrders); // Use consumerId




module.exports = router;