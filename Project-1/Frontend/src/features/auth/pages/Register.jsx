import { Link } from "react-router";
import "../style/register.scss";
import { useState } from "react";
import axios from "axios"

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    axios.post("http://localhost:3000/api/auth/register",{
        username,
        email,
        password
    },{
        withCredentials : true
    }).then(res=> {
        console.log(res.data)
    })
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
              type="text"
            />
            <button>Register</button>
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
