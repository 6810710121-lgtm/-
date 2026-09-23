import { Booking } from '../types';
import { getAccessToken } from './authService';

const SPREADSHEET_TITLE = 'TSU_Student_Activities_Bookings_2026';
const SPREADSHEET_ID_KEY = 'tsu_activities_spreadsheet_id';

/**
 * Get or create the Google Sheets spreadsheet in user's Google Drive
 */
export async function getOrCreateSpreadsheet(): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบด้วย Google ก่อนดำเนินการ');

  const existingId = localStorage.getItem(SPREADSHEET_ID_KEY);
  if (existingId) {
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${existingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return {
          id: existingId,
          url: `https://docs.google.com/spreadsheets/d/${existingId}/edit`
        };
      }
    } catch {
      console.warn('Existing spreadsheet unreachable, creating a new one...');
    }
  }

  // Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE
      },
      sheets: [
        {
          properties: {
            title: 'รายการจองกิจกรรมนิสิต',
            gridProperties: { rowCount: 200, columnCount: 15, frozenRowCount: 1 }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    throw new Error(errorData?.error?.message || 'ไม่สามารถสร้าง Google Sheets ได้');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // Set Header Row
  const headers = [
    'รหัสการจอง (Booking ID)',
    'รหัสนิสิต (Student ID)',
    'คำนำหน้า',
    'ชื่อ',
    'นามสกุล',
    'คณะ (Faculty)',
    'สาขาวิชา (Major)',
    'ชั้นปี (Year)',
    'เบอร์โทรศัพท์ (Phone)',
    'อีเมล (Email)',
    'รหัสกิจกรรม',
    'ชื่อกิจกรรม (Activity)',
    'วันที่จัดกิจกรรม',
    'ชั่วโมงกิจกรรม',
    'จองแทนผู้อื่นหรือไม่',
    'ผู้ทำรายการ (Logged-in User)',
    'เวลาที่บันทึกข้อมูล (Timestamp)'
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'รายการจองกิจกรรมนิสิต'!A1:Q1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [headers]
      })
    }
  );

  localStorage.setItem(SPREADSHEET_ID_KEY, spreadsheetId);
  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Append a booking to Google Sheets
 */
export async function appendBookingToSheet(booking: Booking): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const { id: spreadsheetId } = await getOrCreateSpreadsheet();

  const rowData = [
    booking.id,
    booking.studentId,
    booking.prefix,
    booking.firstName,
    booking.lastName,
    booking.faculty,
    booking.major,
    booking.yearLevel,
    booking.phone,
    booking.email,
    booking.activityId,
    booking.activityTitle,
    booking.activityDate,
    booking.activityHours,
    booking.isProxyBooking ? 'ใช่ (จองแทน)' : 'ไม่ใช่ (จองด้วยตนเอง)',
    booking.bookedByEmail || '-',
    booking.bookedAt
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'รายการจองกิจกรรมนิสิต'!A:Q:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowData]
      })
    }
  );

  return res.ok;
}

/**
 * Fetch all rows from Google Sheets
 */
export async function fetchBookingsFromSheet(): Promise<Booking[]> {
  const token = await getAccessToken();
  if (!token) return [];

  const spreadsheetId = localStorage.getItem(SPREADSHEET_ID_KEY);
  if (!spreadsheetId) return [];

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'รายการจองกิจกรรมนิสิต'!A2:Q500`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const rows: any[][] = data.values || [];

    return rows.map((row, idx) => ({
      id: row[0] || `BK-RESTORED-${idx}`,
      studentId: row[1] || '',
      prefix: row[2] || '',
      firstName: row[3] || '',
      lastName: row[4] || '',
      faculty: row[5] || '',
      major: row[6] || '',
      yearLevel: row[7] || '',
      phone: row[8] || '',
      email: row[9] || '',
      activityId: row[10] || '',
      activityTitle: row[11] || '',
      activityDate: row[12] || '',
      activityHours: Number(row[13]) || 0,
      isProxyBooking: (row[14] || '').includes('จองแทน'),
      bookedByEmail: row[15] || '',
      bookedAt: row[16] || new Date().toISOString(),
      syncedToSheets: true
    }));
  } catch (err) {
    console.error('Failed to load bookings from sheet:', err);
    return [];
  }
}
