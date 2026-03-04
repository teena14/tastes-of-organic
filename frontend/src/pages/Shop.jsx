import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../services/productApi";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["ALL", "HONEY", "PULSES", "WHEAT", "MILLET", "SPICES", "OILS"];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "ALL");
  const [sort, setSort] = useState("newest");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchProducts({ search, category, sort });
      setProducts(result.data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  return (
    <div style={{ padding: "16px" }}>
      <h2>Shop</h2>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "240px", marginRight: "8px" }}
      />

      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>

      <div style={{ marginTop: "8px" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{ marginRight: "4px", fontWeight: category === cat ? "bold" : "normal" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "12px" }}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Shop;
