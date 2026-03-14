import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImg from "../assets/about_hero.png";
import founderImg from "../assets/about_founder.png";
import productsImg from "../assets/about_products.png";
import harvestImg from "../assets/about_harvest.png";

/* ─── Colours (matching site theme) ─────────────────────── */
const C = {
    bg: "#F8F6F0",
    primary: "#1B5E20",
    sage: "#C8D9B0",
    sageLight: "#E8F0DC",
    sageDeep: "#A8C58A",
    cream: "#FDFBF5",
    text: "#1a1a1a",
    muted: "#6B7280",
    border: "#E2ECDA",
};

/* ─── Fade-in-on-scroll hook ─────────────────────────────── */
function useFadeIn(threshold = 0.15) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ target, suffix = "" }) {
    const [count, setCount] = useState(0);
    const [ref, visible] = useFadeIn(0.4);
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const step = Math.ceil(target / 60);
        const id = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(id); }
            else setCount(start);
        }, 25);
        return () => clearInterval(id);
    }, [visible, target]);
    return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Section: Hero ──────────────────────────────────────── */
const HeroSection = () => (
    <div style={{ position: "relative", width: "100%", height: "520px", overflow: "hidden" }}>
        {/* Hero image */}
        <img
            src={heroImg}
            alt="Organic farms in Uttarakhand"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
        />
        {/* Gradient overlay */}
        <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
        }} />
        {/* Text content */}
        <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "0 60px",
        }}>
            <p style={{
                color: C.sageDeep, fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                marginBottom: "14px", marginTop: 0,
            }}>
                Our Story
            </p>
            <h1 style={{
                color: "#fff", fontSize: "clamp(28px, 4.5vw, 52px)",
                fontFamily: "Abel, sans-serif", fontWeight: 400,
                lineHeight: 1.2, marginBottom: "18px", marginTop: 0,
                textShadow: "0 2px 20px rgba(0,0,0,0.35)", maxWidth: "560px",
            }}>
                From the Heart of the<br />Himalayas, to Your Home
            </h1>
            <p style={{
                color: "rgba(255,255,255,0.85)", fontSize: "clamp(13px, 1.5vw, 15px)",
                lineHeight: 1.75, maxWidth: "440px",
                textShadow: "0 1px 8px rgba(0,0,0,0.3)", margin: 0,
            }}>
                Nestled in the ancient valleys of Uttarakhand, where glacial streams run clean and
                air carries the scent of pine and wildflowers, our story began with one simple promise —
                to bring nature's purest gifts directly to your table.
            </p>
        </div>
        {/* Decorative bottom fade */}
        <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
            background: `linear-gradient(to top, ${C.bg}, transparent)`,
        }} />
    </div>
);

