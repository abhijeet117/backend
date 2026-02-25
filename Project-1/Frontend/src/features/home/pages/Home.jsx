import { useNavigate } from "react-router";

import "../style/Home.scss";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="home-simple">
      <div className="home-simple__card">
        <h1>This is home page</h1>
        <div className="home-simple__actions">
          <button type="button" onClick={() => navigate("/login")}>
            Login
          </button>
          <button type="button" onClick={() => navigate("/register")}>
            Register
          </button>
        </div>
      </div>
    </main>
  );
};

export default Home;
