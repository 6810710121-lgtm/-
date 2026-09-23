import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Users,
  Award,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  Eye,
  Check,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Activity, Booking, FACULTIES, CATEGORIES } from '../types';
import { User } from 'firebase/auth';

interface AdminTabProps {
  activities: Activity[];
  bookings: Booking[];
  user: User | null;
  spreadsheetUrl?: string | null;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onToggleCloseActivity: (activityId: string) => void;
  onToggleCheckIn: (bookingId: string) => void;
  onCancelBooking: (bookingId: string) => Promise<void>;
  onResetData: () => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  activities,
  bookings,
  user,
  spreadsheetUrl,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onToggleCloseActivity,
  onToggleCheckIn,
  onCancelBooking,
  onResetData,
  isAdmin,
  setIsAdmin
}) => {
  const [adminSubTab, setAdminSubTab] = useState<'activities' | 'registrations' | 'proxy-audit' | 'settings'>('activities');

  // Registration Filter States
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');
  const [selectedAttendanceFilter, setSelectedAttendanceFilter] = useState<'all' | 'checkedIn' | 'notCheckedIn'>('all');
  const [selectedProxyFilter, setSelectedProxyFilter] = useState<'all' | 'self' | 'proxy'>('all');

  // Filtered Bookings for Table
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.studentId.includes(regSearchTerm) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
      b.activityTitle.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
      (b.bookedByEmail || '').toLowerCase().includes(regSearchTerm.toLowerCase());

    const matchesActivity = selectedActivityFilter === 'all' || b.activityId === selectedActivityFilter;
    const matchesFaculty = selectedFacultyFilter === 'all' || b.faculty === selectedFacultyFilter;
    const matchesAttendance =
      selectedAttendanceFilter === 'all' ||
      (selectedAttendanceFilter === 'checkedIn' && b.checkedIn) ||
      (selectedAttendanceFilter === 'notCheckedIn' && !b.checkedIn);
    const matchesProxy =
      selectedProxyFilter === 'all' ||
      (selectedProxyFilter === 'self' && !b.isProxyBooking) ||
      (selectedProxyFilter === 'proxy' && b.isProxyBooking);

    return matchesSearch && matchesActivity && matchesFaculty && matchesAttendance && matchesProxy;
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'รหัสการจอง',
      'รหัสนิสิต',
      'คำนำหน้า',
      'ชื่อ',
      'นามสกุล',
      'คณะ',
      'สาขาวิชา',
      'ชั้นปี',
      'เบอร์โทรศัพท์',
      'อีเมล',
      'รหัสกิจกรรม',
      'ชื่อกิจกรรม',
      'วันที่จัด',
      'ชั่วโมงกิจกรรม',
      'สถานะการจอง',
      'ผู้ทำรายการ',
      'เหตุผลจองแทน',
      'สถานะเช็คอิน',
      'เวลาเช็คอิน',
      'เวลาที่บันทึก'
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${b.studentId}"`,
      `"${b.prefix}"`,
      `"${b.firstName}"`,
      `"${b.lastName}"`,
      `"${b.faculty}"`,
      `"${b.major}"`,
      `"${b.yearLevel}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.activityId}"`,
      `"${b.activityTitle.replace(/"/g, '""')}"`,
      `"${b.activityDate}"`,
      `"${b.activityHours}"`,
      `"${b.isProxyBooking ? 'จองแทน' : 'จองด้วยตนเอง'}"`,
      `"${b.bookedByEmail || '-'}"`,
      `"${(b.notes || '-').replace(/"/g, '""')}"`,
      `"${b.checkedIn ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน'}"`,
      `"${b.checkedInAt || '-'}"`,
      `"${b.bookedAt}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TSU_Activity_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not admin, show unlock view
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">เข้าถึงแผงควบคุมผู้ดูแลระบบ</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          ส่วนนี้สำหรับเจ้าหน้าที่และผู้ประสานงานกิจกรรมพัฒนานิสิต เพื่อจัดการกิจกรรม เช็คชื่อผู้เข้าร่วม และตรวจความถูกต้อง
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setIsAdmin(true)}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <Unlock className="w-4 h-4" />
            <span>เข้าสู่โหมดผู้ดูแลระบบ (Admin Access)</span>
          </button>
          <div className="text-[11px] text-slate-400">
            ระบบรองรับสิทธิ์ผู้ดูแลระบบสำหรับ: {user?.email || 'cgobbun@gmail.com'}
          </div>
        </div>
      </div>
    );
  }

  // Count attendance stats
  const totalCheckedIn = bookings.filter((b) => b.checkedIn).length;
  const totalProxy = bookings.filter((b) => b.isProxyBooking).length;

  return (
    <div className="space-y-6">
      {/* Admin Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              สิทธิ์ผู้ดูแลระบบ ({user?.email || 'cgobbun@gmail.com'})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            ระบบจัดการกิจกรรมและเช็คชื่อเข้าร่วม (ผู้ดูแลระบบ)
          </h2>
          <p className="text-xs text-slate-400">
            เพิ่ม/แก้ไขกิจกรรม, เช็คชื่อนิสิต, ตรวจสอบการจองแทน, และซิงค์ข้อมูลกับ Google Sheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center space-x-1.5 transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>เปิด Google Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <button
            onClick={() => setIsAdmin(false)}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
          >
            ออกจากโหมด Admin
          </button>
        </div>
      </div>

      {/* Admin Subtabs Navigation */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setAdminSubTab('activities')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            adminSubTab === 'activities'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          จัดการกิจกรรม ({activities.length})
        </button>
        <button
          onClick={() => setAdminSubTab('registrations')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            adminSubTab === 'registrations'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          รายชื่อผู้ลงทะเบียน & เช็คชื่อ ({bookings.length})
        </button>
        <button
          onClick={() => setAdminSubTab('proxy-audit')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            adminSubTab === 'proxy-audit'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ตรวจสอบการจองแทน ({totalProxy})
        </button>
        <button
          onClick={() => setAdminSubTab('settings')}
          className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${
            adminSubTab === 'settings'
              ? 'bg-blue-600 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          การตั้งค่า & ข้อมูลระบบ
        </button>
      </div>

      {/* ================= SUBTAB 1: ACTIVITIES MANAGEMENT ================= */}
      {adminSubTab === 'activities' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">รายการกิจกรรมทั้งหมดในระบบ</h3>
              <p className="text-xs text-slate-500">
                สามารถเพิ่มกิจกรรมใหม่ แก้ไขข้อมูล ปรับจำนวนที่นั่ง หรือปิดรับสมัครได้
              </p>
            </div>

            <button
              onClick={onAddActivity}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างกิจกรรมใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((activity) => {
              const seatsLeft = Math.max(0, activity.maxSeats - activity.enrolledCount);
              const percent = Math.min(100, Math.round((activity.enrolledCount / activity.maxSeats) * 100));

              return (
                <div
                  key={activity.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400 font-semibold">{activity.id}</span>
                      <div className="flex items-center space-x-1.5">
                        {activity.isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            ยอดนิยม
                          </span>
                        )}
                        {activity.isClosed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            ปิดรับแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            เปิดรับสมัคร
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {activity.title}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{activity.startDate} ({activity.startTime} - {activity.endTime} น.)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{activity.activityHours} ชม. • {activity.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>จองแล้ว {activity.enrolledCount}/{activity.maxSeats} ที่</span>
                        <span className="font-semibold">{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            activity.isClosed || seatsLeft === 0 ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onToggleCloseActivity(activity.id)}
                      className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                        activity.isClosed
                          ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      {activity.isClosed ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="แก้ไขข้อมูลกิจกรรม"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="ลบกิจกรรม"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SUBTAB 2: REGISTRATIONS & ATTENDANCE ================= */}
      {adminSubTab === 'registrations' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500">ยอดจองที่นั่งทั้งหมด</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{bookings.length} คน</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-emerald-600">เช็คชื่อเข้าร่วมกิจกรรมแล้ว</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {totalCheckedIn} คน{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({bookings.length > 0 ? Math.round((totalCheckedIn / bookings.length) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-amber-600">ยังไม่ได้รับการเช็คชื่อ</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {bookings.length - totalCheckedIn} คน
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหารหัสนิสิต, ชื่อ, กิจกรรม, อีเมล..."
                  value={regSearchTerm}
                  onChange={(e) => setRegSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                  title="ดาวน์โหลดรายชื่อเป็นไฟล์ Excel/CSV"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>ส่งออก CSV ({filteredBookings.length})</span>
                </button>
              </div>
            </div>

            {/* Sub Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">กิจกรรม:</label>
                <select
                  value={selectedActivityFilter}
                  onChange={(e) => setSelectedActivityFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white truncate"
                >
                  <option value="all">ทุกกิจกรรม ({activities.length})</option>
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">คณะ:</label>
                <select
                  value={selectedFacultyFilter}
                  onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white truncate"
                >
                  <option value="all">ทุกคณะ</option>
                  {FACULTIES.map((fac) => (
                    <option key={fac} value={fac}>
                      {fac}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">สถานะเช็คชื่อ:</label>
                <select
                  value={selectedAttendanceFilter}
                  onChange={(e) => setSelectedAttendanceFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="checkedIn">เช็คชื่อแล้ว</option>
                  <option value="notCheckedIn">ยังไม่เช็คชื่อ</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ประเภทการจอง:</label>
                <select
                  value={selectedProxyFilter}
                  onChange={(e) => setSelectedProxyFilter(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="self">จองด้วยตนเอง</option>
                  <option value="proxy">จองแทนผู้อื่น</option>
                </select>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">รหัสจอง / วันที่</th>
                    <th className="py-3 px-3">นิสิตผู้เข้าร่วม</th>
                    <th className="py-3 px-3">คณะ / สาขา</th>
                    <th className="py-3 px-3">กิจกรรม</th>
                    <th className="py-3 px-3">การจอง</th>
                    <th className="py-3 px-3 text-center">เช็คชื่อ (Attendance)</th>
                    <th className="py-3 px-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        ไม่พบข้อมูลตามเงื่อนไขที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">{b.id}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(b.bookedAt).toLocaleString('th-TH', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">
                            {b.prefix}{b.firstName} {b.lastName}
                          </div>
                          <div className="font-mono text-[11px] text-blue-600 font-medium">
                            {b.studentId}
                          </div>
                          <div className="text-[10px] text-slate-400">โทร: {b.phone}</div>
                        </td>

                        <td className="py-3 px-3 max-w-[180px]">
                          <div className="truncate font-medium text-slate-800">{b.faculty}</div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {b.major} ({b.yearLevel})
                          </div>
                        </td>

                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-medium text-slate-900 truncate">
                            {b.activityTitle}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            +{b.activityHours} ชม. • วันที่ {b.activityDate}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {b.isProxyBooking ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                จองแทน
                              </span>
                              {b.notes && (
                                <div className="text-[10px] text-amber-700 mt-0.5 truncate max-w-[120px]" title={b.notes}>
                                  {b.notes}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              จองเอง
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => onToggleCheckIn(b.id)}
                            className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-1 mx-auto transition cursor-pointer ${
                              b.checkedIn
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700'
                            }`}
                          >
                            {b.checkedIn ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>เช็คชื่อแล้ว</span>
                              </>
                            ) : (
                              <span>กดเช็คชื่อ</span>
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onCancelBooking(b.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="ยกเลิกการจองนิสิตนี้ (คืนที่นั่ง)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 3: PROXY AUDIT ================= */}
      {adminSubTab === 'proxy-audit' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>การตรวจสอบความโปร่งใสและพฤติกรรมการจองแทน (Anti-Proxy Audit)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              วิเคราะห์บัญชีผู้ใช้งานที่ทำการลงทะเบียนแทนเพื่อน เพื่อให้มั่นใจว่าไม่มีการนำสิทธิ์ไปแสวงหาผลประโยชน์
              หรือจองซ้อนเพื่อกั๊กที่นั่งให้บุคคลภายนอก
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                สรุปสัดส่วนการจอง
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">การจองด้วยตนเอง (Self-Booking)</span>
                  <span className="font-bold text-emerald-600">
                    {bookings.length - totalProxy} รายการ
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">การจองแทนเพื่อน (Proxy Booking)</span>
                  <span className="font-bold text-amber-600">{totalProxy} รายการ</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">อัตราส่วนการจองแทน</span>
                  <span className="font-bold text-slate-800">
                    {bookings.length > 0 ? Math.round((totalProxy / bookings.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                มาตรการป้องกันความผิดปกติ
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                <li>บันทึกอีเมลผู้ทำรายการจริงผ่าน Google Account ทุกครั้ง</li>
                <li>จำกัดรหัสนิสิต 1 คน สามารถจองได้ไม่เกิน 1 ครั้งต่อ 1 กิจกรรม</li>
                <li>แสดงเหตุผลการจองแทนบน Google Sheets ให้ผู้รับผิดชอบตรวจสอบได้</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUBTAB 4: SETTINGS & RESET ================= */}
      {adminSubTab === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-base">การจัดการข้อมูลระบบ (System Maintenance)</h3>
            <p className="text-xs text-slate-500">
              ฟังก์ชันสำหรับผู้ดูแลระบบในการรีเซ็ตข้อมูลตัวอย่าง หรือปรับค่าเริ่มต้น
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-slate-800">รีเซ็ตข้อมูลกิจกรรมและยอดจอง</div>
                <div className="text-[11px] text-slate-500">
                  คืนค่ากิจกรรมเริ่มต้น 8 รายการ และรายการจองตั้งต้น (ใช้สำหรับการทดสอบระบบ)
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm('คุณต้องการรีเซ็ตข้อมูลกิจกรรมและยอดจองทั้งหมดเป็นค่าเริ่มต้นใช่หรือไม่?')) {
                    onResetData();
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตข้อมูลตัวอย่าง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
