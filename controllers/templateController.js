const Template = require('../models/Template');

exports.create = async (req, res) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { 
      type, 
      status, 
      industryType, 
      clientSize, 
      complexity,
      isDefault,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const filter = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (industryType) filter.industryType = industryType;
    if (clientSize) filter.clientSize = clientSize;
    if (complexity) filter.complexity = complexity;
    if (isDefault !== undefined) filter.isDefault = isDefault === 'true';
    
    const templates = await Template.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Template.countDocuments(filter);
    
    res.json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .populate('parentTemplateId')
      .populate('childTemplates')
      .populate('relatedTemplates');
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.clone = async (req, res) => {
  try {
    const originalTemplate = await Template.findById(req.params.id);
    if (!originalTemplate) return res.status(404).json({ error: 'Template not found' });
    
    const { name, description } = req.body;
    
    const clonedTemplate = new Template({
      ...originalTemplate.toObject(),
      _id: undefined,
      templateId: `${originalTemplate.templateId}_copy_${Date.now()}`,
      name: name || `${originalTemplate.name} (Copy)`,
      description: description || `Copy of ${originalTemplate.description}`,
      parentTemplateId: originalTemplate._id,
      status: 'Draft',
      usageCount: 0,
      isDefault: false,
      createdBy: req.body.createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await clonedTemplate.save();
    res.status(201).json(clonedTemplate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const template = await Template.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'Published',
        approvedBy,
        approvalDate: new Date()
      }, 
      { new: true }
    );
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.setAsDefault = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    
    // Unset current default template of the same type
    await Template.updateMany(
      { type: template.type, isDefault: true },
      { isDefault: false }
    );
    
    // Set this template as default
    template.isDefault = true;
    await template.save();
    
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { industryType, clientSize, complexity, type } = req.query;
    
    const filter = {
      status: 'Published',
      type: type || 'OnboardingCase'
    };
    
    if (industryType) filter.industryType = { $in: [industryType, 'General'] };
    if (clientSize) filter.clientSize = { $in: [clientSize, 'Medium'] };
    if (complexity) filter.complexity = { $in: [complexity, 'Standard'] };
    
    const recommendations = await Template.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ 
        isDefault: -1, 
        successRate: -1, 
        usageCount: -1 
      })
      .limit(5);
    
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUsageStats = async (req, res) => {
  try {
    const { success, completionTime } = req.body;
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    
    template.usageCount += 1;
    
    if (success !== undefined) {
      const totalSuccesses = Math.round((template.successRate * (template.usageCount - 1)) / 100);
      const newSuccesses = success ? totalSuccesses + 1 : totalSuccesses;
      template.successRate = Math.round((newSuccesses / template.usageCount) * 100);
    }
    
    if (completionTime && template.averageCompletionTime) {
      template.averageCompletionTime = Math.round(
        ((template.averageCompletionTime * (template.usageCount - 1)) + completionTime) / template.usageCount
      );
    } else if (completionTime) {
      template.averageCompletionTime = completionTime;
    }
    
    await template.save();
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
