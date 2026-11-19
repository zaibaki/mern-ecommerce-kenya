const chalk = require('chalk');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const setupDB = require('./db');
const { ROLES, REVIEW_STATUS } = require('../constants');
const User = require('../models/user');
const Address = require('../models/address');
const Brand = require('../models/brand');
const Product = require('../models/product');
const Category = require('../models/category');
const Review = require('../models/review');

const args = process.argv.slice(2);
const email = args[0];
const password = args[1];

// Kenyan catalogue for the tutorial store (prices in KES).
const CATEGORIES = [
  { name: 'Coffee & Tea', description: 'Kenyan coffee and tea from the highlands, roasted and blended for everyday brewing.' },
  { name: 'Maasai Crafts', description: 'Handmade Maasai beadwork, shukas, baskets and carvings from Kenyan artisans.' },
  { name: 'Fashion', description: 'Kenyan fashion: leather goods, Ankara prints and beadwork made in Nairobi.' },
  { name: 'Home & Living', description: 'Furniture, lighting and homeware crafted from Kenyan wood, sisal and solar power.' },
  { name: 'Groceries', description: 'Kenyan pantry staples: unga, honey, spices and superfoods.' },
  { name: 'Electronics', description: 'Practical electronics and charging gear for Kenyan homes and phones.' },
  { name: 'Sports & Outdoors', description: 'Gear for running, riding and hiking across Kenya.' },
  { name: 'Beauty', description: 'Natural Kenyan beauty care: shea butter, black soap and baobab oil.' },
];

const BRANDS = [
  { name: 'Rift Valley Coffee', description: 'Small-batch coffee and tea from the Rift Valley highlands.' },
  { name: 'Savanna Crafts', description: 'Handmade crafts from Kenyan artisan cooperatives.' },
  { name: 'Nairobi Leather Works', description: 'Hand-stitched leather goods made in Nairobi.' },
  { name: 'Kilimani Home', description: 'Quality homeware and furniture from Kilimani, Nairobi.' },
  { name: 'Mombasa Spice Co.', description: 'Spices, honey and pantry goods from the Kenyan coast.' },
  { name: 'Savanna Electronics', description: 'Reliable electronics and charging gear for everyday Kenya.' },
  { name: 'Turkana Outdoors', description: 'Tough outdoor gear for Kenyan trails, roads and mountains.' },
  { name: 'Zawadi Beauty', description: 'Natural beauty products made with Kenyan ingredients.' },
];

const CUSTOMERS = [
  { firstName: 'Wanjiru', lastName: 'Kamau', email: 'wanjiru.kamau@example.com', phoneNumber: '+254 712 345 678', address: '14 Riverside Drive, Kilimani', city: 'Nairobi', zipCode: '00100' },
  { firstName: 'Brian', lastName: 'Otieno', email: 'brian.otieno@example.com', phoneNumber: '+254 722 456 789', address: '3rd Floor, Westlands Business Park, Westlands', city: 'Nairobi', zipCode: '00800' },
  { firstName: 'Achieng', lastName: 'Odhiambo', email: 'achieng.odhiambo@example.com', phoneNumber: '+254 733 567 890', address: 'House 12, Karen Plains Road, Karen', city: 'Nairobi', zipCode: '00502' },
  { firstName: 'Njeri', lastName: 'Mwangi', email: 'njeri.mwangi@example.com', phoneNumber: '+254 701 234 567', address: 'Suite 5, Moi Avenue, CBD', city: 'Nairobi', zipCode: '00100' },
  { firstName: 'Baraka', lastName: 'Juma', email: 'baraka.juma@example.com', phoneNumber: '+254 720 678 901', address: '22 Ngong Road, Ngong Road', city: 'Nairobi', zipCode: '00200' },
];

