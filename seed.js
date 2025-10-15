require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models/product.model');
const connectDB = require('./config/db');
const { logger } = require('./config/logger');

// Ensure mongoose is connected before proceeding
mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
    process.exit(1);
});

mongoose.connection.once('open', () => {
    logger.info('MongoDB connected successfully for seeding');
});

// Set environment for seeding
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

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
            {size: "6 x 9 ft", amount: 2200},
            {size: "8 x 10 ft", amount: 31000},
            {size: "9 x 12 ft", amount: 39123},
            {size: "10 x 14 ft", amount: 48000}
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
        {
          id: 10002,
          name: "AMBROSIA",
          price: [{size: "9 x 12 ft", amount: 28980}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/ambrosia/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/ambrosia/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/ambrosia/3.webp",
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
          color: ["multi"],
          weavingTechnique: "Hand Knotted",
          material: "New Zealand Wool",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract"],
          SKU: "2023071116",
        },
        {
          id: 10003,
          name: "ASTARA",
          price: [{size: "2.6 x 6 ft", amount: 4252}, {size: "4 x 6 ft", amount: 5925}, {size: "5 x 7 ft", amount: 9922}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/astara/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/astara/2.webp",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our hand-knotted carpets. Crafted by skilled artisans using traditional techniques, they offer unparalleled softness, durability, and intricate detail. Add elegance to any space with our luxurious carpets.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 6 - 8 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["grey"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Bamboo Silk ",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract"],
          SKU: "2023071130",
        },
        {
          id: 10004,
          name: "AURORA",
          price: [{size: "5.6 x 8.6 ft", amount: 169352}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/aurora/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/aurora/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/aurora/3.webp",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our hand-knotted carpets. Crafted by skilled artisans using traditional techniques, they offer unparalleled softness, durability, and intricate detail. Add elegance to any space with our luxurious carpets.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 6 - 8 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["multi"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2023071133",
        },
        {
          id: 10005,
          name: "PORAL",
          price: [{size: "5 x 8 ft", amount: 201600}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/poral/1.jpg",
            "../../assets/products/rugs/mirzapur_rugs/poral/2.jpg",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our hand-knotted carpets. Crafted by skilled artisans using traditional techniques, they offer unparalleled softness, durability, and intricate detail. Add elegance to any space with our luxurious carpets.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 6 - 8 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["green multi"],
          weavingTechnique: "Hand Knotted",
          material: "Handspun Wool & Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["Shape Rugs"],
          SKU: "MR-155",
        },
        {
          id: 10006,
          name: "AMRITA",
          price: [{size: "4 x 6 ft", amount: 75600}, {size: "8 x 10 ft", amount: 216000}, {size: "9 x 12 ft", amount: 340200}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/amrita/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/amrita/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/amrita/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/amrita/4.webp",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our Tibetan knotted carpets, where Himalayan tradition meets contemporary design. Each carpet is meticulously handcrafted by skilled artisans in the foothills of the Himalayas, using time-honored techniques passed down through generations. Made from the finest Tibetan wool and silk, these carpets boast luxurious softness, exceptional durability, and exquisite detailing. The intricate patterns and vibrant colors reflect the cultural richness of the region, adding a touch of elegance and sophistication to your space. Elevate your interior with the unparalleled beauty and craftsmanship of our Tibetan knotted carpets, and experience the artistry of the Himalayas in every thread.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12-14 mm 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["black"],
          weavingTechnique: "Tibetan Knotted",
          material: "100% Wool",
          manufacturer: "Mirzapur Rugs",
          tags: ["Uncategorized"],
          SKU: "2024081213",
        },
        {
          id: 10007,
          name: "ARAK",
          price: [{size: "5 x 7 ft", amount: 90038}, {size: "8 x 10 ft", amount: 205800}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/arak/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/arak/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/arak/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/arak/4.webp",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Introducing our exquisite hand-knotted carpets. Crafted by skilled artisans using premium materials, they offer unmatched softness, durability, and elegance. Elevate your decor with timeless luxury.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12-14 mm 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["navy"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Bamboo Silk",
          manufacturer: "Mirzapur Rugs",
          tags: ["Uncategorized"],
          SKU: "2024081218",
        },
        {
          id: 10008,
          name: "PAINTA",
          price: [{size: "5 x 8 ft", amount: 105000}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/painta/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/painta/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/painta/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/painta/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12-14 mm 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Sand-Indigo"],
          weavingTechnique: "Hand Tufted",
          material: "100% Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["Uncategorized"],
          SKU: "2024081181",
        },
        {
          id: 10009,
          name: "VOLCANO",
          price: [{size: "5 x 8 ft", amount: 105000}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/volcano/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/volcano/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/volcano/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/volcano/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Black"],
          weavingTechnique: "Hand Tufted",
          material: "NZ Wool & Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["Uncategorized"],
          SKU: "2024081168",
        },
        {
          id: 10010,
          name: "NICO",
          price: [{size: "5 x 7 ft", amount: 33075}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/nico/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/nico/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/nico/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/nico/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Mist"],
          weavingTechnique: "Hand Tufted",
          material: "Wool",
          manufacturer: "Mirzapur Rugs",
          tags: ["Uncategorized"],
          SKU: "2024071017",
        },
        {
          id: 10011,
          name: "OMARA",
          price: [{size: "6 x 9 ft", amount: 153090}, {size: "8 x 10 ft", amount: 226800}, {size: "9 x 12 ft", amount: 306180}],  
          image: [
            "../../assets/products/rugs/mirzapur_rugs/omara/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/omara/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/omara/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/omara/4.webp",
          ],
          story:
            "Introducing our exquisiotted carpets, where craftsmanhip meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
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
          color: ["Charcoal"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Bamboo Silk",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "Uncategorized"],
          SKU: "2024081150",
        },
        {
          id: 10012,
          name: "DIAMOND",
          price: [{size: "4 x 6 ft", amount: 22680}, {size: "5 x 7 ft", amount: 33075}, {size: "6 x 9 ft", amount: 51030}],
          image: [
            "../../assets/products/rugs/mirzapur_rugs/diamond/1.webp",
            "../../assets/products/rugs/mirzapur_rugs/diamond/2.webp",
            "../../assets/products/rugs/mirzapur_rugs/diamond/3.webp",
            "../../assets/products/rugs/mirzapur_rugs/diamond/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet, crafted for elegance and comfort. Made from luxurious materials for a plush, durable surface. Perfect for adding warmth or sophistication to any room. Experience style and quality with our exquisite collection.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Ivory"],
          weavingTechnique: "Hand Tufted",
          material: "Wool & Viscose",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "Modern"],
          SKU: "2024071043",
        },
        {
          id: 10013,
          name: "DOYAN",
          price: [{size: "8 x 10 ft", amount: 192780}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/doyan/1.webp",
            "../assets/products/rugs/mirzapur_rugs/doyan/2.webp",
          ],
          story:
            "Introducing our exquisite hand-knotted carpets, where craftsmanship meets luxury. Each carpet is meticulously woven by skilled artisans using traditional techniques passed down through generations, resulting in a masterpiece of beauty and quality. Made from premium materials such as wool, silk, and cotton, our hand-knotted carpets boast unparalleled softness, durability, and intricate detail. Whether adorning your living room, bedroom, or office, these carpets add a touch of elegance and sophistication to any space. Elevate your decor with the timeless allure of our hand-knotted carpets, where every thread tells a story of artistry and tradition.",
          description:
            "Doyan is designed with everyday life in mind, this hard-wearing texture is perfect for spaces requiring a texture full of life and beauty, whilst being robust enough to stand the test of time. Texture is made by blending Bamboo Silk with Wool to create harmony of pattern and texture.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 5mm Cut Pile",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Azure"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Bamboo Silk",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract"],
          SKU: "2023071167",
        },
        {
          id: 10014,
          name: "FANGO",
          price: [{size: "2.6 x 6 ft", amount: 27563}, {size: "5 x 7 ft", amount: 65313}, {size: "8 x 10 ft", amount: 147000}, {size: "9 x 12 ft", amount: 198450}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/fango/1.jpg",
            "../assets/products/rugs/mirzapur_rugs/fango/2.webp",
            "../assets/products/rugs/mirzapur_rugs/fango/3.webp",
            "../assets/products/rugs/mirzapur_rugs/fango/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Brown", "Dark Brown"],
          weavingTechnique: "Hand Tufted",
          material: "100% TENCEL",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2023081301",
        },
        {
          id: 10015,
          name: "LARIAL",
          price: [{size: "5 x 7 ft", amount: 45938}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/larial/1.webp",
            "../assets/products/rugs/mirzapur_rugs/larial/2.webp",
            "../assets/products/rugs/mirzapur_rugs/larial/3.webp",
            "../assets/products/rugs/mirzapur_rugs/larial/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Light Brown"],
          weavingTechnique: "Hand Tufted",
          material: "New Zeland Wool & Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "MR-065",
        },
        {
          id: 10016,
          name: "LUSH",
          price: [{size: "2.6 x 6 ft", amount: 27563}, {size: "5 x 7 ft", amount: 65313}, {size: "6 x 9 ft", amount: 105300}, {size: "8 x 10 ft", amount: 147000}, {size: "9 x 12 ft", amount: 198450}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/lush/1.webp",
            "../assets/products/rugs/mirzapur_rugs/lush/2.webp",
            "../assets/products/rugs/mirzapur_rugs/lush/3.webp",
            "../assets/products/rugs/mirzapur_rugs/lush/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Biege", "Blue", "Brown"],
          weavingTechnique: "Hand Tufted",
          material: "100% Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2023081298",
        },
        {
          id: 10017,
          name: "SKYE",
          price: [{size: "8 x 10 ft", amount: 71400}, {size: "9 x 12 ft", amount: 96390}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/skye/1.webp",
            "../assets/products/rugs/mirzapur_rugs/skye/2.webp",
            "../assets/products/rugs/mirzapur_rugs/skye/3.webp",
            "../assets/products/rugs/mirzapur_rugs/skye/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height : 12 - 14 MM 100% Cut",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Blue", "Natural"],
          weavingTechnique: "Hand Tufted",
          material: "Wool",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2024081177",
        },
        {
          id: 10018,
          name: "DISCOID",
          price: [{size: "8 x 8 ft", amount: 105000}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/discoid/1.webp",
            "../assets/products/rugs/mirzapur_rugs/discoid/2.webp",
            "../assets/products/rugs/mirzapur_rugs/discoid/3.webp",
            "../assets/products/rugs/mirzapur_rugs/discoid/4.webp",
          ],
          story:
            "It is a subtle representation of the earth from a bird's view. Swirling around itself discoid denotes the circular nature of life. what goes around comes around. spreading the goodness and richness of Tencel all around the wide circular shape and the ground of wool that stays steady and changes linearly. Discoid brings the beauty of the earth with its calm and harmonious textures to any type of interior.",
          description:
            "It is a subtle representation of the earth from a bird’s view. Swirling around itself discoid denotes the circular nature of life.",
          details: [
            "Use : Indoor use only",
            "Pile Height : ",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["Blue", "Pink"],
          weavingTechnique: "Hand Knotted",
          material: "Wool & Tencel",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "down havoc", "modern", "shape rugs"],
          SKU: "2023071166 ",
        },
        {
          id: 10019,
          name: "COASTAL",
          price: [{size: "8 x 10 ft", amount: 105000}, {size: "9 x 12 ft", amount: 141750}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/coastal/1.webp",
            "../assets/products/rugs/mirzapur_rugs/coastal/2.webp",
            "../assets/products/rugs/mirzapur_rugs/coastal/3.webp",
            "../assets/products/rugs/mirzapur_rugs/coastal/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height :  12 - 14 MM 100% Cut ",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          color: ["multi"],
          weavingTechnique: "Hand Tufted",
          material: "100% TENCAL",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2024081189 ",
        },
        {
          id: 10020,
          name: "IMPRESSION",
          price: [{size: "5 x 7 ft", amount: 64313}, {size: "6 x 9 ft", amount: 99225}, {size: "8 x 10 ft", amount: 147000}],
          image: [
            "../assets/products/rugs/mirzapur_rugs/impression/1.webp",
            "../assets/products/rugs/mirzapur_rugs/impression/2.webp",
            "../assets/products/rugs/mirzapur_rugs/impression/3.webp",
            "../assets/products/rugs/mirzapur_rugs/impression/4.webp",
          ],
          story:
            "Introducing our hand-tufted carpet, meticulously crafted with precision and care to bring elegance and comfort to your space. Made from luxurious materials, each rug is expertly placed to create a plush and durable surface that enhances your room. Whether you’re looking to add warmth to your living room or sophistication to your office, our hand-tufted carpet is the perfect choice. Experience the perfect blend of style and quality with our exquisite hand-tufted carpet collection.",
          description:
            "Introducing our hand-tufted carpet. Crafted with precision from luxurious materials, it offers a plush, durable surface. Perfect for adding elegance to any room. Experience quality and style.",
          details: [
            "Use : Indoor use only",
            "Pile Height :  12 - 14 MM 100% Cut ",
            "Shedding is Inherent to Wool Rugs",
            "Suitable for Medium Traffic Areas",
            "Good Weave Certified",
            "Made in India",
          ],
          dimensionsAvailable: ["5 x 7 ft", "6 x 9 ft", "8 x 10 ft"],
          color: ["brown", "grey"],
          weavingTechnique: "Hand Tufted",
          material: "100% TENCEL",
          manufacturer: "Mirzapur Rugs",
          tags: ["abstract", "modern"],
          SKU: "2023071187 ",
        },
      ],
    },
    {
      category: "Vintage Collections",
      categoryId: 20000,
      items: [
        
      ],
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
        {
          id: 30002,
          name: "Panther Head Showpiece",
          price: [{ size: "Height: 13 inches", amount: 1050 }],
          image: ["../assets/products/home_decor/vintage_crafts/panther_head_showpiece/1.jpg"],
          description: "Indulge in the essence of the wild with our Panther Head Showpiece, meticulously handcrafted to perfection. Crafted from premium resin, its intricate details and lifelike features capture the essence of the majestic panther. Standing tall at 13 inches, it commands attention and admiration, serving as a captivating centerpiece for any room. Ideal for gifting, it embodies strength and grace, making it a thoughtful gesture for loved ones who appreciate timeless beauty. Elevate your space with the allure of the panther, a symbol of elegance and power, embodied in this exquisite showpiece.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['White', 'Black'],
          weavingTechnique: null,
          material: ['Resin'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070202",
        },
        {
          id: 30003,
          name: "Bioscope with Gramophone",
          price: [{ size: "12 x 10 inches", amount: 2950 }],
          image: ["../assets/products/home_decor/vintage_crafts/bioscope_with_gramophone/1.jpg"],
          description: "Revive the Romance of Classic Eras: Our Vintage Gramophone with Bioscope – A Melody for Your Ears, a Cinematic Journey for Your Soul.",
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
          SKU: "2025070203",
        },
        {
          id: 30004,
          name: "Ramayana Theme Elephant showpiece",
          price: [{ size: "Height: 5 inches", amount: 1200 }],
          image: [
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/1.jpg",
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/2.jpg",
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/3.jpg",
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/4.jpg",
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/5.jpg",
            "../assets/products/home_decor/vintage_crafts/ramayan_theme_elephant_showpiece/6.jpg",

          ],
          description: "Bring the essence of ancient mythology into your home or gift a piece of cultural heritage to a loved one. With this Ramayana-themed elephant showpiece, you're not just acquiring a decor item but a tangible connection to the timeless narratives that have shaped generations. Elevate your space with the spirit of the Ramayana, embodied in this exquisite handcrafted showpiece.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Gold'],
          weavingTechnique: null,
          material: ['Resin'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070204",
        },
        {
          id: 30005,
          name: "Brass Tripod Telescope",
          price: [{ size: "Height: 12 inches", amount: 1400 }],
          image: ["../assets/products/home_decor/vintage_crafts/brass_tripod_telescope/1.jpg"],
          description: "This handcrafted brass tripod telescope is a stunning blend of vintage charm and intricate craftsmanship. The telescope features a beautifully engraved leather-wrapped body and is mounted on a functional brass tripod. It's a perfect decorative piece for a study or office, adding a touch of classic elegance and old-world exploration.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Brown'],
          weavingTechnique: null,
          material: ['Brass'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070205",
        },
        {
          id: 30006,
          name: "Vintage Tripod Camera",
          price: [{ size: "Height: 11 inches", amount: 750 }],
          image: ["../assets/products/home_decor/vintage_crafts/vintage_tripod_camera/1.jpg"],
          description: "This Vintage Tripod Camera is a beautifully crafted dummy showpiece, perfect for adding a retro touch to any room. Made to resemble a classic camera, it features intricate detailing and a stylish tripod stand. This 11-inch decorative piece is ideal for collectors or anyone seeking a unique, vintage-inspired accent.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Black'],
          weavingTechnique: null,
          material: ['Resin'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070206",
        },
        {
          id: 30007,
          name: "Walking Panther Showpiece",
          price: [{ size: "Height: 16 inches", amount: 1499 }],
          image: ["../assets/products/home_decor/vintage_crafts/walking_panther_showpiece/1.jpg", "../assets/products/home_decor/vintage_crafts/walking_panther_showpiece/2.jpg"],
          description: "Elevate your decor with our stunning Panther Showpiece. Crafted from high-quality resin, it features intricate details that capture the power and elegance of the panther. This eye-catching sculpture adds a touch of wild beauty to any space, making it an ideal gift or a bold centerpiece for your home. Standing 16 inches tall, it's a timeless statement piece that exudes both strength and grace.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Black'],
          weavingTechnique: null,
          material: ['Resin'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070207",
        },
        {
          id: 30008,
          name: "Vintage Typewriter Showpiece",
          price: [{ size: "10x10x10 inches", amount: 1950 }],
          image: ["../assets/products/home_decor/vintage_crafts/vintage_typewriter_showpiece/1.jpg"],
          description: "Revive the past and adorn your space with our Vintage Typewriter Showpiece, a true masterpiece of decor. Crafted from iron and measuring 10x10x10 inches, it exudes an authentic antique charm that effortlessly enhances any room. Immerse yourself in the elegance of a bygone era with this unique typewriter showpiece.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Brown'],
          weavingTechnique: null,
          material: ['Iron'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070208",
        },
        {
          id: 30009,
          name: "Wooden Telephone",
          price: [{ size: "Height: 12 inches", amount: 2400 }],
          image: ["../assets/products/home_decor/vintage_crafts/wooden_telephone/1.jpg"],
          description: "This 12-inch Wooden Telephone is a striking blend of vintage aesthetics and fine craftsmanship. Made from wood and brass, it features a classic rotary dial design and a substantial handset. This decorative piece adds a touch of historical elegance and nostalgia to any home or office decor.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Brown'],
          weavingTechnique: null,
          material: ["Brass", "Wood"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070209",
        },
        {
          id: 30010,
          name: "Brass Chess set",
          price: [{ size: "16 x 16 inches", amount: 3499 }],
          image: ["../assets/products/home_decor/vintage_crafts/brass_chess_set/1.jpg"],
          description: "This exquisite 16x16 inch Brass Chess set is a blend of artistry and classic game play. It features a finely crafted wooden box that serves as the chessboard, complete with detailed brass coins. Each piece showcases intricate detail, making this not just a game, but a statement piece for any collector or enthusiast.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Brown'],
          weavingTechnique: null,
          material: ['Brass', 'Wood'],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070210",
        },
        {
          id: 30011,
          name: "Metal Wall Hanging Bullet Motorcycle",
          price: [{size: "60cm x 3cm x 35cm", amount: 2950}],
          image: [
            "../assets/products/wall_hanging/vintage_crafts/bullet_motorcycle/1.jpg", 
            "../assets/products/wall_hanging/vintage_crafts/bullet_motorcycle/2.jpg"
          ],
          description: "Enhance your living space with this unique Metal Wall Hanging Bullet Motorcycle. This handcrafted piece adds a rustic, vintage charm to any room. The vibrant blue and detailed design make it a captivating focal point, perfect for a bedroom, garage, or man cave. Made from durable metal, it's a stylish statement piece that reflects your passion for classic bikes.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['multi'],
          weavingTechnique: null,
          material: "Metal",
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070101",
        },
        {
          id: 30012,
          name: "Metal Wall Hanging Vintage Car",
          price: [{size: "Length: 23cm, Width: 5cm, Height: 50cm", amount: 2950}],
          image: [
            '../assets/products/wall_hanging/vintage_crafts/vintage_car/1.jpg'
          ],
          description: "Enhance your living space with this unique Metal Wall Hanging Vintage Car. This handcrafted piece adds a rustic, vintage charm to any room. The vibrant blue and detailed design make it a captivating focal point, perfect for a bedroom, garage, or man cave. Made from durable metal, it's a stylish statement piece that reflects your passion for classic cars.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Brown', 'Black'],
          weavingTechnique: null,
          material: "Metal",
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070102",
        },
        {
          id: 30013,
          name: "Metal Wall Hanging Cycle",
          price: [{size: "Length: 48 x Width: 9 x Height: 33 cm", amount: 2950}],
          image: ['../assets/products/wall_hanging/vintage_crafts/cycle/1.jpg'],
          description: "Enhance your living space with this unique Metal Wall Hanging Cycle. This handcrafted piece adds a rustic, vintage charm to any room. The vibrant blue and detailed design make it a captivating focal point, perfect for a bedroom, garage, or man cave. Made from durable metal, it's a stylish statement piece that reflects your passion for classic cycles.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Golden'],
          weavingTechnique: null,
          material: "Metal",
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070103",
        },
        {
          id: 30014,
          name: "Metal Wall Mounted Motor Bike",
          price: [{size: "Length: 60 inches, Height: 34 inches", amount: 4500}],
          image: ["../assets/products/wall_hanging/vintage_crafts/motorcycle_american/1.jpg", "../assets/products/wall_hanging/vintage_crafts/motorcycle_american/2.jpg"],
          description: "Enhance your living space with this unique Metal Wall Mounted Motor Bike. This handcrafted piece adds a rustic, vintage charm to any room. The vibrant blue and detailed design make it a captivating focal point, perfect for a bedroom, garage, or man cave. Made from durable metal, it's a stylish statement piece that reflects your passion for classic bikes.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Multi'],
          weavingTechnique: null,
          material: "Metal",
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070104",
        },
        {
          id: 30015,
          name: "Wooden wall clock",
          price: [{size: "24x24 inches", amount: 2500}],
          image: ["../assets/products/wall_hanging/vintage_crafts/wall_clock/1.jpg", "../assets/products/wall_hanging/vintage_crafts/wall_clock/2.jpg"],
          description: "Adorn your space with this captivating Wooden Wall Clock, blending classic Roman numerals with exposed industrial gears for a truly unique aesthetic. Crafted from high-quality wood, this 24x24 inch timepiece is more than just a clock; it's a statement piece. Its intricate design and rustic charm make it a perfect addition to any living room, office, or hallway, adding a touch of vintage elegance and mechanical intrigue to your décor.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Black'],
          weavingTechnique: null,
          material: ["Wood"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070105",
        },
        {
          id: 30016,
          name: "Wall Mounted Elephant Head",
          price: [{size: "16 inches", amount: 1600}],
          image: ["../assets/products/wall_hanging/vintage_crafts/elephant_head/1.jpg"],
          description: "Elephant Majesty for Every Space: Unwrap the allure of our exquisite elephant head showpiece. Perfect for gifting sophistication or adorning walls with a touch of majestic charm. Elevate your decor game!",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['White'],
          weavingTechnique: null,
          material: ["Resin"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070106",
        },
        {
          id: 30017,
          name: "Wooden Wall clock",
          price: [{size: "14 inches", amount: 1300}],
          image: ["../assets/products/wall_hanging/vintage_crafts/wooden_wall_clock/1.jpg"],
          description: "Elevate your space with our 14-inch Vintage Wooden Wall Clock, a charming blend of timeless design and practical functionality. Crafted with care, this exquisite clock boasts a warm wooden finish that exudes elegance and nostalgia. The generous 14-inch size ensures it catches the eye, while the classic Roman numerals and ornate clock hands lend a touch of vintage sophistication to any room. Whether it graces your living room, kitchen, or office, this wall clock adds a distinctive character to your decor, evoking the beauty of days gone by. Bring the allure of vintage charm into your life with this stunning timepiece, a true conversation starter that keeps you on schedule in style.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Multi'],
          weavingTechnique: null,
          material: ["Wood"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070107",
        },
        {
          id: 30018,
          name: "Train Engine Wall Clock",
          price: [{size: "12 inches", amount: 1400}],
          image: ["../assets/products/wall_hanging/vintage_crafts/wall_clock_train_engine/1.jpg"],
          description: "Elevate your space with the timeless charm of our Vintage Metal Train Engine Design Wall Clock. This exquisite timepiece boasts a beautifully handcrafted design inspired by the majestic trains of yesteryears. Measuring 12 inches in diameter, the clock’s dial showcases intricate detailing, capturing the essence of a bygone era.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Multi'],
          weavingTechnique: null,
          material: ["Wood"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070108",
        },
        {
          id: 30019,
          name: "Vintage Wooden Wall Clock",
          price: [{size: "14 inches", amount: 1300}],
          image: [
            "../assets/products/wall_hanging/vintage_crafts/wall_clock_vintage_wood/1.jpg",
            "../assets/products/wall_hanging/vintage_crafts/wall_clock_vintage_wood/2.jpg",
            "../assets/products/wall_hanging/vintage_crafts/wall_clock_vintage_wood/3.jpg",
            "../assets/products/wall_hanging/vintage_crafts/wall_clock_vintage_wood/4.jpg"
          ],
          description: "Introducing our exquisite Vintage Wooden Wall Clock, a timeless piece that adds a touch of elegance to any living space. Crafted with care and attention to detail, this hand-crafted clock measures 14 inches, making it the perfect statement piece for your home or office.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Golden'],
          weavingTechnique: null,
          material: ["Wood"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070109",
        },
        {
          id: 30020,
          name: "Metal Big size Wall Clock",
          price: [{size: "24 inches", amount: 1300}],
          image: [
            "../assets/products/wall_hanging/vintage_crafts/wall_clock_metal_big_size/1.jpg",
          ],
          description: "Introducing our stunning 24-inch Big Size Metal Wall Clock, the perfect centerpiece for any room! Crafted with precision and designed to make a statement, this impressive timepiece combines functionality with elegance.",
          story: null,
          details: [
            "Use : Indoor use only",
            "Suitable for Medium Traffic Areas",
            "Made in India",
          ],
          color: ['Golden'],
          weavingTechnique: null,
          material: ["Metal"],
          manufacturer: "Vintage Crafts",
          tags: ["abstract", "Modern"],
          SKU: "2025070110",
        },
      ],
    },
  ];

const seedProducts = async () => {
    try {
        // Wait for database connection
        await connectDB();
        
        logger.info('Starting product seeding...');
        
        // Clear existing products
        await Product.deleteMany({});
        logger.info('Cleared existing products');

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

        logger.info(`Inserting ${productsToInsert.length} products...`);
        await Product.insertMany(productsToInsert);
        
        logger.info('Products seeded successfully');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed', { error: error.message, stack: error.stack });
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Execute seeding
seedProducts();
