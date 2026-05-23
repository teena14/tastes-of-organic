import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Search, ChevronDown, X } from "lucide-react";
import { fetchProducts } from "../services/productApi";
import ProductCard from "../components/ProductCard";

/* ─── Constants ─────────────────────────────────────────── */
const CATEGORIES = [
  { id: "ALL", label: "All Products" },
  { id: "HONEY", label: "Honey" },
  { id: "PULSES", label: "Pulses" },
  { id: "WHEAT", label: "Wheat" },
  { id: "MILLET", label: "Millet" },
  { id: "FLOUR", label: "Flour" },
  { id: "JUICES", label: "Juices" },
  { id: "SPICES", label: "Spices" },
  { id: "OILS", label: "Oils" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

/* ─── Skeleton card ─────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="rounded-2xl aspect-[4/3]" style={{ backgroundColor: "#E2ECDA" }} />
    <div className="mt-3 px-1 space-y-2">
      <div className="h-3 rounded-full w-3/4" style={{ backgroundColor: "#D4E6C8" }} />
      <div className="h-3 rounded-full w-1/2" style={{ backgroundColor: "#D4E6C8" }} />
    </div>
  </div>
);

/* ─── Price Range Slider ─────────────────────────────────── */
const PriceSlider = ({ min, max, value, onChange }) => {
  const [dragging, setDragging] = useState(null);

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newVal = Math.round(min + ratio * (max - min));
    const distLow = Math.abs(newVal - value[0]);
    const distHigh = Math.abs(newVal - value[1]);
    if (distLow <= distHigh) {
      onChange([Math.min(newVal, value[1] - 1), value[1]]);
    } else {
      onChange([value[0], Math.max(newVal, value[0] + 1)]);
    }
  };

  return (
    <div className="mt-3">
      <div
        className="relative h-1.5 rounded-full cursor-pointer"
        style={{ backgroundColor: "#D4E6C8" }}
        onClick={handleTrackClick}
      >
        {/* active track */}
        <div
          className="absolute h-full rounded-full"
          style={{
            left: `${pct(value[0])}%`,
            width: `${pct(value[1]) - pct(value[0])}%`,
            backgroundColor: "#1B5E20",
          }}
        />
        {/* low thumb */}
        <div
          className="absolute w-4 h-4 rounded-full shadow -translate-y-1/2 top-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${pct(value[0])}%`, backgroundColor: "#1B5E20", transform: "translate(-50%, -50%)" }}
        />
        {/* high thumb */}
        <div
          className="absolute w-4 h-4 rounded-full shadow -translate-y-1/2 top-1/2 cursor-grab active:cursor-grabbing"
          style={{ left: `${pct(value[1])}%`, backgroundColor: "#1B5E20", transform: "translate(-50%, -50%)" }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs" style={{ color: "#555" }}>
        <span>₹{value[0]}</span>
        <span>₹{value[1]}</span>
      </div>
    </div>
  );
};

/* ─── Sidebar ────────────────────────────────────────────── */
const Sidebar = ({ category, setCategory, availability, setAvailability, priceRange, setPriceRange }) => {
  const SectionTitle = ({ children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div className="mb-5">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between text-sm font-semibold mb-3 tracking-wide uppercase"
          style={{ color: "#1B5E20" }}
        >
          {children}
          <ChevronDown
            size={15}
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </button>
        {open && <div>{children.props?.children}</div>}
      </div>
    );
  };

  return (
    <aside
      className="w-56 shrink-0 rounded-2xl p-5 self-start sticky top-5"
      style={{ backgroundColor: "#F0F7EB", border: "1px solid #D4E6C8" }}
    >
      {/* Category */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1B5E20" }}>
          Category
        </p>
        <div className="space-y-2">
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === cat.id}
                onChange={() => setCategory(cat.id)}
                className="hidden"
              />
              <span
                className="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: category === cat.id ? "#1B5E20" : "#BDBDBD",
                  backgroundColor: category === cat.id ? "#1B5E20" : "transparent",
                }}
              >
                {category === cat.id && (
                  <svg viewBox="0 0 10 8" width="8" height="8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className="text-sm transition-colors"
                style={{ color: category === cat.id ? "#1B5E20" : "#555", fontWeight: category === cat.id ? 500 : 400 }}
              >
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: "#D4E6C8", marginBottom: "20px" }} />

      {/* Availability */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#1B5E20" }}>
          Availability
        </p>
        <div className="space-y-2">
          {["In Stock", "Out of Stock"].map((option) => {
            const val = option === "In Stock" ? "instock" : "outofstock";
            const active = availability === val;
            return (
              <label key={val} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="availability"
                  checked={active}
                  onChange={() => setAvailability(active ? "" : val)}
                  className="hidden"
                />
                <span
                  className="w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all"
                  style={{
                    borderColor: active ? "#1B5E20" : "#BDBDBD",
                    backgroundColor: active ? "#1B5E20" : "transparent",
                  }}
                >
                  {active && (
                    <svg viewBox="0 0 10 8" width="8" height="8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm" style={{ color: "#555" }}>{option}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <hr style={{ borderColor: "#D4E6C8", marginBottom: "20px" }} />

      {/* Price Range */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#1B5E20" }}>
          Price
        </p>
        <PriceSlider min={0} max={2000} value={priceRange} onChange={setPriceRange} />
      </div>
    </aside>
  );
};

/* ─── Shop page ──────────────────────────────────────────── */
const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [sort, setSort] = useState("newest");
  const [availability, setAvailability] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError(false);
      const result = await fetchProducts({ search, category, sort });
      setProducts(result.data || []);
    } catch {
      setProducts([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // When URL params change externally (e.g. navbar search while already on /shop),
  // sync them into local state so a new product fetch is triggered.
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category") || "ALL";
    setSearch(urlSearch);
    setCategory(urlCategory);
  }, [searchParams]);

  // sync local state back to URL params
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category && category !== "ALL") params.category = category;
    setSearchParams(params, { replace: true });
  }, [search, category, setSearchParams]);

  // client-side price filter
  const displayed = products.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

  const activeFiltersCount = [
    category !== "ALL",
    availability !== "",
    priceRange[0] > 0 || priceRange[1] < 2000,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("ALL");
    setAvailability("");
    setPriceRange([0, 2000]);
    setSearch("");
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F6F0", fontFamily: "Poppins, sans-serif" }}>

      {/* ── Page header banner ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)", paddingTop: "120px", paddingBottom: "56px" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: "#fff" }} />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: "#fff" }} />

        <div className="relative z-10 text-center px-6">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-light mb-2">Explore Our Collection</p>
          <h1 className="font-abel text-5xl md:text-6xl text-white uppercase tracking-wide">Our Shop</h1>
          <p className="mt-3 text-white/70 text-sm font-light max-w-md mx-auto">
            Pure, natural and sustainably sourced products from trusted farmers
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">

        {/* ── Top bar: search + sort + mobile filter toggle ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#888" }} />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none border"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #D4E6C8",
                color: "#333",
                fontFamily: "Poppins, sans-serif",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ color: "#888" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Active filter pills */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full border transition-all"
              style={{ borderColor: "#1B5E20", color: "#1B5E20", backgroundColor: "#F0F7EB" }}
            >
              <X size={12} /> Clear filters ({activeFiltersCount})
            </button>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-full text-sm outline-none cursor-pointer"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #D4E6C8",
                color: "#333",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#555" }} />
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: "#1B5E20", color: "#fff" }}
          >
            <SlidersHorizontal size={15} /> Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 bg-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ color: "#1B5E20" }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Body: sidebar + grid ── */}
        <div className="flex gap-8 items-start">

          {/* Sidebar — desktop */}
          <div className="hidden md:block">
            <Sidebar
              category={category}
              setCategory={setCategory}
              availability={availability}
              setAvailability={setAvailability}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
            />
          </div>

          {/* Mobile sidebar drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="relative ml-auto w-72 h-full overflow-y-auto p-6" style={{ backgroundColor: "#F8F6F0" }}>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="absolute top-4 right-4 p-1.5 rounded-full"
                  style={{ backgroundColor: "#E2ECDA" }}
                >
                  <X size={16} />
                </button>
                <p className="font-semibold text-base mb-5" style={{ color: "#1B5E20" }}>Filters</p>
                <Sidebar
                  category={category}
                  setCategory={setCategory}
                  availability={availability}
                  setAvailability={setAvailability}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                />
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Result count */}
            <p className="text-xs mb-5" style={{ color: "#888" }}>
              {loading ? "Loading…" : `${displayed.length} product${displayed.length !== 1 ? "s" : ""} found`}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : fetchError ? (
              <div className="flex flex-col items-center justify-center py-24">
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#1B5E20" }}>Could not load products</h3>
                <p className="text-sm text-center max-w-md" style={{ color: "#888" }}>
                  The shop could not reach the server. Make sure the backend is running on port 5000
                  (<code className="text-xs">cd backend &amp;&amp; npm run dev</code>), then refresh this page.
                </p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: "#E2ECDA" }}>
                  <Search size={28} style={{ color: "#1B5E20" }} />
                </div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#1B5E20" }}>No products found</h3>
                <p className="text-sm text-center max-w-xs" style={{ color: "#888" }}>
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-5 px-6 py-2.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#1B5E20" }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {displayed.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
