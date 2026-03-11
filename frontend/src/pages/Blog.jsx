import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

/* ─── Static Blog Data ─────────────────────────────────────────── */
const BLOG_POSTS = [
    {
        id: 1,
        title: "Why Organic Honey is Better for Your Health",
        excerpt:
            "Discover the incredible benefits of raw, unprocessed organic honey sourced directly from trusted beekeepers. From antioxidants to antibacterial properties, nature's golden gift has it all.",
        date: "10/03/26",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
        tag: "Health",
    },
    {
        id: 2,
        title: "5 Ways to Include Millets in Your Daily Diet",
        excerpt:
            "Millets are an ancient superfood that are making a massive comeback. Here are five simple, delicious ways to incorporate these nutrient-dense grains into your meals every day.",
        date: "08/03/26",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
        tag: "Nutrition",
    },
    {
        id: 3,
        title: "From Farm to Table: Our Sourcing Promise",
        excerpt:
            "We work directly with over 200 organic farmers across India to bring you the freshest, most authentic produce. Learn about our rigorous quality checks and traceability process.",
        date: "05/03/26",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80",
        tag: "Farming",
    },
    {
        id: 4,
        title: "The Truth About Cold-Pressed Oils",
        excerpt:
            "Cold-pressed oils retain all their natural nutrients, flavour, and aroma unlike refined oils. This guide explains why switching to cold-pressed is one of the best things you can do for your kitchen.",
        date: "01/03/26",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80",
        tag: "Cooking",
    },
    {
        id: 5,
        title: "Sustainable Agriculture: Why It Matters",
        excerpt:
            "Sustainable farming practices protect our soil, water, and biodiversity. We break down the key principles and explain how supporting organic brands helps the planet.",
        date: "26/02/26",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=80",
        tag: "Sustainability",
    },
    {
        id: 6,
        title: "Spices: The Heart of Indian Organic Cooking",
        excerpt:
            "From turmeric's anti-inflammatory magic to cumin's digestive benefits, Indian spices are a treasure trove of wellness. Explore our favourite organic spice stories.",
        date: "22/02/26",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&q=80",
        tag: "Spices",
    },
    {
        id: 7,
        title: "Understanding the Organic Certification Process",
        excerpt:
            "Not all products labelled 'organic' truly are. Learn how to read certification labels, what NPOP means, and how we ensure every product we sell meets the highest standards.",
        date: "18/02/26",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80",
        tag: "Education",
    },
    {
        id: 8,
        title: "10 High-Protein Pulses You Should Be Eating",
        excerpt:
            "Pulses are one of the most affordable, protein-rich, and planet-friendly foods available. Here are ten you should add to your weekly rotation, with simple recipe ideas.",
        date: "14/02/26",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80",
        tag: "Nutrition",
    },
    {
        id: 9,
        title: "Seasonal Eating: Aligning with Nature's Calendar",
        excerpt:
            "Eating seasonally reduces your carbon footprint, supports local farmers, and means your food is at its nutritional peak. Here's a guide to seasonal organic produce in India.",
        date: "10/02/26",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80",
        tag: "Lifestyle",
    },
    {
        id: 10,
        title: "How Organic Wheat Differs from Conventional",
        excerpt:
            "Organic wheat is grown without synthetic fertilisers or pesticides, and the difference shows up in taste, nutrition, and environmental impact. We explore the science behind the difference.",
        date: "06/02/26",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80",
        tag: "Farming",
    },
    {
        id: 11,
        title: "Kids & Organic Food: Building Healthy Habits Early",
        excerpt:
            "Introducing organic food to children early sets the foundation for a lifetime of healthy choices. Practical tips for parents on making organic eating fun and affordable for families.",
        date: "02/02/26",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&q=80",
        tag: "Family",
    },
    {
        id: 12,
        title: "The Rise of Organic Farming in Rural India",
        excerpt:
            "Thousands of smallholder farmers across India are transitioning to organic methods, improving their income and restoring soil health. Here are some inspiring stories from our farmer partners.",
        date: "28/01/26",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80",
        tag: "Stories",
    },
];

