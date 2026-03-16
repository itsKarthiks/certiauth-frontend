import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Shield, FileText, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(false); // Toggle between Register (false) and Login (true)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
                                registration_number: regNumber 
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
                {/* Yellow Corner Accents (Targeting Brackets) */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500"></div>

                {/* Window Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-black/40">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-600 font-black tracking-widest uppercase">
                            &gt; STUDENT_PORTAL // {isLogin ? 'LOGIN_MODE' : 'REGISTER_MODE'}
                        </span>
                    </div>
                </div>

                <div className="p-10 pt-12">
                    {/* Branding / Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                            <Shield className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-widest uppercase mb-2 text-center">
                            [ <span className="text-yellow-400">STUDENT</span> {isLogin ? 'LOGIN' : 'PORTAL'} ]
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
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-yellow-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={regNumber}
                                        onChange={(e) => setRegNumber(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-800"
                                        placeholder="e.g., 41X23404XXXX"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Student Mail Field */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">Student Mail</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-yellow-600 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-800"
                                    placeholder="ENTER_STUDENT_EMAIL"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[9px] text-zinc-500 font-black tracking-widest uppercase ml-1">PASSWORD</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-yellow-600 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 text-white pl-12 pr-4 py-4 text-xs font-mono focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-800 tracking-[0.3em]"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest py-5 px-6 flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'EXECUTING_HANDSHAKE...' : (isLogin ? 'INITIATE_SESSION' : 'Register')}
                            <ArrowRight className="w-4 h-4" strokeWidth={3} />
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-12 pt-8 border-t border-zinc-900 border-dashed flex flex-col items-center gap-3">
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrorMsg('');
                            }}
                            className="text-[9px] text-zinc-600 hover:text-zinc-200 transition-colors font-black tracking-widest uppercase"
                        >
                            {isLogin ? "Don't have an account? Create one" : "Already have an account? Login"}
                        </button>
                        <Link to="/admin-login" className="text-[9px] text-zinc-600 hover:text-red-500 transition-colors font-black tracking-widest uppercase pt-2">
                            <span className="text-zinc-500 font-bold block bg-zinc-900/50 px-4 py-2 border border-zinc-800/50 hover:border-red-900/50 transition-all">ADMIN LOGIN</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Meta Bar Decor */}
            <div className="absolute bottom-10 w-full px-12 opacity-20 pointer-events-none hidden lg:flex justify-between text-[8px] font-black uppercase tracking-[0.5em] text-zinc-500">
                <span>ID: UCEK-AUTH-884</span>
                <span>LOC: 8.5492° N, 76.8824° E</span>
                <span>UNIVERSITY COLLEGE OF ENGINEERING</span>
                <span>ENCRYPTION: AES-256-GCM</span>
            </div>
        </div>
    );
};

export default Login;
