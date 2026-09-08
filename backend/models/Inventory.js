const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  itemType: { type: String, required: true, enum: ['cigarette', 'water', 'energy_drink'] },
  brand: { type: String, required: true },
  pricePerPiece: { type: Number, required: true, min: 0 },
  packSize: { type: Number, required: true, default: 1 },
  stockInPieces: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

inventorySchema.index({ itemType: 1, brand: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
