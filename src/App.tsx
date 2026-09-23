import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  Calendar,
  Sparkles,
  Search,
  Filter,
  Users,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import initialActivitiesData from './data/activities.json';
import { Activity, Booking, CATEGORIES } from './types';
import { initAuth, googleSignIn, logout } from './services/authService';
import {
  getOrCreateSpreadsheet,
  appendBookingToSheet,
  fetchBookingsFromSheet
} from './services/sheetsService';
import { Navbar } from './components/Navbar';
import { ActivityCard } from './components/ActivityCard';
import { BookingModal } from './components/BookingModal';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { MyBookingsTab } from './components/MyBookingsTab';
import { ProxyCheckTab } from './components/ProxyCheckTab';
import { StatsTab } from './components/StatsTab';
import { AdminTab } from './components/AdminTab';
import { ActivityFormModal } from './components/ActivityFormModal';
import { GoogleSignInButton } from './components/GoogleSignInButton';

const STORAGE_KEY_BOOKINGS = 'tsu_activity_bookings_v2';
const STORAGE_KEY_ACTIVITIES = 'tsu_activity_items_v2';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  // Activities & Bookings state
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialActivitiesData as Activity[];
      }
    }
    return initialActivitiesData as Activity[];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 'BK-2026-901',
        activityId: 'ACT-2026-001',
        activityTitle: 'อบรมเชิงปฏิบัติการ GenAI & Prompt Engineering สำหรับนิสิตยุคใหม่',
        studentId: '6610110023',
        prefix: 'นาย',
        firstName: 'กานต์',
        lastName: 'วัฒนพานิช',
        faculty: 'คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล',
        major: 'วิทยาการคอมพิวเตอร์',
        yearLevel: 'ชั้นปีที่ 2',
        phone: '089-1234567',
        email: 'kan.w@tsu.ac.th',
        bookedAt: '2026-09-01T10:15:00.000Z',
        bookedByEmail: 'cgobbun@gmail.com',
        bookedByName: 'Chanon Gobbun',
        isProxyBooking: false,
        activityDate: '2026-09-12',
        activityHours: 4,
        syncedToSheets: true
      },
      {
        id: 'BK-2026-902',
        activityId: 'ACT-2026-002',
        activityTitle: 'จิตอาสาพัฒนาชุมชนและอนุรักษ์สิ่งแวดล้อมชายฝั่งทะเลสาบสงขลา',
        studentId: '6510310088',
        prefix: 'นางสาว',
        firstName: 'กุลธิดา',
        lastName: 'แสงสว่าง',
        faculty: 'คณะศึกษาศาสตร์',
        major: 'การศึกษาปฐมวัย',
        yearLevel: 'ชั้นปีที่ 3',
        phone: '081-9876543',
        email: 'kul.s@tsu.ac.th',
        bookedAt: '2026-09-02T14:30:00.000Z',
        bookedByEmail: 'cgobbun@gmail.com',
        bookedByName: 'Chanon Gobbun',
        isProxyBooking: true,
        notes: 'เพื่อนติดภารกิจออกฝึกสอนภาคสนาม จึงฝากลงทะเบียน',
        activityDate: '2026-09-18',
        activityHours: 6,
        syncedToSheets: true
      }
    ];
  });

  // UI Navigation
  const [activeTab, setActiveTab] = useState<'activities' | 'my-bookings' | 'stats' | 'proxy-check' | 'admin'>('activities');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Admin states
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState<boolean>(false);

  // Modals
  const [bookingActivity, setBookingActivity] = useState<Activity | null>(null);
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        // If user is logged in, attempt to link/create their spreadsheet
        getOrCreateSpreadsheet()
          .then((sheet) => {
            setSpreadsheetUrl(sheet.url);
          })
          .catch((err) => {
            console.warn('Google Sheets init info:', err);
          });
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  // Dismiss notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Google Login Action
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        showNotification('success', `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${res.user.displayName || res.user.email}!`);
        // Init sheets
        try {
          const sheet = await getOrCreateSpreadsheet();
          setSpreadsheetUrl(sheet.url);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showNotification('error', err?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Google Logout Action
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      showNotification('success', 'ออกจากระบบเรียบร้อยแล้ว');
    } catch (err: any) {
      showNotification('error', 'ไม่สามารถออกจากระบบได้');
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    const matchesQuery =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  // Check if student has already booked this activity
  const isActivityBooked = (activityId: string) => {
    if (user?.email) {
      return bookings.some((b) => b.activityId === activityId && b.bookedByEmail === user.email);
    }
    return false;
  };

  // Submit Booking Handler
  const handleSubmitBooking = async (bookingData: Omit<Booking, 'id' | 'bookedAt'>): Promise<boolean> => {
    setIsSubmittingBooking(true);
    try {
      const newBookingId = `BK-${Date.now().toString().slice(-6)}`;
      const newBooking: Booking = {
        ...bookingData,
        id: newBookingId,
        bookedAt: new Date().toISOString(),
        bookedByEmail: user?.email || 'guest@tsu.ac.th',
        bookedByName: user?.displayName || 'Guest User',
        syncedToSheets: false
      };

      // Increment enrollment count in activity
      setActivities((prev) =>
        prev.map((act) => {
          if (act.id === bookingData.activityId) {
            return { ...act, enrolledCount: Math.min(act.maxSeats, act.enrolledCount + 1) };
          }
          return act;
        })
      );

      // Try appending to Google Sheets if user is logged in
      if (user) {
        try {
          const synced = await appendBookingToSheet(newBooking);
          newBooking.syncedToSheets = synced;
          if (synced) {
            showNotification(
              'success',
              `จองกิจกรรมสำเร็จ! รหัสการจอง: ${newBookingId} และบันทึกลง Google Sheets แล้ว`
            );
          } else {
            showNotification(
              'success',
              `จองกิจกรรมสำเร็จ! รหัสการจอง: ${newBookingId} (บันทึกในระบบ)`
            );
          }
        } catch (sheetErr) {
          console.warn('Sheets sync error:', sheetErr);
          showNotification('success', `จองกิจกรรมสำเร็จ! รหัสการจอง: ${newBookingId}`);
        }
      } else {
        showNotification(
          'success',
          `จองกิจกรรมสำเร็จ! รหัสการจอง: ${newBookingId} (แนะนำให้เข้าสู่ระบบเพื่อซิงค์ Sheets)`
        );
      }

      setBookings((prev) => [newBooking, ...prev]);
      return true;
    } catch (err: any) {
      showNotification('error', err?.message || 'เกิดข้อผิดพลาดในการบันทึกการจอง');
      return false;
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    const bookingToCancel = bookings.find((b) => b.id === bookingId);
    if (!bookingToCancel) return;

    // Decrement enrollment
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === bookingToCancel.activityId) {
          return { ...act, enrolledCount: Math.max(0, act.enrolledCount - 1) };
        }
        return act;
      })
    );

    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showNotification('success', `ยกเลิกการจองรหัส ${bookingId} เรียบร้อยแล้ว คืนที่นั่งสู่ระบบ`);
  };

  // ================= ADMIN HANDLERS =================
  const handleOpenAddActivity = () => {
    setEditingActivity(null);
    setIsActivityFormOpen(true);
  };

  const handleOpenEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsActivityFormOpen(true);
  };

  const handleSaveActivity = (activityData: Partial<Activity>) => {
    if (editingActivity) {
      // Update existing
      setActivities((prev) =>
        prev.map((act) => {
          if (act.id === editingActivity.id) {
            return {
              ...act,
              ...activityData,
              maxSeats: activityData.maxSeats || act.maxSeats
            } as Activity;
          }
          return act;
        })
      );
      showNotification('success', `อัปเดตข้อมูลกิจกรรม "${activityData.title}" สำเร็จ`);
    } else {
      // Create new
      const nextNum = activities.length + 1;
      const newId = `ACT-2026-${nextNum.toString().padStart(3, '0')}`;
      const newAct: Activity = {
        id: newId,
        title: activityData.title || 'กิจกรรมใหม่',
        category: activityData.category || 'academic',
        categoryLabel: activityData.categoryLabel || 'ทักษะวิชาการ & นวัตกรรม',
        iconName: activityData.iconName || 'Cpu',
        description: activityData.description || '',
        location: activityData.location || '',
        speaker: activityData.speaker || '',
        startDate: activityData.startDate || '2026-10-01',
        startTime: activityData.startTime || '13:00',
        endTime: activityData.endTime || '16:00',
        month: activityData.month || 10,
        year: activityData.year || 2026,
        maxSeats: Number(activityData.maxSeats) || 60,
        enrolledCount: 0,
        activityHours: Number(activityData.activityHours) || 3,
        targetAudience: activityData.targetAudience || 'นิสิตทุกชั้นปี',
        tags: activityData.tags || ['ทักษะแห่งอนาคต'],
        bannerGradient: activityData.bannerGradient || 'from-blue-600 to-indigo-700',
        isPopular: !!activityData.isPopular,
        isClosed: !!activityData.isClosed
      };
      setActivities((prev) => [newAct, ...prev]);
      showNotification('success', `สร้างกิจกรรม "${newAct.title}" รหัส ${newId} สำเร็จ`);
    }
  };

  const handleDeleteActivity = (activityId: string) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    const confirmed = window.confirm(
      `คุณต้องการลบกิจกรรม "${act.title}" ใช่หรือไม่?\nคำเตือน: ข้อมูลกิจกรรมจะถูกลบออกจากระบบอย่างถาวร`
    );
    if (!confirmed) return;

    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    showNotification('success', `ลบกิจกรรม "${act.title}" เรียบร้อยแล้ว`);
  };

  const handleToggleCloseActivity = (activityId: string) => {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === activityId) {
          const nextClosed = !act.isClosed;
          showNotification(
            'success',
            nextClosed
              ? `ปิดรับสมัครกิจกรรม "${act.title}" เรียบร้อยแล้ว`
              : `เปิดรับสมัครกิจกรรม "${act.title}" เรียบร้อยแล้ว`
          );
          return { ...act, isClosed: nextClosed };
        }
        return act;
      })
    );
  };

  const handleToggleCheckIn = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          const nextChecked = !b.checkedIn;
          showNotification(
            'success',
            nextChecked
              ? `เช็คชื่อนิสิต ${b.prefix}${b.firstName} ${b.lastName} เข้าร่วมกิจกรรมแล้ว`
              : `ยกเลิกการเช็คชื่อนิสิต ${b.prefix}${b.firstName} ${b.lastName}`
          );
          return {
            ...b,
            checkedIn: nextChecked,
            checkedInAt: nextChecked ? new Date().toISOString() : undefined
          };
        }
        return b;
      })
    );
  };

  const handleResetData = () => {
    setActivities(initialActivitiesData as Activity[]);
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEY_BOOKINGS);
    setBookings([
      {
        id: 'BK-2026-901',
        activityId: 'ACT-2026-001',
        activityTitle: 'อบรมเชิงปฏิบัติการ GenAI & Prompt Engineering สำหรับนิสิตยุคใหม่',
        studentId: '6610110023',
        prefix: 'นาย',
        firstName: 'กานต์',
        lastName: 'วัฒนพานิช',
        faculty: 'คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล',
        major: 'วิทยาการคอมพิวเตอร์',
        yearLevel: 'ชั้นปีที่ 2',
        phone: '089-1234567',
        email: 'kan.w@tsu.ac.th',
        bookedAt: '2026-09-01T10:15:00.000Z',
        bookedByEmail: 'cgobbun@gmail.com',
        bookedByName: 'Chanon Gobbun',
        isProxyBooking: false,
        activityDate: '2026-09-12',
        activityHours: 4,
        syncedToSheets: true,
        checkedIn: true,
        checkedInAt: '2026-09-12T09:00:00.000Z'
      },
      {
        id: 'BK-2026-902',
        activityId: 'ACT-2026-002',
        activityTitle: 'จิตอาสาพัฒนาชุมชนและอนุรักษ์สิ่งแวดล้อมชายฝั่งทะเลสาบสงขลา',
        studentId: '6510310088',
        prefix: 'นางสาว',
        firstName: 'กุลธิดา',
        lastName: 'แสงสว่าง',
        faculty: 'คณะศึกษาศาสตร์',
        major: 'การศึกษาปฐมวัย',
        yearLevel: 'ชั้นปีที่ 3',
        phone: '081-9876543',
        email: 'kul.s@tsu.ac.th',
        bookedAt: '2026-09-02T14:30:00.000Z',
        bookedByEmail: 'cgobbun@gmail.com',
        bookedByName: 'Chanon Gobbun',
        isProxyBooking: true,
        notes: 'เพื่อนติดภารกิจออกฝึกสอนภาคสนาม จึงฝากลงทะเบียน',
        activityDate: '2026-09-18',
        activityHours: 6,
        syncedToSheets: true,
        checkedIn: false
      }
    ]);
    showNotification('success', 'รีเซ็ตข้อมูลระบบและกิจกรรมกลับสู่ค่าเริ่มต้นเรียบร้อย');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-xl border flex items-center space-x-3 text-xs sm:text-sm animate-in slide-in-from-bottom-5 duration-300 max-w-md ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="leading-snug">{notification.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        bookingCount={bookings.length}
        spreadsheetUrl={spreadsheetUrl}
        isAdmin={isAdmin}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {/* Banner Alert for Login when Guest */}
        {!user && activeTab === 'activities' && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase">
                  Google Workspace
                </span>
                <span className="text-xs text-blue-100 font-semibold">
                  ระบบจองกิจกรรมเชื่อมต่อ Google Sheets
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                เข้าสู่ระบบด้วย Google Account ของคุณ
              </h3>
              <p className="text-xs text-blue-100 max-w-xl">
                เข้าสู่ระบบเพื่อบันทึกประวัติการจองลงสเปรดชีต Google Sheets อัตโนมัติ ป้องกันการจองซ้ำ และตรวจสอบการจองแทน
              </p>
            </div>

            <div className="shrink-0">
              <GoogleSignInButton
                onClick={handleLogin}
                disabled={isLoggingIn}
                text={isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}
                className="bg-white text-slate-800 shadow-md h-11 px-5"
              />
            </div>
          </div>
        )}

        {/* Tab 1: Activities Grid */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            {/* Hero / Filter Section */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    กิจกรรมพัฒนานิสิตที่เปิดรับสมัคร
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    เลือกกิจกรรมเพื่อสะสมชั่วโมงและพัฒนาทักษะนอกห้องเรียน
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหากิจกรรม, วิทยากร, คีย์เวิร์ด..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition font-medium cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities Grid */}
            {filteredActivities.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">ไม่พบกิจกรรมที่ค้นหา</h3>
                <p className="text-xs text-slate-500">
                  ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นเพื่อดูกิจกรรมทั้งหมด
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isBooked={isActivityBooked(activity.id)}
                    onBookClick={(act) => setBookingActivity(act)}
                    onViewDetails={(act) => setDetailActivity(act)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Bookings */}
        {activeTab === 'my-bookings' && (
          <MyBookingsTab
            bookings={bookings}
            onCancelBooking={handleCancelBooking}
            spreadsheetUrl={spreadsheetUrl}
            user={user}
          />
        )}

        {/* Tab 3: Proxy Check */}
        {activeTab === 'proxy-check' && (
          <ProxyCheckTab bookings={bookings} spreadsheetUrl={spreadsheetUrl} />
        )}

        {/* Tab 4: Statistics */}
        {activeTab === 'stats' && (
          <StatsTab activities={activities} bookings={bookings} />
        )}

        {/* Tab 5: Admin Panel */}
        {activeTab === 'admin' && (
          <AdminTab
            activities={activities}
            bookings={bookings}
            user={user}
            spreadsheetUrl={spreadsheetUrl}
            onAddActivity={handleOpenAddActivity}
            onEditActivity={handleOpenEditActivity}
            onDeleteActivity={handleDeleteActivity}
            onToggleCloseActivity={handleToggleCloseActivity}
            onToggleCheckIn={handleToggleCheckIn}
            onCancelBooking={handleCancelBooking}
            onResetData={handleResetData}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            ระบบจองกิจกรรมพัฒนานิสิตนอกชั้นเรียน (TSU Activities System)
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ระบบออนไลน์เรียลไทม์</span>
            </span>
            <span>•</span>
            <span>Google Sheets Integration</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BookingModal
        activity={bookingActivity}
        isOpen={!!bookingActivity}
        onClose={() => setBookingActivity(null)}
        user={user}
        onLogin={handleLogin}
        onSubmitBooking={handleSubmitBooking}
        isSubmitting={isSubmittingBooking}
      />

      <ActivityDetailModal
        activity={detailActivity}
        isOpen={!!detailActivity}
        onClose={() => setDetailActivity(null)}
        isBooked={detailActivity ? isActivityBooked(detailActivity.id) : false}
        onBookClick={(act) => {
          setDetailActivity(null);
          setBookingActivity(act);
        }}
      />

      <ActivityFormModal
        isOpen={isActivityFormOpen}
        onClose={() => {
          setIsActivityFormOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSaveActivity}
        initialData={editingActivity}
      />
    </div>
  );
}
