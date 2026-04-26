import React, { useState, useEffect } from 'react';
import { Camera, TerminalSquare, ScanLine, X, CheckCircle, AlertTriangle, ShieldCheck, Loader2, Copy, ExternalLink, ArrowLeft } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const [fromAdmin] = useState(location.state?.fromAdmin || false);

    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const [manualId, setManualId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);
    const [certData, setCertData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);



    // Effect to handle URL-based verification
    useEffect(() => {
        if (urlId) {
            handleVerification(urlId);
        }
    }, [urlId]);

    useEffect(() => {
        const handlePopState = () => {
            if (verificationResult) {
                setVerificationResult(null);
                setCertData(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [verificationResult]);

    const handleToggleScanner = () => {
        setIsScanning(!isScanning);
    };

    useEffect(() => {
        let html5QrCode;
        if (isScanning) {
            setCameraError(false);
            try {
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
                    setCameraError(true);
                    setIsScanning(false);
                });
            } catch (err) {
                console.error("Camera initialization failed", err);
                setCameraError(true);
                setIsScanning(false);
            }
        }

        const handleResize = () => {
            if (html5QrCode && html5QrCode.isScanning) {
                setIsScanning(false);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
            }
        };
    }, [isScanning]);

    const handleVerification = async (id) => {
        if (!id) return;
        setIsLoading(true);
        setVerificationResult(null);
        setCertData(null);
        console.log("Searching for ID:", id);

        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('registration_number', id)
                .single(); // Ensure we only get one record

            if (error || !data) {
                // No record found or database error
                setVerificationResult('INVALID');
            } else {
                const currentStatus = data.status ? data.status.toLowerCase() : '';

                if (currentStatus === 'revoked') {
                    window.history.pushState({ view: 'result' }, '');
                    console.log("Certificate is REVOKED. Redirecting to Revoked screen.");
                    setCertData(data); // CAPTURE THE DATA
                    setVerificationResult('REVOKED');
                } else if (currentStatus === 'finalized' || currentStatus === 'active') {
                    window.history.pushState({ view: 'result' }, '');
                    setCertData(data);
                    setVerificationResult('SUCCESS');
                } else {
                    setVerificationResult('INVALID');
                }
            }

            try {
                // AWAIT THE INSERT AND CAPTURE THE ERROR OBJECT DIRECTLY
                let payload = { certificate_id: id };
                
                // Attemping strict schema logs containing custom log event context 
                let { error: logError } = await supabase.from('verification_logs').insert([
                    { certificate_id: id, status: data?.status === 'revoked' ? 'REVOKED_ATTEMPT' : (data ? 'SUCCESS' : 'FAILED') }
                ]);

                if (logError) {
                    // Fallback to purely saving the certificate_id if the DB schema hasn't upgraded the status column
                    console.warn("Status column may be missing, retrying bare payload.");
                    const retry = await supabase.from('verification_logs').insert([payload]);
                    logError = retry.error;
                }

                if (logError) {
                    console.error("SUPABASE LOG REJECTION:", logError);
                } else {
                    console.log("Successfully wrote to verification_logs!");
                }
            } catch (logError) {
                console.error("Failed to log verification:", logError);
            }
        } catch (err) {
            console.error("Verification error:", err);
            setVerificationResult('INVALID');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-mono">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-6" strokeWidth={3} />
                <p className="text-white font-black tracking-[0.4em] uppercase text-sm">Loading Verification...</p>
            </div>
        );
    }

    if (verificationResult === 'SUCCESS') {
        return <CertificateSuccess certData={certData} data={certData} onBack={() => { window.history.back(); }} />;
    }
    if (verificationResult === 'REVOKED') {
        // Check if we have certData before rendering
        if (!certData) {
            console.error("Critical Error: certData is null for REVOKED result.");
            return <div className="text-red-500 font-mono text-center mt-20">[ ERROR_RETRIEVING_DATA ]</div>;
        }

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <CertificateRevoked 
                    certData={certData} 
                    onBack={() => {
                        // Handle back navigation: clear results and update history state
                        setVerificationResult(null);
                        setCertData(null);
                        window.history.back(); // Pops the breadcrumb we pushed earlier
                    }} 
                />
            </div>
        );
    }
    if (verificationResult === 'INVALID') {
        return <CertificateInvalid onBack={() => { window.history.back(); }} />;
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono flex flex-col pt-4 md:pt-8">
            <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow flex flex-col">
                <header className="flex justify-between items-center pb-4 md:pb-6 border-b border-gray-800">
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="bg-purple-600 text-black font-extrabold text-xl md:text-2xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">C_</div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase">CERTVIFY</h1>
                    </div>
                    {fromAdmin ? (
                        <Link to="/dashboard" className="border border-gray-700 px-3 md:px-4 py-2 hover:bg-gray-800 transition-colors text-[10px] md:text-xs tracking-widest">:: HOME ::</Link>
                    ) : (
                        <Link to="/login" className="border border-gray-700 px-3 md:px-4 py-2 hover:bg-gray-800 transition-colors text-[10px] md:text-xs tracking-widest">:: LOGIN ::</Link>
                    )}
                </header>

                <div className="flex-grow flex flex-col py-6 md:py-12 justify-center items-center">
                    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-800 bg-[#0d0d0d] shadow-2xl">

                        {/* Method 01: QR Scanner */}
                        <div className="p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col items-center">
                            <div className="text-[10px] md:text-xs tracking-widest text-gray-500 mb-6 md:mb-8 uppercase font-black w-full text-left">Method 01: QR_SCANNER</div>
                            
                            {cameraError ? (
                                <div className="w-full max-w-md mx-auto aspect-square bg-red-900/10 border border-red-500/30 flex flex-col items-center justify-center p-6 text-center mb-6 md:mb-8">
                                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                                    <p className="text-red-400 font-mono text-[10px] md:text-xs tracking-widest uppercase mt-4">
                                        Camera access unavailable.<br />Please enter Registration Number manually.
                                    </p>
                                </div>
                            ) : (
                                <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden bg-black border border-gray-900 flex items-center justify-center mb-6 md:mb-8">
                                    <div id="qr-reader" className="w-full h-full z-10 flex items-center justify-center bg-black min-h-[250px]">
                                        {!isScanning && <ScanLine className="w-16 h-16 md:w-24 md:h-24 text-zinc-800" strokeWidth={1} />}
                                    </div>
                                    {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff66]/50 shadow-[0_0_15px_#00ff66] z-20 animate-[scan_2s_ease-in-out_infinite]"></div>}
                                </div>
                            )}

                            <button onClick={handleToggleScanner} className={`w-full max-w-xs font-bold py-3 md:py-4 text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all ${isScanning ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40' : 'bg-purple-600 text-black hover:bg-purple-500'}`}>
                                {isScanning ? '[ TERMINATE_SCANNER ]' : '[ INITIALIZE_CAMERA ]'}
                            </button>
                        </div>

                        {/* Method 02: Manual Entry */}
                        <div className="p-6 md:p-12 flex flex-col justify-center">
                            <div className="text-[10px] md:text-xs tracking-widest text-white mb-6 md:mb-8 font-black uppercase flex items-center">
                                <TerminalSquare className="w-4 h-4 mr-2 md:mr-3 text-purple-500" /> Method 02: MANUAL_ENTRY
                            </div>
                            <div className="relative mb-6 md:mb-8">
                                <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-purple-500 font-black">&gt;_</span>
                                <input
                                    type="text"
                                    className="w-full bg-black border border-zinc-900 text-white pl-10 md:pl-14 pr-4 md:pr-6 py-4 md:py-5 text-[10px] md:text-[11px] font-mono outline-none focus:border-purple-500 transition-all placeholder-zinc-800 tracking-widest uppercase"
                                    placeholder="ENTER_UNIVERSITY_REG_ID"
                                    value={manualId}
                                    onChange={(e) => setManualId(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerification(manualId)}
                                />
                            </div>
                            <button
                                onClick={() => handleVerification(manualId)}
                                disabled={!manualId}
                                className={`w-full bg-[#111] border border-zinc-800 text-white font-bold tracking-[0.1em] md:tracking-[0.3em] py-4 md:py-5 text-[10px] md:text-[11px] transition-all uppercase ${!manualId ? 'opacity-30' : 'hover:bg-zinc-800 hover:border-zinc-700 hover:text-[#00ff66]'}`}
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
