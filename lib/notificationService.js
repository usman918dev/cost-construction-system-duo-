import Notification from '@/models/Notification';
import Project from '@/models/Project';
import Purchase from '@/models/Purchase';
import User from '@/models/User';
import mongoose from 'mongoose';

/**
 * Check if project budget is exceeded and create alerts
 */
export async function checkProjectBudgetAlerts(projectId, companyId) {
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    // Calculate total spent
    const purchases = await Purchase.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId), companyId: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: null, totalSpent: { $sum: '$totalCost' } } },
    ]);

    const totalSpent = purchases.length > 0 ? purchases[0].totalSpent : 0;
    const percentUsed = (totalSpent / project.totalBudget) * 100;

    // Get all admins and managers for this company
    const users = await User.find({ 
      companyId, 
      role: { $in: ['admin', 'manager'] } 
    });

    // Alert at 80%, 90%, 100%, and 110%
    const thresholds = [
      { percent: 80, severity: 'warning', message: 'has reached 80% of budget' },
      { percent: 90, severity: 'warning', message: 'has reached 90% of budget' },
      { percent: 100, severity: 'error', message: 'has reached 100% of budget' },
      { percent: 110, severity: 'error', message: 'has exceeded budget by 10%' },
    ];

    for (const threshold of thresholds) {
      if (percentUsed >= threshold.percent) {
        // Check if alert already exists for this threshold
        const existingAlert = await Notification.findOne({
          companyId,
          type: 'Budget Alert',
          'relatedEntity.entityId': projectId,
          message: { $regex: threshold.message },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        });

        if (!existingAlert) {
          // Create notifications for all admins/managers
          const notifications = users.map(user => ({
            userId: user._id,
            companyId,
            type: 'Budget Alert',
            title: `Budget Alert: ${project.name}`,
            message: `Project "${project.name}" ${threshold.message}. Total spent: $${totalSpent.toLocaleString()} of $${project.totalBudget.toLocaleString()}`,
            severity: threshold.severity,
            relatedEntity: {
              entityType: 'Project',
              entityId: projectId,
            },
            actionUrl: `/projects/${projectId}`,
          }));

          await Notification.insertMany(notifications);
        }
      }
    }
  } catch (error) {
    console.error('Error checking project budget alerts:', error);
  }
}

/**
 * Create notification for all users
 */
export async function createNotification(data) {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Bulk create notifications for multiple users
 */
export async function createBulkNotifications(notifications) {
  try {
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
}
