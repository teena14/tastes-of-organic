import Hero from "../components/Hero";
import CategoryBar from "../components/CategoryBar";
import ProductCard from "../components/ProductCard";
import ConcernCard from "../components/ConcernCard";
import BeliefSection from "../components/BeliefSection";

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
      <ConcernCard label={"Diabetes\nFriendly"} color="green" to="/shop?concern=diabetes" />
    </div>
    {/* Row 1 — Card B: spans last column */}
    <div style={{ gridColumn: "3 / 4" }}>
      <ConcernCard label={"Diabetes\nFriendly"} color="green" to="/shop?concern=diabetes" />
    </div>

    {/* Row 2 — Card C: spans first column */}
    <div style={{ gridColumn: "1 / 2" }}>
      <ConcernCard label={"Heart\nHealthy"} color="yellow" to="/shop?concern=heart" />
    </div>
    {/* Row 2 — Card D: spans last 2 columns */}
    <div style={{ gridColumn: "2 / 4" }}>
      <ConcernCard label={"High\nProtein"} color="yellow" to="/shop?concern=protein" />
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
        {[1, 2, 3, 4].map((i) => <ProductCard key={i} placeholder />)}
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
        {[1, 2, 3, 4].map((i) => <ProductCard key={i} placeholder />)}
      </div>
    </section>

    {/* 6. What We Believe In — 40/60 split */}
    <BeliefSection />

  </div>
);

export default Home;