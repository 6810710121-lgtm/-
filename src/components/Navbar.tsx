import React from 'react';
import { LogOut, User as UserIcon, FileSpreadsheet } from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface NavbarProps {
  user: User | null;
  activeTab: 'activities' | 'my-bookings' | 'stats' | 'proxy-check';
  setActiveTab: (tab: 'activities' | 'my-bookings' | 'stats' | 'proxy-check') => void;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  bookingCount: number;
  spreadsheetUrl?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogin,
  onLogout,
  isLoggingIn,
  bookingCount,
  spreadsheetUrl
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('activities')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
              TSU
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  ระบบจองกิจกรรมนิสิต
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ปีการศึกษา 2569
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบจัดการกิจกรรมพัฒนานิสิต & ตรวจสอบการจองแทน
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === 'activities'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              กิจกรรมทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition relative ${
                activeTab === 'my-bookings'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ประวัติการจอง
              {bookingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.2 text-xs rounded-full bg-blue-600 text-white">
                  {bookingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('proxy-check')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === 'proxy-check'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ตรวจสอบการจองแทน
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                activeTab === 'stats'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              สถิติภาพรวม
            </button>
          </nav>

          {/* Right Action: Sheets & Login Button / User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="เปิดดูข้อมูลใน Google Sheets"
                className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Google Sheets</span>
              </a>
            )}

            {user ? (
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 pr-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/30 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-slate-800 truncate max-w-[130px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-slate-500 text-[10px] truncate max-w-[130px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ (Sign Out)"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onLogin}
                disabled={isLoggingIn}
                text={isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                className="text-xs sm:text-sm py-1 h-9 sm:h-10"
              />
            )}
          </div>
        </div>

        {/* Mobile Nav Subbar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'activities' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            กิจกรรม
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'my-bookings' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            ประวัติ ({bookingCount})
          </button>
          <button
            onClick={() => setActiveTab('proxy-check')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'proxy-check' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            ตรวจจองแทน
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-1 px-2 rounded-md ${
              activeTab === 'stats' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            สถิติ
          </button>
        </div>
      </div>
    </header>
  );
};
