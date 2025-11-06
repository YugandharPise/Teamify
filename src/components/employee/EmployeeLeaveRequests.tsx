import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { leaveApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { LeaveRequest, LeaveBalance, LeaveType } from '../../lib/types';

interface EmployeeLeaveRequestsProps {
  employee: {
    employee_id: string;
    name: string;
  };
}

export default function EmployeeLeaveRequests({ employee }: EmployeeLeaveRequestsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaveData();
  }, [employee.employee_id]);

  const loadLeaveData = async () => {
    try {
      setIsLoading(true);
      const [balanceData, requestsData, typesData] = await Promise.all([
        leaveApi.getEmployeeBalance(employee.employee_id),
        leaveApi.getEmployeeRequests(employee.employee_id),
        leaveApi.getLeaveTypes(),
      ]);

      setLeaveBalance(balanceData || []);
      setLeaveRequests(requestsData || []);
      setLeaveTypes(typesData || []);
    } catch (error: any) {
      console.error('Error loading leave data:', error);
      toast.error('Failed to load leave data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitRequest = async () => {
    if (!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const days = calculateDays(formData.startDate, formData.endDate);

      await leaveApi.createRequest({
        employee_id: employee.employee_id,
        leave_type_id: formData.leaveTypeId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        total_days: days,
        reason: formData.reason,
        status: 'PENDING',
      });

      toast.success('Leave request submitted successfully');
      setIsDialogOpen(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      await loadLeaveData();
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPROVED: { label: 'Approved', className: 'text-green-400 border-green-400/30 bg-green-500/10', icon: CheckCircle2 },
      PENDING: { label: 'Pending', className: 'text-yellow-400 border-yellow-400/30 bg-yellow-500/10', icon: Clock },
      REJECTED: { label: 'Rejected', className: 'text-red-400 border-red-400/30 bg-red-500/10', icon: XCircle },
      CANCELLED: { label: 'Cancelled', className: 'text-gray-400 border-gray-400/30 bg-gray-500/10', icon: AlertCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getLeaveTypeColor = (index: number) => {
    const colors = ['blue', 'red', 'purple', 'green', 'yellow', 'pink'] as const;
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaveBalance.length === 0 ? (
          <Card className="p-6 col-span-full">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No leave balance data available</p>
            </div>
          </Card>
        ) : (
          leaveBalance.map((balance, index) => {
            const remaining = balance.total_days - balance.used_days;
            const percentage = (remaining / balance.total_days) * 100;
            const colorClass = getLeaveTypeColor(index);
            const colorClasses = {
              blue: 'bg-blue-500/20 text-blue-400',
              red: 'bg-red-500/20 text-red-400',
              purple: 'bg-purple-500/20 text-purple-400',
              green: 'bg-green-500/20 text-green-400',
              yellow: 'bg-yellow-500/20 text-yellow-400',
              pink: 'bg-pink-500/20 text-pink-400',
            };

            return (
              <Card key={balance.leave_balance_id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/60">{balance.leave_type?.type_name || 'Unknown'}</p>
                    <h2 className="mt-1">{remaining} days</h2>
                    <p className="text-white/40 mt-1">Available</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[colorClass]}`}>
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-white/60">
                    <span>Used: {balance.used_days}</span>
                    <span>Total: {balance.total_days}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Leave Requests Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3>Leave Requests</h3>
            <p className="text-white/60 mt-1">Manage your leave applications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Leave Request
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Submit a new leave request for approval
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); handleSubmitRequest(); }}>
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={formData.leaveTypeId} onValueChange={(value) => setFormData({...formData, leaveTypeId: value})}>
                    <SelectTrigger className="text-white">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map(type => (
                        <SelectItem key={type.leave_type_id} value={type.leave_type_id}>
                          {type.type_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Please provide a reason for your leave request"
                    rows={4}
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {leaveRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No leave requests found</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Click "New Leave Request" to submit your first request
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request: any) => (
                <TableRow key={request.leave_request_id}>
                  <TableCell>{request.leave_type?.type_name || 'N/A'}</TableCell>
                  <TableCell>{request.start_date}</TableCell>
                  <TableCell>{request.end_date}</TableCell>
                  <TableCell>{request.total_days}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.reason || '-'}</TableCell>
                  <TableCell>{request.applied_date}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Leave Policy Info */}
      <Card className="p-6 bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-400 mt-0.5" />
          <div>
            <h3>Leave Policy Guidelines</h3>
            <ul className="mt-3 space-y-2 text-white/80">
              <li>• Leave requests should be submitted at least 7 days in advance</li>
              <li>• Annual leave must be approved by your manager</li>
              <li>• Sick leave requires medical documentation for absences over 3 days</li>
              <li>• Unused annual leave can be carried over (max 5 days)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
