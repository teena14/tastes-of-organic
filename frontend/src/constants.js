export const SHOP_CATEGORIES = [
  { id: "ALL", label: "All Products" },
  { id: "HONEY", label: "Honey" },
  { id: "PULSES", label: "Pulses" },
  { id: "WHEAT", label: "Wheat" },
  { id: "MILLET", label: "Millet" },
  { id: "FLOUR", label: "Flour" },
  { id: "JUICES", label: "Juices" },
  { id: "SPICES", label: "Spices" },
  { id: "OILS", label: "Oils" },
  { id: "COMBOS", label: "Combos" }
];

export const SHOP_CONCERNS = [
  { id: "diabetes", label: "Diabetes Friendly" },
  { id: "heart", label: "Heart Healthy" },
  { id: "immunity", label: "Immunity Booster" },
  { id: "protein", label: "High Protein" }
];

export const SUBSCRIPTION_CATEGORIES = [
  "All", "Honey", "Pulses", "Flour", "Millet", "Juices", "Spices", "Combos"
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating", label: "Top Rated" },
];

export const FEATURED_CATEGORIES = [
  { id: "HONEY",  name: "Honey",   img: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=150&q=80" },
  { id: "PULSES", name: "Pulses",  img: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=150&q=80" },
  { id: "FLOUR",  name: "Flour",   img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=150&q=80" },
  { id: "MILLET", name: "Millets", img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=150&q=80" },
  { id: "JUICES", name: "Juices",  img: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=150&q=80" },
  { id: "SPICES", name: "Spices",  img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80" },
];

export const BLOG_POSTS = [
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


