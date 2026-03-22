import React from 'react';
import { AlertTriangle } from 'lucide-react';

const CertificateRevoked = ({ certData, onBack }) => {
    // Fallback data if none provided
    const certId = certData?.registration_number || 'UNKNOWN-ID';
    const subject = certData?.student_name || 'Unknown Student';
    const revokedOn = certData?.updated_at ? new Date(certData.updated_at).toLocaleDateString() : new Date().toLocaleDateString();
    const reason = certData?.revocation_reason || certData?.reason || 'Unknown Reason';

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
            <div className="bg-[#0a0a0a] w-full border-t-4 border-[#facc15] rounded-b-sm shadow-2xl pb-8 relative overflow-hidden">

                {/* Subtle top gradient glow */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-yellow-900/10 to-transparent pointer-events-none"></div>

                <div className="px-10 pt-12 pb-6 flex flex-col items-center relative z-10">

                    {/* Icon Area */}
                    <div className="w-16 h-16 bg-black border border-[#22221e] relative flex items-center justify-center mb-8">
                        <AlertTriangle className="w-8 h-8 text-[#facc15]" strokeWidth={2.5} />
                        {/* Tiny yellow dot indicator */}
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border border-[#121212]"></div>
                    </div>

                    {/* Headers */}
                    <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-3 text-center">
                        STATUS: REVOKED
                    </h2>

                    <div className="text-center mb-10">
                        <p className="text-sm text-red-500 font-bold font-mono tracking-widest uppercase mb-3">
                            [ WARNING: PREVIOUSLY_VALID ]
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono tracking-wide max-w-xs mx-auto leading-relaxed">
                            This certificate has been officially revoked by the university administration and is no longer valid.
                        </p>
                    </div>

                    {/* Data Box */}
                    <div className="w-full border border-dashed border-[#ffffff15] rounded-sm p-6 mb-10 bg-black">

                        {/* Top: Cert ID & Badge */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                    CERT_ID
                                </p>
                                <p className="text-sm font-mono text-[#facc15] tracking-widest font-bold">
                                    {certId}
                                </p>
                            </div>
                            <div className="bg-yellow-900/30 border border-yellow-900/50 text-[#facc15] text-[9px] font-bold tracking-widest uppercase px-2 py-1">
                                REVOKED
                            </div>
                        </div>

                        {/* Separator */}
                        <div className="w-full h-px border-t border-dashed border-[#ffffff15] mb-6"></div>

                        {/* Middle: Subject & Revoked On */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                    SUBJECT
                                </p>
                                <p className="text-xs font-mono text-white tracking-widest">
                                    {subject}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                    REVOKED_ON
                                </p>
                                <p className="text-xs font-mono text-white tracking-widest">
                                    {revokedOn}
                                </p>
                            </div>
                        </div>

                        {/* Bottom: Reason Code */}
                        <div>
                            <p className="text-[9px] text-gray-600 font-mono tracking-[0.2em] font-bold uppercase mb-1">
                                REASON_CODE
                            </p>
                            <p className="text-xs font-mono text-gray-300 tracking-widest">
                                {reason}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full">
                        <button
                            onClick={onBack}
                            className="w-full py-3 bg-[#facc15] text-black font-bold font-mono text-xs uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            [ NEW_SEARCH ]
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CertificateRevoked;