const PRODUCTS = [
  {
    sku: 'KE-001',
    name: 'Kenyan AA Coffee Beans 500g',
    description: 'Premium single-origin AA arabica beans from the highlands of Mount Kenya, medium roast with bright citrus notes.',
    quantity: 48,
    price: 1850,
    imageUrl: 'https://images.pexels.com/photos/29317659/pexels-photo-29317659/free-photo-of-hand-holding-opened-bag-of-coffee-beans.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Rift Valley Coffee',
    category: 'Coffee & Tea'
  },
  {
    sku: 'KE-002',
    name: 'Kericho Gold Tea 250g',
    description: 'Bold black tea leaves grown in the Kericho highlands, perfect for a strong morning chai.',
    quantity: 90,
    price: 650,
    imageUrl: 'https://images.pexels.com/photos/20770523/pexels-photo-20770523/free-photo-of-tea-glass-on-plate.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Rift Valley Coffee',
    category: 'Coffee & Tea'
  },
  {
    sku: 'KE-003',
    name: 'Kenya Peaberry Coffee 250g',
    description: 'Rare peaberry beans with a rich, winey flavour and smooth finish, roasted in small batches in Nairobi.',
    quantity: 35,
    price: 1200,
    imageUrl: 'https://images.pexels.com/photos/33015766/pexels-photo-33015766/free-photo-of-close-up-of-roasted-coffee-beans-on-white-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Rift Valley Coffee',
    category: 'Coffee & Tea'
  },
  {
    sku: 'KE-004',
    name: 'Maasai Shuka Blanket',
    description: 'Authentic red checked Maasai shuka, woven from warm acrylic wool, a true piece of Kenyan heritage.',
    quantity: 60,
    price: 1500,
    imageUrl: 'https://img.kilimall.com/c/obs/seller/7817/goods_image/241108234628_11b67012d704c5a3fc3be534a62c28dd.jpg',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-005',
    name: 'Kiondo Sisal Basket',
    description: 'Handwoven sisal kiondo basket with leather handles, made by women\'s cooperatives in Machakos.',
    quantity: 28,
    price: 2200,
    imageUrl: 'https://images.pexels.com/photos/29530568/pexels-photo-29530568/free-photo-of-colorful-handwoven-baskets-in-sunlight.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-006',
    name: 'Beaded Maasai Necklace',
    description: 'Hand-beaded Maasai collar necklace in traditional red, white and black glass beads.',
    quantity: 75,
    price: 950,
    imageUrl: 'https://images.pexels.com/photos/36647216/pexels-photo-36647216/free-photo-of-elegant-beaded-necklace-on-velvet-display.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-007',
    name: 'Kisii Soapstone Carving',
    description: 'Hand-carved Kisii soapstone sculpture, polished by artisans in Tabaka, Kisii County.',
    quantity: 22,
    price: 1800,
    imageUrl: 'https://images.pexels.com/photos/26755902/pexels-photo-26755902/free-photo-of-marble-figurines-in-shadow.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-008',
    name: 'Kanga Leso Fabric Pair',
    description: 'A matching pair of vibrant kanga leso wraps in bold Swahili prints, 100 percent cotton.',
    quantity: 40,
    price: 1100,
    imageUrl: 'https://images.pexels.com/photos/18330808/pexels-photo-18330808/free-photo-of-young-woman-holding-fabric-with-colorful-patterns.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-009',
    name: 'Kikoy Cotton Sarong',
    description: 'Lightweight handwoven kikoy cotton sarong from the Kenyan coast, ideal for the beach or home.',
    quantity: 55,
    price: 1350,
    imageUrl: 'https://images.pexels.com/photos/30015661/pexels-photo-30015661/free-photo-of-woman-in-tropical-sarong-at-sunny-resort.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-010',
    name: 'Handmade Leather Sandals',
    description: 'Hand-stitched full-grain leather sandals with recycled tyre soles, made in Nairobi.',
    quantity: 42,
    price: 2800,
    imageUrl: 'https://images.pexels.com/photos/26925248/pexels-photo-26925248/free-photo-of-product-shot-of-elegant-leather-sandals.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Nairobi Leather Works',
    category: 'Fashion'
  },
  {
    sku: 'KE-011',
    name: 'Ankara Print Dress',
    description: 'Flowing Ankara wax-print dress with a flattering fit, sewn by Nairobi tailors.',
    quantity: 18,
    price: 3500,
    imageUrl: 'https://images.pexels.com/photos/33939066/pexels-photo-33939066/free-photo-of-elegant-african-woman-in-traditional-ankara-dress.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Nairobi Leather Works',
    category: 'Fashion'
  },
  {
    sku: 'KE-012',
    name: 'Maasai Bead Bracelet Set',
    description: 'A set of five colourful hand-beaded Maasai bracelets that add a pop of colour to any outfit.',
    quantity: 100,
    price: 750,
    imageUrl: 'https://images.pexels.com/photos/30215524/pexels-photo-30215524/free-photo-of-colorful-bead-bracelets-on-wooden-surface.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Fashion'
  },
  {
    sku: 'KE-013',
    name: 'Nairobi Leather Tote Bag',
    description: 'Spacious full-grain leather tote bag with an inner pocket, handmade in Nairobi.',
    quantity: 25,
    price: 4500,
    imageUrl: 'https://images.pexels.com/photos/36365228/pexels-photo-36365228/free-photo-of-stylish-leather-tote-bags-on-white-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Nairobi Leather Works',
    category: 'Fashion'
  },
  {
    sku: 'KE-014',
    name: 'Solar Lantern',
    description: 'Solar-powered lantern that charges by day and lights your home or garden all night, no electricity needed.',
    quantity: 65,
    price: 2400,
    imageUrl: 'https://images.pexels.com/photos/35552650/pexels-photo-35552650/free-photo-of-decorative-watering-can-solar-lantern-in-garden.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Kilimani Home',
    category: 'Home & Living'
  },
  {
    sku: 'KE-015',
    name: 'Nyama Choma Grill Set',
    description: 'Complete nyama choma grill set with a sturdy charcoal jiko, grill rack and skewers for weekend barbecues.',
    quantity: 15,
    price: 6500,
    imageUrl: 'https://images.pexels.com/photos/37179548/pexels-photo-37179548/free-photo-of-close-up-of-barbecue-grill-with-glowing-coals.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Kilimani Home',
    category: 'Home & Living'
  },
  {
    sku: 'KE-016',
    name: 'Handwoven Sisal Rug',
    description: 'Large handwoven sisal rug with natural fibres, adding warmth and texture to any living room.',
    quantity: 12,
    price: 8500,
    imageUrl: 'https://images.pexels.com/photos/34949528/pexels-photo-34949528/free-photo-of-cozy-bohemian-interior-with-indoor-plants.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Kilimani Home',
    category: 'Home & Living'
  },
  {
    sku: 'KE-017',
    name: 'Mango Wood Coffee Table',
    description: 'Solid mango wood coffee table with a smooth polished finish, crafted by Kenyan woodworkers.',
    quantity: 8,
    price: 18500,
    imageUrl: 'https://images.pexels.com/photos/15602699/pexels-photo-15602699/free-photo-of-photo-of-a-coffee-table.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Kilimani Home',
    category: 'Home & Living'
  },
  {
    sku: 'KE-018',
    name: 'Acacia Wood Bookshelf',
    description: 'Tall solid acacia wood bookshelf with five shelves, built to last a lifetime.',
    quantity: 6,
    price: 24000,
    imageUrl: 'https://images.pexels.com/photos/39207007/pexels-photo-39207007/free-photo-of-minimalist-wooden-bookshelf-with-decor-objects.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Kilimani Home',
    category: 'Home & Living'
  },
  {
    sku: 'KE-019',
    name: 'Unga Maize Flour 2kg',
    description: 'Finely milled white maize flour for soft ugali, milled fresh and packed in Nairobi.',
    quantity: 100,
    price: 450,
    imageUrl: 'https://images.pexels.com/photos/7236112/pexels-photo-7236112.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-020',
    name: 'Mombasa Spice Mix 200g',
    description: 'Aromatic coastal spice mix with pilau masala, cardamom and cloves, blended in Mombasa.',
    quantity: 80,
    price: 550,
    imageUrl: 'https://images.pexels.com/photos/32281630/pexels-photo-32281630/free-photo-of-assorted-spices-in-black-bowls-flat-lay.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-021',
    name: 'Kenyan Honey 500ml',
    description: 'Pure raw Kenyan honey harvested from beehives in Baringo, unprocessed and naturally sweet.',
    quantity: 50,
    price: 1100,
    imageUrl: 'https://images.pexels.com/photos/39197566/pexels-photo-39197566/free-photo-of-elegant-honey-jar-with-wildflowers-and-white-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-022',
    name: 'Moringa Powder 250g',
    description: 'Nutrient-rich moringa leaf powder, sun-dried and ground, a daily spoonful of green goodness.',
    quantity: 60,
    price: 850,
    imageUrl: 'https://images.pexels.com/photos/29821014/pexels-photo-29821014/free-photo-of-green-matcha-powder-in-tin-with-spoon.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-023',
    name: 'Savanna Fast Charger 20W',
    description: '20W USB-C fast charger that powers your phone to half charge in about 30 minutes.',
    quantity: 90,
    price: 1800,
    imageUrl: 'https://images.pexels.com/photos/36012993/pexels-photo-36012993/free-photo-of-close-up-of-white-usb-charger-and-cable.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Electronics',
    category: 'Electronics'
  },
  {
    sku: 'KE-024',
    name: 'Wireless Earbuds Pro',
    description: 'True wireless earbuds with clear sound, touch controls and a charging case that lasts all day.',
    quantity: 45,
    price: 3200,
    imageUrl: 'https://images.pexels.com/photos/33797659/pexels-photo-33797659/free-photo-of-black-wireless-earbuds-on-yellow-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Electronics',
    category: 'Electronics'
  },
  {
    sku: 'KE-025',
    name: 'Solar Power Bank 20000mAh',
    description: 'High-capacity solar power bank that keeps your phone charged during power cuts and upcountry trips.',
    quantity: 38,
    price: 4200,
    imageUrl: 'https://images.pexels.com/photos/38649063/pexels-photo-38649063/free-photo-of-minimalist-portable-power-banks-on-wooden-shelf.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Electronics',
    category: 'Electronics'
  },
  {
    sku: 'KE-026',
    name: 'Boda Boda Helmet',
    description: 'Sturdy certified motorcycle helmet with a clear visor and comfortable padding for daily boda rides.',
    quantity: 30,
    price: 3800,
    imageUrl: 'https://images.pexels.com/photos/35712915/pexels-photo-35712915/free-photo-of-collection-of-motorcycle-helmets-on-display.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-027',
    name: 'Kenya Running Shoes',
    description: 'Lightweight cushioned running shoes inspired by Kenya\'s champion marathoners.',
    quantity: 26,
    price: 6800,
    imageUrl: 'https://images.pexels.com/photos/7880182/pexels-photo-7880182.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-028',
    name: 'Hiking Backpack 40L',
    description: 'Durable 40-litre hiking backpack with a rain cover, built for Mount Kenya and the Aberdares.',
    quantity: 20,
    price: 5500,
    imageUrl: 'https://images.pexels.com/photos/30829443/pexels-photo-30829443/free-photo-of-mountain-hiking-backpack-in-tatra-mountains.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-029',
    name: 'Shea Butter Body Cream',
    description: 'Rich shea butter body cream whipped with coconut oil for soft, glowing skin.',
    quantity: 70,
    price: 900,
    imageUrl: 'https://images.pexels.com/photos/30754235/pexels-photo-30754235/free-photo-of-natural-body-butter-in-a-jar-with-hand-close-up.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Zawadi Beauty',
    category: 'Beauty'
  },
  {
    sku: 'KE-030',
    name: 'Kenyan Black Soap',
    description: 'Traditional African black soap bar that gently cleanses and nourishes all skin types.',
    quantity: 85,
    price: 650,
    imageUrl: 'https://images.pexels.com/photos/6690839/pexels-photo-6690839.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Zawadi Beauty',
    category: 'Beauty'
  },
  {
    sku: 'KE-031',
    name: 'Baobab Hair Oil 100ml',
    description: 'Cold-pressed baobab hair oil that strengthens hair and adds shine, with a light natural scent.',
    quantity: 55,
    price: 1250,
    imageUrl: 'https://images.pexels.com/photos/33731885/pexels-photo-33731885/free-photo-of-natural-hair-oil-with-rosemary-and-castor.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Zawadi Beauty',
    category: 'Beauty'
  },
  {
    sku: 'KE-032',
    name: 'Kenyan AA Coffee Beans 1kg',
    description: 'The same premium AA arabica beans in a full 1kg bag, great value for daily coffee lovers.',
    quantity: 30,
    price: 3400,
    imageUrl: 'https://images.pexels.com/photos/29317659/pexels-photo-29317659/free-photo-of-hand-holding-opened-bag-of-coffee-beans.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Rift Valley Coffee',
    category: 'Coffee & Tea'
  },
  {
    sku: 'KE-033',
    name: 'Kericho Gold Tea 500g',
    description: 'Bold Kericho black tea in a larger 500g pack for households that take their chai seriously.',
    quantity: 60,
    price: 1200,
    imageUrl: 'https://images.pexels.com/photos/20770523/pexels-photo-20770523/free-photo-of-tea-glass-on-plate.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Rift Valley Coffee',
    category: 'Coffee & Tea'
  },
  {
    sku: 'KE-034',
    name: 'Kiondo Sisal Basket Large',
    description: 'A larger handwoven sisal kiondo basket with leather handles, perfect for market runs and storage.',
    quantity: 18,
    price: 2900,
    imageUrl: 'https://images.pexels.com/photos/29530568/pexels-photo-29530568/free-photo-of-colorful-handwoven-baskets-in-sunlight.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-035',
    name: 'Beaded Maasai Collar Necklace',
    description: 'A wider hand-beaded Maasai collar necklace, a statement piece for ceremonies and celebrations.',
    quantity: 40,
    price: 1400,
    imageUrl: 'https://images.pexels.com/photos/36647216/pexels-photo-36647216/free-photo-of-elegant-beaded-necklace-on-velvet-display.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Crafts',
    category: 'Maasai Crafts'
  },
  {
    sku: 'KE-036',
    name: 'Ankara Print Maxi Dress',
    description: 'A floor-length Ankara maxi dress in vibrant wax print, elegant for weddings and Sundays.',
    quantity: 12,
    price: 4200,
    imageUrl: 'https://images.pexels.com/photos/33939066/pexels-photo-33939066/free-photo-of-elegant-african-woman-in-traditional-ankara-dress.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Nairobi Leather Works',
    category: 'Fashion'
  },
  {
    sku: 'KE-037',
    name: 'Nairobi Leather Weekender Bag',
    description: 'A roomy full-grain leather weekender bag for Mombasa trips and upcountry weekends.',
    quantity: 10,
    price: 6800,
    imageUrl: 'https://images.pexels.com/photos/36365228/pexels-photo-36365228/free-photo-of-stylish-leather-tote-bags-on-white-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Nairobi Leather Works',
    category: 'Fashion'
  },
  {
    sku: 'KE-038',
    name: 'Unga Maize Flour 5kg',
    description: 'Family-size 5kg bag of finely milled white maize flour for soft ugali every day.',
    quantity: 80,
    price: 1050,
    imageUrl: 'https://images.pexels.com/photos/7236112/pexels-photo-7236112.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-039',
    name: 'Kenyan Honey 1L',
    description: 'A full litre of pure raw Kenyan honey from Baringo, unprocessed and naturally sweet.',
    quantity: 32,
    price: 2100,
    imageUrl: 'https://images.pexels.com/photos/39197566/pexels-photo-39197566/free-photo-of-elegant-honey-jar-with-wildflowers-and-white-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Mombasa Spice Co.',
    category: 'Groceries'
  },
  {
    sku: 'KE-040',
    name: 'Savanna Fast Charger 65W',
    description: '65W USB-C fast charger that powers laptops and phones quickly, with two ports for sharing.',
    quantity: 55,
    price: 2600,
    imageUrl: 'https://images.pexels.com/photos/36012993/pexels-photo-36012993/free-photo-of-close-up-of-white-usb-charger-and-cable.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Electronics',
    category: 'Electronics'
  },
  {
    sku: 'KE-041',
    name: 'Wireless Earbuds Lite',
    description: 'Affordable true wireless earbuds with clear sound and a compact charging case.',
    quantity: 70,
    price: 2200,
    imageUrl: 'https://images.pexels.com/photos/33797659/pexels-photo-33797659/free-photo-of-black-wireless-earbuds-on-yellow-background.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Savanna Electronics',
    category: 'Electronics'
  },
  {
    sku: 'KE-042',
    name: 'Boda Boda Helmet Full Face',
    description: 'Full-face motorcycle helmet with a flip-up visor and extra padding for long safe rides.',
    quantity: 18,
    price: 5200,
    imageUrl: 'https://images.pexels.com/photos/35712915/pexels-photo-35712915/free-photo-of-collection-of-motorcycle-helmets-on-display.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-043',
    name: 'Kenya Trail Running Shoes',
    description: 'Trail running shoes with grippy soles for the hills of Iten and the trails of Ngong.',
    quantity: 16,
    price: 7500,
    imageUrl: 'https://images.pexels.com/photos/7880182/pexels-photo-7880182.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-044',
    name: 'Hiking Backpack 60L',
    description: 'A larger 60-litre hiking backpack with a rain cover for multi-day Mount Kenya climbs.',
    quantity: 12,
    price: 7200,
    imageUrl: 'https://images.pexels.com/photos/30829443/pexels-photo-30829443/free-photo-of-mountain-hiking-backpack-in-tatra-mountains.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Turkana Outdoors',
    category: 'Sports & Outdoors'
  },
  {
    sku: 'KE-045',
    name: 'Baobab Hair Oil 200ml',
    description: 'Double-size cold-pressed baobab hair oil for stronger, shinier hair all month long.',
    quantity: 35,
    price: 2200,
    imageUrl: 'https://images.pexels.com/photos/33731885/pexels-photo-33731885/free-photo-of-natural-hair-oil-with-rosemary-and-castor.jpeg?auto=compress&cs=tinysrgb&w=800',
    taxable: true,
    isActive: true,
    brand: 'Zawadi Beauty',
    category: 'Beauty'
  },
];

