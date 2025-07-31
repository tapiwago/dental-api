const GuideStep = require('../models/GuideStep');

exports.create = async (req, res) => {
  try {
    const step = new GuideStep(req.body);
    await step.save();
    res.status(201).json(step);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const steps = await GuideStep.find();
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const step = await GuideStep.findById(req.params.id);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const step = await GuideStep.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json(step);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const step = await GuideStep.findByIdAndDelete(req.params.id);
    if (!step) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
