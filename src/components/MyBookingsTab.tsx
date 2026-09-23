import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  Download
} from 'lucide-react';
import { Booking } from '../types';
import { User } from 'firebase/auth';

interface MyBookingsTabProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  spreadsheetUrl?: string | null;
  user: User | null;
}

export const MyBookingsTab: React.FC<MyBookingsTabProps> = ({
  bookings,
  onCancelBooking,
  spreadsheetUrl,
  user
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'self' | 'proxy'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.activityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.studentId.includes(searchTerm) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'self') return matchesSearch && !b.isProxyBooking;
    if (filterType === 'proxy') return matchesSearch && b.isProxyBooking;
    return matchesSearch;
  });

  const totalHours = bookings.reduce((sum, b) => sum + (b.activityHours || 0), 0);

  const confirmCancel = async (booking: Booking) => {
    // Confirmation dialog as required by guidelines
    const confirmed = window.confirm(
      `คุณต้องการยกเลิกการจองกิจกรรม "${booking.activityTitle}" สำหรับ ${booking.prefix}${booking.firstName} ${booking.lastName} (รหัส ${booking.studentId}) หรือไม่?\n\nการกระทำนี้จะคืนที่นั่งให้กับระบบ`
    );
    if (!confirmed) return;

    setDeletingId(booking.id);
    try {
      await onCancelBooking(booking.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{bookings.length}</div>
            <div className="text-xs text-slate-500">กิจกรรมที่ลงทะเบียนทั้งหมด</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{totalHours} ชม.</div>
            <div className="text-xs text-slate-500">ชั่วโมงกิจกรรมพัฒนานิสิตสะสม</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Google Sheets Sync</div>
              <div className="text-[11px] text-slate-500">
                {spreadsheetUrl ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}
              </div>
            </div>
          </div>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center space-x-1 transition shadow-xs"
            >
              <span>เปิดดู</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อกิจกรรม, รหัสนิสิต, หรือชื่อผู้จอง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ทั้งหมด ({bookings.length})
          </button>
          <button
            onClick={() => setFilterType('self')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'self'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            จองตนเอง ({bookings.filter((b) => !b.isProxyBooking).length})
          </button>
          <button
            onClick={() => setFilterType('proxy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filterType === 'proxy'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            จองแทน ({bookings.filter((b) => b.isProxyBooking).length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">ยังไม่มีรายการจองกิจกรรม</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            คุณสามารถไปที่แท็บ &ldquo;กิจกรรมทั้งหมด&rdquo; เพื่อเลือกดูกิจกรรมพัฒนานิสิตที่น่าสนใจและกดจองที่นั่งได้ทันที
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-slate-100 text-slate-700">
                    {booking.id}
                  </span>

                  {booking.isProxyBooking ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                      <ShieldAlert className="w-3 h-3 text-amber-600" />
                      <span>จองแทนผู้อื่น</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>จองด้วยตนเอง</span>
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                    +{booking.activityHours} ชม.
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                  {booking.activityTitle}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">นิสิตผู้เข้าร่วม:</span>{' '}
                    <span className="font-semibold text-slate-800">
                      {booking.prefix}{booking.firstName} {booking.lastName}
                    </span>{' '}
                    (รหัส {booking.studentId})
                  </div>
                  <div>
                    <span className="text-slate-400">สังกัด:</span> {booking.faculty} • {booking.major} ({booking.yearLevel})
                  </div>
                  <div>
                    <span className="text-slate-400">เบอร์ติดต่อ:</span> {booking.phone}
                  </div>
                  <div>
                    <span className="text-slate-400">บันทึกเมื่อ:</span>{' '}
                    {new Date(booking.bookedAt).toLocaleString('th-TH', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>

                {booking.isProxyBooking && booking.notes && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/70 px-3 py-1.5 rounded-xl border border-amber-100">
                    <span className="font-semibold">เหตุผลการจองแทน:</span> {booking.notes}
                    {booking.bookedByEmail && (
                      <span className="text-slate-500 ml-2">(โดย {booking.bookedByEmail})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end justify-end space-x-2 sm:space-x-0 sm:space-y-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => confirmCancel(booking)}
                  disabled={deletingId === booking.id}
                  className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                  title="ยกเลิกการจอง"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingId === booking.id ? 'กำลังยกเลิก...' : 'ยกเลิกจอง'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
