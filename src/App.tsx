import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

// IMPORTANT: Replace this with your Google Apps Script Web App URL
const GOOGLE_SHEET_API_URL = 'https://script.google.com/macros/s/AKfycby77271kbzY6Q5ghUOyMk-B3qkcpyoKhX9mUZbKRdQkCE0sPk45no2gje_zMltxd_goQg/exec'; 

export default function App() {
  const [schoolId, setSchoolId] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; manager: string } | null>(null);
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (schoolId.length === 8 && GOOGLE_SHEET_API_URL) {
      setIsChecking(true);
      fetch(`${GOOGLE_SHEET_API_URL}?action=getSchoolInfo&schoolId=${schoolId}`)
        .then(res => res.json())
        .then((info: any) => {
          setSchoolInfo(info);
          if (info && info.manager) {
            setManagerName(info.manager);
          }
          setIsChecking(false);
        })
        .catch(() => {
          setSchoolInfo(null);
          setIsChecking(false);
        });
    } else {
      setSchoolInfo(null);
      setIsChecking(false);
    }
  }, [schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!GOOGLE_SHEET_API_URL) {
      setStatus({ success: false, message: 'กรุณาตั้งค่า Web App URL ในโค้ดก่อนใช้งาน' });
      return;
    }
    
    setLoading(true);
    setStatus(null);

    const formData = {
      schoolId,
      email,
      name,
      phone,
      managerName,
    };

    fetch(GOOGLE_SHEET_API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'processRequest', data: formData })
    })
    .then(() => {
      setLoading(false);
      
      // Success Alert with SweetAlert2
      Swal.fire({
        title: 'ส่งคำขอสำเร็จ!',
        text: 'ระบบได้ส่งข้อมูลไปยังอีเมลของท่านแล้ว กรุณาตรวจสอบอีเมล',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        willClose: () => {
          // Reset form after alert closes
          setSchoolId('');
          setSchoolInfo(null);
          setName('');
          setManagerName('');
          setPhone('');
          setEmail('');
          setStatus(null);
        }
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      setStatus({ success: false, message: 'เกิดข้อผิดพลาดในการส่งข้อมูล' });
      setLoading(false);
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-3xl"></div>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 animate-fade-in">
        <div className="pt-10 pb-6 px-8 text-center">
          <div className="flex justify-center mb-6 space-x-4">
            <img src="https://www.kruchiangrai.net/wp-content/uploads/2024/02/%E0%B8%AA%E0%B8%9E%E0%B8%90.1-%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B8%82%E0%B8%B2%E0%B8%A7.webp" alt="OBEC Logo" className="h-20 w-auto drop-shadow-md animate-fade-in" />
            <img src="https://img2.pic.in.th/unnamed-5.png" alt="Sukhothai 2 Logo" className="h-20 w-auto drop-shadow-md animate-fade-in delay-100" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ระบบขอรับ Username & Password</h1>
          <p className="text-slate-500 mt-2 text-sm">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2</p>
          <p className="text-slate-500 mt-2 text-sm">กรอกข้อมูลเพื่อรับข้อมูลผ่านทางอีเมล</p>
        </div>

        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">รหัส 8 หลักของโรงเรียน</label>
              <div className="relative">
                <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required maxLength={8} pattern="[0-9]{8}"
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                  placeholder="ระบุรหัส 8 หลัก" />
                {isChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span className="text-[10px] font-bold">กำลังตรวจสอบ...</span>
                  </div>
                )}
              </div>
            </div>

            {schoolInfo && (
              <div className="animate-fade-in bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <span className="text-xs font-bold">{schoolInfo.name}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">ชื่อผู้ขอ</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                placeholder="ระบุชื่อ-นามสกุล" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">ผู้อำนวยการโรงเรียน</label>
              <input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                placeholder="ระบุชื่อผู้อำนวยการ" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">เบอร์โทร</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                placeholder="ระบุเบอร์โทรศัพท์" />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">อีเมลผู้รับ</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                placeholder="name@example.com" />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'กำลังส่ง...' : 'ส่งคำขอข้อมูล'}
                  {!loading && <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
                </span>
              </button>
            </div>
          </form>

          {status && (
            <div className={`mt-6 p-4 rounded-xl border ${status.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <p className="font-bold text-sm">{status.success ? 'สำเร็จ' : 'ผิดพลาด'}</p>
              <p className="text-sm mt-1">{status.message}</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center px-4">
        <p className="text-xs text-slate-500 font-medium">
          พัฒนาโดย KITIM © 2026 ผู้ร่วมพัฒนา นายสุนทร ชมชิต ศึกษานิเทศก์<br />
          กลุ่มงานประกันคุณภาพการศึกษา กลุ่มนิเทศ ติดตามและประเมินผลการจัดการศึกษา สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2 © 2026 ระบบอัตโนมัติ • ปลอดภัยและรวดเร็ว
        </p>
      </div>
    </div>
  );
}
