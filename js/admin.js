/* ==========================================================================
   DUMOBA ADMIN — manage products, categories, banners and settings.
   Vanilla JS. Runs on your own computer: open admin.html in Chrome or Edge,
   click "Connect store folder", pick the DUMOBA STORES folder, and every
   "Save changes" writes js/products.js, js/config.js and product photos.
   Without folder access it downloads the two files for you to replace.
   ========================================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
  const ICONS = ["fashion", "watch", "phone", "tv", "laptop", "kitchen", "beauty", "grocery", "baby", "sports", "home", "car", "book", "health"];
  const DRAFT = "dumoba-admin-draft";

  /* ---------- State ---------- */
  let products = clone(window.PRODUCTS || []);
  let store = clone(window.STORE || {});
  let dirty = false;
  let dir = null;            // folder handle (File System Access API)
  let tab = "dashboard";
  const canFS = "showDirectoryPicker" in window;

  // restore an unsaved draft from a previous visit
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT));
    if (d && d.products && d.store) {
      products = d.products; store = d.store; dirty = true;
      notice(`Unsaved changes from ${new Date(d.ts).toLocaleString()} were restored. <button class="link" type="button" id="discard">Discard them</button>`, "info");
    }
  } catch { /* no draft */ }

  // settings added in newer versions are filled in from config.js
  ["payment", "delivery"].forEach((k) => { store[k] = { ...(window.STORE[k] || {}), ...(store[k] || {}) }; });
  delete store.delivery.lagos;
  ["city", "homeState"].forEach((k) => { if (store[k] === undefined) store[k] = window.STORE[k]; });

  const money = (n) => (store.currency || "₦") + Math.round(+n || 0).toLocaleString(store.locale || "en-NG");
  const catName = (id) => (store.categories.find((c) => c.id === id) || { name: id || "None" }).name;
  const off = (p) => (p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  /* ---------- Status, notice, toast ---------- */
  function notice(html, kind = "") {
    const n = $("#notice"); n.innerHTML = html; n.className = `notice ${kind}`; n.hidden = !html;
  }
  let tt;
  function toast(msg, bad = false) {
    const t = $("#toast"); t.textContent = msg; t.classList.toggle("bad", bad); t.classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function setStatus() {
    const s = $("#status");
    s.className = "top__status " + (dirty ? "dirty" : dir ? "ok" : "");
    s.textContent = dirty ? "Unsaved changes" : dir ? `Connected to “${dir.name}”. All changes saved.` : canFS ? "Not connected: click “Connect store folder”" : "Save will download the updated files";
    $("#save").disabled = !dirty;
    $("#connect").textContent = dir ? "Change folder" : "Connect store folder";
    $("#connect").hidden = !canFS;
    $("#nav-count").textContent = products.length;
  }
  function markDirty() {
    dirty = true; setStatus();
    try { localStorage.setItem(DRAFT, JSON.stringify({ products, store, ts: Date.now() })); }
    catch { notice("Your browser storage is full, so this draft can’t be kept if you close the page. <b>Click “Save changes” soon.</b>"); }
  }
  addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------- Folder access (remembered in IndexedDB) ---------- */
  const idb = (mode, fn) => new Promise((res, rej) => {
    const open = indexedDB.open("dumoba-admin", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("kv");
    open.onsuccess = () => { const tx = open.result.transaction("kv", mode); const r = fn(tx.objectStore("kv")); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); };
    open.onerror = () => rej(open.error);
  });
  async function verify(handle) {
    try { const js = await handle.getDirectoryHandle("js"); await js.getFileHandle("products.js"); return true; } catch { return false; }
  }
  async function connect() {
    try {
      const h = await window.showDirectoryPicker({ id: "dumoba-store", mode: "readwrite" });
      if (!(await verify(h))) { toast("That folder isn’t the store. Pick the DUMOBA STORES folder (the one with index.html).", true); return; }
      dir = h; await idb("readwrite", (s) => s.put(h, "dir")).catch(() => {});
      notice(""); setStatus(); toast("Store folder connected");
    } catch (e) { if (e.name !== "AbortError") toast("Couldn’t open that folder.", true); }
  }
  async function reconnect() {
    if (!canFS) return;
    try {
      const h = await idb("readonly", (s) => s.get("dir"));
      if (!h) return;
      if ((await h.queryPermission({ mode: "readwrite" })) === "granted") { dir = h; setStatus(); return; }
      if (!$("#notice").hidden) return;
      notice(`Your store folder “${esc(h.name)}” needs permission again. <button class="link" type="button" id="regrant">Allow access</button>`, "info");
      $("#regrant").addEventListener("click", async () => {
        if ((await h.requestPermission({ mode: "readwrite" })) === "granted") { dir = h; notice(""); setStatus(); toast("Store folder connected"); }
      });
    } catch { /* first visit */ }
  }
  $("#connect").addEventListener("click", connect);

  /* ---------- Images ---------- */
  async function resize(file, max = 900) {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    return new Promise((res) => c.toBlob(res, "image/jpeg", 0.85));
  }
  const toDataURL = (blob) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
  const dataToBlob = async (url) => (await fetch(url)).blob();

  /* ---------- Writing files ---------- */
  function productsJS() {
    const order = ["id", "name", "category", "price", "oldPrice", "stock", "tag", "featured", "image", "description", "specs"];
    const clean = products.map((p) => {
      const o = {};
      order.forEach((k) => { const v = p[k]; if (v !== undefined && v !== "" && v !== null && v !== false && !(k === "specs" && !Object.keys(v || {}).length)) o[k] = v; });
      return o;
    });
    return `/* ==========================================================================
   YOUR PRODUCTS. Easiest way to edit: open admin.html.
   Saved by Dumoba Admin on ${new Date().toLocaleString()}.

   Fields: id, name, category (an id from config.js), price, oldPrice (optional,
   shows a discount), stock (optional), tag (optional label), featured (optional),
   image (path to the photo), description, specs (optional details).
   ========================================================================== */
window.PRODUCTS = ${JSON.stringify(clean, null, 2)};
`;
  }
  function configJS() {
    return `/* ==========================================================================
   STORE SETTINGS. Easiest way to edit: open admin.html.
   Saved by Dumoba Admin on ${new Date().toLocaleString()}.

   whatsapp: your number in international format, digits only (e.g. 2348031234567)
   flashSaleEndsAt: hour (0 to 23) the daily Flash Sales countdown runs to
   categories[].icon: fashion, watch, phone, tv, laptop, kitchen, beauty, grocery,
                      baby, sports, home, car, book, health
   ========================================================================== */
window.STORE = ${JSON.stringify({ ...store, categories: store.categories.map(({ _new, ...c }) => c) }, null, 2)};
`;
  }
  async function writeFile(folder, name, data) {
    const fh = await folder.getFileHandle(name, { create: true });
    const w = await fh.createWritable(); await w.write(data); await w.close();
  }
  async function save() {
    const problems = validateAll();
    if (problems.length) { notice(`<b>Fix these before saving:</b> ${problems.map(esc).join(" · ")}`); return; }
    $("#save").disabled = true; $("#save").textContent = "Saving…";
    try {
      if (dir) {
        if ((await dir.queryPermission({ mode: "readwrite" })) !== "granted" && (await dir.requestPermission({ mode: "readwrite" })) !== "granted") throw new Error("Permission denied");
        // photos added in this session are written as real files
        const assets = await dir.getDirectoryHandle("assets", { create: true });
        const pics = await assets.getDirectoryHandle("products", { create: true });
        for (const p of products) {
          if (String(p.image).startsWith("data:")) {
            const name = `${slug(p.id)}-${Date.now().toString(36)}.jpg`;
            await writeFile(pics, name, await dataToBlob(p.image));
            p.image = `assets/products/${name}`;
          }
        }
        const js = await dir.getDirectoryHandle("js");
        try { const old = await (await (await js.getFileHandle("products.js")).getFile()).text(); await writeFile(js, "products.backup.js", old); } catch { /* first save */ }
        await writeFile(js, "products.js", productsJS());
        await writeFile(js, "config.js", configJS());
        toast("Saved. Refresh the store to see your changes.");
      } else {
        download("products.js", productsJS());
        download("config.js", configJS());
        notice("Two files were downloaded: <b>products.js</b> and <b>config.js</b>. Copy them into the store’s <b>js</b> folder (replace the old ones). Photos you added are stored inside products.js.", "info");
      }
      dirty = false; localStorage.removeItem(DRAFT);
    } catch (e) {
      toast("Saving failed: " + e.message, true);
    }
    $("#save").textContent = "Save changes"; setStatus(); render();
  }
  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/javascript" })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  $("#save").addEventListener("click", save);
  addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); if (dirty) save(); } });

  function validateAll() {
    const out = [];
    const ids = new Set();
    products.forEach((p) => {
      if (ids.has(p.id)) out.push(`Two products share the id “${p.id}”`); ids.add(p.id);
      if (!store.categories.some((c) => c.id === p.category)) out.push(`“${p.name}” has no valid category`);
    });
    const cids = store.categories.map((c) => c.id);
    if (cids.some((id, i) => !id || cids.indexOf(id) !== i)) out.push("Each category needs its own short code");
    if (!/^\d{10,15}$/.test(store.whatsapp || "")) out.push("WhatsApp number must be digits only, like 2348031234567");
    if (store.payment && !/^\d{10}$/.test(store.payment.accountNumber || "")) out.push("Account number must be 10 digits");
    const STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
    if (!STATES.includes(store.homeState)) out.push(`“${store.homeState}” is not a state name customers can pick. Use e.g. Anambra`);
    (store.delivery?.nearbyStates || []).forEach((s) => { if (!STATES.includes(s)) out.push(`Nearby state “${s}” is not spelled like the checkout list`); });
    if (store.payment?.paystackPublicKey && !/^pk_(live|test)_/.test(store.payment.paystackPublicKey)) out.push("Paystack key must be the PUBLIC key (starts with pk_)");
    return out;
  }

  /* ---------- Tabs ---------- */
  const TITLES = { dashboard: "Dashboard", products: "Products", categories: "Categories", banners: "Home page banners", settings: "Store settings" };
  $$(".side__nav button").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; history.replaceState(null, "", `#${tab}`); render(); }));
  if (location.hash.slice(1) in TITLES) tab = location.hash.slice(1);
  function render() {
    $$(".side__nav button").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    $("#page-title").textContent = TITLES[tab];
    ({ dashboard, products: productsView, categories, banners, settings })[tab]();
    setStatus();
  }

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const sale = products.filter(off).length;
    const low = products.filter((p) => p.stock !== undefined && p.stock !== "" && +p.stock <= 5).length;
    const max = Math.max(1, ...store.categories.map((c) => products.filter((p) => p.category === c.id).length));
    $("#view").innerHTML = `
      <div class="stats">
        <div class="panel stat"><span>Products</span><strong>${products.length}</strong><small>listed in the store</small></div>
        <div class="panel stat"><span>Categories</span><strong>${store.categories.length}</strong><small>shelves</small></div>
        <div class="panel stat"><span>On sale</span><strong>${sale}</strong><small>shown in Flash Sales</small></div>
        <div class="panel stat"><span>Low stock</span><strong>${low}</strong><small>5 units or fewer</small></div>
      </div>
      <div class="dash-grid">
        <section class="panel">
          <div class="panel__head"><h2>Products per category</h2><button class="btn btn--sm" type="button" data-new>+ Add product</button></div>
          <div class="bars">${store.categories.map((c) => { const n = products.filter((p) => p.category === c.id).length; return `<div class="bar"><span>${esc(c.name)}</span><div><i style="width:${(n / max) * 100}%"></i></div><b>${n}</b></div>`; }).join("")}</div>
        </section>
        <section class="panel">
          <div class="panel__head"><h2>How it works</h2></div>
          <ol class="steps">
            <li><div><b>Connect the store folder</b><br>Click “Connect store folder” and choose the DUMOBA STORES folder. Chrome or Edge on a computer.</div></li>
            <li><div><b>Add or edit products</b><br>Photos are resized and saved into assets/products for you.</div></li>
            <li><div><b>Click “Save changes”</b><br>Then refresh the store tab to check it.</div></li>
            <li><div><b>Publish</b><br>Upload the folder to your host again (for Netlify, drag the folder onto app.netlify.com/drop).</div></li>
          </ol>
        </section>
      </div>`;
  }

  /* ---------- Products ---------- */
  let q = "", fcat = "all", sortBy = "recent";
  function productsView() {
    $("#view").innerHTML = `
      <section class="panel">
        <div class="panel__head">
          <div class="toolbar">
            <label class="visually-hidden" for="p-q">Search products</label>
            <input id="p-q" type="search" placeholder="Search products" value="${esc(q)}">
            <label class="visually-hidden" for="p-cat">Category</label>
            <select id="p-cat"><option value="all">All categories</option>${store.categories.map((c) => `<option value="${esc(c.id)}" ${c.id === fcat ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select>
            <label class="visually-hidden" for="p-sort">Sort</label>
            <select id="p-sort">${[["recent", "Newest first"], ["name", "Name A–Z"], ["low", "Price low–high"], ["high", "Price high–low"], ["stock", "Lowest stock"]].map(([v, t]) => `<option value="${v}" ${v === sortBy ? "selected" : ""}>${t}</option>`).join("")}</select>
          </div>
          <button class="btn" type="button" data-new>+ Add product</button>
        </div>
        <div class="table-wrap" id="p-table"></div>
      </section>`;
    $("#p-q").addEventListener("input", (e) => { q = e.target.value; table(); });
    $("#p-cat").addEventListener("change", (e) => { fcat = e.target.value; table(); });
    $("#p-sort").addEventListener("change", (e) => { sortBy = e.target.value; table(); });
    table();
  }
  function table() {
    const t = q.trim().toLowerCase();
    let list = products.map((p, i) => ({ p, i })).filter(({ p }) => (fcat === "all" || p.category === fcat) && (!t || `${p.name} ${p.id} ${p.description}`.toLowerCase().includes(t)));
    if (sortBy === "recent") list.reverse();
    if (sortBy === "name") list.sort((a, b) => a.p.name.localeCompare(b.p.name));
    if (sortBy === "low") list.sort((a, b) => a.p.price - b.p.price);
    if (sortBy === "high") list.sort((a, b) => b.p.price - a.p.price);
    if (sortBy === "stock") list.sort((a, b) => (a.p.stock ?? 1e9) - (b.p.stock ?? 1e9));
    $("#p-table").innerHTML = list.length ? `<table>
      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
      <tbody>${list.map(({ p, i }) => {
        const d = off(p); const st = p.stock === undefined || p.stock === "" ? null : +p.stock;
        return `<tr>
          <td><div class="prod"><img src="${esc(p.image)}" alt="" width="48" height="48" loading="lazy"><div><b>${esc(p.name)}</b><small>${esc(p.id)}${p.tag ? ` · ${esc(p.tag)}` : ""}</small></div></div></td>
          <td>${esc(catName(p.category))}</td>
          <td class="num"><b>${money(p.price)}</b>${p.oldPrice ? `<br><span class="old">${money(p.oldPrice)}</span> ${d ? `<span class="tag tag--sale">-${d}%</span>` : ""}` : ""}</td>
          <td>${st === null ? `<span class="tag tag--ok">In stock</span>` : st <= 5 ? `<span class="tag tag--low">${st} left</span>` : `<span class="tag tag--ok">${st}</span>`}</td>
          <td><button class="star ${p.featured ? "on" : ""}" type="button" data-feature="${i}" aria-pressed="${!!p.featured}" aria-label="Feature ${esc(p.name)} on home page">★</button></td>
          <td><div class="row-actions">
            <button class="btn btn--ghost btn--sm" type="button" data-edit="${i}">Edit</button>
            <button class="btn btn--ghost btn--sm" type="button" data-dup="${i}">Duplicate</button>
            <button class="btn btn--danger btn--sm" type="button" data-del="${i}">Delete</button>
          </div></td>
        </tr>`; }).join("")}</tbody></table>`
      : `<div class="empty"><b>No products found</b>${products.length ? "Try another search or category." : "Click “Add product” to list your first one."}</div>`;
  }

  /* ---------- Product editor ---------- */
  const ed = $("#editor"), form = $("#editor-form");
  let editing = -1, edImage = "";
  function openEditor(i = -1, base = null) {
    editing = i;
    const p = base || (i >= 0 ? products[i] : { category: fcat !== "all" ? fcat : store.categories[0]?.id, specs: {} });
    $("#editor-title").textContent = i >= 0 ? "Edit product" : "Add product";
    form.category.innerHTML = store.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    form.name.value = p.name || ""; form.category.value = p.category || ""; form.tag.value = p.tag || "";
    form.price.value = p.price ?? ""; form.oldPrice.value = p.oldPrice ?? ""; form.stock.value = p.stock ?? "";
    form.featured.checked = !!p.featured; form.description.value = p.description || "";
    $("#ed-specs").innerHTML = "";
    Object.entries(p.specs || {}).forEach(([k, v]) => addSpec(k, v));
    setImage(p.image || "");
    $("#ed-error").textContent = "";
    $$(".bad", form).forEach((el) => el.classList.remove("bad"));
    ed.showModal(); form.name.focus();
  }
  function setImage(src) {
    edImage = src;
    $("#ed-preview").hidden = !src; if (src) $("#ed-preview").src = src;
    $("#drop-hint").hidden = !!src; $("#ed-file-change").hidden = !src;
  }
  function addSpec(k = "", v = "") {
    const row = document.createElement("div"); row.className = "spec";
    row.innerHTML = `<input placeholder="Label, e.g. Size" value="${esc(k)}" aria-label="Detail label"><input placeholder="Value, e.g. 42" value="${esc(v)}" aria-label="Detail value"><button type="button" aria-label="Remove detail">×</button>`;
    row.querySelector("button").addEventListener("click", () => row.remove());
    $("#ed-specs").appendChild(row);
  }
  $("#add-spec").addEventListener("click", () => { addSpec(); $("#ed-specs .spec:last-child input").focus(); });
  $$("[data-close]", ed).forEach((b) => b.addEventListener("click", () => ed.close()));
  ed.addEventListener("click", (e) => { if (e.target === ed) ed.close(); });

  async function takeFile(file) {
    if (!file || !file.type.startsWith("image/")) { toast("Please choose an image file (JPG, PNG or WebP).", true); return; }
    try { setImage(await toDataURL(await resize(file))); } catch { toast("That image couldn’t be read. Try a JPG or PNG.", true); }
  }
  $("#ed-file").addEventListener("change", (e) => takeFile(e.target.files[0]));
  $("#ed-file-change").addEventListener("click", () => $("#ed-file").click());
  const drop = $("#drop");
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
  drop.addEventListener("drop", (e) => { e.preventDefault(); takeFile(e.dataTransfer.files[0]); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    $$(".bad", form).forEach((el) => el.classList.remove("bad"));
    const err = (el, msg) => { el.classList.add("bad"); el.focus(); $("#ed-error").textContent = msg; };
    const name = form.name.value.trim(), price = form.price.value === "" ? NaN : +form.price.value;
    const oldPrice = form.oldPrice.value === "" ? undefined : +form.oldPrice.value;
    if (!name) return err(form.name, "Give the product a name.");
    if (!form.category.value) return err(form.category, "Choose a category (add one in Categories first).");
    if (!(price >= 0)) return err(form.price, "Enter the price as a number, e.g. 25000.");
    if (oldPrice !== undefined && oldPrice <= price) return err(form.oldPrice, "The old price must be higher than the price, or leave it empty.");
    if (!edImage) { $("#ed-error").textContent = "Add a photo of the product."; drop.focus(); return; }
    const specs = {};
    $$("#ed-specs .spec").forEach((r) => { const [k, v] = $$("input", r).map((i) => i.value.trim()); if (k && v) specs[k] = v; });
    const p = {
      id: editing >= 0 ? products[editing].id : uniqueId(slug(name)),
      name, category: form.category.value, price,
      oldPrice, stock: form.stock.value === "" ? undefined : +form.stock.value,
      tag: form.tag.value.trim() || undefined, featured: form.featured.checked || undefined,
      image: edImage, description: form.description.value.trim(), specs,
    };
    if (editing >= 0) products[editing] = p; else products.push(p);
    ed.close(); markDirty(); render();
    toast(editing >= 0 ? "Product updated" : "Product added");
  });
  function uniqueId(base) { let id = base, n = 2; while (products.some((p) => p.id === id)) id = `${base}-${n++}`; return id; }

  /* ---------- Categories ---------- */
  function categories() {
    $("#view").innerHTML = `
      <section class="panel">
        <div class="panel__head"><h2>Categories (${store.categories.length})</h2><button class="btn" type="button" id="add-cat">+ Add category</button></div>
        <div class="rows">${store.categories.map((c, i) => {
          const n = products.filter((p) => p.category === c.id).length;
          return `<div class="row row--cat">
            <label class="field"><span>Name</span><input data-cat-name="${i}" value="${esc(c.name)}" maxlength="40"></label>
            <label class="field"><span>Short code</span><input value="${esc(c.id)}" ${c._new ? `data-cat-id="${i}"` : "readonly title=\"Fixed once products use it\""}></label>
            <label class="field"><span>Icon</span><select data-cat-icon="${i}">${ICONS.map((ic) => `<option ${ic === c.icon ? "selected" : ""}>${ic}</option>`).join("")}</select></label>
            <span class="row__count">${n} ${n === 1 ? "product" : "products"}</span>
            <button class="btn btn--danger btn--sm" type="button" data-cat-del="${i}" ${n ? `disabled title="Move or delete its products first"` : ""}>Delete</button>
          </div>`; }).join("")}</div>
      </section>`;
    $("#add-cat").addEventListener("click", () => {
      store.categories.push({ id: uniqueCat("new-category"), name: "New category", icon: "home", _new: true });
      markDirty(); categories(); $$("[data-cat-name]").pop().select();
    });
  }
  function uniqueCat(base) { let id = base, n = 2; while (store.categories.some((c) => c.id === id)) id = `${base}-${n++}`; return id; }

  /* ---------- Banners ---------- */
  function banners() {
    const imgs = [...new Set(products.map((p) => p.image))];
    const links = [...store.categories.map((c) => [`#/category/${c.id}`, `Category: ${c.name}`]), ["#/deals", "Flash Sales page"], ...products.map((p) => [`#/product/${p.id}`, `Product: ${p.name}`])];
    $("#view").innerHTML = `
      <section class="panel">
        <div class="panel__head"><h2>Slides on the home page (${store.banners.length})</h2><button class="btn" type="button" id="add-banner">+ Add slide</button></div>
        <div class="rows">${store.banners.map((b, i) => `
          <div class="banner-card">
            <img src="${esc(b.image)}" alt="" width="140" height="140">
            <div class="form">
              <label class="field"><span>Title</span><input data-b="${i}" data-k="title" value="${esc(b.title)}" maxlength="40"></label>
              <label class="field"><span>Button text</span><input data-b="${i}" data-k="button" value="${esc(b.button)}" maxlength="24"></label>
              <label class="field field--full"><span>Text</span><input data-b="${i}" data-k="text" value="${esc(b.text)}" maxlength="110"></label>
              <label class="field"><span>Photo</span><select data-b="${i}" data-k="image">${imgs.map((src) => `<option value="${esc(src)}" ${src === b.image ? "selected" : ""}>${esc(products.find((p) => p.image === src)?.name || src)}</option>`).join("")}</select></label>
              <label class="field"><span>Button goes to</span><select data-b="${i}" data-k="link">${links.map(([v, t]) => `<option value="${esc(v)}" ${v === b.link ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
              <label class="field"><span>Colour</span><select data-b="${i}" data-k="theme">${[["blue", "Blue"], ["navy", "Navy"], ["sky", "Light blue"]].map(([v, t]) => `<option value="${v}" ${v === b.theme ? "selected" : ""}>${t}</option>`).join("")}</select></label>
            </div>
            <button class="btn btn--danger btn--sm" type="button" data-b-del="${i}" ${store.banners.length < 2 ? "disabled" : ""}>Remove</button>
          </div>`).join("")}</div>
      </section>`;
    $("#add-banner").addEventListener("click", () => {
      const p = products[0] || {};
      store.banners.push({ title: "New offer", text: "Describe the offer in one line.", button: "Shop now", image: p.image || "", link: `#/category/${store.categories[0]?.id || ""}`, theme: "blue" });
      markDirty(); banners();
    });
  }

  /* ---------- Settings ---------- */
  function settings() {
    store.payment = store.payment || {}; store.delivery = store.delivery || {};
    const n = (path, label, extra = "", help = "") => {
      const [a, b] = path.split("."), id = path.replace(".", "-");
      return `<label class="field"><span>${label}</span><input data-n="${path}" value="${esc(store[a][b] ?? "")}" ${extra} ${help ? `aria-describedby="h-${id}"` : ""}>${help ? `<small id="h-${id}">${help}</small>` : ""}</label>`;
    };
    const f = (k, label, extra = "", help = "") => `<label class="field"><span>${label}</span><input data-s="${k}" value="${esc(store[k] ?? "")}" ${extra} ${help ? `aria-describedby="h-${k}"` : ""}>${help ? `<small id="h-${k}">${help}</small>` : ""}</label>`;
    $("#view").innerHTML = `
      <section class="panel">
        <div class="panel__head"><h2>Store details</h2></div>
        <div class="form">
          ${f("name", "Store name", 'maxlength="40"')}
          ${f("tagline", "Tagline", 'maxlength="60"')}
          ${f("whatsapp", "WhatsApp number for orders", 'inputmode="numeric" placeholder="2348031234567"', "Digits only, starting with 234. Orders are sent here.")}
          ${f("phoneDisplay", "Phone number shown on the site", 'placeholder="0803 123 4567"')}
          ${f("email", "Email for orders", 'type="email"')}
          ${f("flashSaleEndsAt", "Flash Sales end at (hour, 0–23)", 'type="number" min="0" max="23"', "The countdown runs to this hour every day.")}
        </div>
      </section>
      <section class="panel" style="margin-top:14px">
        <div class="panel__head"><h2>Bank transfer details (shown at checkout)</h2></div>
        <div class="form">
          ${n("payment.bankName", "Bank name", 'placeholder="e.g. GTBank"')}
          ${n("payment.accountNumber", "Account number", 'inputmode="numeric" maxlength="10" placeholder="10 digits"')}
          ${n("payment.accountName", "Account name")}
          ${n("payment.orderEmailKey", "Order email key (Web3Forms, optional)", 'placeholder="paste the access key"', "Free at web3forms.com: enter your email and they send a key. With it, every order is emailed to you automatically.")}
          ${n("payment.paystackPublicKey", "Paystack public key (optional)", 'placeholder="pk_live_..."', "Adds “Pay online with Paystack” (card, transfer, USSD). Use the PUBLIC key only, never the secret key.")}
        </div>
      </section>
      <section class="panel" style="margin-top:14px">
        <div class="panel__head"><h2>Location and delivery</h2></div>
        <div class="form">
          ${f("city", "Your city", 'placeholder="Awka"')}
          ${f("homeState", "Your state", 'placeholder="Anambra"', "Must match the state name customers pick at checkout, e.g. Anambra.")}
          ${n("delivery.home", `Fee within ${esc(store.homeState || "your state")} (₦)`, 'type="number" min="0"')}
          ${n("delivery.homeDays", `Delivery time within ${esc(store.homeState || "your state")}`)}
          ${n("delivery.nearby", "Fee to nearby states (₦)", 'type="number" min="0"')}
          ${n("delivery.nearbyDays", "Delivery time to nearby states")}
          <label class="field field--full"><span>Nearby states</span><input data-n="delivery.nearbyStates" value="${esc((store.delivery.nearbyStates || []).join(", "))}" aria-describedby="h-nearby"><small id="h-nearby">Separate with commas, e.g. Enugu, Imo, Abia, Ebonyi, Delta</small></label>
          ${n("delivery.other", "Fee to all other states (₦)", 'type="number" min="0"')}
          ${n("delivery.otherDays", "Delivery time to other states")}
          ${n("delivery.freeOver", "Free delivery when order is at least (₦)", 'type="number" min="0"', "Use 0 to turn free delivery off.")}
        </div>
      </section>
      <section class="panel" style="margin-top:14px">
        <div class="panel__head"><h2>Scrolling messages at the top</h2><button class="btn btn--sm" type="button" id="add-msg">+ Add message</button></div>
        <div class="rows">${(store.topStrip || []).map((m, i) => `<div class="row row--msg"><label class="field"><span class="visually-hidden">Message ${i + 1}</span><input data-msg="${i}" value="${esc(m)}" maxlength="60"></label><button class="btn btn--danger btn--sm" type="button" data-msg-del="${i}">Remove</button></div>`).join("")}</div>
      </section>`;
    $("#add-msg").addEventListener("click", () => { store.topStrip = [...(store.topStrip || []), "New message"]; markDirty(); settings(); $$("[data-msg]").pop().select(); });
  }

  /* ---------- One listener for edits in every tab ---------- */
  $("#view").addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    if (d.catName) store.categories[d.catName].name = t.value;
    else if (d.catId) { const v = slug(t.value); store.categories[d.catId].id = v; }
    else if (d.catIcon) store.categories[d.catIcon].icon = t.value;
    else if (d.b !== undefined) { store.banners[d.b][d.k] = t.value; if (d.k === "image") t.closest(".banner-card").querySelector("img").src = t.value; }
    else if (d.s) store[d.s] = d.s === "flashSaleEndsAt" ? Math.min(23, Math.max(0, +t.value || 0)) : d.s === "whatsapp" ? t.value.replace(/\D/g, "") : t.value;
    else if (d.msg !== undefined) store.topStrip[d.msg] = t.value;
    else if (d.n) {
      const [a, b] = d.n.split(".");
      store[a][b] = b === "nearbyStates" ? t.value.split(",").map((s) => s.trim()).filter(Boolean)
        : b.endsWith("Days") ? t.value
        : a === "delivery" ? Math.max(0, +t.value || 0)
        : b === "accountNumber" ? t.value.replace(/\D/g, "") : t.value.trim();
    }
    else return;
    markDirty();
  });
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-new],[data-edit],[data-dup],[data-del],[data-feature],[data-cat-del],[data-b-del],[data-msg-del],#discard");
    if (!t) return;
    const d = t.dataset;
    if (t.id === "discard") { localStorage.removeItem(DRAFT); location.reload(); return; }
    if (t.hasAttribute("data-new")) return openEditor();
    if (d.edit) return openEditor(+d.edit);
    if (d.dup) { const c = clone(products[+d.dup]); c.name += " (copy)"; return openEditor(-1, c); }
    if (d.del) {
      const p = products[+d.del];
      if (!confirm(`Delete “${p.name}”? This can’t be undone after you save.`)) return;
      products.splice(+d.del, 1);
      store.banners.forEach((b) => { if (b.link === `#/product/${p.id}`) b.link = `#/category/${p.category}`; });
      markDirty(); table(); setStatus(); toast("Product deleted");
    }
    if (d.feature) { const p = products[+d.feature]; p.featured = !p.featured || undefined; markDirty(); table(); }
    if (d.catDel) { store.categories.splice(+d.catDel, 1); markDirty(); categories(); }
    if (d.bDel) { store.banners.splice(+d.bDel, 1); markDirty(); banners(); }
    if (d.msgDel) { store.topStrip.splice(+d.msgDel, 1); markDirty(); settings(); }
  });

  /* ---------- Start ---------- */
  if (!canFS) notice("This browser can’t write to folders, so <b>Save changes</b> will download the updated files for you to copy into the store’s <b>js</b> folder. For one-click saving, use Chrome or Edge on a computer.", "info");
  render();
  reconnect();
})();
