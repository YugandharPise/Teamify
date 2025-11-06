import { useState, useEffect } from 'react';
import { DollarSign, Download, Calendar, TrendingUp, FileText, Clock } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { payrollApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';

interface EmployeePayrollProps {
  employee: {
    employee_id: string;
    name: string;
  };
}

export default function EmployeePayroll({ employee }: EmployeePayrollProps) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [salaryStructure, setSalaryStructure] = useState<any>(null);
  const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayrollData();
  }, [employee.employee_id]);

  const loadPayrollData = async () => {
    try {
      setIsLoading(true);
      const [payroll, structure] = await Promise.all([
        payrollApi.getEmployeePayroll(employee.employee_id),
        payrollApi.getEmployeeSalaryStructure(employee.employee_id),
      ]);

      setPayrollRecords(payroll || []);
      setSalaryStructure(structure || null);

      // If we have a salary structure, get the components
      if (structure?.salary_structure_id) {
        const components = await payrollApi.getSalaryComponentTemplates(structure.salary_structure_id);
        setSalaryComponents(components || []);
      }
    } catch (error: any) {
      console.error('Error loading payroll data:', error);
      toast.error('Failed to load payroll data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate current salary from structure
  const currentSalary = salaryStructure ? {
    basic: salaryStructure.basic_salary || 0,
    allowances: salaryComponents
      .filter((c: any) => c.component_type === 'ALLOWANCE')
      .reduce((sum: number, c: any) => sum + (c.is_percentage ? (salaryStructure.basic_salary * c.percentage_value / 100) : c.amount), 0),
    deductions: salaryComponents
      .filter((c: any) => c.component_type === 'DEDUCTION')
      .reduce((sum: number, c: any) => sum + (c.is_percentage ? (salaryStructure.basic_salary * c.percentage_value / 100) : c.amount), 0),
  } : { basic: 0, allowances: 0, deductions: 0 };

  const netMonthlySalary = currentSalary.basic + currentSalary.allowances - currentSalary.deductions;
  const annualSalary = netMonthlySalary * 12;

  // Calculate YTD summary from payroll records
  const ytdRecords = payrollRecords.filter((p: any) => {
    const year = new Date(p.pay_period_start).getFullYear();
    return year === parseInt(selectedYear);
  });

  const taxSummary = {
    ytdGross: ytdRecords.reduce((sum: number, p: any) => sum + (p.gross_salary || 0), 0),
    ytdDeductions: ytdRecords.reduce((sum: number, p: any) => sum + (p.deductions || 0), 0),
    ytdNet: ytdRecords.reduce((sum: number, p: any) => sum + (p.net_salary || 0), 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: salaryStructure?.currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'text-gray-400 border-gray-400/30 bg-gray-500/10' },
      PROCESSED: { label: 'Processed', className: 'text-blue-400 border-blue-400/30 bg-blue-500/10' },
      PAID: { label: 'Paid', className: 'text-green-400 border-green-400/30 bg-green-500/10' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
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
      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60">Annual Salary</p>
              <h1 className="mt-2">{formatCurrency(annualSalary)}</h1>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <p className="text-white/60">Basic: {formatCurrency(currentSalary.basic)}/month</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60">Monthly Net Salary</p>
              <h2 className="mt-2">{formatCurrency(netMonthlySalary)}</h2>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <p className="text-white/60">
            {payrollRecords.length > 0 ? `Last payment: ${new Date(payrollRecords[0].payment_date || payrollRecords[0].pay_period_end).toLocaleDateString()}` : 'No payments yet'}
          </p>
        </Card>
      </div>

      {/* Salary Breakdown */}
      <Card className="p-6">
        <h3 className="mb-6">Monthly Salary Breakdown</h3>
        {salaryComponents.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No salary components configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/30">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/80">Basic Salary</p>
                <h3 className="text-blue-400">{formatCurrency(currentSalary.basic)}</h3>
              </div>
            </div>
            {salaryComponents
              .filter((c: any) => c.component_type === 'ALLOWANCE')
              .map((component: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-green-500/10 border border-green-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/80">{component.component_name}</p>
                    <h3 className="text-green-400">
                      {formatCurrency(component.is_percentage ? (currentSalary.basic * component.percentage_value / 100) : component.amount)}
                    </h3>
                  </div>
                  {component.is_percentage && (
                    <p className="text-white/40 text-sm">{component.percentage_value}% of basic</p>
                  )}
                </div>
              ))}
            {salaryComponents
              .filter((c: any) => c.component_type === 'DEDUCTION')
              .map((component: any, index: number) => (
                <div key={index} className="p-4 rounded-lg bg-red-500/10 border border-red-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/80">{component.component_name}</p>
                    <h3 className="text-red-400">
                      -{formatCurrency(component.is_percentage ? (currentSalary.basic * component.percentage_value / 100) : component.amount)}
                    </h3>
                  </div>
                  {component.is_percentage && (
                    <p className="text-white/40 text-sm">{component.percentage_value}% of basic</p>
                  )}
                </div>
              ))}
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/30 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-white/80 font-medium">Net Monthly Salary</p>
                <h2 className="text-purple-400">{formatCurrency(netMonthlySalary)}</h2>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-white/60">YTD Gross</p>
          <h3 className="mt-2">{formatCurrency(taxSummary.ytdGross)}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-white/60">YTD Deductions</p>
          <h3 className="mt-2 text-red-400">{formatCurrency(taxSummary.ytdDeductions)}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-white/60">YTD Net</p>
          <h3 className="mt-2 text-green-400">{formatCurrency(taxSummary.ytdNet)}</h3>
        </Card>
      </div>

      {/* Payslip History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3>Payslip History</h3>
            <p className="text-white/60 mt-1">View and download your payslips</p>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {ytdRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No payroll records for {selectedYear}</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Your payslips will appear here once processed by HR
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Pay Date</TableHead>
                <TableHead>Gross Salary</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ytdRecords.map((payroll: any) => (
                <TableRow key={payroll.payroll_id}>
                  <TableCell>
                    {new Date(payroll.pay_period_start).toLocaleDateString()} - {new Date(payroll.pay_period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{formatCurrency(payroll.gross_salary || 0)}</TableCell>
                  <TableCell className="text-red-400">
                    {formatCurrency(payroll.deductions || 0)}
                  </TableCell>
                  <TableCell className="text-green-400">
                    {formatCurrency(payroll.net_salary || 0)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payroll.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
