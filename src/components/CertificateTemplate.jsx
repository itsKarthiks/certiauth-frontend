import React from 'react';
import QRCode from 'react-qr-code';

const CertificateTemplate = ({ data }) => {
    if (!data) return null;

    // 1. Format Date to DD/MM/YYYY
    const formatDate = (dateString) => {
        if (!dateString) return 'PENDING';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formattedDate = formatDate(data.issued_at || data.created_at);

    return (
        <div className="relative w-full aspect-[16/9] bg-white overflow-hidden shadow-2xl border-4 border-white select-none">
            {/* 2. Background Template Image */}
            <img 
                src="/certificate_template.png" 
                alt="Certificate Template" 
                className="absolute inset-0 w-full h-full object-contain"
            />

            {/* 3. Data Overlays (Precise Mathematical Mapping) */}
            
            {/* Name */}
            <div className="absolute top-[56.10%] left-[22.77%] -translate-y-full text-[25px] font-serif font-bold text-slate-900">
                {data.student_name}
            </div>

            {/* Registration Number */}
            <div className="absolute top-[84.59%] left-[25.40%] -translate-y-full text-[12px] font-bold text-slate-900">
                {data.registration_number || data.student_id}
            </div>

            {/* Course Code */}
            <div className="absolute top-[84.59%] left-[40.53%] -translate-y-full text-[12px] font-bold text-slate-900">
                415
            </div>

            {/* CGPA */}
            <div className="absolute top-[84.59%] left-[55.28%] -translate-y-full text-[12px] font-bold text-slate-900">
                {data.cgpa}
            </div>

            {/* Date of Issue */}
            <div className="absolute top-[84.59%] left-[66.64%] -translate-y-full text-[12px] font-bold text-slate-900">
                {formattedDate}
            </div>

            {/* QR Code Overlay */}
            <div className="absolute top-[64.87%] left-[79.88%] w-[15.62%] aspect-square bg-white">
                <QRCode 
                    value={`${window.location.origin}/verify?id=${data.registration_number}`} 
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
            </div>
        </div>
    );
};

export default CertificateTemplate;
