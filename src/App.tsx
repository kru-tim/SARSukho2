import React, { useState, useEffect } from 'react';

// This is a mock of google.script.run that will be available in the GAS environment
declare const google: any;

export default function App() {
  const [schoolId, setSchoolId] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; manager: string } | null>(null);
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (schoolId.length === 8) {
      setLoading(true);
      google.script.run
        .withSuccessHandler((info: any) => {
          setSchoolInfo(info);
          if (info && info.manager) {
            setManagerName(info.manager);
          }
          setLoading(false);
        })
        .withFailureHandler(() => {
          setSchoolInfo(null);
          setLoading(false);
        })
        .getSchoolInfo(schoolId);
    } else {
      setSchoolInfo(null);
    }
  }, [schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    google.script.run
      .withSuccessHandler((response: any) => {
        setStatus(response);
        setLoading(false);
        if (response.success) {
          // Reset form
          setSchoolId('');
          setSchoolInfo(null);
          setName('');
          setManagerName('');
          setPhone('');
          setEmail('');
        }
      })
      .withFailureHandler(() => {
        setStatus({ success: false, message: 'เกิดข้อผิดพลาดในการสื่อสารกับเซิร์ฟเวอร์' });
        setLoading(false);
      })
      .processRequest(schoolId, email, name, phone, managerName);
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
          <p className="text-slate-600 font-semibold mt-3 text-base">สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2</p>
          <p className="text-slate-500 mt-2 text-sm">กรอกข้อมูลเพื่อรับข้อมูลผ่านทางอีเมล</p>
        </div>

        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500 ml-1 uppercase tracking-wider">รหัส 8 หลักของโรงเรียน</label>
              <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} required maxLength={8} pattern="[0-9]{8}"
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-sm font-medium"
                placeholder="ระบุรหัส 8 หลัก" />
            </div>

            {schoolInfo && (
              <div className="animate-fade-in bg-blue-50/50 border border-blue-100 rounded-xl p-3">
                <div className="flex items-center gap-2 text-blue-700">
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
          พัฒนาโดย KITIM © 2026
        </p>
        <p className="text-xs text-slate-400 font-medium mt-2">
          ผู้ร่วมพัฒนา นายสุนทร ชมชิต ศึกษานิเทศก์<br />
          กลุ่มงานประกันคุณภาพการศึกษา กลุ่มนิเทศ ติดตามและประเมินผลการจัดการศึกษา<br />
          สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุโขทัย เขต 2
        </p>
        <p className="text-xs text-slate-400 font-medium mt-2">
          © 2026 ระบบอัตโนมัติ • ปลอดภัยและรวดเร็ว
        </p>
      </div>
    </div>
  );
}
