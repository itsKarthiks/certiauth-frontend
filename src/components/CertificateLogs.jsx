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
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [openDropdown, setOpenDropdown] = useState(null); // Tracks which row's 3-dot menu is open
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
    }, [search, statusFilter]);

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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                        {certificates.length === 0 ? (
                            <div className="text-center py-10 text-zinc-600 text-xs font-mono w-full">[ NO_CERTIFICATES_FOUND ]</div>
                        ) : (
                            certificates.map((cert) => (
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
                                    <div className="col-span-1 flex items-center justify-end gap-3 truncate">
                                        <button className="text-zinc-500 hover:text-white transition-colors">[ VIEW ]</button>

                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === cert.id ? null : cert.id)}
                                            className="p-2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        {openDropdown === cert.id && (
                                            <div className="absolute right-12 top-16 z-50 bg-[#1a1a18] border border-[#333] shadow-2xl p-1 min-w-[150px]">
                                                <button
                                                    onClick={() => handleToggleStatus(cert.id)}
                                                    className="w-full text-left px-4 py-2.5 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors text-white"
                                                >
                                                    {cert.status === 'revoked' ? 'Make Active' : 'Revoke Cert'}
                                                </button>
                                            </div>
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
                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
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
        </div>
    );
};

export default CertificateLogs;