const REVIEWS = [
  { title: 'Excellent quality', review: 'I bought this and I am very happy with the quality. Delivery was fast and it arrived well packed.', rating: 5 },
  { title: 'Great value for money', review: 'Worth every shilling. I have already recommended it to my friends and family.', rating: 5 },
  { title: 'Very good product', review: 'Does exactly what it says. I use it every day and it still looks new.', rating: 4 },
  { title: 'Love it!', review: 'Beautiful and well made. You can tell it was crafted with care. I will buy again.', rating: 5 },
  { title: 'Good, as described', review: 'The product matches the photos and description. Fair price for the quality.', rating: 4 },
  { title: 'Highly recommended', review: 'I was not sure at first but this exceeded my expectations. Asante sana!', rating: 5 },
];

const seedDB = async () => {
  try {
    console.log(`${chalk.blue('✓')} ${chalk.blue('Seed database started')}`);

    if (!email || !password) throw new Error('Missing arguments');
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Seeding admin user...')}`);
      const user = new User({
        email,
        password,
        firstName: 'admin',
        lastName: 'admin',
        role: ROLES.Admin
      });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(user.password, salt);
      user.password = hash;
      await user.save();
      console.log(`${chalk.green('✓')} ${chalk.green('Admin user seeded.')}`);
    } else {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Admin user already exists, skipping seeding for admin user.')}`);
    }

    // Kenyan customer accounts (fictional +254 numbers, example.com emails).
    const customerUsers = [];
    for (const c of CUSTOMERS) {
      let customer = await User.findOne({ email: c.email });
      if (!customer) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('customer123', salt);
        customer = new User({
          email: c.email,
          password: hash,
          firstName: c.firstName,
          lastName: c.lastName,
          phoneNumber: c.phoneNumber,
          role: ROLES.Member
        });
        await customer.save();
        const address = new Address({
          user: customer._id,
          address: c.address,
          city: c.city,
          state: 'Nairobi County',
          country: 'Kenya',
          zipCode: c.zipCode,
          isDefault: true
        });
        await address.save();
      }
      customerUsers.push(customer);
    }
    console.log(`${chalk.green('✓')} ${chalk.green('Customer users seeded.')}`);

    const categoriesCount = await Category.countDocuments();
    let categories = [];
    if (categoriesCount >= CATEGORIES.length) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of categories already exist, skipping seeding for categories.')}`);
      categories = await Category.find().select('_id name');
    } else {
      for (const c of CATEGORIES) {
        const category = new Category({ name: c.name, description: c.description, isActive: true });
        await category.save();
        categories.push(category);
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Categories seeded.')}`);
    }
    const categoryByName = {};
    categories.forEach(c => { categoryByName[c.name] = c._id; });

    const brandsCount = await Brand.countDocuments();
    let brands = [];
    if (brandsCount >= BRANDS.length) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of brands already exist, skipping seeding for brands.')}`);
      brands = await Brand.find().select('_id name');
    } else {
      for (const b of BRANDS) {
        const brand = new Brand({ name: b.name, description: b.description, isActive: true });
        await brand.save();
        brands.push(brand);
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Brands seeded.')}`);
    }
    const brandByName = {};
    brands.forEach(b => { brandByName[b.name] = b._id; });

    const productsCount = await Product.countDocuments();
    let products = [];
    if (productsCount >= PRODUCTS.length) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of products already exist, skipping seeding for products.')}`);
      products = await Product.find().select('_id name');
    } else {
      for (const p of PRODUCTS) {
        const product = new Product({
          sku: p.sku,
          name: p.name,
          description: p.description,
          quantity: p.quantity,
          price: p.price,
          imageUrl: p.imageUrl,
          taxable: p.taxable,
          isActive: p.isActive,
          brand: brandByName[p.brand]
        });
        await product.save();
        // Category linkage lives ONLY in Category.products; keep this push.
        await Category.updateOne({ _id: categoryByName[p.category] }, { $push: { products: product._id } });
        products.push(product);
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Products seeded and associated with categories.')}`);
    }

    // Reviews give products their averageRating (computed by the listing aggregation).
    const reviewsCount = await Review.countDocuments();
    if (reviewsCount >= products.length * 2) {
      console.log(`${chalk.yellow('!')} ${chalk.yellow('Sufficient number of reviews already exist, skipping seeding for reviews.')}`);
    } else {
      for (let i = 0; i < products.length; i++) {
        for (let j = 0; j < 2; j++) {
          const template = REVIEWS[(i * 2 + j) % REVIEWS.length];
          const reviewer = customerUsers[(i + j) % customerUsers.length];
          const review = new Review({
            product: products[i]._id,
            user: reviewer._id,
            title: template.title,
            rating: template.rating,
            review: template.review,
            isRecommended: true,
            status: REVIEW_STATUS.Approved
          });
          await review.save();
        }
      }
      console.log(`${chalk.green('✓')} ${chalk.green('Reviews seeded.')}`);
    }
  } catch (error) {
    console.log(`${chalk.red('x')} ${chalk.red('Error while seeding database')}`);
    console.log(error);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log(`${chalk.blue('✓')} ${chalk.blue('Database connection closed!')}`);
  }
};

(async () => {
  try {
    await setupDB();
    await seedDB();
  } catch (error) {
    console.error(`Error initializing database: ${error.message}`);
  }
})();
