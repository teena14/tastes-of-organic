import { Link } from "react-router-dom";

import { FEATURED_CATEGORIES as CATEGORIES } from "../constants";

const CategoryBar = () => (
    /* Negative margin pulls bar up to overlap hero bottom */
    <div className="relative -mt-10 flex justify-center z-20 px-4">
        <div className="bg-white shadow-xl rounded-2xl flex items-center justify-start md:justify-between gap-6 px-6 md:px-10 py-4 w-full max-w-3xl overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
                <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
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

