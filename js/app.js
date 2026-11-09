/* ==========================================================================
   DUMOBA STORES — marketplace logic (vanilla JS, no libraries)
   Pages (by the address after #):
     #/                      home
     #/category/<id>         a category, with filters
     #/search?q=<words>      search results
     #/deals                 everything on sale
     #/product/<id>          product page
     #/cart                  cart and checkout
     #/wishlist              saved items
     #/help                  help centre
   ========================================================================== */
(() => {
  "use strict";
  document.documentElement.classList.add("js");
  const S = window.STORE;
  const P = window.PRODUCTS || [];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const byId = Object.fromEntries(P.map((p) => [p.id, p]));
  const cat = (id) => S.categories.find((c) => c.id === id);
  const money = (n) => S.currency + Math.round(n).toLocaleString(S.locale);
  const off = (p) => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const wa = (text) => `https://wa.me/${S.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const app = $("#app");

  /* ---------- Icons ---------- */
  const ICON = {
    fashion: '<path d="M8 3 4 5.5 5.5 9 7 8.3V21h10V8.3l1.5.7L20 5.5 16 3a4 4 0 0 1-8 0z"/>',
    watch: '<circle cx="12" cy="12" r="5"/><path d="M12 10v2l1.3 1.3M9 7.5 9.7 3h4.6l.7 4.5M9 16.5l.7 4.5h4.6l.7-4.5"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="1.5"/><path d="M8 21h8M12 17v4"/>',
    laptop: '<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M2.5 19h19l-2-4h-15z"/>',
    kitchen: '<path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6zM2 11h20M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3"/>',
    beauty: '<path d="M9 21h6V11H9zM10 11V6l4-3v8"/>',
    grocery: '<path d="M5 8h14l-1.3 11.1a1 1 0 0 1-1 .9H7.3a1 1 0 0 1-1-.9zM9 8V6a3 3 0 0 1 6 0v2"/>',
    baby: '<circle cx="12" cy="8" r="4.5"/><path d="M10.5 8h.01M13.5 8h.01M10.5 10.2c.9.6 2.1.6 3 0M5 21a7 7 0 0 1 14 0"/>',
    sports: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10zM12 3v4M21 10.5l-5-.5M18 19l-3.5-4.5M6 19l3.5-4.5M3 10.5l5-.5"/>',
    home: '<path d="M3 11 12 4l9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    car: '<path d="M4 16V12l2-5h12l2 5v4zM4 16v2h3v-2M17 16v2h3v-2M7.5 13h.01M16.5 13h.01"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
    health: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    truck: '<path d="M2 6h11v10H2zM13 9h4l3 3v4h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    return: '<path d="M4 9h11a5 5 0 0 1 0 10H8"/><path d="M8 5 4 9l4 4"/>',
    chat: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="1.5"/><circle cx="12" cy="12" r="2.5"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  };
  const icon = (name, size = 20, sw = 1.8) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.home}</svg>`;

  /* ---------- Static bits ---------- */
  if (S.logo) $$("[data-logo]").forEach((el) => { el.outerHTML = `<img class="logo__img" src="${esc(S.logo)}" alt="" width="46" height="46">`; });
  if (S.tagline) $$("[data-tagline]").forEach((el) => (el.textContent = S.tagline));
  const tickerItems = [...S.topStrip, `Call to order: <b>${esc(S.phoneDisplay)}</b>`];
  const tickerHtml = tickerItems.map((m) => `<span>${m.includes("<b>") ? m : esc(m)}</span>`).join("");
  $("#ticker").innerHTML = tickerHtml + tickerHtml.replace(/<span>/g, '<span aria-hidden="true">'); // doubled for a seamless loop
  $("#foot-phone").textContent = S.phoneDisplay;
  $("#foot-phone").href = `tel:${S.phoneDisplay.replace(/\s/g, "")}`;
  $("#foot-email").textContent = S.email;
  $("#foot-email").href = `mailto:${S.email}`;
  ["#wa-head", "#wa-float", "#foot-wa"].forEach((s) => ($(s).href = wa(`Hello ${S.name}, I have a question.`)));
  $("#year").textContent = new Date().getFullYear();
  if (S.city) $("#foot-addr").textContent = `${S.city}, ${S.homeState} State, Nigeria`;
  $("#catbar").innerHTML = `<a href="#/" data-cat-link="">${icon("home", 16)}All</a>` + S.categories.map((c) => `<a href="#/category/${c.id}" data-cat-link="${c.id}">${icon(c.icon, 16)}${esc(c.name)}</a>`).join("") + `<a href="#/deals" data-cat-link="deals">${icon("bolt", 16)}Deals</a>`;
  $("#drawer-list").innerHTML = S.categories.map((c) => `<li><a href="#/category/${c.id}">${icon(c.icon)}${esc(c.name)}</a></li>`).join("") + `<li><a href="#/deals">${icon("bolt")}Flash Sales</a></li><li><a href="#/orders">${icon("box")}My orders</a></li><li><a href="#/wishlist">${icon("heart")}Saved items</a></li><li><a href="#/help">${icon("chat")}Help centre</a></li>`;
  $("#footer-cats").innerHTML = S.categories.slice(0, 6).map((c) => `<li><a href="#/category/${c.id}">${esc(c.name)}</a></li>`).join("");

  /* header shadow + back-to-top */
  const header = $(".header"), toTop = $("#to-top");
  addEventListener("scroll", () => {
    header.classList.toggle("scrolled", scrollY > 10);
    toTop.classList.toggle("show", scrollY > 900);
  }, { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

  /* ---------- Mobile drawer ---------- */
  const drawer = $("#drawer");
  $("#menu-btn").addEventListener("click", () => { drawer.hidden = false; $(".drawer__list a", drawer)?.focus(); });
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close-drawer], a")) drawer.hidden = true; });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") drawer.hidden = true; });

  /* ---------- Storage helpers ---------- */
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

  /* ---------- Wishlist ---------- */
  let wish = load("dumoba-wish", []).filter((id) => byId[id]);
  const isWished = (id) => wish.includes(id);
  function updateWish(bump) {
    const el = $("#wish-count"); el.textContent = wish.length; el.hidden = !wish.length;
    if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  }
  function toggleWish(id, btn) {
    wish = isWished(id) ? wish.filter((x) => x !== id) : [id, ...wish];
    store("dumoba-wish", wish); updateWish(true);
    $$(`[data-wish="${CSS.escape(id)}"]`).forEach((b) => { b.classList.toggle("on", isWished(id)); b.setAttribute("aria-pressed", String(isWished(id))); });
    if (btn) { btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop"); }
    toast(isWished(id) ? "Saved to your list" : "Removed from saved", byId[id].image, isWished(id) ? '<a href="#/wishlist">View</a>' : "");
  }

  /* ---------- Product card ---------- */
  function card(p, { flash = false, i = 0 } = {}) {
    const d = off(p);
    const left = p.stock ? Math.min(100, Math.max(10, (p.stock / 30) * 100)) : 0;
    const w = isWished(p.id);
    return `<article class="card reveal" style="--i:${i % 6}">
      <div class="card__media">
        <img src="${esc(p.image)}" alt="" width="300" height="300" loading="lazy">
        ${d ? `<span class="badge">-${d}%</span>` : p.tag ? `<span class="badge badge--tag">${esc(p.tag)}</span>` : ""}
        <button class="heart ${w ? "on" : ""}" type="button" data-wish="${esc(p.id)}" aria-pressed="${w}" aria-label="Save ${esc(p.name)}">${icon("heart", 18, 2)}</button>
        <button class="plus" type="button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to cart">${icon("plus", 20, 2.4)}</button>
      </div>
      <div class="card__body">
        <h3 class="card__name"><a href="#/product/${esc(p.id)}">${esc(p.name)}</a></h3>
        <div class="card__prices"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}</div>
        ${flash && p.stock ? `<div class="stock"><span>${p.stock} left</span><span>${d}% off</span></div><div class="stock__bar"><i style="width:${left}%"></i></div>`
          : `<p class="card__meta">${esc(cat(p.category)?.name || "")}</p>`}
      </div>
    </article>`;
  }
  const head = (kicker, title, link, linkText = "See all") => `<div class="sec__head">
      <div>${kicker ? `<span class="sec__kicker">${kicker}</span>` : ""}<h2>${title}</h2></div>
      ${link ? `<a class="sec__more" href="${link}">${linkText} ${icon("right", 16, 2.2)}</a>` : ""}
    </div>`;
  const minPrice = (catId) => Math.min(...P.filter((p) => p.category === catId).map((p) => p.price));

  /* ---------- Home ---------- */
  let homeFilter = "all", homeShown = 10;
  function home() {
    const slides = S.banners.map((b, i) => {
      const catId = (b.link.match(/#\/category\/(.+)/) || [])[1];
      const from = catId && P.some((p) => p.category === catId) ? minPrice(catId) : 0;
      return `<div class="slide slide--${esc(b.theme || "blue")} ${i === 0 ? "is-on" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${S.banners.length}">
        <div class="slide__bg" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="slide__text">
          <span class="slide__kicker">${icon("bolt", 14)} Dumoba deals</span>
          <h2>${esc(b.title)}</h2>
          <p>${esc(b.text)}</p>
          <div class="slide__btns">
            <a class="btn ${b.theme === "sky" ? "" : "btn--light"}" href="${esc(b.link)}">${esc(b.button)} ${icon("right", 16, 2.4)}</a>
            <a class="btn btn--outline" href="#/deals">View deals</a>
          </div>
        </div>
        <div class="slide__media">
          <div class="slide__img"><img src="${esc(b.image)}" alt="" width="320" height="320"></div>
          ${from ? `<div class="slide__price"><small>From</small><strong>${money(from)}</strong></div>` : ""}
        </div>
      </div>`;
    }).join("");

    const deals = P.filter((p) => off(p)).sort((a, b) => off(b) - off(a));
    const circles = S.categories.map((c, i) => {
      const first = P.find((p) => p.category === c.id);
      return `<a class="circle reveal" style="--i:${i % 10}" href="#/category/${c.id}"><span class="circle__img tint-${i % 6}">${first ? `<img src="${esc(first.image)}" alt="" width="80" height="80" loading="lazy">` : icon(c.icon, 32)}</span>${esc(c.name)}</a>`;
    }).join("");
    const recent = load("dumoba-recent", []).map((id) => byId[id]).filter(Boolean);

    app.innerHTML = `
      <div class="hero">
        <div class="slider" id="slider" aria-roledescription="carousel" aria-label="Offers">
          ${slides}
          <button class="slider__arrow slider__arrow--prev" type="button" data-slide="-1" aria-label="Previous offer">${icon("left", 20, 2.2)}</button>
          <button class="slider__arrow slider__arrow--next" type="button" data-slide="1" aria-label="Next offer">${icon("right", 20, 2.2)}</button>
          <div class="dots" id="dots">${S.banners.map((b, i) => `<button type="button" data-dot="${i}" aria-label="Show offer ${i + 1}"></button>`).join("")}</div>
        </div>
        <div class="promos">
          <a class="promo promo--ice" href="${wa(`Hello ${S.name}, I would like to place an order.`)}" target="_blank" rel="noopener">
            <span class="promo__ico">${icon("chat", 26)}</span>
            <strong>Order on WhatsApp</strong><span>Send us your list, a real person replies.</span>
            <span class="promo__go">Chat now ${icon("right", 16, 2.2)}</span>
          </a>
          <a class="promo promo--blue" href="#/help">
            <span class="promo__ico">${icon("truck", 26)}</span>
            <strong>Delivered to all 36 states</strong><span>Fee confirmed before you pay.</span>
            <span class="promo__go">How it works ${icon("right", 16, 2.2)}</span>
          </a>
        </div>
      </div>

      <div class="trust">
        <div class="trust__item reveal" style="--i:0"><span class="trust__ico">${icon("truck", 22)}</span><div><strong>Fast delivery</strong><span>${esc(S.delivery?.homeDays || "")} in ${esc(S.city || "")}</span></div></div>
        <div class="trust__item reveal" style="--i:1"><span class="trust__ico">${icon("cash", 22)}</span><div><strong>Pay by transfer</strong><span>Simple and secure checkout</span></div></div>
        <div class="trust__item reveal" style="--i:2"><span class="trust__ico">${icon("return", 22)}</span><div><strong>7-day returns</strong><span>Wrong or damaged? We fix it</span></div></div>
        <div class="trust__item reveal" style="--i:3"><span class="trust__ico">${icon("shield", 22)}</span><div><strong>Checked items</strong><span>Inspected before it ships</span></div></div>
      </div>

      ${deals.length ? `<section class="sec flash reveal">
        <div class="sec__head">
          <div class="flash__title"><span class="flash__bolt">${icon("bolt", 22)}</span><h2>Flash Sales</h2>
            <span class="timer" aria-label="Time left">Ends in <b id="t-h">00</b>:<b id="t-m">00</b>:<b id="t-s">00</b></span>
          </div>
          <a class="sec__more" href="#/deals">See all ${icon("right", 16, 2.2)}</a>
        </div>
        <div class="rail">${deals.map((p, i) => card(p, { flash: true, i })).join("")}</div>
      </section>` : ""}

      <section class="sec">
        ${head("Browse", "Shop by category", "", "")}
        <div class="circles">${circles}</div>
      </section>

      <section class="sec">
        ${head("For you", "Recommended for you", "")}
        <div class="chips" role="group" aria-label="Filter recommendations">
          ${[{ id: "all", name: "All" }, ...S.categories.filter((c) => P.some((p) => p.category === c.id))].map((c) => `<button class="chip" type="button" data-home-chip="${c.id}" aria-pressed="${c.id === homeFilter}">${esc(c.name)}</button>`).join("")}
        </div>
        <div id="home-grid"></div>
      </section>

      <section class="bulk reveal">
        <div>
          <span class="bulk__kicker">Shops, offices and events</span>
          <h2>Buying in bulk? Get a wholesale price.</h2>
          <p>Send us your list on WhatsApp and we will quote a better price for larger orders.</p>
        </div>
        <a class="btn btn--light" href="${wa(`Hello ${S.name}, I would like a bulk quote for:`)}" target="_blank" rel="noopener">${icon("chat")} Get a quote</a>
      </section>

      ${recent.length ? `<section class="sec">${head("Pick up where you left off", "Recently viewed", "")}<div class="rail">${recent.map((p, i) => card(p, { i })).join("")}</div></section>` : ""}
    `;
    renderHomeGrid();
    startSlider();
    startTimer();
  }
  function renderHomeGrid() {
    const list = homeFilter === "all" ? [...P].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)) : P.filter((p) => p.category === homeFilter);
    const shown = list.slice(0, homeShown);
    $("#home-grid").innerHTML = `<div class="grid">${shown.map((p, i) => card(p, { i })).join("")}</div>
      ${list.length > homeShown ? `<div class="more"><button class="btn btn--ghost" type="button" data-more>Show more (${list.length - homeShown})</button></div>`
        : homeFilter !== "all" ? `<div class="more"><a class="btn btn--ghost" href="#/category/${homeFilter}">Open ${esc(cat(homeFilter).name)} ${icon("right", 16, 2.2)}</a></div>` : ""}`;
    $$(".chip[data-home-chip]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.homeChip === homeFilter)));
    watch();
  }

  /* ---------- Slider (cross-fade) ---------- */
  let slideTimer;
  function startSlider() {
    const slider = $("#slider"); if (!slider) return;
    const slides = $$(".slide", slider), n = slides.length; let i = 0;
    const go = (to) => {
      i = (to + n) % n;
      slides.forEach((s, k) => s.classList.toggle("is-on", k === i));
      $$("#dots button").forEach((b, k) => { b.removeAttribute("aria-current"); if (k === i) { void b.offsetWidth; b.setAttribute("aria-current", "true"); } });
      slider.classList.toggle("slider--sky", S.banners[i].theme === "sky");
    };
    const auto = () => { clearInterval(slideTimer); if (!reduced) slideTimer = setInterval(() => go(i + 1), 5000); };
    slider.addEventListener("click", (e) => {
      const b = e.target.closest("[data-slide],[data-dot]"); if (!b) return;
      go(b.dataset.dot != null ? +b.dataset.dot : i + +b.dataset.slide); auto();
    });
    slider.addEventListener("mouseenter", () => clearInterval(slideTimer));
    slider.addEventListener("mouseleave", auto);
    let x0 = null;
    slider.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    slider.addEventListener("touchend", (e) => {
      if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); auto(); } x0 = null;
    });
    go(0); auto();
  }

  /* ---------- Flash sale countdown ---------- */
  let tick;
  function startTimer() {
    clearInterval(tick);
    if (!$("#t-h")) return;
    const pad = (v) => String(v).padStart(2, "0");
    const run = () => {
      const now = new Date(), end = new Date(now);
      end.setHours(S.flashSaleEndsAt, 0, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      const s = Math.floor((end - now) / 1000);
      const h = $("#t-h"); if (!h) return clearInterval(tick);
      h.textContent = pad(Math.floor(s / 3600)); $("#t-m").textContent = pad(Math.floor((s % 3600) / 60)); $("#t-s").textContent = pad(s % 60);
    };
    run(); tick = setInterval(run, 1000);
  }

  /* ---------- Listing: category, search, deals ---------- */
  function listing({ title, crumbs, items, catId, q }) {
    const params = new URLSearchParams(location.hash.split("?")[1] || "");
    const min = +params.get("min") || 0, max = +params.get("max") || 0;
    const sale = params.get("sale") === "1", sort = params.get("sort") || "popular";
    let list = items.filter((p) => (!min || p.price >= min) && (!max || p.price <= max) && (!sale || off(p)));
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "discount") list.sort((a, b) => off(b) - off(a));
    if (sort === "new") list = [...list].reverse();

    app.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${crumbs.map((c) => `<span aria-hidden="true">›</span>${c}`).join("")}</nav>
      <div class="listing">
        <aside class="filters" id="filters">
          <h3>Category</h3>
          ${S.categories.map((c) => `<a href="#/category/${c.id}" class="${c.id === catId ? "is-active" : ""}">${esc(c.name)}</a>`).join("")}
          <form class="fgroup" id="filter-form">
            <h3 style="padding:12px 0 8px">Price (${S.currency})</h3>
            <div class="prange">
              <label class="visually-hidden" for="fmin">Minimum price</label>
              <input id="fmin" name="min" type="number" inputmode="numeric" min="0" placeholder="Min" value="${min || ""}">
              <span aria-hidden="true">–</span>
              <label class="visually-hidden" for="fmax">Maximum price</label>
              <input id="fmax" name="max" type="number" inputmode="numeric" min="0" placeholder="Max" value="${max || ""}">
            </div>
            <label class="fcheck"><input type="checkbox" name="sale" value="1" ${sale ? "checked" : ""}> On sale only</label>
            <button class="btn" type="submit">Apply filters</button>
          </form>
        </aside>
        <div>
          <div class="results__bar">
            <div><h1>${title}</h1><p>${list.length} ${list.length === 1 ? "product" : "products"} found</p></div>
            <div class="sort">
              <button class="btn btn--ghost filter-toggle" type="button" id="filter-toggle" aria-controls="filters" aria-expanded="false">Filters</button>
              <label class="visually-hidden" for="sort">Sort by</label>
              <select id="sort">
                ${[["popular", "Sort: Popular"], ["new", "Newest"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["discount", "Biggest discount"]]
                  .map(([v, t]) => `<option value="${v}" ${v === sort ? "selected" : ""}>${t}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="results__grid">
            ${list.length ? `<div class="grid">${list.map((p, i) => card(p, { i })).join("")}</div>`
              : `<div class="empty"><div class="empty__ico">${icon("search", 30)}</div><h2>No products found</h2><p>${q ? `Nothing matches “${esc(q)}”. Check the spelling or try a shorter word.` : "Try a wider price range or remove filters."}</p><a class="btn" href="#/">Back to home</a></div>`}
          </div>
        </div>
      </div>`;

    const base = location.hash.split("?")[0];
    const setParams = (obj) => {
      const p = new URLSearchParams({ ...Object.fromEntries(params), ...obj });
      [...p.keys()].forEach((k) => { if (!p.get(k) || p.get(k) === "0") p.delete(k); });
      location.hash = `${base}${p.toString() ? `?${p}` : ""}`;
    };
    $("#sort").addEventListener("change", (e) => setParams({ sort: e.target.value }));
    $("#filter-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = new FormData(e.target);
      setParams({ min: f.get("min") || "", max: f.get("max") || "", sale: f.get("sale") || "" });
    });
    $("#filter-toggle").addEventListener("click", (e) => {
      const open = $("#filters").classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Product page ---------- */
  function product(id) {
    const p = byId[id];
    if (!p) return notFound();
    store("dumoba-recent", [id, ...load("dumoba-recent", []).filter((x) => x !== id)].slice(0, 12));
    const c = cat(p.category) || { name: p.category, id: p.category };
    const d = off(p);
    const similar = P.filter((x) => x.category === p.category && x.id !== p.id);
    const more = similar.length ? similar : P.filter((x) => x.id !== p.id && x.featured);
    const specs = Object.entries(p.specs || {});
    const w = isWished(p.id);
    app.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">›</span><a href="#/category/${c.id}">${esc(c.name)}</a><span aria-hidden="true">›</span><span>${esc(p.name)}</span></nav>
      <div class="pdp">
        <div class="pdp__img">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" width="600" height="600">
          ${d ? `<span class="badge">-${d}%</span>` : ""}
          <button class="heart ${w ? "on" : ""}" type="button" data-wish="${esc(p.id)}" aria-pressed="${w}" aria-label="Save ${esc(p.name)}">${icon("heart", 22, 2)}</button>
        </div>
        <div class="pdp__info">
          <div class="pdp__tags"><span>${esc(c.name)}</span>${p.tag ? `<span>${esc(p.tag)}</span>` : ""}</div>
          <h1>${esc(p.name)}</h1>
          <div class="pdp__price">
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
            ${d ? `<span class="badge badge--static">Save ${money(p.oldPrice - p.price)}</span>` : ""}
          </div>
          <p class="pdp__stock ${p.stock && p.stock <= 5 ? "low" : ""}">${p.stock && p.stock <= 5 ? `Only ${p.stock} left, order soon` : "In stock, ready to ship"}</p>
          <p class="pdp__desc">${esc(p.description)}</p>
          <div class="pdp__buy">
            <div class="qty" role="group" aria-label="Quantity">
              <button type="button" id="q-dec" aria-label="One less">−</button>
              <output id="q-val">1</output>
              <button type="button" id="q-inc" aria-label="One more">+</button>
            </div>
            <button class="btn" type="button" id="buy-add">${icon("bag", 18, 2)} Add to cart</button>
          </div>
          <button class="btn btn--dark btn--block" type="button" id="buy-now">${icon("bolt", 18)} Buy now, pay by transfer</button>
          ${specs.length ? `<dl class="specs">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
          <div class="perks3">
            <div>${icon("truck", 22)}<strong>Delivery</strong>${esc(S.delivery?.homeDays || "")} in ${esc(S.homeState || "")}, ${esc(S.delivery?.otherDays || "")} elsewhere</div>
            <div>${icon("cash", 22)}<strong>Payment</strong>Bank transfer at checkout</div>
            <div>${icon("return", 22)}<strong>Returns</strong>Within 7 days if damaged or wrong</div>
          </div>
        </div>
      </div>
      <section class="sec">${head(similar.length ? "Same category" : "Popular", "You may also like", similar.length ? `#/category/${c.id}` : "")}<div class="rail">${more.map((x, i) => card(x, { i })).join("")}</div></section>
    `;
    let qty = 1;
    const show = () => { $("#q-val").textContent = qty; };
    $("#q-dec").addEventListener("click", () => { qty = Math.max(1, qty - 1); show(); });
    $("#q-inc").addEventListener("click", () => { qty += 1; show(); });
    $("#buy-add").addEventListener("click", () => addToCart(p.id, qty, $(".pdp__img img")));
    $("#buy-now").addEventListener("click", () => {
      cart[p.id] = (cart[p.id] || 0) + qty; store("dumoba-cart", cart); updateCount(false);
      location.hash = "#/checkout";
    });
    show();
  }

  /* ---------- Cart ---------- */
  let cart = load("dumoba-cart", {});
  for (const id in cart) if (!byId[id]) delete cart[id];
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const total = () => Object.entries(cart).reduce((t, [id, n]) => t + byId[id].price * n, 0);
  const saved = () => Object.entries(cart).reduce((t, [id, n]) => t + Math.max(0, (byId[id].oldPrice || 0) - byId[id].price) * n, 0);
  function updateCount(bump = true) {
    const el = $("#cart-count"); el.textContent = count();
    if (bump) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
  }
  function flyToCart(img) {
    const target = $(".hact--cart .cart-ico");
    if (!img || !target || reduced || !img.animate) return;
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = Math.min(a.width, 120);
    const f = document.createElement("img");
    f.src = img.currentSrc || img.src; f.className = "flyer"; f.alt = "";
    Object.assign(f.style, { left: `${a.left + a.width / 2 - size / 2}px`, top: `${a.top + a.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px` });
    document.body.appendChild(f);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    f.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(.6)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.6 },
    ], { duration: 750, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = () => { f.remove(); updateCount(); };
    return true;
  }
  function addToCart(id, n = 1, img) {
    cart[id] = (cart[id] || 0) + n; store("dumoba-cart", cart);
    if (!flyToCart(img)) updateCount();
    toast(`${byId[id].name} added`, byId[id].image, '<a href="#/cart">View cart</a>');
  }
  function setQty(id, n) { if (n <= 0) delete cart[id]; else cart[id] = n; store("dumoba-cart", cart); updateCount(); }
  const orderText = () => `Hello ${S.name}, I would like to order:\n\n${Object.entries(cart).map(([id, n]) => `• ${n} × ${byId[id].name}: ${money(byId[id].price * n)}`).join("\n")}\n\nTotal: ${money(total())}\n\nMy name:\nDelivery address:\nPhone:`;

  function cartPage() {
    const items = Object.entries(cart);
    if (!items.length) {
      app.innerHTML = `<div class="empty"><div class="empty__ico">${icon("bag", 30)}</div><h2>Your cart is empty</h2><p>Browse our categories and discover today’s deals.</p><a class="btn" href="#/">Start shopping</a></div>
        <section class="sec">${head("Popular", "Recommended for you", "")}<div class="grid">${P.filter((p) => p.featured).map((p, i) => card(p, { i })).join("")}</div></section>`;
      watch(); return;
    }
    app.innerHTML = `
      <div class="cartpage">
        <div>
          <h1>Your cart (${count()})</h1>
          ${items.map(([id, n], i) => { const p = byId[id]; return `<div class="cline" style="animation-delay:${i * 50}ms">
            <a href="#/product/${esc(id)}"><img src="${esc(p.image)}" alt="" width="96" height="96"></a>
            <div><a class="cline__name" href="#/product/${esc(id)}">${esc(p.name)}</a><p class="cline__meta">${esc(cat(p.category)?.name || "")}</p>
              <div class="card__prices" style="margin-top:6px"><span class="price">${money(p.price)}</span>${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}</div></div>
            <div class="cline__right">
              <div class="qty" role="group" aria-label="Quantity of ${esc(p.name)}">
                <button type="button" data-dec="${esc(id)}" aria-label="One less">−</button><output>${n}</output><button type="button" data-inc="${esc(id)}" aria-label="One more">+</button>
              </div>
              <button class="remove" type="button" data-remove="${esc(id)}">Remove</button>
            </div>
          </div>`; }).join("")}
        </div>
        <aside class="summary">
          <h2>Order summary</h2>
          <div class="summary__row"><span>Items (${count()})</span><span>${money(total())}</span></div>
          ${saved() ? `<div class="summary__row" style="color:var(--good);font-weight:700"><span>You save</span><span>${money(saved())}</span></div>` : ""}
          <div class="summary__row"><span>Delivery</span><span>${S.delivery?.freeOver && total() >= S.delivery.freeOver ? "Free" : "Calculated at checkout"}</span></div>
          <div class="summary__row summary__total"><span>Subtotal</span><span>${money(total())}</span></div>
          <a class="btn btn--block" href="#/checkout">${icon("bag", 18, 2)} Proceed to checkout</a>
          ${S.delivery?.freeOver && total() < S.delivery.freeOver ? `<small>Add ${money(S.delivery.freeOver - total())} more for free delivery.</small>` : ""}
          <small>Pay securely by bank transfer. Prefer to chat? <a class="link" href="${wa(orderText())}" target="_blank" rel="noopener">Order on WhatsApp</a></small>
        </aside>
      </div>`;
  }

  /* ---------- Checkout (bank transfer) ---------- */
  const STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
  const PAY = S.payment || {};
  // which delivery zone a state is in: "home", "nearby" or "other"
  function zone(state) {
    const d = S.delivery || {};
    if (state === S.homeState) return "home";
    if ((d.nearbyStates || []).includes(state)) return "nearby";
    return "other";
  }
  const deliveryFee = (state, sub) => {
    const d = S.delivery || {};
    if (!state) return null;
    if (d.freeOver && sub >= d.freeOver) return 0;
    return +d[zone(state)] || 0;
  };
  const daysFor = (state) => (S.delivery || {})[`${zone(state)}Days`] || "";
  const getOrders = () => load("dumoba-orders", []);
  const saveOrder = (o) => store("dumoba-orders", [o, ...getOrders().filter((x) => x.ref !== o.ref)].slice(0, 30));
  const newRef = () => {
    const d = new Date();
    return `DMB-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  function checkout() {
    const items = Object.entries(cart);
    if (!items.length) { location.hash = "#/cart"; return; }
    const saved = load("dumoba-customer", {});
    app.innerHTML = `
      <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">›</span><a href="#/cart">Cart</a><span aria-hidden="true">›</span><span>Checkout</span></nav>
      <div class="cartpage">
        <form class="co" id="co-form" novalidate>
          <h1>Checkout</h1>
          <ol class="co__steps" aria-label="Checkout steps"><li class="on">Delivery</li><li>Payment</li><li>Done</li></ol>
          <section class="co__box">
            <h2>${icon("truck", 20)} Delivery details</h2>
            <div class="co__grid">
              <label class="co__field"><span>Full name *</span><input name="name" autocomplete="name" required value="${esc(saved.name || "")}"></label>
              <label class="co__field"><span>Phone number *</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="0803 123 4567" value="${esc(saved.phone || "")}"></label>
              <label class="co__field co__field--full"><span>Email (for your receipt)</span><input name="email" type="email" autocomplete="email" value="${esc(saved.email || "")}"></label>
              <label class="co__field"><span>State *</span><select name="state" required><option value="">Choose your state</option>${STATES.map((s) => `<option ${s === saved.state ? "selected" : ""}>${s}</option>`).join("")}</select></label>
              <label class="co__field"><span>City / Town *</span><input name="city" autocomplete="address-level2" required value="${esc(saved.city || "")}"></label>
              <label class="co__field co__field--full"><span>Delivery address *</span><textarea name="address" rows="2" autocomplete="street-address" required placeholder="House number, street, nearest bus stop or landmark">${esc(saved.address || "")}</textarea></label>
              <label class="co__field co__field--full"><span>Note for us (optional)</span><input name="note" maxlength="200" placeholder="e.g. Call before delivery"></label>
            </div>
          </section>
          <section class="co__box">
            <h2>${icon("cash", 20)} Payment method</h2>
            <label class="paym"><input type="radio" name="method" value="transfer" checked><span><b>Bank transfer</b><small>Transfer to our account. We confirm and ship.</small></span>${icon("cash", 26)}</label>
            ${PAY.paystackPublicKey ? `<label class="paym"><input type="radio" name="method" value="paystack"><span><b>Pay online with Paystack</b><small>Card, bank transfer or USSD. Confirmed instantly.</small></span>${icon("shield", 26)}</label>` : ""}
          </section>
          <p class="co__err" id="co-err" role="alert"></p>
          <button class="btn btn--block co__submit" type="submit">${icon("shield", 18, 2)} Place order</button>
        </form>
        <aside class="summary" id="co-sum"></aside>
      </div>`;

    const form = $("#co-form");
    const sum = () => {
      const sub = total(), fee = deliveryFee(form.state.value, sub);
      $("#co-sum").innerHTML = `
        <h2>Order summary</h2>
        <div class="co__items">${items.map(([id, n]) => `<div class="co__item"><img src="${esc(byId[id].image)}" alt="" width="52" height="52"><span>${esc(byId[id].name)}<small>Qty ${n}</small></span><b>${money(byId[id].price * n)}</b></div>`).join("")}</div>
        <div class="summary__row"><span>Items (${count()})</span><span>${money(sub)}</span></div>
        <div class="summary__row"><span>Delivery${form.state.value ? ` to ${esc(form.state.value)}<small class="co__days">${esc(daysFor(form.state.value))}</small>` : ""}</span><span>${fee === null ? "Choose a state" : fee === 0 ? "Free" : money(fee)}</span></div>
        <div class="summary__row summary__total"><span>Total</span><span>${money(sub + (fee || 0))}</span></div>
        <a class="link" href="#/cart">Edit cart</a>`;
    };
    form.state.addEventListener("change", sum);
    form.addEventListener("input", (e) => { e.target.classList.remove("bad"); $("#co-err").textContent = ""; });
    sum();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const bad = ["name", "phone", "state", "city", "address"].find((k) => !String(f[k] || "").trim());
      $$(".co__field .bad").forEach((el) => el.classList.remove("bad"));
      if (bad) { form[bad].classList.add("bad"); form[bad].focus(); $("#co-err").textContent = "Please fill in the highlighted field."; return; }
      if (String(f.phone).replace(/\D/g, "").length < 10) { form.phone.classList.add("bad"); form.phone.focus(); $("#co-err").textContent = "Enter a valid phone number."; return; }
      if (f.method === "paystack" && !/^\S+@\S+\.\S+$/.test(f.email || "")) { form.email.classList.add("bad"); form.email.focus(); $("#co-err").textContent = "Paystack needs your email address for the receipt."; return; }
      store("dumoba-customer", { name: f.name, phone: f.phone, email: f.email, state: f.state, city: f.city, address: f.address });
      const sub = total(), fee = deliveryFee(f.state, sub);
      const order = {
        ref: newRef(), date: new Date().toISOString(), status: "awaiting",
        method: f.method, customer: { name: f.name, phone: f.phone, email: f.email, state: f.state, city: f.city, address: f.address, note: f.note },
        items: items.map(([id, n]) => ({ id, name: byId[id].name, price: byId[id].price, qty: n, image: byId[id].image })),
        subtotal: sub, delivery: fee, total: sub + fee,
      };
      saveOrder(order);
      cart = {}; store("dumoba-cart", cart); updateCount(false);
      notifyOwner(order, "New order placed (awaiting payment)");
      if (f.method === "paystack") payWithPaystack(order);
      else location.hash = `#/order/${order.ref}`;
    });
  }

  function orderText2(o, heading) {
    return `${heading}\n\nOrder: ${o.ref}\nDate: ${new Date(o.date).toLocaleString(S.locale)}\nPayment: ${o.method === "paystack" ? "Paystack" : "Bank transfer"} (${o.status})\n\n${o.items.map((i) => `• ${i.qty} × ${i.name}: ${money(i.price * i.qty)}`).join("\n")}\n\nItems: ${money(o.subtotal)}\nDelivery: ${o.delivery ? money(o.delivery) : "Free"}\nTOTAL: ${money(o.total)}\n\nCustomer: ${o.customer.name}\nPhone: ${o.customer.phone}\nEmail: ${o.customer.email || "-"}\nAddress: ${o.customer.address}, ${o.customer.city}, ${o.customer.state}\nNote: ${o.customer.note || "-"}`;
  }
  // Sends the order to the store owner by email (Web3Forms) when a key is set.
  async function notifyOwner(o, heading) {
    if (!PAY.orderEmailKey) return false;
    try {
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: PAY.orderEmailKey, subject: `${heading}: ${o.ref} (${money(o.total)})`, from_name: S.name, name: o.customer.name, email: o.customer.email || undefined, message: orderText2(o, heading) }),
      });
      return r.ok;
    } catch { return false; }
  }
  function payWithPaystack(o) {
    const go = () => {
      const h = window.PaystackPop.setup({
        key: PAY.paystackPublicKey, email: o.customer.email || `${o.customer.phone.replace(/\D/g, "")}@customer.dumoba`, amount: Math.round(o.total * 100), currency: "NGN", ref: o.ref,
        metadata: { custom_fields: [{ display_name: "Customer", variable_name: "customer", value: `${o.customer.name} ${o.customer.phone}` }] },
        callback: (res) => { o.status = "paid"; o.paystackRef = res.reference; saveOrder(o); notifyOwner(o, "PAID via Paystack"); location.hash = `#/order/${o.ref}`; },
        onClose: () => { location.hash = `#/order/${o.ref}`; },
      });
      h.openIframe();
    };
    if (window.PaystackPop) return go();
    const s = document.createElement("script"); s.src = "https://js.paystack.co/v1/inline.js"; s.onload = go;
    s.onerror = () => { toast("Paystack could not load. You can pay by bank transfer instead."); location.hash = `#/order/${o.ref}`; };
    document.head.appendChild(s);
  }

  /* ---------- Order page: bank details + status ---------- */
  function orderPage(ref) {
    const o = getOrders().find((x) => x.ref === ref);
    if (!o) return notFound();
    const copyBtn = (v, label) => `<button class="copy" type="button" data-copy="${esc(v)}" aria-label="Copy ${label}">${icon("copy", 16)} Copy</button>`;
    const status = { awaiting: ["Awaiting payment", "warn"], sent: ["Payment sent, waiting for confirmation", "info"], paid: ["Paid, we are preparing your order", "ok"] }[o.status] || ["Received", "info"];
    app.innerHTML = `
      <div class="cartpage">
        <div>
          <ol class="co__steps" aria-label="Checkout steps"><li class="done">Delivery</li><li class="${o.status === "awaiting" ? "on" : "done"}">Payment</li><li class="${o.status === "awaiting" ? "" : "on"}">Done</li></ol>
          <div class="okhead">
            <span class="okhead__ico ${o.status === "awaiting" ? "" : "ok"}">${icon(o.status === "awaiting" ? "cash" : "check", 30, 2.4)}</span>
            <div><h1>${o.status === "awaiting" ? "Complete your payment" : "Thank you, " + esc(o.customer.name.split(" ")[0]) + "!"}</h1>
            <p>Order <b>${esc(o.ref)}</b> · <span class="st st--${status[1]}">${status[0]}</span></p></div>
          </div>
          ${o.status === "awaiting" ? `
          <section class="bank">
            <p class="bank__lead">Transfer exactly <b>${money(o.total)}</b> to the account below. Use your order number as the description so we can match your payment.</p>
            <dl class="bank__rows">
              <div><dt>Amount</dt><dd><b>${money(o.total)}</b>${copyBtn(String(o.total), "amount")}</dd></div>
              <div><dt>Bank</dt><dd>${esc(PAY.bankName)}</dd></div>
              <div><dt>Account number</dt><dd><b class="bank__acct">${esc(PAY.accountNumber)}</b>${copyBtn(PAY.accountNumber, "account number")}</dd></div>
              <div><dt>Account name</dt><dd>${esc(PAY.accountName)}</dd></div>
              <div><dt>Description</dt><dd><b>${esc(o.ref)}</b>${copyBtn(o.ref, "order number")}</dd></div>
            </dl>
            <button class="btn btn--block" type="button" id="paid">${icon("check", 18, 2.6)} I have made the transfer</button>
            <small class="bank__note">We confirm every transfer by hand, usually within an hour during working hours, then ship your order.</small>
          </section>` : `
          <section class="bank bank--done">
            <p>${o.status === "paid" ? "Your payment is confirmed." : "We have your payment notice and will confirm it shortly."} We will call <b>${esc(o.customer.phone)}</b> to arrange delivery to ${esc(o.customer.city)}, ${esc(o.customer.state)}.</p>
            <div class="slide__btns"><a class="btn" href="#/">Continue shopping</a><a class="btn btn--ghost" href="#/orders">My orders</a></div>
          </section>`}
          <p class="co__help">Need help with this order? <a class="link" href="${wa(`Hello ${S.name}, about my order ${o.ref}.`)}" target="_blank" rel="noopener">Chat with us</a> or call <a class="link" href="tel:${esc(S.phoneDisplay.replace(/\s/g, ""))}">${esc(S.phoneDisplay)}</a>.</p>
        </div>
        <aside class="summary">
          <h2>Order ${esc(o.ref)}</h2>
          <div class="co__items">${o.items.map((i) => `<div class="co__item"><img src="${esc(i.image)}" alt="" width="52" height="52"><span>${esc(i.name)}<small>Qty ${i.qty}</small></span><b>${money(i.price * i.qty)}</b></div>`).join("")}</div>
          <div class="summary__row"><span>Items</span><span>${money(o.subtotal)}</span></div>
          <div class="summary__row"><span>Delivery to ${esc(o.customer.state)}</span><span>${o.delivery ? money(o.delivery) : "Free"}</span></div>
          <div class="summary__row summary__total"><span>Total</span><span>${money(o.total)}</span></div>
          <small>Delivering to: ${esc(o.customer.name)}, ${esc(o.customer.address)}, ${esc(o.customer.city)}, ${esc(o.customer.state)}</small>
        </aside>
      </div>`;

    $("#paid")?.addEventListener("click", async (e) => {
      const btn = e.currentTarget; btn.disabled = true; btn.textContent = "Sending…";
      o.status = "sent"; o.sentAt = new Date().toISOString(); saveOrder(o);
      const ok = await notifyOwner(o, "Customer says PAYMENT SENT");
      if (!ok) {
        // no email key set: let the customer send the notice from their own email app
        location.href = `mailto:${S.email}?subject=${encodeURIComponent(`Payment sent for order ${o.ref}`)}&body=${encodeURIComponent(orderText2(o, "I have made the transfer for this order"))}`;
      }
      toast("Thank you! We will confirm your payment shortly.");
      orderPage(ref);
    });
  }

  function ordersPage() {
    const list = getOrders();
    app.innerHTML = list.length ? `<section>${head("On this device", `My orders (${list.length})`, "")}
      <div class="olist">${list.map((o) => `<a class="orow reveal" href="#/order/${esc(o.ref)}">
        <img src="${esc(o.items[0]?.image)}" alt="" width="56" height="56">
        <span><b>${esc(o.ref)}</b><small>${new Date(o.date).toLocaleDateString(S.locale)} · ${o.items.reduce((a, i) => a + i.qty, 0)} items</small></span>
        <span class="st st--${o.status === "paid" ? "ok" : o.status === "sent" ? "info" : "warn"}">${o.status === "paid" ? "Paid" : o.status === "sent" ? "Payment sent" : "Awaiting payment"}</span>
        <b class="price">${money(o.total)}</b></a>`).join("")}</div></section>`
      : `<div class="empty"><div class="empty__ico">${icon("box", 30)}</div><h2>No orders yet</h2><p>Orders you place on this phone or computer appear here.</p><a class="btn" href="#/">Start shopping</a></div>`;
  }

  /* ---------- Wishlist page ---------- */
  function wishPage() {
    const items = wish.map((id) => byId[id]).filter(Boolean);
    app.innerHTML = items.length
      ? `<section>${head("Your list", `Saved items (${items.length})`, "")}<div class="grid">${items.map((p, i) => card(p, { i })).join("")}</div></section>`
      : `<div class="empty"><div class="empty__ico">${icon("heart", 30)}</div><h2>No saved items yet</h2><p>Tap the heart on any product to save it for later.</p><a class="btn" href="#/">Discover products</a></div>`;
  }

  /* ---------- Help ---------- */
  function help() {
    const qa = [
      ["How do I place an order?", "Add items to your cart, tap “Proceed to checkout”, enter your delivery details and tap “Place order”. Or tap “Buy now” on any product page."],
      ["How do I pay?", "By bank transfer. After you place your order you see our account details, the exact amount and your order number. Use the order number as the transfer description, then tap “I have made the transfer”. We confirm and ship."],
      ["How much is delivery?", `${money(S.delivery?.home || 0)} within ${esc(S.homeState)} (including ${esc(S.city)}), ${money(S.delivery?.nearby || 0)} to ${esc((S.delivery?.nearbyStates || []).join(", "))}, and ${money(S.delivery?.other || 0)} to other states.${S.delivery?.freeOver ? ` Free on orders of ${money(S.delivery.freeOver)} or more.` : ""} You see the exact fee at checkout before you pay.`],
      ["Where can I see my order?", "Open “My orders” from the menu or the footer. It shows every order placed on this phone or computer, with its payment status."],
      ["How long does delivery take?", `${esc(S.homeState)}: ${esc(S.delivery?.homeDays || "")}. Nearby states: ${esc(S.delivery?.nearbyDays || "")}. Other states: ${esc(S.delivery?.otherDays || "")}.`],
      ["Where are you?", `We are in ${esc(S.city)}, ${esc(S.homeState)} State, and deliver across Nigeria.`],
      ["Can I return an item?", "Yes. If an item arrives damaged or is not what you ordered, message us within 7 days and we will replace it or refund you."],
      ["Are your products original?", "Every item is checked before it ships. Brand items come with their original packaging and warranty where the maker offers one."],
      ["Do you sell in bulk?", "Yes. Send your list on WhatsApp for a wholesale quote."],
      ["I can’t find what I want.", "Tell us on WhatsApp. We add new products every week and can often source items on request."],
    ];
    app.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">›</span><span>Help centre</span></nav>
      <div class="help"><h1>How can we help?</h1>${qa.map(([q, a], i) => `<details class="reveal" style="--i:${i}" ${i === 0 ? "open" : ""}><summary>${q}</summary><p>${a}</p></details>`).join("")}
      <p style="margin-top:24px"><a class="btn btn--wa" href="${wa(`Hello ${S.name}, I need help.`)}" target="_blank" rel="noopener">${icon("chat")} Chat with us on WhatsApp</a></p></div>`;
  }
  function notFound() {
    app.innerHTML = `<div class="empty"><div class="empty__ico">${icon("box", 30)}</div><h2>Page not found</h2><p>The product or page you are looking for is not here.</p><a class="btn" href="#/">Go to home</a></div>`;
  }

  /* ---------- Search with suggestions ---------- */
  const q = $("#q"), sug = $("#suggest");
  const match = (term) => { const t = term.trim().toLowerCase(); return t ? P.filter((p) => `${p.name} ${p.description} ${cat(p.category)?.name}`.toLowerCase().includes(t)) : []; };
  q.addEventListener("input", () => {
    const res = match(q.value).slice(0, 6);
    sug.hidden = !res.length;
    sug.innerHTML = res.map((p) => `<li><a href="#/product/${esc(p.id)}"><img src="${esc(p.image)}" alt="" width="44" height="44"><span>${esc(p.name)}<small>${esc(cat(p.category)?.name || "")}</small></span><span class="price">${money(p.price)}</span></a></li>`).join("");
  });
  q.addEventListener("blur", () => setTimeout(() => (sug.hidden = true), 150));
  sug.addEventListener("click", () => { sug.hidden = true; q.value = ""; });
  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault(); sug.hidden = true;
    if (q.value.trim()) location.hash = `#/search?q=${encodeURIComponent(q.value.trim())}`;
  });

  /* ---------- Global clicks ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-wish],[data-inc],[data-dec],[data-remove],[data-home-chip],[data-more],[data-copy]"); if (!t) return;
    if (t.dataset.copy) {
      const done = () => { t.classList.add("copied"); t.innerHTML = `${icon("check", 16, 2.6)} Copied`; setTimeout(() => { t.classList.remove("copied"); t.innerHTML = `${icon("copy", 16)} Copy`; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(t.dataset.copy).then(done, () => toast(t.dataset.copy));
      else toast(t.dataset.copy);
      return;
    }
    if (t.dataset.add) {
      addToCart(t.dataset.add, 1, t.closest(".card")?.querySelector("img"));
      t.classList.add("added"); t.innerHTML = icon("check", 20, 2.6);
      setTimeout(() => { t.classList.remove("added"); t.innerHTML = icon("plus", 20, 2.4); }, 1300);
      return;
    }
    if (t.dataset.wish) return toggleWish(t.dataset.wish, t);
    if (t.dataset.homeChip) { homeFilter = t.dataset.homeChip; homeShown = 10; return renderHomeGrid(); }
    if (t.hasAttribute("data-more")) { homeShown += 10; return renderHomeGrid(); }
    if (t.dataset.inc) setQty(t.dataset.inc, cart[t.dataset.inc] + 1);
    if (t.dataset.dec) setQty(t.dataset.dec, cart[t.dataset.dec] - 1);
    if (t.dataset.remove) setQty(t.dataset.remove, 0);
    cartPage();
  });
  $("#news-form").addEventListener("submit", (e) => {
    e.preventDefault();
    location.href = `mailto:${S.email}?subject=${encodeURIComponent("Add me to the deals list")}&body=${encodeURIComponent(`Please add ${$("#news-email").value} to your deals list.`)}`;
    toast("Thanks! Your email app will open to confirm.");
  });

  /* ---------- Toast ---------- */
  let tt;
  function toast(msg, img = "", action = "") {
    const el = $("#toast");
    el.innerHTML = `${img ? `<img src="${esc(img)}" alt="">` : ""}<span>${esc(msg)}</span>${action}`;
    el.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2800);
  }

  /* ---------- Reveal on scroll ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -8% 0px" }) : null;
  function watch() { $$(".reveal:not(.in)").forEach((el) => (io ? io.observe(el) : el.classList.add("in"))); }

  /* ---------- Router ---------- */
  function route() {
    clearInterval(slideTimer); clearInterval(tick);
    const [path, query] = (location.hash.slice(1) || "/").split("?");
    const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    const active = parts[0] === "category" ? parts[1] : parts[0] === "deals" ? "deals" : !parts.length ? "" : null;
    $$("#catbar a").forEach((a) => a.classList.toggle("is-active", a.dataset.catLink === active));
    const params = new URLSearchParams(query || "");

    if (!parts.length) { home(); document.title = `${S.name} | Online Shopping in Nigeria`; }
    else if (parts[0] === "category") {
      const c = cat(parts[1]); if (!c) notFound();
      else { listing({ title: esc(c.name), crumbs: [`<span>${esc(c.name)}</span>`], items: P.filter((p) => p.category === c.id), catId: c.id }); document.title = `${c.name} | ${S.name}`; }
    }
    else if (parts[0] === "search") {
      const term = params.get("q") || ""; q.value = term;
      listing({ title: `Results for “${esc(term)}”`, crumbs: ["<span>Search</span>"], items: match(term), q: term }); document.title = `${term} | ${S.name}`;
    }
    else if (parts[0] === "deals") { listing({ title: "Flash Sales", crumbs: ["<span>Flash Sales</span>"], items: P.filter((p) => off(p)) }); document.title = `Flash Sales | ${S.name}`; }
    else if (parts[0] === "product") { product(parts[1]); document.title = `${byId[parts[1]]?.name || "Product"} | ${S.name}`; }
    else if (parts[0] === "cart") { cartPage(); document.title = `Cart | ${S.name}`; }
    else if (parts[0] === "wishlist") { wishPage(); document.title = `Saved items | ${S.name}`; }
    else if (parts[0] === "checkout") { checkout(); document.title = `Checkout | ${S.name}`; }
    else if (parts[0] === "order") { orderPage(parts[1]); document.title = `Order ${parts[1]} | ${S.name}`; }
    else if (parts[0] === "orders") { ordersPage(); document.title = `My orders | ${S.name}`; }
    else if (parts[0] === "help") { help(); document.title = `Help | ${S.name}`; }
    else notFound();

    app.classList.remove("page-in"); void app.offsetWidth; app.classList.add("page-in");
    scrollTo(0, 0);
    watch();
  }
  addEventListener("hashchange", route);
  updateCount(false); updateWish(false);
  route();

  /* ---------- Hide the loading screen once the page is ready ---------- */
  const loader = $("#loader");
  if (loader) {
    const shownAt = performance.now();
    let gone = false;
    const hide = () => {
      if (gone) return; gone = true;
      setTimeout(() => { loader.classList.add("done"); setTimeout(() => loader.remove(), 500); }, Math.max(0, 600 - (performance.now() - shownAt)));
    };
    if (document.readyState === "complete") hide(); else addEventListener("load", hide);
    setTimeout(hide, 4000);
  }
})();
