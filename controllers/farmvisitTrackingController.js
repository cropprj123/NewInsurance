// farmVisitTrackingController.js
const FarmVisitTracking = require("../models/farmvisitTrackingModel");
const InsuranceAssignment = require("../models/assignmentModel");
const FarmVisit = require("../models/userLocationModel");

exports.createFarmVisitTracking = async (req, res) => {
  try {
    const {
      insuranceAssignmentId,
      farmVisitId,
      environmentalConditions,
      farmDetails,
    } = req.body;

    const insuranceAssignment = await InsuranceAssignment.findById(
      insuranceAssignmentId
    )
      .populate("farmer")
      .populate("insurancePolicy")
      .populate("agent");

    if (!insuranceAssignment) {
      return res.status(404).json({
        status: "error",
        message: "Insurance Assignment not found",
      });
    }

    const farmVisitTracking = await FarmVisitTracking.create({
      insuranceAssignment: insuranceAssignmentId,
      farmVisit: farmVisitId,
      agent: insuranceAssignment.agent._id,
      farmer: insuranceAssignment.farmer._id,
      insurancePolicy: insuranceAssignment.insurancePolicy._id,
      environmentalConditions,
      farmDetails,
    });

    res.status(201).json({
      status: "success",
      data: farmVisitTracking,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getFarmVisitTrackingByAssignment = async (req, res) => {
  try {
    const { insuranceAssignmentId } = req.params;

    const farmVisitTracking = await FarmVisitTracking.findOne({
      insuranceAssignment: insuranceAssignmentId,
    }).populate("insuranceAssignment farmer agent farmVisit");

    if (!farmVisitTracking) {
      return res.status(404).json({
        status: "error",
        message: "No farm visit tracking found for this assignment",
      });
    }

    res.status(200).json({
      status: "success",
      data: farmVisitTracking,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getAllFarmVisitTrackings = async (req, res) => {
  try {
    const {
      status,
      isEligible,
      agent,
      farmer,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (isEligible !== undefined)
      filter["eligibilityAssessment.isEligible"] = isEligible === "true";
    if (agent) filter.agent = agent;
    if (farmer) filter.farmer = farmer;

    const farmVisitTrackings = await FarmVisitTracking.find(filter)
      .populate("insuranceAssignment farmer agent farmVisit")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await FarmVisitTracking.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: farmVisitTrackings.length,
      total,
      data: farmVisitTrackings,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateFarmVisitTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const farmVisitTracking = await FarmVisitTracking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!farmVisitTracking) {
      return res.status(404).json({
        status: "error",
        message: "Farm visit tracking not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: farmVisitTracking,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteFarmVisitTracking = async (req, res) => {
  try {
    const { id } = req.params;

    const farmVisitTracking = await FarmVisitTracking.findByIdAndDelete(id);

    if (!farmVisitTracking) {
      return res.status(404).json({
        status: "error",
        message: "Farm visit tracking not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getIneligibleFarmVisitTrackings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = { "eligibilityAssessment.isEligible": false };

    const ineligibleTrackings = await FarmVisitTracking.find(filter)
      .populate("insuranceAssignment farmer agent farmVisit")
      .select("insuranceAssignment farmer ineligibilityReasons")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await FarmVisitTracking.countDocuments(filter);

    res.status(200).json({
      status: "success",
      results: ineligibleTrackings.length,
      total,
      data: ineligibleTrackings,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
