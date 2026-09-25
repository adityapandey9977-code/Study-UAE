const { Router } = require("express");
const router = Router({ mergeParams: true });
const db = require("../libraries/db");
const { currentDT } = require("../util/common.util");
const { sendEmail } = require("../util/common.util");

class SuperAdminEmailCtrl {
    
    static sendEmailToStudent = async (req, res) => {
        try {
            const {issue_id, subject, message, template_id } = req.body;

            // if (!student_id) {
            //     return res.status(400).json({ message: "Student ID is required" });
            // }

            if (!issue_id) {
                return res.status(400).json({ message: "Issue ID is required" });
            }

            // Get student issue details first (to get student_id)
            const issueRecord = await db.knex("student_issues")
                .select("student_id", "status", "description", "cat_id")
                .where({ id: issue_id })
                .first();

            if (!issueRecord) {
                return res.status(404).json({ message: "Issue not found" });
            }

            // Use student_id from the 
            const student_id = issueRecord.student_id;

            // Verify Super Admin access
            if (!req.currentUser || !req.currentUser.isClient) {
                return res.status(403).json({ message: "Only Super Admin can send emails" });
            }

            // Get student details
            const student = await db.knex("students as s")
                .select("u.name", "u.email", "s.regno")
                .join("users as u", "u.id", "s.user_id")
                .where({ "s.id": student_id })
                .first();

            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }

            // Get student issue details

            const issue = await db.knex("student_issues")
                .select("status", "cat_id","description")
                .where({ id: issue_id, student_id })
                .first();
            if (!issue) {
                return res.status(404).json({ message: "Student issue not found" });
            }
           
            // Prepare email content

            let emailContent = message || `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Query Resolved - Study India Scholarship</h2>
                    
                    <p>Dear <strong>${student.name}</strong>,</p>
                    <p>We are pleased to inform you that your query has been successfully resolved.</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #495057; margin-top: 0;">Query Details:</h3>
                        <p><strong>Registration Number:</strong> ${student.regno}</p>
                        <p><strong>Description:</strong> ${issue.description}</p>
                        <p><strong>Status:</strong> <span style="color: #28a745;">${issue.status}</span></p>
                    </div>
                    
                    <p>If you have any further questions or need additional assistance, please don't hesitate to contact us.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                        <p style="margin: 0; color: #6c757d;">Best regards,<br>
                        <strong>Study India Scholarship Team</strong><br>
                        <a href="mailto:support@studyindiascholarship.com">support@studyindiascholarship.com</a></p>
                    </div>
                </div>
            `;

            // Send actual email using existing sendEmail function
            const emailResult = await sendEmail(
                student.email,
                subject || `Query Resolved`,
                emailContent,
                'Study India Scholarship',
                'studyindiascholarships@gmail.com'
            );

            // DO NOT update issue status here - it should already be updated by the setIssueStatus endpoint
            // The status was already set to "Closed" before this email function was called

            console.log(`[SuperAdmin] Email sent to student ${student_id}: ${subject}`);

            return res.status(200).json({ 
                message: "Email sent successfully",
                result: {
                    student_name: student.name,
                    student_email: student.email,
                    subject: subject || `Query Resolved`,
                    issue_description: issue.description,
                    issue_status: issue.status, // Return the current status, don't change it
                    email_result: emailResult
                }
            });

        } catch (e) {
            console.error('[SuperAdminEmail] Error:', e?.message || e);
            return res.status(400).json({ message: e.message || 'Error sending email' });
        }
    }
 
}

router.post('/send-email/student', SuperAdminEmailCtrl.sendEmailToStudent);

module.exports = router;
