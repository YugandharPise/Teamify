import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, Calendar, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
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
import { payrollApi } from '../lib/api';
import { toast } from 'sonner@2.0.3';

export function PayrollOverview() {
  const [selectedMonth, setSelectedMonth] = useState('october-2025');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      const data = await payrollApi.getAllPayroll();
      setPayrollRecords(data || []);
    } catch (error: any) {
      console.error('Error loading payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayroll = payrollRecords.filter(payroll => {
    const deptMatch = selectedDepartment === 'all' || payroll.employee?.department?.department_name === selectedDepartment;
    // You can add month filtering here if needed based on selectedMonth
    return deptMatch;
  });

  const totalPayroll = filteredPayroll.reduce((sum, p) => sum + (p.net_salary || 0), 0);
  const totalBonus = filteredPayroll.reduce((sum, p) => sum + (p.bonus || 0), 0);
  const totalDeductions = filteredPayroll.reduce((sum, p) => sum + (p.deductions || 0), 0);
  const totalBaseSalary = filteredPayroll.reduce((sum, p) => sum + (p.basic_salary || 0), 0);
  const processedCount = filteredPayroll.filter(p => p.status === 'PROCESSED' || p.status === 'PAID').length;
  const pendingCount = filteredPayroll.filter(p => p.status === 'DRAFT').length;

  // Get unique departments from payroll records
  const departments = [...new Set(payrollRecords.map(p => p.employee?.department?.department_name).filter(Boolean))];

  // Calculate department totals
  const departmentTotals = departments.map(dept => {
    const deptPayroll = payrollRecords.filter(p => p.employee?.department?.department_name === dept);
    const deptTotal = deptPayroll.reduce((sum, p) => sum + (p.net_salary || 0), 0);
    return { department: dept, total: deptTotal };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'bg-gray-500/10 text-gray-400 border-gray-400/30' },
      PROCESSED: { label: 'Processed', className: 'bg-blue-500/10 text-blue-400 border-blue-400/30' },
      PAID: { label: 'Paid', className: 'bg-green-500/10 text-green-400 border-green-400/30' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return config;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Payroll</p>
              <h3>{formatCurrency(totalPayroll)}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10">
              This month
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Bonuses</p>
              <h3>{formatCurrency(totalBonus)}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
              Performance bonuses
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Deductions</p>
              <h3>{formatCurrency(totalDeductions)}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">
              Tax & benefits
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Processing Status</p>
              <h3>{processedCount}/{filteredPayroll.length}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-500/10">
              {pendingCount} pending
            </Badge>
          </div>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="p-6">
        <h3 className="mb-4">Monthly Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <p className="text-muted-foreground">Base Salaries</p>
            <p className="text-blue-400">
              {formatCurrency(totalBaseSalary)}
            </p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg">
            <p className="text-muted-foreground">Bonuses</p>
            <p className="text-green-400">{formatCurrency(totalBonus)}</p>
          </div>
          <div className="p-4 bg-orange-500/10 rounded-lg">
            <p className="text-muted-foreground">Deductions</p>
            <p className="text-orange-400">{formatCurrency(totalDeductions)}</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg">
            <p className="text-muted-foreground">Net Payroll</p>
            <p className="text-purple-400">{formatCurrency(totalPayroll)}</p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Avg. Per Employee</p>
            <p>
              {filteredPayroll.length > 0 ? formatCurrency(totalPayroll / filteredPayroll.length) : '$0'}
            </p>
          </div>
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40 text-white">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="october-2025">October 2025</SelectItem>
              <SelectItem value="september-2025">September 2025</SelectItem>
              <SelectItem value="august-2025">August 2025</SelectItem>
              <SelectItem value="july-2025">July 2025</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40 text-white">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Payroll Table */}
      <Card>
        {filteredPayroll.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No payroll records found</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Process payroll to see records here
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((payroll) => {
                const employeeName = `${payroll.employee?.first_name || ''} ${payroll.employee?.last_name || ''}`.trim() || 'Unknown';
                const initials = employeeName.split(' ').map(n => n[0]).join('');
                const statusConfig = getStatusBadge(payroll.status);

                return (
                  <TableRow key={payroll.payroll_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 bg-indigo-500/20 text-indigo-400">
                          <div className="flex items-center justify-center w-full h-full">
                            {initials || '?'}
                          </div>
                        </Avatar>
                        <div>
                          <p>{employeeName}</p>
                          <p className="text-muted-foreground">{payroll.employee?.position?.position_title || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payroll.employee?.department?.department_name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payroll.basic_salary || 0)}
                    </TableCell>
                    <TableCell className="text-green-400">
                      +{formatCurrency(payroll.bonus || 0)}
                    </TableCell>
                    <TableCell className="text-orange-400">
                      -{formatCurrency(payroll.deductions || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(payroll.net_salary || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Department Comparison */}
      <Card className="p-6">
        <h3 className="text-[rgb(250,250,250)] mb-4">Department Payroll Comparison</h3>
        {departmentTotals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No department data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {departmentTotals.map(({ department, total }) => {
              const allPayrollTotal = payrollRecords.reduce((sum, p) => sum + (p.net_salary || 0), 0);
              const percentage = allPayrollTotal > 0 ? (total / allPayrollTotal) * 100 : 0;

              return (
                <div key={department}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[rgb(163,163,163)]">{department}</span>
                    <span className="text-gray-900">{formatCurrency(total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
