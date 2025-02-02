const express = require("express");
const insurancePaymentController = require("../controllers/paymentController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get(
  "/checkout-session/:farmVisitTrackingId",
  insurancePaymentController.createPremiumPaymentSession
);

router.get(
  "/confirm-payment",
  insurancePaymentController.confirmPremiumPayment
);

router.get("/my-payments", insurancePaymentController.getFarmerPremiumPayments);

module.exports = router;
