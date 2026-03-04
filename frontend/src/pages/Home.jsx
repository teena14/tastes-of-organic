import { Link } from "react-router-dom";

const Home = () => (
  <div style={{ padding: "16px" }}>
    <h1>Tastes of Organic</h1>
    <p>Welcome! Browse our organic products.</p>
    <br />
    <Link to="/shop"><button>Shop Now</button></Link>{" "}
    <Link to="/subscription"><button>Subscription Plans</button></Link>
  </div>
);

export default Home;
