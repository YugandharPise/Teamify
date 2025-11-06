# TeamifyHR - HR Management Software

A comprehensive HR Management System built with React, TypeScript, Vite, and Supabase. This application provides both HR admin and employee portal interfaces for managing all aspects of human resources operations.

Original Figma design: https://www.figma.com/design/ao6vuVIbRzJCBKcuRbdEL8/HR-Management-Software--Community-

## Features

### HR Admin Features
- **Employee Directory**: Complete employee management with search, filter, add/edit functionality
- **Attendance Tracking**: Daily attendance marking, reports, and statistics
- **Leave Management**: Leave requests approval and balance tracking
- **Performance Reviews**: Employee performance evaluations and goal tracking
- **Recruitment Pipeline**: Job postings and applicant tracking system
- **Payroll Management**: Salary processing and payslip generation
- **Dashboard**: Overview of all HR metrics and recent activities

### Employee Portal Features
- **Personal Dashboard**: Quick overview of attendance, leave, and tasks
- **Attendance**: View personal attendance history
- **Leave Requests**: Apply for leave and track approvals
- **Performance**: View performance reviews and goals
- **Payroll**: Access payslips and salary information
- **Profile**: Update personal information

### Additional Features
- **Authentication**: Secure login with role-based access (HR Admin / Employee)
- **Dark Mode**: Light and dark theme support with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Updates**: Instant data synchronization with Supabase
- **Row Level Security**: Database-level security policies

## Tech Stack

- **Frontend Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.1.3
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Notifications**: Sonner

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier available at https://supabase.com)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "HR Management Software (Community)"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including `@supabase/supabase-js`.

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully set up (this takes a few minutes)
3. Go to **SQL Editor** in your Supabase dashboard
4. Open the `DATABASE.md` file in this project
5. Copy ALL the SQL code from `DATABASE.md`
6. Paste it into the Supabase SQL Editor
7. Click **Run** to execute the schema creation

### 4. Configure Environment Variables

1. In your Supabase project, go to **Project Settings** → **API**
2. Copy your **Project URL** and **anon/public** key
3. Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

4. Edit `.env.local` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 6. Create Your First User

#### Option A: Using the Sign Up Page
1. Click "Sign Up" on the login screen
2. Fill in your details
3. Choose HR Admin role if you want admin access
4. Complete registration

#### Option B: Directly in Supabase (For HR Admin)
1. Go to Supabase **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. After creating the user, go to **SQL Editor** and run:

```sql
-- Create HR Admin user
INSERT INTO users (user_id, email, role)
VALUES ('auth_user_id_here', 'admin@example.com', 'HR_ADMIN');

-- Create employee record
INSERT INTO employees (user_id, first_name, last_name, employee_code, join_date, employment_status)
VALUES ('auth_user_id_here', 'Admin', 'User', 'EMP-0001', CURRENT_DATE, 'ACTIVE');
```

Replace `auth_user_id_here` with the actual user ID from Supabase Auth.

## Login Credentials (After Setup)

### HR Admin
- Email: The email you created in Supabase
- Password: The password you set
- Role: Automatically detected based on `users` table

### Employee
- Email: Any employee email created in the system
- Password: Their password
- Role: Automatically detected based on `users` table

## Build for Production

```bash
npm run build
```

The production build will be created in the `build/` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── employee/       # Employee portal components
│   └── ...             # Feature components
├── lib/                # Utilities and configurations
│   ├── api/           # API service layer
│   │   ├── auth.ts
│   │   ├── employees.ts
│   │   ├── attendance.ts
│   │   ├── leave.ts
│   │   ├── performance.ts
│   │   ├── recruitment.ts
│   │   └── payroll.ts
│   ├── supabase.ts    # Supabase client
│   └── types.ts       # TypeScript types
├── App.tsx            # Main application component
└── main.tsx           # Entry point
```

## Database Schema

The application uses a comprehensive database schema with 23+ tables including:

- **Users & Employees**: Authentication and employee profiles
- **Departments & Positions**: Organizational structure
- **Attendance**: Daily attendance tracking
- **Leave Management**: Leave types, balances, and requests
- **Performance**: Reviews and goals
- **Recruitment**: Job postings, applicants, and applications
- **Payroll**: Salary structures and payroll processing
- **Notifications**: System notifications
- **Activity Logs**: Audit trail
- **Documents**: Employee document storage
- **Settings**: User preferences
- **Holidays**: Company holiday calendar

See `DATABASE_DESIGN.md` for detailed entity-relationship documentation.

## API Documentation

All API functions are organized in `src/lib/api/`:

### Authentication API (`auth.ts`)
- `signUp(data)` - Register new user
- `signIn(data)` - Login user
- `signOut()` - Logout
- `getCurrentUser()` - Get current user with role
- `getCurrentEmployee()` - Get current employee profile

### Employees API (`employees.ts`)
- `getAll()` - Get all employees
- `getById(id)` - Get employee by ID
- `create(data)` - Create new employee
- `update(id, data)` - Update employee
- `search(query)` - Search employees

### Attendance API (`attendance.ts`)
- `getAll()` - Get all attendance records
- `getByDate(date)` - Get attendance for specific date
- `markAttendance(data)` - Mark attendance
- `getTodaySummary()` - Get today's statistics

### Leave API (`leave.ts`)
- `getAllRequests()` - Get all leave requests
- `createRequest(data)` - Create leave request
- `approveRequest(id, reviewerId)` - Approve request
- `rejectRequest(id, reviewerId)` - Reject request
- `getEmployeeBalance(employeeId)` - Get leave balance

### Performance API (`performance.ts`)
- `getAllReviews()` - Get all reviews
- `createReview(data)` - Create performance review
- `getEmployeeGoals(employeeId)` - Get employee goals
- `getTopPerformers(limit)` - Get top performers

### Recruitment API (`recruitment.ts`)
- `getAllJobPostings()` - Get all job postings
- `createJobPosting(data)` - Create job posting
- `getAllApplications()` - Get all applications
- `updateApplicationStatus(id, status)` - Update application

### Payroll API (`payroll.ts`)
- `getAllPayroll()` - Get all payroll records
- `createPayroll(data)` - Create payroll
- `processPayroll(id, method)` - Process payroll
- `generateBulkPayroll(start, end)` - Generate for all employees

## Security Features

### Row Level Security (RLS)
All database tables have RLS policies that ensure:
- HR Admins have full access to all data
- Employees can only view/edit their own data
- Proper authentication is required for all operations

### Authentication
- Secure password hashing via Supabase Auth
- Session management with automatic refresh
- Role-based access control (RBAC)

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists with correct values
- Restart the dev server after adding environment variables

### Database connection errors
- Verify your Supabase project is active
- Check that the API URL and key are correct
- Ensure you've run the SQL schema from `DATABASE.md`

### RLS policy errors
- Make sure you're logged in
- Verify the user exists in both auth.users and the users table
- Check the user's role in the users table

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## License

MIT License

---

**Built with ❤️ using React, TypeScript, and Supabase**
