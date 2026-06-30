/**
 * BeliefSection
 * Layout: 40% left (heading) | 60% right (3 circles)
 */
const BeliefSection = ({ items }) => {
    const beliefs = items || [
        { text: "We source directly from trusted organic farmers across India.", icon: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=150" },
        { text: "No chemicals, no shortcuts — just pure, honest ingredients.", icon: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=150" },
        { text: "Every purchase supports a farming family and sustainable agriculture.", icon: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=150" },
    ];

    return (
        <section
            className="flex items-center px-8 md:px-16 py-16"
            style={{ backgroundColor: "#C8D9B0" }}
        >
            {/* LEFT — 40% — "What we Believe in" heading */}
            <div className="flex items-stretch gap-5 shrink-0" style={{ width: "40%" }}>
                <div className="w-[3px] rounded-full self-stretch" style={{ backgroundColor: "#1B5E2055" }} />
                {/* Heading — Abel */}
                <h2 className="font-abel text-4xl md:text-5xl text-primary leading-tight">
                    What we <br /> Believe in
                </h2>
            </div>

            {/* RIGHT — 60% — Three belief circles */}
            <div className="flex items-start justify-around gap-6" style={{ width: "60%" }}>
                {beliefs.map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-3" style={{ flex: 1 }}>
                        {/* Circle placeholder */}
                        <div
                            className="rounded-full border border-white shadow flex items-center justify-center shrink-0"
                            style={{ width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.65)" }}
                        >
                            {item.icon
                                ? typeof item.icon === "string"
                                    ? <img src={item.icon} alt="" className="w-full h-full object-cover rounded-full" />
                                    : item.icon
                                : <div className="rounded-full" style={{ width: 44, height: 44, backgroundColor: "#B5C98A99" }} />
                            }
                        </div>
                        {/* Description — Poppins */}
                        <p className="font-poppins text-xs text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BeliefSection;

