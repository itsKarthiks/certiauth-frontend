import React, { useState, useRef } from 'react';
import {
    Terminal,
    AtSign,
    Calendar,
    FileTerminal,
    ChevronRight,
    ChevronLeft,
    Home
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const IssueCertificate = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        dob: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [program, setProgram] = useState('');
    const [cgpa, setCgpa] = useState('');

    // Bulk Issuance State
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProceed = async () => {
        setIsSubmitting(true);
        const { firstName, lastName, studentId } = formData;

        if (!firstName || !lastName || !studentId || !program || !cgpa) {
            alert("Please fill out all required fields (Name, ID, Program, CGPA)!");
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const payload = {
                student_name: `${firstName} ${lastName}`.trim(),
                student_id: studentId,
                program: program,
                cgpa: cgpa
            };
            const response = await axios.post(
                'http://localhost:5000/api/certificates/issue',
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Certificate Issued Successfully!', response.data);
            alert('Certificate Issued Successfully!');
            setFormData({ firstName: '', lastName: '', email: '', studentId: '', dob: '' });
            setProgram('');
            setCgpa('');
        } catch (err) {
            console.error('Error issuing certificate:', err);
            alert('Error issuing certificate!');
        } finally {
            setIsSubmitting(false);
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

                // Normalizing headers to match database snake_case keys
                const formattedData = jsonData.map(row => ({
                    student_name: row['student_name'] || row['studentName'] || row['Student Name'] || row['student name'] || row['Name'] || '',
                    student_id: String(row['student_id'] || row['studentId'] || row['Student ID'] || row['student id'] || row['ID'] || ''),
                    program: row['program'] || row['Program'] || row['Course'] || 'B.Tech Computer Science and Engineering',
                    cgpa: String(row['cgpa'] || row['CGPA'] || row['Grade'] || '')
                }));

                const token = localStorage.getItem('adminToken');
                const response = await axios.post(
                    'http://localhost:5000/api/certificates/bulk-issue',
                    { students: formattedData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                alert(response.data.message || 'Bulk issuance complete!');
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
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
                    <div className="bg-yellow-500 text-black w-8 h-8 flex items-center justify-center mr-3 font-extrabold text-lg">
                        C_
                    </div>
                    <div className="flex flex-col">
                        CERTVIFY
                    </div>
                </div>

                {/* Center Links */}
                <div className="flex items-center gap-8 text-[10px] font-bold tracking-[0.15em]">
                    <span onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-white transition-colors cursor-pointer">DASHBOARD</span>
                    <span onClick={() => navigate('/issue')} className="text-yellow-500 border-b-2 border-yellow-500 pb-1 cursor-pointer">ISSUE_CERT</span>
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
                    <div className="border-l-4 border-yellow-500 pl-6">
                        <h1 className="text-4xl text-white font-black tracking-wide uppercase mb-3">
                            ISSUE NEW CERTIFICATE
                        </h1>
                    </div>
                </div>

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
                            <div className="bg-yellow-900/20 p-3 mr-6 rounded-sm border border-yellow-900/30">
                                <FileTerminal className="w-8 h-8 text-yellow-600" />
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
                        className="w-full bg-[#facc15] hover:bg-yellow-400 text-black font-bold text-xs tracking-widest uppercase py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'PROCESSING...' : 'ISSUE BULK'}
                    </button>
                </div>

                {/* MAIN FORM CONTAINER */}
                <div className="bg-[#11110f] border border-[#1a1a18] relative px-10 py-10 mb-8">
                    {/* Corner Decorators */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-yellow-500"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-yellow-500"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-yellow-500"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-yellow-500"></div>

                    {/* Container Header */}
                    <div className="flex items-center text-white font-bold text-[13px] tracking-widest uppercase mb-10">
                        <Terminal className="w-4 h-4 text-yellow-500 mr-3" strokeWidth={2.5} />
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

                        {/* Row 2: Email */}
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-600">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="USER@DOMAIN.COM"
                                    className="bg-black border border-[#22221e] w-full pl-12 pr-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
                                />
                            </div>
                        </div>

                        {/* Row 3: ID and DOB */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">
                                    STUDENT_ID
                                </label>
                                <input
                                    type="text"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    placeholder="ID_XXXXXXXXXXXXXXX"
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
                                <label className="text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-2">PROGRAM</label>
                                <input
                                    type="text"
                                    value={program}
                                    onChange={(e) => setProgram(e.target.value)}
                                    placeholder="e.g. B.Tech Computer Science"
                                    className="bg-black border border-[#22221e] px-4 py-3 text-xs text-gray-300 font-mono tracking-wider focus:outline-none focus:border-gray-500 transition-colors placeholder-gray-700"
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
                            className="bg-[#facc15] hover:bg-yellow-400 text-black font-bold text-[11px] tracking-widest uppercase px-8 py-3.5 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'ISSUING...' : (
                                <>Issue Certificate <ChevronRight className="w-4 h-4 ml-2" strokeWidth={3} /></>
                            )}
                        </button>
                    </div>

                </div>


            </div>
        </div>
    );
};

export default IssueCertificate;
