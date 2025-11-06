import { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { leaveApi } from '../lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from 'sonner@2.0.3';

const initialLeaveRequests = [
  {
    id: 1,
    employee: 'Sarah Johnson',
    type: 'Annual Leave',
    startDate: '2025-11-05',
    endDate: '2025-11-10',
    days: 6,
    reason: 'Family vacation',
    status: 'Pending',
    appliedDate: '2025-10-25',
  },
  {
    id: 2,
    employee: 'Michael Chen',
    type: 'Sick Leave',
    startDate: '2025-10-29',
    endDate: '2025-10-30',
    days: 2,
    reason: 'Medical appointment',
    status: 'Pending',
    appliedDate: '2025-10-27',
  },
  {
    id: 3,
    employee: 'Emma Wilson',
    type: 'Annual Leave',
    startDate: '2025-11-15',
    endDate: '2025-11-20',
    days: 6,
    reason: 'Personal travel',
    status: 'Pending',
    appliedDate: '2025-10-26',
  },
  {
    id: 4,
    employee: 'David Brown',
    type: 'Annual Leave',
    startDate: '2025-10-20',
    endDate: '2025-10-25',
    days: 6,
    reason: 'Wedding ceremony',
    status: 'Approved',
    appliedDate: '2025-10-10',
    approvedDate: '2025-10-12',
  },
  {
    id: 5,
    employee: 'Lisa Anderson',
    type: 'Sick Leave',
    startDate: '2025-10-15',
    endDate: '2025-10-16',
    days: 2,
    reason: 'Flu',
    status: 'Approved',
    appliedDate: '2025-10-14',
    approvedDate: '2025-10-14',
  },
  {
    id: 6,
    employee: 'James Taylor',
    type: 'Casual Leave',
    startDate: '2025-10-18',
    endDate: '2025-10-18',
    days: 1,
    reason: 'Personal work',
    status: 'Rejected',
    appliedDate: '2025-10-17',
    rejectedDate: '2025-10-17',
  },
];

export function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await leaveApi.getAll();

      // Transform data for display
      const transformed = requests.map((req: any) => ({
        id: req.leave_request_id,
        employee: `${req.employee?.first_name} ${req.employee?.last_name}`,
        type: req.leave_type?.leave_type_name || 'Leave',
        startDate: req.start_date,
        endDate: req.end_date,
        days: req.days_requested,
        reason: req.reason,
        status: formatStatus(req.status),
        appliedDate: req.requested_date,
        employeeId: req.employee_id,
        ...req
      }));

      setLeaveRequests(transformed);
      console.log('✅ Loaded leave requests:', transformed.length);
    } catch (error: any) {
      console.error('❌ Error loading leave requests:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: any = {
      'PENDING': 'Pending',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (activeTab === 'all') return true;
    return req.status.toLowerCase() === activeTab;
  });

  const handleApprove = async (id: number) => {
    try {
      await leaveApi.updateStatus(id, 'APPROVED');
      await loadLeaveRequests();
      toast.success('Leave request approved successfully');
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('❌ Error approving leave:', error);
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await leaveApi.updateStatus(id, 'REJECTED');
      await loadLeaveRequests();
      toast.error('Leave request rejected');
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('❌ Error rejecting leave:', error);
      toast.error('Failed to reject leave request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Pending Requests</p>
              <h3>
                {leaveRequests.filter(r => r.status === 'Pending').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Approved This Month</p>
              <h3>
                {leaveRequests.filter(r => r.status === 'Approved').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Rejected</p>
              <h3>
                {leaveRequests.filter(r => r.status === 'Rejected').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Days Off</p>
              <h3>
                {leaveRequests.reduce((sum, r) => sum + r.days, 0)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-indigo-500/20 text-indigo-400">
                          <div className="flex items-center justify-center w-full h-full">
                            {request.employee.split(' ').map(n => n[0]).join('')}
                          </div>
                        </Avatar>
                        <span>{request.employee}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{request.startDate}</TableCell>
                    <TableCell className="text-muted-foreground">{request.endDate}</TableCell>
                    <TableCell>{request.days} days</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          request.status === 'Pending'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-400/30'
                            : request.status === 'Approved'
                            ? 'bg-green-500/10 text-green-400 border-green-400/30'
                            : 'bg-red-500/10 text-red-400 border-red-400/30'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          View
                        </Button>
                        {request.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Leave Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review the details of this leave request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b">
                <Avatar className="w-12 h-12 bg-indigo-500/20 text-indigo-400">
                  <div className="flex items-center justify-center w-full h-full">
                    {selectedRequest.employee.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                </Avatar>
                <div>
                  <p>{selectedRequest.employee}</p>
                  <p className="text-muted-foreground">Applied on {selectedRequest.appliedDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Leave Type</p>
                  <p>{selectedRequest.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p>{selectedRequest.days} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p>{selectedRequest.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p>{selectedRequest.endDate}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Reason</p>
                <p>{selectedRequest.reason}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={
                    selectedRequest.status === 'Pending'
                      ? 'bg-orange-500/10 text-orange-400 border-orange-400/30'
                      : selectedRequest.status === 'Approved'
                      ? 'bg-green-500/10 text-green-400 border-green-400/30'
                      : 'bg-red-500/10 text-red-400 border-red-400/30'
                  }
                >
                  {selectedRequest.status}
                </Badge>
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleReject(selectedRequest.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
