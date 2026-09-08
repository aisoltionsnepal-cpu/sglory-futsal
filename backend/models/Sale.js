const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  saleDate: { type: Date, default: Date.now },
  saleTime: { type: String, default: () => new Date().toLocaleTimeString('en-US', { hour12: false }) }
}, { timestamps: true });

saleSchema.index({ saleDate: -1 });
saleSchema.index({ soldBy: 1, saleDate: -1 });

module.exports = mongoose.model('Sale', saleSchema);
