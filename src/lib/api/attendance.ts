import { supabase } from '../supabase';
import type { AttendanceInsert } from '../types';

export const attendanceApi = {
  /**
   * Get all attendance records
   */
  async getAll() {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employee:employees(
          employee_id,
          first_name,
          last_name,
          employee_code,
          department:departments(department_name)
        )
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get attendance for a specific date
   */
  async getByDate(date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employee:employees(
          employee_id,
          first_name,
          last_name,
          employee_code,
          department:departments(department_name)
        )
      `)
      .eq('date', date)
      .order('check_in_time');

    if (error) throw error;
    return data;
  },

  /**
   * Get attendance for a specific employee
   */
  async getByEmployee(employeeId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get attendance for a date range
   */
  async getByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employee:employees(
          employee_id,
          first_name,
          last_name,
          department:departments(department_name)
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Mark attendance (check in/out)
   */
  async markAttendance(attendance: AttendanceInsert) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendance, {
        onConflict: 'employee_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get attendance summary for today
   */
  async getTodaySummary() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('date', today);

    if (error) throw error;

    const summary = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      present: summary.PRESENT || 0,
      absent: summary.ABSENT || 0,
      late: summary.LATE || 0,
      onLeave: summary.ON_LEAVE || 0,
      halfDay: summary.HALF_DAY || 0,
      holiday: summary.HOLIDAY || 0,
    };
  },

  /**
   * Get attendance statistics for an employee
   */
  async getEmployeeStats(employeeId: string, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('employee_id', employeeId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const stats = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: data.length,
      present: stats.PRESENT || 0,
      absent: stats.ABSENT || 0,
      late: stats.LATE || 0,
      onLeave: stats.ON_LEAVE || 0,
      halfDay: stats.HALF_DAY || 0,
    };
  },

  /**
   * Update attendance record
   */
  async update(attendanceId: string, updates: Partial<AttendanceInsert>) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('attendance_id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
