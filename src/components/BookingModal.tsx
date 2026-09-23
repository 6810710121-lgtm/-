import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Award, CheckCircle2, ShieldAlert, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { User } from 'firebase/auth';
import { Activity, Booking, FACULTIES } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface BookingModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  onSubmitBooking: (bookingData: Omit<Booking, 'id' | 'bookedAt'>) => Promise<boolean>;
  isSubmitting: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  activity,
  isOpen,
  onClose,
  user,
  onLogin,
  onSubmitBooking,
  isSubmitting
}) => {
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState(FACULTIES[0]);
  const [major, setMajor] = useState('');
  const [yearLevel, setYearLevel] = useState('ชั้นปีที่ 1');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isProxyBooking, setIsProxyBooking] = useState(false);
  const [proxyReason, setProxyReason] = useState('');
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Autofill user info if logged in
  useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if (user.displayName && !firstName && !lastName) {
        const parts = user.displayName.trim().split(' ');
        if (parts.length >= 2) {
          setFirstName(parts[0]);
          setLastName(parts.slice(1).join(' '));
        } else {
          setFirstName(user.displayName);
        }
      }
    }
  }, [user]);

  if (!isOpen || !activity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentId.trim() || studentId.trim().length < 8) {
      setErrorMessage('กรุณากรอกรหัสนิสิตให้ถูกต้อง (อย่างน้อย 8 หลัก)');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('กรุณากรอกชื่อและนามสกุลให้ครบถ้วน');
      return;
    }
    if (!major.trim()) {
      setErrorMessage('กรุณาระบุสาขาวิชา');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์สำหรับติดต่อ');
      return;
    }
    if (!confirmAccuracy) {
      setErrorMessage('กรุณาทำเครื่องหมายรับรองว่าข้อมูลถูกต้องและยอมรับเงื่อนไข');
      return;
    }

    const success = await onSubmitBooking({
      activityId: activity.id,
      activityTitle: activity.title,
      studentId: studentId.trim(),
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      faculty,
      major: major.trim(),
      yearLevel,
      phone: phone.trim(),
      email: email.trim() || user?.email || '',
      bookedByEmail: user?.email || 'Guest',
      bookedByName: user?.displayName || 'Anonymous',
      isProxyBooking,
      notes: isProxyBooking ? proxyReason : undefined,
      activityDate: activity.startDate,
      activityHours: activity.activityHours
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header with gradient */}
        <div className={`p-6 bg-gradient-to-r ${activity.bannerGradient} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
            <span>แบบฟอร์มลงทะเบียนจองกิจกรรม</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>{activity.activityHours} หน่วยชั่วโมง</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold leading-snug pr-8">
            {activity.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/90">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activity.startDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{activity.startTime} - {activity.endTime} น.</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[200px]">{activity.location}</span>
            </span>
          </div>
        </div>

        {/* Auth prompt if not signed in */}
        {!user && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-xs text-amber-900">
                <p className="font-semibold">เข้าสู่ระบบเพื่อบันทึกลง Google Sheets อัตโนมัติ</p>
                <p className="text-amber-700">ระบบจะช่วยกรอกข้อมูลและบันทึกประวัติการจองลงในบัญชี Google ของคุณ</p>
              </div>
            </div>
            <GoogleSignInButton onClick={onLogin} text="เข้าสู่ระบบด้วย Google" className="text-xs h-9 shrink-0" />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Proxy booking toggle (Anti-proxy detection feature from tsumakneema) */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-blue-950 flex items-center space-x-1.5 cursor-pointer">
                  <span>ระบบตรวจสอบการจองแทน (Proxy Booking Check)</span>
                </label>
                <p className="text-[11px] text-blue-700">
                  คุณกำลังทำการจองกิจกรรมนี้ให้ผู้อื่น หรือจองให้ตนเอง?
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isProxyBooking}
                  onChange={(e) => setIsProxyBooking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {isProxyBooking && (
              <div className="pt-2 border-t border-blue-200/60 space-y-2">
                <div className="text-xs text-indigo-900 font-semibold flex items-center space-x-1">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>บันทึกข้อมูลการจองแทนเพื่อน:</span>
                </div>
                <input
                  type="text"
                  placeholder="ระบุเหตุผลในการจองแทน (เช่น ติดสอบ, เพื่อนไม่มีอุปกรณ์, ฯลฯ)"
                  value={proxyReason}
                  onChange={(e) => setProxyReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-white focus:outline-blue-500"
                />
                <p className="text-[10px] text-indigo-700">
                  * อีเมลบัญชีของคุณ ({user?.email || 'Guest'}) จะถูกบันทึกเป็นผู้ทำรายการจองแทน เพื่อความโปร่งใส
                </p>
              </div>
            )}
          </div>

          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คำนำหน้า <span className="text-rose-500">*</span>
              </label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
              >
                <option value="นาย">นาย</option>
                <option value="นางสาว">นางสาว</option>
                <option value="นาง">นาง</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชื่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="เช่น ชานนท์"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="เช่น กอบบุญ"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                รหัสนิสิต (8-10 หลัก) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="เช่น 6610110023"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                ชั้นปี <span className="text-rose-500">*</span>
              </label>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
              >
                <option value="ชั้นปีที่ 1">ชั้นปีที่ 1</option>
                <option value="ชั้นปีที่ 2">ชั้นปีที่ 2</option>
                <option value="ชั้นปีที่ 3">ชั้นปีที่ 3</option>
                <option value="ชั้นปีที่ 4">ชั้นปีที่ 4</option>
                <option value="บัณฑิตศึกษา">บัณฑิตศึกษา</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                คณะที่สังกัด <span className="text-rose-500">*</span>
              </label>
              <select
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 bg-white truncate"
              >
                {FACULTIES.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                สาขาวิชา <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="เช่น วิทยาการคอมพิวเตอร์"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 0812345678"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                อีเมลนิสิต
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="เช่น student@tsu.ac.th"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Sync Sheets Notification badge */}
          {user && (
            <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>ข้อมูลการจองนี้จะถูกซิงค์และบันทึกลงใน Google Sheets บัญชีของคุณทันที</span>
            </div>
          )}

          {/* Agreement Checkbox */}
          <div className="pt-2">
            <label className="flex items-start space-x-2 cursor-pointer text-xs text-slate-600">
              <input
                type="checkbox"
                checked={confirmAccuracy}
                onChange={(e) => setConfirmAccuracy(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>
                ข้าพเจ้าขอรับรองว่าข้อมูลดังกล่าวเป็นความจริงทุกประการ และจะเข้าร่วมกิจกรรมตามวันเวลาที่กำหนด
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-md shadow-blue-500/25 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึกการจอง...' : 'ยืนยันการจองกิจกรรม'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
