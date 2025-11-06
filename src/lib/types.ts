// Database types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string
          email: string
          password_hash: string | null
          role: 'HR_ADMIN' | 'EMPLOYEE'
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: string
          email: string
          password_hash?: string | null
          role?: 'HR_ADMIN' | 'EMPLOYEE'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          password_hash?: string | null
          role?: 'HR_ADMIN' | 'EMPLOYEE'
          is_active?: boolean
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          employee_id: string
          user_id: string | null
          first_name: string
          last_name: string
          employee_code: string
          phone: string | null
          date_of_birth: string | null
          gender: 'MALE' | 'FEMALE' | 'OTHER' | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          department_id: string | null
          position_id: string | null
          manager_id: string | null
          join_date: string
          employment_status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED'
          employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          employee_id?: string
          user_id?: string | null
          first_name: string
          last_name: string
          employee_code: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          department_id?: string | null
          position_id?: string | null
          manager_id?: string | null
          join_date: string
          employment_status?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED'
          employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          employee_id?: string
          user_id?: string | null
          first_name?: string
          last_name?: string
          employee_code?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          department_id?: string | null
          position_id?: string | null
          manager_id?: string | null
          join_date?: string
          employment_status?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RESIGNED'
          employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          department_id: string
          department_name: string
          description: string | null
          head_employee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          department_id?: string
          department_name: string
          description?: string | null
          head_employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          department_id?: string
          department_name?: string
          description?: string | null
          head_employee_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      positions: {
        Row: {
          position_id: string
          position_title: string
          department_id: string | null
          description: string | null
          level: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          position_id?: string
          position_title: string
          department_id?: string | null
          description?: string | null
          level?: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          position_id?: string
          position_title?: string
          department_id?: string | null
          description?: string | null
          level?: 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER' | 'DIRECTOR' | null
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          attendance_id: string
          employee_id: string
          date: string
          check_in_time: string | null
          check_out_time: string | null
          status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY'
          work_hours: number | null
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          attendance_id?: string
          employee_id: string
          date: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY'
          work_hours?: number | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          attendance_id?: string
          employee_id?: string
          date?: string
          check_in_time?: string | null
          check_out_time?: string | null
          status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LATE' | 'ON_LEAVE' | 'HOLIDAY'
          work_hours?: number | null
          location?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_types: {
        Row: {
          leave_type_id: string
          type_name: string
          description: string | null
          default_days_per_year: number
          requires_documentation: boolean
          is_paid: boolean
          created_at: string
        }
        Insert: {
          leave_type_id?: string
          type_name: string
          description?: string | null
          default_days_per_year?: number
          requires_documentation?: boolean
          is_paid?: boolean
          created_at?: string
        }
        Update: {
          leave_type_id?: string
          type_name?: string
          description?: string | null
          default_days_per_year?: number
          requires_documentation?: boolean
          is_paid?: boolean
          created_at?: string
        }
      }
      leave_balances: {
        Row: {
          leave_balance_id: string
          employee_id: string
          leave_type_id: string
          year: number
          total_days: number
          used_days: number
          remaining_days: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          leave_balance_id?: string
          employee_id: string
          leave_type_id: string
          year: number
          total_days: number
          used_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          leave_balance_id?: string
          employee_id?: string
          leave_type_id?: string
          year?: number
          total_days?: number
          used_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          leave_request_id: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          total_days: number
          reason: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
          applied_date: string
          reviewed_by: string | null
          reviewed_date: string | null
          reviewer_comments: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          leave_request_id?: string
          employee_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          total_days: number
          reason?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
          applied_date?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          reviewer_comments?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          leave_request_id?: string
          employee_id?: string
          leave_type_id?: string
          start_date?: string
          end_date?: string
          total_days?: number
          reason?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
          applied_date?: string
          reviewed_by?: string | null
          reviewed_date?: string | null
          reviewer_comments?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      performance_reviews: {
        Row: {
          review_id: string
          employee_id: string
          reviewer_id: string
          review_period_start: string | null
          review_period_end: string | null
          review_date: string
          overall_rating: number | null
          technical_skills_rating: number | null
          communication_rating: number | null
          teamwork_rating: number | null
          leadership_rating: number | null
          punctuality_rating: number | null
          strengths: string | null
          areas_for_improvement: string | null
          goals_achieved: string | null
          comments: string | null
          status: 'DRAFT' | 'COMPLETED' | 'ACKNOWLEDGED'
          created_at: string
          updated_at: string
        }
        Insert: {
          review_id?: string
          employee_id: string
          reviewer_id: string
          review_period_start?: string | null
          review_period_end?: string | null
          review_date?: string
          overall_rating?: number | null
          technical_skills_rating?: number | null
          communication_rating?: number | null
          teamwork_rating?: number | null
          leadership_rating?: number | null
          punctuality_rating?: number | null
          strengths?: string | null
          areas_for_improvement?: string | null
          goals_achieved?: string | null
          comments?: string | null
          status?: 'DRAFT' | 'COMPLETED' | 'ACKNOWLEDGED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          review_id?: string
          employee_id?: string
          reviewer_id?: string
          review_period_start?: string | null
          review_period_end?: string | null
          review_date?: string
          overall_rating?: number | null
          technical_skills_rating?: number | null
          communication_rating?: number | null
          teamwork_rating?: number | null
          leadership_rating?: number | null
          punctuality_rating?: number | null
          strengths?: string | null
          areas_for_improvement?: string | null
          goals_achieved?: string | null
          comments?: string | null
          status?: 'DRAFT' | 'COMPLETED' | 'ACKNOWLEDGED'
          created_at?: string
          updated_at?: string
        }
      }
      job_postings: {
        Row: {
          job_posting_id: string
          job_title: string
          department_id: string | null
          position_id: string | null
          description: string | null
          requirements: string | null
          responsibilities: string | null
          employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          location: string | null
          salary_range_min: number | null
          salary_range_max: number | null
          openings: number
          status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ON_HOLD'
          posted_date: string | null
          closing_date: string | null
          posted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          job_posting_id?: string
          job_title: string
          department_id?: string | null
          position_id?: string | null
          description?: string | null
          requirements?: string | null
          responsibilities?: string | null
          employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          location?: string | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          openings?: number
          status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ON_HOLD'
          posted_date?: string | null
          closing_date?: string | null
          posted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          job_posting_id?: string
          job_title?: string
          department_id?: string | null
          position_id?: string | null
          description?: string | null
          requirements?: string | null
          responsibilities?: string | null
          employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
          location?: string | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          openings?: number
          status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ON_HOLD'
          posted_date?: string | null
          closing_date?: string | null
          posted_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applicants: {
        Row: {
          applicant_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          resume_url: string | null
          cover_letter: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          applicant_id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          resume_url?: string | null
          cover_letter?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          application_id: string
          job_posting_id: string
          applicant_id: string
          application_date: string
          status: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'REJECTED'
          current_stage: string | null
          notes: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          application_id?: string
          job_posting_id: string
          applicant_id: string
          application_date?: string
          status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'REJECTED'
          current_stage?: string | null
          notes?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          job_posting_id?: string
          applicant_id?: string
          application_date?: string
          status?: 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEWED' | 'OFFERED' | 'HIRED' | 'REJECTED'
          current_stage?: string | null
          notes?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payroll: {
        Row: {
          payroll_id: string
          employee_id: string
          pay_period_start: string
          pay_period_end: string
          payment_date: string | null
          basic_salary: number
          allowances: number
          deductions: number
          gross_salary: number | null
          net_salary: number | null
          status: 'DRAFT' | 'PROCESSED' | 'PAID'
          payment_method: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | null
          transaction_reference: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          payroll_id?: string
          employee_id: string
          pay_period_start: string
          pay_period_end: string
          payment_date?: string | null
          basic_salary: number
          allowances?: number
          deductions?: number
          status?: 'DRAFT' | 'PROCESSED' | 'PAID'
          payment_method?: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | null
          transaction_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          payroll_id?: string
          employee_id?: string
          pay_period_start?: string
          pay_period_end?: string
          payment_date?: string | null
          basic_salary?: number
          allowances?: number
          deductions?: number
          status?: 'DRAFT' | 'PROCESSED' | 'PAID'
          payment_method?: 'BANK_TRANSFER' | 'CHECK' | 'CASH' | null
          transaction_reference?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          notification_id: string
          user_id: string
          title: string
          message: string
          type: 'LEAVE_REQUEST' | 'ATTENDANCE' | 'PERFORMANCE' | 'RECRUITMENT' | 'PAYROLL' | 'SYSTEM' | 'ANNOUNCEMENT'
          priority: 'LOW' | 'MEDIUM' | 'HIGH'
          is_read: boolean
          related_entity_type: string | null
          related_entity_id: string | null
          action_url: string | null
          created_at: string
          read_at: string | null
        }
        Insert: {
          notification_id?: string
          user_id: string
          title: string
          message: string
          type: 'LEAVE_REQUEST' | 'ATTENDANCE' | 'PERFORMANCE' | 'RECRUITMENT' | 'PAYROLL' | 'SYSTEM' | 'ANNOUNCEMENT'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          is_read?: boolean
          related_entity_type?: string | null
          related_entity_id?: string | null
          action_url?: string | null
          created_at?: string
          read_at?: string | null
        }
        Update: {
          notification_id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'LEAVE_REQUEST' | 'ATTENDANCE' | 'PERFORMANCE' | 'RECRUITMENT' | 'PAYROLL' | 'SYSTEM' | 'ANNOUNCEMENT'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH'
          is_read?: boolean
          related_entity_type?: string | null
          related_entity_id?: string | null
          action_url?: string | null
          created_at?: string
          read_at?: string | null
        }
      }
      holidays: {
        Row: {
          holiday_id: string
          holiday_name: string
          holiday_date: string
          description: string | null
          is_mandatory: boolean
          created_at: string
        }
        Insert: {
          holiday_id?: string
          holiday_name: string
          holiday_date: string
          description?: string | null
          is_mandatory?: boolean
          created_at?: string
        }
        Update: {
          holiday_id?: string
          holiday_name?: string
          holiday_date?: string
          description?: string | null
          is_mandatory?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Department = Database['public']['Tables']['departments']['Row']
export type Position = Database['public']['Tables']['positions']['Row']

export type Attendance = Database['public']['Tables']['attendance']['Row']
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']

export type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
export type LeaveRequestInsert = Database['public']['Tables']['leave_requests']['Insert']
export type LeaveRequestUpdate = Database['public']['Tables']['leave_requests']['Update']

export type LeaveType = Database['public']['Tables']['leave_types']['Row']
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row']

export type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row']
export type PerformanceReviewInsert = Database['public']['Tables']['performance_reviews']['Insert']

export type JobPosting = Database['public']['Tables']['job_postings']['Row']
export type JobPostingInsert = Database['public']['Tables']['job_postings']['Insert']

export type Applicant = Database['public']['Tables']['applicants']['Row']
export type Application = Database['public']['Tables']['applications']['Row']

export type Payroll = Database['public']['Tables']['payroll']['Row']
export type PayrollInsert = Database['public']['Tables']['payroll']['Insert']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type Holiday = Database['public']['Tables']['holidays']['Row']

// Extended types with joined data (for display)
export interface EmployeeWithDetails extends Employee {
  department?: Department | null
  position?: Position | null
  manager?: Employee | null
}

export interface LeaveRequestWithDetails extends LeaveRequest {
  employee?: Employee | null
  leave_type?: LeaveType | null
  reviewer?: Employee | null
}

export interface AttendanceWithDetails extends Attendance {
  employee?: Employee | null
}

export interface PerformanceReviewWithDetails extends PerformanceReview {
  employee?: Employee | null
  reviewer?: Employee | null
}

export interface ApplicationWithDetails extends Application {
  job_posting?: JobPosting | null
  applicant?: Applicant | null
}

export interface PayrollWithDetails extends Payroll {
  employee?: Employee | null
}
