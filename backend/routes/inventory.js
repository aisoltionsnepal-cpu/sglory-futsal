const express = require('express');
const Inventory = require('../models/Inventory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await Inventory.find().sort({ itemType: 1, brand: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    if (!itemName || !itemType || !brand || !pricePerPiece || !packSize) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const item = await Inventory.create({
      itemName, itemType, brand, pricePerPiece, packSize, stockInPieces: stockInPieces || 0
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    if (itemName) item.itemName = itemName;
    if (itemType) item.itemType = itemType;
    if (brand) item.brand = brand;
    if (pricePerPiece) item.pricePerPiece = pricePerPiece;
    if (packSize) item.packSize = packSize;
    if (stockInPieces !== undefined) item.stockInPieces = stockInPieces;

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/restock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, packs } = req.body;
    if (!id || !packs || packs <= 0) {
      return res.status(400).json({ error: 'Valid item ID and packs required' });
    }

    const item = await Inventory.findById(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const addedPieces = packs * item.packSize;
    item.stockInPieces += addedPieces;
    await item.save();

    res.json({ message: `Added ${packs} packs (${addedPieces} pieces) to ${item.brand}`, item });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
