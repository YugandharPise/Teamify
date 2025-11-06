import { supabase } from '../supabase';
import type { LeaveRequestInsert, LeaveRequestUpdate } from '../types';

export const leaveApi = {
  /**
   * Get all leave requests
   */
  async getAllRequests() {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(employee_id, first_name, last_name, employee_code),
        leave_type:leave_types(leave_type_id, type_name),
        reviewer:employees!leave_requests_reviewed_by_fkey(employee_id, first_name, last_name)
      `)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get leave requests by status
   */
  async getRequestsByStatus(status: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        employee:employees(employee_id, first_name, last_name, employee_code),
        leave_type:leave_types(leave_type_id, type_name)
      `)
      .eq('status', status)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get leave requests for a specific employee
   */
  async getEmployeeRequests(employeeId: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        leave_type:leave_types(leave_type_id, type_name),
        reviewer:employees!leave_requests_reviewed_by_fkey(employee_id, first_name, last_name)
      `)
      .eq('employee_id', employeeId)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create a leave request
   */
  async createRequest(request: LeaveRequestInsert) {
    const { data, error } = await supabase
      .from('leave_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update leave request (approve/reject)
   */
  async updateRequest(requestId: string, updates: LeaveRequestUpdate) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update(updates)
      .eq('leave_request_id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Approve leave request
   */
  async approveRequest(requestId: string, reviewerId: string, comments?: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'APPROVED',
        reviewed_by: reviewerId,
        reviewed_date: new Date().toISOString(),
        reviewer_comments: comments,
      })
      .eq('leave_request_id', requestId)
      .select()
      .single();

    if (error) throw error;

    // Update leave balance
    if (data) {
      await this.updateLeaveBalance(
        data.employee_id,
        data.leave_type_id,
        new Date().getFullYear(),
        data.total_days
      );
    }

    return data;
  },

  /**
   * Reject leave request
   */
  async rejectRequest(requestId: string, reviewerId: string, comments?: string) {
    const { data, error } = await supabase
      .from('leave_requests')
      .update({
        status: 'REJECTED',
        reviewed_by: reviewerId,
        reviewed_date: new Date().toISOString(),
        reviewer_comments: comments,
      })
      .eq('leave_request_id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get leave types
   */
  async getLeaveTypes() {
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('type_name');

    if (error) throw error;
    return data;
  },

  /**
   * Get leave balance for an employee
   */
  async getEmployeeBalance(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const { data, error } = await supabase
      .from('leave_balances')
      .select(`
        *,
        leave_type:leave_types(*)
      `)
      .eq('employee_id', employeeId)
      .eq('year', currentYear);

    if (error) throw error;
    return data;
  },

  /**
   * Update leave balance (internal use)
   */
  async updateLeaveBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
    daysUsed: number
  ) {
    const { data: existing } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type_id', leaveTypeId)
      .eq('year', year)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('leave_balances')
        .update({
          used_days: existing.used_days + daysUsed,
        })
        .eq('leave_balance_id', existing.leave_balance_id);

      if (error) throw error;
    }
  },

  /**
   * Initialize leave balance for a new employee
   */
  async initializeBalance(employeeId: string) {
    const { data: leaveTypes } = await this.getLeaveTypes();
    const currentYear = new Date().getFullYear();

    if (!leaveTypes) return;

    const balances = leaveTypes.map(type => ({
      employee_id: employeeId,
      leave_type_id: type.leave_type_id,
      year: currentYear,
      total_days: type.default_days_per_year,
      used_days: 0,
    }));

    const { error } = await supabase
      .from('leave_balances')
      .insert(balances);

    if (error) throw error;
  },
};
