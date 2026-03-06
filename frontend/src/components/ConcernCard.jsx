import { Link } from "react-router-dom";

/**
 * ConcernCard
 * Props:
 *   label  (string)             — card title, use \n for line breaks
 *   color  ("green" | "yellow") — palette
 *   to     (string)             — link
 */
const ConcernCard = ({ label = "Diabetes\nFriendly", color = "green", to = "/shop" }) => (
    <div
        className="rounded-2xl p-8 flex flex-col justify-between h-full"
        style={{ backgroundColor: color === "green" ? "#C8D9B0" : "#F5EDBB" }}
    >
        {/* Title — Abel */}
        <h3 className="font-abel text-2xl text-primary leading-tight whitespace-pre-line">
            {label}
        </h3>
        <Link to={to}>
            {/* Explore button — Abel */}
            <button
                className="mt-5 text-white font-abel text-base px-6 py-2 rounded-full
                   hover:opacity-90 transition-opacity w-fit"
                style={{ backgroundColor: "#1B5E20" }}
            >
                Explore
            </button>
        </Link>
    </div>
);

export default ConcernCard;
