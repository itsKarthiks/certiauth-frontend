import React, { useState, useEffect } from 'react';
import { Camera, TerminalSquare, ScanLine, X, CheckCircle, AlertTriangle, ShieldCheck, Loader2, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
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
            <CertificateInvalid
                onRetry={() => {
                    setError(false);
                    setManualId('');
                }}
            />
        );
    }

    if (verifiedData) {
        const dateString = verifiedData.created_at || verifiedData.issued_at || verifiedData.issueDate || new Date().toISOString();
        const formattedDate = new Date(dateString).toLocaleDateString('en-GB');
        const certId = verifiedData.registration_number || verifiedData.certificateId || manualId;

        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 font-mono">
                <div className="w-full max-w-3xl bg-[#141414] border border-[#222] rounded-md shadow-2xl flex flex-col overflow-hidden">

                    {/* Header section */}
                    <div className="flex flex-col items-center justify-center pt-12 pb-8 border-b border-[#222]">
                        <div className="w-16 h-16 rounded-full border-2 border-[#00ff66] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(0,255,102,0.15)] bg-[#0a0a0a]">
                            <svg className="w-8 h-8 text-[#00ff66]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h1 className="text-3xl font-bold tracking-widest mb-2 text-white">CERTIFICATE VALID</h1>
                        <p className="text-[#00ff66] text-xs font-bold tracking-[0.15em] uppercase">OFFICIALLY VERIFIED BY CERTVIFY BLOCKCHAIN</p>
                    </div>

                    {/* Details section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 border-b border-[#222] bg-[#141414]">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Recipient Name
                            </p>
                            <p className="text-xl font-semibold tracking-wide text-gray-200">{verifiedData.studentName || verifiedData.student_name}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Credential
                            </p>
                            <p className="text-xl font-semibold tracking-wide text-gray-200">B.Tech in {verifiedData.course || '415'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                Issued By
                            </p>
                            <p className="text-lg font-semibold tracking-wide text-gray-200">University College of Engineering</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Issue Date &amp; CGPA
                            </p>
                            <p className="text-lg font-semibold tracking-wide text-gray-200">
                                {formattedDate} | CGPA: {verifiedData.cgpa || '-'}
                            </p>
                        </div>
                    </div>

                    {/* Action Row */}
                    <div className="p-8 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                        <div className="w-full md:w-auto flex-grow max-w-md">
                            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">Certificate ID</p>
                            <div className="flex items-center bg-[#141414] border border-[#333] rounded px-4 py-3">
                                <span className="text-gray-300 text-sm tracking-wider flex-grow font-mono">{certId}</span>
                                <button onClick={() => navigator.clipboard.writeText(certId)} className="text-gray-500 hover:text-white transition-colors" title="Copy to clipboard">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = `/download?id=${certId}`}
                            className="w-full md:w-auto bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-3 px-8 text-xs tracking-[0.15em] transition-colors rounded shadow-[0_0_15px_rgba(250,204,21,0.1)] flex items-center justify-center gap-3 whitespace-nowrap"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            DOWNLOAD PDF
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="py-4 bg-[#0a0a0a] flex justify-center items-center gap-2 border-t border-[#222]">
                        <svg className="w-4 h-4 text-[#00ff66]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">TRUSTED VERIFICATION PROVIDED BY CERTVIFY</span>
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
                        <div className="bg-[#facc15] text-black font-extrabold text-2xl w-12 h-12 flex items-center justify-center">C_</div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">CERTVIFY</h1>
                    </div>
                    <Link to="/login" className="border border-gray-700 px-4 py-2 hover:bg-gray-800 transition-colors text-xs tracking-widest">:: LOGIN ::</Link>
                </header>

                <div className="flex-grow flex flex-col py-12 justify-center items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-800 bg-[#0d0d0d] shadow-2xl">

                        {/* Method 01: QR Scanner */}
                        <div className="p-12 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col items-center">
                            <div className="text-xs tracking-widest text-gray-500 mb-8 uppercase font-black w-full text-left">Method 01: QR_SCANNER</div>
                            <div className="relative w-full max-w-xs aspect-square bg-black border border-gray-900 flex items-center justify-center overflow-hidden mb-8">
                                <div id="qr-reader" className="w-full h-full z-10 flex items-center justify-center bg-black">
                                    {!isScanning && <ScanLine className="w-24 h-24 text-zinc-800" strokeWidth={1} />}
                                </div>
                                {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff66]/50 shadow-[0_0_15px_#00ff66] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>}
                            </div>
                            <button onClick={handleToggleScanner} className={`w-full max-w-xs font-bold py-4 text-xs uppercase tracking-[0.2em] transition-all ${isScanning ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40' : 'bg-[#facc15] text-black hover:bg-[#eab308]'}`}>
                                {isScanning ? '[ TERMINATE_SCANNER ]' : '[ INITIALIZE_CAMERA ]'}
                            </button>
                        </div>

                        {/* Method 02: Manual Entry */}
                        <div className="p-12 flex flex-col justify-center">
                            <div className="text-xs tracking-widest text-white mb-8 font-black uppercase flex items-center">
                                <TerminalSquare className="w-4 h-4 mr-3 text-[#facc15]" /> Method 02: MANUAL_ENTRY
                            </div>
                            <div className="relative mb-8">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#facc15] font-black">&gt;_</span>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-zinc-900 text-white pl-14 pr-6 py-5 text-[11px] font-mono outline-none focus:border-[#facc15] transition-all placeholder-zinc-800 tracking-widest uppercase"
                                    placeholder="ENTER_UNIVERSITY_REG_ID"
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerification(manualId)}
                                />
                            </div>
                            <button
                                onClick={() => handleVerification(manualId)}
                                disabled={!manualId}
                                className={`w-full bg-[#111] border border-zinc-800 text-white font-bold tracking-[0.3em] py-5 text-[11px] transition-all uppercase ${!manualId ? 'opacity-30' : 'hover:bg-zinc-800 hover:border-zinc-700 hover:text-[#00ff66]'}`}
                            >
                                [ INITIATE_VERIFICATION ]
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationLanding;
