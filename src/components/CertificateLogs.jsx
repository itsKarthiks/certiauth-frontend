import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Bell,
    Sun,
    Search,
    SlidersHorizontal,
    Plus,
    MoreVertical,
    Ban,
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Home
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const CertificateLogs = () => {
    const navigate = useNavigate();

    // State for live backend data
    const [certificates, setCertificates] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 5;
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [openDropdown, setOpenDropdown] = useState(null); // Tracks which row's 3-dot menu is open
    const [openMenuId, setOpenMenuId] = useState(null);
    const [revokeConfirmId, setRevokeConfirmId] = useState(null);
    const location = useLocation();

    // Handle initial filter from navigation state
    useEffect(() => {
        if (location.state && location.state.filter) {
            setStatusFilter(location.state.filter);
        }
    }, [location.state]);
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const { data, error } = await supabase.from('certificates').select('*');

                console.log("RAW SUPABASE DATA:", data);
                if (error) console.error("SUPABASE ERROR:", error);

                if (error) throw error;
                setCertificates(data || []);
            } catch (error) {
                console.error("CERTIFICATE LOGS FETCH ERROR:", error.message);
            }
        };

        fetchCertificates();

        // Listen for live updates
        const subscription = supabase
            .channel('live_certificate_logs')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => {
                fetchCertificates();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    const triggerRevokeModal = (regNo) => {
        setRevokeConfirmId(regNo);
        setOpenMenuId(null); // Close the dropdown menu
    };

    const executeRevoke = async () => {
        try {
            const { error } = await supabase
                .from('certificates')
                .update({ status: 'revoked' })
                .eq('registration_number', revokeConfirmId);
            
            if (error) throw error;
            setRevokeConfirmId(null); // Close modal on success
        } catch (err) {
            console.error("Failed to revoke:", err.message);
            alert("Failed to revoke certificate.");
        }
    };

    const handleReinstate = async (registrationNumber) => {
        try {
            const { error } = await supabase
                .from('certificates')
                .update({ status: 'finalized' }) // Matches the active status in the database
                .eq('registration_number', registrationNumber);
            
            if (error) throw error;

            // Update local state to immediately reflect the change
            setCertificates(prevCerts => 
                prevCerts.map(cert => 
                    cert.registration_number === registrationNumber 
                        ? { ...cert, status: 'finalized' } 
                        : cert
                )
            );
            
            // Close the dropdown
            setOpenMenuId(null); 
            
        } catch (error) {
            console.error("Error reinstating certificate:", error);
            alert("Failed to reinstate certificate.");
        }
    };

    const handleToggleStatus = async (certificateId) => {
        try {
            const token = localStorage.getItem('adminToken');
            await axios.patch(`http://localhost:5000/api/certificates/${certificateId}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // The new useEffect with Supabase real-time will re-fetch automatically
            // fetchCertificates(); 
            setOpenDropdown(null);
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Helper to render the proper status badge styling
    const renderStatusBadge = (isRevoked) => {
        if (!isRevoked) {
            return (
                <div className="flex items-center w-max px-3 py-1 bg-green-900/10 border border-green-900 rounded-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                    <span className="text-[10px] font-bold text-green-500 tracking-widest uppercase">ACTIVE</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center w-max px-3 py-1 bg-red-900/10 border border-red-900 rounded-sm">
                    <Ban className="w-3 h-3 text-red-500 mr-2" strokeWidth={2.5} />
                    <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">REVOKED</span>
                </div>
            );
        }
    };

    const filteredCerts = certificates.filter(cert => {
        const matchesSearch = (
            cert.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = 
            statusFilter === 'ALL' ? true :
            statusFilter === 'ACTIVE' ? cert.status === 'finalized' || cert.status === 'issued' :
            statusFilter === 'REVOKED' ? cert.status === 'revoked' : true;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-[#0a0a09] text-gray-300 font-mono flex flex-col pt-6 px-10">

            {/* TOP NAVIGATION BAR */}
            <div className="flex items-center justify-between border-b border-[#1a1a18] pb-6 mb-8 mt-2">
                <div className="flex items-center text-white font-black text-xl tracking-widest">
                    <div className="bg-yellow-500 text-black w-8 h-8 flex items-center justify-center mr-3 font-extrabold text-lg">
                        C_
                    </div>
                    <div className="flex flex-col">
                        CERTVIFY
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer hover:bg-zinc-800 transition-all p-2 flex items-center justify-center rounded-md group"
                        title="Back to Dashboard"
                    >
                        <Home className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] w-full mx-auto flex flex-col flex-1">

                {/* HEADER SECTION */}
                <div className="flex flex-wrap items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-wide uppercase mb-2">
                            CERTIFICATE DATABASE
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate('/issue')}
                        className="flex items-center bg-[#facc15] hover:bg-yellow-400 text-black font-bold text-[11px] tracking-widest uppercase px-6 py-4 shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" strokeWidth={3} />
                        ISSUE NEW CERTIFICATE
                    </button>
                </div>

                {/* CONTROL BAR (SEARCH & FILTERS) */}
                <div className="bg-[#11110f] border border-[#1a1a18] p-3 flex flex-wrap items-center justify-between gap-4 mb-6">
                    {/* Search */}
                    <div className="flex items-center flex-1 max-w-2xl bg-black border border-[#22221e] px-4 py-3 group focus-within:border-gray-600 transition-colors">
                        <Search className="w-4 h-4 text-gray-500 mr-3 group-focus-within:text-yellow-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, or Course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs text-gray-300 w-full font-mono placeholder-gray-600"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-bold tracking-[0.15em] mr-2">STATUS:</span>

                        <div className="flex border border-[#22221e] bg-black">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${statusFilter === 'ALL' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1a1a18]'}`}
                            >
                                ALL
                            </button>
                            <button
                                onClick={() => setStatusFilter('ACTIVE')}
                                className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors border-l border-[#22221e] ${statusFilter === 'ACTIVE' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1a1a18]'}`}
                            >
                                ACTIVE
                            </button>
                            <button
                                onClick={() => setStatusFilter('REVOKED')}
                                className={`px-5 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors border-l border-[#22221e] ${statusFilter === 'REVOKED' ? 'bg-[#facc15] text-black' : 'text-gray-400 hover:text-white hover:bg-[#1a1a18]'}`}
                            >
                                REVOKED
                            </button>
                        </div>

                        <button className="p-3 bg-black border border-[#22221e] text-gray-500 hover:text-white transition-colors ml-2">
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* DATA TABLE */}
                <div className="bg-[#11110f] border border-[#1a1a18] flex flex-col w-full flex-1 min-h-[400px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-5 text-[10px] font-bold text-yellow-600 tracking-[0.15em] uppercase border-b border-[#22221e]">
                        <div className="col-span-2">STUDENT ID</div>
                        <div className="col-span-3">RECIPIENT</div>
                        <div className="col-span-3">COURSE</div>
                        <div className="col-span-2 text-left">ISSUE_DATE</div>
                        <div className="col-span-1">STATUS</div>
                        <div className="col-span-1 text-right">ACTIONS</div>
                    </div>

                    {/* Table Body */}
                    <div className="flex flex-col">
                        {filteredCerts.length === 0 ? (
                            <div className="text-center py-10 text-zinc-600 text-xs font-mono w-full">[ NO_CERTIFICATES_FOUND ]</div>
                        ) : (
                            filteredCerts.map((cert) => (
                                <div key={cert.registration_number} className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-[#1a1a18] hover:bg-zinc-900/20 transition-colors items-center text-xs font-mono relative">

                                    {/* Student ID */}
                                    <div className="col-span-2 text-[#facc15] truncate">
                                        {cert.registration_number || 'N/A'}
                                    </div>

                                    {/* Recipient */}
                                    <div className="col-span-3 text-white uppercase truncate">
                                        {cert.student_name || 'PENDING NAME'}
                                    </div>

                                    {/* Course */}
                                    <div className="col-span-3 text-zinc-400 uppercase truncate">
                                        {cert.course || cert.program || 'N/A'}
                                    </div>

                                    {/* Issue Date */}
                                    <div className="col-span-2 text-zinc-500 truncate text-left flex items-center">
                                        {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : 'N/A'}
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1 truncate flex items-center">
                                        <span className={`px-2 py-1 rounded-sm text-[10px] tracking-wider uppercase ${cert.status === 'finalized' || cert.status === 'issued' ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/20' :
                                                cert.status === 'revoked' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                    'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20'
                                            }`}>
                                            {cert.status || 'PENDING'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 flex items-center justify-end gap-3 relative">
                                        
                                        <button 
                                            onClick={() => setOpenMenuId(openMenuId === cert.registration_number ? null : cert.registration_number)}
                                            className="text-zinc-500 hover:text-white px-2 cursor-pointer"
                                        >
                                            ⋮
                                        </button>

                                        {openMenuId === cert.registration_number && (
                                            <>
                                                {/* THE INVISIBLE OVERLAY TRICK: Catches all clicks outside the dropdown */}
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setOpenMenuId(null)} 
                                                ></div>
                                                
                                                {/* THE ACTUAL DROPDOWN MENU */}
                                                <div className="absolute right-8 top-6 w-48 bg-[#0a0a0a] border border-zinc-800 shadow-2xl z-50 rounded-sm overflow-hidden">
                                                    {cert.status === 'REVOKED' || cert.status === 'revoked' ? (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleReinstate(cert.registration_number); }}
                                                            className="w-full text-left px-6 py-3 text-[10px] font-mono tracking-widest uppercase text-green-500 hover:bg-zinc-900 transition-colors whitespace-nowrap"
                                                        >
                                                            [ REINSTATE_CERT ]
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); triggerRevokeModal(cert.registration_number); }}
                                                            className="w-full text-left px-6 py-3 text-[10px] font-mono tracking-widest uppercase text-red-500 hover:bg-zinc-900 transition-colors whitespace-nowrap"
                                                        >
                                                            [ REVOKE_CERT ]
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* FOOTER (PAGINATION) */}
                <div className="flex items-center justify-between py-6 mb-8 mt-2">
                    <div className="text-[10px] text-gray-500 font-mono tracking-widest">
                        Showing {filteredCerts.length > 0 ? 1 : 0} to {filteredCerts.length} of {filteredCerts.length} results
                    </div>

                    <div className="flex border border-[#22221e] bg-[#11110f] font-mono text-xs">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className={`px-4 py-2 border-r border-[#22221e] text-gray-500 hover:text-white hover:bg-[#1a1a18] transition-colors ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="px-5 py-2 border-r border-[#22221e] bg-[#facc15] text-black font-extrabold transition-colors">
                            {page}
                        </button>
                        <button
                            disabled={page * limit >= total}
                            onClick={() => setPage(page + 1)}
                            className={`px-4 py-2 text-gray-500 hover:text-white hover:bg-[#1a1a18] transition-colors ${page * limit >= total ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>

            {/* Custom Revoke Confirmation Modal */}
            {revokeConfirmId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0a0a0a] border border-red-900/50 w-full max-w-md p-6 shadow-2xl relative">
                        {/* Top Accent Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
                        
                        <div className="flex items-center gap-3 mb-4 text-red-500 font-mono">
                            <span className="text-xl">⚠️</span>
                            <h3 className="text-sm font-bold tracking-widest uppercase">Confirm Revocation</h3>
                        </div>
                        
                        <p className="text-zinc-400 text-xs font-mono leading-relaxed mb-8">
                            You are about to permanently revoke the certificate for <span className="text-white font-bold">{revokeConfirmId}</span>. This action will invalidate the cryptographic signature and mark the record as blacklisted in the public registry. 
                            <br/><br/>
                            Do you wish to proceed?
                        </p>
                        
                        <div className="flex justify-end gap-4 font-mono text-xs">
                            <button 
                                onClick={() => setRevokeConfirmId(null)}
                                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                [ Cancel ]
                            </button>
                            <button 
                                onClick={executeRevoke}
                                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-black transition-colors uppercase tracking-wider font-bold"
                            >
                                [ Confirm Revoke ]
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CertificateLogs;
