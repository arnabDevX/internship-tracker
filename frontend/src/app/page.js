"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [successPopup, setSuccessPopup] = useState(false);
  const [otpPopup, setOtpPopup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!otpMode && (!email || !password || (!isLogin && !name))) {
      setMessage("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      if (otpMode) {
        const res = await fetch("http://127.0.0.1:5050/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp })
        });

        const data = await res.json();

        if (res.ok) {
          localStorage.setItem("token", data.token);
          setSuccessPopup(true);
          setTimeout(()=>router.push("/dashboard"),1500);
        } else {
          setMessage(data.message);
        }

        setLoading(false);
        return;
      }

      const url = isLogin
        ? "http://127.0.0.1:5050/api/auth/login"
        : "http://127.0.0.1:5050/api/auth/send-otp";

      const payload = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem("token", data.token);
          setSuccessPopup(true);
          setTimeout(()=>router.push("/dashboard"),1500);
        } else {
          setOtpMode(true);
          setOtpPopup(true);
          setTimeout(()=>setOtpPopup(false),1500);
          setResendTimer(30);
          setCanResend(false);
        }
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setMessage("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => {
      setResendTimer(resendTimer - 1);
    }, 1000);
    if (resendTimer === 1) setCanResend(true);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const resendOtp = async () => {
    if (!canResend) return;
    try {
      const res = await fetch("http://127.0.0.1:5050/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        setOtpPopup(true);
        setTimeout(()=>setOtpPopup(false),1500);
        setResendTimer(30);
        setCanResend(false);
      }
    } catch {}
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.15;
          animation: float 6s ease-in-out infinite;
          filter: blur(12px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
          box-shadow: 0 4px 30px rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          pointer-events: none;
          z-index: 0;
        }
        .floating-shape.small {
          width: 100px;
          height: 100px;
          animation-duration: 7s;
        }
        .floating-shape.medium {
          width: 150px;
          height: 150px;
          animation-duration: 10s;
        }
        .floating-shape.large {
          width: 220px;
          height: 220px;
          animation-duration: 12s;
        }
        body, html, #__next {
          margin: 0; padding: 0; height: 100%;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          overflow-x: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .animated-bg {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(270deg, #6a11cb, #2575fc, #6a11cb);
          background-size: 600% 600%;
          animation: gradientBG 15s ease infinite;
          z-index: -1;
        }
        @keyframes gradientBG {
          0% {background-position:0% 50%;}
          50% {background-position:100% 50%;}
          100% {background-position:0% 50%;}
        }
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          position: relative;
          z-index: 1;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.65);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          width: 400px;
          max-width: 90vw;
          padding: 3rem 2.5rem 2rem;
          color: #1a1a1a;
          position: relative;
          overflow: hidden;
        }
        @keyframes slowFlash {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .flash-text {
          animation: slowFlash 3.5s ease-in-out infinite;
          font-weight: 700;
        }
        .header {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        @keyframes glowPulse {
          0% { box-shadow: 0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(37,117,252,0.3); }
          50% { box-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(37,117,252,0.6); }
          100% { box-shadow: 0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(37,117,252,0.3); }
        }
        .site-header { position: fixed; top: 0; width: 100%; display:flex; justify-content:center; z-index:2; }
        .title-box { margin-top:14px; padding:0.6rem 1.6rem; border-radius:20px; background:linear-gradient(90deg,#e8f0ff,#fff5e6); color:#333; font-weight:800; animation: glowPulse 2.5s ease-in-out infinite; }
        @keyframes glowBorder {
          0% { box-shadow: 0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(37,117,252,0.3); border:2px solid rgba(255,255,255,0.5);} 
          50% { box-shadow: 0 0 25px rgba(255,255,255,0.9), 0 0 50px rgba(37,117,252,0.7); border:2px solid rgba(255,255,255,0.9);} 
          100% { box-shadow: 0 0 10px rgba(255,255,255,0.4), 0 0 20px rgba(37,117,252,0.3); border:2px solid rgba(255,255,255,0.5);} 
        }
        .success-glow { animation: glowBorder 2s ease-in-out infinite; }
        .subheader {
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #1a1a1a;
          animation: slowFlash 3.5s ease-in-out infinite;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
          z-index: 2;
        }
        input {
          padding: 0.8rem 1rem;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.15);
          outline: none;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.95);
          color: #000;
          font-weight: 500;
          box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
          transition: all 0.25s ease;
        }
        input::placeholder {
          color: rgba(0,0,0,0.45);
          font-weight: 500;
        }
        input:focus {
          background: #ffffff;
          border: 1px solid #2575fc;
          box-shadow: 0 0 12px rgba(37,117,252,0.45);
        }
        .password-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .toggle-password {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          font-size: 1rem;
          user-select: none;
          transition: color 0.3s ease;
        }
        .toggle-password:hover {
          color: #fff;
        }
        button.submit-btn {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: none;
          background: #ffffffbb;
          color: #2575fc;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255,255,255,0.4);
          transition: background 0.3s ease, color 0.3s ease;
        }
        button.submit-btn:disabled {
          background: rgba(255, 255, 255, 0.5);
          color: rgba(37, 117, 252, 0.7);
          cursor: not-allowed;
          box-shadow: none;
        }
        button.submit-btn:not(:disabled):hover {
          background: #fff;
          color: #1a52d1;
          box-shadow: 0 6px 20px rgba(37, 117, 252, 0.6);
        }
        .toggle-auth {
          margin-top: 1rem;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 800;
          color: #ffffff;
          background: rgba(0,0,0,0.25);
          padding: 8px 14px;
          border-radius: 12px;
          backdrop-filter: blur(6px);
        }
        .toggle-auth button {
          background: rgba(255,255,255,0.9);
          border: none;
          color: #1a52d1;
          cursor: pointer;
          font-weight: 800;
          padding: 3px 10px;
          margin-left: 6px;
          border-radius: 8px;
          text-decoration: none;
          box-shadow: 0 0 10px rgba(255,255,255,0.6);
          transition: all 0.25s ease;
        }
        .toggle-auth button:hover {
          background:#fff;
          color:#0b3fd9;
          box-shadow:0 0 18px rgba(255,255,255,1);
        }
        .message {
          margin-top: 1rem;
          text-align: center;
          color: #ff6b6b;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          min-height: 1.5rem;
        }
        footer.footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          padding: 1rem 0;
          text-align: center;
          font-size: 0.85rem;
          color: #444;
          user-select: none;
          text-shadow: 0 1px 3px rgba(0,0,0,0.2);
          z-index: 1;
          background:#f7f2e7;
        }
      `}</style>
      <div className="animated-bg" aria-hidden="true"></div>
      <div className="floating-shape small" style={{ top: "10%", left: "5%", animationDelay: "0s" }} aria-hidden="true"></div>
      <div className="floating-shape medium" style={{ top: "30%", right: "10%", animationDelay: "2s" }} aria-hidden="true"></div>
      <div className="floating-shape large" style={{ bottom: "15%", left: "20%", animationDelay: "4s" }} aria-hidden="true"></div>
      <div className="floating-shape medium" style={{ bottom: "10%", right: "25%", animationDelay: "6s" }} aria-hidden="true"></div>

      <div className="site-header">
        <div className="title-box">Internship Tracker</div>
      </div>

      <main className="container" role="main" aria-label="Authentication Section">
        <div className="glass-card" aria-live="polite" aria-atomic="true">
          <p className="subheader">{isLogin ? "Welcome back! Please login to your account." : "Create your account and start tracking."}</p>

          <form onSubmit={submit} noValidate>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                aria-label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email"
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
              />
              <button
                type="button"
                className="toggle-password"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={0}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {otpMode && (
              <>
                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
                <div style={{textAlign:'center',marginTop:'6px',fontSize:'0.9rem'}}>
                  <button type="button" onClick={resendOtp} disabled={!canResend} style={{marginRight:'8px',padding:'4px 10px',borderRadius:'8px',border:'none',background: canResend ? '#ffffffcc' : '#ffffff55',cursor: canResend?'pointer':'not-allowed'}}>
                    Resend OTP
                  </button>
                  {!canResend && <span style={{color:'#fff'}}>in {resendTimer}s</span>}
                </div>
              </>
            )}
            <button type="submit" className="submit-btn" disabled={loading} aria-busy={loading}>
              {loading ? (isLogin ? "Logging in..." : "Creating...") : isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          <p className="toggle-auth">
            <span className="flash-text">{isLogin ? "New user?" : "Already have an account?"}</span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setName("");
                setEmail("");
                setPassword("");
                setShowPassword(false);
              }}
              aria-label={isLogin ? "Switch to Sign Up" : "Switch to Login"}
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>

          <p className="message" role="alert" aria-live="assertive" aria-atomic="true">
            {message}
          </p>
        </div>
      </main>

      {successPopup && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div
            className="success-glow"
            style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '2rem 3rem',
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              color: '#fff',
              fontWeight: 600,
              textAlign: 'center',
              minWidth: '260px'
            }}
          >
            Authentication Successful 🎉
          </div>
        </div>
      )}

      {otpPopup && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.25)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999}}>
          <div
            className="success-glow"
            style={{
              background: 'rgba(255,255,255,0.25)',
              padding: '2rem 3rem',
              borderRadius: '20px',
              backdropFilter: 'blur(15px)',
              color: '#fff',
              fontWeight: 700,
              textAlign: 'center',
              minWidth: '260px'
            }}
          >
            OTP Sent ✉️
          </div>
        </div>
      )}

      <footer className="footer" aria-label="Contact Information">
        <p>Address: Kolkata, India</p>
        <p>Phone: +91 9876543210</p>
        <p>Social: LinkedIn | GitHub | Instagram</p>
      </footer>
    </>
  );
}
