import { Link, useNavigate } from "react-router";
import "../style/login.scss";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await handleLogin(username, password);
      const loggedInUserName = response?.user?.userName;
      if (loggedInUserName) {
        navigate(`/profile/${loggedInUserName}/feed`);
        return;
      }
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <main className="auth-login">
      <section className="auth-login__shell">
        <div className="auth-login__intro">
          <p className="auth-login__tag">Insta Clone</p>
          <h2>Welcome back</h2>
          <p>Catch up with your people and share your latest moments.</p>
        </div>
        <div className="form-container">
          <h1>Login</h1>
          <form onSubmit={handleSubmit}>
            <input
              onInput={(e) => {
                setUsername(e.target.value);
              }}
              className="username"
              placeholder="Enter Username or Email"
              type="text"
            />
            <input
              onInput={(e) => {
                setPassword(e.target.value);
              }}
              className="password"
              placeholder="Enter Password"
              type="password"
            />
            <button disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
          </form>

          <p>
            Don't have an account <Link to={"/register"}>Register</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
