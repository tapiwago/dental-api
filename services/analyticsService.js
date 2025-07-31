/**
 * Analytics and reporting service for onboarding metrics
 */
class AnalyticsService {
  
  /**
   * Get onboarding case analytics
   */
  static async getOnboardingAnalytics(filters = {}) {
    const OnboardingCase = require('../models/OnboardingCase');
    const Task = require('../models/Task');
    const Stage = require('../models/Stage');
    
    const { startDate, endDate, championId, clientId } = filters;
    
    // Build filter query
    const query = {};
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    if (championId) query.assignedChampion = championId;
    if (clientId) query.clientId = clientId;
    
    const [
      totalCases,
      completedCases,
      inProgressCases,
      averageCompletionTime,
      casesByStatus,
      casesByPriority
    ] = await Promise.all([
      OnboardingCase.countDocuments(query),
      OnboardingCase.countDocuments({ ...query, status: 'Completed' }),
      OnboardingCase.countDocuments({ ...query, status: 'In Progress' }),
      this.calculateAverageCompletionTime(query),
      this.getCasesByStatus(query),
      this.getCasesByPriority(query)
    ]);
    
    const completionRate = totalCases > 0 ? (completedCases / totalCases * 100).toFixed(2) : 0;
    
    return {
      summary: {
        totalCases,
        completedCases,
        inProgressCases,
        completionRate: parseFloat(completionRate),
        averageCompletionTime
      },
      distributions: {
        byStatus: casesByStatus,
        byPriority: casesByPriority
      }
    };
  }
  
  /**
   * Get task performance analytics
   */
  static async getTaskAnalytics(filters = {}) {
    const Task = require('../models/Task');
    
    const { startDate, endDate, championId, stageId } = filters;
    
    const query = {};
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
    if (championId) query.championId = championId;
    if (stageId) query.stageId = stageId;
    
    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      averageTaskTime,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: 'Completed' }),
      Task.countDocuments({ ...query, dueDate: { $lt: new Date() }, status: { $nin: ['Completed', 'Cancelled'] } }),
      this.calculateAverageTaskTime(query),
      this.getTasksByStatus(query),
      this.getTasksByPriority(query)
    ]);
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0;
    const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks * 100).toFixed(2) : 0;
    
    return {
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: parseFloat(completionRate),
        overdueRate: parseFloat(overdueRate),
        averageTaskTime
      },
      distributions: {
        byStatus: tasksByStatus,
        byPriority: tasksByPriority
      }
    };
  }
  
  /**
   * Get user performance analytics
   */
  static async getUserPerformance(userId, filters = {}) {
    const Task = require('../models/Task');
    const OnboardingCase = require('../models/OnboardingCase');
    
    const { startDate, endDate } = filters;
    
    const dateQuery = {};
    if (startDate) dateQuery.createdAt = { $gte: new Date(startDate) };
    if (endDate) dateQuery.createdAt = { ...dateQuery.createdAt, $lte: new Date(endDate) };
    
    const [
      assignedTasks,
      completedTasks,
      champinonedCases,
      averageTaskCompletion
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId, ...dateQuery }),
      Task.countDocuments({ assignedTo: userId, status: 'Completed', ...dateQuery }),
      OnboardingCase.countDocuments({ assignedChampion: userId, ...dateQuery }),
      this.calculateUserAverageTaskTime(userId, dateQuery)
    ]);
    
    const taskCompletionRate = assignedTasks > 0 ? (completedTasks / assignedTasks * 100).toFixed(2) : 0;
    
    return {
      userId,
      metrics: {
        assignedTasks,
        completedTasks,
        taskCompletionRate: parseFloat(taskCompletionRate),
        champinonedCases,
        averageTaskCompletion
      }
    };
  }
  
  /**
   * Get workflow guide effectiveness analytics
   */
  static async getGuideAnalytics(filters = {}) {
    const WorkflowGuide = require('../models/WorkflowGuide');
    const CaseGuideLink = require('../models/CaseGuideLink');
    
    const guides = await WorkflowGuide.find(filters.guideFilters || {});
    const analytics = [];
    
    for (const guide of guides) {
      const [
        totalAssignments,
        completedAssignments,
        averageRating,
        usageStats
      ] = await Promise.all([
        CaseGuideLink.countDocuments({ guideId: guide._id }),
        CaseGuideLink.countDocuments({ guideId: guide._id, status: 'Completed' }),
        CaseGuideLink.aggregate([
          { $match: { guideId: guide._id, userRating: { $exists: true } } },
          { $group: { _id: null, avgRating: { $avg: '$userRating' } } }
        ]),
        CaseGuideLink.aggregate([
          { $match: { guideId: guide._id } },
          { $group: { 
            _id: null, 
            totalViews: { $sum: '$viewCount' },
            totalTimeSpent: { $sum: '$timeSpent' },
            avgStepsCompleted: { $avg: '$stepsCompleted' }
          }}
        ])
      ]);
      
      const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments * 100).toFixed(2) : 0;
      const avgRating = averageRating.length > 0 ? averageRating[0].avgRating.toFixed(2) : 0;
      const usage = usageStats.length > 0 ? usageStats[0] : { totalViews: 0, totalTimeSpent: 0, avgStepsCompleted: 0 };
      
      analytics.push({
        guideId: guide._id,
        title: guide.title,
        metrics: {
          totalAssignments,
          completedAssignments,
          completionRate: parseFloat(completionRate),
          averageRating: parseFloat(avgRating),
          ...usage
        }
      });
    }
    
    return analytics;
  }
  
  // Helper methods
  static async calculateAverageCompletionTime(query) {
    const OnboardingCase = require('../models/OnboardingCase');
    
    const completedCases = await OnboardingCase.find({
      ...query,
      status: 'Completed',
      actualCompletionDate: { $exists: true }
    });
    
    if (completedCases.length === 0) return 0;
    
    const totalDays = completedCases.reduce((sum, case_) => {
      const days = Math.ceil((case_.actualCompletionDate - case_.startDate) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / completedCases.length);
  }
  
  static async calculateAverageTaskTime(query) {
    const Task = require('../models/Task');
    
    const completedTasks = await Task.find({
      ...query,
      status: 'Completed',
      completedDate: { $exists: true },
      startDate: { $exists: true }
    });
    
    if (completedTasks.length === 0) return 0;
    
    const totalHours = completedTasks.reduce((sum, task) => {
      const hours = Math.ceil((task.completedDate - task.startDate) / (1000 * 60 * 60));
      return sum + hours;
    }, 0);
    
    return Math.round(totalHours / completedTasks.length);
  }
  
  static async calculateUserAverageTaskTime(userId, query) {
    const Task = require('../models/Task');
    
    const userTasks = await Task.find({
      ...query,
      assignedTo: userId,
      status: 'Completed',
      actualHours: { $exists: true }
    });
    
    if (userTasks.length === 0) return 0;
    
    const totalHours = userTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
    return Math.round(totalHours / userTasks.length);
  }
  
  static async getCasesByStatus(query) {
    const OnboardingCase = require('../models/OnboardingCase');
    
    return OnboardingCase.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
  
  static async getCasesByPriority(query) {
    const OnboardingCase = require('../models/OnboardingCase');
    
    return OnboardingCase.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
  
  static async getTasksByStatus(query) {
    const Task = require('../models/Task');
    
    return Task.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
  
  static async getTasksByPriority(query) {
    const Task = require('../models/Task');
    
    return Task.aggregate([
      { $match: query },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
}

module.exports = AnalyticsService;
