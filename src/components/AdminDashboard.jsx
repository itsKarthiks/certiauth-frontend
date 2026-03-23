import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import {
    LayoutDashboard,
    FileText,
    Users,
    User,
    Activity,
    Settings,
    Shield,
    Bell,
    Calendar,
    ChevronDown,
    TrendingUp,
    Search,
    AlertTriangle,
    QrCode,
    XOctagon,
    Download,
    LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total: 0, active24h: 0, revoked: 0 });
    const [recentLogs, setRecentLogs] = useState([]);
    const [correctionRequests, setCorrectionRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchCorrections = async () => {
            try {
                const { data, error } = await supabase
                    .from('correction_requests')
                    .select('*')
                    .eq('status', 'Pending')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                if (data) setCorrectionRequests(data);
                if (data) setNotifications(data);
            } catch (error) {
                console.error("Corrections Fetch Error:", error);
            }
        };

        fetchCorrections();

        const subscription = supabase
            .channel('admin-dashboard-corrections')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'correction_requests' },
                () => {
                    fetchCorrections();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Total Certificates
                const { count: totalCount } = await supabase
                    .from('certificates')
                    .select('*', { count: 'exact', head: true });
                
                // 2. Revoked Certificates
                const { count: revokedCount } = await supabase
                    .from('certificates')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'revoked');

                // 3. Verification Count (for the middle top card)
                const { count: verifCount } = await supabase
                    .from('verification_logs')
                    .select('*', { count: 'exact', head: true });

                // 4. Recent Certificates Log (FIXED: ordered by issued_at)
                const { data: recentCerts, error: recentErr } = await supabase
                    .from('certificates')
                    .select('*')
                    .order('issued_at', { ascending: false })
                    .limit(5);

                if (recentErr) throw recentErr;

                setStats({
                    total: totalCount || 0,
                    active24h: verifCount || 0,
                    revoked: revokedCount || 0
                });

                const formattedLogs = (recentCerts || []).map(cert => ({
                    id: cert.id || cert.registration_number,
                    status: cert.status === 'finalized' ? 'ISSUED' : cert.status?.toUpperCase() || 'DRAFT',
                    details: `Certificate ${cert.status === 'finalized' ? 'issued' : cert.status === 'revoked' ? 'revoked' : 'drafted'} for ${cert.registration_number}`,
                    timestamp: cert.issued_at
                }));
                
                setRecentLogs(formattedLogs);

            } catch (error) {
                console.error("DASHBOARD FETCH ERROR:", error);
            }
        };

        fetchDashboardData();

        // Realtime Subscription
        const certSub = supabase.channel('cert_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'certificates' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        const verifSub = supabase.channel('verif_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_logs' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(certSub);
            supabase.removeChannel(verifSub);
        };
    }, []);

    const handleExport = async () => {
        try {
            console.log("Initiating Frontend Export...");
            
            // 1. Fetch all certificates directly from Supabase
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .order('issued_at', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                alert("No data found to export.");
                return;
            }

            // 2. Format the data into clean, readable columns for Excel
            const exportData = data.map(cert => ({
                'Registration Number': cert.registration_number,
                'Student Name': cert.student_name,
                'Course': cert.course,
                'CGPA': cert.cgpa,
                'Status': cert.status ? cert.status.toUpperCase() : 'UNKNOWN',
                'Issue Date': cert.issued_at ? new Date(cert.issued_at).toLocaleString() : 'N/A',
                'Digital Signature': cert.digital_signature || 'N/A'
            }));

            // 3. Generate the Excel Workbook
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Certvify_Logs");

            // 4. Trigger the native browser download
            const dateString = new Date().toISOString().split('T')[0];
            XLSX.writeFile(workbook, `Certvify_System_Logs_${dateString}.xlsx`);
            
            console.log("Export Successful!");

        } catch (err) {
            console.error("Frontend Export Error:", err);
            alert("Failed to generate export file. Check console for details.");
        }
    };

    const handleResolve = async (id) => {
        try {
            const { error } = await supabase
                .from('correction_requests')
                .update({ status: 'Resolved' })
                .eq('id', id);

            if (error) throw error;
            
            // Filter it out of the UI state:
            setCorrectionRequests(prev => prev.filter(req => req.id !== id));
        } catch (error) {
            console.error("Resolve Error:", error);
            alert("Failed to resolve request.");
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('adminToken');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            navigate('/');
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-[#0a0a09] text-gray-300 font-mono overflow-x-hidden md:overflow-hidden">

            {/* SIDEBAR (LEFT PANEL) */}
            <div className="w-full md:w-[260px] flex-shrink-0 bg-[#0e0e0c] border-b md:border-r md:border-b-0 border-[#1a1a18] flex flex-col justify-between">
                <div>
                    {/* Logo Area */}
                    <div className="p-6 border-b border-[#1a1a18] mb-4">
                        <div className="flex items-center text-white font-black text-xl tracking-widest mb-1">
                            <span className="text-purple-500 mr-2">C_</span> CERTVIFY
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1 px-4">
                        <Link to="/dashboard" className="flex items-center justify-between bg-purple-600 text-black px-4 py-3 font-bold text-xs tracking-widest transition-colors mb-4">
                            <div className="flex items-center">
                                <LayoutDashboard className="w-4 h-4 mr-3" strokeWidth={2.5} />
                                DASHBOARD
                            </div>
                        </Link>

                        <Link to="/logs" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#141412] font-semibold text-xs tracking-widest transition-colors group mb-4">
                            <Activity className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-400" strokeWidth={2} />
                            LOGS
                        </Link>

                        <div onClick={() => navigate('/notifications')} className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#141412] font-semibold text-xs tracking-widest transition-colors group mb-4 cursor-pointer">
                            <Bell className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-400" strokeWidth={2} />
                            NOTIFICATIONS
                        </div>
                    </nav>
                </div>

                {/* Footer Profile Block */}
                <div className="p-4 border-t border-[#1a1a18] bg-[#0c0c0a]">
                    <div className="flex items-center p-3 bg-[#11110f] border border-[#1a1a18] rounded-sm">
                        <div className="w-10 h-10 bg-[#22221e] rounded-sm mr-3 flex items-center justify-center overflow-hidden">
                            <User className="w-6 h-6 text-gray-600 mt-2" strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-xs tracking-widest uppercase">ADM_USER</span>
                            <div className="flex items-center mt-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
                                <span className="text-[8px] text-green-500 tracking-[0.1em] uppercase">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT (RIGHT PANEL) */}
            <div className="flex-1 overflow-y-auto w-full relative">
                {/* Subtle grid background */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <div className="relative z-10 p-4 md:p-12 max-w-[1400px] mx-auto min-h-full flex flex-col">

                    {/* TOP HEADER */}
                    <div className="flex flex-wrap justify-between items-end mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-2 flex items-center">
                                Dashboard
                            </h1>
                            <div className="text-xs text-gray-500 tracking-[0.15em] uppercase">
                                <span className="text-purple-500 mr-2">&gt;</span>
                                ACCESS LEVEL: ADMIN
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <Bell 
                                    className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition-colors" 
                                    onClick={() => navigate('/notifications')}
                                />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0a0a09] animate-pulse"></span>
                                )}
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 border border-[#333] hover:border-red-900/50 bg-[#0f0f0e] hover:bg-red-900/10 text-zinc-400 hover:text-red-500 transition-colors px-4 py-2 font-bold text-[10px] tracking-[0.2em] uppercase"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">TERMINATE_SESSION</span>
                            </button>
                        </div>
                    </div>

                    {/* METRICS GRID (TOP ROW) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Card 1 */}
                        <div
                            onClick={() => navigate('/logs')}
                            className="bg-[#11110f] border border-[#1a1a18] p-6 relative flex flex-col justify-between h-[160px] cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="absolute top-4 right-4 text-gray-700">
                                <Shield className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                                <div className="text-[9px] text-gray-500 tracking-[0.2em] font-bold uppercase mb-1">TOTAL_ISSUED</div>
                                <div className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase">CERTIFICATES</div>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                                <div className="text-4xl font-bold text-white tracking-wide border-b-4 border-purple-500 pb-1 w-3/4">
                                    {stats.total}
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div
                            onClick={() => navigate('/logs')}
                            className="bg-[#11110f] border border-[#1a1a18] p-6 relative flex flex-col justify-between h-[160px] cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="absolute top-4 right-4 text-gray-700">
                                <Activity className="w-8 h-8 opacity-20" />
                            </div>
                            <div>
                                <div className="text-[9px] text-gray-500 tracking-[0.2em] font-bold uppercase mb-1">ACTIVITY_24H</div>
                                <div className="text-xs text-gray-400 tracking-widest uppercase">VERIFICATIONS</div>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                                <div className="text-4xl font-bold text-white tracking-wide border-b-4 border-purple-500 pb-1 w-3/4 flex items-end">
                                    {stats.active24h} <span className="text-sm text-gray-600 font-normal ml-2 border-none"></span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3 (Alert) */}
                        <div
                            onClick={() => navigate('/logs', { state: { filter: 'REVOKED' } })}
                            className="bg-[#141211] border border-[#2a1b1a] p-6 relative flex flex-col justify-between h-[160px] cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="absolute top-4 right-4 text-red-900/40">
                                <XOctagon className="w-8 h-8" />
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[9px] text-gray-500 tracking-[0.2em] font-bold uppercase mb-1">REVOKED_STATUS</div>
                                    <div className="text-xs text-gray-400 tracking-widest uppercase">BLACKLISTED</div>
                                </div>
                                <div className="bg-red-900/20 border border-red-900 text-red-500 text-[9px] px-2 py-1 font-bold tracking-widest flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1.5" /> ATTN
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                                <div className="text-4xl font-bold text-white tracking-wide w-3/4 relative">
                                    {stats.revoked}
                                    {/* Red progress bar below number */}
                                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#2a1a1a]">
                                        <div className="h-full bg-red-500 w-[15%]"></div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] text-gray-600 tracking-widest uppercase">ACTION REQUIRED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PENDING CORRECTIONS ALERT PANEL */}
                    {correctionRequests.length > 0 && (
                        <div className="border border-red-900/50 bg-red-950/10 rounded-xl p-4 md:p-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-red-900/20">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-black text-red-500 tracking-[0.2em] uppercase">
                                    ATTENTION REQUIRED: Pending Student Corrections
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {correctionRequests.map((req) => (
                                    <div key={req.id} className="bg-black/40 border border-red-900/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-red-500/30 transition-colors">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-gray-500 tracking-widest uppercase">Student Identifier</span>
                                            <span className="text-xs text-white font-bold">{req.student_email}</span>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-1">
                                            <span className="text-[10px] text-gray-500 tracking-widest uppercase">Requested Changes</span>
                                            <div className="text-[11px] text-red-200/70 font-bold uppercase tracking-tight flex flex-wrap gap-x-4">
                                                {req.corrected_name && <span>Name: <span className="text-white">{req.corrected_name}</span></span>}
                                                {req.corrected_reg_no && <span>Reg: <span className="text-white">{req.corrected_reg_no}</span></span>}
                                                {req.corrected_course && <span>Course: <span className="text-white">{req.corrected_course}</span></span>}
                                                {req.corrected_cgpa && <span>CGPA: <span className="text-white">{req.corrected_cgpa}</span></span>}
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate('/notifications')}
                                            className="bg-red-600 hover:bg-red-500 text-white font-black text-[9px] tracking-[0.2em] uppercase px-6 py-3 transition-all active:scale-[0.98]"
                                        >
                                            [ RESOLVE & REISSUE ]
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ALTER RECORDS SECTION */}
                    <div className="flex flex-col mb-12">
                        <h3 className="text-xs font-bold text-white tracking-[0.15em] uppercase flex items-center mb-6">
                            <span className="text-purple-500 mr-2">&gt;</span> Quick Actions
                        </h3>

                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:h-[100px]">
                            {/* Primary Action */}
                            <button
                                onClick={() => navigate('/issue')}
                                className="bg-purple-600 hover:bg-purple-500 text-black p-4 md:p-5 flex items-center justify-between transition-colors group relative overflow-hidden flex-1"
                            >
                                <div className="flex flex-col items-start relative z-10">
                                    <span className="font-extrabold text-[12px] md:text-sm tracking-widest uppercase mb-1 flex items-center">
                                        <FileText className="w-4 h-4 mr-2" strokeWidth={2.5} />
                                        ISSUE_NEW_CERT
                                    </span>
                                    <span className="text-[9px] font-semibold tracking-widest uppercase opacity-70 ml-6">
                                        MODE: SINGLE / BATCH
                                    </span>
                                </div>
                                <div className="relative z-10 text-black/50 group-hover:text-black transition-colors">
                                    <QrCode className="w-8 h-8" />
                                </div>
                            </button>

                            {/* Secondary Action 1 */}
                            <button
                                onClick={() => navigate('/')}
                                className="bg-[#11110f] border border-[#1a1a18] hover:border-gray-600 p-4 md:p-5 flex items-center justify-between transition-colors text-white flex-1 h-full min-h-[80px]"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-[10px] md:text-[11px] tracking-widest uppercase mb-1">
                                        MANUAL_VERIFY
                                    </span>
                                    <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                                        INPUT: STUDENT_ID
                                    </span>
                                </div>
                                <Search className="w-5 h-5 text-gray-600" />
                            </button>


                            {/* Secondary Action 3 */}
                            <button
                                onClick={handleExport}
                                className="bg-[#11110f] border border-[#1a1a18] hover:border-gray-600 p-4 md:p-5 flex items-center justify-between transition-colors text-white flex-1 h-full min-h-[80px] cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-[10px] md:text-[11px] tracking-widest uppercase mb-1">
                                        EXPORT_LOGS
                                    </span>
                                    <span className="text-[9px] text-gray-600 tracking-widest uppercase">
                                        FORMAT: EXCEL
                                    </span>
                                </div>
                                <Download className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY LOG SECTION */}
                    <div className="w-full">
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xs font-bold text-white tracking-[0.15em] uppercase flex items-center">
                                <span className="text-purple-500 mr-2">&gt;</span> RECENT_ACTIVITY_LOG
                            </h3>
                            <div className="flex gap-3">

                                <button
                                    onClick={() => navigate('/logs')}
                                    className="border border-purple-900/50 bg-[#1a1608] text-[9px] text-purple-500 px-3 py-1.5 tracking-widest uppercase hover:bg-[#2a220c] transition-colors"
                                >
                                    [ EXPAND_VIEW ]
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0e0e0c] border border-[#1a1a18] rounded-sm flex flex-col w-full text-[10px] md:text-xs overflow-x-auto">
                            {/* Table Header */}
                            <div className="grid grid-cols-[100px_1fr_120px] md:grid-cols-[120px_1fr_150px] px-4 md:px-6 text-[10px] md:text-xs text-zinc-500 font-mono tracking-wider pb-4 border-b border-zinc-800/50 min-w-[500px]">
                                <div className="text-left pl-2 md:pl-6">STATUS_CODE</div>
                                <div className="text-left pl-2 md:pl-4">EVENT_DETAILS</div>
                                <div className="text-right pr-2 md:pr-6">T_STAMP</div>
                            </div>

                            {/* Table Body */}
                            <table className="w-full px-4 md:px-6 min-w-[500px]">
                                <tbody>
                                    {recentLogs.length === 0 ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-zinc-600 text-xs">[ NO_RECENT_RECORDS ]</td></tr>
                                    ) : (
                                        recentLogs.map((log) => (
                                            <tr key={log.id} className="border-b border-zinc-900/50">
                                                <td className={`py-3 md:py-4 pl-2 md:pl-6 text-[10px] md:text-xs font-mono font-bold tracking-widest ${
                                                    log.status === 'ISSUED' ? 'text-[#00ff66]' : 
                                                    log.status === 'REVOKED' ? 'text-red-500' : 
                                                    log.status === 'DRAFT' ? 'text-blue-500' : 
                                                    'text-zinc-500'
                                                }`}>
                                                    {log.status}
                                                </td>
                                                <td className="py-3 md:py-4 text-zinc-400 text-[10px] md:text-xs font-mono pl-2 md:pl-4">{log.details}</td>
                                                <td className="py-3 md:py-4 text-zinc-500 text-[10px] md:text-xs font-mono text-right pr-2 md:pr-6">{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
