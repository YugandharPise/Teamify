import { supabase } from '../supabase';

export const dashboardApi = {
  /**
   * Get HR dashboard statistics
   */
  async getHRStats() {
    try {
      // Get total employees count
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { count: presentToday } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'Present');

      // Get pending leave requests
      const { count: pendingLeaves } = await supabase
        .from('leave_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      // Get open positions count
      const { count: openPositions } = await supabase
        .from('recruitment_positions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Open');

      // Calculate attendance rate for today
      const attendanceRate = totalEmployees && totalEmployees > 0
        ? ((presentToday || 0) / totalEmployees * 100).toFixed(1)
        : '0.0';

      return {
        totalEmployees: totalEmployees || 0,
        presentToday: presentToday || 0,
        pendingLeaves: pendingLeaves || 0,
        openPositions: openPositions || 0,
        attendanceRate: `${attendanceRate}%`,
      };
    } catch (error) {
      console.error('Error fetching HR stats:', error);
      throw error;
    }
  },

  /**
   * Get recent activity across the system
   */
  async getRecentActivity(limit = 10) {
    try {
      // This would require an activity log table in your database
      // For now, return empty array - you'll need to implement activity tracking
      const { data: activities, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error && error.code !== 'PGRST116') { // PGRST116 = table not found
        throw error;
      }

      return activities || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  /**
   * Get department overview with employee counts
   */
  async getDepartmentOverview() {
    try {
      const { data: departments, error } = await supabase
        .from('departments')
        .select(`
          department_id,
          department_name,
          employees:employees(count)
        `);

      if (error) throw error;

      return (departments || []).map(dept => ({
        id: dept.department_id,
        name: dept.department_name,
        count: dept.employees?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error('Error fetching department overview:', error);
      return [];
    }
  },

  /**
   * Get employee dashboard stats (for employee portal)
   */
  async getEmployeeStats(employeeId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Get this week's hours
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

      const { data: weekAttendance } = await supabase
        .from('attendance')
        .select('hours_worked')
        .eq('employee_id', employeeId)
        .gte('date', startOfWeekStr)
        .lte('date', today);

      const hoursThisWeek = weekAttendance?.reduce((sum, record) => sum + (record.hours_worked || 0), 0) || 0;

      // Get leave balance
      const { data: leaveBalances } = await supabase
        .from('leave_balances')
        .select('available_days')
        .eq('employee_id', employeeId);

      const totalLeaveBalance = leaveBalances?.reduce((sum, balance) => sum + (balance.available_days || 0), 0) || 0;

      // Get performance score (latest review)
      const { data: latestReview } = await supabase
        .from('performance_reviews')
        .select('overall_rating')
        .eq('employee_id', employeeId)
        .order('review_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const performanceScore = latestReview?.overall_rating || 0;

      // Get goals completed
      const { count: completedGoals } = await supabase
        .from('performance_goals')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId)
        .eq('status', 'Completed');

      const { count: totalGoals } = await supabase
        .from('performance_goals')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', employeeId);

      return {
        hoursThisWeek,
        totalLeaveBalance,
        performanceScore,
        goalsCompleted: completedGoals || 0,
        totalGoals: totalGoals || 0,
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    }
  },
};
