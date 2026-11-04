import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Boxes, Check, ChevronDown,
  CircleHelp, Command, Download, Ellipsis, Filter, LayoutDashboard,
  Package, Plus, Search, Settings2, SlidersHorizontal, Sparkles,
  TrendingUp, X, Pencil, Trash2, Minus, Mail, AlertTriangle, PackageX,
  RefreshCw
} from "lucide-react";

const CATEGORIES = ["Electronics", "Clothing", "Food", "Other"];
const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0
}).format(value);

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "The request could not be completed.");
  }
  if (response.status === 204) return null;
  return response.json();
}

function Status({ quantity }) {
  const state = quantity === 0 ? "out" : quantity < 5 ? "low" : "healthy";
  const label = state === "out" ? "Out of stock" : state === "low" ? "Low stock" : "In stock";
  return <span className={`status status-${state}`}><i />{label}</span>;
}

function StatCard({ label, value, detail, icon: Icon, tone = "neutral", trend }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span>{detail}</span>
        {trend && <span className="trend"><ArrowUpRight size={13} />{trend}</span>}
      </div>
    </article>
  );
}

function ProductModal({ product, onClose, onSave, saving }) {
  const [form, setForm] = useState(product || {
    id: "", name: "", category: "", price: "", quantity: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!String(form.id).trim() || !String(form.name).trim() || !form.category) {
      setError("Complete the product details before saving.");
      return;
    }
    const price = Number(form.price);
    const quantity = Number(form.quantity);
    if (!Number.isFinite(price) || price < 0 || form.price === "") {
      setError("Enter a valid price of zero or more.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 0 || form.quantity === "") {
      setError("Quantity must be a whole number of zero or more.");
      return;
    }
    try {
      await onSave({ ...form, id: String(form.id).trim(), name: String(form.name).trim(), price, quantity });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{product ? "EDIT RECORD" : "NEW RECORD"}</span>
            <h2 id="modal-title">{product ? "Update product" : "Add a product"}</h2>
            <p>Keep your stock details accurate and up to date.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-grid">
            <label>Product ID<input autoFocus value={form.id} maxLength="40" onChange={(e) => update("id", e.target.value)} placeholder="e.g. P106" /></label>
            <label>Product name<input value={form.name} maxLength="100" onChange={(e) => update("name", e.target.value)} placeholder="Name of the product" /></label>
            <label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}><option value="">Select category</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Unit price <span className="field-suffix">INR</span><input type="number" min="0" step="any" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="0.00" /></label>
            <label>Quantity<input type="number" min="0" step="1" value={form.quantity} onChange={(e) => update("quantity", e.target.value)} placeholder="0" /></label>
          </div>
          {error && <p className="form-error"><AlertTriangle size={15} />{error}</p>}
          <div className="modal-actions">
            <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving…" : product ? "Save changes" : "Add product"}<span>↗</span></button>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalValue: 0, lowStock: 0, outOfStock: 0 });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [modalProduct, setModalProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  async function refresh() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category !== "all") params.set("category", category);
    const [items, summary] = await Promise.all([
      request(`/api/products?${params.toString()}`),
      request("/api/products/stats")
    ]);
    setProducts(items);
    setStats(summary);
  }

  useEffect(() => {
    let active = true;
    Promise.all([request("/api/products"), request("/api/products/stats")])
      .then(([items, summary]) => {
        if (!active) return;
        setProducts(items);
        setStats(summary);
      })
      .catch((error) => setNotice(error.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh().catch((error) => setNotice(error.message));
    }, 180);
    return () => window.clearTimeout(timer);
  }, [search, category]);

  async function saveProduct(product) {
    setSaving(true);
    try {
      if (modalProduct) {
        await request(`/api/products/${encodeURIComponent(modalProduct.id)}`, {
          method: "PUT", body: JSON.stringify(product)
        });
        setNotice("Product details updated.");
      } else {
        await request("/api/products", { method: "POST", body: JSON.stringify(product) });
        setNotice("Product added to your inventory.");
      }
      setModalOpen(false);
      setModalProduct(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function changeQuantity(product, change) {
    setBusyId(product.id);
    try {
      await request(`/api/products/${encodeURIComponent(product.id)}/quantity`, {
        method: "PATCH", body: JSON.stringify({ change })
      });
      await refresh();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusyId(null);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete "${product.name}" from your inventory? This cannot be undone.`)) return;
    try {
      await request(`/api/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
      setNotice("Product removed from inventory.");
      await refresh();
    } catch (error) {
      setNotice(error.message);
    }
  }

  function openAdd() {
    setModalProduct(null);
    setModalOpen(true);
  }

  function openEdit(product) {
    setModalProduct(product);
    setModalOpen(true);
  }

  const lowCount = stats.lowStock + stats.outOfStock;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Stockroom home">
          <span className="brand-mark"><Boxes size={19} strokeWidth={2.1} /></span>
          <span>stockroom<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <a className="nav-link active" href="#overview"><LayoutDashboard size={17} />Overview</a>
          <a className="nav-link" href="#inventory"><Package size={17} />Inventory<span className="nav-count">{stats.totalProducts}</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><CircleHelp size={17} /></div>
            <strong>Need a hand?</strong>
            <p>Questions about your stockroom?</p>
            <button onClick={() => setContactOpen(true)}>Get in touch <span>↗</span></button>
          </div>
          <div className="profile">
            <div className="avatar">NK</div>
            <div className="profile-copy"><strong>Workspace admin</strong><span>Personal workspace</span></div>
            <button className="profile-more" aria-label="Profile options"><Ellipsis size={18} /></button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right"><span className="live-indicator"><i />All systems operational</span><span className="topbar-date">{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}</span></div>
        </header>

        <div className="page-wrap">
          <section className="page-heading">
            <div>
              <div className="eyebrow">YOUR BUSINESS AT A GLANCE</div>
              <h1>Inventory overview<span>.</span></h1>
              <p>A clear picture of what you have, and what needs attention.</p>
            </div>
            <button className="button button-primary add-button" onClick={openAdd}><Plus size={17} /> Add product</button>
          </section>

          {notice && <div className="notice" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}

          <section className="stats-grid" aria-label="Inventory summary">
            <StatCard label="Total products" value={stats.totalProducts.toLocaleString("en-IN")} detail="Unique items in your catalogue" icon={Package} />
            <StatCard label="Inventory value" value={money(stats.totalValue)} detail="Based on current stock levels" icon={TrendingUp} tone="sage" />
            <StatCard label="Needs attention" value={lowCount.toLocaleString("en-IN")} detail={`${stats.lowStock} low stock · ${stats.outOfStock} out of stock`} icon={AlertTriangle} tone="amber" />
            <StatCard label="Available units" value={products.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("en-IN")} detail="Units across all products" icon={Boxes} tone="blue" />
          </section>

          <section className="inventory-panel" id="inventory">
            <div className="panel-heading">
              <div><div className="eyebrow">CATALOGUE</div><h2>Product inventory</h2><p>Manage and keep track of every item in your stock.</p></div>
              <div className="panel-actions"><button className={`button button-quiet filter-toggle ${filterOpen ? "selected" : ""}`} onClick={() => setFilterOpen((v) => !v)}><SlidersHorizontal size={16} /> Filters <ChevronDown size={14} /></button><button className="button button-primary compact-add" onClick={openAdd}><Plus size={16} /> Add product</button></div>
            </div>

            <div className={`toolbar ${filterOpen ? "show-filter" : ""}`}>
              <div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by product or ID..." aria-label="Search products" /><kbd>⌘ K</kbd></div>
              <div className="toolbar-right"><span className="result-count">{products.length} {products.length === 1 ? "result" : "results"}</span><select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category"><option value="all">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
            </div>

            <div className="table-wrap">
              <table>
                <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>UNIT PRICE</th><th>QUANTITY</th><th>STATUS</th><th>STOCK VALUE</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="7" className="table-state"><RefreshCw className="spin" size={18} />Loading inventory…</td></tr> :
                    products.length === 0 ? <tr><td colSpan="7" className="table-state"><PackageX size={22} /><strong>No products found</strong><span>Try changing your search or add a new product.</span></td></tr> :
                    products.map((product) => (
                      <tr key={product.id}>
                        <td><div className="product-cell"><div className={`product-thumb thumb-${CATEGORIES.indexOf(product.category)}`}><Package size={18} strokeWidth={1.7} /></div><div className="product-meta"><strong>{product.name}</strong><span>{product.id}</span></div></div></td>
                        <td><span className="category-pill">{product.category}</span></td>
                        <td className="numeric">{money(product.price)}</td>
                        <td><div className="quantity-stepper"><button disabled={product.quantity === 0 || busyId === product.id} onClick={() => changeQuantity(product, -1)} aria-label={`Decrease ${product.name} quantity`}><Minus size={13} /></button><span>{product.quantity}</span><button disabled={busyId === product.id} onClick={() => changeQuantity(product, 1)} aria-label={`Increase ${product.name} quantity`}><Plus size={13} /></button></div></td>
                        <td><Status quantity={product.quantity} /></td>
                        <td className="numeric stock-value">{money(product.price * product.quantity)}</td>
                        <td><div className="row-menu"><button className="row-action" onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`}><Pencil size={15} /></button><button className="row-action danger-hover" onClick={() => removeProduct(product)} aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button></div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{products.length}</strong> of <strong>{stats.totalProducts}</strong> products</span><span className="footer-note"><span className="footer-dot" />Synced with your inventory</span></div>
          </section>

          <footer className="page-footer"><span>© 2026 Stockroom</span><span>Thoughtful tools for better business.</span><span>Made for the details <span className="footer-heart">✳</span></span></footer>
        </div>
      </main>

      {modalOpen && <ProductModal product={modalProduct} onClose={() => setModalOpen(false)} onSave={saveProduct} saving={saving} />}
      {contactOpen && <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && setContactOpen(false)}><section className="modal contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title"><div className="modal-head"><div><span className="eyebrow">WE'RE HERE TO HELP</span><h2 id="contact-title">Let's talk.</h2><p>Have a question or found something that needs a closer look?</p></div><button className="icon-button" onClick={() => setContactOpen(false)} aria-label="Close"><X size={18} /></button></div><a className="contact-link" href="mailto:hello@stockroom.app"><Mail size={17} /> hello@stockroom.app <span>↗</span></a><div className="modal-actions"><button className="button button-primary" onClick={() => setContactOpen(false)}>Done</button></div></section></div>}
    </div>
  );
}

export default App;
