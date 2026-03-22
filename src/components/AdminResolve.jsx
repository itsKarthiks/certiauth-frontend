import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminResolve = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const requestData = location.state?.requestData;
  const [originalData, setOriginalData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    const fetchOriginal = async () => {
      const searchId = requestData?.original_reg_no || requestData?.corrected_reg_no;
      if (searchId) {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('registration_number', searchId)
          .limit(1); // Grabs only one record safely without throwing 406
        
        if (!error && data && data.length > 0) {
          setOriginalData(data[0]); // Extract the object from the array
        }
      }
    };
    fetchOriginal();
  }, [requestData]);

  const nameVal = requestData?.corrected_name || originalData?.student_name;
  const nameChanged = requestData?.corrected_name && requestData.corrected_name !== originalData?.student_name;

  const courseVal = requestData?.corrected_course || originalData?.course;
  const courseChanged = requestData?.corrected_course && requestData.corrected_course !== originalData?.course;

  const cgpaVal = requestData?.corrected_cgpa || originalData?.cgpa;
  const cgpaChanged = requestData?.corrected_cgpa && String(requestData.corrected_cgpa) !== String(originalData?.cgpa);

  const regVal = requestData?.corrected_reg_no || originalData?.reg_no;
  const regChanged = requestData?.corrected_reg_no && String(requestData.corrected_reg_no) !== String(originalData?.reg_no);

  const handleDecline = async () => {
    try {
      const { error } = await supabase
        .from('correction_requests')
        .update({ status: 'Rejected' })
        .eq('id', requestData.id); // Ensure this matches actual state variable for the request ID

      if (error) throw error;
      navigate('/notifications');
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject the request.");
    }
  };

  const handleCommitProtocol = async () => {
    try {
      console.log("Initiating Commit Protocol...");
      
      // Explicitly log what the function sees when the button is clicked
      console.log("DEBUG originalData:", originalData);
      console.log("DEBUG requestData:", requestData);

      // Absolute simplest fallback logic. If the left is null/empty/undefined, grab the right.
      const finalRegNo = requestData?.corrected_reg_no || originalData?.registration_number;
      const finalName = requestData?.corrected_name || originalData?.student_name;
      const finalCourse = requestData?.corrected_course || originalData?.course;
      const finalCgpa = requestData?.corrected_cgpa || originalData?.cgpa;

      // Ultimate Safety Check
      if (!finalRegNo || !finalName || !finalCourse) {
        console.error("FATAL DATA MISSING:", { finalRegNo, finalName, finalCourse });
        alert("System Error: Critical data is missing. Check console for details.");
        return;
      }

      // Step 1: Delete old certificate (Keep this on frontend to ensure cleanup)
      const { error: deleteError } = await supabase
        .from('certificates')
        .delete()
        .eq('registration_number', originalData.registration_number);
        
      if (deleteError) throw deleteError;

      // Step 2: Route through Backend for Cryptographic Signing & Insertion
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/certificates/issue', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              registrationNumber: finalRegNo,
              name: finalName,
              course: finalCourse,
              cgpa: finalCgpa,
              correctionId: requestData?.id
          })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Backend failed to sign the certificate');

      // Step 3: Update Request status to Resolved
      if (requestData?.id) {
        const { error: updateError } = await supabase
          .from('correction_requests')
          .update({ status: 'Resolved' })
          .eq('id', requestData.id);
          
        if (updateError) throw updateError;
      }

      console.log("Commit Successful. Rerouting...");
      setShowConfirmModal(false);
      navigate('/notifications'); 
      
    } catch (error) {
      console.error("CRITICAL ERROR DURING COMMIT:", error);
      alert("System Error: Failed to commit changes. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-mono uppercase">
      {/* Top Header */}
      <header className="flex justify-between items-center bg-[#0a0a0a]">
        <div className="text-purple-500 font-bold text-xl tracking-wider">
          C_ CERTVIFY
        </div>

        <nav className="flex gap-8 text-sm">
          <button className="text-purple-500 border-b-2 border-purple-500 pb-1">COMPARE</button>
        </nav>

        <button className="text-purple-500 hover:text-white transition-colors" onClick={() => navigate('/dashboard')}>
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
            <h2 className="text-purple-500 font-bold tracking-widest text-lg">PREVIOUS_DETAILS</h2>
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
            <div className="mb-4 relative z-10">
              <p className="text-[10px] uppercase text-zinc-600">REG_NO</p>
              <p className="text-white text-lg mt-1">{originalData?.registration_number || 'UNKNOWN_ID'}</p>
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
          <div className="bg-purple-600 text-black w-10 h-10 flex items-center justify-center font-bold">
            <ArrowRight size={20} strokeWidth={3} />
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-[#050000] border border-zinc-800 border-r-4 border-r-[#9333ea] relative p-8 w-1/2 flex flex-col min-h-[400px]">
          <div className="mb-8">
            <h2 className="text-purple-500 font-bold tracking-widest text-lg">CORRECTED_DETAILS</h2>
            <div className="text-zinc-600 text-[10px] tracking-widest mt-1">SOURCE: VERIFIED_AMENDMENT_REQUEST</div>
          </div>

          <div className="space-y-6 z-10 flex-grow">
            {/* NAME */}
            <div className="mb-4">
              <p className={`text-[10px] tracking-wider uppercase ${nameChanged ? 'text-purple-500 font-bold' : 'text-zinc-500'}`}>
                NAME {nameChanged && '[MODIFIED]'}
              </p>
              <div className={`flex items-center gap-3 mt-1`}>
                <span className={nameChanged ? 'bg-[#1a1500] border border-purple-500/30 text-purple-500 px-2 py-1 text-lg font-bold' : 'text-white text-lg font-semibold'}>
                  {nameVal}
                </span>
                {nameChanged && <span className="text-purple-500 font-bold text-xl">!</span>}
              </div>
            </div>

            {/* COURSE */}
            <div className="mb-4">
              <p className={`text-[10px] tracking-wider uppercase ${courseChanged ? 'text-purple-500 font-bold' : 'text-zinc-500'}`}>
                COURSE {courseChanged && '[MODIFIED]'}
              </p>
              <div className={`flex items-center gap-3 mt-1`}>
                <span className={courseChanged ? 'bg-[#1a1500] border border-purple-500/30 text-purple-500 px-2 py-1 text-lg font-bold' : 'text-white text-lg font-semibold'}>
                  {courseVal}
                </span>
                {courseChanged && <span className="text-purple-500 font-bold text-xl">!</span>}
              </div>
            </div>

            {/* CGPA */}
            <div className="mb-4">
              <p className={`text-[10px] tracking-wider uppercase ${cgpaChanged ? 'text-purple-500 font-bold' : 'text-zinc-500'}`}>
                CGPA {cgpaChanged && '[MODIFIED]'}
              </p>
              <div className={`flex items-center gap-3 mt-1`}>
                <span className={cgpaChanged ? 'bg-[#1a1500] border border-purple-500/30 text-purple-500 px-2 py-1 text-lg font-bold' : 'text-white text-lg font-semibold'}>
                  {cgpaVal}
                </span>
                {cgpaChanged && <span className="text-purple-500 font-bold text-xl">!</span>}
              </div>
            </div>

            {/* REG_NO */}
            <div className="mb-4 relative z-10">
              <p className={`text-[10px] uppercase ${regChanged ? 'text-purple-500 font-bold' : 'text-zinc-600'}`}>
                REG_NO {regChanged && '[MODIFIED]'}
              </p>
              <div className={`flex items-center gap-3 ${regChanged ? 'mt-1' : ''}`}>
                <span className={regChanged ? 'bg-[#1a1500] border border-purple-500/30 text-purple-500 px-2 py-1 text-lg' : 'text-white text-lg mt-1'}>
                  {(requestData?.corrected_reg_no && String(requestData.corrected_reg_no).trim() !== '') 
                    ? requestData.corrected_reg_no 
                    : originalData?.registration_number}
                </span>
                {regChanged && <span className="text-purple-500 font-bold">!</span>}
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-6 text-6xl font-bold text-zinc-900/40 pointer-events-none select-none">
            02
          </div>
        </div>
      </main>

      {/* Bottom Security Audit Log */}
      <div className="bg-[#111] border border-zinc-800 p-6 mt-8 flex justify-between items-start">
        <div className="max-w-2xl text-left">
        </div>

        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setShowDeclineModal(true)}
            className="bg-transparent border border-zinc-600 text-zinc-400 px-6 py-2 text-xs hover:border-white hover:text-white transition-colors tracking-widest"
          >
            DECLINE_UPDATE
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault(); // Prevent any default form behavior
              setShowConfirmModal(true);
              console.log("Modal Triggered"); // Debugging log
            }} 
            className="bg-purple-600 text-black px-6 py-2 text-xs font-bold hover:bg-white transition-colors tracking-widest"
          >
            COMMIT_CHANGES
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL OVERLAY */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#050000] border border-purple-500/50 p-6 max-w-lg w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-purple-500 text-xl">⚠️</span>
              <h3 className="text-purple-500 font-mono text-sm font-bold tracking-widest">{'>_'} SYSTEM_OVERRIDE_WARNING</h3>
            </div>
            <p className="text-zinc-400 font-mono text-xs leading-relaxed mb-8">
              Are you sure you want to commit the changes? Committing will completely delete the old issued certificate and issue a new cryptographic certificate to the student. <span className="text-red-400">This action is irreversible.</span>
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setShowConfirmModal(false)} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors">
                [ CANCEL ]
              </button>
              <button 
                onClick={handleCommitProtocol}
                className="px-6 py-2 bg-purple-600 text-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                [ CONFIRM_COMMIT ]
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#050000] border border-red-500/50 p-8 max-w-lg w-full shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <div className="flex items-center gap-3 mb-6">
              <span className="text-red-500 text-xl">⚠️</span>
              <h3 className="text-red-500 font-mono text-sm font-bold tracking-widest">CONFIRM_REJECTION</h3>
            </div>
            
            <p className="text-gray-400 font-mono text-xs mb-8 leading-relaxed">
              Are you sure you want to dismiss this correction request? This will mark the request as <span className="text-red-500 font-bold">REJECTED</span> and the student's original certificate will remain unchanged.
            </p>
            
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowDeclineModal(false)} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors">
                [ CANCEL ]
              </button>
              <button onClick={handleDecline} className="px-6 py-2 bg-red-500 text-black font-mono text-[10px] font-bold uppercase hover:bg-white transition-colors">
                [ CONFIRM_REJECT ]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResolve;
