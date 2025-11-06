import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Target,
  DollarSign,
  User,
  Bell,
  LogOut,
  Clock,
  Award,
  TrendingUp,
  Moon,
  Sun,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import EmployeeDashboard from './employee/EmployeeDashboard';
import EmployeeAttendance from './employee/EmployeeAttendance';
import EmployeeLeaveRequests from './employee/EmployeeLeaveRequests';
import EmployeePerformance from './employee/EmployeePerformance';
import EmployeePayroll from './employee/EmployeePayroll';
import EmployeeProfile from './employee/EmployeeProfile';
import { useTheme } from './ThemeProvider';
import { authApi } from '../lib/api';
import { toast } from 'sonner@2.0.3';

type ViewType = 'dashboard' | 'attendance' | 'leave' | 'performance' | 'payroll' | 'profile';

export default function EmployeePortal() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [notifications, setNotifications] = useState(3);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  // Load employee data on mount
  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      const employee = await authApi.getCurrentEmployee();

      if (employee) {
        // Transform to match the expected format
        const transformedEmployee = {
          id: employee.employee_id,
          name: `${employee.first_name} ${employee.last_name}`,
          email: employee.email,
          position: employee.position?.position_name || 'Employee',
          department: employee.department?.department_name || 'N/A',
          employeeId: employee.employee_code,
          avatar: `${employee.first_name[0]}${employee.last_name[0]}`,
          joinDate: employee.join_date,
          ...employee, // Include all other employee data
        };

        setCurrentEmployee(transformedEmployee);
        console.log('✅ Loaded employee data:', transformedEmployee);
      }
    } catch (error: any) {
      console.error('❌ Error loading employee data:', error);
      toast.error('Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: Calendar },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const renderContent = () => {
    if (!currentEmployee) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <EmployeeDashboard employee={currentEmployee} />;
      case 'attendance':
        return <EmployeeAttendance employee={currentEmployee} />;
      case 'leave':
        return <EmployeeLeaveRequests employee={currentEmployee} />;
      case 'performance':
        return <EmployeePerformance employee={currentEmployee} />;
      case 'payroll':
        return <EmployeePayroll employee={currentEmployee} />;
      case 'profile':
        return <EmployeeProfile employee={currentEmployee} />;
      default:
        return <EmployeeDashboard employee={currentEmployee} />;
    }
  };

  if (isLoading || !currentEmployee) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-foreground rounded-2xl flex items-center justify-center animate-pulse">
            <User className="w-8 h-8 text-background" />
          </div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-card border-r border-border flex flex-col"
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center"
            >
              <User className="w-5 h-5 text-background" />
            </motion.div>
            <h1 className="text-foreground">TeamifyHR</h1>
          </div>
        </div>

        {/* Employee Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 bg-accent text-foreground flex items-center justify-center">
              <div className="flex items-center justify-center w-full h-full">
                {currentEmployee.avatar}
              </div>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{currentEmployee.name}</p>
              <p className="text-muted-foreground truncate">{currentEmployee.position}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewType)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div>
            <h2 className="text-foreground">
              {navItems.find((item) => item.id === currentView)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.button 
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            <button className="relative p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
