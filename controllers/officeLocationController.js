const OfficeLocation = require('../models/OfficeLocation');

// Create a new office location
exports.createOfficeLocation = async (req, res) => {
  try {
    const office = new OfficeLocation(req.body);
    await office.save();
    res.status(201).json(office);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all office locations
exports.getOfficeLocations = async (req, res) => {
  try {
    const offices = await OfficeLocation.find();
    res.json(offices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single office location by ID
exports.getOfficeLocationById = async (req, res) => {
  try {
    const office = await OfficeLocation.findById(req.params.id);
    if (!office) return res.status(404).json({ error: 'Office location not found' });
    res.json(office);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an office location
exports.updateOfficeLocation = async (req, res) => {
  try {
    const office = await OfficeLocation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!office) return res.status(404).json({ error: 'Office location not found' });
    res.json(office);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an office location
exports.deleteOfficeLocation = async (req, res) => {
  try {
    const office = await OfficeLocation.findByIdAndDelete(req.params.id);
    if (!office) return res.status(404).json({ error: 'Office location not found' });
    res.json({ message: 'Office location deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
