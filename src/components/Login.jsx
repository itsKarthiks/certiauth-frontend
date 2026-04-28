import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Shield, FileText, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Register (false) and Login (true)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            if (isLogin) {
                // --- HANDLE LOGIN ---
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (authError) throw authError;

                if (data.user) {
                    // Redirect to student portal on success
                    navigate('/student-portal');
                }
            } else {
                // --- HANDLE REGISTRATION (SIGN UP) ---
                const { data, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });

                if (authError) {
                    setErrorMsg(authError.message);
                    return;
                }

                if (data?.user) {
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            { 
                                id: data.user.id, 
                                email: email, 
                                registration_number: regNumber,
                                full_name: fullName 
                            }
                        ]);

                    if (profileError) {
                        setErrorMsg("Profile creation failed: " + profileError.message);
                        return;
                    }

                    // Redirect to Student Portal on total success
                    navigate('/student-portal');
                }
            }
        } catch (err) {
            setErrorMsg(err.message || 'AUTHENTICATION_PROTOCOL_FAILURE');
            console.error('Auth Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-mono flex items-center justify-center p-6 relative overflow-hidden">
            {/* Dot Matrix Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Terminal Card Container */}
            <div className="relative w-full max-w-[480px] bg-[#0d0d0d] border border-zinc-800 shadow-2xl overflow-hidden">
                {/* Purple Corner Accents (Targeting Brackets) */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>

                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-black/40">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600 font-black tracking-widest uppercase">
                            &gt; STUDENT_PORTAL // {isLogin ? 'LOGIN_MODE' : 'REGISTER_MODE'}
                        </span>
                    </div>
                </div>

                <div className="p-6 pt-8 md:p-10 md:pt-12">
                    {/* Branding / Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(147,51,234,0.05)]">
                            <Shield className="w-6 h-6 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-2 text-center">
                            [ <span className="text-purple-500">STUDENT</span> {isLogin ? 'LOGIN' : 'PORTAL'} ]
                        </h2>
                    </div>

                    {errorMsg && (
                        <div className="mb-8 p-4 bg-red-900/10 border border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse text-center">
                            [ ERROR_LOG ]: {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        {/* Conditional Registration Number Field */}
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">University Reg_No</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={regNumber}
                                        onChange={(e) => setRegNumber(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800"
                                        placeholder="e.g., 41X23404XXXX"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Full Legal Name Field - Register Only */}
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">Full Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800"
                                        placeholder="e.g., JOHN ALEX DOE"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Student Mail Field */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">Student Mail</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800"
                                    placeholder="ENTER_STUDENT_EMAIL"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">PASSWORD</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-purple-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-white pl-12 pr-12 py-4 text-xs font-mono focus:border-purple-500/50 outline-none transition-all placeholder:text-zinc-800 tracking-[0.3em]"
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-purple-500 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-purple-600 hover:bg-purple-500 text-black font-black tracking-widest py-5 px-6 flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'EXECUTING_HANDSHAKE...' : (isLogin ? 'INITIATE_SESSION' : 'Register')}
                            <ArrowRight className="w-4 h-4" strokeWidth={3} />
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-12 pt-8 border-t border-zinc-900 border-dashed flex flex-row items-center gap-4">
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg('');
                            }}
                            className="flex-1 border border-zinc-800 bg-transparent text-zinc-500 hover:text-white hover:border-zinc-500 font-mono text-[10px] font-black tracking-[0.2em] py-3 px-4 text-center uppercase transition-colors"
                        >
                            {isLogin ? '[ CREATE_ACCOUNT ]' : '[ STUDENT_LOGIN ]'}
                        </button>
                        <Link to="/admin-login" className="flex-1 text-center bg-purple-600 hover:bg-purple-500 text-black font-mono text-[10px] font-black tracking-[0.2em] py-3 px-4 uppercase transition-colors block">
                            [ ADMIN_LOGIN ]
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Login;