/* ─── Hero Carousel Slides ─────────────────────────────────────── */
const SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1400&q=80",
        headline: "Growing food the way nature intended",
        sub: "Explore stories, tips, and insights from our community of organic farmers and nutritionists.",
    },
    {
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=80",
        headline: "From fields to your family's table",
        sub: "Honest conversations about sustainable agriculture, seasonal produce, and clean eating.",
    },
    {
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1400&q=80",
        headline: "Nourishing people and the planet",
        sub: "Deep-dives into organic living, wellness, and the science behind the food you choose.",
    },
    {
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80",
        headline: "Every bite tells a farmer's story",
        sub: "Meet the growers behind your food and discover the heritage of India's organic traditions.",
    },
];

/* ─── Tag colour map ───────────────────────────────────────────── */
const TAG_COLORS = {
    Health: { bg: "#E8F5E9", color: "#2E7D32" },
    Nutrition: { bg: "#E3F2FD", color: "#1565C0" },
    Farming: { bg: "#FFF8E1", color: "#F57F17" },
    Cooking: { bg: "#FCE4EC", color: "#C62828" },
    Sustainability: { bg: "#E8F5E9", color: "#1B5E20" },
    Spices: { bg: "#FFF3E0", color: "#E65100" },
    Education: { bg: "#EDE7F6", color: "#4527A0" },
    Lifestyle: { bg: "#F3E5F2", color: "#6A1B9A" },
    Family: { bg: "#E1F5FE", color: "#01579B" },
    Stories: { bg: "#F1F8E9", color: "#33691E" },
};

