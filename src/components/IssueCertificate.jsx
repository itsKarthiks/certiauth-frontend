import React, { useState, useRef, useEffect } from 'react';
import {
    Terminal,
    Calendar,
    FileTerminal,
    ChevronRight,
    ChevronLeft,
    Home
} from 'lucide-react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';

const IssueCertificate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const fileInputRef = useRef(null);

    const incomingCorrection = location.state?.correctionData || null;

    // Form State
    const [modalState, setModalState] = useState({ isOpen: false, step: 'confirm', errorMsg: '' });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        registrationNumber: '',
        dob: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [course, setCourse] = useState('');
    const [cgpa, setCgpa] = useState('');

    // Bulk Issuance State
    const [bulkReport, setBulkReport] = useState({ isOpen: false, step: 'preview', validStudents: [], skipped: [] });
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (incomingCorrection) {
            // Split name if possible
            const nameParts = (incomingCorrection.corrected_name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setFormData({
                firstName: firstName,
                lastName: lastName,
                registrationNumber: incomingCorrection.corrected_reg_no || '',
                dob: '' // DOB might not be in correction request, keep as is
            });

            if (incomingCorrection.corrected_course) setCourse(incomingCorrection.corrected_course);
            if (incomingCorrection.corrected_cgpa) setCgpa(incomingCorrection.corrected_cgpa);
        }
    }, [incomingCorrection]);

    // Auto-detect Department Logic
    useEffect(() => {
        const reg = formData.registrationNumber;
        if (reg.length >= 3) {
            const code = reg.substring(0, 3);
            if (code === '415') {
                setCourse('Computer Science and Engineering');
            } else if (code === '416') {
                setCourse('Information Technology');
            } else if (code === '412') {
                setCourse('Electronics and Communication');
            } else {
                setCourse(''); // Reset if unknown
            }
        } else {
            setCourse('');
        }
    }, [formData.registrationNumber]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProceed = () => {
        const { firstName, lastName, registrationNumber } = formData;
        const fullName = `${firstName} ${lastName}`.trim();
        if (!fullName || !registrationNumber || !course || !cgpa) {
            alert("Please fill out all required fields!");
            return;
        }
        setModalState({ isOpen: true, step: 'confirm', errorMsg: '' });
    };

    const executeIssuance = async () => {
        setIsSubmitting(true);
        const { firstName, lastName, registrationNumber } = formData;
        const fullName = `${firstName} ${lastName}`.trim();

        try {
            // 1. Grab the admin badge from local storage
            const token = localStorage.getItem('adminToken');

            // 2. Sending request to the backend with fetch
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/certificates/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Show the badge to the backend!
                },
                body: JSON.stringify({
                    registrationNumber: registrationNumber,
                    name: fullName,
                    course: course,
                    cgpa: cgpa,
                    correctionId: incomingCorrection?.id
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message || 'Failed to issue certificate');

            console.log('API Response:', result);
            setModalState({ isOpen: true, step: 'success', errorMsg: '' });

            // Reset Form and State
            setFormData({ firstName: '', lastName: '', registrationNumber: '', dob: '' });
            setCourse('');
            setCgpa('');
        } catch (err) {
            console.error("Issuance Error:", err);
            setModalState({ isOpen: true, step: 'error', errorMsg: err.message || 'Failed to issue' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const executeBulkIssuance = async () => {
        setBulkReport(prev => ({ ...prev, step: 'processing' }));
        try {
            const token = localStorage.getItem('adminToken');
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/certificates/bulk-issue`,
                { students: bulkReport.validStudents },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Move to success step and clean up file input
            setBulkReport(prev => ({ ...prev, step: 'success' }));
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Bulk Issuance Error:', err);
            alert(err.response?.data?.message || 'Failed to perform bulk issuance.');
            setBulkReport({ isOpen: false, step: 'preview', validStudents: [], skipped: [] });
        }
    };

    const handleBulkIssue = async () => {
        if (!file) {
            alert("Please select an Excel or CSV file first!");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Normalizing headers to match database snake_case keys (Added exact matches for new template)
                const formattedData = jsonData.map(row => ({
                    student_name: row['Student_Name'] || row['student_name'] || row['studentName'] || row['Student Name'] || row['Name'] || '',
                    registration_number: String(row['Registration_Number'] || row['registration_number'] || row['registrationNumber'] || row['student_id'] || row['Student ID'] || row['ID'] || ''),
                    program: row['program'] || row['Program'] || row['Course'] || 'B.Tech Computer Science and Engineering',
                    cgpa: String(row['cgpa'] || row['CGPA'] || row['Grade'] || '')
                }));

                // PRE-FLIGHT SAFETY CHECK: Stop the API call if critical data is missing
                const missingDataIndex = formattedData.findIndex(s => !s.student_name.trim() || !s.registration_number.trim() || !s.cgpa.trim());
                
                if (missingDataIndex !== -1) {
                    alert(`Data extraction failed near row ${missingDataIndex + 2} in your Excel sheet. Please ensure your headers are exact: Registration_Number, Student_Name, CGPA.`);
                    setIsUploading(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    return; // Abort the backend request
                }

                // 1. Query Supabase to find duplicates before doing anything
                const regNos = formattedData.map(s => s.registration_number);
                const { data: existingRecords, error } = await supabase
                    .from('certificates')
                    .select('registration_number')
                    .in('registration_number', regNos);

                if (error) {
                    alert("Failed to verify database for duplicates.");
                    setIsUploading(false);
                    return;
                }

                const existingRegNos = existingRecords.map(r => r.registration_number);
                
                // 2. Separate valid students from duplicates
                const validStudents = formattedData.filter(s => !existingRegNos.includes(s.registration_number));
                const skippedStudents = formattedData.filter(s => existingRegNos.includes(s.registration_number)).map(s => s.registration_number);

                // 3. Open Preview Modal
                setBulkReport({
                    isOpen: true,
                    step: 'preview',
                    validStudents: validStudents,
                    skipped: skippedStudents
                });
                setIsUploading(false);
            } catch (err) {
                console.error('Bulk Issuance Error:', err);
                alert(err.response?.data?.message || 'Failed to perform bulk issuance.');
            } finally {
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            alert('Error reading file!');
            setIsUploading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="min-h-screen bg-[#0a0a09] text-gray-300 font-mono flex flex-col pt-6 px-10 pb-20">

            {/* TOP NAVIGATION BAR */}
            <div className="flex items-center justify-between border-b border-[#1a1a18] pb-6 mb-12 mt-2">
                <div className="flex items-center text-white font-black text-xl tracking-widest">
                    <div className="bg-purple-600 text-black w-8 h-8 flex items-center justify-center mr-3 font-extrabold text-lg">
                        C_
                    </div>
                    <div className="flex flex-col">
                        CERTVIFY
                    </div>
                </div>

                {/* Center Links */}
                <div className="flex items-center gap-8 text-[10px] font-bold tracking-[0.15em]">
                    <span onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition-colors cursor-pointer">DASHBOARD</span>
                    <span onClick={() => navigate('/issue')} className="text-purple-500 border-b-2 border-purple-500 pb-1 cursor-pointer">ISSUE_CERT</span>
                    <span onClick={() => navigate('/')} className="text-gray-500 hover:text-white transition-colors cursor-pointer">VERIFY</span>
                    <span onClick={() => navigate('/logs')} className="text-gray-500 hover:text-white transition-colors cursor-pointer">LOGS</span>
                </div>

                {/* Right Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-[9px] font-bold tracking-widest text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                        SYSTEM_ONLINE
                    </div>
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer hover:bg-zinc-800 transition-all group p-2 rounded-md border border-[#374151]"
                    >
                        <Home className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl w-full mx-auto flex flex-col flex-1">

                {/* HEADER SECTION */}
                <div className="mb-16">
                    <div className="border-l-4 border-purple-500 pl-6">
                        <h1 className="text-4xl text-white font-black tracking-wide uppercase mb-3">
                            ISSUE NEW CERTIFICATE
                        </h1>
                    </div>
                </div>

                {/* CORRECTION BANNER */}
                {incomingCorrection && (
                    <div className="bg-orange-950/20 border border-orange-500/30 text-orange-400 p-6 rounded-sm mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-3 mb-2">
                            <Terminal className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase">CORRECTION_MODE_ACTIVE</span>
                        </div>
                        <p className="text-xs font-mono leading-relaxed opacity-80 uppercase tracking-wider">
                            Resolving request for: <span className="text-white font-bold">{incomingCorrection.corrected_reg_no || incomingCorrection.registration_number}</span>.
                            Upon issuance, the record `{incomingCorrection.id.slice(0, 8)}` will be marked as <span className="text-green-500">RESOLVED</span>.
                        </p>
                    </div>
                )}

                {/* BULK IMPORT BANNER */}
                <div className="mb-8">
                    <div
                        className="bg-[#141412] border border-[#22221e] py-8 px-8 flex items-center justify-between mb-2 cursor-pointer hover:border-gray-700 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <div className="flex items-center">
                            <div className="bg-purple-900/20 p-3 mr-6 rounded-sm border border-purple-900/30">
                                <FileTerminal className="w-8 h-8 text-purple-500" />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-white font-bold text-sm tracking-widest uppercase mb-1">
                                    Import CSV/Excel File
                                </span>
                                <span className="text-xs text-gray-500 tracking-wide font-mono">
                                    {file ? file.name : "System has capability to issue 500 certificates at a time"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleBulkIssue}
                        disabled={isUploading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-black font-bold text-xs tracking-widest uppercase py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'PROCESSING...' : 'ISSUE BULK'}
                    </button>
                </div>

                {/* MAIN FORM CONTAINER */}
                <div className="bg-[#11110f] border border-[#1a1a18] relative px-10 py-10 mb-8">
                    {/* Corner Decorators */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-purple-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-purple-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-purple-500"></div>

                    {/* Container Header */}
                    <div className="flex items-center text-white font-bold text-[13px] tracking-widest uppercase mb-10">
                        <Terminal className="w-4 h-4 text-purple-500 mr-3" strokeWidth={2.5} />
                        Student Details
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-8 mb-12">

                        {/* Row 1: Name */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">FIRST_NAME</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="ENTER_FIRST_NAME"
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">LAST_NAME</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="ENTER_LAST_NAME"
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
                                />
                            </div>
                        </div>


                        {/* Row 3: ID and DOB */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">
                                    UNIVERSITY_REGISTRATION_NUMBER
                                </label>
                                <input
                                    type="text"
                                    name="registrationNumber"
                                    value={formData.registrationNumber}
                                    onChange={handleInputChange}
                                    placeholder="REG_XXXXXXXXXXXXXXX"
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">DATE_OF_BIRTH</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="bg-black border border-[#22221e] w-full pl-12 pr-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700 appearance-none"
                                        style={{ colorScheme: 'dark' }} // Attempt to make native date picker dark
                                    />
                                    {/* Fallback mock placeholder if native doesn't look right, though type="date" handles this mostly */}
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Program and CGPA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">COURSE_DEPARTMENT</label>
                                <input
                                    type="text"
                                    value={course}
                                    readOnly
                                    placeholder="AUTO-DETECTING..."
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-purple-500 font-mono tracking-wider focus:outline-none transition-colors placeholder-gray-700 opacity-80 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">CGPA</label>
                                <input
                                    type="number"
                                    value={cgpa}
                                    onChange={(e) => setCgpa(e.target.value)}
                                    min="0"
                                    max="10"
                                    step="0.01"
                                    placeholder="e.g. 9.9"
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
                                />
                            </div>
                        </div>

                    </div>

                    {/* Container Footer (Buttons) */}
                    <div className="flex items-center justify-between mt-6">
                        <button className="text-[10px] text-gray-500 tracking-widest uppercase hover:text-gray-300 transition-colors font-bold">
                            &lt; ABORT_PROCESS
                        </button>

                        <button
                            onClick={handleProceed}
                            disabled={isSubmitting}
                            className="bg-purple-600 hover:bg-purple-500 text-black font-bold text-[11px] tracking-widest uppercase px-8 py-3.5 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'ISSUING...' : (
                                <>Issue Certificate <ChevronRight className="w-4 h-4 ml-2" strokeWidth={3} /></>
                            )}
                        </button>
                    </div>

                </div>


            </div>

            {modalState.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#050000] border border-purple-500/50 p-8 max-w-lg w-full shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
                        
                        {modalState.step === 'confirm' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-purple-500 text-xl">⚠️</span>
                                    <h3 className="text-purple-500 font-mono text-sm font-bold tracking-widest">VERIFY_DATA_INTEGRITY</h3>
                                </div>
                                <div className="text-gray-400 font-mono text-xs mb-8 space-y-2 bg-[#111] p-4 border border-zinc-800">
                                    <p><span className="text-zinc-500">NAME:</span> {formData.firstName} {formData.lastName}</p>
                                    <p><span className="text-zinc-500">REG_NO:</span> {formData.registrationNumber}</p>
                                    <p><span className="text-zinc-500">COURSE:</span> {course}</p>
                                    <p><span className="text-zinc-500">CGPA:</span> {cgpa}</p>
                                </div>
                                <p className="text-zinc-500 font-mono text-[10px] mb-6 uppercase">Are you sure you want to cryptographically sign and issue this certificate?</p>
                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setModalState({ isOpen: false, step: 'confirm', errorMsg: '' })} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors" disabled={isSubmitting}>
                                        [ CANCEL ]
                                    </button>
                                    <button onClick={executeIssuance} disabled={isSubmitting} className="px-6 py-2 bg-purple-600 text-black font-mono text-[10px] font-bold uppercase hover:bg-white transition-colors">
                                        {isSubmitting ? '[ PROCESSING... ]' : '[ CONFIRM_ISSUE ]'}
                                    </button>
                                </div>
                            </>
                        )}

                        {modalState.step === 'success' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <h3 className="text-green-500 font-mono text-sm font-bold tracking-widest">CRYPTOGRAPHIC_SIGNATURE_APPLIED</h3>
                                </div>
                                <p className="text-gray-400 font-mono text-xs leading-relaxed mb-8">
                                    The certificate has been securely issued and recorded in the database. The digital signature has been successfully generated.
                                </p>
                                <div className="flex justify-end">
                                    <button onClick={() => setModalState({ isOpen: false, step: 'confirm', errorMsg: '' })} className="px-6 py-2 bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors">
                                        [ ACKNOWLEDGE ]
                                    </button>
                                </div>
                            </>
                        )}

                        {modalState.step === 'error' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-red-500 text-xl">✕</span>
                                    <h3 className="text-red-500 font-mono text-sm font-bold tracking-widest">ISSUANCE_FAILED</h3>
                                </div>
                                <p className="text-gray-400 font-mono text-xs leading-relaxed mb-8">
                                    {modalState.errorMsg}
                                </p>
                                <div className="flex justify-end">
                                    <button onClick={() => setModalState({ isOpen: false, step: 'confirm', errorMsg: '' })} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors">
                                        [ CLOSE ]
                                    </button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}

            {bulkReport.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#050000] border border-purple-500/50 p-8 max-w-xl w-full shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-600"></div>
                        
                        {bulkReport.step === 'preview' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-purple-500 text-xl">📊</span>
                                    <h3 className="text-purple-500 font-mono text-sm font-bold tracking-widest">PRE-FLIGHT_BATCH_REPORT</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-[#111] border border-green-500/30 p-4">
                                        <p className="text-zinc-500 font-mono text-[10px] uppercase mb-1">Ready to Mint</p>
                                        <p className="text-green-400 font-mono text-2xl font-black">{bulkReport.validStudents.length}</p>
                                    </div>
                                    <div className="bg-[#111] border border-red-500/30 p-4">
                                        <p className="text-zinc-500 font-mono text-[10px] uppercase mb-1">Duplicates Detected</p>
                                        <p className="text-red-400 font-mono text-2xl font-black">{bulkReport.skipped.length}</p>
                                    </div>
                                </div>

                                {bulkReport.skipped.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-zinc-400 font-mono text-xs mb-2 uppercase tracking-wider">The following IDs will be skipped to prevent overwrites:</p>
                                        <div className="bg-black border border-zinc-800 p-3 max-h-24 overflow-y-auto font-mono text-xs text-zinc-500">
                                            <ul className="list-disc list-inside space-y-1">
                                                {bulkReport.skipped.map(regNo => (
                                                    <li key={regNo} className="text-red-400/80">{regNo}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-4">
                                    <button onClick={() => setBulkReport({ isOpen: false, step: 'preview', validStudents: [], skipped: [] })} className="px-6 py-2 border border-zinc-700 text-zinc-400 font-mono text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors">
                                        [ CANCEL ]
                                    </button>
                                    <button onClick={executeBulkIssuance} disabled={bulkReport.validStudents.length === 0} className="px-6 py-2 bg-purple-600 text-black font-mono text-[10px] font-bold uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                        [ CONFIRM_AND_ISSUE ]
                                    </button>
                                </div>
                            </>
                        )}

                        {bulkReport.step === 'processing' && (
                            <div className="py-12 flex flex-col items-center justify-center">
                                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-purple-500 font-mono text-xs tracking-widest uppercase animate-pulse">GENERATING_CRYPTOGRAPHIC_SIGNATURES...</p>
                            </div>
                        )}

                        {bulkReport.step === 'success' && (
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-green-500 text-xl">✓</span>
                                    <h3 className="text-green-500 font-mono text-sm font-bold tracking-widest">BATCH_ISSUANCE_COMPLETE</h3>
                                </div>
                                <p className="text-gray-400 font-mono text-xs leading-relaxed mb-8">
                                    Successfully minted {bulkReport.validStudents.length} new certificates. Digital signatures have been generated and secured in the registry.
                                </p>
                                <div className="flex justify-end">
                                    <button onClick={() => setBulkReport({ isOpen: false, step: 'preview', validStudents: [], skipped: [] })} className="px-6 py-2 bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase hover:bg-zinc-700 transition-colors">
                                        [ ACKNOWLEDGE ]
                                    </button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueCertificate;
