import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  UserCheck,
  Tag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Activity } from '../types';

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  isBooked: boolean;
  onBookClick: (activity: Activity) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  isBooked,
  onBookClick
}) => {
  if (!isOpen || !activity) return null;

  const seatsLeft = Math.max(0, activity.maxSeats - activity.enrolledCount);
  const isFull = seatsLeft === 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Banner */}
        <div className={`p-6 sm:p-8 bg-gradient-to-r ${activity.bannerGradient} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">
            <span>{activity.categoryLabel}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Award className="w-3.5 h-3.5" />
              <span>{activity.activityHours} ชม. กิจกรรม</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold leading-snug pr-8">
            {activity.title}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">วันที่จัดกิจกรรม</div>
                <div className="font-semibold text-slate-800">
                  {new Date(activity.startDate).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">เวลาจัดกิจกรรม</div>
                <div className="font-semibold text-slate-800">
                  {activity.startTime} - {activity.endTime} น.
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">สถานที่</div>
                <div className="font-semibold text-slate-800">{activity.location}</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">จำนวนที่นั่ง</div>
                <div className="font-semibold text-slate-800">
                  {activity.enrolledCount} / {activity.maxSeats} ที่นั่ง (ว่าง {seatsLeft} ที่)
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base">
              รายละเอียดกิจกรรม
            </h4>
            <p className="text-slate-600 leading-relaxed">{activity.description}</p>
          </div>

          {/* Speaker */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>วิทยากร / ผู้รับผิดชอบโครงการ</span>
            </h4>
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-slate-800">
              {activity.speaker}
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">
              กลุ่มเป้าหมายผู้เข้าร่วม
            </h4>
            <div className="text-slate-600">{activity.targetAudience}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {activity.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 text-slate-700 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isFull ? (
              <span className="text-rose-600 font-semibold">ที่นั่งเต็มแล้ว</span>
            ) : (
              <span>เหลือที่นั่งว่าง {seatsLeft} ที่นั่ง</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>

            {isBooked ? (
              <button
                disabled
                className="px-5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-xl flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>คุณได้จองกิจกรรมนี้แล้ว</span>
              </button>
            ) : isFull ? (
              <button
                disabled
                className="px-5 py-2 text-xs font-medium text-slate-400 bg-slate-200 rounded-xl cursor-not-allowed"
              >
                ที่นั่งเต็ม
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onBookClick(activity);
                }}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                จองกิจกรรมทันที
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
