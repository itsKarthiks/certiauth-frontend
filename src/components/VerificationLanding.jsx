import React, { useState, useRef, useEffect } from 'react';
import { Camera, UploadCloud, TerminalSquare, ScanLine, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';
import axios from 'axios';
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

    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [manualId, setManualId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [verifiedData, setVerifiedData] = useState(null);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const docInputRef = useRef(null);

    // Handler toggling the scanner module state
    const handleToggleScanner = () => {
        setIsScanning(!isScanning);
    };

    useEffect(() => {
        let html5QrCode;

        if (isScanning) {
            html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    // Success callback
                    setManualId(decodedText);
                    setIsScanning(false);
                    if (html5QrCode) {
                        html5QrCode.stop().then(() => {
                            html5QrCode.clear();
                        }).catch(err => {
                            console.error("Failed to stop scanner", err);
                        });
                    }
                },
                (errorMessage) => {
                    // Ignore decoding errors since they happen continuously
                }
            ).catch(err => {
                console.error("Camera access failed", err);
                setIsScanning(false);
            });
        }

        // Cleanup on unmount or when scanning is toggled off
        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => {
                    console.error("Failed to stop scanner on cleanup", err);
                });
            }
        };
    }, [isScanning]);

    // Handler for manual ID submission
    const handleManualVerification = async () => {
        setIsLoading(true);
        console.log('Executing manual verification for ID:', manualId);

        try {
            const response = await axios.get(`http://localhost:5000/api/certificates/verify/${manualId}`);
            setVerifiedData({ ...response.data, status: 'Genuine' });
        } catch (err) {
            if (err.response?.status === 400) {
                setVerifiedData({ ...err.response.data, status: 'Revoked' });
            } else {
                setError(true);
                setVerifiedData(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono relative overflow-hidden flex flex-col pt-8">
            {/* Dynamic Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            <div className="max-w-7xl mx-auto w-full px-6 md:px-12 relative z-10 flex-grow flex flex-col">
                {/* HEADER AREA */}
                <header className="flex justify-between items-center pb-6 border-b border-gray-800">
                    <div className="flex items-center space-x-4">
                        {/* Logo box */}
                        <div className="bg-yellow-500 text-black font-extrabold text-2xl w-12 h-12 flex items-center justify-center">
                            C_
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-widest">CERTVIFY</h1>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center space-x-8 text-xs text-gray-400 tracking-widest">

                        <Link to="/login" className="border border-gray-700 px-4 py-2 hover:bg-gray-800 transition-colors inline-block text-center">
                            :: ADMIN LOGIN ::
                        </Link>
                    </div>
                </header>

                {/* HERO TITLE AREA */}
                <div className="py-12 flex">
                    <div className="w-1 bg-yellow-500 mr-8"></div>
                    <div className="max-w-3xl">
                        <h2 className="text-6xl md:text-7xl font-black text-white leading-none tracking-tight mb-6 uppercase">
                            Secure<br />Validation
                        </h2>
                    </div>
                </div>

                {/* MAIN SPLIT PANES */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                        <span className="ml-4 text-yellow-500 font-mono tracking-widest text-sm">PROCESSING...</span>
                    </div>
                ) : error ? (
                    <CertificateInvalid
                        referenceId={manualId}
                        onRetry={() => {
                            setError(false);
                            setManualId('');
                        }}
                    />
                ) : verifiedData?.status === 'Revoked' ? (
                    <CertificateRevoked
                        data={verifiedData}
                        onRetry={() => {
                            setVerifiedData(null);
                            setManualId('');
                        }}
                    />
                ) : verifiedData?.status === 'Genuine' ? (
                    <CertificateSuccess data={verifiedData} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gray-800 bg-[#0d0d0d]">
                        {/* LEFT PANE - SCANNER MODULE */}
                        <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col">
                            <div className="text-xs tracking-widest text-gray-500 mb-8 uppercase">
                                Method: Scan QR
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center">
                                {/* Scanner Frame */}
                                <div className="relative w-full max-w-sm aspect-square bg-black border border-gray-900 flex items-center justify-center overflow-hidden mb-6">
                                    {/* Yellow Corner Brackets */}
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-yellow-500 z-20 pointer-events-none"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-yellow-500 z-20 pointer-events-none"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-yellow-500 z-20 pointer-events-none"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500 z-20 pointer-events-none"></div>

                                    {/* Scanning Animation line */}
                                    {isScanning && (
                                        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-yellow-500/50 shadow-[0_0_10px_#eab308] z-20 pointer-events-none animate-pulse"></div>
                                    )}

                                    {/* Live Video Feed Container */}
                                    <div id="qr-reader" className="w-full h-full z-10 flex items-center justify-center">
                                        {!isScanning && (
                                            <ScanLine className="w-24 h-24 text-gray-700 pointer-events-none" strokeWidth={1} />
                                        )}
                                    </div>
                                </div>



                                {/* Initialize / Stop Scanner Action */}
                                <button
                                    onClick={handleToggleScanner}
                                    className={`w-full max-w-sm font-bold py-4 flex justify-center items-center transition-colors uppercase ${isScanning ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
                                >
                                    {isScanning ? (
                                        <><X className="mr-3 w-5 h-5" /> Stop Camera</>
                                    ) : (
                                        <><Camera className="mr-3 w-5 h-5" /> Scan QR</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT PANE - MANUAL PROTOCOL */}
                        <div className="p-8 lg:p-12 flex flex-col">
                            <div className="flex items-center text-xs tracking-widest text-white mb-8 font-bold uppercase">
                                <TerminalSquare className="w-4 h-4 mr-3 text-yellow-500" />
                                Method: Manual input
                            </div>

                            <div className="flex-grow flex flex-col">
                                {/* Drag and Drop Area */}
                                <div
                                    className="border-2 border-dashed border-gray-800 bg-[#141414] rounded-sm flex flex-col justify-center items-center p-10 mb-8 cursor-pointer hover:border-gray-600 transition-colors"
                                    onClick={() => docInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        ref={docInputRef}
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                    />
                                    <UploadCloud className="w-10 h-10 text-gray-500 mb-4" strokeWidth={1.5} />
                                    <span className="text-xs text-gray-400 tracking-widest uppercase mb-2">Drag/Upload File Here</span>
                                    <span className="text-[10px] text-gray-600 tracking-widest uppercase">Supported: .PDF / .JPG / .PNG</span>
                                </div>

                                {/* Manual Entry */}
                                <div className="relative mb-6">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500">&gt;</span>
                                    <input
                                        type="text"
                                        className="w-full bg-[#141414] border border-gray-800 text-white pl-10 pr-4 py-4 text-xs font-mono outline-none focus:border-yellow-500 transition-colors placeholder-gray-600"
                                        placeholder="Enter Unique ID"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                    />
                                </div>

                                {/* Execute Action */}
                                <button
                                    onClick={handleManualVerification}
                                    disabled={isLoading}
                                    className={`w-full bg-[#1f1f1f] border border-gray-800 text-white font-bold tracking-widest py-4 text-xs transition-colors uppercase ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                                >
                                    {isLoading ? 'PROCESSING...' : 'Verify'}
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationLanding;
