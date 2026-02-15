import { useEffect, useState } from "react";
import { getWishlist } from "../services/wishlistApi";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getWishlist();
        setItems(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Wishlist</h1>

      {items.length === 0 && <p>No items in wishlist</p>}

      {items.map((item) => (
        <Link key={item._id} to={`/product/${item._id}`}>
          <div>
            <img src={item.images?.[0]} alt={item.name} width="120" />
            <p>{item.name}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Wishlist;