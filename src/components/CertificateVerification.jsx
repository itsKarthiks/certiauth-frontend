import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    User,
    Eye,
    Download,
    Flag,
    ShieldCheck,
    AlertTriangle,
    FileText,
    CheckCircle
} from 'lucide-react';

import CertificateTemplate from './CertificateTemplate';

const CertificateVerification = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [certData, setCertData] = useState(null);
    const id = searchParams.get('id');

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('certificates')
                    .select('*')
                    .eq('registration_number', id)
                    .single();

                if (error) throw error;
                if (data) setCertData(data);
            } catch (err) {
                console.error("Preview fetch error:", err);
            }
        };

        fetchCertificate();
    }, [id]);

    if (!certData) return <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center font-mono text-zinc-500">Loading draft...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a09] text-zinc-400 font-mono flex flex-col">

            {/* --- HEADER --- */}
            <header className="border-b border-zinc-800/50 bg-[#0a0a09] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/student-portal')}>
                    <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        C_
                    </div>
                    <div>
                        <h1 className="text-white font-black leading-none tracking-[0.2em] text-lg uppercase">CERTVIFY</h1>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-1 uppercase">DRAFT_VERIFICATION_MODULE</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-xs tracking-wider">
                            {certData?.student_name}
                        </span>
                        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                            {certData?.course}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center border-yellow-500/20">
                        <User className="w-5 h-5 text-zinc-500" />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-12 flex flex-col gap-10">

                <div>
                    <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-4">
                        Certificate Verification
                    </h2>
                    <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase font-bold">
                        Please verify your details below. Download is disabled until confirmation.
                    </p>
                </div>

                <div className="bg-[#0f0f0e] border border-zinc-800/50 flex flex-col shadow-2xl relative overflow-hidden">
                    {/* Status Bar */}
                    <div className="px-8 py-5 border-b border-zinc-800/30 flex items-center justify-between bg-black/40">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                            </span>
                            <span className="text-[9px] font-black text-yellow-500 tracking-[0.3em] uppercase">
                                Awaiting Student Confirmation
                            </span>
                        </div>
                        <span className="text-[9px] text-zinc-600 font-bold tracking-widest uppercase">
                            Doc Ref: {certData?.registration_number}
                        </span>
                    </div>

                    <div className="p-10">
                        {/* Preview Box */}
                        <div className="bg-[#050505] border border-zinc-900 h-[500px] relative flex items-center justify-center overflow-hidden group">
                            <div className="w-full max-w-4xl transform scale-[0.6] sm:scale-[0.7] md:scale-[0.85] transition-transform duration-700">
                                <CertificateTemplate data={certData} />
                            </div>

                            {/* Overlay watermark for the preview window itself */}
                            <div className="absolute inset-0 border-[16px] border-[#0f0f0e] pointer-events-none z-20"></div>
                            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-black/60 border border-yellow-500/20 backdrop-blur-md">
                                <Eye className="w-3 h-3 text-yellow-500" />
                                <span className="text-[8px] font-black text-yellow-500 tracking-[0.2em] uppercase">Draft_Secure_Preview</span>
                            </div>
                        </div>

                        {/* Decision Section */}
                        <div className="mt-12 text-center">
                            <h3 className="text-white font-black text-xl tracking-[0.2em] uppercase mb-2">
                                Are these details correct?
                            </h3>
                            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">
                                Checking your CGPA, Name Spelling, and Graduation Year is mandatory.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            {/* FINALIZE BUTTON */}
                            <button
                                onClick={() => navigate(`/download?id=${certData?.registration_number}`)}
                                className="bg-[#0a150a] border border-green-900/50 p-8 flex flex-col gap-4 text-left group hover:bg-[#0c1a0c] hover:border-green-500/50 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 bg-green-500/10 flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-green-500 tracking-[0.3em]">FINALIZE</span>
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm tracking-wider uppercase group-hover:text-green-400 transition-colors">YES, DOWNLOAD FINAL CERTIFICATE</div>
                                    <div className="text-[9px] text-zinc-600 font-bold uppercase mt-2 leading-relaxed">Confirm details and generate the official digital copy.</div>
                                </div>
                            </button>

                            {/* REPORT BUTTON */}
                            <button
                                onClick={() => navigate(`/correction?id=${certData?.registration_number}`)}
                                className="bg-[#15100a] border border-orange-900/50 p-8 flex flex-col gap-4 text-left group hover:bg-[#1a140c] hover:border-orange-500/50 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="w-10 h-10 bg-orange-500/10 flex items-center justify-center">
                                        <Flag className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-orange-500 tracking-[0.3em]">REPORT</span>
                                </div>
                                <div>
                                    <div className="text-white font-black text-sm tracking-wider uppercase group-hover:text-orange-400 transition-colors">NO, SUBMIT CORRECTION/FLAG</div>
                                    <div className="text-[9px] text-zinc-600 font-bold uppercase mt-2 leading-relaxed">Notify the registrar office about errors in your document.</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-6 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-black tracking-[0.2em] uppercase bg-zinc-900/30 px-6 py-2 border border-zinc-800/50">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        Securely logged in as karthik.s@ucek.edu.in
                    </div>
                    <div className="flex items-center gap-8 text-[9px] text-zinc-500 font-black tracking-[0.3em] uppercase">
                        <a href="#" className="hover:text-yellow-500 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-yellow-500 transition-colors">Support Desk</a>
                        <a href="#" className="hover:text-yellow-500 transition-colors">University Main Site</a>
                    </div>
                </div>

            </main>

        </div>
    );
};

export default CertificateVerification;
