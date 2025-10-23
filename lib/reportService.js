import Purchase from '@/models/Purchase';
import Project from '@/models/Project';
import User from '@/models/User';
import mongoose from 'mongoose';
import { exportPurchasesToExcel } from './exportService';
import { sendReportEmail } from './emailService';

/**
 * Generate daily report for a company
 */
export async function generateDailyReport(companyId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const purchases = await Purchase.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      purchaseDate: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);

    return {
      period: 'Daily',
      date: today.toISOString().split('T')[0],
      totalPurchases: purchases.length,
      totalSpent: totalSpent,
      purchases: purchases,
    };
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
}

/**
 * Generate weekly report for a company
 */
export async function generateWeeklyReport(companyId) {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const purchases = await Purchase.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      purchaseDate: {
        $gte: weekAgo,
        $lte: today,
      },
    }).populate('projectId itemId vendorId');

    const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);

    const projects = await Project.find({ companyId: new mongoose.Types.ObjectId(companyId) });

    return {
      period: 'Weekly',
      startDate: weekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      totalPurchases: purchases.length,
      totalSpent: totalSpent,
      totalProjects: projects.length,
      purchases: purchases,
    };
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
}

/**
 * Generate monthly report for a company
 */
export async function generateMonthlyReport(companyId) {
  try {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const purchases = await Purchase.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      purchaseDate: {
        $gte: monthAgo,
        $lte: today,
      },
    }).populate('projectId itemId vendorId');

    const totalSpent = purchases.reduce((sum, p) => sum + p.totalCost, 0);

    const projects = await Project.find({ companyId: new mongoose.Types.ObjectId(companyId) });

    return {
      period: 'Monthly',
      startDate: monthAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      totalPurchases: purchases.length,
      totalSpent: totalSpent,
      totalProjects: projects.length,
      purchases: purchases,
    };
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
}

/**
 * Send scheduled report to users
 */
export async function sendScheduledReport(companyId, reportType = 'weekly') {
  try {
    let reportData;
    
    if (reportType === 'daily') {
      reportData = await generateDailyReport(companyId);
    } else if (reportType === 'weekly') {
      reportData = await generateWeeklyReport(companyId);
    } else if (reportType === 'monthly') {
      reportData = await generateMonthlyReport(companyId);
    } else {
      throw new Error('Invalid report type');
    }

    // Get all admins and managers
    const users = await User.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      role: { $in: ['admin', 'manager'] },
    });

    // Generate Excel file
    const workbook = await exportPurchasesToExcel({}, companyId);
    const buffer = await workbook.xlsx.writeBuffer();

    // Send email to each user
    for (const user of users) {
      await sendReportEmail(
        user.email,
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`,
        reportData,
        buffer
      );
    }

    return {
      success: true,
      reportType,
      userCount: users.length,
      reportData,
    };
  } catch (error) {
    console.error('Error sending scheduled report:', error);
    throw error;
  }
}
