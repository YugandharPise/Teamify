import { supabase } from '../supabase';
import type { EmployeeInsert, EmployeeUpdate } from '../types';

export const employeesApi = {
  /**
   * Get all employees with department and position details
   */
  async getAll() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(department_id, department_name),
        position:positions(position_id, position_title),
        manager:employees!employees_manager_id_fkey(employee_id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single employee by ID
   */
  async getById(employeeId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(*),
        position:positions(*),
        manager:employees!employees_manager_id_fkey(*)
      `)
      .eq('employee_id', employeeId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get employee by user ID
   */
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(*),
        position:positions(*),
        manager:employees!employees_manager_id_fkey(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new employee
   */
  async create(employee: EmployeeInsert) {
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an employee
   */
  async update(employeeId: string, updates: EmployeeUpdate) {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('employee_id', employeeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an employee
   */
  async delete(employeeId: string) {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('employee_id', employeeId);

    if (error) throw error;
  },

  /**
   * Search employees by name or email
   */
  async search(query: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(department_id, department_name),
        position:positions(position_id, position_title)
      `)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,employee_code.ilike.%${query}%`);

    if (error) throw error;
    return data;
  },

  /**
   * Get employees by department
   */
  async getByDepartment(departmentId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(*),
        position:positions(*)
      `)
      .eq('department_id', departmentId);

    if (error) throw error;
    return data;
  },

  /**
   * Get employee count by status
   */
  async getCountByStatus() {
    const { data, error } = await supabase
      .from('employees')
      .select('employment_status');

    if (error) throw error;

    const counts = data.reduce((acc, emp) => {
      acc[emp.employment_status] = (acc[emp.employment_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  },
};

export const departmentsApi = {
  /**
   * Get all departments
   */
  async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('department_name');

    if (error) throw error;
    return data;
  },

  /**
   * Get a single department by ID
   */
  async getById(departmentId: string) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('department_id', departmentId)
      .single();

    if (error) throw error;
    return data;
  },
};

export const positionsApi = {
  /**
   * Get all positions
   */
  async getAll() {
    const { data, error } = await supabase
      .from('positions')
      .select(`
        *,
        department:departments(department_id, department_name)
      `)
      .order('position_title');

    if (error) throw error;
    return data;
  },

  /**
   * Get positions by department
   */
  async getByDepartment(departmentId: string) {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('department_id', departmentId);

    if (error) throw error;
    return data;
  },
};
