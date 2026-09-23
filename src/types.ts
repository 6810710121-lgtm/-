export interface Activity {
  id: string;
  title: string;
  category: 'academic' | 'volunteer' | 'ethics' | 'international' | 'health';
  categoryLabel: string;
  iconName: string;
  description: string;
  location: string;
  speaker: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  month: number;
  year: number;
  maxSeats: number;
  enrolledCount: number;
  activityHours: number;
  targetAudience: string;
  tags: string[];
  bannerGradient: string;
  isPopular?: boolean;
  isClosed?: boolean;
}

export interface Booking {
  id: string;
  activityId: string;
  activityTitle: string;
  studentId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  faculty: string;
  major: string;
  yearLevel: string;
  phone: string;
  email: string;
  bookedAt: string;
  bookedByEmail?: string;
  bookedByName?: string;
  isProxyBooking: boolean;
  notes?: string;
  activityDate: string;
  activityHours: number;
  syncedToSheets?: boolean;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  studentId?: string;
  faculty?: string;
  major?: string;
  yearLevel?: string;
  phone?: string;
}

export const FACULTIES = [
  'คณะวิทยาศาสตร์และนวัตกรรมดิจิทัล',
  'คณะเศรษฐศาสตร์และบริหารธุรกิจ',
  'คณะศึกษาศาสตร์',
  'คณะนิติศาสตร์',
  'คณะมนุษยศาสตร์และสังคมศาสตร์',
  'คณะวิทยาการสุขภาพและการกีฬา',
  'คณะเทคโนโลยีและการพัฒนาชุมชน',
  'คณะพยาบาลศาสตร์',
  'คณะวิศวกรรมศาสตร์'
];

export const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'academic', label: 'ทักษะวิชาการ & นวัตกรรม' },
  { id: 'volunteer', label: 'บำเพ็ญประโยชน์ & จิตอาสา' },
  { id: 'ethics', label: 'คุณธรรม & จริยธรรม' },
  { id: 'international', label: 'ภาษา & สากล' },
  { id: 'health', label: 'สุขภาพ & กีฬา' }
];
