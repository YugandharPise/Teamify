import { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, CheckCircle2, XCircle, Timer } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { attendanceApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { Attendance } from '../../lib/types';

interface EmployeeAttendanceProps {
  employee: {
    employee_id: string;
    name: string;
  };
}

export default function EmployeeAttendance({ employee }: EmployeeAttendanceProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [weekHours, setWeekHours] = useState(0);
  const [monthHours, setMonthHours] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  // Load attendance data on mount
  useEffect(() => {
    loadAttendanceData();
  }, [employee.employee_id]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);

      // Get date ranges
      const today = new Date().toISOString().split('T')[0];
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch attendance data
      const [historyData, monthStats] = await Promise.all([
        attendanceApi.getByEmployee(employee.employee_id, oneMonthAgo),
        attendanceApi.getEmployeeStats(employee.employee_id, new Date().getFullYear(), new Date().getMonth() + 1)
      ]);

      setAttendanceHistory(historyData || []);

      // Check if already checked in today
      const todayRecord = historyData?.find(record => record.date === today);
      setTodayAttendance(todayRecord || null);
      setIsCheckedIn(!!todayRecord?.check_in_time && !todayRecord?.check_out_time);
      if (todayRecord?.check_in_time) {
        setCurrentTime(formatTime(todayRecord.check_in_time));
      }

      // Calculate week hours (last 7 days)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekRecords = historyData?.filter(r => r.date >= oneWeekAgo && r.work_hours) || [];
      const totalWeekHours = weekRecords.reduce((sum, r) => sum + (r.work_hours || 0), 0);
      setWeekHours(totalWeekHours);

      // Calculate month hours
      const monthRecords = historyData?.filter(r => r.work_hours) || [];
      const totalMonthHours = monthRecords.reduce((sum, r) => sum + (r.work_hours || 0), 0);
      setMonthHours(totalMonthHours);

      // Calculate attendance rate
      if (monthStats && monthStats.total > 0) {
        const rate = ((monthStats.present + monthStats.late) / monthStats.total) * 100;
        setAttendanceRate(Math.round(rate));
      }

    } catch (error: any) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const attendanceStats = [
    {
      label: 'This Week',
      value: `${weekHours.toFixed(1)} hrs`,
      target: '40 hrs',
      icon: Clock,
      color: 'blue' as const,
    },
    {
      label: 'This Month',
      value: `${monthHours.toFixed(1)} hrs`,
      target: '160 hrs',
      icon: Calendar,
      color: 'green' as const,
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceRate}%`,
      icon: TrendingUp,
      color: 'purple' as const,
    },
    {
      label: 'Today',
      value: todayAttendance?.work_hours ? `${todayAttendance.work_hours.toFixed(1)} hrs` : '0 hrs',
      icon: Timer,
      color: 'yellow' as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PRESENT: { label: 'Present', className: 'text-green-400 border-green-400/30 bg-green-500/10' },
      LATE: { label: 'Late', className: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10' },
      ABSENT: { label: 'Absent', className: 'text-red-400 border-red-400/30 bg-red-500/10' },
      HALF_DAY: { label: 'Half Day', className: 'text-orange-400 border-orange-400/30 bg-orange-500/10' },
      ON_LEAVE: { label: 'On Leave', className: 'text-blue-400 border-blue-400/30 bg-blue-500/10' },
      HOLIDAY: { label: 'Holiday', className: 'text-purple-400 border-purple-400/30 bg-purple-500/10' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PRESENT;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleCheckInOut = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      if (isCheckedIn) {
        // Check out
        if (todayAttendance) {
          const checkInTime = new Date(todayAttendance.check_in_time!);
          const checkOutTime = new Date(now);
          const workHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

          await attendanceApi.update(todayAttendance.attendance_id, {
            check_out_time: now,
            work_hours: Math.round(workHours * 10) / 10,
            status: 'PRESENT'
          });

          setIsCheckedIn(false);
          setCurrentTime(formatTime(now));
          toast.success('Checked out successfully');
          await loadAttendanceData();
        }
      } else {
        // Check in
        const newAttendance = await attendanceApi.markAttendance({
          employee_id: employee.employee_id,
          date: today,
          check_in_time: now,
          status: 'PRESENT'
        });

        setIsCheckedIn(true);
        setCurrentTime(formatTime(now));
        setTodayAttendance(newAttendance);
        toast.success('Checked in successfully');
        await loadAttendanceData();
      }
    } catch (error: any) {
      console.error('Error checking in/out:', error);
      toast.error('Failed to update attendance');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Check In/Out Card */}
      <Card className="p-8 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2>
              {isCheckedIn ? 'You are checked in' : 'You are checked out'}
            </h2>
            <p className="text-white/60 mt-2">
              {isCheckedIn ? `Since ${currentTime}` : `At ${currentTime}`}
            </p>
            <div className="flex items-center gap-2 mt-4 justify-center md:justify-start">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span className="text-white/80">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleCheckInOut}
            className={
              isCheckedIn
                ? 'bg-red-600 hover:bg-red-700 text-white px-8'
                : 'bg-green-600 hover:bg-green-700 text-white px-8'
            }
          >
            {isCheckedIn ? (
              <>
                <XCircle className="w-5 h-5 mr-2" />
                Check Out
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Check In
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {attendanceStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500/20 text-blue-400',
            green: 'bg-green-500/20 text-green-400',
            yellow: 'bg-yellow-500/20 text-yellow-400',
            purple: 'bg-purple-500/20 text-purple-400',
          };
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60">{stat.label}</p>
                  <h3 className="mt-2">{stat.value}</h3>
                  {stat.target && (
                    <p className="text-white/40 mt-1">{stat.target}</p>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Attendance History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Attendance History</h3>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading attendance history...</p>
            </div>
          </div>
        ) : attendanceHistory.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No attendance records found</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Check in to start tracking your attendance
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceHistory.map((record: Attendance, index: number) => {
                const date = new Date(record.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <TableRow key={index}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{dayName}</TableCell>
                    <TableCell>{record.check_in_time ? formatTime(record.check_in_time) : '-'}</TableCell>
                    <TableCell>{record.check_out_time ? formatTime(record.check_out_time) : '-'}</TableCell>
                    <TableCell>{record.work_hours ? `${record.work_hours.toFixed(1)} hrs` : '-'}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
