const InsurancePremiumPayment = require("../models/paymentModel");
const FarmVisitTracking = require("../models/farmvisitTrackingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPremiumPaymentSession = catchAsync(async (req, res, next) => {
  const { farmVisitTrackingId } = req.params;

  const farmVisitTracking = await FarmVisitTracking.findById(
    farmVisitTrackingId
  ).populate({
    path: "insuranceAssignment",
    populate: {
      path: "insurancePolicy",
      select: "premium name",
    },
  });

  if (!farmVisitTracking) {
    return next(new AppError("No farm visit tracking found", 404));
  }

  const premium = farmVisitTracking.insuranceAssignment.insurancePolicy.premium;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://localhost:5173/insurance/payment-success?farmVisitTracking=${farmVisitTrackingId}&user=${req.user.id}`,
    cancel_url: `${req.protocol}://localhost:5173/insurance/payment-cancel`,
    customer_email: req.user.email,
    client_reference_id: farmVisitTrackingId,
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: farmVisitTracking.insuranceAssignment.insurancePolicy.name,
            description: "Insurance Premium Payment",
          },
          unit_amount: premium * 100, // Convert to paisa
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    billing_address_collection: "required",
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.confirmPremiumPayment = catchAsync(async (req, res, next) => {
  const { farmVisitTrackingId, user, price } = req.query;

  if (!farmVisitTrackingId || !user) {
    return next(new AppError("Missing parameters", 400));
  }

  // Create premium payment record
  const premiumPayment = await InsurancePremiumPayment.create({
    farmer: user,
    farmVisitTracking: farmVisitTrackingId,
    paymentDetails: {
      paymentMethod: "Online",
      status: "Completed",
      transactionId: `INS-${Date.now()}-${farmVisitTrackingId}`,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      premiumPayment,
    },
  });
});

exports.getFarmerPremiumPayments = catchAsync(async (req, res, next) => {
  const payments = await InsurancePremiumPayment.find({
    farmer: req.user.id,
  }).populate({
    path: "farmVisitTracking",
    populate: {
      path: "insuranceAssignment",
      populate: {
        path: "insurancePolicy",
        select: "name cropType premium",
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: payments.length,
    data: payments,
  });
});
