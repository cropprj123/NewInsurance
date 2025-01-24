const InsuranceAssignment = require("../models/assignmentModel");
const User = require("../models/userModel");
const InsurancePolicy = require("../models/insuranceModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createInsuranceAssignment = catchAsync(async (req, res, next) => {
  const { farmerId, insurancePolicyId } = req.body;

  const farmer = await User.findById(farmerId);
  const insurancePolicy = await InsurancePolicy.findById(insurancePolicyId);

  if (!farmer || !insurancePolicy) {
    return next(new AppError("Invalid farmer or insurance policy", 400));
  }

  const assignment = await InsuranceAssignment.create({
    farmer: farmerId,
    insurancePolicy: insurancePolicyId,
    region: {
      state: farmer.address.state,
      district: farmer.address.district,
    },
  });

  res.status(201).json({
    status: "success",
    data: { assignment },
  });
});
exports.assignAgentToInsurance = catchAsync(async (req, res, next) => {
  const { assignmentId, agentId } = req.body;

  // Validate assignment and agent
  const assignment = await InsuranceAssignment.findById(assignmentId);
  const agent = await User.findById(agentId);
  const insurancePolicy = await InsurancePolicy.findById(
    assignment.insurancePolicy
  );

  if (!assignment) {
    return next(new AppError("Insurance assignment not found", 404));
  }

  if (!agent || agent.role !== "agent") {
    return next(new AppError("Invalid agent", 400));
  }

  // Verify agent is in the same region
  if (
    agent.address.state !== assignment.region.state ||
    agent.address.district !== assignment.region.district
  ) {
    return next(new AppError("Agent must be from the same region", 400));
  }

  // Check insurance policy dates
  const today = new Date();
  const policyStartDate = new Date(insurancePolicy.seasonDates.startDate);
  const policyEndDate = new Date(insurancePolicy.seasonDates.endDate);

  // Update assignment with date-based logic
  assignment.agent = agentId;
  assignment.status =
    today >= policyStartDate && today <= policyEndDate
      ? "active"
      : today < policyStartDate
      ? "pending"
      : "expired";

  assignment.assignedDate = today;

  assignment.notes = `Agent assigned on ${today.toISOString()}`;

  await assignment.save();

  res.status(200).json({
    status: "success",
    data: {
      assignment,
      policyPeriod: {
        startDate: policyStartDate,
        endDate: policyEndDate,
        currentStatus: assignment.status,
      },
    },
  });
});
exports.findAvailableAgentsForAssignment = catchAsync(
  async (req, res, next) => {
    const { assignmentId } = req.params;

    const assignment = await InsuranceAssignment.findById(assignmentId);

    if (!assignment) {
      return next(new AppError("Insurance assignment not found", 404));
    }

    const availableAgents =
      await InsuranceAssignment.findAvailableAgentsInRegion(
        assignment.region.state,
        assignment.region.district
      );

    res.status(200).json({
      status: "success",
      data: { agents: availableAgents },
    });
  }
);

exports.getInsuranceAssignments = catchAsync(async (req, res, next) => {
  const { status, state, district } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (state) filter["region.state"] = state;
  if (district) filter["region.district"] = district;

  const assignments = await InsuranceAssignment.find(filter)
    .populate("farmer", "name email phone")
    .populate("insurancePolicy", "name cropType")
    .populate("agent", "name email phone");

  res.status(200).json({
    status: "success",
    results: assignments.length,
    data: { assignments },
  });
});
