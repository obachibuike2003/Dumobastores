# Dumoba Stores website

Plain HTML, CSS and JavaScript. No frameworks, no build step. Double-click `index.html` to open it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `css/styles.css` | All the design. Colours are at the top (`--blue`, `--blue-deep`, …) |
| `js/config.js` | **Store settings**: name, logo, WhatsApp number, email, categories |
| `js/products.js` | **Your products** |
| `js/app.js` | How the shop works (search, filters, cart, checkout) |
| `assets/products/` | Product photos |

## Before you launch

1. **WhatsApp number**: open `js/config.js` and replace `2348000000000` with your number (e.g. `2348031234567`).
2. **Email**: set `email` in the same file.
3. **Logo**: done. The icon is `assets/logo-icon.png`, the full logo `assets/logo-full.png`, the tab icon `assets/favicon.png`. The tagline is `tagline` in `js/config.js`.
4. **Products**: the 32 products in `js/products.js` are samples with stand-in photos. Replace them with your own.
5. **Delivery and returns text**: check the Help centre answers (in `js/app.js`, search for `function help`) and the delivery box on product pages match your real policy.
6. Delete `CREDITS.md` lines for any sample photos you have removed.

## Admin page (easiest way to manage the store)

Open `admin.html` in **Chrome or Edge on a computer**.

1. Click **Connect store folder** and choose this DUMOBA STORES folder (once; it remembers).
2. Add, edit, duplicate or delete products. Drop in a photo; it is resized and saved to `assets/products/`.
3. Manage **Categories**, home page **Banners** and **Store settings** (WhatsApp number, phone, tagline, top messages).
4. Click **Save changes** (or Ctrl+S). Refresh the store to check.
5. Upload the folder to your host again so customers see the changes.

Each save keeps the previous product list as `js/products.backup.js`.
In other browsers, Save downloads `products.js` and `config.js` for you to copy into the `js` folder.
The admin page changes files on your computer only. It cannot change the live website by itself, so it is safe if someone else opens it.

## Adding a product by hand

Copy one block in `js/products.js`, paste it at the end of the list, and change it:

```js
{ id: "red-sneakers", name: "Red Canvas Sneakers", category: "fashion", price: 25000,
  image: "assets/products/red-sneakers.jpg",
  description: "Light canvas sneakers for everyday wear.",
  specs: { Sizes: "38 to 45" } },
```

Optional: `oldPrice: 30000` (shows a crossed-out price), `tag: "New"`, `featured: true` (shows in "This week's picks").

## Banners, flash sale and top strip

All in `js/config.js`:
- `banners`: the slides on the home page (title, text, button, photo, link, theme `blue` / `navy` / `sky`).
- `flashSaleEndsAt`: the hour the daily countdown runs to. Products with an `oldPrice` appear in Flash Sales; add `stock: 8` to show "8 items left".
- `topStrip`: the short messages in the dark strip at the very top.

A category gets its own row on the home page once it has 5 or more products.

## Adding a category

Add a line to `categories` in `js/config.js`, then use its `id` on your products.

## How orders work

1. Customer fills the cart and taps **Proceed to checkout** (or **Buy now** on a product).
2. They enter name, phone, email, state, city and address. The delivery fee is worked out from the state (Admin → Store settings → Delivery fees).
3. They tap **Place order** and see your bank details, the exact amount and an order number (like `DMB-261109-AB12`) to use as the transfer description, with copy buttons.
4. They tap **I have made the transfer**. The order shows "Payment sent" in their **My orders**.
5. You check your bank app for that order number and amount, then deliver.

**How you get told about orders.** Put a free Web3Forms key in Admin → Store settings ("Order email key"). Every order, and every "I have made the transfer", is then emailed to you automatically. Without the key, the customer's email app opens with the order so they send it to you.

**Optional instant payment.** Put your Paystack **public** key (`pk_live_...`) in Store settings to add "Pay online with Paystack" (card, transfer, USSD). Paystack shows every payment in your Paystack dashboard.

Before launch, set your real bank name, account number and account name in Admin → Store settings.

## Putting it online (free)

- **Netlify**: go to app.netlify.com/drop and drag this whole folder onto the page.
- **GitHub Pages** or **Vercel** also work; upload the folder as it is.

