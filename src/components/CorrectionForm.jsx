import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
    CheckSquare, 
    Square, 
    Terminal,
    User,
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';

const FormRow = ({ id, label, placeholder, isSelected, fieldType = "text", value, onToggle, onChange }) => {
    const isCgpa = id === 'cgpa';
    
    return (
        <div className={`mb-4 transition-all duration-300 ${isSelected && isCgpa ? 'border border-yellow-500/30 bg-yellow-500/5 p-6' : ''}`}>
            <div 
                className="flex items-center gap-4 cursor-pointer group select-none"
                onClick={() => onToggle(id)}
            >
                <div className="flex-shrink-0">
                    {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.2)]" />
                    ) : (
                        <Square className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                    )}
                </div>
                <span className={`text-xs font-black tracking-widest uppercase transition-colors ${isSelected ? 'text-white' : 'text-zinc-600'}`}>
                    {label.replace('_', ' ')}
                </span>
            </div>

            {isSelected && (
                <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <input 
                        type={fieldType}
                        value={value}
                        onChange={(e) => onChange(id, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-black border border-zinc-800 text-white p-4 text-xs font-mono outline-none focus:border-yellow-500/50 transition-colors placeholder:text-zinc-800 tracking-wider`}
                    />
                    {isCgpa && (
                        <div className="mt-2 text-[9px] text-yellow-600 font-bold uppercase tracking-tighter">
                            [ SYSTEM_NOTICE: ENTER_EXACT_CGPA_POST_REV_MATCH ]
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const CorrectionForm = ({ certData: propCertData }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [certData, setCertData] = useState(propCertData || location.state?.certData || location.state?.studentData || null);

    const [selections, setSelections] = useState({
        name: false,
        regNo: false,
        cgpa: false
    });
    const [corrections, setCorrections] = useState({
        name: '',
        regNo: '',
        cgpa: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [authUserEmail, setAuthUserEmail] = useState('');

    useEffect(() => {
        const fetchStudentData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setAuthUserEmail(user.email);

                if (!certData) {
                    const { data: prof } = await supabase.from('profiles').select('registration_number').eq('id', user.id).single();
                    if (prof?.registration_number) {
                        const { data: cert } = await supabase.from('certificates').select('*').eq('registration_number', prof.registration_number).single();
                        if (cert) {
                            setCertData(cert);
                        }
                    }
                }
            }
        };
        fetchStudentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const studentEmail = certData?.email || certData?.student_email || authUserEmail || 'UNKNOWN_EMAIL';

    const toggleSelection = (field) => {
        setSelections(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (field, value) => {
        setCorrections(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitCorrection = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('correction_requests')
                .insert([{
                    original_reg_no: certData?.registration_number,
                    student_email: studentEmail,
                    corrected_name: selections.name ? corrections.name : null,
                    corrected_reg_no: selections.regNo ? corrections.regNo : null,
                    corrected_cgpa: selections.cgpa ? corrections.cgpa : null
                }]);

            if (error) throw error;

            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Failed to submit correction request: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // FormRow decoupled from this component to prevent unnecessary remounting on typing

    return (
        <div className="min-h-screen bg-[#0a0a09] text-zinc-400 font-mono flex flex-col items-center relative overflow-hidden">

            {/* --- HEADER --- */}
            <header className="w-full border-b border-zinc-800/50 bg-[#0a0a09] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/student-portal')}>
                    <div className="w-10 h-10 bg-[#facc15] flex items-center justify-center font-black text-black text-xl shadow-[0_0_15px_rgba(250,204,21,0.2)]">
                        C_
                    </div>
                    <div>
                        <h1 className="text-white font-black leading-none tracking-[0.2em] text-lg uppercase">CERTVIFY</h1>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em] mt-1 uppercase">ERROR_REPORT_MODULE</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-zinc-200 font-bold text-xs tracking-wider uppercase">
                            {certData?.student_name || 'UNKNOWN_STUDENT'}
                        </span>
                        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">
                            {certData?.course || certData?.program || 'UNKNOWN_PROGRAM'}
                        </span>
                    </div>
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center border-yellow-500/20">
                        <User className="w-5 h-5 text-zinc-500" />
                    </div>
                </div>
            </header>

            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-500 blur-[120px]"></div>
            </div>

            <div className="w-full max-w-2xl relative z-10 p-6 sm:p-12">
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-4 flex items-center gap-4">
                        <ShieldAlert className="w-8 h-8 text-yellow-500" />
                        Report Document Error
                    </h2>
                    <p className="text-zinc-500 text-xs tracking-widest leading-relaxed uppercase font-bold">
                        Submitting this form will alert the <span className="text-yellow-500 border-b border-yellow-500/30 pb-0.5">Certvify Registrar Module.</span> Your current certificate draft will be suspended pending manual verification and re-sync.
                    </p>
                </div>

                <div className="bg-[#0f0f0e] border border-zinc-800/50 p-1 rounded-sm shadow-2xl">
                    <div className="bg-[#0f0f0e] border border-zinc-800/30 p-10">
                        {!isSubmitted ? (
                            <>
                                <div className="flex items-center gap-3 mb-10 pb-4 border-b border-zinc-800/30">
                                    <Terminal className="w-4 h-4 text-yellow-500" />
                                    <span className="text-[10px] text-zinc-600 font-black tracking-[0.4em] uppercase">ERROR_FLAG_PARAMETERS</span>
                                </div>

                                <form onSubmit={handleSubmitCorrection}>
                                    <FormRow 
                                        id="name" 
                                        label="FULL_NAME_CORRECTION" 
                                        placeholder="ENTER_EXACT_LEGAL_SPELLING" 
                                        isSelected={selections.name}
                                        value={corrections.name}
                                        onToggle={toggleSelection}
                                        onChange={handleInputChange}
                                    />
                                    <FormRow 
                                        id="regNo" 
                                        label="REGISTRATION_NUMBER" 
                                        placeholder="ENTER_VALID_REG_ID_FORMAT" 
                                        isSelected={selections.regNo}
                                        value={corrections.regNo}
                                        onToggle={toggleSelection}
                                        onChange={handleInputChange}
                                    />

                                    <FormRow 
                                        id="cgpa" 
                                        label="CUMULATIVE_GPA" 
                                        placeholder="ENTER_8.XX_FORMAT" 
                                        isSelected={selections.cgpa}
                                        fieldType="number"
                                        value={corrections.cgpa}
                                        onToggle={toggleSelection}
                                        onChange={handleInputChange}
                                    />

                                    <div className="flex gap-6 mt-12">
                                        <button 
                                            type="button"
                                            onClick={() => navigate('/verify-draft')}
                                            disabled={isSubmitting}
                                            className="w-1/2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-white font-black text-[10px] tracking-[0.4em] uppercase py-5 transition-all outline-none disabled:opacity-50"
                                        >
                                            [ ABORT_PROCESS ]
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-1/2 bg-[#facc15] hover:bg-yellow-400 disabled:bg-yellow-900/50 text-black font-black text-[10px] tracking-[0.4em] uppercase py-5 transition-all shadow-[0_0_20px_rgba(250,204,21,0.1)] active:scale-[0.98] outline-none"
                                        >
                                            {isSubmitting ? 'SUBMITTING...' : 'SUBMIT_TO_ADMIN'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center py-12 animate-in fade-in zoom-in duration-500 text-center">
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-8">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-black text-white tracking-widest uppercase mb-4">
                                    Correction Request Submitted.
                                </h3>
                                <p className="text-zinc-500 text-[10px] tracking-[0.2em] font-bold uppercase max-w-sm mb-12 leading-relaxed">
                                    The Registrar has been notified. You will receive an email once your draft is updated.
                                </p>
                                <button 
                                    onClick={() => navigate('/student-portal')}
                                    className="px-12 bg-white hover:bg-zinc-200 text-black font-black text-[10px] tracking-[0.4em] uppercase py-5 transition-all active:scale-[0.98] outline-none"
                                >
                                    [ RETURN TO DASHBOARD ]
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-center items-center gap-4 text-[9px] text-zinc-700 font-black tracking-[0.3em] uppercase">
                    <span>SYS_ID: REG-DOC-7729</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                    <span>TIMESTAMP: MARCH_2026_UTC</span>
                </div>
            </div>
        </div>
    );
};

export default CorrectionForm;
