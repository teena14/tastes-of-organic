import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Calendar, Clock, ArrowRight } from "lucide-react";
import { BLOG_POSTS } from "../constants";

const BlogPost = () => {
    const { id } = useParams();
    const post = BLOG_POSTS.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="min-h-screen bg-[#F8F6F0] flex flex-col items-center justify-center p-6 text-center font-['Poppins']">
                <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">Post Not Found</h2>
                <p className="text-gray-600 mb-6">We couldn't find the blog post you were looking for.</p>
                <Link to="/blog" className="px-6 py-3 bg-[#1B5E20] text-white rounded-full font-semibold hover:bg-[#2E7D32] transition">
                    Back to Journal
                </Link>
            </div>
        );
    }

    // Related posts (just grab 3 others)
    const relatedPosts = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 3);

    return (
        <div className="min-h-screen bg-[#F8F6F0] font-['Poppins'] pb-20">
            {/* Header / Hero Image */}
            <div className="relative w-full h-[40vh] md:h-[60vh] bg-[#1B5E20]">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="w-full h-full bg-[#C8D9B0]" />
                )}
                {/* Back button */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10 z-10">
                    <Link
                        to="/blog"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full hover:bg-white/30 transition shadow-sm text-sm font-medium"
                    >
                        <ChevronLeft size={16} />
                        Back to Journal
                    </Link>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-[800px] mx-auto px-6 -mt-16 md:-mt-32 relative z-10">
                {/* Article Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-[#E8F5E9] text-[#1B5E20] text-xs font-bold rounded-full tracking-wider uppercase">
                            {post.tag}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6 font-['Abel']">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-6 mt-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-[#1B5E20]" />
                            <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-[#1B5E20]" />
                            <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                            <div className="w-8 h-8 rounded-full bg-[#D4E6C8] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80" alt="Author" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-gray-700">Kabita Devi</span>
                        </div>
                    </div>
                </div>

                {/* Article Body (Dummy Content) */}
                <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed">
                    <p className="text-xl text-gray-600 mb-8 font-medium leading-relaxed">
                        {post.excerpt}
                    </p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 font-['Abel']">The Core Philosophy</h2>
                    <p className="mb-6">
                        When we talk about {post.tag.toLowerCase()}, we are often looking at a fragmented picture. The truth is, every single aspect of our lives is connected to the soil we walk on and the food we consume. Organic isn't just a label; it's a commitment to a regenerative system that gives back more than it takes.
                    </p>
                    <p className="mb-8">
                        Our journey began with a simple question: "What happened to the food our grandparents used to eat?" The answer led us deep into the heart of India's farmlands, where we discovered that traditional practices were being overshadowed by industrial efficiency. But there is hope.
                    </p>
                    
                    <div className="bg-[#F0F7EB] border-l-4 border-[#1B5E20] p-6 rounded-r-xl my-10 italic text-gray-800 text-lg">
                        "Nature does not hurry, yet everything is accomplished. By returning to organic practices, we aren't just saving the earth—we are saving ourselves."
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6 font-['Abel']">Practical Steps Forward</h2>
                    <ul className="list-disc pl-6 space-y-3 mb-10 marker:text-[#1B5E20]">
                        <li><strong>Start Small:</strong> You don't need to overhaul your entire pantry overnight. Begin by swapping out daily essentials like oil and spices.</li>
                        <li><strong>Read Labels:</strong> Understanding certifications (like NPOP) is crucial to ensuring you are getting genuine quality.</li>
                        <li><strong>Support Local:</strong> Whenever possible, buy from brands that transparently support smallholder farmers.</li>
                    </ul>
                    
                    <p className="mb-6">
                        As you integrate these practices into your life, you'll likely notice a difference not just in taste, but in how you feel. Real food has a resonance to it. It carries the energy of the sun, the soil, and the hands that nurtured it.
                    </p>
                </div>
                
                {/* Author Bio Footer */}
                <div className="mt-16 p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80" alt="Author" className="w-20 h-20 rounded-full object-cover shrink-0" />
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">Written by Kabita Devi</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Kabita Devi is the founder of Tastes of Organic. With a deep passion for sustainable agriculture and holistic wellness, she spends her time travelling between our partner farms in Uttarakhand and our headquarters, ensuring every product meets our rigorous standards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <div className="max-w-[1100px] mx-auto px-6 mt-24">
                    <h3 className="text-2xl font-bold text-gray-900 mb-8 font-['Abel']">Read Next</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedPosts.map(rp => (
                            <Link key={rp.id} to={`/blog/${rp.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition block border border-gray-100">
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img src={rp.image} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                </div>
                                <div className="p-6">
                                    <span className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider mb-2 block">{rp.tag}</span>
                                    <h4 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-[#1B5E20] transition">{rp.title}</h4>
                                    <div className="flex items-center text-xs text-gray-500 gap-4">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {rp.date}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPost;
