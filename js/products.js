/* ==========================================================================
   YOUR PRODUCTS
   --------------------------------------------------------------------------
   To add a product, copy one block { ... }, paste it at the end of the list,
   and change the details. Put the photo in assets/products/.

     id        unique short name, no spaces          "red-sneakers"
     name      what shoppers see                     "Red Canvas Sneakers"
     category  an id from config.js categories        "fashion"
     price     number, no commas or ₦                 25000
     oldPrice  optional: old price, shows the discount  30000
     stock     optional: units left, shown in Flash Sales  8
     image     path to the photo                      "assets/products/red-sneakers.jpg"
     tag       optional small label on the photo      "New" or "Sale"
     featured  optional: true puts it in "This week's picks" and first in the hero
     description  one or two sentences
     specs     optional: any details as  "Label": "value"

   NOTE: the products below are SAMPLES with stand-in photos.
   Replace them with your real products, prices and photos before launch.
   ========================================================================== */
window.PRODUCTS = [
  /* ---- Fashion & Bags ---- */
  { id: "led-sneakers", name: "White LED Sneakers", category: "fashion", price: 32000, oldPrice: 38000, stock: 10, tag: "Sale", featured: true,
    image: "assets/products/sneakers.webp",
    description: "Clean white lace-ups with a light-up sole that charges by USB. Soft inner lining for all-day wear.",
    specs: { Sizes: "38 – 45", Charging: "USB, about 6 hours of light", Colour: "White" } },
  { id: "tooled-handbag", name: "Tooled Leather Handbag", category: "fashion", price: 54000, oldPrice: 62000, stock: 7, featured: true,
    image: "assets/products/handbag.jpg",
    description: "Hand-tooled genuine leather with a strong top handle and a zipped inner pocket. Ages beautifully.",
    specs: { Material: "Genuine leather", Size: "30 × 22 × 10 cm" } },
  { id: "ankara-6yds", name: "Ankara Fabric, 6 Yards", category: "fashion", price: 14500,
    image: "assets/products/ankara.jpg",
    description: "Bright, colour-fast wax print cotton. Enough for a full outfit or two tops.",
    specs: { Length: "6 yards", Material: "100% cotton wax print" } },

  /* ---- Watches & Jewellery ---- */
  { id: "auto-watch", name: "Automatic Wristwatch", category: "watches", price: 68000, tag: "New",
    image: "assets/products/watch.jpg",
    description: "Self-winding movement with a clear case back, so you can watch it tick. No battery needed.",
    specs: { Movement: "Automatic", Case: "40 mm stainless steel", "Water resistance": "50 m" } },

  /* ---- Phones & Tablets ---- */
  { id: "fold-phone", name: "Foldable Smartphone", category: "phones", price: 685000, oldPrice: 760000, stock: 4, featured: true,
    image: "assets/products/smartphone.jpg",
    description: "A full-size screen that folds into your pocket. Dual SIM, fast charging and a sharp triple camera.",
    specs: { Storage: "256 GB", RAM: "12 GB", SIM: "Dual", Warranty: "12 months" } },
  { id: "tablet-10", name: "10-inch Android Tablet", category: "phones", price: 145000, oldPrice: 168000, stock: 9,
    image: "assets/products/tablet.jpg",
    description: "Big, bright screen for school, films and video calls. Long battery and expandable storage.",
    specs: { Screen: "10.1 inch", Storage: "64 GB + microSD", Battery: "7000 mAh" } },
  { id: "powerbank-20k", name: "Power Bank 20,000 mAh", category: "phones", price: 18500, oldPrice: 22000, stock: 20, tag: "Sale",
    image: "assets/products/powerbank.jpg",
    description: "Charges a phone four to five times over. Two USB outputs and fast charging for NEPA days.",
    specs: { Capacity: "20,000 mAh", Outputs: "2 × USB-A, 1 × USB-C" } },
  { id: "earphones", name: "Wired Earphones with Mic", category: "phones", price: 6500,
    image: "assets/products/earbuds.jpg",
    description: "Clear sound and an in-line mic for calls. Comfortable soft tips in three sizes.",
    specs: { Connector: "3.5 mm", Cable: "1.2 m" } },

  /* ---- Electronics & Audio ---- */
  { id: "bt-headphones", name: "Bluetooth Over-Ear Headphones", category: "electronics", price: 42000, oldPrice: 52000, stock: 12, featured: true,
    image: "assets/products/headphones.jpg",
    description: "Deep bass, soft ear cushions and up to 35 hours of playback on one charge.",
    specs: { Battery: "Up to 35 hours", Connection: "Bluetooth 5.0", Weight: "180 g" } },
  { id: "flip-speaker", name: "Portable Bluetooth Speaker", category: "electronics", price: 58000, oldPrice: 69000, stock: 6,
    image: "assets/products/speaker.jpg",
    description: "Splash-proof speaker with big sound for parties, the beach or the kitchen.",
    specs: { Battery: "12 hours", Waterproof: "IPX7" } },
  { id: "dslr-camera", name: "Full-Frame DSLR Camera", category: "electronics", price: 2350000,
    image: "assets/products/camera.jpg",
    description: "Professional body for weddings, events and studio work. Sharp, fast and rugged.",
    specs: { Sensor: "45.7 MP full frame", Video: "4K", Note: "Body only" } },

  /* ---- Computers ---- */
  { id: "laptop-14", name: "14-inch Laptop", category: "computing", price: 465000, oldPrice: 520000, stock: 5,
    image: "assets/products/laptop.jpg",
    description: "Light, quick and ready for work or school. Solid-state storage so it starts in seconds.",
    specs: { Processor: "Intel Core i5", RAM: "8 GB", Storage: "512 GB SSD", Screen: "14 inch" } },

  /* ---- Kitchen & Dining ---- */
  { id: "utensil-set", name: "Kitchen Utensil Set", category: "kitchen", price: 15500,
    image: "assets/products/blender.jpg",
    description: "Turner, skimmer, whisks, sieve and measuring spoons on a wall rail. Everything within reach.",
    specs: { Pieces: "9 plus rail", Material: "Stainless steel" } },
  { id: "nonstick-pot", name: "Non-stick Saucepan, 20 cm", category: "kitchen", price: 21000, oldPrice: 26000, stock: 15,
    image: "assets/products/pot.jpg",
    description: "Even heat for stews and sauces, and nothing sticks. Works on gas and electric cookers.",
    specs: { Size: "20 cm", Capacity: "2.5 litres" } },
  { id: "electric-kettle", name: "Electric Kettle, 1.8 L", category: "kitchen", price: 16500, oldPrice: 21000, stock: 18, featured: true,
    image: "assets/products/kettle.jpg",
    description: "Boils fast and switches itself off. Water window and a cool-touch handle.",
    specs: { Capacity: "1.8 litres", Power: "2000 W" } },
  { id: "coffee-mugs", name: "Ceramic Mugs, Set of 4", category: "kitchen", price: 9500,
    image: "assets/products/mugs.jpg",
    description: "Sturdy everyday mugs for tea, coffee or pap. Dishwasher and microwave safe.",
    specs: { Pieces: "4", Capacity: "350 ml each" } },

  /* ---- Beauty & Personal Care ---- */
  { id: "shea-butter", name: "Pure Shea Butter, 500 g", category: "beauty", price: 7500, tag: "Bestseller", featured: true,
    image: "assets/products/shea.jpg",
    description: "Unrefined shea butter from Northern Nigeria. For skin, hair and lips.",
    specs: { Weight: "500 g", Type: "Unrefined" } },
  { id: "perfume-set", name: "Perfume Collection", category: "beauty", price: 38000, oldPrice: 45000, stock: 8,
    image: "assets/products/perfume.jpg",
    description: "A set of long-lasting eau de parfum bottles. Lovely as a gift.",
    specs: { Bottles: "3 × 50 ml" } },
  { id: "lipstick-five", name: "Matte Lipstick, Set of 5", category: "beauty", price: 12500,
    image: "assets/products/lipstick.jpg",
    description: "Five everyday shades, from nude to deep red. Smooth and long-wearing.",
    specs: { Shades: "5", Finish: "Matte" } },
  { id: "handmade-soap", name: "Handmade Soap Bars", category: "beauty", price: 4500,
    image: "assets/products/soap.jpg",
    description: "Gentle soaps made with natural oils. No harsh detergents.",
    specs: { Pack: "3 bars", Weight: "120 g each" } },

  /* ---- Groceries & Pantry ---- */
  { id: "basmati-rice", name: "Basmati Rice, 5 kg", category: "groceries", price: 19500, oldPrice: 23500, stock: 25,
    image: "assets/products/rice.jpg",
    description: "Long-grain, fragrant and stone-free. Cooks fluffy every time.",
    specs: { Weight: "5 kg" } },
  { id: "palm-oil", name: "Red Palm Oil, 4 L", category: "groceries", price: 11000,
    image: "assets/products/palmoil.jpg",
    description: "Fresh, thick and bright red. Straight from the mill for your soups and stews.",
    specs: { Volume: "4 litres" } },
  { id: "coffee-beans", name: "Roasted Coffee Beans, 1 kg", category: "groceries", price: 23000,
    image: "assets/products/coffee.jpg",
    description: "Medium roast whole beans with a chocolatey finish. Grind fresh for the best cup.",
    specs: { Weight: "1 kg", Roast: "Medium" } },
  { id: "spice-mix", name: "Mixed Spices Pack", category: "groceries", price: 6800,
    image: "assets/products/spices.jpg",
    description: "Curry, thyme, ginger, nutmeg, pepper and more. Everything the pot needs.",
    specs: { Jars: "8" } },

  /* ---- Baby & Kids ---- */
  { id: "baby-bottles", name: "Silicone Baby Bottles", category: "baby", price: 9800,
    image: "assets/products/babybottle.jpg",
    description: "Soft, squeezable bottles with anti-colic teats. BPA free.",
    specs: { Pack: "2 bottles", Size: "240 ml" } },
  { id: "wood-blocks", name: "Wooden Shape Blocks", category: "baby", price: 8500,
    image: "assets/products/blocks.webp",
    description: "Colourful wooden shapes to stack, sort and learn. Safe paint, smooth edges.",
    specs: { Pieces: "24", Age: "18 months +" } },
  { id: "teddy-bear", name: "Soft Teddy Bear", category: "baby", price: 11000,
    image: "assets/products/teddy.webp",
    description: "A cuddly friend for nap time. Washable and very soft.",
    specs: { Height: "35 cm" } },
  { id: "baby-shoes", name: "Classic Baby Shoes", category: "baby", price: 7000,
    image: "assets/products/babyshoes.jpg",
    description: "Soft-soled first shoes that let little feet move naturally.",
    specs: { Sizes: "0 – 18 months" } },

  /* ---- Sports & Fitness ---- */
  { id: "football", name: "Match Football, Size 5", category: "sports", price: 12500,
    image: "assets/products/football.jpg",
    description: "Stitched panels and a strong bladder for grass or sand. Holds its shape.",
    specs: { Size: "5" } },
  { id: "dumbbell-set", name: "Colour Dumbbell Set", category: "sports", price: 34000, oldPrice: 41000, stock: 6,
    image: "assets/products/dumbbells.jpg",
    description: "Neoprene-coated dumbbells in several weights for home workouts.",
    specs: { Weights: "1 kg to 5 kg pairs" } },
  { id: "yoga-mat", name: "Yoga Mat, 6 mm", category: "sports", price: 9000,
    image: "assets/products/yogamat.jpg",
    description: "Thick, non-slip mat for yoga, stretching and floor exercise.",
    specs: { Thickness: "6 mm", Size: "183 × 61 cm" } },
  { id: "city-bicycle", name: "City Bicycle", category: "sports", price: 185000, oldPrice: 210000, stock: 3,
    image: "assets/products/bicycle.jpg",
    description: "Comfortable upright bike for errands and weekend rides.",
    specs: { Frame: "Steel", Wheels: "26 inch" } },
];
