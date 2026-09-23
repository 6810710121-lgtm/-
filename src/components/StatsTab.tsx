import React from 'react';
import { Award, Users, BarChart3, TrendingUp, CheckCircle, PieChart } from 'lucide-react';
import { Activity, Booking, FACULTIES } from '../types';

interface StatsTabProps {
  activities: Activity[];
  bookings: Booking[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ activities, bookings }) => {
  const totalMaxSeats = activities.reduce((sum, a) => sum + a.maxSeats, 0);
  const totalEnrolled = activities.reduce((sum, a) => sum + a.enrolledCount, 0);
  const totalActivityHours = activities.reduce((sum, a) => sum + a.activityHours, 0);
  const proxyBookingsCount = bookings.filter((b) => b.isProxyBooking).length;

  // Group by faculty
  const facultyCounts: Record<string, number> = {};
  FACULTIES.forEach((f) => (facultyCounts[f] = 0));
  bookings.forEach((b) => {
    if (facultyCounts[b.faculty] !== undefined) {
      facultyCounts[b.faculty]++;
    } else {
      facultyCounts[b.faculty] = 1;
    }
  });

  // Group by activity category
  const categoryCounts: Record<string, number> = {
    academic: 0,
    volunteer: 0,
    ethics: 0,
    international: 0,
    health: 0
  };
  activities.forEach((act) => {
    categoryCounts[act.category] = (categoryCounts[act.category] || 0) + act.enrolledCount;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
          <BarChart3 className="w-4 h-4" />
          <span>แดชบอร์ดสรุปผลการจัดกิจกรรมและการเข้าร่วม</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          สถิติภาพรวมกิจกรรมพัฒนานิสิต ประจำปีการศึกษา 2569
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          ติดตามอัตราการจองที่นั่ง จำนวนชั่วโมงกิจกรรมที่เปิดให้สะสม และการกระจายตัวของนิสิตแต่ละคณะ
        </p>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
            <div className="text-xs text-blue-600 font-medium">กิจกรรมที่เปิดรับ</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">
              {activities.length}
            </div>
            <div className="text-[11px] text-blue-600/80 mt-1">ครอบคลุม 5 ด้านการเรียนรู้</div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
            <div className="text-xs text-indigo-600 font-medium">ที่นั่งจองแล้วทั้งหมด</div>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-900 mt-1">
              {totalEnrolled}{' '}
              <span className="text-xs font-normal text-indigo-700">/ {totalMaxSeats}</span>
            </div>
            <div className="text-[11px] text-indigo-600/80 mt-1">
              คิดเป็น {Math.round((totalEnrolled / totalMaxSeats) * 100)}% ของความจุ
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <div className="text-xs text-emerald-600 font-medium">ชั่วโมงกิจกรรมรวม</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-900 mt-1">
              {totalActivityHours} ชม.
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-1">ผ่านเกณฑ์กิจกรรมมหาวิทยาลัย</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
            <div className="text-xs text-amber-700 font-medium">รายการจองในระบบ</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-950 mt-1">
              {bookings.length}
            </div>
            <div className="text-[11px] text-amber-700/80 mt-1">
              จองแทนผู้อื่น {proxyBookingsCount} รายการ
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Faculty & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>การกระจายตัวของนิสิตตามคณะ (Faculty Distribution)</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {FACULTIES.map((fac) => {
              const count = facultyCounts[fac] || 0;
              const maxBookingInFaculty = Math.max(1, ...Object.values(facultyCounts));
              const pct = Math.round((count / maxBookingInFaculty) * 100);

              return (
                <div key={fac} className="text-xs">
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span className="font-medium truncate max-w-[280px]">{fac}</span>
                    <span className="font-semibold text-slate-900">{count} คน</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Status Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>สถานะที่นั่งแต่ละกิจกรรม</span>
          </h3>

          <div className="space-y-3 pt-2">
            {activities.map((act) => {
              const pct = Math.min(100, Math.round((act.enrolledCount / act.maxSeats) * 100));
              const isFull = act.enrolledCount >= act.maxSeats;

              return (
                <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0">
                  <div className="flex justify-between items-center text-slate-700 mb-1 gap-2">
                    <span className="font-medium truncate max-w-[280px]">{act.title}</span>
                    <span className="font-semibold shrink-0">
                      {act.enrolledCount}/{act.maxSeats}{' '}
                      <span className={isFull ? 'text-rose-600' : 'text-slate-400'}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull
                          ? 'bg-rose-500'
                          : pct > 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
