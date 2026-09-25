const { Router } = require("express");
const router = Router({ mergeParams: true });
const db = require("../libraries/db");

class IssueTypeCountCtrl {
  static getIssuesByTypeAndStatus = async (req, res) => {
    try {
      // Verify Super Admin access (commented out for testing)
      // if (!req.currentUser || !req.currentUser.isClient) {
      //     return res.status(403).json({ message: "Only Super Admin can access this endpoint" });
      // }

      // Get student issues grouped by status
      const studentIssuesByStatus = await db.knex("student_issues")
        .select([
          'status',
          db.knex.raw('COUNT(*) as issue_count')
        ])
        .groupBy('status')
        .orderBy('status');

      // Get institute issues grouped by status (if table exists)
      let instituteIssuesByStatus = [];
      let instituteTableExists = false;
      try {
        instituteIssuesByStatus = await db.knex("institute_issues")
          .select([
            'status',
            db.knex.raw('COUNT(*) as issue_count')
          ])
          .groupBy('status')
          .orderBy('status');
        instituteTableExists = true;
      } catch (e) {
        console.log('Institute issues table not found, skipping...');
      }

      // Format student issues data
      const studentStatusCounts = {};
      let totalStudentIssues = 0;
      studentIssuesByStatus.forEach(item => {
        studentStatusCounts[item.status] = parseInt(item.issue_count);
        totalStudentIssues += parseInt(item.issue_count);
      });

      // Format institute issues data
      const instituteStatusCounts = {};
      let totalInstituteIssues = 0;
      instituteIssuesByStatus.forEach(item => {
        instituteStatusCounts[item.status] = parseInt(item.issue_count);
        totalInstituteIssues += parseInt(item.issue_count);
      });

      // Get all possible statuses from both tables
      const allStatuses = new Set([
        ...Object.keys(studentStatusCounts),
        ...Object.keys(instituteStatusCounts)
      ]);

      // Create comprehensive breakdown
      const breakdown = {};
      allStatuses.forEach(status => {
        breakdown[status] = {
          student_issues: studentStatusCounts[status] || 0,
          institute_issues: instituteStatusCounts[status] || 0,
          total: (studentStatusCounts[status] || 0) + (instituteStatusCounts[status] || 0)
        };
      });

      // Calculate totals
      const grandTotal = totalStudentIssues + totalInstituteIssues;

      return res.status(200).json({
        message: "Issues divided by type and status retrieved successfully",
        result: {
          student_issues: {
            by_status: studentStatusCounts,
            total: totalStudentIssues,
            percentage: grandTotal > 0 ? ((totalStudentIssues / grandTotal) * 100).toFixed(2) : 0
          },
          institute_issues: {
            by_status: instituteStatusCounts,
            total: totalInstituteIssues,
            percentage: grandTotal > 0 ? ((totalInstituteIssues / grandTotal) * 100).toFixed(2) : 0,
            table_exists: instituteTableExists
          },
          breakdown_by_status: breakdown,
          summary: {
            grand_total: grandTotal,
            total_statuses: allStatuses.size,
            institute_table_exists: instituteTableExists
          }
        }
      });
    } catch (e) {
      console.error('[IssueTypeCount] Error:', e?.message || e);
      return res.status(400).json({ message: e.message || 'Error retrieving issues by type and status' });
    }
  }

