import { Link } from "react-router-dom";
import productImg from "../assets/placeholder_product.png";

const CATEGORIES = [
    "Honey", "Pulses", "Grains", "Flour", "Millets", "Spices",
];

const CategoryBar = () => (
    /* Negative margin pulls bar up to overlap hero bottom */
    <div className="relative -mt-10 flex justify-center z-20 px-4">
        <div className="bg-white shadow-xl rounded-2xl flex items-center justify-between gap-4 px-10 py-4 w-full max-w-3xl">
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat}
                    to={`/shop?category=${cat.toLowerCase()}`}
                    className="flex flex-col items-center gap-1 group"
                >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F5EDBB] flex items-center justify-center">
                        <img
                            src={productImg}
                            alt={cat}
                            className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
                        />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{cat}</span>
                </Link>
            ))}
        </div>
    </div>
);

export default CategoryBar;
