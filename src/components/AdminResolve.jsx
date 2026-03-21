import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminResolve = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestData = location.state?.requestData;
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchOriginal = async () => {
      if (requestData?.student_email) {
        const { data } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_email', requestData.student_email)
          .single();
        setOriginalData(data);
      }
    };
    fetchOriginal();
  }, [requestData]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono uppercase">
      {/* Top Header */}
      <header className="flex justify-between items-center bg-[#0a0a0a]">
        <div className="text-[#facc15] font-bold text-xl tracking-wider">
          C_ CERTVIFY
        </div>

        <nav className="flex gap-8 text-sm">
          <button className="text-[#facc15] border-b-2 border-[#facc15] pb-1">COMPARE</button>
        </nav>

        <button className="text-[#facc15] hover:text-white transition-colors">
          <Home size={20} />
        </button>
      </header>

      {/* Subheader */}
      <div className="flex justify-between items-center mt-12 text-xs text-zinc-500 tracking-widest border-b border-zinc-800 pb-4">
        <div>
        </div>
        <div>
          COMPARISON_ID: 0X8842_CERT
        </div>
      </div>

      {/* Main Comparison Area */}
      <main className="flex items-stretch gap-8 mt-8">
        {/* Left Card */}
        <div className="bg-[#050000] border border-zinc-800 relative p-8 w-1/2 flex flex-col min-h-[400px]">
          <div className="mb-8">
            <h2 className="text-[#facc15] font-bold tracking-widest text-lg">PREVIOUS_DETAILS</h2>
            <div className="text-zinc-600 text-[10px] tracking-widest mt-1">SOURCE: ORIGINAL_DATABASE_ENTRY</div>
          </div>

          <div className="space-y-6 z-10">
            <div>
              <div className="text-zinc-500 text-[10px] tracking-wider">NAME</div>
              <div className="text-white text-lg mt-1 font-semibold">{originalData?.student_name}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] tracking-wider">COURSE</div>
              <div className="text-white text-lg mt-1 font-semibold">{originalData?.course}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] tracking-wider">CGPA</div>
              <div className="text-white text-lg mt-1 font-semibold">{originalData?.cgpa}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-[10px] tracking-wider">REG_NO</div>
              <div className="text-white text-lg mt-1 font-semibold">{originalData?.reg_no}</div>
            </div>
          </div>

          <div className="absolute bottom-4 left-6 text-6xl font-bold text-zinc-900/40 pointer-events-none select-none">
            01
          </div>
          <div className="absolute bottom-6 right-6 text-zinc-700">
            <Lock size={16} />
          </div>
        </div>

        {/* Middle Separator */}
        <div className="flex items-center justify-center">
          <div className="bg-[#facc15] text-black w-10 h-10 flex items-center justify-center font-bold">
            <ArrowRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#050000] border border-zinc-800 border-r-4 border-r-[#facc15] relative p-8 w-1/2 flex flex-col min-h-[400px]">
          <div className="mb-8">
            <h2 className="text-[#facc15] font-bold tracking-widest text-lg">CORRECTED_DETAILS</h2>
            <div className="text-zinc-600 text-[10px] tracking-widest mt-1">SOURCE: VERIFIED_AMENDMENT_REQUEST</div>
          </div>

          <div className="space-y-6 z-10 flex-grow">
            {/* NAME */}
            <div>
              {originalData && String(originalData.student_name) !== String(requestData?.corrected_name) ? (
                <>
                  <div className="text-[#facc15] text-[10px] tracking-wider font-bold">NAME [MODIFIED]</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="bg-[#1a1500] border border-[#facc15]/30 text-[#facc15] px-2 py-1 text-lg font-bold">
                      {requestData?.corrected_name}
                    </div>
                    <span className="text-[#facc15] font-bold text-xl">!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-zinc-500 text-[10px] tracking-wider">NAME</div>
                  <div className="text-white text-lg mt-1 font-semibold">{requestData?.corrected_name}</div>
                </>
              )}
            </div>
            {/* COURSE */}
            <div>
              {originalData && String(originalData.course) !== String(requestData?.corrected_course) ? (
                <>
                  <div className="text-[#facc15] text-[10px] tracking-wider font-bold">COURSE [MODIFIED]</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="bg-[#1a1500] border border-[#facc15]/30 text-[#facc15] px-2 py-1 text-lg font-bold">
                      {requestData?.corrected_course}
                    </div>
                    <span className="text-[#facc15] font-bold text-xl">!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-zinc-500 text-[10px] tracking-wider">COURSE</div>
                  <div className="text-white text-lg mt-1 font-semibold">{requestData?.corrected_course}</div>
                </>
              )}
            </div>
            {/* CGPA */}
            <div>
              {originalData && String(originalData.cgpa) !== String(requestData?.corrected_cgpa) ? (
                <>
                  <div className="text-[#facc15] text-[10px] tracking-wider font-bold">CGPA [MODIFIED]</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="bg-[#1a1500] border border-[#facc15]/30 text-[#facc15] px-2 py-1 text-lg font-bold">
                      {requestData?.corrected_cgpa}
                    </div>
                    <span className="text-[#facc15] font-bold text-xl">!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-zinc-500 text-[10px] tracking-wider">CGPA</div>
                  <div className="text-white text-lg mt-1 font-semibold">{requestData?.corrected_cgpa}</div>
                </>
              )}
            </div>
            {/* REG_NO */}
            <div>
              {originalData && String(originalData.reg_no) !== String(requestData?.corrected_reg_no) ? (
                <>
                  <div className="text-[#facc15] text-[10px] tracking-wider font-bold">REG_NO [MODIFIED]</div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="bg-[#1a1500] border border-[#facc15]/30 text-[#facc15] px-2 py-1 text-lg font-bold">
                      {requestData?.corrected_reg_no}
                    </div>
                    <span className="text-[#facc15] font-bold text-xl">!</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-zinc-500 text-[10px] tracking-wider">REG_NO</div>
                  <div className="text-white text-lg mt-1 font-semibold">{requestData?.corrected_reg_no}</div>
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 left-6 text-6xl font-bold text-zinc-900/40 pointer-events-none select-none">
            02
          </div>
          <button className="absolute bottom-8 right-8 bg-[#facc15] text-black px-6 py-2 text-xs font-bold hover:bg-white transition-colors tracking-widest">
            COMMIT_CHANGES
          </button>
        </div>
      </main>

      {/* Bottom Security Audit Log */}
      <div className="bg-[#111] border border-zinc-800 p-6 mt-8 flex justify-between items-start">
        <div className="max-w-2xl text-left">
        </div>

        <div className="flex gap-4 items-center">
          <button className="bg-transparent border border-zinc-600 text-zinc-400 px-6 py-2 text-xs hover:border-white hover:text-white transition-colors tracking-widest">
            DECLINE_UPDATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminResolve;
