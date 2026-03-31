import { Link } from "react-router-dom";

const Hero = () => {
    return (
        <section className="relative h-[520px] w-full overflow-hidden">

            {/* Background image */}
            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=2070" alt="Beautiful organic spices and farms" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />

            {/* Hero text */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-4">
                <p
                    className="font-light tracking-[0.35em] text-sm uppercase mb-2 text-white/80"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    Rooted &amp; Pure
                </p>
                <h1
                    className="text-5xl md:text-6xl leading-tight drop-shadow-lg uppercase tracking-wide"
                    style={{ fontFamily: "Abel, sans-serif" }}
                >
                    Taste of Organics
                </h1>
                <p
                    className="font-light mt-4 text-base text-white/85 max-w-md"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                >
                    We are proud of our natural produce and our farmer's
                </p>
                <Link to="/shop">
                    <button
                        className="mt-7 border border-white/60 bg-white/20 backdrop-blur-sm text-white
                       font-medium px-10 py-3 rounded-full text-sm tracking-wide
                       hover:bg-white/30 transition-all duration-200"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                        Explore
                    </button>
                </Link>
            </div>

        </section>
    );
};

export default Hero;
