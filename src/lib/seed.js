import 'dotenv/config';
// src/lib/seed.js
// =============================================
// COMPREHENSIVE DATABASE SEEDER
// Wipes all tables and inserts rich demo data:
//   - 2 Sellers with store customizations & about pages
//   - 9 Categories total
//   - 22 Products total
//   - 5 Customers with saved addresses
//   - Active discounts per seller
//   - 30+ Orders with full item breakdowns & varied statuses
// =============================================

import bcrypt from 'bcryptjs';
import { sequelize } from './db.js';
import {
  Seller, StoreCustomization, AboutPage,
  Category, Product,
  User, Address,
  Order, OrderItem,
  Discount, OrderDiscount,
} from '../models/index.js';

// ── helpers ──────────────────────────────────────────────
const hash = (pw) => bcrypt.hash(pw, 10);

/** returns a random element from an array */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** returns a past date N days ago as YYYY-MM-DD */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

/** returns a future date N days ahead as YYYY-MM-DD */
const daysAhead = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

// ── main ─────────────────────────────────────────────────
async function seedDatabase() {
  try {
    console.log('\n🔄  Connecting to database...');
    await sequelize.authenticate();
    console.log('✅  Connected.\n🗑   Force-syncing tables (WIPE + RECREATE)...');
    await sequelize.sync({ force: true });
    console.log('✅  Tables ready.\n');

    const pw = await hash('password123');

    // ══════════════════════════════════════════════════════
    // 1. CUSTOMERS  (5 users with 2 addresses each)
    // ══════════════════════════════════════════════════════
    const usersData = [
      { fullName: 'Alice Johnson',  email: 'alice@example.com',  phoneNumber: '555-0101' },
      { fullName: 'Bob Martinez',   email: 'bob@example.com',    phoneNumber: '555-0102' },
      { fullName: 'Carol Williams', email: 'carol@example.com',  phoneNumber: '555-0103' },
      { fullName: 'David Lee',      email: 'david@example.com',  phoneNumber: '555-0104' },
      { fullName: 'Eva Patel',      email: 'eva@example.com',    phoneNumber: '555-0105' },
    ];

    const users = await User.bulkCreate(
      usersData.map(u => ({ ...u, password_hash: pw })),
    );
    console.log(`👤  Created ${users.length} customers.`);

    const addressesRaw = [
      { userId: users[0].id, fullName: 'Alice Johnson',  phoneNumber: '555-0101', streetAddress: '12 Baker St',      city: 'London',    state: 'England',    postalCode: 'NW1 6XE', isDefault: true  },
      { userId: users[0].id, fullName: 'Alice Johnson',  phoneNumber: '555-0101', streetAddress: '3 Abbey Road',     city: 'London',    state: 'England',    postalCode: 'NW8 9AY', isDefault: false },
      { userId: users[1].id, fullName: 'Bob Martinez',   phoneNumber: '555-0102', streetAddress: '99 Main Ave',      city: 'New York',  state: 'NY',         postalCode: '10001',   isDefault: true  },
      { userId: users[1].id, fullName: 'Bob Martinez',   phoneNumber: '555-0102', streetAddress: '44 Broadway',      city: 'New York',  state: 'NY',         postalCode: '10002',   isDefault: false },
      { userId: users[2].id, fullName: 'Carol Williams', phoneNumber: '555-0103', streetAddress: '7 Harbour View',   city: 'Sydney',    state: 'NSW',        postalCode: '2000',    isDefault: true  },
      { userId: users[2].id, fullName: 'Carol Williams', phoneNumber: '555-0103', streetAddress: '21 Ocean Drive',   city: 'Melbourne', state: 'VIC',        postalCode: '3000',    isDefault: false },
      { userId: users[3].id, fullName: 'David Lee',      phoneNumber: '555-0104', streetAddress: '8 Orchard Blvd',  city: 'Singapore', state: 'Singapore',  postalCode: '238840',  isDefault: true  },
      { userId: users[3].id, fullName: 'David Lee',      phoneNumber: '555-0104', streetAddress: '22 Marina Way',   city: 'Singapore', state: 'Singapore',  postalCode: '018956',  isDefault: false },
      { userId: users[4].id, fullName: 'Eva Patel',      phoneNumber: '555-0105', streetAddress: '5 MG Road',       city: 'Bangalore', state: 'Karnataka',  postalCode: '560001',  isDefault: true  },
      { userId: users[4].id, fullName: 'Eva Patel',      phoneNumber: '555-0105', streetAddress: '12 Connaught Pl', city: 'New Delhi', state: 'Delhi',      postalCode: '110001',  isDefault: false },
    ];
    const addresses = await Address.bulkCreate(addressesRaw);
    console.log(`🏠  Created ${addresses.length} addresses.\n`);

    // ══════════════════════════════════════════════════════
    // 2. SELLERS
    // ══════════════════════════════════════════════════════
    const [seller1, seller2] = await Promise.all([
      Seller.create({ fullName: 'Alice Smith', email: 'alice@sweettreats.com', password_hash: pw, storeName: 'Sweet Treats', storeSlug: 'sweet-treats' }),
      Seller.create({ fullName: 'Bob Johnson', email: 'bob@savorysnacks.com',  password_hash: pw, storeName: 'Savory Snacks', storeSlug: 'savory-snacks' }),
    ]);
    console.log('🏪  Created 2 sellers.');

    // 3. Create Store Customizations & About Pages
    await StoreCustomization.bulkCreate([
      { sellerId: seller1.id, primaryColor: '#e91e63', backgroundColor: '#fce4ec', bannerImageUrl: '/demo/sweet-banner.png' },
      { sellerId: seller2.id, primaryColor: '#ff9800', backgroundColor: '#fff3e0', bannerImageUrl: '/demo/savory-banner.png' },
    ]);

    // About pages
    await AboutPage.bulkCreate([
      {
        sellerId: seller1.id,
        title: 'About Sweet Treats',
        content: 'Founded in 2010, Sweet Treats has been crafting premium hand-made confections using only the finest ingredients sourced from around the world. Our patissiers bring decades of expertise to every chocolate truffle, gummy creation, and baked delight we produce.',
        imageUrl: '/demo/sweet-about.png',
      },
      {
        sellerId: seller2.id,
        title: 'About Savory Snacks',
        content: 'Savory Snacks was born from a simple idea: real ingredients, bold flavours, zero compromise. Since 2015, we have been supplying offices, homes, and events with premium nuts, chips, and savoury bites.',
        imageUrl: '/demo/savory-about.png',
      },
    ]);
    console.log('🎨  Store customizations & about pages done.\n');

    // ══════════════════════════════════════════════════════
    // 3. CATEGORIES  (Balanced per seller)
    // ══════════════════════════════════════════════════════
    const [catChocolate, catGummies, catBaked, catLollies, catDrinks,
           catChips,    catNuts,    catCrackers, catDips] = await Category.bulkCreate([
      // Sweet Treats
      { name: 'Chocolates',        sellerId: seller1.id, image: '/demo/cat-choc.jpg' },
      { name: 'Gummies & Jellies', sellerId: seller1.id, image: '/demo/cat-gummy.jpg' },
      { name: 'Baked Goods',       sellerId: seller1.id, image: '/demo/cat-baked.jpg' },
      { name: 'Lollipops & Hard',  sellerId: seller1.id, image: '/demo/cat-lolly.jpg' },
      { name: 'Drinks & Shakes',   sellerId: seller1.id, image: '/demo/cat-drink.jpg' },
      // Savory Snacks
      { name: 'Chips & Crisps',    sellerId: seller2.id, image: '/demo/cat-chips.jpg' },
      { name: 'Mixed Nuts',        sellerId: seller2.id, image: '/demo/cat-nuts.jpg' },
      { name: 'Crackers & Rice',   sellerId: seller2.id, image: '/demo/cat-crackers.jpeg' },
      { name: 'Dips & Spreads',    sellerId: seller2.id, image: '/demo/cat-dips.jpg' },
    ]);
    console.log('📂  Created 9 categories.');

    // ══════════════════════════════════════════════════════
    // 4. PRODUCTS  (Prices in INR, correct extensions)
    // ══════════════════════════════════════════════════════
    const products1 = await Product.bulkCreate([
      { name: 'Dark Chocolate Truffles',   slug: 'dark-choc-truffles',    categoryId: catChocolate.id, sellerId: seller1.id, pricePerUnit: 750.00,  unitLabel: 'Box of 12', image: '/demo/sweet-truffles.jpg', description: 'Velvety 72% dark chocolate truffles with a rich ganache centre.' },
      { name: 'Milk Chocolate Bark',       slug: 'milk-choc-bark',        categoryId: catChocolate.id, sellerId: seller1.id, pricePerKg:   1200.00,                       image: '/demo/sweet-bark.jpg',     description: 'Creamy milk chocolate bark topped with roasted almonds and sea salt.' },
      { name: 'White Choc Raspberry Cups', slug: 'white-choc-rasp-cups',  categoryId: catChocolate.id, sellerId: seller1.id, pricePerUnit: 650.00,  unitLabel: 'Box of 8',  image: '/demo/sweet-cups.jpeg',    description: 'White chocolate cups filled with a sharp raspberry compote.' },
      { name: 'Rainbow Gummy Bears',       slug: 'rainbow-gummy-bears',   categoryId: catGummies.id,   sellerId: seller1.id, pricePerKg:   450.00,                        image: '/demo/sweet-gummy.jpg',    description: 'Classic fruit-flavoured gummy bears in six vibrant colours.' },
      { name: 'Sour Worm Tangles',         slug: 'sour-worm-tangles',     categoryId: catGummies.id,   sellerId: seller1.id, pricePerKg:   480.00,                        image: '/demo/sweet-worms.jpg',    description: 'Extra-sour worm shaped gummies coated in a citric acid sugar mix.' },
      { name: 'Peach Ring Jellies',        slug: 'peach-ring-jellies',    categoryId: catGummies.id,   sellerId: seller1.id, pricePerKg:   420.00,                        image: '/demo/sweet-peach.jpg',    description: 'Sweet peach flavoured jelly rings dusted with sugar.' },
      { name: 'Butter Croissants',         slug: 'butter-croissants',     categoryId: catBaked.id,     sellerId: seller1.id, pricePerUnit: 180.00,  unitLabel: 'Each',      image: '/demo/sweet-croissant.jpeg', description: 'All-butter croissants baked fresh daily.' },
      { name: 'Double Choc Brownies',      slug: 'double-choc-brownies',  categoryId: catBaked.id,     sellerId: seller1.id, pricePerUnit: 250.00,  unitLabel: 'Each',      image: '/demo/sweet-brownie.jpeg',  description: 'Fudgy double chocolate brownies with chunks of premium dark chocolate.' },
      { name: 'Lemon Drizzle Cake',        slug: 'lemon-drizzle-cake',    categoryId: catBaked.id,     sellerId: seller1.id, pricePerUnit: 1500.00, unitLabel: 'Whole',     image: '/demo/sweet-cake.jpeg',     description: 'A beautifully moist whole lemon drizzle cake. Serves 8.' },
      { name: 'Strawberry Lollipops',      slug: 'strawberry-lollipops',  categoryId: catLollies.id,   sellerId: seller1.id, pricePerUnit: 80.00,   unitLabel: 'Each',      image: '/demo/sweet-lolly.jpeg',    description: 'Classic hard candy strawberry lollipops with a swirl of cream.' },
      { name: 'Mango Chilli Lollipops',    slug: 'mango-chilli-lollipops',categoryId: catLollies.id,   sellerId: seller1.id, pricePerUnit: 95.00,   unitLabel: 'Each',      image: '/demo/sweet-mango.jpeg',    description: 'Mango candy lollipops with a hidden chilli centre.' },
      { name: 'Chocolate Milkshake Mix',   slug: 'choc-milkshake-mix',    categoryId: catDrinks.id,    sellerId: seller1.id, pricePerUnit: 450.00,  unitLabel: '500g Bag',  image: '/demo/sweet-shake.jpeg',    description: 'Premium chocolate milkshake base. Just add cold milk.' },
    ]);

    const products2 = await Product.bulkCreate([
      { name: 'Sea Salt Kettle Chips',     slug: 'sea-salt-kettle-chips',   categoryId: catChips.id,    sellerId: seller2.id, pricePerUnit:  150.00, unitLabel: '200g Bag', image: '/demo/savory-chips.jpeg',   description: 'Thick-cut kettle chips with sea salt.' },
      { name: 'BBQ Pulled Pork Crisps',    slug: 'bbq-pork-crisps',         categoryId: catChips.id,    sellerId: seller2.id, pricePerUnit:  180.00, unitLabel: '150g Bag', image: '/demo/savory-bbq.jpeg',     description: 'Thin, light crisps with smoky BBQ seasoning.' },
      { name: 'Truffle & Parmesan Chips',  slug: 'truffle-parm-chips',       categoryId: catChips.id,    sellerId: seller2.id, pricePerUnit:  350.00, unitLabel: '150g Bag', image: '/demo/savory-truffle.jpeg', description: 'Premium potato chips with truffle oil and Parmesan.' },
      { name: 'Roasted Cashews',           slug: 'roasted-cashews',          categoryId: catNuts.id,     sellerId: seller2.id, pricePerKg:   1800.00,                      image: '/demo/savory-cashews.jpeg', description: 'Dry-roasted cashews lightly salted.' },
      { name: 'Mixed Nuts Deluxe',         slug: 'mixed-nuts-deluxe',        categoryId: catNuts.id,     sellerId: seller2.id, pricePerKg:   1600.00,                      image: '/demo/savory-nuts.jpeg',    description: 'A premium blend of cashews, almonds, pecans, and macadamias.' },
      { name: 'Honey Glazed Almonds',      slug: 'honey-glazed-almonds',     categoryId: catNuts.id,     sellerId: seller2.id, pricePerKg:   1500.00,                      image: '/demo/savory-almonds.jpeg', description: 'Whole almonds coated in a light honey glaze.' },
      { name: 'Rosemary Sea Salt Crackers',slug: 'rosemary-sea-salt-crack',  categoryId: catCrackers.id, sellerId: seller2.id, pricePerUnit:  450.00,  unitLabel: '200g Box',  image: '/demo/savory-crack.jpeg',    description: 'Delicate crisp crackers baked with fresh rosemary.' },
      { name: 'Rice Cakes – Sesame',       slug: 'rice-cakes-sesame',        categoryId: catCrackers.id, sellerId: seller2.id, pricePerUnit:  250.00,  unitLabel: '130g Pack', image: '/demo/savory-rice.jpeg',     description: 'Light and airy rice cakes sprinkled with sesame seeds.' },
      { name: 'Hummus Classic Dip',        slug: 'hummus-classic-dip',       categoryId: catDips.id,     sellerId: seller2.id, pricePerUnit:  400.00,  unitLabel: '300g Tub',  image: '/demo/savory-hummus.jpeg',   description: 'Silky smooth traditional hummus.' },
      { name: 'Chipotle Black Bean Dip',   slug: 'chipotle-black-bean-dip',  categoryId: catDips.id,     sellerId: seller2.id, pricePerUnit:  420.00,  unitLabel: '300g Tub',  image: '/demo/savory-bean.jpeg',     description: 'Smoky black bean dip blended with chipotle peppers.' },
    ]);
    console.log(`🛒  Created ${products1.length} Sweet Treats products & ${products2.length} Savory Snacks products.\n`);

    // ══════════════════════════════════════════════════════
    // 5. DISCOUNTS
    // ══════════════════════════════════════════════════════
    const [disc1, disc2, disc3] = await Discount.bulkCreate([
      { sellerId: seller1.id, categoryId: catChocolate.id, productId: null, percentage: 15.00, startDate: daysAgo(10),  endDate: daysAhead(20) },  // 15% off all chocolates
      { sellerId: seller1.id, categoryId: null, productId: products1[3].id, percentage: 10.00, startDate: daysAgo(5),   endDate: daysAhead(15) },  // 10% off Gummy Bears
      { sellerId: seller2.id, categoryId: catNuts.id,  productId: null, percentage: 20.00, startDate: daysAgo(7),  endDate: daysAhead(30) },  // 20% off all nuts
    ]);
    console.log('🏷   Created 3 discounts.');

    // ══════════════════════════════════════════════════════
    // 6. ORDERS – 30+ across both shops, varied dates & statuses
    // ══════════════════════════════════════════════════════
    const allAddresses = addresses;
    const s1products = products1;
    const s2products = products2;
    const statuses = ORDER_STATUSES;

    // Helper to build an order + its items for seller 1
    const makeOrder1 = async (user, addr, daysAgoN, status, itemDefs, discountToApply = null) => {
      let total = 0;
      const itemsPayload = itemDefs.map(({ product, qty, weight }) => {
        let lineTotal = 0;
        if (product.pricePerUnit && qty) lineTotal = product.pricePerUnit * qty;
        else if (product.pricePerKg && weight) lineTotal = product.pricePerKg * weight;
        total += lineTotal;
        return { productId: product.id, quantity: qty || null, weight: weight || null, pricePerUnit: product.pricePerUnit || null, pricePerKg: product.pricePerKg || null, totalPrice: parseFloat(lineTotal.toFixed(2)) };
      });
      const createdAt = new Date(); createdAt.setDate(createdAt.getDate() - daysAgoN);
      const order = await Order.create({ customerName: user.fullName, phoneNumber: user.phoneNumber, totalPrice: parseFloat(total.toFixed(2)), status, sellerId: seller1.id, userId: user.id, shippingAddressId: addr.id, createdAt, updatedAt: createdAt }, { silent: true });
      await OrderItem.bulkCreate(itemsPayload.map(i => ({ ...i, orderId: order.id })));
      if (discountToApply) await OrderDiscount.create({ orderId: order.id, discountId: discountToApply.id });
      return order;
    };

    const makeOrder2 = async (user, addr, daysAgoN, status, itemDefs, discountToApply = null) => {
      let total = 0;
      const itemsPayload = itemDefs.map(({ product, qty, weight }) => {
        let lineTotal = 0;
        if (product.pricePerUnit && qty) lineTotal = product.pricePerUnit * qty;
        else if (product.pricePerKg && weight) lineTotal = product.pricePerKg * weight;
        total += lineTotal;
        return { productId: product.id, quantity: qty || null, weight: weight || null, pricePerUnit: product.pricePerUnit || null, pricePerKg: product.pricePerKg || null, totalPrice: parseFloat(lineTotal.toFixed(2)) };
      });
      const createdAt = new Date(); createdAt.setDate(createdAt.getDate() - daysAgoN);
      const order = await Order.create({ customerName: user.fullName, phoneNumber: user.phoneNumber, totalPrice: parseFloat(total.toFixed(2)), status, sellerId: seller2.id, userId: user.id, shippingAddressId: addr.id, createdAt, updatedAt: createdAt }, { silent: true });
      await OrderItem.bulkCreate(itemsPayload.map(i => ({ ...i, orderId: order.id })));
      if (discountToApply) await OrderDiscount.create({ orderId: order.id, discountId: discountToApply.id });
      return order;
    };

    // ── Sweet Treats orders (15) ──────────────────────────
    await makeOrder1(users[0], allAddresses[0], 120, 'Delivered', [{ product: s1products[0], qty: 2 }, { product: s1products[3], weight: 0.5 }]);
    await makeOrder1(users[0], allAddresses[0],  90, 'Delivered', [{ product: s1products[6], qty: 4 }, { product: s1products[7], qty: 3 }]);
    await makeOrder1(users[0], allAddresses[1],  60, 'Delivered', [{ product: s1products[1], weight: 1.0 }, { product: s1products[4], weight: 0.5 }], disc1);
    await makeOrder1(users[0], allAddresses[0],  30, 'Shipped',   [{ product: s1products[8], qty: 1 }, { product: s1products[9], qty: 5 }]);
    await makeOrder1(users[0], allAddresses[0],   5, 'Confirmed', [{ product: s1products[11], qty: 2 }]);

    await makeOrder1(users[1], allAddresses[2], 110, 'Delivered', [{ product: s1products[2], qty: 3 }, { product: s1products[5], weight: 1.0 }]);
    await makeOrder1(users[1], allAddresses[3],  75, 'Delivered', [{ product: s1products[7], qty: 5 }, { product: s1products[0], qty: 1 }], disc1);
    await makeOrder1(users[1], allAddresses[2],  45, 'Delivered', [{ product: s1products[3], weight: 2.0 }]);
    await makeOrder1(users[1], allAddresses[2],  20, 'Shipped',   [{ product: s1products[10], qty: 4 }, { product: s1products[9], qty: 3 }]);
    await makeOrder1(users[1], allAddresses[3],   2, 'Pending',   [{ product: s1products[6], qty: 2 }, { product: s1products[8], qty: 1 }]);

    await makeOrder1(users[2], allAddresses[4], 100, 'Delivered', [{ product: s1products[1], weight: 0.5 }, { product: s1products[4], weight: 0.5 }]);
    await makeOrder1(users[2], allAddresses[4],  55, 'Delivered', [{ product: s1products[0], qty: 4 }], disc1);
    await makeOrder1(users[3], allAddresses[6],  80, 'Cancelled', [{ product: s1products[5], weight: 1.5 }, { product: s1products[11], qty: 1 }]);
    await makeOrder1(users[3], allAddresses[6],  15, 'Confirmed', [{ product: s1products[2], qty: 2 }, { product: s1products[7], qty: 2 }]);
    await makeOrder1(users[4], allAddresses[8],  40, 'Delivered', [{ product: s1products[3], weight: 1.0 }, { product: s1products[6], qty: 3 }], disc2);

    // ── Savory Snacks orders (15) ─────────────────────────
    await makeOrder2(users[0], allAddresses[0], 115, 'Delivered', [{ product: s2products[0], qty: 3 }, { product: s2products[3], weight: 0.5 }]);
    await makeOrder2(users[0], allAddresses[1],  85, 'Delivered', [{ product: s2products[6], qty: 2 }, { product: s2products[7], qty: 4 }]);
    await makeOrder2(users[0], allAddresses[0],  50, 'Delivered', [{ product: s2products[4], weight: 1.0 }, { product: s2products[5], weight: 0.5 }], disc3);
    await makeOrder2(users[0], allAddresses[0],  25, 'Shipped',   [{ product: s2products[8], qty: 2 }, { product: s2products[9], qty: 2 }]);
    await makeOrder2(users[0], allAddresses[1],   3, 'Pending',   [{ product: s2products[1], qty: 5 }]);

    await makeOrder2(users[1], allAddresses[2], 105, 'Delivered', [{ product: s2products[7], qty: 3 }, { product: s2products[2], qty: 2 }]);
    await makeOrder2(users[1], allAddresses[3],  70, 'Delivered', [{ product: s2products[5], weight: 1.5 }], disc3);
    await makeOrder2(users[1], allAddresses[2],  35, 'Shipped',   [{ product: s2products[9], qty: 6 }, { product: s2products[8], qty: 4 }]);
    await makeOrder2(users[1], allAddresses[2],  10, 'Confirmed', [{ product: s2products[0], qty: 4 }, { product: s2products[1], qty: 3 }]);
    await makeOrder2(users[1], allAddresses[3],   1, 'Pending',   [{ product: s2products[3], weight: 0.5 }]);

    await makeOrder2(users[2], allAddresses[4],  95, 'Delivered', [{ product: s2products[4], weight: 0.5 }, { product: s2products[8], qty: 2 }]);
    await makeOrder2(users[2], allAddresses[5],  65, 'Cancelled', [{ product: s2products[6], qty: 1 }, { product: s2products[7], qty: 2 }]);
    await makeOrder2(users[3], allAddresses[6],  42, 'Delivered', [{ product: s2products[2], qty: 3 }], disc3);
    await makeOrder2(users[3], allAddresses[7],  18, 'Shipped',   [{ product: s2products[9], qty: 3 }, { product: s2products[8], qty: 2 }]);
    await makeOrder2(users[4], allAddresses[8],   7, 'Confirmed', [{ product: s2products[5], weight: 1.0 }, { product: s2products[4], weight: 0.5 }], disc3);

    console.log('📦  Created 30 orders with full item histories.\n');

    console.log('════════════════════════════════════════════════════════');
    console.log('✅  DATABASE SEEDED SUCCESSFULLY!');
    console.log('════════════════════════════════════════════════════════');
    console.log('   👥  Customers : 5  (password: password123)');
    console.log('   🏪  Sellers   : 2  (password: password123)');
    console.log('   📂  Categories: 9  (5 Sweet, 4 Savory)');
    console.log('   🛒  Products  : 22 (12 Sweet, 10 Savory)');
    console.log('   🏷   Discounts : 3');
    console.log('   📦  Orders    : 30 (15 per shop, across 120 days)');
    console.log('════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message || err);
    console.error(err.stack);
    process.exit(1);
  }
}

seedDatabase();
