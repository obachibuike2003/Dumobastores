/* ==========================================================================
   STORE SETTINGS — edit these to make the store yours.
   ========================================================================== */
window.STORE = {
  name: "Dumoba Stores",

  // Your logo icon (square). Leave it empty ("") to show a plain "D" mark instead.
  logo: "assets/logo-icon.png",
  tagline: "Shop. Discover. Get Delivered.",

  // Orders are sent to this WhatsApp number. International format, digits only.
  // Example for 0803 123 4567: "2348031234567"
  whatsapp: "2348000000000",
  phoneDisplay: "0800 000 0000",          // shown in the top bar
  email: "orders@dumobastores.com",

  currency: "₦",
  locale: "en-NG",

  // ---- Payment: customers pay by bank transfer at checkout ----
  payment: {
    bankName: "YOUR BANK NAME",          // e.g. "GTBank"
    accountName: "DUMOBA STORES",
    accountNumber: "0000000000",         // your 10-digit account number
    // Optional: get a free key at web3forms.com (enter your email, they send a key).
    // With it, every order is emailed to you automatically. Without it, the
    // customer's email app opens with the order so they can send it to you.
    orderEmailKey: "",
    // Optional: your Paystack PUBLIC key (pk_live_...) to also accept card,
    // transfer and USSD with instant confirmation. Leave empty to hide it.
    paystackPublicKey: "",
  },

  // ---- Where you are ----
  city: "Awka",
  homeState: "Anambra",

  // ---- Delivery fees (in naira) and times ----
  delivery: {
    home: 2000,           // fee within Anambra State
    nearby: 3500,         // fee to the nearby states listed below
    other: 5500,          // fee to every other state
    nearbyStates: ["Enugu", "Imo", "Abia", "Ebonyi", "Delta", "Kogi"],
    freeOver: 100000,     // free delivery when the order is at least this much (0 = never)
    homeDays: "Same day or next day",
    nearbyDays: "1–3 working days",
    otherDays: "3–5 working days",
  },

  // Messages in the thin strip at the very top
  topStrip: [
    "Pay by bank transfer at checkout",
    "Delivery to all 36 states",
    "Free delivery on orders over ₦100,000",
  ],

  // Flash sale ends at this hour every day (24-hour clock). The timer counts down to it.
  flashSaleEndsAt: 23,

  // Banners in the big slider on the home page.
  // image: a product photo · link: where the button goes (#/category/<id> or #/product/<id>)
  banners: [
    { title: "Phones & Tablets", text: "Foldables, tablets and power banks at prices you will like.", button: "Shop phones",
      image: "assets/products/smartphone.jpg", link: "#/category/phones", theme: "blue" },
    { title: "Kitchen Week", text: "Pots, kettles and utensils for the home. Save up to 20%.", button: "Shop kitchen",
      image: "assets/products/kettle.jpg", link: "#/category/kitchen", theme: "navy" },
    { title: "Glow up with Shea", text: "Pure shea butter, soaps and beauty favourites.", button: "Shop beauty",
      image: "assets/products/shea.jpg", link: "#/category/beauty", theme: "sky" },
  ],

  // Categories. Add as many as you like.
  // id: short code used in products.js · name: what shoppers see
  // icon: one of fashion, watch, phone, tv, laptop, kitchen, beauty, grocery, baby, sports, home, car, book, health
  categories: [
    { id: "fashion",     name: "Fashion & Bags",          icon: "fashion" },
    { id: "watches",     name: "Watches & Jewellery",     icon: "watch" },
    { id: "phones",      name: "Phones & Tablets",        icon: "phone" },
    { id: "electronics", name: "Electronics & Audio",     icon: "tv" },
    { id: "computing",   name: "Computers",               icon: "laptop" },
    { id: "kitchen",     name: "Kitchen & Dining",        icon: "kitchen" },
    { id: "beauty",      name: "Beauty & Personal Care",  icon: "beauty" },
    { id: "groceries",   name: "Groceries & Pantry",      icon: "grocery" },
    { id: "baby",        name: "Baby & Kids",             icon: "baby" },
    { id: "sports",      name: "Sports & Fitness",        icon: "sports" },
  ],
};
