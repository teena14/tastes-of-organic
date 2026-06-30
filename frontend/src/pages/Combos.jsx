import { useEffect, useState } from "react";
import { fetchProducts } from "../services/apiClient";
import ProductCard from "../components/ProductCard";

const Combos = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetchProducts({ category: "COMBOS" })
      .then((r) => setProducts(r.data || []))
      .catch(() => {
        setProducts([]);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F6F0", fontFamily: "Poppins, sans-serif" }}>
      <div
        className="relative overflow-hidden text-center px-6"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #388E3C 100%)",
          paddingTop: "120px",
          paddingBottom: "56px",
        }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-white/70 font-light mb-2">Curated bundles</p>
        <h1 className="font-abel text-5xl md:text-6xl text-white uppercase tracking-wide">Combos</h1>
        <p className="mt-3 text-white/70 text-sm font-light max-w-md mx-auto">
          Handpicked product combinations at a special discount
        </p>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl aspect-[4/3]" style={{ backgroundColor: "#E2ECDA" }} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="text-center py-24">
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1B5E20" }}>Could not load combos</h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: "#888" }}>
              Start the backend on port 5000 (<code>cd backend &amp;&amp; npm run dev</code>), then refresh.
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#1B5E20" }}>No combos yet</h3>
            <p className="text-sm" style={{ color: "#888" }}>Combo packages will appear here once added in the database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 items-stretch">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Combos;
