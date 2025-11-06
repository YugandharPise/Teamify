import { useState, useEffect, useRef } from 'react';
import { Users, Calendar, TrendingUp, FileText, UserPlus, DollarSign, Bell, Settings, LogOut, LayoutDashboard, Moon, Sun, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Avatar } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { LeaveManagement } from './components/LeaveManagement';
import { AttendanceTracker } from './components/AttendanceTracker';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { RecruitmentPipeline } from './components/RecruitmentPipeline';
import { PayrollOverview } from './components/PayrollOverview';
import { LoginScreen } from './components/LoginScreen';
import { SettingsPanel } from './components/SettingsPanel';
import EmployeePortal from './components/EmployeePortal';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { authApi, dashboardApi } from './lib/api';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState<'hr' | 'employee'>('employee');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  // Use ref to track authentication state without closure issues
  const isAuthenticatedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // Check authentication status on mount
  useEffect(() => {
    // Safety timeout - if loading takes more than 5 seconds, show login
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(false);
    }, 5000);

    checkAuth().then(() => {
      clearTimeout(timeout);
    });

    // Subscribe to auth state changes
    const { data: authListener } = authApi.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Only show loading and reload data if we're not already authenticated
        // This prevents the loading screen when switching tabs (token refresh)
        if (!isAuthenticatedRef.current) {
          setIsLoading(true);
          await loadUserData();
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setUserRole('employee');
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        // Don't reload user data, we already have it
      }
    });

    return () => {
      clearTimeout(timeout);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const session = await authApi.getSession();
      if (session) {
        await loadUserData();
      } else {
        // No session, show login
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    console.log('🔄 loadUserData called');
    console.log('🔄 About to call authApi.getCurrentUser()...');

    try {
      // getCurrentUser now has internal timeouts, so we don't need an outer one
      // But we'll keep a safety timeout just in case
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Load user data timeout after 12 seconds')), 12000)
      );

      console.log('⏱️ Starting getCurrentUser with 12 second safety timeout...');

      const user = await Promise.race([
        authApi.getCurrentUser(),
        timeoutPromise
      ]);

      console.log('✅ getCurrentUser completed!');
      console.log('📊 Loaded user data:', user);

      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        setUserRole(user.role === 'HR_ADMIN' ? 'hr' : 'employee');
        console.log('✅ User data loaded, role:', user.role);
      } else {
        console.warn('⚠️ No user data returned, logging out');
        await authApi.signOut();
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.error('❌ Error loading user data:', error);
      console.error('❌ Error details:', error.message);

      // Don't sign out on timeout - just show the login screen
      // The user might have a slow connection
      if (error.message?.includes('timeout')) {
        console.warn('⏰ Timeout loading user data - network may be slow');
        toast.error('Loading user data is taking too long. Please check your connection and try again.');
      } else {
        // For other errors, sign them out
        toast.error('Failed to load user data. Please try logging in again.');
        try {
          await authApi.signOut();
        } catch (signOutError) {
          console.error('❌ Error signing out:', signOutError);
        }
      }

      setIsAuthenticated(false);
    } finally {
      console.log('✅ loadUserData finished, stopping loading');
      setIsLoading(false); // CRITICAL: Always stop loading
    }
  };

  // Set document title
  useEffect(() => {
    document.title = isAuthenticated
      ? `TeamifyHR - ${userRole === 'hr' ? 'HR Dashboard' : 'Employee Portal'}`
      : 'TeamifyHR - Login';
  }, [isAuthenticated, userRole]);

  const handleLogin = async () => {
    // Login happens via auth state change listener
    // Just ensure we're not in loading state
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await authApi.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setActiveTab('dashboard');
      setUserRole('employee');
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-foreground rounded-2xl flex items-center justify-center animate-pulse">
            <Users className="w-8 h-8 text-background" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Show Employee Portal if logged in as employee
  if (userRole === 'employee') {
    return (
      <>
        <EmployeePortal />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 bg-card border-r border-border flex flex-col"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center"
              >
                <Users className="w-5 h-5 text-background" />
              </motion.div>
              <div className="flex-1">
                <h1 className="text-foreground">TeamifyHR</h1>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <motion.button
              onClick={() => setActiveTab('dashboard')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('employees')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'employees' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Employees</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('attendance')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'attendance' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Attendance</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('leave')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'leave' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Leave Requests</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('performance')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'performance' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Performance</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('recruitment')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'recruitment' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span>Recruitment</span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('payroll')}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'payroll' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              <span>Payroll</span>
            </motion.button>
          </nav>
          
          <div className="p-4 border-t border-border space-y-1">
            <motion.button 
              onClick={() => setSettingsOpen(true)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </motion.button>
            <motion.button 
              onClick={handleLogout}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-foreground">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'employees' && 'Employee Directory'}
                {activeTab === 'attendance' && 'Attendance Tracking'}
                {activeTab === 'leave' && 'Leave Management'}
                {activeTab === 'performance' && 'Performance Reviews'}
                {activeTab === 'recruitment' && 'Recruitment Pipeline'}
                {activeTab === 'payroll' && 'Payroll Overview'}
              </h2>
              <p className="text-muted-foreground">Welcome back, Admin</p>
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
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
                onClick={() => toast.info('3 new notifications')}
              >
                <Bell className="w-5 h-5" />
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                />
              </motion.button>
              
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <Avatar className="w-10 h-10 bg-accent text-foreground flex items-center justify-center">
                  <div className="flex items-center justify-center w-full h-full">
                    {currentUser?.email ? currentUser.email.substring(0, 2).toUpperCase() : 'HR'}
                  </div>
                </Avatar>
                <div>
                  <p className="text-foreground">{currentUser?.email || 'HR Admin'}</p>
                  <p className="text-muted-foreground">
                    {currentUser?.role === 'HR_ADMIN' ? 'HR Manager' : 'User'}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'dashboard' && <DashboardContent onNavigate={setActiveTab} />}
                {activeTab === 'employees' && <EmployeeDirectory />}
                {activeTab === 'attendance' && <AttendanceTracker />}
                {activeTab === 'leave' && <LeaveManagement />}
                {activeTab === 'performance' && <PerformanceDashboard />}
                {activeTab === 'recruitment' && <RecruitmentPipeline />}
                {activeTab === 'payroll' && <PayrollOverview />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Settings Panel */}
        <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
      <Toaster />
    </>
  );
}

function DashboardContent({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [showReports, setShowReports] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, deptsData, activityData] = await Promise.all([
        dashboardApi.getHRStats(),
        dashboardApi.getDepartmentOverview(),
        dashboardApi.getRecentActivity(5),
      ]);

      setStats(statsData);
      setDepartments(deptsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-foreground rounded-xl flex items-center justify-center animate-pulse">
            <LayoutDashboard className="w-6 h-6 text-background" />
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Total Employees</p>
                <h3 className="text-foreground mt-1">{stats?.totalEmployees || 0}</h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center"
              >
                <Users className="w-6 h-6 text-foreground" />
              </motion.div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Present Today</p>
                <h3 className="text-foreground mt-1">{stats?.presentToday || 0}</h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center"
              >
                <Calendar className="w-6 h-6 text-foreground" />
              </motion.div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-foreground border-border">
                {stats?.attendanceRate || '0%'} attendance
              </Badge>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Pending Leaves</p>
                <h3 className="text-foreground mt-1">{stats?.pendingLeaves || 0}</h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center"
              >
                <FileText className="w-6 h-6 text-foreground" />
              </motion.div>
            </div>
            {stats?.pendingLeaves > 0 && (
              <div className="mt-4">
                <Badge variant="outline" className="text-foreground border-border">
                  Requires action
                </Badge>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Open Positions</p>
                <h3 className="text-foreground mt-1">{stats?.openPositions || 0}</h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center"
              >
                <UserPlus className="w-6 h-6 text-foreground" />
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-card border-border">
          <h3 className="text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity to display
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
                  <Avatar className="w-10 h-10 bg-accent flex items-center justify-center">
                    <div className="flex items-center justify-center w-full h-full text-foreground">
                      {activity.user_name ? activity.user_name.split(' ').map((n: string) => n[0]).join('') : '?'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-foreground">
                      <span>{activity.user_name || 'Unknown'}</span> {activity.action}
                    </p>
                    <p className="text-muted-foreground">{activity.time || 'Recently'}</p>
                  </div>
                  <Badge variant="outline">
                    {activity.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h3 className="text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate('employees')}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Employee
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate('leave')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Review Leave Requests
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate('attendance')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => onNavigate('payroll')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Process Payroll
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setShowReports(true)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Generate Reports
            </Button>
          </div>
        </Card>
      </div>

      {/* Department Overview */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-foreground mb-4">Department Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {departments.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No departments found
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-lg bg-accent border border-border">
                <p className="text-foreground">{dept.name}</p>
                <p className="text-muted-foreground">{dept.count} employees</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Generate Reports Dialog */}
      <Dialog open={showReports} onOpenChange={setShowReports}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Generate Reports</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select the type of report you want to generate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Employee Directory Report generated');
                setShowReports(false);
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Employee Directory Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Attendance Report generated');
                setShowReports(false);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Attendance Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Leave Report generated');
                setShowReports(false);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Leave Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Performance Report generated');
                setShowReports(false);
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Payroll Report generated');
                setShowReports(false);
              }}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Payroll Report
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                toast.success('Custom Report generated');
                setShowReports(false);
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Custom Report
            </Button>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReports(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
