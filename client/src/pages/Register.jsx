import React, { useState } from "react";

function Register() {
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [error,setError] = useState("");

    const handleRegister = (event) => {
      event.preventDefault();
      setError("");

      if(name.trim().length ===0){
        setError("Name is required");
        return;
      }

      if(email.trim().length === 0){
        setError("Email is required");
        return;
      }

      if(password.trim().length === 0){
        setError("Password is required");
        return;
      }

      if(confirmPassword.trim().length === 0){
        setError("Confirm Password is required");
        return;
      }

      if(password !== confirmPassword){
        setError("Passwords do not match");
        return;
      }

      console.log("Name :",name);
      console.log("Email :",email);
      console.log("Password :",password);
      console.log("Confirm Password :",confirmPassword);
    }
  return (
    <>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label>Name</label>
          <br />
          <input type="text" placeholder="Enter your name"
           value = {name}
           onChange = {(event) => setName(event.target.value)}
          />
          
        </div>

        <br />

        <div>
          <label>Email</label>
          <br />
          <input type="email" placeholder="Enter your email"
          value = {email}
          onChange = {(event) => setEmail(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input type="password" placeholder="Enter your password"
           value = {password}
           onChange = {(event) => setPassword(event.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Confirm Password</label>
          <br />
          <input
            type="password"
            placeholder="Confirm your password"
            value = {confirmPassword}
            onChange = {(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        <br />
    {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">
          Register
        </button>
      </form>
    </>
  );
}

export default Register;