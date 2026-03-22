import React from 'react';

const CertificateInvalid = ({ onRetry }) => {
  const timestamp = new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md">

        {/* Main Error Card */}
        <div className="bg-[#0f0f0f] border-t-4 border-red-600 shadow-2xl relative">
          <div className="p-10 flex flex-col items-center text-center">

            {/* Icon */}
            <div className="mb-6 relative">
              <div className="w-12 h-12 border border-red-900/50 flex items-center justify-center bg-red-950/20">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>

            <h1 className="text-2xl font-black text-white tracking-widest mb-2">STATUS: INVALID</h1>
            <p className="text-gray-500 text-[10px] tracking-widest mb-4">ERROR_404: CERTIFICATE_NOT_FOUND</p>

            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              The provided reference ID does not exist in the decentralized registry.
            </p>

            {/* Inner Data Box */}
            <div className="w-full border border-dashed border-gray-800 bg-black p-6 text-left mb-8">
              <div className="mb-4">
                <p className="text-gray-600 text-[10px] font-bold tracking-widest mb-1">REFERENCE_ID</p>
                <p className="text-red-500 text-sm font-bold tracking-widest">UNKNOWN_ID</p>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 text-[10px] font-bold tracking-widest mb-1">TIMESTAMP</p>
                <p className="text-gray-300 text-[10px] tracking-wider">{timestamp}</p>
              </div>
              <div className="pt-4 border-t border-dashed border-gray-800 flex gap-3 items-start">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p className="text-gray-500 text-[9px] leading-relaxed">
                  SYSTEM_MSG: If you believe this is an error, contact the issuing authority manually.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-white text-black font-black py-4 text-[11px] tracking-[0.2em] hover:bg-gray-200 transition-colors uppercase"
            >
              Retry_Verification
            </button>
          </div>
        </div>

        {/* Outer Footer */}
        <div className="flex justify-between items-center mt-4 px-2">
          <span className="text-gray-500 text-[9px] font-bold tracking-widest uppercase">TERMINAL_ID: #001</span>
          <span className="text-red-500 text-[9px] font-bold tracking-widest uppercase">STATUS: FAIL</span>
        </div>

      </div>
    </div>
  );
};

export default CertificateInvalid;
