"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Spotlight Tracking State
  const leftProjectorRef = useRef<SVGSVGElement>(null);
  const rightProjectorRef = useRef<SVGSVGElement>(null);
  
  const [beamTarget, setBeamTarget] = useState({ active: false });
  const [leftBeam, setLeftBeam] = useState({ angle: -15, length: 2500 });
  const [rightBeam, setRightBeam] = useState({ angle: -15, length: 2500 });

  // Update beam targeting when an element is focused or hovered
  const updateSpotlight = (e: React.FocusEvent | React.MouseEvent | null) => {
    if (!e || !leftProjectorRef.current || !rightProjectorRef.current) {
      setBeamTarget({ active: false });
      setLeftBeam({ angle: -15, length: 2500 });
      setRightBeam({ angle: -15, length: 2500 });
      return;
    }

    const leftRect = leftProjectorRef.current.getBoundingClientRect();
    const rightRect = rightProjectorRef.current.getBoundingClientRect();
    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    const tx = targetRect.left + targetRect.width / 2;
    const ty = targetRect.top + targetRect.height / 2;

    const scale = 120 / 200; 

    // --- Left Beam Math ---
    const lpx = leftRect.left + 100 * scale; 
    const lpy = leftRect.top + 90 * scale;
    const ldx = tx - lpx;
    const ldy = ty - lpy;
    const lAngle = Math.atan2(ldy, ldx) * (180 / Math.PI);
    const lDistance = Math.sqrt(ldx * ldx + ldy * ldy) / scale; 

    // --- Right Beam Math ---
    const rpx = rightRect.left + 100 * scale; 
    const rpy = rightRect.top + 90 * scale;
    const rdx = tx - rpx;
    const rdy = ty - rpy;
    const local_rdx = -rdx; 
    const rAngle = Math.atan2(rdy, local_rdx) * (180 / Math.PI);
    const rDistance = Math.sqrt(rdx * rdx + rdy * rdy) / scale;

    setBeamTarget({ active: true });
    
    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    
    setLeftBeam({ angle: clamp(lAngle, -45, 45), length: lDistance + 200 });
    setRightBeam({ angle: clamp(rAngle, -45, 45), length: rDistance + 200 });
  };

  useEffect(() => {
    setLeftBeam({ angle: -15, length: 2500 });
    setRightBeam({ angle: -15, length: 2500 });
  }, []);

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setErrorMsg(message || "Đã có lỗi xảy ra khi đăng nhập bằng Google.");
      setIsLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw new Error(error.message === "Invalid login credentials" ? "Email hoặc mật khẩu không chính xác." : error.message);
        }
        
        // Success
        const nextPath = new URLSearchParams(window.location.search).get("next");
        router.push(nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/");
        router.refresh(); // Refresh to update session state in Navbar
      } else {
        // Handle Sign Up
        if (!fullName.trim()) throw new Error("Vui lòng nhập họ và tên.");
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // Success
        setSuccessMsg("Đăng ký thành công! Vui lòng kiểm tra hộp thư email của bạn để xác thực tài khoản.");
        setIsLogin(true); // Switch to login form
        setPassword(""); // Clear password for security
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      if (message === "Email not confirmed") {
        setErrorMsg("Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn để kích hoạt.");
      } else {
        setErrorMsg(message || "Đã có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const beamSpread = beamTarget.active ? 150 : 300;
  const beamOpacity = beamTarget.active ? 0.7 : 0.2;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans relative flex items-center justify-center p-4">
      
      {/* CUSTOM BACKGROUND - Zoomed out/centered on bottom to show chairs, grayscale applied */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-bottom opacity-60 grayscale-[80%]"
        style={{ backgroundImage: "url('/img/rapphim.jpeg')" }}
      ></div>

      {/* GLOBAL BACKGROUND / VIGNETTE (z-0) WITH HEAVY BLUR AND GRAYISH DARK TONE */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-zinc-950/70 backdrop-blur-md"></div>

      {/* BACK LINK BUTTON (z-20) */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:bg-white/20 hover:text-white hover:border-white/40 hover:scale-110 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        aria-label="Về trang chủ"
      >
        <Home className="w-5 h-5" />
      </Link>
      
      {/* AUTH CARD (z-10) */}
      <div className="w-full relative max-w-sm z-10" onMouseLeave={() => updateSpotlight(null)}>
        <div className="relative card-border-auth overflow-hidden rounded-2xl flex flex-col animate-float-auth bg-black/40 backdrop-blur-md">
          
          {/* Top Visual Banner */}
          <div className="p-6 pb-0 flex justify-center relative">
            <div className="w-full h-24 rounded-xl gradient-border-auth overflow-hidden relative flex items-center justify-center">
               <div className="w-14 h-14 rounded-full glass-auth border-2 border-amber-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                  <svg className="w-6 h-6 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
            </div>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-playfair text-white mb-2 tracking-wide">
                {isLogin ? "Đăng Nhập" : "Đăng Ký"}
              </h3>
              <p className="text-white/60 text-sm">
                {isLogin ? "Bắt đầu hành trình điện ảnh của bạn" : "Tham gia trải nghiệm cùng Lumière"}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-pulse">
                {errorMsg}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                {successMsg}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Field (Only for Sign Up) */}
              {!isLogin && (
                <div className="relative">
                  <label className="block text-sm font-medium text-white/80 mb-2">Họ và tên</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field-auth w-full px-4 py-3 rounded-full text-white placeholder-white/40 outline-none" 
                    placeholder="Nhập họ và tên"
                    required={!isLogin}
                    disabled={isLoading}
                    onFocus={updateSpotlight}
                    onMouseEnter={updateSpotlight}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-auth w-full px-4 py-3 rounded-full text-white placeholder-white/40 outline-none" 
                  placeholder="Nhập email của bạn"
                  required
                  disabled={isLoading}
                  onFocus={updateSpotlight}
                  onMouseEnter={updateSpotlight}
                />
              </div>
              
              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-white/80 mb-2">Mật khẩu</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field-auth w-full px-4 py-3 rounded-full text-white placeholder-white/40 outline-none" 
                  placeholder="Nhập mật khẩu"
                  required
                  minLength={6}
                  disabled={isLoading}
                  onFocus={updateSpotlight}
                  onMouseEnter={updateSpotlight}
                />
              </div>
              
              {/* Remember & Forgot (Only Login) */}
              {isLogin && (
                <div className="flex items-center justify-between text-sm px-1 pt-1">
                  <label className="flex items-center cursor-pointer group">
                    <input type="checkbox" className="peer sr-only" disabled={isLoading} />
                    <div className="w-4 h-4 border-2 border-white/20 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-white/60 group-hover:text-white/90">Ghi nhớ đăng nhập</span>
                  </label>
                  <button type="button" className="text-amber-400 hover:text-amber-300" disabled={isLoading}>Quên mật khẩu?</button>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full login-button-auth text-white font-medium py-3 px-4 rounded-full transition flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/25 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  onFocus={updateSpotlight}
                  onMouseEnter={updateSpotlight}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <span>{isLogin ? "Đăng Nhập" : "Đăng Ký"}</span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center space-x-4 my-4">
                <div className="h-px bg-white/10 flex-1"></div>
                <span className="text-white/40 text-xs uppercase tracking-wider">hoặc tiếp tục với</span>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              
              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  disabled={isLoading}
                  onClick={handleGoogleLogin}
                  className="glass-auth flex items-center justify-center px-4 py-2.5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50"
                  onFocus={updateSpotlight}
                  onMouseEnter={updateSpotlight}
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                  </svg>
                </button>
                <button 
                  type="button" 
                  disabled={isLoading}
                  className="glass-auth flex items-center justify-center px-4 py-2.5 border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50"
                  onFocus={updateSpotlight}
                  onMouseEnter={updateSpotlight}
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </button>
              </div>
              
              {/* Toggle State */}
              <div className="text-center mt-6 pt-2">
                <span className="text-white/60 text-sm">
                  {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMsg(null); // Clear errors when switching modes
                  }}
                  disabled={isLoading}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium disabled:opacity-50"
                >
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- VINTAGE PROJECTOR ICONS + INTEGRATED BEAMS (z-50) OVER the form --- */}
      
      {/* LEFT Projector */}
      <svg 
        ref={leftProjectorRef}
        className="absolute bottom-10 left-10 z-50 pointer-events-none hidden lg:block"
        style={{ 
          width: '120px', height: '120px', 
          overflow: 'visible', // allows the beam to shoot out of the SVG
          mixBlendMode: 'screen', // blends light with the form background perfectly
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))'
        }}
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-grad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="rgba(255, 240, 160, 0.9)" />
            <stop offset="40%" stopColor="rgba(212, 175, 55, 0.4)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Base (Static) */}
        <path d="M40 180L160 180L140 120L60 120L40 180Z" fill="#1A1A1A" stroke="#333" strokeWidth="2"/>
        
        {/* Body + Beam (Rotates together) */}
        <g style={{ 
          transform: `rotate(${leftBeam.angle}deg)`, 
          transformOrigin: '100px 90px', // Center pivot
          transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}>
          {/* Light Beam */}
          <polygon 
            points={`180,85 ${180 + leftBeam.length},${85 - beamSpread} ${180 + leftBeam.length},${95 + beamSpread} 180,95`}
            fill="url(#beam-grad)"
            style={{ transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)' }}
            opacity={beamOpacity}
            filter="blur(15px)"
          />
          {/* Hardware Body */}
          <rect x="50" y="60" width="100" height="60" rx="5" fill="#222" stroke="#444" strokeWidth="2"/>
          <circle cx="70" cy="40" r="30" fill="#111" stroke="#555" strokeWidth="4"/>
          <circle cx="70" cy="40" r="10" fill="#333"/>
          <circle cx="130" cy="40" r="30" fill="#111" stroke="#555" strokeWidth="4"/>
          <circle cx="130" cy="40" r="10" fill="#333"/>
          <path d="M150 75L180 65V115L150 105V75Z" fill="#0A0A0A" stroke="#555" strokeWidth="2"/>
          <ellipse cx="180" cy="90" rx="6" ry="20" fill="#FFEBAA" opacity="0.9" filter="blur(1px)"/>
        </g>
      </svg>

      {/* RIGHT Projector (Flipped via CSS scaleX) */}
      <svg 
        ref={rightProjectorRef}
        className="absolute bottom-10 right-10 z-50 pointer-events-none hidden lg:block"
        style={{ 
          width: '120px', height: '120px', 
          overflow: 'visible',
          mixBlendMode: 'screen',
          transform: 'scaleX(-1)', // Flips everything so the lens points left!
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))'
        }}
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Base (Static) */}
        <path d="M40 180L160 180L140 120L60 120L40 180Z" fill="#1A1A1A" stroke="#333" strokeWidth="2"/>
        
        {/* Body + Beam (Rotates together) */}
        <g style={{ 
          transform: `rotate(${rightBeam.angle}deg)`, 
          transformOrigin: '100px 90px', 
          transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)' 
        }}>
          {/* Light Beam */}
          <polygon 
            points={`180,85 ${180 + rightBeam.length},${85 - beamSpread} ${180 + rightBeam.length},${95 + beamSpread} 180,95`}
            fill="url(#beam-grad)"
            style={{ transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)' }}
            opacity={beamOpacity}
            filter="blur(15px)"
          />
          {/* Hardware Body */}
          <rect x="50" y="60" width="100" height="60" rx="5" fill="#222" stroke="#444" strokeWidth="2"/>
          <circle cx="70" cy="40" r="30" fill="#111" stroke="#555" strokeWidth="4"/>
          <circle cx="70" cy="40" r="10" fill="#333"/>
          <circle cx="130" cy="40" r="30" fill="#111" stroke="#555" strokeWidth="4"/>
          <circle cx="130" cy="40" r="10" fill="#333"/>
          <path d="M150 75L180 65V115L150 105V75Z" fill="#0A0A0A" stroke="#555" strokeWidth="2"/>
          <ellipse cx="180" cy="90" rx="6" ry="20" fill="#FFEBAA" opacity="0.9" filter="blur(1px)"/>
        </g>
      </svg>

    </main>
  );
}
