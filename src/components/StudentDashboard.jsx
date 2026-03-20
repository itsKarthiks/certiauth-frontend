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
                    <span className="text-zinc-600 text-[10px] font-black tracking-widest uppercase">INITIALIZINGL...</span>
                </div>
            </div>
        );
    }
    const hasCert = certificates.length > 0;
    const finalizedCert = certificates.find(c => c.status === 'finalized');

    if (finalizedCert) {
        const dateString = finalizedCert.created_at || finalizedCert.issued_at || new Date().toISOString();
        const formattedDate = new Date(dateString).toLocaleDateString('en-GB');
        const qrUrl = `${window.location.origin}/verify?id=${finalizedCert.registration_number}`;
        const iframeSrc = `/certvify-template.html?name=${encodeURIComponent(finalizedCert.student_name || '')}&regno=${encodeURIComponent(finalizedCert.registration_number || '')}&cgpa=${encodeURIComponent(finalizedCert.cgpa || '')}&date=${encodeURIComponent(formattedDate)}&qr=${encodeURIComponent(qrUrl)}`;

        return (
            <div className="min-h-screen bg-[#0a0a09] text-zinc-400 font-mono flex flex-col items-center">

                {/* --- FULL WIDTH HEADER --- */}
                <header className="w-full border-b border-[#222] bg-[#0a0a0a] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
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
                            <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">S_ID: {profile?.registration_number}</span>
                        </div>
                        <div
                            onClick={handleLogout}
                            className="p-3 bg-[#0f0f0e] border border-[#222] hover:border-red-500/50 transition-all cursor-pointer group flex items-center gap-3"
                        >
                            <span className="text-[10px] font-black text-zinc-600 group-hover:text-red-500 transition-colors uppercase tracking-widest hidden sm:block">Logout</span>
                            <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" />
                        </div>
                    </div>
                </header>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="w-full flex-grow flex flex-col items-center pt-10 pb-16 px-4 max-w-6xl">

                    {/* Status Badge */}
                    <div className="text-[#00ff66] text-xs font-bold tracking-[0.3em] uppercase mb-6 flex items-center gap-3 bg-[#00ff66]/5 px-6 py-2 border border-[#00ff66]/20 rounded-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]"></span>
                        </span>
                        [•] STATUS: VERIFIED & FINALIZED
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-white tracking-[0.2em] uppercase mb-3">Student Dashboard</h2>
                    </div>

                    {/* Certificate Card */}
                    <div className="w-full max-w-5xl bg-[#141414] border border-[#222] p-8 rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        <div className="bg-white p-1 rounded-sm mb-10 shadow-inner">
                            <iframe
                                src={iframeSrc}
                                className="w-full aspect-[1280/816] border-none overflow-hidden rounded-sm"
                                title="Official Certificate"
                            />
                        </div>

                        {/* Download Button */}
                        <div className="flex flex-col gap-6">
                            <button
                                onClick={() => {
                                    const iframe = document.querySelector('iframe');
                                    if (iframe) {
                                        iframe.contentWindow.focus();
                                        iframe.contentWindow.print();
                                    }
                                }}
                                className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-black py-5 text-sm tracking-[0.2em] transition-all transform active:scale-[0.99] rounded-sm flex items-center justify-center gap-4"
                            >
                                [ DOWNLOAD OFFICIAL CERTIFICATE (PDF) ]
                            </button>

                            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-700 font-bold tracking-[0.2em] uppercase border-t border-[#222] pt-6 gap-4">
                                <span>DOC_REF: {finalizedCert.registration_number}</span>
                                <div className="flex gap-4">
                                    <span>FORMAT: PDF</span>
                                    <span className="hidden sm:inline opacity-30">//</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support Links */}
                    <div className="mt-12 flex gap-10 text-[9px] text-zinc-700 font-black tracking-widest uppercase">
                    </div>
                </main>
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
                            <div className={`absolute top-0 right-0 w-16 h-16 ${certificates[0]?.status === 'finalized' ? 'bg-green-500/5' : hasCert ? 'bg-yellow-500/5' : 'bg-zinc-800/10'} [clip-path:polygon(100%_0,0_0,100%_100%)]`}></div>

                            <div className="px-8 py-6 border-b border-zinc-800/50 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-3">
                                    <Terminal className={`w-4 h-4 ${certificates[0]?.status === 'finalized' ? 'text-green-500' : hasCert ? 'text-yellow-500' : 'text-zinc-600'}`} />
                                    <h2 className="text-white font-black tracking-[0.2em] uppercase text-xs">CERT_STATUS_MONITOR</h2>
                                </div>
                                <div className={`px-3 py-1 border ${
                                    certificates[0]?.status === 'finalized'
                                        ? 'border-green-500/30 bg-green-500/5'
                                        : hasCert
                                            ? 'border-yellow-500/30 bg-yellow-500/5'
                                            : 'border-zinc-800 bg-zinc-900/30'
                                }`}>
                                    <span className={`text-[9px] font-black tracking-[0.2em] ${
                                        certificates[0]?.status === 'finalized'
                                            ? 'text-green-500'
                                            : hasCert
                                                ? 'text-yellow-500'
                                                : 'text-zinc-500'
                                    }`}>
                                        {certificates[0]?.status === 'finalized' ? 'DOCUMENT_READY' : hasCert ? 'ACTION_REQUIRED' : 'SYSTEM_STANDBY'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 flex flex-col flex-1">
                                <div className="space-y-0">
                                    {/* Step 1 */}
                                    <div className="flex gap-8 pb-12 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-800"></div>
                                        <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                                            hasCert
                                                ? 'bg-zinc-900 border border-green-500/50'
                                                : 'bg-black border-2 border-yellow-500/60'
                                        }`}>
                                            {hasCert
                                                ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                : <Clock className="w-4 h-4 text-[#facc15] animate-pulse" strokeWidth={2} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className={`text-xs uppercase tracking-wider font-bold ${
                                                hasCert ? 'text-zinc-200' : 'text-yellow-500/80'
                                            }`}>
                                                {hasCert ? '01 // DATA_SYNC_COMPLETE' : '01 // AWAITING_ADMIN_SYNC'}
                                            </h3>
                                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-medium">
                                                {hasCert
                                                    ? 'Academic records verified and synchronized with Registrar database.'
                                                    : 'Waiting for Registrar to upload academic records.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className={`flex gap-8 pb-12 relative ${!hasCert ? 'opacity-30' : ''}`}>
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800"></div>
                                        <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                                            hasCert
                                                ? 'bg-zinc-900 border border-green-500/50'
                                                : 'bg-zinc-900 border border-zinc-700'
                                        }`}>
                                            {hasCert
                                                ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                : <Check className="w-4 h-4 text-zinc-700" strokeWidth={3} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className={`text-xs uppercase tracking-wider font-bold ${
                                                hasCert ? 'text-zinc-200' : 'text-zinc-600'
                                            }`}>02 // DRAFT_GENERATED</h3>
                                            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-medium">Secure digital preview rendered via Certvify Engine.</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className={`flex gap-8 pb-12 relative ${!hasCert ? 'opacity-30' : ''}`}>
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800"></div>
                                        <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                                            !hasCert
                                                ? 'bg-zinc-900 border border-zinc-700'
                                                : certificates[0]?.status === 'finalized'
                                                    ? 'bg-zinc-900 border border-green-500/50'
                                                    : 'bg-black border-2 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                                        }`}>
                                            {!hasCert
                                                ? <Clock className="w-4 h-4 text-zinc-700" strokeWidth={2} />
                                                : certificates[0]?.status === 'finalized'
                                                    ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                    : <Clock className="w-4 h-4 text-yellow-500" strokeWidth={3} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className={`text-xs uppercase tracking-widest ${
                                                !hasCert
                                                    ? 'text-zinc-600 font-bold'
                                                    : certificates[0]?.status === 'finalized'
                                                        ? 'text-zinc-200 font-bold'
                                                        : 'text-yellow-500 font-black'
                                            }`}>03 // PENDING_VERIFICATION</h3>
                                            <p className={`text-[11px] mt-2 leading-relaxed font-medium ${
                                                !hasCert
                                                    ? 'text-zinc-600'
                                                    : certificates[0]?.status === 'finalized'
                                                        ? 'text-zinc-500'
                                                        : 'text-zinc-300 font-bold bg-yellow-500/5 p-3 border-l-2 border-yellow-500'
                                            }`}>
                                                {!hasCert
                                                    ? 'Awaiting certificate draft from Registrar.'
                                                    : certificates[0]?.status === 'finalized'
                                                        ? 'Metadata review complete. Identity confirmation recorded.'
                                                        : 'User intervention required: Review academic metadata and personal identifiers.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex gap-8">
                                        <div className={`z-10 w-8 h-8 ${certificates[0]?.status === 'finalized' ? 'bg-black border-2 border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 border border-zinc-800'} flex items-center justify-center flex-shrink-0`}>
                                            <GraduationCap className={`w-4 h-4 ${certificates[0]?.status === 'finalized' ? 'text-green-500' : 'text-zinc-700'}`} />
                                        </div>
                                        <div className={`flex flex-col ${certificates[0]?.status === 'finalized' ? '' : 'opacity-40'}`}>
                                            <h3 className={`${certificates[0]?.status === 'finalized' ? 'text-green-500 font-black' : 'text-zinc-600 font-bold'} text-xs uppercase tracking-wider`}>04 // FINAL_BLOCKCHAIN_MINT</h3>
                                            <p className={`text-[11px] mt-2 leading-relaxed font-medium ${certificates[0]?.status === 'finalized' ? 'text-zinc-200 font-bold bg-green-500/5 p-3 border-l-2 border-green-500' : 'text-zinc-700'}`}>
                                                {certificates[0]?.status === 'finalized'
                                                    ? 'Cryptographic signing complete. Document registered on secure ledger.'
                                                    : 'Awaiting final confirmation for cryptographic entry.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    if (certificates[0]) {
                                        if (certificates[0].status === 'finalized') {
                                            navigate(`/download?id=${certificates[0].registration_number}`);
                                        } else {
                                            navigate(`/preview?id=${certificates[0].registration_number}`);
                                        }
                                    }
                                }}
                                disabled={certificates.length === 0}
                                className={`w-full ${certificates[0]?.status === 'finalized' ? 'bg-green-600 hover:bg-green-500' : 'bg-[#facc15] hover:bg-yellow-400'} text-black font-black text-xs tracking-[0.3em] uppercase py-6 flex items-center justify-center gap-3 transition-all active:scale-[0.99] ${certificates.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                            >
                                [ {certificates.length === 0 ? 'NO_CERTIFICATES_FOUND' : (certificates[0]?.status === 'finalized' ? 'DOWNLOAD_OFFICIAL_PDF' : 'VERIFY_&_CONFIRM_DETAILS')} ]
                                <ArrowRight className="w-4 h-4" strokeWidth={3} />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Student Dossier */}
                    <div className="flex flex-col">
                        <div className="flex flex-col border border-zinc-800 bg-[#0d0d0d] p-8 h-full min-h-[500px]">
                            <div className="text-xs tracking-widest text-white mb-10 font-black uppercase flex items-center">
                                <span className="w-2 h-2 bg-[#facc15] mr-3"></span> STUDENT_DOSSIER
                            </div>

                            <div className="flex-grow space-y-6">
                                <div className="border-b border-zinc-800 pb-4">
                                    <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-1">LEGAL_NAME</p>
                                    <p className="text-sm text-zinc-300 font-bold tracking-widest uppercase">
                                        {user?.user_metadata?.full_name || profile?.full_name || user?.email?.split('@')[0] || '—'}
                                    </p>
                                </div>
                                <div className="border-b border-zinc-800 pb-4">
                                    <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-1">UNIVERSITY_REG_NO</p>
                                    <p className="text-sm text-zinc-300 font-mono tracking-widest uppercase">
                                        {profile?.registration_number || '—'}
                                    </p>
                                </div>
                                <div className="border-b border-zinc-800 pb-4">
                                    <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-1">ACADEMIC_PROGRAM</p>
                                    <p className="text-sm text-zinc-300 font-bold tracking-widest uppercase">
                                        B.TECH COMPUTER SCIENCE
                                    </p>
                                </div>

                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">IDENTITY: VERIFIED</span>
                                <span className="w-2 h-2 rounded-full bg-[#00ff66] shadow-[0_0_8px_#00ff66]"></span>
                            </div>
                        </div>
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
