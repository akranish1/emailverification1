import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function Verify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const email = state?.email || "";

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleVerify = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify", { email, otp });
      if (res.data.message === "Verified successfully") navigate("/login");
      else alert(res.data.message);
    } catch (err) { alert("Error verifying OTP"); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2">Verify Email</h2>
        <p className="text-gray-500 text-sm mb-6">Sent to {email}</p>
        <input maxLength="6" placeholder="000000" className="w-full text-center text-3xl tracking-widest font-mono py-3 border-2 rounded-xl mb-4 outline-none focus:border-blue-500" onChange={e => setOtp(e.target.value)} />
        <button onClick={handleVerify} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 mb-4">Verify</button>
        <button disabled={timer > 0} onClick={() => setTimer(60)} className="text-sm text-blue-600 disabled:text-gray-400">
          {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
}