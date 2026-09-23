import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Award, Calendar, Clock, MapPin, Users, Sparkles } from 'lucide-react';
import { Activity, CATEGORIES } from '../types';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: Partial<Activity>) => void;
  initialData?: Activity | null;
}

const GRADIENT_OPTIONS = [
  { label: 'Blue - Indigo', value: 'from-blue-600 to-indigo-700' },
  { label: 'Emerald - Teal', value: 'from-emerald-600 to-teal-700' },
  { label: 'Amber - Orange', value: 'from-amber-600 to-orange-700' },
  { label: 'Purple - Indigo', value: 'from-purple-600 to-indigo-800' },
  { label: 'Rose - Red', value: 'from-rose-600 to-red-700' },
  { label: 'Cyan - Blue', value: 'from-cyan-600 to-blue-700' },
  { label: 'Teal - Emerald', value: 'from-teal-600 to-emerald-800' },
  { label: 'Rose - Orange', value: 'from-rose-500 to-orange-600' }
];

const ICON_OPTIONS = [
  { label: 'Cpu (เทคโนโลยี/AI)', value: 'Cpu' },
  { label: 'HeartHandshake (จิตอาสา)', value: 'HeartHandshake' },
  { label: 'Sparkles (คุณธรรม/พัฒนาตนเอง)', value: 'Sparkles' },
  { label: 'Globe (ภาษา/สากล)', value: 'Globe' },
  { label: 'Activity (สุขภาพ/กีฬา)', value: 'Activity' },
  { label: 'TrendingUp (การเงิน/ธุรกิจ)', value: 'TrendingUp' },
  { label: 'BookOpen (การศึกษา)', value: 'BookOpen' },
  { label: 'ShieldAlert (ปฐมพยาบาล/ความปลอดภัย)', value: 'ShieldAlert' }
];

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const isEditing = !!initialData;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Activity['category']>('academic');
  const [iconName, setIconName] = useState('Cpu');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('16:00');
  const [maxSeats, setMaxSeats] = useState(80);
  const [activityHours, setActivityHours] = useState(3);
  const [targetAudience, setTargetAudience] = useState('นิสิตทุกชั้นปี');
  const [tagsString, setTagsString] = useState('');
  const [bannerGradient, setBannerGradient] = useState(GRADIENT_OPTIONS[0].value);
  const [isPopular, setIsPopular] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setIconName(initialData.iconName);
      setDescription(initialData.description);
      setLocation(initialData.location);
      setSpeaker(initialData.speaker);
      setStartDate(initialData.startDate);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setMaxSeats(initialData.maxSeats);
      setActivityHours(initialData.activityHours);
      setTargetAudience(initialData.targetAudience);
      setTagsString(initialData.tags?.join(', ') || '');
      setBannerGradient(initialData.bannerGradient || GRADIENT_OPTIONS[0].value);
      setIsPopular(!!initialData.isPopular);
      setIsClosed(!!initialData.isClosed);
    } else {
      setTitle('');
      setCategory('academic');
      setIconName('Cpu');
      setDescription('');
      setLocation('');
      setSpeaker('');
      setStartDate('2026-10-01');
      setStartTime('13:00');
      setEndTime('16:00');
      setMaxSeats(80);
      setActivityHours(3);
      setTargetAudience('นิสิตทุกชั้นปี');
      setTagsString('เตรียมพร้อมทำงาน, ทักษะศตวรรษที่ 21');
      setBannerGradient(GRADIENT_OPTIONS[0].value);
      setIsPopular(false);
      setIsClosed(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryItem = CATEGORIES.find((c) => c.id === category);
    const categoryLabel = categoryItem ? categoryItem.label : 'ทักษะทั่วไป';

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const [yearStr, monthStr] = startDate.split('-');

    onSubmit({
      title,
      category,
      categoryLabel,
      iconName,
      description,
      location,
      speaker,
      startDate,
      startTime,
      endTime,
      month: parseInt(monthStr, 10) || 10,
      year: parseInt(yearStr, 10) || 2026,
      maxSeats: Number(maxSeats),
      activityHours: Number(activityHours),
      targetAudience,
      tags,
      bannerGradient,
      isPopular,
      isClosed
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r ${bannerGradient} text-white relative`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
            <span>แผงควบคุมผู้ดูแลระบบ</span>
            <span>•</span>
            <span>{isEditing ? 'แก้ไขข้อมูลกิจกรรม' : 'เพิ่มกิจกรรมพัฒนานิสิตใหม่'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold leading-snug">
            {isEditing ? title || 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่'}
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              ชื่อกิจกรรม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น อบรมเชิงปฏิบัติการ AI & Data Science 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
            />
          </div>

          {/* Category & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">หมวดหมู่กิจกรรม</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Activity['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
              >
                <option value="academic">ทักษะวิชาการ & นวัตกรรม</option>
                <option value="volunteer">บำเพ็ญประโยชน์ & จิตอาสา</option>
                <option value="ethics">คุณธรรม & จริยธรรม</option>
                <option value="international">ภาษา & สากล</option>
                <option value="health">สุขภาพ & กีฬา</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ไอคอนประจำกิจกรรม</label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">รายละเอียดกิจกรรม</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ สิ่งที่นิสิตจะได้รับ และข้อมูลสำคัญ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
            />
          </div>

          {/* Speaker & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">วิทยากร / ผู้จัด</label>
              <input
                type="text"
                required
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="เช่น ผศ.ดร.สมชาย ใจดี"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">สถานที่จัดกิจกรรม</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น ห้องประชุมใหญ่ อาคารเรียนรวม 3"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">วันที่จัด (YYYY-MM-DD)</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">เวลาเริ่ม</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">เวลาสิ้นสุด</label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Seats, Hours & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">จำนวนที่นั่งสูงสุด</label>
              <input
                type="number"
                min={1}
                max={1000}
                required
                value={maxSeats}
                onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">ชั่วโมงกิจกรรมที่ได้</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={activityHours}
                onChange={(e) => setActivityHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">กลุ่มเป้าหมาย</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="เช่น นิสิตทุกชั้นปี"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Tags & Theme Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">แท็ก (คั่นด้วยจุลภาค)</label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="เช่น AI, ทักษะแห่งอนาคต, มีเกียรติบัตร"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">สีแบนเนอร์กิจกรรม</label>
              <select
                value={bannerGradient}
                onChange={(e) => setBannerGradient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 bg-white"
              >
                {GRADIENT_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 flex flex-wrap gap-6 items-center border-t border-slate-100">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="font-medium text-slate-700">ติดแท็กยอดนิยม (🔥 ยอดนิยม)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isClosed}
                onChange={(e) => setIsClosed(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span className="font-medium text-slate-700 text-rose-600">ปิดรับสมัครกิจกรรมชั่วคราว</span>
            </label>
          </div>

          {/* Footer Actions */}
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
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/25 transition flex items-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรมใหม่'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
