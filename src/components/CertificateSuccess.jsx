import React from 'react';
import { Check, Copy, Share2, Download, ShieldCheck, User, FileText, Building, Calendar } from 'lucide-react';
import CertificateRevoked from './CertificateRevoked';

const CertificateSuccess = ({ data }) => {
    console.log("Success Component Data:", data);

    if (data?.status?.toLowerCase() === 'revoked' || data?.data?.status?.toLowerCase() === 'revoked') {
        return <CertificateRevoked data={data} />;
    }

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

    const certData = data;
    const formattedDate = new Date(certData.created_at || certData.issued_at || new Date()).toLocaleDateString('en-GB');

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
                <p className="text-xl font-semibold tracking-wide text-gray-200">{certData.student_name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  Credential
                </p>
                <p className="text-xl font-semibold tracking-wide text-gray-200">B.Tech in {certData.course}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Issued By
                </p>
                <p className="text-lg font-semibold tracking-wide text-gray-200">University College of Engineering, Kariavattom</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Issue Date & CGPA
                </p>
                <p className="text-lg font-semibold tracking-wide text-gray-200">
                  {formattedDate} | CGPA: {certData.cgpa}
                </p>
              </div>
            </div>
        
            {/* Action Row */}
            <div className="p-8 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
              <div className="w-full md:w-auto flex-grow max-w-md">
                <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-2">Certificate ID</p>
                <div className="flex items-center bg-[#141414] border border-[#333] rounded px-4 py-3">
                  <span className="text-gray-300 text-sm tracking-wider flex-grow font-mono">{certData.registration_number}</span>
                  <button onClick={() => navigator.clipboard.writeText(certData.registration_number)} className="text-gray-500 hover:text-white transition-colors" title="Copy to clipboard">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  </button>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/download?id=${certData.registration_number}`}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-black font-bold py-3 px-8 text-xs tracking-[0.15em] transition-colors rounded shadow-[0_0_15px_rgba(147,51,234,0.1)] flex items-center justify-center gap-3 whitespace-nowrap"
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
};

export default CertificateSuccess;
