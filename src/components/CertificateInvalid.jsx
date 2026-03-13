import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CertificateInvalid = ({ referenceId, onRetry }) => {
    const [timestamp, setTimestamp] = useState('');

    useEffect(() => {
        // Generate ISO timestamp on mount to keep it fixed for this error view
        setTimestamp(new Date().toISOString());
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <div className="bg-[#121212] w-full border-t-4 border-red-500 rounded-b-sm shadow-2xl pb-8 relative overflow-hidden">

                {/* Subtle top gradient glow */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none"></div>

                <div className="px-10 pt-12 pb-6 flex flex-col items-center relative z-10">

                    {/* Icon Area */}
                    <div className="w-16 h-16 bg-[#0a0a0a] border border-[#22221e] relative flex items-center justify-center mb-8">
                        <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                        {/* Tiny red dot indicator */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-[#121212]"></div>
                    </div>

                    {/* Headers */}
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-3 text-center">
                        STATUS: INVALID
                    </h2>

                    <div className="text-center mb-10">
                        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-2">
                            ERROR_404: CERTIFICATE_NOT_FOUND
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono tracking-wide max-w-xs mx-auto leading-relaxed">
                            The provided reference ID does not exist in the decentralized registry.
                        </p>
                    </div>

                    {/* Data Box */}
                    <div className="w-full border border-dashed border-[#ffffff15] rounded-sm p-6 mb-10 bg-[#0a0a0a]">

                        {/* Reference ID */}
                        <div className="mb-6">
                            <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                REFERENCE_ID
                            </p>
                            <p className="text-sm font-mono text-red-500 tracking-widest font-bold">
                                {referenceId || "UNKNOWN_ID"}
                            </p>
                        </div>

                        {/* Timestamp */}
                        <div className="mb-6">
                            <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                TIMESTAMP
                            </p>
                            <p className="text-xs font-mono text-gray-300 tracking-widest">
                                {timestamp}
                            </p>
                        </div>

                        {/* Separator */}
                        <div className="w-full h-px border-t border-dashed border-[#ffffff15] my-5"></div>

                        {/* Alert Message */}
                        <div className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-3 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="text-[10px] text-gray-500 font-mono tracking-wide leading-relaxed">
                                SYSTEM_MSG: If you believe this is an error, contact the issuing authority manually.
                            </p>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={onRetry}
                        className="w-full bg-white hover:bg-gray-200 text-black font-extrabold text-[11px] tracking-widest uppercase py-4 transition-colors"
                    >
                        RETRY_VERIFICATION
                    </button>

                </div>

            </div>

            {/* Card Footer */}
            <div className="w-full flex justify-between items-center mt-6 px-2 text-[9px] font-mono tracking-widest uppercase">
                <span className="text-gray-600 font-bold">TERMINAL_ID: #001</span>
                <span className="text-red-600 font-bold">STATUS: FAIL</span>
            </div>

        </div>
    );
};

export default CertificateInvalid;