  static getDetailedTypeBreakdown = async (req, res) => {
    try {
      // Verify Super Admin access (commented out for testing)
      // if (!req.currentUser || !req.currentUser.isClient) {
      //     return res.status(403).json({ message: "Only Super Admin can access this endpoint" });
      // }

      // Get detailed student issues with additional info
      const studentIssuesDetails = await db.knex({ si: 'student_issues' })
        .select([
          'si.status',
          db.knex.raw('COUNT(*) as count'),
          db.knex.raw('COUNT(DISTINCT si.student_id) as unique_students'),
          db.knex.raw('DATE_FORMAT(MIN(si.created), "%Y-%m-%d") as first_issue'),
          db.knex.raw('DATE_FORMAT(MAX(si.created), "%Y-%m-%d") as last_issue')
        ])
        .groupBy('si.status')
        .orderBy('si.status');

      // Get detailed institute issues with additional info
      let instituteIssuesDetails = [];
      let instituteTableExists = false;
      try {
        instituteIssuesDetails = await db.knex({ ii: 'institute_issues' })
          .select([
            'ii.status',
            db.knex.raw('COUNT(*) as count'),
            db.knex.raw('COUNT(DISTINCT ii.institute_id) as unique_institutes'),
            db.knex.raw('DATE_FORMAT(MIN(ii.created), "%Y-%m-%d") as first_issue'),
            db.knex.raw('DATE_FORMAT(MAX(ii.created), "%Y-%m-%d") as last_issue')
          ])
          .groupBy('ii.status')
          .orderBy('ii.status');
        instituteTableExists = true;
      } catch (e) {
        console.log('Institute issues table not found, skipping...');
      }

      // Get monthly trends for both types
      const studentMonthlyTrends = await db.knex("student_issues")
        .select([
          db.knex.raw('DATE_FORMAT(created, "%Y-%m") as month'),
          db.knex.raw('COUNT(*) as count'),
          db.knex.raw('"student" as issue_type')
        ])
        .groupBy(db.knex.raw('DATE_FORMAT(created, "%Y-%m")'))
        .orderBy('month', 'desc')
        .limit(12);

      let instituteMonthlyTrends = [];
      if (instituteTableExists) {
        instituteMonthlyTrends = await db.knex("institute_issues")
          .select([
            db.knex.raw('DATE_FORMAT(created, "%Y-%m") as month'),
            db.knex.raw('COUNT(*) as count'),
            db.knex.raw('"institute" as issue_type')
          ])
          .groupBy(db.knex.raw('DATE_FORMAT(created, "%Y-%m")'))
          .orderBy('month', 'desc')
          .limit(12);
      }

      // Combine monthly trends
      const allMonthlyTrends = [...studentMonthlyTrends, ...instituteMonthlyTrends]
        .sort((a, b) => b.month.localeCompare(a.month));

      return res.status(200).json({
        message: "Detailed issue type breakdown retrieved successfully",
        result: {
          student_issues: {
            details: studentIssuesDetails,
            total: studentIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0)
          },
          institute_issues: {
            details: instituteIssuesDetails,
            total: instituteIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0),
            table_exists: instituteTableExists
          },
          monthly_trends: allMonthlyTrends,
          summary: {
            total_student_issues: studentIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0),
            total_institute_issues: instituteIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0),
            grand_total: studentIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0) +
              instituteIssuesDetails.reduce((sum, item) => sum + parseInt(item.count), 0)
          }
        }
      });
    } catch (e) {
      console.error('[IssueTypeCount] Error:', e?.message || e);
      return res.status(400).json({ message: e.message || 'Error retrieving detailed issue type breakdown' });
    }
  }

  static getTypeComparison = async (req, res) => {
    try {
      // Verify Super Admin access (commented out for testing)
      // if (!req.currentUser || !req.currentUser.isClient) {
      //     return res.status(403).json({ message: "Only Super Admin can access this endpoint" });
      // }

      // Get total counts for comparison
      const totalStudentIssues = await db.knex("student_issues")
        .count('* as count')
        .first();

      let totalInstituteIssues = { count: 0 };
      let instituteTableExists = false;
      try {
        totalInstituteIssues = await db.knex("institute_issues")
          .count('* as count')
          .first();
        instituteTableExists = true;
      } catch (e) {
        console.log('Institute issues table not found, skipping...');
      }

      const studentCount = parseInt(totalStudentIssues.count);
      const instituteCount = parseInt(totalInstituteIssues.count);
      const grandTotal = studentCount + instituteCount;

      // Get status comparison
      const studentStatusCounts = await db.knex("student_issues")
        .select('status')
        .count('* as count')
        .groupBy('status');

      let instituteStatusCounts = [];
      if (instituteTableExists) {
        instituteStatusCounts = await db.knex("institute_issues")
          .select('status')
          .count('* as count')
          .groupBy('status');
      }

      // Create comparison matrix
      const comparison = {
        student_issues: {
          total: studentCount,
          percentage: grandTotal > 0 ? ((studentCount / grandTotal) * 100).toFixed(2) : 0,
          status_breakdown: studentStatusCounts.reduce((acc, item) => {
            acc[item.status] = {
              count: parseInt(item.count),
              percentage: studentCount > 0 ? ((parseInt(item.count) / studentCount) * 100).toFixed(2) : 0
            };
            return acc;
          }, {})
        },
        institute_issues: {
          total: instituteCount,
          percentage: grandTotal > 0 ? ((instituteCount / grandTotal) * 100).toFixed(2) : 0,
          status_breakdown: instituteStatusCounts.reduce((acc, item) => {
            acc[item.status] = {
              count: parseInt(item.count),
              percentage: instituteCount > 0 ? ((parseInt(item.count) / instituteCount) * 100).toFixed(2) : 0
            };
            return acc;
          }, {}),
          table_exists: instituteTableExists
        },
        overall: {
          grand_total: grandTotal,
          student_vs_institute_ratio: instituteCount > 0 ? (studentCount / instituteCount).toFixed(2) : 'N/A'
        }
      };

      return res.status(200).json({
        message: "Issue type comparison retrieved successfully",
        result: comparison
      });
    } catch (e) {
      console.error('[IssueTypeCount] Error:', e?.message || e);
      return res.status(400).json({ message: e.message || 'Error retrieving issue type comparison' });
    }
  }
}

// Routes
router.get('/type-status', IssueTypeCountCtrl.getIssuesByTypeAndStatus);
router.get('/detailed-breakdown', IssueTypeCountCtrl.getDetailedTypeBreakdown);
router.get('/comparison', IssueTypeCountCtrl.getTypeComparison);

module.exports = router;
