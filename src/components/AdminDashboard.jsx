import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
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
    Download
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalIssued: 0, totalVerifications: 0, totalRevoked: 0 });
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Stats
                const statsRes = await axios.get('http://localhost:5000/api/certificates/stats', { headers });
                setStats(statsRes.data);

                // Fetch Activity Logs
                const activityRes = await axios.get('http://localhost:5000/api/certificates/activity', { headers });
                setActivityLogs(activityRes.data);
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            }
        };
        fetchDashboardData();
    }, []);

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await axios.get('http://localhost:5000/api/certificates/export', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Convert JSON data to an Excel worksheet
            const worksheet = XLSX.utils.json_to_sheet(res.data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Certificates");

            // Trigger the download as a true Excel file
            XLSX.writeFile(workbook, "Certvify_Database_Export.xlsx");
        } catch (error) {
            console.error("Export Error:", error);
            alert("Failed to export database.");
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a09] text-gray-300 font-mono overflow-hidden">

            {/* SIDEBAR (LEFT PANEL) */}
            <div className="w-[260px] flex-shrink-0 bg-[#0e0e0c] border-r border-[#1a1a18] flex flex-col justify-between">
                <div>
                    {/* Logo Area */}
                    <div className="p-6 border-b border-[#1a1a18] mb-4">
                        <div className="flex items-center text-white font-black text-xl tracking-widest mb-1">
                            <span className="text-yellow-500 mr-2">C_</span> CERTVIFY
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1 px-4">
                        <Link to="/dashboard" className="flex items-center justify-between bg-[#facc15] text-black px-4 py-3 font-bold text-xs tracking-widest transition-colors mb-4">
                            <div className="flex items-center">
                                <LayoutDashboard className="w-4 h-4 mr-3" strokeWidth={2.5} />
                                DASHBOARD
                            </div>
                        </Link>

                        <Link to="/logs" className="flex items-center px-4 py-3 text-gray-400 hover:text-white hover:bg-[#141412] font-semibold text-xs tracking-widest transition-colors group mb-4">
                            <Activity className="w-4 h-4 mr-3 text-gray-600 group-hover:text-gray-400" strokeWidth={2} />
                            LOGS
                        </Link>
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

                <div className="relative z-10 p-8 md:p-12 max-w-[1400px] mx-auto min-h-full flex flex-col">

                    {/* TOP HEADER */}
                    <div className="flex flex-wrap justify-between items-end mb-12 gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-2 flex items-center">
                                Dashboard
                            </h1>
                            <div className="text-xs text-gray-500 tracking-[0.15em] uppercase">
                                <span className="text-yellow-600 mr-2">&gt;</span>
                                ACCESS LEVEL: ADMIN
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {/* Range selection removed for final UI */}
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
                                <div className="text-xs text-gray-400 tracking-widest uppercase">CERTIFICATES</div>
                            </div>
                            <div className="flex items-end justify-between mt-auto">
                                <div className="text-4xl font-bold text-white tracking-wide border-b-4 border-yellow-500 pb-1 w-3/4">
                                    {stats.totalIssued || 0}
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
                                <div className="text-4xl font-bold text-white tracking-wide border-b-4 border-yellow-500 pb-1 w-3/4 flex items-end">
                                    {stats.totalVerifications || 0} <span className="text-sm text-gray-600 font-normal ml-2 border-none"></span>
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
                                    {stats.totalRevoked || 0}
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

                    {/* ALTER RECORDS SECTION */}
                    <div className="flex flex-col mb-12">
                        <h3 className="text-xs font-bold text-white tracking-[0.15em] uppercase flex items-center mb-6">
                            <span className="text-yellow-500 mr-2">&gt;</span> Quick Actions
                        </h3>

                        <div className="flex flex-row gap-6 h-[100px]">
                            {/* Primary Action */}
                            <button
                                onClick={() => navigate('/issue')}
                                className="bg-[#facc15] hover:bg-yellow-400 text-black p-5 flex items-center justify-between transition-colors group relative overflow-hidden flex-1"
                            >
                                <div className="flex flex-col items-start relative z-10">
                                    <span className="font-extrabold text-sm tracking-widest uppercase mb-1 flex items-center">
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
                                className="bg-[#11110f] border border-[#1a1a18] hover:border-gray-600 p-5 flex items-center justify-between transition-colors text-white flex-1 h-full"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-[11px] tracking-widest uppercase mb-1">
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
                                className="bg-[#11110f] border border-[#1a1a18] hover:border-gray-600 p-5 flex items-center justify-between transition-colors text-white flex-1 h-full cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-[11px] tracking-widest uppercase mb-1">
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
                                <span className="text-yellow-500 mr-2">&gt;</span> RECENT_ACTIVITY_LOG
                            </h3>
                            <div className="flex gap-3">

                                <button
                                    onClick={() => navigate('/logs')}
                                    className="border border-yellow-900/50 bg-[#1a1608] text-[9px] text-yellow-600 px-3 py-1.5 tracking-widest uppercase hover:bg-[#2a220c] transition-colors"
                                >
                                    [ EXPAND_VIEW ]
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#0e0e0c] border border-[#1a1a18] rounded-sm flex flex-col w-full text-xs">
                            {/* Table Header */}
                            <div className="grid grid-cols-[120px_1fr_150px] px-6 text-xs text-zinc-500 font-mono tracking-wider pb-4 border-b border-zinc-800/50">
                                <div className="text-left">STATUS_CODE</div>
                                <div className="text-left pl-4">EVENT_DETAILS</div>
                                <div className="text-right">T_STAMP</div>
                            </div>

                            {/* Table Body */}
                            <div>
                                {activityLogs && activityLogs.length > 0 ? (
                                    activityLogs.map((log, index) => (
                                        <div key={index} className="grid grid-cols-[120px_1fr_150px] px-6 py-4 border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-colors text-sm items-center">
                                            <div className="font-mono text-xs text-left">
                                                {log.is_revoked ? (
                                                    <span className="text-red-500">[REVOKED]</span>
                                                ) : (
                                                    <span className="text-green-500">[ISSUED]</span>
                                                )}
                                            </div>
                                            <div className="text-zinc-300 text-left pl-4">
                                                <span className="text-white font-medium">{log.student_name}</span>
                                                <br />
                                                <span className="text-zinc-500 text-xs font-mono mt-1 block">
                                                    Student ID: {log.student_id}
                                                </span>
                                            </div>
                                            <div className="text-zinc-500 font-mono text-xs text-right">
                                                {new Date(log.created_at || log.issue_date).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-zinc-600 font-mono text-sm border-b border-zinc-800/50">
                                        [ NO_RECENT_RECORDS ]
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
