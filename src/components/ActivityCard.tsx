import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  Cpu,
  HeartHandshake,
  Sparkles,
  Globe,
  Activity as ActivityIcon,
  TrendingUp,
  BookOpen,
  ShieldAlert
} from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isBooked: boolean;
  onBookClick: (activity: Activity) => void;
  onViewDetails: (activity: Activity) => void;
}

const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'Cpu':
      return <Cpu className="w-4 h-4" />;
    case 'HeartHandshake':
      return <HeartHandshake className="w-4 h-4" />;
    case 'Sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'Globe':
      return <Globe className="w-4 h-4" />;
    case 'Activity':
      return <ActivityIcon className="w-4 h-4" />;
    case 'TrendingUp':
      return <TrendingUp className="w-4 h-4" />;
    case 'BookOpen':
      return <BookOpen className="w-4 h-4" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
};

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isBooked,
  onBookClick,
  onViewDetails
}) => {
  const seatsLeft = Math.max(0, activity.maxSeats - activity.enrolledCount);
  const percentFilled = Math.min(100, Math.round((activity.enrolledCount / activity.maxSeats) * 100));
  const isFull = seatsLeft === 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      {/* Top Banner */}
      <div className={`p-4 bg-gradient-to-r ${activity.bannerGradient} text-white relative`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-xs text-white">
            {getCategoryIcon(activity.iconName)}
            <span>{activity.categoryLabel}</span>
          </span>

          <div className="flex items-center space-x-1.5">
            {activity.isPopular && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-amber-950 shadow-xs">
                <Flame className="w-3 h-3 fill-current text-red-600" />
                <span>ยอดนิยม</span>
              </span>
            )}
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/20 text-white">
              <Award className="w-3 h-3" />
              <span>{activity.activityHours} ชม.</span>
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base sm:text-lg line-clamp-2 leading-snug group-hover:text-amber-100 transition-colors">
          {activity.title}
        </h3>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>

        {/* Schedule & Venue Meta */}
        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">
              {new Date(activity.startDate).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{activity.startTime} - {activity.endTime} น.</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{activity.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {activity.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Seat Availability Progress */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>ที่นั่งจองแล้ว</span>
            </span>
            <span className="font-semibold text-slate-800">
              {activity.enrolledCount} / {activity.maxSeats}{' '}
              <span className={`text-[11px] font-normal ${isFull ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                ({isFull ? 'เต็มแล้ว' : `ว่าง ${seatsLeft} ที่`})
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : percentFilled > 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${percentFilled}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 pt-0 flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(activity)}
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
        >
          รายละเอียด
        </button>

        {isBooked ? (
          <button
            disabled
            className="flex-1 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center space-x-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>จองแล้ว</span>
          </button>
        ) : isFull ? (
          <button
            disabled
            className="flex-1 px-3 py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-xl flex items-center justify-center space-x-1 cursor-not-allowed"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>ที่นั่งเต็ม</span>
          </button>
        ) : (
          <button
            onClick={() => onBookClick(activity)}
            className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl shadow-xs shadow-blue-500/20 transition cursor-pointer"
          >
            จองกิจกรรม
          </button>
        )}
      </div>
    </div>
  );
};
