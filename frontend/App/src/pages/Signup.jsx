import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
    const API = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/signup`, { email, password });
      alert(res.data.message);
      navigate("/verify", { state: { email } });
    } catch (err) { alert("Signup failed"); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <span className="text-4xl">👋</span>
          <h2 className="text-2xl font-bold mt-2">Create Account</h2>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <input type="email" placeholder="Email" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Sign Up</button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link></p>
      </div>
    </div>
  );
}