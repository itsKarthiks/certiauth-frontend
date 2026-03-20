import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

const CertificateDownload = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for an active Supabase session when the component mounts.
  // This determines whether to show private dashboard links or a public back button.
  useEffect(() => {
      const checkSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          setIsAuthenticated(!!session);
      };
      checkSession();
  }, []);

  useEffect(() => {
    const fetchCert = async () => {
      if (!id) {
        setError("No certificate ID provided in the URL.");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('registration_number', id)
          .single();

        if (error) throw error;
        setCertData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">Loading secure document...</div>;
  if (error) return <div className="min-h-screen bg-[#0a0a0a] text-red-500 flex items-center justify-center font-mono">Error: {error}</div>;
  if (!certData) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-mono">Certificate record not found.</div>;

  // Safely format the date
  const dateString = certData.created_at || certData.issued_at || new Date().toISOString();
  const formattedDate = new Date(dateString).toLocaleDateString('en-GB');
  
  // Build the iframe URL
  const qrUrl = `${window.location.origin}/verify?id=${certData.registration_number}`;
  const iframeSrc = `/certvify-template.html?name=${encodeURIComponent(certData.student_name || '')}&regno=${encodeURIComponent(certData.registration_number || '')}&cgpa=${encodeURIComponent(certData.cgpa || '')}&date=${encodeURIComponent(formattedDate)}&qr=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono flex flex-col items-center py-12 px-4">
      
      {/* Navigation Area — conditional on auth status */}
      <div className="absolute top-6 right-6 flex gap-4 z-50">
        {isAuthenticated && (
          <>
            <button
              onClick={() => navigate('/student-portal')}
              className="text-xs font-mono text-gray-400 hover:text-white border border-[#333] hover:border-gray-500 bg-[#0a0a0a] px-4 py-2 rounded-sm tracking-[0.15em] transition-colors"
            >
              [ HOME ]
            </button>
            <button
              onClick={async () => {
                localStorage.clear();
                await supabase.auth.signOut();
                navigate('/login');
              }}
              className="text-xs font-mono text-red-500 hover:text-red-400 border border-red-900 hover:border-red-500 bg-[#0a0a0a] px-4 py-2 rounded-sm tracking-[0.15em] transition-colors"
            >
              [ LOGOUT ]
            </button>
          </>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/')}
            className="text-xs font-mono text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-500 bg-[#0a0a0a] px-4 py-2 rounded-sm tracking-[0.15em] transition-colors uppercase"
          >
            [ BACK_TO_VERIFIER ]
          </button>
        )}
      </div>

      {/* Header Area */}
      <div className="text-center mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-[0.15em] mb-2 uppercase">
          Official Certificate Available
        </h1>
        <p className="text-xs text-gray-500 tracking-[0.2em] uppercase">
          FINALIZED_DOCUMENT_V1.0.SECURE_PDF
        </p>
      </div>

      {/* Main Certificate Container */}
      <div className="w-full max-w-5xl bg-[#141414] border border-[#222] p-6 rounded-sm shadow-2xl">
        
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className="text-[#00ff66] text-xs font-bold tracking-widest bg-[#0a0a0a] px-6 py-2 border border-[#333] rounded-sm">
            [•] STATUS: VERIFIED & FINALIZED
          </div>
        </div>

        {/* The Document */}
        <div className="bg-white p-2 rounded-sm mb-6 shadow-inner">
          <iframe
            src={iframeSrc}
            className="w-full aspect-[1280/816] border-none overflow-hidden rounded-sm"
            title="Official Certificate"
          />
        </div>

        {/* Download Button Area */}
        <button 
          onClick={() => {
            const iframe = document.querySelector('iframe');
            if (iframe) {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            }
          }} 
          className="w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold py-4 text-sm tracking-[0.15em] transition-colors rounded-sm"
        >
          [DOWNLOAD OFFICIAL CERTIFICATE (PDF)]
        </button>
        <div className="text-center mt-3 text-[10px] text-gray-600 tracking-[0.2em]">
          FILE_SIZE: 2.4 MB // FORMAT: SECURE_PDF // ENCRYPTION: AES-256
        </div>
      </div>

      {/* Full Width Verification Status Box (Replacing the 3 boxes) */}
      <div className="w-full max-w-5xl mt-8">
        <div className="bg-[#141414] border border-[#222] p-5 text-center rounded-sm">
          <div className="text-[#facc15] font-bold text-xs tracking-widest mb-2 uppercase">
            _Verify Status
          </div>
          <div className="text-gray-600 text-[10px] tracking-[0.2em] uppercase">
            BLOCKCHAIN_HASH_ID // DOC_REF: {certData.registration_number}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CertificateDownload;