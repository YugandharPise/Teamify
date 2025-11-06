import { supabase } from '../supabase';
import type { JobPostingInsert } from '../types';

export const recruitmentApi = {
  /**
   * Get all job postings
   */
  async getAllJobPostings() {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(department_id, department_name),
        position:positions(position_id, position_title),
        posted_by_employee:employees!job_postings_posted_by_fkey(employee_id, first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get active job postings
   */
  async getActiveJobPostings() {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(department_id, department_name),
        position:positions(position_id, position_title)
      `)
      .eq('status', 'ACTIVE')
      .order('posted_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single job posting
   */
  async getJobPostingById(jobPostingId: string) {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        department:departments(*),
        position:positions(*),
        posted_by_employee:employees!job_postings_posted_by_fkey(*)
      `)
      .eq('job_posting_id', jobPostingId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a job posting
   */
  async createJobPosting(jobPosting: JobPostingInsert) {
    const { data, error } = await supabase
      .from('job_postings')
      .insert(jobPosting)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a job posting
   */
  async updateJobPosting(jobPostingId: string, updates: Partial<JobPostingInsert>) {
    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('job_posting_id', jobPostingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a job posting
   */
  async deleteJobPosting(jobPostingId: string) {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('job_posting_id', jobPostingId);

    if (error) throw error;
  },

  /**
   * Get all applications
   */
  async getAllApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_posting:job_postings(job_posting_id, job_title, department:departments(department_name)),
        applicant:applicants(*)
      `)
      .order('application_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get applications for a job posting
   */
  async getApplicationsByJobPosting(jobPostingId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        applicant:applicants(*)
      `)
      .eq('job_posting_id', jobPostingId)
      .order('application_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get application by ID
   */
  async getApplicationById(applicationId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_posting:job_postings(*,
          department:departments(*),
          position:positions(*)
        ),
        applicant:applicants(*)
      `)
      .eq('application_id', applicationId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create an applicant
   */
  async createApplicant(applicant: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    cover_letter?: string;
    linkedin_url?: string;
    portfolio_url?: string;
  }) {
    const { data, error } = await supabase
      .from('applicants')
      .insert(applicant)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create an application
   */
  async createApplication(application: {
    job_posting_id: string;
    applicant_id: string;
    status?: string;
    current_stage?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update application status
   */
  async updateApplicationStatus(
    applicationId: string,
    status: string,
    currentStage?: string,
    notes?: string
  ) {
    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        current_stage: currentStage,
        notes,
      })
      .eq('application_id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(status: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_posting:job_postings(job_posting_id, job_title),
        applicant:applicants(*)
      `)
      .eq('status', status);

    if (error) throw error;
    return data;
  },

  /**
   * Schedule an interview
   */
  async scheduleInterview(interview: {
    application_id: string;
    interview_type: string;
    scheduled_date: string;
    interviewer_id: string;
    location?: string;
    meeting_link?: string;
  }) {
    const { data, error } = await supabase
      .from('interview_schedules')
      .insert(interview)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get interviews for an application
   */
  async getApplicationInterviews(applicationId: string) {
    const { data, error } = await supabase
      .from('interview_schedules')
      .select(`
        *,
        interviewer:employees(employee_id, first_name, last_name)
      `)
      .eq('application_id', applicationId)
      .order('scheduled_date');

    if (error) throw error;
    return data;
  },

  /**
   * Update interview feedback
   */
  async updateInterviewFeedback(
    interviewId: string,
    feedback: string,
    rating: number,
    status: string
  ) {
    const { data, error } = await supabase
      .from('interview_schedules')
      .update({
        feedback,
        rating,
        status,
      })
      .eq('interview_id', interviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get recruitment statistics
   */
  async getRecruitmentStats() {
    const { data: jobPostings, error: jpError } = await supabase
      .from('job_postings')
      .select('status');

    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('status');

    if (jpError || appError) throw jpError || appError;

    const jobStats = jobPostings?.reduce((acc, jp) => {
      acc[jp.status] = (acc[jp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const appStats = applications?.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalJobPostings: jobPostings?.length || 0,
      activeJobPostings: jobStats.ACTIVE || 0,
      totalApplications: applications?.length || 0,
      pendingApplications: appStats.SUBMITTED || 0,
      shortlisted: appStats.SHORTLISTED || 0,
      interviewed: appStats.INTERVIEWED || 0,
      hired: appStats.HIRED || 0,
    };
  },
};
