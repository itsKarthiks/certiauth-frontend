import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('correction_requests')
          .select('*')
          .ilike('status', 'pending')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono uppercase">
      {/* Top Header */}
      <header className="w-full p-6 flex justify-between items-center border-b border-[#1a1a18] bg-[#0e0e0c]">
        <div className="flex items-center text-white font-black text-xl tracking-widest">
          <span className="text-yellow-500 mr-2">C_</span> CERTVIFY
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-[#11110f] border border-[#1a1a18] hover:border-gray-500 text-white font-bold text-xs tracking-[0.15em] px-6 py-2.5 transition-colors"
        >
          HOME
        </button>
      </header>

      {/* Main Body */}
      <main className="max-w-[1400px] w-full mx-auto pt-10 px-6 md:px-12">
        <div className="border-b border-[#1a1a18] pb-6 mb-10 text-left">
          <h1 className="text-white font-black tracking-widest text-3xl md:text-4xl text-left">
            REVOKE NOTIFICATIONS
          </h1>
        </div>

        {/* Notification Cards */}
        <div className="flex flex-col gap-3">
          {notifications.length === 0 && (
             <div className="text-center text-zinc-600 font-mono mt-20 text-sm tracking-widest">
               [ NO_PENDING_REQUESTS_DETECTED ]
             </div>
          )}
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className="bg-[#050000] border border-zinc-800 hover:border-zinc-600 transition-colors p-4 md:p-5 flex justify-between items-start w-full"
            >
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-500 text-sm">⚠️</span>
                  <span className="text-yellow-500 text-[10px] md:text-xs tracking-[0.15em] font-bold">
                    EVENT_TYPE: REVOKE
                  </span>
                </div>
                <div className="text-white mb-4 text-[11px] md:text-sm tracking-widest leading-relaxed">
                  <div>STUDENT_EMAIL: <span className="text-zinc-300 font-bold">{notif.student_email}</span></div>
                  <div>REG_NO: <span className="text-zinc-300 font-bold">{notif.corrected_reg_no}</span></div>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/resolve', { state: { requestData: notif } })}
                    className="bg-[#facc15] hover:bg-yellow-400 text-black font-black text-[9px] md:text-[10px] tracking-[0.2em] px-5 py-2 uppercase transition-colors active:scale-95"
                  >
                    [ RESOLVE ]
                  </button>
                </div>
              </div>
              
              <div className="text-zinc-600 text-[9px] md:text-[10px] text-right mt-1 tracking-widest">
                TIMESTAMP: {new Date(notif.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminNotifications;
