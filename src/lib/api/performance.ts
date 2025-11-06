import { supabase } from '../supabase';
import type { PerformanceReviewInsert } from '../types';

export const performanceApi = {
  /**
   * Get all performance reviews
   */
  async getAllReviews() {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:employees(employee_id, first_name, last_name, employee_code,
          department:departments(department_name),
          position:positions(position_title)
        ),
        reviewer:employees!performance_reviews_reviewer_id_fkey(employee_id, first_name, last_name)
      `)
      .order('review_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get reviews for a specific employee
   */
  async getEmployeeReviews(employeeId: string) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        reviewer:employees!performance_reviews_reviewer_id_fkey(employee_id, first_name, last_name)
      `)
      .eq('employee_id', employeeId)
      .order('review_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single review by ID
   */
  async getReviewById(reviewId: string) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        *,
        employee:employees(*,
          department:departments(*),
          position:positions(*)
        ),
        reviewer:employees!performance_reviews_reviewer_id_fkey(*)
      `)
      .eq('review_id', reviewId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a performance review
   */
  async createReview(review: PerformanceReviewInsert) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a performance review
   */
  async updateReview(reviewId: string, updates: Partial<PerformanceReviewInsert>) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .update(updates)
      .eq('review_id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a performance review
   */
  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('performance_reviews')
      .delete()
      .eq('review_id', reviewId);

    if (error) throw error;
  },

  /**
   * Get goals for an employee
   */
  async getEmployeeGoals(employeeId: string) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Create a goal
   */
  async createGoal(goal: {
    employee_id: string;
    goal_title: string;
    goal_description?: string;
    target_date?: string;
    created_by: string;
    review_id?: string;
  }) {
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a goal
   */
  async updateGoal(goalId: string, updates: {
    goal_title?: string;
    goal_description?: string;
    target_date?: string;
    status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    completion_date?: string;
  }) {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('goal_id', goalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get top performers
   */
  async getTopPerformers(limit: number = 5) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select(`
        employee_id,
        overall_rating,
        employee:employees(employee_id, first_name, last_name,
          department:departments(department_name),
          position:positions(position_title)
        )
      `)
      .not('overall_rating', 'is', null)
      .order('overall_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Get average rating for an employee
   */
  async getEmployeeAverageRating(employeeId: string) {
    const { data, error } = await supabase
      .from('performance_reviews')
      .select('overall_rating')
      .eq('employee_id', employeeId)
      .not('overall_rating', 'is', null);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const sum = data.reduce((acc, review) => acc + (review.overall_rating || 0), 0);
    return sum / data.length;
  },
};
