import { Link } from "react-router";
import "../style/login.scss";
import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    axios.post(
        "http://localhost:3000/api/auth/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        },
      )
      .then((res) => {
        console.log(res.data);
      });
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
            onInput={(e)=>{setUsername(e.target.value)}}
              className="username"
              placeholder="Enter Username"
              type="text"
            />
            <input
            onInput={(e)=>{setPassword(e.target.value)}}
              className="password"
              placeholder="Enter Password"
              type="text"
            />
            <button>Login</button>
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
