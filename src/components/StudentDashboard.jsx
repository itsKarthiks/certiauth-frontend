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
    const [requestStatus, setRequestStatus] = useState('LOADING');

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

                    // 4. Fetch the latest correction request status
                    const fetchCorrectionStatus = async (identifier) => {
                        try {
                            const { data, error } = await supabase
                                .from('correction_requests')
                                .select('status')
                                .or(`original_reg_no.eq.${identifier},student_email.eq.${identifier}`)
                                .order('created_at', { ascending: false })
                                .limit(1);

                            if (error) throw error;
                            
                            if (data && data.length > 0) {
                                setRequestStatus(data[0].status.toUpperCase());
                            } else {
                                setRequestStatus('NONE');
                            }
                        } catch (err) {
                            console.error("Error fetching request status:", err);
                            setRequestStatus('ERROR');
                        }
                    };
                    
                    await fetchCorrectionStatus(profileData.registration_number || currentUser.email);
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
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
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
                <header className="w-full border-b border-[#222] bg-[#0a0a0a] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3 md:gap-4 group cursor-default">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 flex items-center justify-center font-black text-black text-lg md:text-xl shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                            C_
                        </div>
                        <div>
                            <h1 className="text-white font-black leading-none tracking-[0.1em] md:tracking-[0.2em] text-md md:text-lg uppercase">CERTVIFY</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-zinc-200 font-bold text-[10px] md:text-xs tracking-wider uppercase">{profile?.full_name || user?.email.split('@')[0]}</span>
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
                <main className="w-full flex-grow flex flex-col items-center pt-6 md:pt-10 pb-10 md:pb-16 px-4 max-w-6xl">

                    {/* Status Badge */}
                    <div className="text-[#00ff66] text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase mb-6 flex items-center gap-2 md:gap-3 bg-[#00ff66]/5 px-4 md:px-6 py-2 border border-[#00ff66]/20 rounded-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]"></span>
                        </span>
                        [•] STATUS: VERIFIED & FINALIZED
                    </div>

                    <div className="text-center mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 text-center">Student Dashboard</h2>
                    </div>

                    {/* Certificate Card */}
                    <div className="w-full max-w-5xl bg-[#141414] border border-[#222] p-4 md:p-8 rounded-sm shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                        <div className="bg-white p-1 w-full rounded-sm mb-6 md:mb-10 shadow-inner overflow-hidden">
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
                                className="w-full bg-purple-600 hover:bg-purple-500 text-black font-black py-4 md:py-5 text-[10px] md:text-sm tracking-[0.1em] md:tracking-[0.2em] transition-all transform active:scale-[0.99] rounded-sm flex items-center justify-center gap-2 md:gap-4 text-center px-2"
                            >
                                [ DOWNLOAD OFFICIAL CERTIFICATE (PDF) ]
                            </button>

                            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-700 font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase border-t border-[#222] pt-6 gap-4 text-center">
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
            <header className="border-b border-zinc-800/50 bg-[#0a0a09] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3 md:gap-4 group cursor-default">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 flex items-center justify-center font-black text-black text-lg md:text-xl shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                        C_
                    </div>
                    <div>
                        <h1 className="text-white font-black leading-none tracking-[0.1em] md:tracking-[0.2em] text-md md:text-lg uppercase">CERTVIFY</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-[10px] md:text-xs tracking-wider uppercase">{profile?.full_name || user?.email.split('@')[0]}</span>
                        <span className="text-[9px] md:text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">{profile?.course || (profile?.registration_number ? 'REG_VERIFIED' : 'B.TECH_CSE_2026')}</span>
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
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 md:gap-8">

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                    {/* LEFT COLUMN: Certificate Status */}
                    <div className="lg:col-span-2 flex flex-col">
                        {certificates[0]?.status?.toLowerCase() === 'revoked' ? (
                            <div className="flex flex-col h-full gap-4">
                                <div className="bg-[#0a0a0a] border border-red-900/50 p-6 md:p-8 flex-grow relative overflow-hidden shadow-2xl">
                                    {/* Top Red Accent */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>

                                    <div className="flex justify-between items-center mb-16">
                                        <h2 className="text-zinc-400 font-mono text-xs tracking-widest">
                                            <span className="text-red-500">{'>_'}</span> SECURITY_ALERT
                                        </h2>
                                        <div className="border border-red-500/30 px-3 py-1 text-red-500 text-[10px] tracking-widest font-mono bg-red-500/10">
                                            STATUS: REVOKED
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center text-center mt-4 space-y-6">
                                        <span className="text-5xl text-red-500 mb-2">⚠️</span>
                                        <h3 className="text-white font-mono text-sm tracking-widest uppercase font-bold">Credential Invalidated</h3>
                                        <p className="text-zinc-500 font-mono text-xs max-w-md leading-relaxed">
                                            This academic record has been officially revoked by the university administration. It is no longer cryptographically valid and has been blacklisted on the public registry.
                                        </p>
                                    </div>
                                </div>

                                {/* Replaces the purple button to maintain layout height/structure */}
                                <div className="h-[60px] border border-red-900/30 bg-[#050000] flex items-center justify-center">
                                    <span className="text-red-900 font-mono text-[10px] tracking-widest uppercase">
                                        [ NO_ACTIONS_AVAILABLE ]
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-[#0f0f0e] border border-zinc-800/50 flex flex-col h-full relative overflow-hidden">
                                    {/* Decorative corner */}
                                    <div className={`absolute top-0 right-0 w-16 h-16 ${certificates[0]?.status === 'finalized' ? 'bg-green-500/5' : hasCert ? 'bg-purple-600/5' : 'bg-zinc-800/10'} [clip-path:polygon(100%_0,0_0,100%_100%)]`}></div>

                                    <div className="px-4 md:px-8 py-4 md:py-6 border-b border-zinc-800/50 flex flex-col md:flex-row md:items-center justify-between bg-black/20 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Terminal className={`w-4 h-4 ${certificates[0]?.status === 'finalized' ? 'text-green-500' : hasCert ? 'text-purple-500' : 'text-zinc-600'}`} />
                                            <h2 className="text-white font-black tracking-[0.1em] md:tracking-[0.2em] uppercase text-[10px] md:text-xs">CERT_STATUS_MONITOR</h2>
                                        </div>
                                        <div className={`px-3 py-1 border text-center ${certificates[0]?.status === 'finalized'
                                                ? 'border-green-500/30 bg-green-500/5'
                                                : hasCert
                                                    ? 'border-purple-500/30 bg-purple-600/5'
                                                    : 'border-zinc-800 bg-zinc-900/30'
                                            }`}>
                                            <span className={`text-[9px] font-black tracking-[0.1em] md:tracking-[0.2em] ${certificates[0]?.status === 'finalized'
                                                    ? 'text-green-500'
                                                    : hasCert
                                                        ? 'text-purple-500'
                                                        : 'text-zinc-500'
                                                }`}>
                                                {certificates[0]?.status === 'finalized' ? 'DOCUMENT_READY' : hasCert ? 'ACTION_REQUIRED' : 'SYSTEM_STANDBY'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-10 flex flex-col flex-1">
                                        <div className="space-y-0 text-[10px] md:text-xs">
                                            {/* Step 1 */}
                                            <div className="flex gap-8 pb-12 relative">
                                                <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-800"></div>
                                                <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${hasCert
                                                        ? 'bg-zinc-900 border border-green-500/50'
                                                        : 'bg-black border-2 border-purple-500/60'
                                                    }`}>
                                                    {hasCert
                                                        ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                        : <Clock className="w-4 h-4 text-purple-500 animate-pulse" strokeWidth={2} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className={`text-xs uppercase tracking-wider font-bold ${hasCert ? 'text-zinc-200' : 'text-purple-500/80'
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
                                                <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${hasCert
                                                        ? 'bg-zinc-900 border border-green-500/50'
                                                        : 'bg-zinc-900 border border-zinc-700'
                                                    }`}>
                                                    {hasCert
                                                        ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                        : <Check className="w-4 h-4 text-zinc-700" strokeWidth={3} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className={`text-xs uppercase tracking-wider font-bold ${hasCert ? 'text-zinc-200' : 'text-zinc-600'
                                                        }`}>02 // DRAFT_GENERATED</h3>
                                                    <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed font-medium">Secure digital preview rendered via Certvify Engine.</p>
                                                </div>
                                            </div>

                                            {/* Step 3 */}
                                            <div className={`flex gap-8 pb-12 relative ${!hasCert ? 'opacity-30' : ''}`}>
                                                <div className="absolute left-4 top-0 bottom-0 w-px bg-zinc-800"></div>
                                                <div className={`z-10 w-8 h-8 flex items-center justify-center flex-shrink-0 ${!hasCert
                                                        ? 'bg-zinc-900 border border-zinc-700'
                                                        : certificates[0]?.status === 'finalized'
                                                            ? 'bg-zinc-900 border border-green-500/50'
                                                            : 'bg-black border-2 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.2)]'
                                                    }`}>
                                                    {!hasCert
                                                        ? <Clock className="w-4 h-4 text-zinc-700" strokeWidth={2} />
                                                        : certificates[0]?.status === 'finalized'
                                                            ? <Check className="w-4 h-4 text-green-500" strokeWidth={3} />
                                                            : <Clock className="w-4 h-4 text-purple-500" strokeWidth={3} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h3 className={`text-xs uppercase tracking-widest ${!hasCert
                                                            ? 'text-zinc-600 font-bold'
                                                            : certificates[0]?.status === 'finalized'
                                                                ? 'text-zinc-200 font-bold'
                                                                : 'text-purple-500 font-black'
                                                        }`}>03 // PENDING_VERIFICATION</h3>
                                                    <p className={`text-[11px] mt-2 leading-relaxed font-medium ${!hasCert
                                                            ? 'text-zinc-600'
                                                            : certificates[0]?.status === 'finalized'
                                                                ? 'text-zinc-500'
                                                                : 'text-zinc-300 font-bold bg-purple-600/5 p-3 border-l-2 border-purple-500'
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
                                        className={`w-full ${certificates[0]?.status === 'finalized' ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'} text-black font-black text-[10px] md:text-xs tracking-[0.1em] md:tracking-[0.3em] uppercase py-4 md:py-6 flex items-center justify-center gap-3 transition-all active:scale-[0.99] ${certificates.length === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''} text-center px-2`}
                                    >
                                        [ {certificates.length === 0 ? 'NO_CERTIFICATES_FOUND' : (certificates[0]?.status === 'finalized' ? 'DOWNLOAD_OFFICIAL_PDF' : 'VERIFY_&_CONFIRM_DETAILS')} ]
                                        <ArrowRight className="w-4 h-4 hidden sm:block" strokeWidth={3} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Student Dossier */}
                    <div className="flex flex-col">
                        <div className="flex flex-col border border-zinc-800 bg-[#0d0d0d] p-6 md:p-8 h-full min-h-[500px]">
                            <div className="text-xs tracking-widest text-white mb-10 font-black uppercase flex items-center">
                                <span className="w-2 h-2 bg-purple-600 mr-3"></span> STUDENT_DOSSIER
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

                        {/* CORRECTION STATUS MONITOR */}
                        <div className="border border-[#1a1a18] p-4 md:p-6 mt-6 bg-[#050505]">
                            <h3 className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-zinc-500"></span>
                                CORRECTION_REQUEST_STATUS
                            </h3>
                            
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between border border-zinc-800/50 p-4 bg-black gap-2">
                                <span className="text-gray-400 font-mono text-[10px] uppercase tracking-wider">LATEST_TRANSACTION:</span>
                                
                                {requestStatus === 'LOADING' && (
                                    <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest uppercase animate-pulse">FETCHING...</span>
                                )}
                                
                                {requestStatus === 'NONE' && (
                                    <span className="text-zinc-500 font-mono text-[10px] font-bold tracking-widest uppercase border border-zinc-800 px-3 py-1 bg-zinc-900/50">
                                        [ NO_ACTIVE_REQUESTS ]
                                    </span>
                                )}
                                
                                {requestStatus === 'PENDING' && (
                                    <span className="text-purple-500 font-mono text-[10px] font-bold tracking-widest uppercase border border-purple-500/20 px-3 py-1 bg-purple-600/10">
                                        [ PENDING_ADMIN_REVIEW ]
                                    </span>
                                )}
                                
                                {requestStatus === 'RESOLVED' && (
                                    <span className="text-green-500 font-mono text-[10px] font-bold tracking-widest uppercase border border-green-500/20 px-3 py-1 bg-green-500/10">
                                        [ APPROVED_AND_SYNCED ]
                                    </span>
                                )}
                                
                                {requestStatus === 'REJECTED' && (
                                    <span className="text-red-500 font-mono text-[10px] font-bold tracking-widest uppercase border border-red-500/20 px-3 py-1 bg-red-500/10">
                                        [ REQUEST_DECLINED ]
                                    </span>
                                )}
                            </div>
                            
                            {requestStatus === 'REJECTED' && (
                                <p className="text-red-500/60 font-mono text-[9px] uppercase mt-3 leading-relaxed">
                                    * Your recent amendment request was reviewed and dismissed by the Registrar. The original document remains valid.
                                </p>
                            )}
                        </div>
                    </div>
                </div>



            </main>

            {/* --- FOOTER --- */}

        </div>
    );
};

export default StudentDashboard;
