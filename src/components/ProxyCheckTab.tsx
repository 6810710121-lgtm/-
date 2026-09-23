import React, { useState } from 'react';
import { ShieldAlert, Users, Search, AlertCircle, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { Booking } from '../types';

interface ProxyCheckTabProps {
  bookings: Booking[];
  spreadsheetUrl?: string | null;
}

export const ProxyCheckTab: React.FC<ProxyCheckTabProps> = ({ bookings, spreadsheetUrl }) => {
  const [searchStudentId, setSearchStudentId] = useState('');

  // Group bookings by studentId to detect multiple bookings or proxies
  const proxyBookings = bookings.filter((b) => b.isProxyBooking);
  const selfBookings = bookings.filter((b) => !b.isProxyBooking);

  // Group by bookedByEmail to see who has booked multiple times for others
  const bookedByMap: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const key = b.bookedByEmail || 'Unknown';
    if (!bookedByMap[key]) bookedByMap[key] = [];
    bookedByMap[key].push(b);
  });

  const searchedBookings = searchStudentId.trim()
    ? bookings.filter(
        (b) =>
          b.studentId.includes(searchStudentId.trim()) ||
          `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchStudentId.trim().toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Intro Box */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>ระบบตรวจสอบการจองแทนและความโปร่งใส</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          ตรวจสอบความถูกต้องของการลงทะเบียนกิจกรรม
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
          ระบบจะบันทึกสถานะว่านิสิตทำรายการจองด้วยตนเอง หรือมีผู้อื่นทำการจองแทน พร้อมระบุบัญชี Google ของผู้ทำรายการ
          เพื่อป้องกันการกั๊กที่นั่งและการใช้สิทธิ์ซ้ำซ้อน
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 mb-1">ยอดจองทั้งหมดในระบบ</div>
          <div className="text-2xl font-bold text-slate-900">{bookings.length} รายการ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-600 mb-1">จองโดยนิสิตเจ้าของสิทธิ์เอง</div>
          <div className="text-2xl font-bold text-emerald-700">{selfBookings.length} รายการ</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {bookings.length > 0 ? Math.round((selfBookings.length / bookings.length) * 100) : 0}% ของทั้งหมด
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-600 mb-1">จองแทนผู้อื่น (Proxy Booking)</div>
          <div className="text-2xl font-bold text-amber-700">{proxyBookings.length} รายการ</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {bookings.length > 0 ? Math.round((proxyBookings.length / bookings.length) * 100) : 0}% ของทั้งหมด
          </div>
        </div>
      </div>

      {/* Lookup Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Search className="w-4 h-4 text-blue-600" />
          <span>ตรวจสอบประวัติการจองตามรหัสนิสิตหรือชื่อ</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="ป้อนรหัสนิสิต (เช่น 6610110023) หรือชื่อ-นามสกุล..."
            value={searchStudentId}
            onChange={(e) => setSearchStudentId(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-blue-500 font-mono"
          />
          {searchStudentId && (
            <button
              onClick={() => setSearchStudentId('')}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              ล้างคำค้นหา
            </button>
          )}
        </div>

        {searchStudentId.trim() && (
          <div className="pt-2">
            {searchedBookings.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-xs text-center">
                ไม่พบข้อมูลการจองสำหรับคำค้นหานี้
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-slate-500">
                  พบข้อมูลการจอง {searchedBookings.length} รายการ:
                </div>
                {searchedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {b.activityTitle}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        ผู้เข้าร่วม: {b.prefix}{b.firstName} {b.lastName} ({b.studentId}) • {b.faculty}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {b.isProxyBooking ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          จองแทน (โดย {b.bookedByEmail})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          จองด้วยตนเอง
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* List of Proxy Bookings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>รายการที่มีการระบุจองแทน ({proxyBookings.length} รายการ)</span>
        </h3>

        {proxyBookings.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            ยังไม่มีรายการจองแทนในระบบ ข้อมูลทุกรายการในปัจจุบันจองโดยนิสิตเจ้าของสิทธิ์
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">รหัสจอง</th>
                  <th className="py-2.5 px-3">กิจกรรม</th>
                  <th className="py-2.5 px-3">นิสิตผู้รับสิทธิ์</th>
                  <th className="py-2.5 px-3">ผู้ทำรายการจอง (Google Account)</th>
                  <th className="py-2.5 px-3">เหตุผลการจองแทน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {proxyBookings.map((pb) => (
                  <tr key={pb.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                      {pb.id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {pb.activityTitle}
                    </td>
                    <td className="py-2.5 px-3">
                      {pb.prefix}{pb.firstName} {pb.lastName} ({pb.studentId})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {pb.bookedByEmail || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-amber-700">
                      {pb.notes || 'ไม่ได้ระบุเหตุผล'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
