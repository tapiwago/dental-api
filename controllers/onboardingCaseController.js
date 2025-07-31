const OnboardingCase = require('../models/OnboardingCase');

exports.create = async (req, res) => {
  try {
    const onboardingCase = new OnboardingCase(req.body);
    await onboardingCase.save();
    res.status(201).json(onboardingCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const cases = await OnboardingCase.find();
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findById(req.params.id);
    if (!onboardingCase) return res.status(404).json({ error: 'Not found' });
    res.json(onboardingCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!onboardingCase) return res.status(404).json({ error: 'Not found' });
    res.json(onboardingCase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const onboardingCase = await OnboardingCase.findByIdAndDelete(req.params.id);
    if (!onboardingCase) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
