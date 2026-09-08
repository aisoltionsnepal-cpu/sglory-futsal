require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Inventory = require('./models/Inventory');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Inventory.deleteMany({});

    await User.create([
      { username: 'admin', password: 'admin123', role: 'admin', fullName: 'Admin' },
      { username: 'sales', password: 'sales123', role: 'sales', fullName: 'Sales User' }
    ]);
    console.log('Users seeded');

    await Inventory.create([
      { itemName: 'Cigarette', itemType: 'cigarette', brand: 'Shikhar', pricePerPiece: 20, packSize: 20, stockInPieces: 100 },
      { itemName: 'Cigarette', itemType: 'cigarette', brand: 'Surya', pricePerPiece: 25, packSize: 20, stockInPieces: 100 },
      { itemName: 'Cigarette', itemType: 'cigarette', brand: 'Naulo', pricePerPiece: 12, packSize: 20, stockInPieces: 100 },
      { itemName: 'Water Bottle', itemType: 'water', brand: 'Regular Water', pricePerPiece: 25, packSize: 12, stockInPieces: 48 },
      { itemName: 'Energy Drink', itemType: 'energy_drink', brand: 'Xtreme', pricePerPiece: 150, packSize: 24, stockInPieces: 48 },
      { itemName: 'Energy Drink', itemType: 'energy_drink', brand: 'Redbull', pricePerPiece: 150, packSize: 24, stockInPieces: 48 }
    ]);
    console.log('Inventory seeded');

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
