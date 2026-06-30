import Hero from "../components/Hero";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import ConcernCard from "../components/ConcernCard";
import BeliefSection from "../components/BeliefSection";

const MOCK_PRODUCTS = [
  { _id: "1", name: "Premium Kashmiri Saffron", price: 850, mrp: 1000, images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600"], rating: 4.8, reviewCount: 124, sizes: ["1g", "5g"] },
  { _id: "2", name: "Raw Himalayan Honey", price: 450, mrp: 600, images: ["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&q=80&w=600"], rating: 4.9, reviewCount: 305, sizes: ["250g", "500g"] },
  { _id: "3", name: "Organic Toor Dal", price: 210, mrp: 250, images: ["https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600"], rating: 4.5, reviewCount: 89, sizes: ["1kg"] },
  { _id: "4", name: "Stone Ground Wheat Flour", price: 180, mrp: 220, images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600"], rating: 4.7, reviewCount: 412, sizes: ["5kg"] },
];

/* ── Section heading — Abel font ── */
const SectionHeading = ({ children }) => (
  <h2 className="font-abel text-4xl text-center mb-10" style={{ color: "#1B5E20" }}>
    {children}
  </h2>
);

/* ─────────────────────────────────────────────
   Shop by Concern — ASYMMETRIC 3-column grid
   
   Using a CSS grid with 3 equal columns:
   Row 1:  [Card A — col 1+2] [Card B — col 3]
   Row 2:  [Card C — col 1]   [Card D — col 2+3]
───────────────────────────────────────────── */
const ConcernGrid = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gridTemplateRows: "auto auto",
      gap: "20px",
    }}
  >
    {/* Row 1 — Card A: spans first 2 columns */}
    <div style={{ gridColumn: "1 / 3" }}>
      <ConcernCard label={"Diabetes\nFriendly"} color="green" to="/shop?concern=diabetes" bgUrl="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800" />
    </div>
    {/* Row 1 — Card B: spans last column */}
    <div style={{ gridColumn: "3 / 4" }}>
      <ConcernCard label={"Heart\nHealthy"} color="yellow" to="/shop?concern=heart" bgUrl="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600" />
    </div>

    {/* Row 2 — Card C: spans first column */}
    <div style={{ gridColumn: "1 / 2" }}>
      <ConcernCard label={"Immunity\nBooster"} color="green" to="/shop?concern=immunity" bgUrl="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600" />
    </div>
    {/* Row 2 — Card D: spans last 2 columns */}
    <div style={{ gridColumn: "2 / 4" }}>
      <ConcernCard label={"High\nProtein"} color="yellow" to="/shop?concern=protein" bgUrl="https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=800" />
    </div>
  </div>
);

/* ── Home page ── */
const Home = () => (
  <div className="min-h-screen" style={{ backgroundColor: "#F8F6F0", fontFamily: "Poppins, sans-serif" }}>

    {/* 1. Hero + floating navbar */}
    <Hero />

    {/* 2. Category bar overlapping hero bottom edge */}
    <CategoryBar />

    {/* 3. First product grid */}
    <section className="px-8 md:px-16 py-14 mt-8">
      <SectionHeading>Our Products</SectionHeading>
      <div className="grid grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((prod) => <ProductCard key={prod._id} product={prod} />)}
      </div>
    </section>

    {/* 4. Shop by Concern — asymmetric layout */}
    <section className="px-8 md:px-16 pb-14">
      <SectionHeading>Shop by Concern</SectionHeading>
      <ConcernGrid />
    </section>

    {/* 5. Second product grid */}
    <section className="px-8 md:px-16 pb-14">
      <SectionHeading>Our Products</SectionHeading>
      <div className="grid grid-cols-4 gap-6">
        {MOCK_PRODUCTS.map((prod) => <ProductCard key={prod._id} product={prod} />)}
      </div>
    </section>

    {/* 6. What We Believe In — 40/60 split */}
    <BeliefSection />

  </div>
);

export default Home;
