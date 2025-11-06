import { useState, useEffect } from 'react';
import { Clock, Calendar, Target, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { attendanceApi, leaveApi, performanceApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';

interface EmployeeDashboardProps {
  employee: {
    employee_id: string;
    name: string;
    position: string;
    department: string;
  };
}

export default function EmployeeDashboard({ employee }: EmployeeDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [weekHours, setWeekHours] = useState(0);
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [goalsCompleted, setGoalsCompleted] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [employee.employee_id]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [attendance, balance, avgRating, goals] = await Promise.all([
        attendanceApi.getByEmployee(employee.employee_id, oneWeekAgo),
        leaveApi.getEmployeeBalance(employee.employee_id),
        performanceApi.getEmployeeAverageRating(employee.employee_id),
        performanceApi.getEmployeeGoals(employee.employee_id),
      ]);

      // Calculate week hours
      const totalWeekHours = (attendance || []).reduce((sum: number, r: any) => sum + (r.work_hours || 0), 0);
      setWeekHours(totalWeekHours);

      // Calculate total leave balance
      const totalBalance = (balance || []).reduce((sum: number, b: any) => sum + (b.total_days - b.used_days), 0);
      setLeaveBalance(totalBalance);

      // Set performance score
      setPerformanceScore(avgRating || 0);

      // Count completed goals
      const completed = (goals || []).filter((g: any) => g.status === 'COMPLETED').length;
      setGoalsCompleted(completed);
      setTotalGoals((goals || []).length);
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const quickStats = [
    {
      label: 'Hours This Week',
      value: weekHours.toFixed(1),
      target: '40',
      icon: Clock,
      color: 'blue' as const,
      progress: (weekHours / 40) * 100,
    },
    {
      label: 'Leave Balance',
      value: leaveBalance.toString(),
      target: 'days',
      icon: Calendar,
      color: 'green' as const,
    },
    {
      label: 'Performance Score',
      value: performanceScore.toFixed(1),
      target: '/ 5.0',
      icon: Award,
      color: 'yellow' as const,
    },
    {
      label: 'Goals Completed',
      value: goalsCompleted.toString(),
      target: `/ ${totalGoals}`,
      icon: Target,
      color: 'purple' as const,
      progress: totalGoals > 0 ? (goalsCompleted / totalGoals) * 100 : 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2>Welcome back, {employee.name.split(' ')[0]}! 👋</h2>
        <p className="text-white/60 mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500/20 text-blue-400',
            green: 'bg-green-500/20 text-green-400',
            yellow: 'bg-yellow-500/20 text-yellow-400',
            purple: 'bg-purple-500/20 text-purple-400',
          };
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60">{stat.label}</p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <h2>{stat.value}</h2>
                      <span className="text-white/60">{stat.target}</span>
                    </div>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                </div>
                {stat.progress && (
                  <div className="mt-4">
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
