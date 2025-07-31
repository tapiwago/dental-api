const AnalyticsService = require('../services/analyticsService');

exports.getOnboardingAnalytics = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      championId: req.query.championId,
      clientId: req.query.clientId
    };
    
    const analytics = await AnalyticsService.getOnboardingAnalytics(filters);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTaskAnalytics = async (req, res) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      championId: req.query.championId,
      stageId: req.query.stageId
    };
    
    const analytics = await AnalyticsService.getTaskAnalytics(filters);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    
    const performance = await AnalyticsService.getUserPerformance(userId, filters);
    res.json(performance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGuideAnalytics = async (req, res) => {
  try {
    const filters = {
      guideFilters: {
        status: req.query.status,
        category: req.query.category,
        industryType: req.query.industryType
      }
    };
    
    const analytics = await AnalyticsService.getGuideAnalytics(filters);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const { userId, role } = req.query;
    
    // Get different data based on user role
    const promises = [
      AnalyticsService.getOnboardingAnalytics(),
      AnalyticsService.getTaskAnalytics()
    ];
    
    if (userId) {
      promises.push(AnalyticsService.getUserPerformance(userId));
    }
    
    if (role === 'Admin' || role === 'Senior Champion') {
      promises.push(AnalyticsService.getGuideAnalytics());
    }
    
    const [onboardingAnalytics, taskAnalytics, userPerformance, guideAnalytics] = await Promise.all(promises);
    
    const summary = {
      onboarding: onboardingAnalytics.summary,
      tasks: taskAnalytics.summary,
      userPerformance: userPerformance?.metrics,
      guides: guideAnalytics ? {
        totalGuides: guideAnalytics.length,
        averageRating: guideAnalytics.reduce((sum, g) => sum + g.metrics.averageRating, 0) / guideAnalytics.length || 0,
        totalAssignments: guideAnalytics.reduce((sum, g) => sum + g.metrics.totalAssignments, 0)
      } : null
    };
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
