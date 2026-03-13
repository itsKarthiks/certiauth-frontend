import React from 'react';
import { Check, Copy, Share2, Download, ShieldCheck, User, FileText, Building, Calendar } from 'lucide-react';

const CertificateSuccess = ({ data }) => {
    console.log("Success Component Data:", data);

    // Extraction logic with fallbacks for camelCase nested structures
    const studentName = data?.studentName || data?.data?.studentName || 'Name Not Found';
    const program = data?.program || data?.data?.program || 'Program Not Found';
    const issuer = "University College of Engineering";

    const issueDate = (() => {
        const rawDate = data?.issueDate || data?.data?.issueDate;
        if (!rawDate) return 'Date Not Found';
        return new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    })();

    const certificateId = data?.certificateId || data?.data?.certificateId || 'ID Not Found';

    return (
        <div className="w-full max-w-4xl mx-auto bg-[#161616] border border-gray-800 shadow-2xl flex flex-col font-mono text-gray-300">
            {/* Top Section */}
            <div className="flex flex-col items-center justify-center pt-16 pb-12 px-8 text-center">
                <div className="flex items-center justify-center w-24 h-24 rounded-full border-2 border-green-500 mb-6 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                    <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-widest mb-4">
                    CERTIFICATE VALID
                </h2>
                <p className="text-green-500 text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase block">
                    OFFICIALLY VERIFIED BY CERTVIFY
                </p>
            </div>

            {/* Data Grid Section */}
            <div className="px-8 md:px-16 py-10 border-t border-b border-gray-800 bg-[#0f0f0f]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-12">
                    {/* Recipient */}
                    <div className="flex flex-col">
                        <div className="flex items-center text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-4 font-semibold">
                            <User className="w-3.5 h-3.5 mr-3 text-gray-400" strokeWidth={2} />
                            RECIPIENT NAME
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-white tracking-wide">
                            {studentName}
                        </div>
                    </div>

                    {/* Credential */}
                    <div className="flex flex-col">
                        <div className="flex items-center text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-4 font-semibold">
                            <FileText className="w-3.5 h-3.5 mr-3 text-gray-400" strokeWidth={2} />
                            CREDENTIAL
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-white tracking-wide leading-snug">
                            {program}
                        </div>
                    </div>

                    {/* Issuer */}
                    <div className="flex flex-col">
                        <div className="flex items-center text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-4 font-semibold">
                            <Building className="w-3.5 h-3.5 mr-3 text-gray-400" strokeWidth={2} />
                            ISSUED BY
                        </div>
                        <div className="flex items-center">
                            <div className="w-10 h-10 border border-gray-700 bg-[#161616] flex items-center justify-center mr-4 text-[8px] text-gray-500 tracking-widest">
                                LOGO
                            </div>
                            <div className="text-lg md:text-xl font-bold text-white tracking-wide">
                                {issuer}
                            </div>
                        </div>
                    </div>

                    {/* Issue Date */}
                    <div className="flex flex-col">
                        <div className="flex items-center text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-4 font-semibold">
                            <Calendar className="w-3.5 h-3.5 mr-3 text-gray-400" strokeWidth={2} />
                            ISSUE DATE
                        </div>
                        <div className="text-lg md:text-xl font-bold text-white tracking-wide">
                            {issueDate}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="px-8 md:px-16 py-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
                {/* Certificate ID */}
                <div className="w-full md:w-auto flex-grow max-w-sm">
                    <div className="text-[10px] text-gray-400 tracking-[0.15em] uppercase mb-3 font-semibold">
                        CERTIFICATE ID
                    </div>
                    <div className="flex items-center bg-[#0d0d0d] border border-gray-800 rounded-sm">
                        <input
                            type="text"
                            readOnly
                            value={certificateId}
                            className="w-full bg-transparent text-gray-300 text-sm font-mono py-3 px-4 outline-none"
                        />
                        <button className="p-3 text-gray-500 hover:text-white transition-colors border-l border-gray-800 bg-[#161616] hover:bg-gray-700">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
                    <button className="flex items-center justify-center px-8 py-3.5 border border-gray-700 bg-transparent hover:bg-gray-800 text-white text-[11px] font-bold tracking-widest uppercase transition-colors">
                        <Share2 className="w-3.5 h-3.5 mr-3" />
                        SHARE
                    </button>
                    <button className="flex items-center justify-center px-8 py-3.5 bg-[#facc15] hover:bg-yellow-400 text-black text-[11px] font-extrabold tracking-widest uppercase transition-colors">
                        <Download className="w-3.5 h-3.5 mr-3" strokeWidth={2.5} />
                        DOWNLOAD PDF
                    </button>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="bg-[#080808] py-5 px-8 border-t border-gray-900 flex items-center justify-center text-[9px] md:text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">
                <ShieldCheck className="w-4 h-4 text-green-500 mr-2" strokeWidth={2.5} />
                <span className="text-gray-500">TRUSTED VERIFICATION PROVIDED BY <span className="text-white">CERTVIFY</span></span>
            </div>
        </div>
    );
};

export default CertificateSuccess;
