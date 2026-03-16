import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    User,
    Check,
    Clock,
    ArrowRight,
    GraduationCap,
    Terminal,
    Loader2,
    LogOut
} from 'lucide-react';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getDashboardData = async () => {
            try {
                // 1. Get logged in user
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                
                if (userError || !currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);

                // 2. Fetch user profile to get registration_number
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .maybeSingle();

                if (profileError) throw profileError;
                setProfile(profileData);

                if (profileData) {
                    // 3. Fetch certificates filtered by registration_number
                    const { data: certs, error: certError } = await supabase
                        .from('certificates')
                        .select('*')
                        .eq('registration_number', profileData.registration_number);

                    if (certError) throw certError;
                    setCertificates(certs || []);
                }

            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };

        getDashboardData();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                    <span className="text-zinc-600 text-[10px] font-black tracking-widest uppercase">INITIALIZING_PROTOCOL...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-[#0a0a09] text-zinc-400 font-mono flex flex-col">

            {/* --- HEADER --- */}
            <header className="border-b border-zinc-800/50 bg-[#0a0a09] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        C_
                    </div>
                    <div>
                        <h1 className="text-white font-black leading-none tracking-[0.2em] text-lg uppercase">CERTVIFY</h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-xs tracking-wider uppercase">{profile?.full_name || user?.email.split('@')[0]}</span>
                        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">{profile?.course || (profile?.registration_number ? 'REG_VERIFIED' : 'B.TECH_CSE_2026')}</span>
                    </div>
                    <div 
                        onClick={handleLogout}
                        className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-red-500/50 transition-colors cursor-pointer group"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Certificate Status */}
                    <div className="lg:col-span-2 flex flex-col">
                        <div className="bg-[#0f0f0e] border border-zinc-800/50 flex flex-col h-full relative overflow-hidden">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 [clip-path:polygon(100%_0,0_0,100%_100%)]"></div>

                            <div className="px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Terminal className="w-4 h-4 text-yellow-500" />
                                    <h2 className="text-white font-black tracking-[0.2em] uppercase text-xs">CERT_STATUS_MONITOR</h2>
                                </div>
                                <div className="px-3 py-1 border border-yellow-500/30 bg-yellow-500/5">
                                    <span className="text-[9px] font-black text-yellow-500 tracking-[0.2em]">ACTION_REQUIRED</span>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col flex-1">
                                <div className="space-y-0">
                                    {/* Step 1 */}
                                    <div className="flex gap-8 pb-12 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-800"></div>
                                        <div className="z-10 w-8 h-8 bg-zinc-900 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">01 // DATA_SYNC_COMPLETE</h3>
                                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-medium">Academic records verified and synchronized with Registrar database.</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-8 pb-12 relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800"></div>
                                        <div className="z-10 w-8 h-8 bg-zinc-900 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider">02 // DRAFT_GENERATED</h3>
                                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-medium">Secure digital preview rendered via Certvify Engine.</p>
                                        </div>
                                    </div>

                                    {/* Step 3 (Active) */}
                                    <div className="flex gap-8 pb-12 relative">
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800"></div>
                                        <div className="z-10 w-8 h-8 bg-black border-2 border-yellow-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                                            <Clock className="w-4 h-4 text-yellow-500" strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-yellow-500 font-black text-xs uppercase tracking-widest">03 // PENDING_VERIFICATION</h3>
                                            <p className="text-[11px] text-zinc-300 mt-2 leading-relaxed font-bold bg-yellow-500/5 p-3 border-l-2 border-yellow-500">
                                                User intervention required: Review academic metadata and personal identifiers on the active draft.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex gap-8">
                                        <div className="z-10 w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                                            <GraduationCap className="w-4 h-4 text-zinc-700" />
                                        </div>
                                        <div className="flex flex-col opacity-40">
                                            <h3 className="text-zinc-600 font-bold text-xs uppercase tracking-wider">04 // FINAL_BLOCKCHAIN_MINT</h3>
                                            <p className="text-[11px] text-zinc-700 mt-2 leading-relaxed font-medium">Cryptographic signing and permanent registration on distributed ledger.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => certificates[0] && navigate(`/verify-draft?id=${certificates[0].registration_number}`)}
                                disabled={certificates.length === 0}
                                className={`w-full bg-[#facc15] hover:bg-yellow-400 text-black font-black text-xs tracking-[0.3em] uppercase py-6 flex items-center justify-center gap-3 transition-all active:scale-[0.99] ${certificates.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            >
                                [ {certificates.length > 0 ? 'VERIFY_DRAFT_CERTIFICATE_LOCAL' : 'NO_CERTIFICATES_FOUND'} ]
                                <ArrowRight className="w-4 h-4" strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Recent Activity */}
                    <div className="flex flex-col">
                        <div className="bg-[#0f0f0e] border border-zinc-800/50 flex flex-col h-full shadow-xl">
                            <div className="px-8 py-6 border-b border-zinc-800/50 bg-black/20">
                                <h2 className="text-white font-black tracking-[0.2em] uppercase text-xs">EVENT_LOG</h2>
                            </div>

                            <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto">
                                {/* Item 1 */}
                                <div className="p-4 bg-black/40 border border-zinc-800/30 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-green-500 text-[8px] font-black tracking-widest uppercase border border-green-500/30 px-2 py-0.5">STATUS_ISSUED</span>
                                        <span className="text-[9px] text-zinc-600 font-bold tracking-tighter uppercase">2H_AGO</span>
                                    </div>
                                    <h4 className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider">Draft Certificate Generated</h4>
                                </div>

                                {/* Item 2 */}
                                <div className="p-4 bg-black/40 border border-zinc-800/30 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-blue-500 text-[8px] font-black tracking-widest uppercase border border-blue-500/30 px-2 py-0.5">GATEWAY_RECV</span>
                                        <span className="text-[9px] text-zinc-600 font-bold tracking-tighter uppercase">1D_AGO</span>
                                    </div>
                                    <h4 className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider">Bulk Data Upload Completed</h4>
                                </div>

                                {/* Item 3 */}
                                <div className="p-4 bg-black/40 border border-zinc-800/30 flex flex-col gap-2 hover:border-zinc-700 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-zinc-600 text-[8px] font-black tracking-widest uppercase border border-zinc-800/30 px-2 py-0.5">SYS_SYNC</span>
                                        <span className="text-[9px] text-zinc-600 font-bold tracking-tighter uppercase">3D_AGO</span>
                                    </div>
                                    <h4 className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider">Profile synchronization with NAD</h4>
                                </div>
                            </div>

                            <div className="p-6 border-t border-zinc-800/50">
                                <button className="w-full text-center text-[9px] font-black text-yellow-500/70 hover:text-yellow-500 tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-2">
                                    VIEW_ALL_RECORDS <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#0f0f0e] border border-zinc-800/50 p-10 flex flex-col gap-3 group hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500"></span>
                            <span className="text-[9px] text-zinc-600 font-black tracking-[0.3em] uppercase">ACADEMIC_SESSION</span>
                        </div>
                        <div className="text-2xl text-white font-black tracking-widest">2025_2026</div>
                        <div className="w-full bg-zinc-900 h-1 mt-4 relative">
                            <div className="absolute inset-0 bg-yellow-500/20 w-full"></div>
                        </div>
                    </div>

                    <div className="bg-[#0f0f0e] border border-zinc-800/50 p-10 flex flex-col gap-3 group hover:border-zinc-700 transition-colors relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-1.5 h-1.5 bg-yellow-500"></span>
                            <span className="text-[9px] text-zinc-600 font-black tracking-[0.3em] uppercase">SYSTEM_STATUS</span>
                        </div>
                        <div className="text-2xl text-white font-black tracking-widest flex items-center gap-4">
                            PENDING_SIG
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                        </div>
                        <div className="text-[9px] text-zinc-700 font-bold uppercase mt-4">AWAITING_CRYPTOGRAPHIC_CONFIRMATION</div>
                    </div>
                </div>

            </main>

            {/* --- FOOTER --- */}
            <footer className="border-t border-zinc-800/50 bg-black/40 px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="text-[10px] text-zinc-700 font-black tracking-[0.3em] uppercase">
                        © 2026 CERTVIFY_CORE_v1.0
                    </div>
                    <div className="w-px h-4 bg-zinc-800 hidden md:block"></div>
                    <div className="text-[9px] text-zinc-800 font-bold uppercase hidden md:block tracking-widest">
                        SECURE_ACCESS_PROTOCOL_ACTIVE
                    </div>
                </div>

                <div className="flex items-center gap-10 text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase">
                    <a href="#" className="hover:text-yellow-500 transition-colors">[ SECURITY ]</a>
                    <a href="#" className="hover:text-yellow-500 transition-colors">[ PRIVACY ]</a>
                    <a href="#" className="hover:text-yellow-500 transition-colors">[ SUPPORT ]</a>
                </div>
            </footer>

        </div>
    );
};

export default StudentDashboard;
