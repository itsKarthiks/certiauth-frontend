import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [resolvedRequests, setResolvedRequests] = useState([]);

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

    const fetchResolved = async () => {
      try {
        const { data, error } = await supabase
          .from('correction_requests')
          .select('*')
          .in('status', ['Resolved', 'Rejected'])
          .order('created_at', { ascending: false })
          .limit(10); // Limit to recent 10 to keep the page clean
          
        if (!error && data) {
          setResolvedRequests(data);
        }
      } catch (err) {
        console.error("Error fetching resolved:", err);
      }
    };

    fetchRequests();
    fetchResolved();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-mono uppercase">
      {/* Top Header */}
      <header className="w-full p-6 flex justify-between items-center border-b border-[#1a1a18] bg-[#0e0e0c]">
        <div className="flex items-center text-white font-black text-xl tracking-widest">
          <span className="text-purple-500 mr-2">C_</span> CERTVIFY
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
                  <span className="text-purple-500 text-sm">⚠️</span>
                  <span className="text-purple-500 text-[10px] md:text-xs tracking-[0.15em] font-bold">
                    EVENT_TYPE: REVOKE
                  </span>
                </div>
                <div className="text-white mb-4 text-[11px] md:text-sm tracking-widest leading-relaxed">
                  <div>STUDENT_EMAIL: <span className="text-zinc-300 font-bold">{notif.student_email}</span></div>
                  <div>REG_NO: <span className="text-zinc-300 font-bold">{notif.original_reg_no || notif.registration_number || notif.reg_no || 'UNKNOWN_ID'}</span></div>
                </div>
                <div>
                  <button
                    onClick={() => navigate('/resolve', { state: { requestData: notif } })}
                    className="bg-purple-600 hover:bg-purple-500 text-black font-black text-[9px] md:text-[10px] tracking-[0.2em] px-5 py-2 uppercase transition-colors active:scale-95"
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

        {/* --- RECENTLY RESOLVED ARCHIVE --- */}
        <div className="mt-20 border-t border-zinc-800 pt-10 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-zinc-400 text-lg">✓</span>
            <h3 className="text-zinc-400 font-mono text-xs font-bold tracking-widest uppercase">RECENTLY_RESOLVED_ARCHIVE</h3>
          </div>
          
          {resolvedRequests.length === 0 ? (
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">No archived records found.</p>
          ) : (
            <div className="space-y-3 transition-opacity duration-500">
              {resolvedRequests.map(req => (
                <div key={req.id} className="bg-[#0a0a0a] border border-zinc-700/50 p-4 flex justify-between items-center hover:border-zinc-500 transition-colors">
                  <div className="flex flex-col gap-1">
                    <p className="text-zinc-400 font-mono text-[10px] uppercase">
                      REG_NO: <span className="text-zinc-200">{req.original_reg_no || req.registration_number || req.reg_no || 'UNKNOWN_ID'}</span>
                    </p>
                    <p className="text-zinc-500 font-mono text-[9px] uppercase">
                      TARGET: {req.corrected_name || req.corrected_cgpa || 'DOCUMENT_UPDATE'}
                    </p>
                  </div>
                  {req.status === 'Rejected' ? (
                    <div className="text-red-500 font-mono text-[9px] font-bold tracking-widest uppercase border border-red-500/50 px-3 py-1 bg-red-500/10">
                      [ REJECTED ]
                    </div>
                  ) : (
                    <div className="text-green-500 font-mono text-[9px] font-bold tracking-widest uppercase border border-green-500/50 px-3 py-1 bg-green-500/10">
                      [ RESOLVED ]
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminNotifications;