/* ─── Skeleton Card ────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div
        style={{
            backgroundColor: "#fff",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
    >
        <div
            className="animate-pulse"
            style={{ aspectRatio: "4/3", backgroundColor: "#D4E6C8" }}
        />
        <div style={{ padding: "16px" }}>
            <div
                className="animate-pulse"
                style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", width: "30%", marginBottom: "10px" }}
            />
            <div
                className="animate-pulse"
                style={{ height: "14px", backgroundColor: "#E2ECDA", borderRadius: "4px", width: "90%", marginBottom: "6px" }}
            />
            <div
                className="animate-pulse"
                style={{ height: "14px", backgroundColor: "#E2ECDA", borderRadius: "4px", width: "70%", marginBottom: "12px" }}
            />
            <div
                className="animate-pulse"
                style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", width: "55%", marginBottom: "6px" }}
            />
            <div
                className="animate-pulse"
                style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", width: "45%", marginBottom: "14px" }}
            />
            <div
                className="animate-pulse"
                style={{ height: "10px", backgroundColor: "#D4E6C8", borderRadius: "4px", width: "35%" }}
            />
        </div>
    </div>
);

/* ─── Blog Card ────────────────────────────────────────────────── */
const BlogCard = ({ post }) => {
    const tagStyle = TAG_COLORS[post.tag] || { bg: "#E8F5E9", color: "#1B5E20" };

    return (
        <div
            style={{
                backgroundColor: "#fff",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 28px rgba(27,94,32,0.14)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
            }}
        >
            {/* Image */}
            <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", backgroundColor: "#C8D9B0" }}>
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.35s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", backgroundColor: "#C8D9B0" }} />
                )}
                {/* Tag badge */}
                <span
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        backgroundColor: tagStyle.bg,
                        color: tagStyle.color,
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: "999px",
                        letterSpacing: "0.04em",
                    }}
                >
                    {post.tag}
                </span>
            </div>

            {/* Body */}
            <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Heading */}
                <h3
                    style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#1a1a1a",
                        lineHeight: 1.45,
                        marginBottom: "8px",
                        marginTop: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {post.title}
                </h3>

                {/* Excerpt */}
                <p
                    style={{
                        fontSize: "12px",
                        color: "#6B7280",
                        lineHeight: 1.65,
                        marginBottom: "14px",
                        marginTop: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        flex: 1,
                    }}
                >
                    {post.excerpt}
                </p>

                {/* Footer meta */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderTop: "1px solid #F0F4EC",
                        paddingTop: "10px",
                        marginTop: "auto",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Calendar size={11} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>Published : {post.date}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={11} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{post.readTime}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Hero Carousel ────────────────────────────────────────────── */
const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    const goTo = useCallback(
        (idx) => {
            if (transitioning || idx === current) return;
            setTransitioning(true);
            setTimeout(() => {
                setCurrent(idx);
                setTransitioning(false);
            }, 300);
        },
        [current, transitioning]
    );

    const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
    const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

    // Auto-rotate
    useEffect(() => {
        const id = setInterval(next, 4000);
        return () => clearInterval(id);
    }, [next]);

    const slide = SLIDES[current];

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "460px",
                overflow: "hidden",
                backgroundColor: "#1B5E20",
            }}
        >
            {/* Image */}
            <img
                key={current}
                src={slide.image}
                alt={slide.headline}
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: transitioning ? 0 : 1,
                    transition: "opacity 0.4s ease",
                }}
            />

            {/* Dark gradient overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to top, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)",
                }}
            />

            {/* Text */}
            <div
                style={{
                    position: "absolute",
                    bottom: "68px",
                    left: "40px",
                    right: "40px",
                    opacity: transitioning ? 0 : 1,
                    transform: transitioning ? "translateY(8px)" : "translateY(0)",
                    transition: "opacity 0.4s ease, transform 0.4s ease",
                }}
            >
                <h1
                    style={{
                        color: "#fff",
                        fontSize: "clamp(22px, 3.5vw, 36px)",
                        fontWeight: 700,
                        lineHeight: 1.3,
                        marginBottom: "10px",
                        marginTop: 0,
                        maxWidth: "640px",
                        textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        fontFamily: "Poppins, sans-serif",
                    }}
                >
                    {slide.headline}
                </h1>
                <p
                    style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "clamp(12px, 1.4vw, 14px)",
                        lineHeight: 1.6,
                        maxWidth: "520px",
                        margin: 0,
                        textShadow: "0 1px 6px rgba(0,0,0,0.3)",
                        fontFamily: "Poppins, sans-serif",
                    }}
                >
                    {slide.sub}
                </p>
            </div>

            {/* Prev / Next arrows */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "16px",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                    transition: "background-color 0.2s",
                    zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.32)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
            >
                <ChevronLeft size={18} />
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                style={{
                    position: "absolute",
                    top: "50%",
                    right: "16px",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                    transition: "background-color 0.2s",
                    zIndex: 2,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.32)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)")}
            >
                <ChevronRight size={18} />
            </button>

            {/* Dot indicators */}
            <div
                style={{
                    position: "absolute",
                    bottom: "22px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: "8px",
                    zIndex: 2,
                }}
            >
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{
                            width: i === current ? "22px" : "8px",
                            height: "8px",
                            borderRadius: "999px",
                            backgroundColor: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "width 0.35s ease, background-color 0.35s ease",
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

/* ─── Blog Page ────────────────────────────────────────────────── */
const Blog = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    // Simulate a brief loading state for polish
    useEffect(() => {
        const t = setTimeout(() => {
            setPosts(BLOG_POSTS);
            setLoading(false);
        }, 700);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: "#F8F6F0",
                fontFamily: "Poppins, sans-serif",
            }}
        >
            {/* ── Hero Carousel ── */}
            <HeroCarousel />

            {/* ── Main content ── */}
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 64px" }}>

                {/* Section header */}
                <div style={{ marginBottom: "28px" }}>
                    <p
                        style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "#1B5E20",
                            marginBottom: "6px",
                            marginTop: 0,
                        }}
                    >
                        Our Journal
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(20px, 3vw, 26px)",
                            fontWeight: 700,
                            color: "#1a1a1a",
                            margin: 0,
                        }}
                    >
                        Latest blog posts
                    </h2>
                    {/* Decorative underline */}
                    <div
                        style={{
                            marginTop: "8px",
                            width: "48px",
                            height: "3px",
                            borderRadius: "999px",
                            backgroundColor: "#1B5E20",
                        }}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        {[...Array(9)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "80px 0",
                            color: "#9CA3AF",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "72px",
                                height: "72px",
                                borderRadius: "50%",
                                backgroundColor: "#E2ECDA",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "20px",
                                fontSize: "28px",
                            }}
                        >
                            📝
                        </div>
                        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#1B5E20", marginBottom: "8px", marginTop: 0 }}>
                            No posts yet
                        </h3>
                        <p style={{ fontSize: "14px", margin: 0 }}>
                            Check back soon — we're busy writing something great for you.
                        </p>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        {posts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blog;
