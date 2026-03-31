import { Link } from "react-router-dom";

const CATEGORIES = [
    { name: "Honey", img: "https://images.unsplash.com/photo-1587049352847-4d451cb5ad26?auto=format&fit=crop&w=150&q=80" },
    { name: "Pulses", img: "https://images.unsplash.com/photo-1582046182061-9fbd597d81a8?auto=format&fit=crop&w=150&q=80" },
    { name: "Grains", img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=150&q=80" },
    { name: "Flour", img: "https://images.unsplash.com/photo-1508119069796-0160d5c079bc?auto=format&fit=crop&w=150&q=80" },
    { name: "Millets", img: "https://images.unsplash.com/photo-1621252178229-2be81fb1ca03?auto=format&fit=crop&w=150&q=80" },
    { name: "Spices", img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=150&q=80" },
];

const CategoryBar = () => (
    /* Negative margin pulls bar up to overlap hero bottom */
    <div className="relative -mt-10 flex justify-center z-20 px-4">
        <div className="bg-white shadow-xl rounded-2xl flex items-center justify-between gap-4 px-10 py-4 w-full max-w-3xl">
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat.name}
                    to={`/shop?category=${cat.name.toLowerCase()}`}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm flex items-center justify-center border-2 border-[#F5EDBB] group-hover:border-[#C8D9B0] transition-colors duration-200">
                        <img
                            src={cat.img}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-gray-700">{cat.name}</span>
                </Link>
            ))}
        </div>
    </div>
);

export default CategoryBar;
