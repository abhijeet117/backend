import { Link, useNavigate } from "react-router";
import "../style/register.scss";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleRegister, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await handleRegister(username, email, password);
      const registeredUserName = response?.user?.userName;
      if (registeredUserName) {
        navigate(`/profile/${registeredUserName}/feed`);
        return;
      }
      navigate("/feed");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <main className="auth-register">
      <section className="auth-register__shell">
        <div className="auth-register__intro">
          <p className="auth-register__tag">Insta Clone</p>
          <h2>Create your profile</h2>
          <p>Join your friends, share photos, and start building your feed.</p>
        </div>
        <div className="register-form-container">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              onInput={(e)=>{setUsername(e.target.value)}}
              className="username"
              placeholder="Enter Username"
              type="text"
            />
            <input
            onInput={(e)=>{setEmail(e.target.value)}}
              className="email"
              placeholder="Enter Email"
              type="text"
            />
            <input
            onInput={(e)=>{setPassword(e.target.value)}}
              className="password"
              placeholder="Enter Password"
              type="password"
            />
            <button disabled={loading}>{loading ? "Registering..." : "Register"}</button>
          </form>

          <p>
            Already have an account <Link to={"/login"}>Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
