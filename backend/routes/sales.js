const express = require('express');
const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const filter = req.user.role === 'sales' ? { soldBy: req.user._id } : {};
    const sales = await Sale.find(filter)
      .populate('inventoryId', 'brand itemName itemType pricePerPiece')
      .populate('soldBy', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const filter = { saleDate: { $gte: today, $lt: tomorrow } };
    if (req.user.role === 'sales') filter.soldBy = req.user._id;

    const sales = await Sale.find(filter)
      .populate('inventoryId', 'brand itemName itemType pricePerPiece')
      .populate('soldBy', 'fullName username')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayAgg = await Sale.aggregate([
      { $match: { saleDate: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' }, items: { $sum: '$quantity' } } }
    ]);

    const todayByBrand = await Sale.aggregate([
      { $match: { saleDate: { $gte: today, $lt: tomorrow } } },
      { $lookup: { from: 'inventories', localField: 'inventoryId', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: {
        _id: '$item.brand',
        itemType: { $first: '$item.itemType' },
        qty: { $sum: '$quantity' },
        revenue: { $sum: '$totalPrice' }
      }}
    ]);

    const monthAgg = await Sale.aggregate([
      { $match: { saleDate: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      today: {
        total: todayAgg[0]?.total || 0,
        items: todayAgg[0]?.items || 0,
        byBrand: todayByBrand.map(b => ({ brand: b._id, itemType: b.itemType, qty: b.qty, revenue: b.revenue }))
      },
      month: { total: monthAgg[0]?.total || 0 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate() - 30));
    startDate.setHours(0, 0, 0, 0);
    const endDate = to ? new Date(to) : new Date();
    endDate.setHours(23, 59, 59, 999);

    const dailySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
        revenue: { $sum: '$totalPrice' },
        items: { $sum: '$quantity' }
      }},
      { $sort: { _id: -1 } }
    ]);

    const byBrand = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      { $lookup: { from: 'inventories', localField: 'inventoryId', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $group: {
        _id: '$item.brand',
        itemType: { $first: '$item.itemType' },
        qty: { $sum: '$quantity' },
        revenue: { $sum: '$totalPrice' }
      }},
      { $sort: { revenue: -1 } }
    ]);

    const bySeller = await Sale.aggregate([
      { $match: { saleDate: { $gte: startDate, $lte: endDate } } },
      { $lookup: { from: 'users', localField: 'soldBy', foreignField: '_id', as: 'seller' } },
      { $unwind: '$seller' },
      { $group: {
        _id: '$seller.fullName',
        revenue: { $sum: '$totalPrice' },
        transactions: { $sum: 1 }
      }},
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      dailySales: dailySales.map(d => ({ date: d._id, revenue: d.revenue, items: d.items })),
      byBrand: byBrand.map(b => ({ brand: b._id, itemType: b.itemType, qty: b.qty, revenue: b.revenue })),
      bySeller: bySeller.map(s => ({ name: s._id, revenue: s.revenue, transactions: s.transactions })),
      period: { from: startDate.toISOString().split('T')[0], to: endDate.toISOString().split('T')[0] }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { inventoryId, quantity } = req.body;
    if (!inventoryId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid item and quantity required' });
    }

    const item = await Inventory.findById(inventoryId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.stockInPieces < quantity) {
      return res.status(400).json({ error: `Insufficient stock. Available: ${item.stockInPieces}` });
    }

    const totalPrice = item.pricePerPiece * quantity;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.create([{
        inventoryId,
        quantity,
        totalPrice,
        soldBy: req.user._id,
        saleDate: new Date(),
        saleTime: new Date().toLocaleTimeString('en-US', { hour12: false })
      }], { session });

      await Inventory.findByIdAndUpdate(inventoryId, { $inc: { stockInPieces: -quantity } }, { session });

      await session.commitTransaction();
      res.status(201).json({ message: 'Sale recorded', sale: sale[0], total: totalPrice });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
