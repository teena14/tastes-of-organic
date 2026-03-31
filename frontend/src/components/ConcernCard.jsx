import { Link } from "react-router-dom";

/**
 * ConcernCard
 * Props:
 *   label  (string)             — card title, use \n for line breaks
 *   color  ("green" | "yellow") — fallback color
 *   to     (string)             — link
 *   bgUrl  (string)             — background image URL
 */
const ConcernCard = ({ label = "Diabetes\nFriendly", color = "green", to = "/shop", bgUrl }) => (
    <div
        className="relative rounded-2xl p-8 flex flex-col justify-between h-full overflow-hidden group"
        style={{ backgroundColor: color === "green" ? "#C8D9B0" : "#F5EDBB" }}
    >
        {bgUrl && (
            <>
                <img src={bgUrl} alt={label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
            </>
        )}
        
        {/* Title — Abel */}
        <h3 className={`relative z-10 font-abel text-3xl leading-tight whitespace-pre-line ${bgUrl ? 'text-white' : 'text-primary'}`}>
            {label}
        </h3>
        <Link to={to}>
            {/* Explore button — Abel */}
            <button
                className="relative z-10 mt-5 text-white font-abel text-base px-8 py-2.5 rounded-full
                   hover:bg-white/20 hover:backdrop-blur-md transition-all w-fit border border-white/40"
                style={{ backgroundColor: bgUrl ? "rgba(255,255,255,0.15)" : "#1B5E20", backdropFilter: bgUrl ? "blur(4px)" : "none" }}
            >
                Explore
            </button>
        </Link>
    </div>
);

export default ConcernCard;
