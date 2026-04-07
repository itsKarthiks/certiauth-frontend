import React, { useState } from 'react';
import { Shield, User, Key, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthGateway = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
            localStorage.setItem('adminToken', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication Protocol Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0e0e0a] text-gray-300 font-mono relative flex items-center justify-center p-6">
            {/* Dark olive/brownish grid background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#857c50 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Terminal Main Container */}
            <div className="relative w-full max-w-lg bg-[#11110e] border border-gray-800 shadow-2xl flex flex-col z-10">
                {/* Purple Corner Brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-500"></div>



                <div className="p-10 md:p-14 flex flex-col items-center">
                    {/* Shield Icon Box */}
                    <div className="w-14 h-14 bg-[#1a1a14] border border-purple-500/30 flex items-center justify-center rounded-sm mb-8 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
                        <Shield className="w-6 h-6 text-purple-500" />
                    </div>

                    {/* Title Area */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white tracking-widest mb-3 uppercase flex items-center justify-center gap-3">
                            <span className="text-gray-500 font-normal">[</span>
                            AUTHENTICATION
                            <span className="text-gray-500 font-normal">]</span>
                        </h2>
                    </div>

                    {error && (
                        <div className="w-full bg-red-900/20 border border-red-900 text-red-500 text-xs p-3 mb-6 tracking-widest text-center uppercase">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="w-full flex flex-col">
                        <div className="mb-6">
                            <label className="block text-[10px] text-purple-500 tracking-[0.1em] uppercase mb-2 font-bold">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <User className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0a0a08] border border-gray-800 text-white pl-12 pr-4 py-4 text-xs font-mono outline-none focus:border-purple-500/50 transition-colors placeholder-gray-700"
                                    placeholder="ENTER_ADMIN_EMAIL"
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-[10px] text-purple-500 tracking-[0.1em] uppercase mb-2 font-bold">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <Key className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0a0a08] border border-gray-800 text-white pl-12 pr-12 py-4 text-xs font-mono outline-none focus:border-purple-500/50 transition-colors placeholder-gray-700 tracking-[0.2em]"
                                    placeholder="•••••••••••••"
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


                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold tracking-[0.15em] py-4 text-sm transition-colors uppercase flex justify-center items-center"
                        >
                            {isLoading ? (
                                'Loging In...'
                            ) : (
                                <>
                                    <span className="mr-3 font-normal">-&gt;</span> LOGIN
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Data */}
                <div className="border-t border-gray-800 border-dashed mx-10 mb-8 pt-8 flex flex-col items-center">
                    <div className="flex items-center text-[10px] tracking-widest text-gray-400 mb-6 font-bold uppercase">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 shadow-[0_0_8px_#22c55e]"></span>
                        SYSTEM.STATUS: <span className="text-gray-300 ml-1">ONLINE</span>
                    </div>

                    <div className="text-[10px] tracking-widest text-gray-500">
                        <Link to="/" className="text-white hover:text-purple-500 underline underline-offset-4 decoration-1 decoration-gray-600 transition-colors uppercase">
                            Public Portal
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AuthGateway;
