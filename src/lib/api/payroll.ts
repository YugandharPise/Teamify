import { supabase } from '../supabase';
import type { PayrollInsert } from '../types';

export const payrollApi = {
  /**
   * Get all payroll records
   */
  async getAllPayroll() {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        employee:employees(
          employee_id,
          first_name,
          last_name,
          employee_code,
          department:departments(department_name),
          position:positions(position_title)
        )
      `)
      .order('pay_period_start', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get payroll for a specific employee
   */
  async getEmployeePayroll(employeeId: string) {
    const { data, error } = await supabase
      .from('payroll')
      .select('*')
      .eq('employee_id', employeeId)
      .order('pay_period_start', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get payroll by period
   */
  async getPayrollByPeriod(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('payroll')
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
      .eq('pay_period_start', startDate)
      .eq('pay_period_end', endDate);

    if (error) throw error;
    return data;
  },

  /**
   * Get a single payroll record
   */
  async getPayrollById(payrollId: string) {
    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        employee:employees(*,
          department:departments(*),
          position:positions(*)
        )
      `)
      .eq('payroll_id', payrollId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a payroll record
   */
  async createPayroll(payroll: PayrollInsert) {
    const { data, error } = await supabase
      .from('payroll')
      .insert(payroll)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a payroll record
   */
  async updatePayroll(payrollId: string, updates: Partial<PayrollInsert>) {
    const { data, error } = await supabase
      .from('payroll')
      .update(updates)
      .eq('payroll_id', payrollId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Process payroll (mark as processed)
   */
  async processPayroll(payrollId: string, paymentMethod: string, transactionReference?: string) {
    const { data, error } = await supabase
      .from('payroll')
      .update({
        status: 'PROCESSED',
        payment_method: paymentMethod,
        transaction_reference: transactionReference,
        payment_date: new Date().toISOString().split('T')[0],
      })
      .eq('payroll_id', payrollId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark payroll as paid
   */
  async markPayrollAsPaid(payrollId: string) {
    const { data, error } = await supabase
      .from('payroll')
      .update({
        status: 'PAID',
      })
      .eq('payroll_id', payrollId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get salary components for a payroll
   */
  async getPayrollComponents(payrollId: string) {
    const { data, error } = await supabase
      .from('salary_components')
      .select('*')
      .eq('payroll_id', payrollId);

    if (error) throw error;
    return data;
  },

  /**
   * Add salary component to payroll
   */
  async addSalaryComponent(component: {
    payroll_id: string;
    component_type: 'ALLOWANCE' | 'DEDUCTION';
    component_name: string;
    amount: number;
    is_percentage?: boolean;
    percentage_value?: number;
  }) {
    const { data, error } = await supabase
      .from('salary_components')
      .insert(component)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get employee salary structure
   */
  async getEmployeeSalaryStructure(employeeId: string) {
    const { data, error } = await supabase
      .from('employee_salary_structures')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_current', true)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create employee salary structure
   */
  async createSalaryStructure(structure: {
    employee_id: string;
    basic_salary: number;
    currency?: string;
    effective_from: string;
    effective_to?: string;
    is_current?: boolean;
  }) {
    // Mark all existing structures as not current
    await supabase
      .from('employee_salary_structures')
      .update({ is_current: false })
      .eq('employee_id', structure.employee_id);

    const { data, error } = await supabase
      .from('employee_salary_structures')
      .insert({
        ...structure,
        is_current: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get salary component templates for an employee
   */
  async getSalaryComponentTemplates(salaryStructureId: string) {
    const { data, error } = await supabase
      .from('salary_component_templates')
      .select('*')
      .eq('salary_structure_id', salaryStructureId);

    if (error) throw error;
    return data;
  },

  /**
   * Generate payroll for all employees in a period
   */
  async generateBulkPayroll(periodStart: string, periodEnd: string) {
    // Get all active employees with their salary structures
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select(`
        employee_id,
        salary_structure:employee_salary_structures!inner(
          salary_structure_id,
          basic_salary
        )
      `)
      .eq('employment_status', 'ACTIVE')
      .eq('employee_salary_structures.is_current', true);

    if (empError) throw empError;

    if (!employees || employees.length === 0) {
      return [];
    }

    // Create payroll records for each employee
    const payrollRecords = employees.map((emp: any) => ({
      employee_id: emp.employee_id,
      pay_period_start: periodStart,
      pay_period_end: periodEnd,
      basic_salary: emp.salary_structure[0]?.basic_salary || 0,
      allowances: 0,
      deductions: 0,
      status: 'DRAFT',
    }));

    const { data, error } = await supabase
      .from('payroll')
      .insert(payrollRecords)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Get payroll statistics
   */
  async getPayrollStats(year?: number, month?: number) {
    let query = supabase
      .from('payroll')
      .select('status, net_salary');

    if (year && month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte('pay_period_start', startDate).lte('pay_period_end', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = data.reduce((acc, payroll) => {
      acc.total += 1;
      acc[payroll.status.toLowerCase()] = (acc[payroll.status.toLowerCase()] || 0) + 1;
      acc.totalAmount += payroll.net_salary || 0;
      return acc;
    }, {
      total: 0,
      draft: 0,
      processed: 0,
      paid: 0,
      totalAmount: 0,
    });

    return stats;
  },
};
