import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, TerminalSquare, ScanLine, X, CheckCircle, AlertTriangle, ShieldCheck, Loader2, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import CertificateSuccess from './CertificateSuccess';
import CertificateInvalid from './CertificateInvalid';
import CertificateRevoked from './CertificateRevoked';

const VerificationLanding = () => {
    // STATE MANAGEMENT EXPLANATION:
    // 1. isScanning: Boolean flag that toggles the camera feed UI.
    //    When true, the html5-qrcode scanner should mount and start reading.
    // 2. scanResult: Stores the raw string data retrieved from the QR code.
    //    This string represents the credential token to be sent to the backend.
    // 3. manualId: Stores the user input from the manual text field if they
    //    cannot scan a QR code and must type the ID.
    // 4. selectedFile: Stores the File object resulting from the drag-and-drop
    //    operation, pending upload and validation by the backend.

    const [searchParams] = useSearchParams();
    const urlId = searchParams.get('id');

    const [isScanning, setIsScanning] = useState(false);
    const [manualId, setManualId] = useState('');
    const [verifiedData, setVerifiedData] = useState(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const docInputRef = useRef(null);

    // Effect to handle URL-based verification
    useEffect(() => {
        if (urlId) {
            handleVerification(urlId);
        }
    }, [urlId]);

    const handleToggleScanner = () => {
        setIsScanning(!isScanning);
    };

    useEffect(() => {
        let html5QrCode;
        if (isScanning) {
            html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    // Extract ID from URL if it's a link, otherwise use as is
                    let finalId = decodedText;
                    try {
                        const url = new URL(decodedText);
                        finalId = url.searchParams.get('id') || decodedText;
                    } catch (e) {
                        // Not a URL, use text as ID
                    }

                    setManualId(finalId);
                    setIsScanning(false);
                    handleVerification(finalId);

                    if (html5QrCode) {
                        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
                    }
                },
                () => { }
            ).catch(err => {
                console.error("Camera access failed", err);
                setIsScanning(false);
            });
        }
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
            }
        };
    }, [isScanning]);

    const handleVerification = async (id) => {
        if (!id) return;
        setIsLoading(true);
        setError(false);
        setVerifiedData(null);
        console.log("Searching for ID:", id);

        try {
            const response = await fetch(`http://localhost:5000/api/certificates/verify/${id}`);
            const result = await response.json();

            if (!response.ok) {
                setError(true);
                return;
            }

            if (result.data) {
                setVerifiedData(result.data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("Verification error:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-mono">
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-6" strokeWidth={3} />
                <p className="text-white font-black tracking-[0.4em] uppercase text-sm">Loading Verification...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-mono">
                <div className="max-w-md w-full bg-[#0d0d0d] border border-red-900/30 p-12 text-center shadow-2xl">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-4">Invalid Certificate</h2>
                    <p className="text-zinc-500 text-xs font-bold tracking-wider uppercase leading-relaxed">
                        Record not found in University Database or verification failed.
                    </p>
                    <button
                        onClick={() => { setError(false); setVerifiedData(null); }}
                        className="mt-10 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-white font-black text-[10px] tracking-widest py-4 uppercase transition-all"
                    >
                        [ BACK_TO_SCANNER ]
                    </button>
                </div>
            </div>
        );
    }

    if (verifiedData) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-mono">
                <div className="max-w-xl w-full bg-[#0d0d0d] border border-emerald-900/40 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>

                    <div className="p-12 flex flex-col items-center text-center">
                        <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/30 mb-8">
                            <span className="text-emerald-500 font-black tracking-[0.4em] uppercase text-xs">VERIFIED</span>
                        </div>

                        <div className="space-y-6 mb-12">
                            <div>
                                <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-1">STUDENT_NAME</p>
                                <h2 className="text-3xl text-white font-black tracking-widest uppercase">{verifiedData.studentName}</h2>
                            </div>
                            <div>
                                <p className="text-zinc-600 text-[10px] font-black tracking-widest uppercase mb-1">ACADEMIC_COURSE</p>
                                <p className="text-xl text-zinc-300 font-bold tracking-widest uppercase">{verifiedData.course}</p>
                            </div>
                        </div>

                        <div className="w-full pt-8 border-t border-zinc-900">
                            <p className="text-zinc-700 text-[10px] font-black tracking-widest uppercase mb-4">DIGITAL_SIGNATURE_PROOF</p>
                            <div className="bg-black/40 border border-zinc-800 p-4 rounded-sm">
                                <p className="text-[9px] text-emerald-500/60 break-all font-mono tracking-tighter leading-tight uppercase">
                                    {verifiedData.digitalSignature}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono flex flex-col pt-8">
            <div className="max-w-7xl mx-auto w-full px-6 flex-grow flex flex-col">
                <header className="flex justify-between items-center pb-6 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                        <div className="bg-yellow-500 text-black font-extrabold text-2xl w-12 h-12 flex items-center justify-center">C_</div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">CERTVIFY</h1>
                    </div>
                    <Link to="/login" className="border border-gray-700 px-4 py-2 hover:bg-gray-800 transition-colors text-xs tracking-widest">:: LOGIN ::</Link>
                </header>

                <div className="flex-grow flex flex-col py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-800 bg-[#0d0d0d]">
                        <div className="p-12 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col items-center">
                            <div className="text-xs tracking-widest text-gray-500 mb-8 uppercase font-black w-full text-left">Method 01: QR_SCANNER</div>
                            <div className="relative w-full max-w-xs aspect-square bg-black border border-gray-900 flex items-center justify-center overflow-hidden mb-8">
                                <div id="qr-reader" className="w-full h-full z-10 flex items-center justify-center">
                                    {!isScanning && <ScanLine className="w-24 h-24 text-zinc-800" strokeWidth={1} />}
                                </div>
                                {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/50 shadow-[0_0_15px_#eab308] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>}
                            </div>
                            <button onClick={handleToggleScanner} className={`w-full max-w-xs font-black py-4 uppercase tracking-[0.2em] transition-all ${isScanning ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-[#facc15] text-black hover:bg-yellow-400'}`}>
                                {isScanning ? 'Terminate_Scanner' : 'Initialize_Camera'}
                            </button>
                        </div>

                        <div className="p-12 flex flex-col">
                            <div className="text-xs tracking-widest text-white mb-8 font-black uppercase flex items-center">
                                <TerminalSquare className="w-4 h-4 mr-3 text-yellow-500" /> Method 02: MANUAL_ENTRY
                            </div>
                            <div className="relative mb-8">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-500 font-black">&gt;_</span>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-zinc-900 text-white pl-14 pr-6 py-5 text-[11px] font-mono outline-none focus:border-yellow-500 transition-all placeholder-zinc-800 tracking-widest"
                                    placeholder="ENTER_UNIVERSITY_REG_ID"
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerification(manualId)}
                                />
                            </div>
                            <button
                                onClick={() => handleVerification(manualId)}
                                disabled={!manualId}
                                className={`w-full bg-[#161616] border border-zinc-800 text-white font-black tracking-[0.3em] py-5 text-[11px] transition-all uppercase ${!manualId ? 'opacity-30' : 'hover:bg-zinc-800 hover:border-zinc-700'}`}
                            >
                                [ Verify ]
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 border border-gray-800 bg-[#0d0d0d] p-12 flex flex-col items-center">
                        <div className="text-xs tracking-widest text-gray-500 mb-8 uppercase font-black w-full text-left">Method 03: DOCUMENT_UPLOAD</div>
                        <div
                            className="w-full border-2 border-dashed border-zinc-800 hover:border-yellow-500/50 transition-all p-12 flex flex-col items-center justify-center cursor-pointer bg-black/40 group"
                            onClick={() => docInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={docInputRef}
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        // Mock verification process for file upload
                                        setIsLoading(true);
                                        setTimeout(() => {
                                            alert("File signature analysis in progress. In a production environment, this would verify the PDF's cryptographic hash.");
                                            setIsLoading(false);
                                        }, 1500);
                                    }
                                }}
                                accept=".pdf,image/*"
                            />
                            <UploadCloud className="w-16 h-16 text-zinc-700 group-hover:text-yellow-500 mb-6 transition-colors" strokeWidth={1} />
                            <p className="text-zinc-500 text-[10px] font-black tracking-widest uppercase mb-2">Drag & Drop Secure Document</p>
                            <p className="text-zinc-700 text-[8px] font-bold uppercase">Supported: .PDF / .JPG / .PNG (SECURE_HASH_V3)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationLanding;
