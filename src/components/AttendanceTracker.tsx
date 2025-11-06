import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { attendanceApi } from '../lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

export function AttendanceTracker() {
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      const records = await attendanceApi.getByDate(selectedDate);

      // Transform data for display
      const transformed = records.map((record: any) => ({
        id: record.attendance_id,
        employee: `${record.employee?.first_name} ${record.employee?.last_name}`,
        department: record.employee?.department?.department_name || 'N/A',
        date: record.date,
        checkIn: record.check_in_time ? formatTime(record.check_in_time) : '-',
        checkOut: record.check_out_time ? formatTime(record.check_out_time) : '-',
        status: formatStatus(record.status),
        workHours: calculateWorkHours(record.check_in_time, record.check_out_time),
        employeeId: record.employee_id,
      }));

      setAttendanceRecords(transformed);

      // Load monthly stats
      const monthStats = await attendanceApi.getStatistics(
        selectedDate.substring(0, 7) + '-01',
        selectedDate.substring(0, 7) + '-31'
      );
      setStats(monthStats);

      console.log('✅ Loaded attendance:', transformed.length);
    } catch (error: any) {
      console.error('❌ Error loading attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatStatus = (status: string) => {
    const statusMap: any = {
      'PRESENT': 'Present',
      'ABSENT': 'Absent',
      'LATE': 'Late',
      'ON_LEAVE': 'On Leave'
    };
    return statusMap[status] || status;
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return '-';
    if (!checkOut) return 'In Progress';

    const start = new Date(`2000-01-01T${checkIn}`);
    const end = new Date(`2000-01-01T${checkOut}`);
    const diff = end.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleMarkAttendance = async (employeeId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE') => {
    try {
      await attendanceApi.markAttendance({
        employee_id: employeeId,
        date: selectedDate,
        status,
        check_in_time: status === 'PRESENT' || status === 'LATE' ? new Date().toTimeString().split(' ')[0] : null,
      });

      await loadAttendanceData();
      toast.success('Attendance marked successfully');
    } catch (error: any) {
      console.error('❌ Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    }
  };

  const filteredAttendance = attendanceRecords.filter(att => {
    return selectedDepartment === 'all' || att.department === selectedDepartment;
  });

  const presentCount = filteredAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'Absent').length;
  const onLeaveCount = filteredAttendance.filter(a => a.status === 'On Leave').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'Late').length;

  const monthlyStats = stats || {
    totalDays: 0,
    workDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    averageWorkHours: '0h 0m',
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Present Today</p>
              <h3>{presentCount}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
              {((presentCount / filteredAttendance.length) * 100).toFixed(1)}% attendance
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Absent</p>
              <h3>{absentCount}</h3>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-red-400 border-red-400/30 bg-red-500/10">
              {absentCount} employees
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">On Leave</p>
              <h3>{onLeaveCount}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">
              Approved leaves
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Late Arrivals</p>
              <h3>{lateCount}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-500/10">
              After 9:00 AM
            </Badge>
          </div>
        </Card>
      </div>

      {/* Monthly Statistics */}
      <Card className="p-6">
        <h3 className="mb-4">Monthly Statistics (October 2025)</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Total Days</p>
            <p>{monthlyStats.totalDays}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Work Days</p>
            <p>{monthlyStats.workDays}</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-muted-foreground">Present</p>
            <p className="text-green-400">{monthlyStats.presentDays}</p>
          </div>
          <div className="p-4 bg-red-500/10 rounded-lg">
            <p className="text-muted-foreground">Absent</p>
            <p className="text-red-400">{monthlyStats.absentDays}</p>
          </div>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-muted-foreground">Late</p>
            <p className="text-yellow-400">{monthlyStats.lateDays}</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-muted-foreground">Avg. Hours</p>
            <p className="text-blue-400">{monthlyStats.averageWorkHours}</p>
          </div>
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-10-28">Today (Oct 28)</SelectItem>
              <SelectItem value="2025-10-27">Yesterday (Oct 27)</SelectItem>
              <SelectItem value="2025-10-26">Oct 26</SelectItem>
              <SelectItem value="2025-10-25">Oct 25</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Work Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Loading attendance...</p>
                </TableCell>
              </TableRow>
            ) : filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No attendance records found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-indigo-500/20 text-indigo-400">
                      <div className="flex items-center justify-center w-full h-full">
                        {record.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                    </Avatar>
                    <span>{record.employee}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.department}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{record.checkIn}</TableCell>
                <TableCell className="text-muted-foreground">{record.checkOut}</TableCell>
                <TableCell>{record.workHours}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      record.status === 'Present'
                        ? 'bg-green-500/10 text-green-400 border-green-400/30'
                        : record.status === 'Late'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30'
                        : record.status === 'Absent'
                        ? 'bg-red-500/10 text-red-400 border-red-400/30'
                        : 'bg-orange-500/10 text-orange-400 border-orange-400/30'
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
