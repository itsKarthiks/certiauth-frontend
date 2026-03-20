import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    Download,
    Flag,
    Loader2,
    LogOut,
} from 'lucide-react';

const CertificatePreview = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();

    const [certificate, setCertificate] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [finalizing, setFinalizing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Maps = navigate wrapper (as specified in requirements)
    const Maps = (path) => navigate(path);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get logged-in user
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
                if (userError || !currentUser) {
                    navigate('/login');
                    return;
                }
                setUser(currentUser);

                if (!id) {
                    setError('No certificate ID provided in the URL.');
                    setLoading(false);
                    return;
                }

                // Fetch certificate by registration_number
                const { data: cert, error: certError } = await supabase
                    .from('certificates')
                    .select('*')
                    .eq('registration_number', id)
                    .maybeSingle();

                if (certError) throw certError;
                if (!cert) {
                    setError(`No certificate found for ID: ${id}`);
                } else {
                    setCertificate(cert);
                }
            } catch (err) {
                console.error('CertificatePreview fetch error:', err);
                setError('An unexpected error occurred. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Finalize handler
    const handleFinalize = async () => {
        setFinalizing(true);
        try {
            const { error: updateError } = await supabase
                .from('certificates')
                .update({ status: 'finalized' })
                .eq('registration_number', id);

            if (updateError) throw updateError;
            Maps(`/download?id=${id}`);
        } catch (err) {
            console.error('Finalize error:', err);
            setFinalizing(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    // ─── Loading State ───────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                    <span className="text-zinc-600 text-[10px] font-black tracking-widest uppercase">
                        [ FETCHING_DRAFT... ]
                    </span>
                </div>
            </div>
        );
    }

    // ─── Error State ─────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-mono px-4">
                <div className="max-w-md w-full border border-red-900/50 bg-[#111] p-10 text-center">
                    <div className="text-red-500 text-xs font-black tracking-widest uppercase mb-4">
                        [ ERROR_STATE ]
                    </div>
                    <p className="text-zinc-400 text-sm font-semibold leading-relaxed">{error}</p>
                    <button
                        onClick={() => navigate('/student-portal')}
                        className="mt-8 w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black tracking-widest uppercase py-4 transition-colors"
                    >
                        ← RETURN TO PORTAL
                    </button>
                </div>
            </div>
        );
    }

    const displayName = certificate?.student_name || user?.email?.split('@')[0] || 'Student';
    const displayEmail = user?.email || '';
    const docRef = `CV/${certificate?.registration_number || id}`;

    // Build the iframe URL — identical to CertificateDownload.jsx
    const dateString = certificate?.created_at || certificate?.issued_at || new Date().toISOString();
    const formattedDate = new Date(dateString).toLocaleDateString('en-GB');
    const qrUrl = `${window.location.origin}/verify?id=${certificate?.registration_number}`;
    const iframeSrc = `/certvify-template.html?name=${encodeURIComponent(certificate?.student_name || '')}&regno=${encodeURIComponent(certificate?.registration_number || '')}&cgpa=${encodeURIComponent(certificate?.cgpa || '')}&date=${encodeURIComponent(formattedDate)}&qr=${encodeURIComponent(qrUrl)}`;

    // ─── Main View ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-400 font-mono flex flex-col">

            {/* ── CONFIRMATION MODAL ────────────────────────────────────────── */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
                    <div className="w-full max-w-md bg-[#0a0a0a] border border-zinc-800 shadow-2xl flex flex-col animate-[fadeIn_0.2s_ease-out]">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-zinc-800 flex items-center gap-3 bg-[#111]">
                            <span className="w-3 h-3 bg-[#facc15] rounded-full animate-pulse shadow-[0_0_10px_#facc15]"></span>
                            <h3 className="text-white font-black tracking-widest uppercase text-sm">SYSTEM_WARNING: Finalize</h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 bg-[#0a0a0a]">
                            <p className="text-zinc-400 text-xs leading-relaxed mb-8">
                                Are you absolutely sure all details are correct? Once confirmed, this certificate data will be cryptographically locked and <span className="text-red-400 font-bold">CANNOT be altered</span>.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={finalizing}
                                    className="flex-1 py-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-500 hover:bg-zinc-900 text-[10px] font-bold tracking-[0.2em] uppercase transition-all"
                                >
                                    [ CANCEL ]
                                </button>
                                <button
                                    onClick={handleFinalize}
                                    disabled={finalizing}
                                    className="flex-1 py-4 bg-[#00ff66]/10 border border-[#00ff66]/30 text-[#00ff66] hover:bg-[#00ff66] hover:text-black hover:border-[#00ff66] text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-[0_0_15px_rgba(0,255,102,0.1)]"
                                >
                                    {finalizing ? 'PROCESSING...' : '[ YES, FINALIZE ]'}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <header className="border-b border-[#222] bg-[#0a0a0a] px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                {/* Certvify Logo */}
                <div className="flex items-center gap-3 cursor-default">
                    <div className="w-9 h-9 bg-[#facc15] flex items-center justify-center font-black text-black text-base shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        C_
                    </div>
                    <h1 className="text-white font-black leading-none tracking-[0.2em] text-base uppercase">
                        CERTVIFY
                    </h1>
                </div>

                {/* Right: User info + logout */}
                <div className="flex items-center gap-5">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-xs tracking-wider uppercase">
                            {displayName}
                        </span>
                        <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-0.5">
                            ID: {certificate?.registration_number || id}
                        </span>
                    </div>
                    <div
                        onClick={handleLogout}
                        className="w-9 h-9 bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-red-500/50 transition-colors cursor-pointer group"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-500 transition-colors" />
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 py-10 flex flex-col">

                {/* Page title */}
                <div className="mb-8">
                    <h2 className="text-white text-2xl font-black tracking-wide">
                        Certificate Verification
                    </h2>
                    <p className="text-zinc-500 text-sm mt-1">
                        Please verify your details below. Download is disabled until confirmation.
                    </p>
                </div>

                {/* ── MAIN CARD ─────────────────────────────────────────────── */}
                <div className="bg-[#111] border border-[#2a2a2a] rounded-sm overflow-hidden">

                    {/* Card top bar: status pill + doc ref */}
                    <div className="px-5 py-4 flex items-center justify-between border-b border-[#1e1e1e]">
                        {/* Status pill */}
                        <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.7)]" />
                            <span className="text-zinc-300 text-[11px] font-semibold tracking-wide">
                                Awaiting Student Confirmation
                            </span>
                        </div>
                        {/* Doc Ref */}
                        <span className="text-zinc-600 text-[11px] font-mono hidden sm:block">
                            Doc Ref: {docRef}
                        </span>
                    </div>

                    {/* ── PREVIEW AREA ─────────────────────────────────────── */}
                    <div className="p-5 md:p-8">
                        {/* Outer container — matches the aspect ratio of the certificate */}
                        <div className="relative w-full overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm">

                            {/* "PREVIEW ONLY" watermark — z-20 ensures it floats above the iframe */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                                <span
                                    className="text-[clamp(48px,10vw,96px)] font-black text-white/10 tracking-[0.2em] uppercase whitespace-nowrap"
                                    style={{ transform: 'rotate(-25deg)' }}
                                >
                                    PREVIEW ONLY
                                </span>
                            </div>

                            {/* Scaling wrapper — shrinks the full-size certificate to fit the card */}
                            <div className="relative z-10 w-full" style={{ paddingBottom: '63.75%' /* 816/1280 = 63.75% matches the iframe's native aspect */ }}>
                                <div
                                    className="absolute top-0 left-0 origin-top-left"
                                    style={{
                                        width: '142.86%',       /* 1 / 0.7 — scale inverse so content fills parent */
                                        transform: 'scale(0.7)',
                                    }}
                                >
                                    <iframe
                                        src={iframeSrc}
                                        className="w-full aspect-[1280/816] border-none block"
                                        title="Certificate Draft Preview"
                                        scrolling="no"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ACTION SECTION ────────────────────────────────────── */}
                    <div className="px-5 md:px-8 pb-8 flex flex-col items-center gap-4">
                        <div className="text-center mb-2">
                            <h3 className="text-white font-bold text-lg tracking-wide">
                                Are these details correct?
                            </h3>
                            <p className="text-zinc-500 text-sm mt-1">
                                Checking your CGPA, Name Spelling, and Graduation Year is mandatory.
                            </p>
                        </div>

                        {/* Buttons row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

                            {/* YES Button */}
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={finalizing}
                                className="relative group bg-[#0f1f12] border border-green-900/60 hover:border-green-700/80 hover:bg-[#111f14] transition-all duration-200 rounded-sm p-5 flex flex-col gap-4 text-left disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                            >
                                {/* FINALIZE label top-right */}
                                <div className="absolute top-4 right-4">
                                    <span className="text-green-500 text-[10px] font-black tracking-widest uppercase">
                                        {finalizing ? 'PROCESSING...' : 'FINALIZE'}
                                    </span>
                                </div>

                                {/* Icon */}
                                <div className="w-10 h-10 bg-green-900/30 border border-green-800/50 flex items-center justify-center rounded-sm">
                                    {finalizing
                                        ? <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                                        : <Download className="w-5 h-5 text-green-400" />
                                    }
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="text-zinc-100 font-black text-sm tracking-wider uppercase">
                                        YES, DOWNLOAD FINAL CERTIFICATE
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-1 font-medium leading-snug">
                                        Confirm details and generate the official digital copy.
                                    </p>
                                </div>
                            </button>

                            {/* NO Button */}
                            <button
                                onClick={() => Maps(`/correction?id=${id}`)}
                                className="relative group bg-[#1f130a] border border-orange-900/60 hover:border-orange-700/80 hover:bg-[#221508] transition-all duration-200 rounded-sm p-5 flex flex-col gap-4 text-left active:scale-[0.99]"
                            >
                                {/* REPORT label top-right */}
                                <div className="absolute top-4 right-4">
                                    <span className="text-orange-500 text-[10px] font-black tracking-widest uppercase">
                                        REPORT
                                    </span>
                                </div>

                                {/* Icon */}
                                <div className="w-10 h-10 bg-orange-900/30 border border-orange-800/50 flex items-center justify-center rounded-sm">
                                    <Flag className="w-5 h-5 text-orange-400" />
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="text-zinc-100 font-black text-sm tracking-wider uppercase">
                                        NO, SUBMIT CORRECTION/FLAG
                                    </p>
                                    <p className="text-zinc-500 text-xs mt-1 font-medium leading-snug">
                                        Notify the registrar office about errors in your document.
                                    </p>
                                </div>
                            </button>

                        </div>
                    </div>
                </div>
            </main>

            {/* ── FOOTER ─────────────────────────────────────────────────────── */}
            <footer className="border-t border-[#1e1e1e] bg-[#0a0a0a] py-8 px-6 flex flex-col items-center gap-4 text-center">
                <p className="text-zinc-600 text-[11px] font-medium">
                    Securely logged in as {displayName} ({displayEmail})
                </p>
                <div className="flex items-center gap-1 text-[11px] text-zinc-700">
                    <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
                    <span className="mx-2 opacity-40">|</span>
                    <a href="#" className="hover:text-zinc-400 transition-colors">Support Desk</a>
                    <span className="mx-2 opacity-40">|</span>
                    <a href="#" className="hover:text-zinc-400 transition-colors">University Main Site</a>
                </div>
            </footer>

        </div>
    );
};

export default CertificatePreview;
