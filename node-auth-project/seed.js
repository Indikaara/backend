const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/product.model');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const productsData = [
    {
      category: "Rugs",
      categoryId: 10000,
      items: [
        {
          id: 10001,
          name: "APIYA",
          price: [
            {size: "6 x 9 ft", amount: 220000},
            {size: "8 x 10 ft", amount: 310000},
            {size: "9 x 12 ft", amount: 391230},
            {size: "10 x 14 ft", amount: 480000}
          ],
          image: [
            '../../assets/products/rugs/mirzapur_rugs/apiya/1.webp',
            '../../assets/products/rugs/mirzapur_rugs/apiya/2.webp',
            '../../assets/products/rugs/mirzapur_rugs/apiya/3.webp',
            '../../assets/products/rugs/mirzapur_rugs/apiya/4.webp',
            '../../assets/products/rugs/mirzapur_rugs/apiya/5.webp',
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our hand-knotted carpets. Crafted by skilled artisans using traditional techniques, they offer unparalleled softness, durability, and intricate detail. Add elegance to any space with our luxurious carpets.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Grey-Rust"],
          weavingTechnique: "Handwoven",
          material: "Wool & Bamboo Silk ",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "Modern"],
          SKU: "2024071100",
        },
        // Add more items here... (truncated for brevity)
      ],
    },
    {
      category: "Vintage Collections",
      categoryId: 20000,
      items: [],
    },
    {
      category: "Home Decor",
      categoryId: 30000,
      items: [
        {
          id: 30001,
          name: "Vintage Tripod Fan",
          price: [{ size: "Height: 4 ft", amount: 3500}],
          image: ["../assets/products/home_decor/vintage_crafts/vintage_tripod_fan/1.jpg"],
          description: "Feel the breeze of the past with this retro masterpiece. A vintage tripod fan that makes any room unforgettable.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Gold', 'Brown'],
          weavingTechnique: null,
          material: ['Metal', 'Wood'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070201",
        },
        // Add more items here...
      ],
    },
  ];

const seedProducts = async () => {
    try {
        await Product.deleteMany(); // Clear existing products

        const productsToInsert = [];

        productsData.forEach(cat => {
            cat.items.forEach(item => {
                productsToInsert.push({
                    ...item,
                    category: cat.category,
                    categoryId: cat.categoryId,
                });
            });
        });

        await Product.insertMany(productsToInsert);
        console.log('Products seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedProducts();
