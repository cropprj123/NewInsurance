const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const InsuranceAssignment = require("../models/assignmentModel");
const InsurancePolicy = require("../models/insuranceModel");
const PolicyEnrollment = require("../models/farmvisitTrackingModel");
const Claim = require("../models/claimModel");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // Get current date for calculations
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Parallel execution of all queries for better performance
  const [
    assignments,
    policies,
    enrollments,
    claims,
    payments,
    users,
    monthlyPayments,
    monthlyEnrollments
  ] = await Promise.all([
    // Basic counts
    InsuranceAssignment.find(),
    InsurancePolicy.find(),
    PolicyEnrollment.find(),
    Claim.find(),
    Payment.find(),
    User.find(),

    // Monthly revenue data
    Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$paymentDetails.amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Monthly enrollment data
    PolicyEnrollment.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Process users by role
  const usersByRole = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  // Process claims by status
  const claimsByStatus = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {});

  // Process assignments by region
  const assignmentsByRegion = assignments.reduce((acc, assignment) => {
    const region = `${assignment.region.state}-${assignment.region.district}`;
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  // Calculate total revenue
  const totalRevenue = payments.reduce((sum, payment) => 
    sum + (payment.paymentDetails?.amount || 0), 0
  );

  // Process policy distribution by crop category
  const policyDistribution = {};
  policies.forEach(policy => {
    policy.cropDetails.forEach(detail => {
      policyDistribution[detail.cropCategory] = 
        (policyDistribution[detail.cropCategory] || 0) + 1;
    });
  });

  // Format monthly data
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const revenueData = Array(12).fill(0);
  monthlyPayments.forEach(item => {
    revenueData[item._id - 1] = item.total;
  });

  const enrollmentData = Array(12).fill(0);
  monthlyEnrollments.forEach(item => {
    enrollmentData[item._id - 1] = item.count;
  });

  // Calculate performance metrics
  const activeAssignments = assignments.filter(a => a.status === "assigned").length;
  const completionRate = (activeAssignments / assignments.length) * 100;
  const averagePremium = totalRevenue / enrollments.length || 0;

  res.status(200).json({
    status: "success",
    data: {
      overview: {
        totalFarmers: usersByRole.user || 0,
        totalAgents: usersByRole.agent || 0,
        totalPolicies: policies.length,
        totalRevenue,
        pendingClaims: claimsByStatus.pending || 0,
        approvedClaims: claimsByStatus.approved || 0
      },
      performance: {
        completionRate: Math.round(completionRate * 100) / 100,
        averagePremium: Math.round(averagePremium * 100) / 100,
        activeAssignments,
        totalEnrollments: enrollments.length
      },
      trends: {
        revenue: {
          labels: monthNames,
          data: revenueData
        },
        enrollments: {
          labels: monthNames,
          data: enrollmentData
        }
      },
      distribution: {
        policies: policyDistribution,
        regions: assignmentsByRegion,
        claims: claimsByStatus
      }
    }
  });
});

exports.getRegionalStats = catchAsync(async (req, res, next) => {
  const { state, district } = req.query;

  const matchStage = {};
  if (state) matchStage["region.state"] = state;
  if (district) matchStage["region.district"] = district;

  const stats = await InsuranceAssignment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          state: "$region.state",
          district: "$region.district"
        },
        totalAssignments: { $sum: 1 },
        pendingAssignments: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
        },
        completedAssignments: {
          $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        state: "$_id.state",
        district: "$_id.district",
        totalAssignments: 1,
        pendingAssignments: 1,
        completedAssignments: 1,
        completionRate: {
          $multiply: [
            { $divide: ["$completedAssignments", "$totalAssignments"] },
            100
          ]
        }
      }
    },
    { $sort: { totalAssignments: -1 } }
  ]);

  if (!stats.length) {
    return next(new AppError("No statistics found for the specified region", 404));
  }

  res.status(200).json({
    status: "success",
    results: stats.length,
    data: { stats }
  });
});

exports.getAgentPerformance = catchAsync(async (req, res, next) => {
  const { agentId } = req.params;

  const agent = await User.findById(agentId);
  if (!agent || agent.role !== "agent") {
    return next(new AppError("Agent not found", 404));
  }

  const [assignments, enrollments] = await Promise.all([
    InsuranceAssignment.find({ agent: agentId }),
    PolicyEnrollment.find({ agent: agentId })
  ]);

  const completedAssignments = assignments.filter(a => a.status === "assigned").length;
  const totalAssignments = assignments.length;
  const completionRate = (completedAssignments / totalAssignments) * 100 || 0;

  const averageResponseTime = assignments.reduce((sum, assignment) => {
    if (assignment.assignedDate && assignment.applicationDate) {
      return sum + (assignment.assignedDate - assignment.applicationDate);
    }
    return sum;
  }, 0) / completedAssignments || 0;

  res.status(200).json({
    status: "success",
    data: {
      agentName: agent.name,
      totalAssignments,
      completedAssignments,
      completionRate: Math.round(completionRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime / (1000 * 60 * 60 * 24) * 100) / 100, // in days
      totalEnrollments: enrollments.length
    }
  });
}); 