/* ─── Section: Origin Story ──────────────────────────────── */
const OriginSection = () => {
    const [ref, visible] = useFadeIn();
    return (
        <section
            ref={ref}
            style={{
                maxWidth: "1100px", margin: "0 auto", padding: "80px 40px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
        >
            {/* Left — image */}
            <div style={{ position: "relative" }}>
                <img
                    src={founderImg}
                    alt="Our founder with a farmer in Uttarakhand"
                    style={{
                        width: "100%", aspectRatio: "4/5", objectFit: "cover",
                        borderRadius: "20px", boxShadow: "0 20px 60px rgba(27,94,32,0.18)",
                    }}
                />
                {/* Decorative corner accent */}
                <div style={{
                    position: "absolute", bottom: "-16px", left: "-16px",
                    width: "80px", height: "80px", borderRadius: "12px",
                    backgroundColor: C.sage, zIndex: -1,
                }} />
                <div style={{
                    position: "absolute", top: "-16px", right: "-16px",
                    width: "50px", height: "50px", borderRadius: "50%",
                    backgroundColor: C.sageDeep, zIndex: -1, opacity: 0.6,
                }} />
                {/* Floating quote card */}
                <div style={{
                    position: "absolute", bottom: "28px", right: "-24px",
                    backgroundColor: "#fff", borderRadius: "14px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    padding: "14px 18px", maxWidth: "200px",
                    borderLeft: `4px solid ${C.primary}`,
                }}>
                    <p style={{ fontSize: "11px", color: C.muted, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                        "Every seed planted here carries 60 years of our family's knowledge."
                    </p>
                    <p style={{ fontSize: "10px", color: C.primary, fontWeight: 700, margin: "8px 0 0", letterSpacing: "0.05em" }}>
                        — Ramesh ji, Chamoli Farmer
                    </p>
                </div>
            </div>

            {/* Right — story text */}
            <div>
                <p style={{
                    color: C.primary, fontSize: "11px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    marginBottom: "12px", marginTop: 0,
                }}>
                    Where it all began
                </p>
                <h2 style={{
                    fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 40px)",
                    color: C.text, lineHeight: 1.2, marginBottom: "24px", marginTop: 0,
                }}>
                    A trip to the mountains<br />that changed everything
                </h2>
                <div style={{ borderLeft: `3px solid ${C.sage}`, paddingLeft: "20px" }}>
                    <p style={{ color: C.muted, lineHeight: 1.85, marginBottom: "16px", marginTop: 0, fontSize: "14px" }}>
                        It was a cool October morning in 2019 when our founder, Priya, drove up the winding roads
                        of Chamoli district. She had gone to visit an old family friend — a farmer named Ramesh ji,
                        whose family had tended the same terraced fields for three generations.
                    </p>
                    <p style={{ color: C.muted, lineHeight: 1.85, marginBottom: "16px", marginTop: 0, fontSize: "14px" }}>
                        Over cups of fresh <em>buransh</em> tea, Ramesh ji spoke of how the cities had forgotten
                        what food was supposed to taste like. His turmeric glowed deep orange. His red hill rice
                        smelled of earth and rain. His forest honey crystallised the way real honey should.
                    </p>
                    <p style={{ color: C.muted, lineHeight: 1.85, marginTop: 0, marginBottom: 0, fontSize: "14px" }}>
                        Priya came back to the city with a car full of produce and a heart full of purpose.
                        She never looked back.
                    </p>
                </div>
            </div>
        </section>
    );
};

/* ─── Section: Stats ─────────────────────────────────────── */
const StatsSection = () => {
    const stats = [
        { value: 120, suffix: "+", label: "Farming Families" },
        { value: 9, suffix: "", label: "Districts of Uttarakhand" },
        { value: 100, suffix: "%", label: "Certified Organic" },
        { value: 50000, suffix: "+", label: "Happy Households" },
    ];
    return (
        <section style={{ backgroundColor: C.primary, padding: "60px 40px" }}>
            <div style={{
                maxWidth: "1100px", margin: "0 auto",
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px",
                textAlign: "center",
            }}>
                {stats.map((s, i) => (
                    <div key={i}>
                        <div style={{
                            fontFamily: "Abel, sans-serif", fontSize: "clamp(36px, 4vw, 56px)",
                            color: "#fff", lineHeight: 1, marginBottom: "8px",
                        }}>
                            <Counter target={s.value} suffix={s.suffix} />
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: 0, letterSpacing: "0.06em" }}>
                            {s.label}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

/* ─── Section: The Land ──────────────────────────────────── */
const LandSection = () => {
    const [ref, visible] = useFadeIn();
    return (
        <section
            ref={ref}
            style={{
                maxWidth: "1100px", margin: "0 auto", padding: "80px 40px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
        >
            {/* Left — text */}
            <div>
                <p style={{
                    color: C.primary, fontSize: "11px", fontWeight: 700,
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    marginBottom: "12px", marginTop: 0,
                }}>
                    Why Uttarakhand
                </p>
                <h2 style={{
                    fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 40px)",
                    color: C.text, lineHeight: 1.2, marginBottom: "24px", marginTop: 0,
                }}>
                    The land itself is the<br />purest ingredient
                </h2>
                <p style={{ color: C.muted, lineHeight: 1.85, marginBottom: "20px", marginTop: 0, fontSize: "14px" }}>
                    Uttarakhand sits at the foothills of the Himalayas, where altitude, clean glacial water, and
                    mineral-rich soil create conditions that no artificial process can replicate. Plants grown here
                    develop deeper roots, richer compounds, and flavours that carry memory.
                </p>
                <p style={{ color: C.muted, lineHeight: 1.85, marginTop: 0, marginBottom: "28px", fontSize: "14px" }}>
                    The indigenous varieties of rice, lentils, herbs and spices grown in these hills have fed
                    Himalayan communities for millennia. They are not just food — they are living heritage,
                    tended by families who understand the land in ways that no textbook can teach.
                </p>
                {/* Feature pills */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {["Glacial Spring Water", "High Altitude Soil", "No Chemical Runoff", "Centuries-old Varieties", "Biodiverse Ecosystem"].map(tag => (
                        <span key={tag} style={{
                            backgroundColor: C.sageLight, color: C.primary,
                            fontSize: "12px", fontWeight: 600,
                            padding: "6px 14px", borderRadius: "999px",
                            border: `1px solid ${C.sage}`,
                        }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right — image */}
            <div style={{ position: "relative" }}>
                <img
                    src={harvestImg}
                    alt="Village women harvesting in Uttarakhand"
                    style={{
                        width: "100%", aspectRatio: "4/5", objectFit: "cover",
                        borderRadius: "20px", boxShadow: "0 20px 60px rgba(27,94,32,0.15)",
                    }}
                />
                <div style={{
                    position: "absolute", top: "-16px", left: "-16px",
                    width: "60px", height: "60px", borderRadius: "50%",
                    backgroundColor: C.sageDeep, zIndex: -1, opacity: 0.5,
                }} />
                <div style={{
                    position: "absolute", bottom: "-12px", right: "-12px",
                    width: "90px", height: "90px", borderRadius: "14px",
                    backgroundColor: C.sage, zIndex: -1,
                }} />
            </div>
        </section>
    );
};

/* ─── Section: Our Products ──────────────────────────────── */
const ProductsSection = () => {
    const [ref, visible] = useFadeIn();
    return (
        <section style={{ backgroundColor: C.sageLight, padding: "80px 40px" }}>
            <div
                ref={ref}
                style={{
                    maxWidth: "1100px", margin: "0 auto",
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center",
                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
            >
                {/* Left — image */}
                <div style={{ position: "relative" }}>
                    <img
                        src={productsImg}
                        alt="Authentic Uttarakhand organic products"
                        style={{
                            width: "100%", aspectRatio: "1", objectFit: "cover",
                            borderRadius: "20px", boxShadow: "0 20px 60px rgba(27,94,32,0.15)",
                        }}
                    />
                    {/* Badge overlay */}
                    <div style={{
                        position: "absolute", top: "20px", right: "20px",
                        backgroundColor: C.primary, color: "#fff",
                        borderRadius: "50%", width: "80px", height: "80px",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        textAlign: "center", boxShadow: "0 4px 20px rgba(27,94,32,0.4)",
                    }}>
                        <span style={{ fontFamily: "Abel, sans-serif", fontSize: "22px", lineHeight: 1 }}>100%</span>
                        <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.2 }}>PURE &<br/>ORGANIC</span>
                    </div>
                </div>

                {/* Right — text */}
                <div>
                    <p style={{
                        color: C.primary, fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        marginBottom: "12px", marginTop: 0,
                    }}>
                        What we bring you
                    </p>
                    <h2 style={{
                        fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 40px)",
                        color: C.text, lineHeight: 1.2, marginBottom: "24px", marginTop: 0,
                    }}>
                        Products with a<br />provenance you can taste
                    </h2>
                    <p style={{ color: C.muted, lineHeight: 1.85, marginBottom: "28px", marginTop: 0, fontSize: "14px" }}>
                        From raw Himalayan forest honey harvested by Apis cerana bees, to heirloom Basmati of
                        Dehradun, to cold-pressed black sesame oil from Pithoragarh — every product we carry has a
                        name, a face, and a place. We visit every farm. We know every farmer.
                    </p>

                    {/* Product categories */}
                    {[
                        { emoji: "🍯", title: "Forest Honeys", desc: "Multifloral, rhododendron, and mountain herb honey — raw and unprocessed." },
                        { emoji: "🌾", title: "Heritage Grains", desc: "Red hill rice, mandua (finger millet), jhangora (barnyard millet) and more." },
                        { emoji: "🌿", title: "Dried Herbs & Spices", desc: "Timur pepper, tej patta, turmeric, wild nettle — dried at altitude." },
                        { emoji: "🫙", title: "Cold-Pressed Oils", desc: "Apricot, walnut, hemp seed and sesame — pressed slowly, never heated." },
                    ].map((item) => (
                        <div key={item.title} style={{
                            display: "flex", alignItems: "flex-start", gap: "14px",
                            marginBottom: "18px",
                        }}>
                            <div style={{
                                width: "40px", height: "40px", borderRadius: "10px",
                                backgroundColor: "#fff", display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontSize: "18px", flexShrink: 0,
                                boxShadow: "0 2px 10px rgba(27,94,32,0.1)",
                            }}>
                                {item.emoji}
                            </div>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: "13px", color: C.text, margin: "0 0 2px" }}>
                                    {item.title}
                                </p>
                                <p style={{ fontSize: "12px", color: C.muted, margin: 0, lineHeight: 1.6 }}>
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─── Section: Values ────────────────────────────────────── */
const ValuesSection = () => {
    const [ref, visible] = useFadeIn();
    const values = [
        {
            icon: "🌱",
            title: "No Middlemen",
            desc: "We source directly from farming families. Every rupee you spend reaches the hands that grew your food.",
        },
        {
            icon: "🔬",
            title: "Third-Party Tested",
            desc: "Every batch goes through independent lab testing for pesticide residues, heavy metals, and adulterants.",
        },
        {
            icon: "📦",
            title: "Minimal Packaging",
            desc: "We use kraft paper, glass, and recycled materials. Our packaging is as clean as what's inside it.",
        },
        {
            icon: "🤝",
            title: "Fair Trade Promise",
            desc: "Farmers receive 30-40% above market price. We believe the people who feed the nation deserve to eat well too.",
        },
        {
            icon: "🏔️",
            title: "Place-Based Purity",
            desc: "Our products are named by district. You'll always know exactly which valley your food came from.",
        },
        {
            icon: "♻️",
            title: "Climate Conscious",
            desc: "We offset every delivery and support agroforestry projects across the Kumaon and Garhwal regions.",
        },
    ];
    return (
        <section style={{ padding: "80px 40px", backgroundColor: C.bg }}>
            <div
                ref={ref}
                style={{
                    maxWidth: "1100px", margin: "0 auto",
                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <p style={{
                        color: C.primary, fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        marginBottom: "10px", marginTop: 0,
                    }}>
                        What drives us
                    </p>
                    <h2 style={{
                        fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 42px)",
                        color: C.text, lineHeight: 1.2, margin: "0 auto 14px",
                    }}>
                        The values we will never compromise
                    </h2>
                    <div style={{ width: "48px", height: "3px", borderRadius: "999px", backgroundColor: C.primary, margin: "0 auto" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
                    {values.map((v) => (
                        <div
                            key={v.title}
                            style={{
                                backgroundColor: "#fff", borderRadius: "16px",
                                padding: "28px 24px", border: `1px solid ${C.border}`,
                                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                cursor: "default",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                                e.currentTarget.style.boxShadow = "0 12px 32px rgba(27,94,32,0.12)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <div style={{
                                width: "52px", height: "52px", borderRadius: "14px",
                                backgroundColor: C.sageLight, display: "flex",
                                alignItems: "center", justifyContent: "center",
                                fontSize: "22px", marginBottom: "16px",
                            }}>
                                {v.icon}
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: "15px", color: C.text, marginBottom: "8px", marginTop: 0 }}>
                                {v.title}
                            </h3>
                            <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.7, margin: 0 }}>
                                {v.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─── Section: Farmer Voices ─────────────────────────────── */
const FarmerVoicesSection = () => {
    const [ref, visible] = useFadeIn();
    const voices = [
        {
            name: "Kamla Devi",
            location: "Almora, Kumaon",
            quote: "Before Tastes of Organic, I had to sell my organic turmeric for the same price as the sprayed stuff. Now my family can finally think about my grandchildren's education.",
            initial: "K",
        },
        {
            name: "Mohan Singh Bisht",
            location: "Pithoragarh, Kumaon",
            quote: "My father grew apricots here since before I was born. For the first time, someone is buying from us at a fair price and telling the world where our apricots come from.",
            initial: "M",
        },
        {
            name: "Sunita Rawat",
            location: "Chamoli, Garhwal",
            quote: "I was about to leave the village for the city. After joining the cooperative, I earn twice as much. My daughters will grow up knowing the land is worth staying for.",
            initial: "S",
        },
    ];
    return (
        <section style={{ backgroundColor: C.sage, padding: "80px 40px" }}>
            <div
                ref={ref}
                style={{
                    maxWidth: "1100px", margin: "0 auto",
                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <p style={{
                        color: C.primary, fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        marginBottom: "10px", marginTop: 0,
                    }}>
                        The real reason we exist
                    </p>
                    <h2 style={{
                        fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 42px)",
                        color: C.primary, lineHeight: 1.2, margin: "0 auto",
                    }}>
                        In their own words
                    </h2>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                    {voices.map((v) => (
                        <div key={v.name} style={{
                            backgroundColor: "#fff", borderRadius: "16px",
                            padding: "28px 24px",
                            boxShadow: "0 4px 24px rgba(27,94,32,0.08)",
                        }}>
                            {/* Large quote mark */}
                            <div style={{
                                fontFamily: "Georgia, serif", fontSize: "64px", color: C.sage,
                                lineHeight: 0.7, marginBottom: "16px", userSelect: "none",
                            }}>
                                "
                            </div>
                            <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: 1.8, marginBottom: "20px", marginTop: 0, fontStyle: "italic" }}>
                                {v.quote}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: `1px solid ${C.border}`, paddingTop: "16px" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    backgroundColor: C.primary, color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "Abel, sans-serif", fontSize: "18px", flexShrink: 0,
                                }}>
                                    {v.initial}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: "13px", color: C.text, margin: "0 0 2px" }}>{v.name}</p>
                                    <p style={{ fontSize: "11px", color: C.muted, margin: 0 }}>🏔️ {v.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─── Section: Timeline / Journey ───────────────────────── */
const JourneySection = () => {
    const [ref, visible] = useFadeIn();
    const milestones = [
        { year: "2019", event: "First trip to Chamoli, Priya meets Ramesh ji and the idea is born." },
        { year: "2020", event: "Tastes of Organic launches with 12 products from 8 farming families during the pandemic." },
        { year: "2021", event: "NPOP organic certification received. First subscription box ships to 200 households." },
        { year: "2022", event: "Expanded to 9 districts of Uttarakhand. Farmer cooperative formally established." },
        { year: "2023", event: "Crossed 50,000 happy customers. Zero-waste packaging initiative launched." },
        { year: "2024", event: "120+ farming families. Award for responsible sourcing from FSSAI." },
    ];
    return (
        <section style={{ backgroundColor: C.bg, padding: "80px 40px" }}>
            <div
                ref={ref}
                style={{
                    maxWidth: "800px", margin: "0 auto",
                    opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
                    transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "56px" }}>
                    <p style={{
                        color: C.primary, fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.14em", textTransform: "uppercase",
                        marginBottom: "10px", marginTop: 0,
                    }}>
                        Our journey
                    </p>
                    <h2 style={{
                        fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 3vw, 42px)",
                        color: C.text, lineHeight: 1.2, margin: 0,
                    }}>
                        Five years of growing together
                    </h2>
                </div>

                <div style={{ position: "relative" }}>
                    {/* Vertical line */}
                    <div style={{
                        position: "absolute", left: "50%", top: 0, bottom: 0,
                        width: "2px", backgroundColor: C.sage, transform: "translateX(-50%)",
                    }} />

                    {milestones.map((m, i) => (
                        <div key={m.year} style={{
                            display: "flex",
                            flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                            alignItems: "center", marginBottom: "36px", gap: "0",
                        }}>
                            {/* Text block */}
                            <div style={{
                                flex: 1, padding: i % 2 === 0 ? "0 32px 0 0" : "0 0 0 32px",
                                textAlign: i % 2 === 0 ? "right" : "left",
                            }}>
                                <div style={{
                                    backgroundColor: "#fff", borderRadius: "12px",
                                    padding: "16px 20px", border: `1px solid ${C.border}`,
                                    boxShadow: "0 2px 12px rgba(27,94,32,0.06)",
                                    display: "inline-block", maxWidth: "280px", textAlign: "left",
                                }}>
                                    <p style={{ fontSize: "11px", color: C.primary, fontWeight: 700, margin: "0 0 4px", letterSpacing: "0.06em" }}>
                                        {m.year}
                                    </p>
                                    <p style={{ fontSize: "13px", color: C.muted, margin: 0, lineHeight: 1.65 }}>
                                        {m.event}
                                    </p>
                                </div>
                            </div>

                            {/* Center dot */}
                            <div style={{
                                width: "16px", height: "16px", borderRadius: "50%",
                                backgroundColor: C.primary,
                                border: "3px solid #fff",
                                boxShadow: `0 0 0 3px ${C.sage}`,
                                flexShrink: 0, zIndex: 1,
                            }} />

                            {/* Empty half */}
                            <div style={{ flex: 1 }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/* ─── Section: CTA ───────────────────────────────────────── */
const CTASection = () => {
    const [ref, visible] = useFadeIn();
    return (
        <section
            ref={ref}
            style={{
                backgroundColor: C.primary, padding: "80px 40px",
                textAlign: "center",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
        >
            <p style={{
                color: C.sageDeep, fontSize: "11px", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                marginBottom: "12px", marginTop: 0,
            }}>
                Join the story
            </p>
            <h2 style={{
                fontFamily: "Abel, sans-serif", fontSize: "clamp(28px, 4vw, 48px)",
                color: "#fff", lineHeight: 1.2, marginBottom: "16px", marginTop: 0,
            }}>
                Every purchase is an act of care.
            </h2>
            <p style={{
                color: "rgba(255,255,255,0.7)", fontSize: "15px",
                lineHeight: 1.75, maxWidth: "520px", margin: "0 auto 36px",
            }}>
                For the farmer who grew it, for the land that nurtured it, for the family
                that will eat it. When you choose Tastes of Organic, you choose to be part
                of something real.
            </p>
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link
                    to="/shop"
                    style={{
                        backgroundColor: "#fff", color: C.primary,
                        padding: "14px 32px", borderRadius: "999px",
                        fontWeight: 700, fontSize: "14px",
                        textDecoration: "none", letterSpacing: "0.04em",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    Shop the Range
                </Link>
                <Link
                    to="/subscription"
                    style={{
                        backgroundColor: "transparent", color: "#fff",
                        padding: "14px 32px", borderRadius: "999px",
                        fontWeight: 600, fontSize: "14px",
                        textDecoration: "none", letterSpacing: "0.04em",
                        border: "2px solid rgba(255,255,255,0.5)",
                        transition: "border-color 0.2s ease, transform 0.2s ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.borderColor = "#fff";
                        e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    Get a Subscription Box
                </Link>
            </div>
        </section>
    );
};

/* ─── About Page ─────────────────────────────────────────── */
const About = () => (
    <div style={{ minHeight: "100vh", backgroundColor: C.bg, fontFamily: "Poppins, sans-serif" }}>
        <HeroSection />
        <OriginSection />
        <StatsSection />
        <LandSection />
        <ProductsSection />
        <ValuesSection />
        <FarmerVoicesSection />
        <JourneySection />
        <CTASection />
    </div>
);

export default About;
