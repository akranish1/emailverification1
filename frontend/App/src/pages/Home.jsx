import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
const API = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/protected`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-10">
        <h1 className="font-bold text-xl text-blue-600">Dashboard</h1>
        <button onClick={logout} className="text-red-500 font-bold hover:underline">Logout</button>
      </nav>
      <div className="p-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border">
          <h2 className="text-3xl font-black mb-4">You are Logged In!</h2>
          <p className="text-gray-500 mb-6">Below is the data decoded from your JWT secure token:</p>
          <pre className="bg-gray-900 text-green-400 p-6 rounded-xl overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}