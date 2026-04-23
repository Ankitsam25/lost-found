const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// POST /api/items → Add item (protected)
router.post('/items', protect, async (req, res) => {
  const { itemName, description, type, category, location, date, contactInfo } = req.body;

  if (!itemName || !description || !type || !location || !contactInfo) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  try {
    const item = await Item.create({
      itemName,
      description,
      type,
      category: category || 'Other',
      location,
      date: date || Date.now(),
      contactInfo,
      reportedBy: req.user._id,
      reporterName: req.user.name
    });

    res.status(201).json({ message: 'Item reported successfully!', item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating item.' });
  }
});

// GET /api/items/search?name=xyz → Search (must be before :id route)
router.get('/items/search', async (req, res) => {
  const { name, category, type } = req.query;

  try {
    const query = {};

    if (name) {
      query.$or = [
        { itemName: { $regex: name, $options: 'i' } },
        { description: { $regex: name, $options: 'i' } },
        { location: { $regex: name, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') query.category = category;
    if (type && type !== 'All') query.type = type;

    const items = await Item.find(query).sort({ createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error during search.' });
  }
});

// GET /api/items → View all items
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// GET /api/items/:id → View item by ID
router.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json(item);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid item ID.' });
    }
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/items/:id → Update item (protected, owner only)
router.put('/items/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only update your own items.' });
    }

    const { itemName, description, type, category, location, date, contactInfo } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { itemName, description, type, category, location, date, contactInfo },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Item updated successfully!', item: updatedItem });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid item ID.' });
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while updating item.' });
  }
});

// DELETE /api/items/:id → Delete item (protected, owner only)
router.delete('/items/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    // Check ownership
    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own items.' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted successfully!' });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid item ID.' });
    res.status(500).json({ message: 'Server error while deleting item.' });
  }
});

module.exports = router;
