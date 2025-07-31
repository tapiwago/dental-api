const WorkflowGuide = require('../models/WorkflowGuide');

exports.create = async (req, res) => {
  try {
    const guide = new WorkflowGuide(req.body);
    await guide.save();
    res.status(201).json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const guides = await WorkflowGuide.find();
    res.json(guides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const guide = await WorkflowGuide.findById(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Not found' });
    res.json(guide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const guide = await WorkflowGuide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guide) return res.status(404).json({ error: 'Not found' });
    res.json(guide);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const guide = await WorkflowGuide.findByIdAndDelete(req.params.id);
    if (!guide) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
