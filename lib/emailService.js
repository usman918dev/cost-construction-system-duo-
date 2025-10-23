import nodemailer from 'nodemailer';

// Email configuration - Add these to your .env.local
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@constructionmanagement.com';

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT == 465, // true for 465, false for other ports
      auth: EMAIL_USER && EMAIL_PASS ? {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      } : undefined,
    });
  }
  return transporter;
}

/**
 * Send budget alert email
 */
export async function sendBudgetAlertEmail(to, projectName, percentUsed, totalSpent, totalBudget) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('Email not configured, skipping email notification');
      return null;
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: to,
      subject: `Budget Alert: ${projectName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Budget Alert</h2>
          <p>The project <strong>${projectName}</strong> has reached <strong>${percentUsed}%</strong> of its budget.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Budget:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${totalBudget.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Amount Spent:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${totalSpent.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Remaining:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">$${(totalBudget - totalSpent).toLocaleString()}</td>
            </tr>
          </table>
          <p style="color: #dc2626;">Please review the project expenses and take necessary action.</p>
        </div>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('Budget alert email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending budget alert email:', error);
    return null;
  }
}

/**
 * Send weekly/monthly report email
 */
export async function sendReportEmail(to, reportType, reportData, attachmentBuffer) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('Email not configured, skipping email notification');
      return null;
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: to,
      subject: `${reportType} Construction Cost Report`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your ${reportType} Report is Ready</h2>
          <p>Please find attached your ${reportType.toLowerCase()} construction cost management report.</p>
          <p>Report Summary:</p>
          <ul>
            <li>Total Projects: ${reportData.totalProjects || 0}</li>
            <li>Total Spent: $${(reportData.totalSpent || 0).toLocaleString()}</li>
            <li>Active Purchases: ${reportData.totalPurchases || 0}</li>
          </ul>
          <p>For detailed information, please see the attached Excel file.</p>
        </div>
      `,
      attachments: attachmentBuffer ? [
        {
          filename: `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.xlsx`,
          content: attachmentBuffer,
        },
      ] : [],
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('Report email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending report email:', error);
    return null;
  }
}

/**
 * Send general notification email
 */
export async function sendNotificationEmail(to, subject, message) {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      console.log('Email not configured, skipping email notification');
      return null;
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from Construction Cost Management System.
          </p>
        </div>
      `,
    };

    const info = await getTransporter().sendMail(mailOptions);
    console.log('Notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending notification email:', error);
    return null;
  }
}
