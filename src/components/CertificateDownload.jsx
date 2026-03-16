import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { supabase } from '../supabaseClient';
import {
    Download,
    CheckCircle,
    User,
    ArrowRight,
    ShieldCheck,
    FileText,
    ExternalLink,
    Database,
    LogOut,
    Check,
    Loader2
} from 'lucide-react';
import CertificateTemplate from './CertificateTemplate';

const CertificateDownload = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const registrationNumber = searchParams.get('id');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!registrationNumber) {
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('certificates')
                    .select('*')
                    .eq('student_id', registrationNumber)
                    .single();

                if (error) throw error;
                setStudentData(data);
            } catch (error) {
                console.error("Error fetching student data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [registrationNumber]);

    const generatePDF = async () => {
        if (!studentData) return;
        setDownloading(true);

        try {
            // 1. Create a new PDF document
            const pdfDoc = await PDFDocument.create();
            
            // 2. Load the template image
            const templateUrl = '/certificate_template.png';
            const templateImageBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
            const templateImage = await pdfDoc.embedPng(templateImageBytes);

            // 3. Add a page to the PDF with template dimensions (1920x1080)
            const page = pdfDoc.addPage([1920, 1080]);
            page.drawImage(templateImage, {
                x: 0,
                y: 0,
                width: 1920,
                height: 1080,
            });

            // 4. Generate QR Code
            const verifyUrl = `http://localhost:5173/verify?id=${studentData.student_id}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });
            const qrImage = await pdfDoc.embedPng(qrDataUrl);

            // 5. Draw QR Code (Bottom Right)
            page.drawImage(qrImage, {
                x: 1920 - 250, // x: 1670
                y: 100,
                width: 150,
                height: 150,
            });

            // 6. Draw Student Text
            // Font settings
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const textColor = rgb(0, 0, 0); // Black

            // Mapping (y = 1080 - target_y_from_top)
            // Name: x: 437, y: 474 (Original 1080 - 606)
            page.drawText(studentData.student_name.toUpperCase(), {
                x: 437,
                y: 474,
                size: 60,
                font: fontBold,
                color: textColor,
            });

            // Reg No: x: 488, y: 166 (Original 1080 - 914)
            page.drawText(studentData.student_id, {
                x: 488,
                y: 166,
                size: 20,
                font: fontBold,
                color: textColor,
            });

            // Course Name: x: 778, y: 166
            page.drawText(studentData.program || "Bachelor of Technology", {
                x: 778,
                y: 166,
                size: 20,
                font: fontBold,
                color: textColor,
            });

            // CGPA: x: 1062, y: 166
            page.drawText(String(studentData.cgpa), {
                x: 1062,
                y: 166,
                size: 20,
                font: fontBold,
                color: textColor,
            });

            // Date: x: 1280, y: 166
            const issueDate = new Date(studentData.issue_date || studentData.created_at).toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            });
            page.drawText(issueDate, {
                x: 1280,
                y: 166,
                size: 20,
                font: fontBold,
                color: textColor,
            });

            // 7. Serialize and download
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Certificate_${studentData.student_id}.pdf`;
            link.click();

        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center font-mono">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <span className="text-zinc-500 text-xs tracking-[0.2em] font-black uppercase">INITIALIZING_SECURE_PAYLOAD...</span>
                </div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="min-h-screen bg-[#0a0a09] flex items-center justify-center font-mono">
                <div className="bg-[#0f0f0e] border border-red-900/30 p-12 text-center max-w-lg">
                    <h2 className="text-white font-black text-2xl tracking-widest uppercase mb-4">404_NOT_FOUND</h2>
                    <p className="text-zinc-500 text-xs tracking-wider mb-8 uppercase">The requested certificate record could not be located in the central registry.</p>
                    <button onClick={() => navigate('/student-portal')} className="bg-[#facc15] text-black font-black text-[10px] tracking-widest px-8 py-4 uppercase">
                        [ RETURN_TO_PORTAL ]
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a09] text-zinc-400 font-mono flex flex-col items-center">

            {/* --- HEADER --- */}
            <header className="w-full border-b border-zinc-800/50 bg-[#0a0a09] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/student-portal')}>
                    <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        C_
                    </div>
                    <div>
                        <h1 className="text-white font-black leading-none tracking-[0.2em] text-lg uppercase">CERTVIFY</h1>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-1 uppercase">GRADUATE_SUCCESS_v1.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-xs tracking-wider uppercase">KARTHIK_S</span>
                        <div className="flex items-center gap-2 mt-1">
                            <LogOut className="w-3 h-3 text-zinc-600" />
                            <span className="text-[9px] text-zinc-600 hover:text-white transition-colors cursor-pointer uppercase font-black tracking-widest">Logout</span>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center border-yellow-500/20">
                        <User className="w-5 h-5 text-zinc-500" />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-12 flex flex-col gap-10">

                <div className="text-center">
                    <h2 className="text-4xl font-black text-white tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        Your Official Certificate is Ready
                    </h2>
                    <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase font-bold animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        The finalized version of your academic document is now available for download.
                    </p>
                </div>

                {/* Main Certificate Card */}
                <div className="bg-[#0f0f0e] border border-emerald-900/40 rounded-sm shadow-[0_0_50px_rgba(16,185,129,0.03)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-1000 delay-200">

                    {/* Status Bar */}
                    <div className="bg-emerald-950/20 border-b border-emerald-900/20 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-emerald-500 tracking-[0.4em] uppercase">
                                STATUS: VERIFIED_&_FINALIZED
                            </span>
                        </div>
                    </div>

                    <div className="p-10 flex flex-col items-center">
                        {/* Certificate Preview Surface */}
                        <div className="w-full">
                            <CertificateTemplate data={studentData} />
                        </div>

                        {/* Download CTA */}
                        <div className="w-full mt-12 flex flex-col items-center gap-6">
                            <button 
                                onClick={generatePDF}
                                disabled={downloading}
                                className="w-full max-w-2xl bg-[#10b981] hover:bg-emerald-400 text-black font-black text-xs tracking-[0.4em] uppercase py-6 flex items-center justify-center gap-4 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.15)] active:scale-[0.99] disabled:opacity-50"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={3} />
                                        [ GENERATING_SECURE_PDF... ]
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" strokeWidth={3} />
                                        [ DOWNLOAD_OFFICIAL_CERTIFICATE_PDF ]
                                    </>
                                )}
                            </button>

                            <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-black tracking-[0.3em] uppercase">
                                <span>FILE_SIZE: 2.4_MB</span>
                                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                                <span>FORMAT: SECURE_PDF_v2.0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Extra Features Grid */}
                <div className="max-w-4xl mx-auto w-full">
                    {/* Only Card: Verify Status */}
                    <div className="bg-[#0f0f0e] border border-zinc-800/50 p-8 flex flex-col items-center text-center group hover:border-emerald-500/30 transition-all cursor-default w-full">
                        <ShieldCheck className="w-6 h-6 text-emerald-500 mb-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <h5 className="text-white font-black text-[10px] tracking-widest uppercase mb-3">Verify Status</h5>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <Check className="w-3 h-3" strokeWidth={4} />
                                VERIFIED
                            </span>
                            <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-tighter mt-1">ID: {studentData.id.slice(0, 12)}_AUTH</span>
                        </div>
                    </div>
                </div>

                {/* Standard Footer Area */}
                <div className="mt-8 pt-10 border-t border-zinc-900 flex flex-col items-center gap-6">
                    <p className="text-[9px] text-zinc-700 font-black tracking-widest uppercase text-center max-w-2xl leading-relaxed">
                        © 2026 Certvify Digital Ecosystem. Under license to University College of Engineering Kariavattom (UCEK). All rights reserved. SECURE_SIGNED_NODE_4492
                    </p>
                    <div className="flex items-center gap-10 text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase">
                        <a href="#" className="hover:text-emerald-500 transition-colors">[ SECURITY_POLICY ]</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">[ SUPPORT_DESK ]</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">[ PRIVACY_V2 ]</a>
                    </div>
                </div>

            </main>

        </div>
    );
};

export default CertificateDownload;
