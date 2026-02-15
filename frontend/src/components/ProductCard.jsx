import { useState } from "react";
import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../services/wishlistApi";

const ProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault(); // prevent Link navigation when clicking heart

    try {
      if (wishlisted) {
        await removeFromWishlist(product._id);
        setWishlisted(false);
      } else {
        await addToWishlist(product._id);
        setWishlisted(true);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    }
  };

  return (
    <Link to={`/product/${product._id}`}>
      <div className="product-card">
        <img src={product.images?.[0]} alt={product.name} width="150" />
        <h3>{product.name}</h3>
        <p>₹{product.price}</p>

        <button onClick={handleWishlist}>
          {wishlisted ? "💚" : "🤍"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;