import { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Star } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
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
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { performanceApi } from '../lib/api';
import { toast } from 'sonner@2.0.3';

export function PerformanceDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const reviews = await performanceApi.getAllReviews();

      // Transform the data to match the expected format
      const transformedData = reviews.map((review: any) => ({
        id: review.review_id,
        employee: `${review.employee?.first_name || ''} ${review.employee?.last_name || ''}`.trim() || 'Unknown',
        department: review.employee?.department?.department_name || 'N/A',
        position: review.employee?.position?.position_title || 'N/A',
        overallScore: review.overall_rating || 0,
        technical: review.technical_skills || 0,
        communication: review.communication || 0,
        leadership: review.leadership || 0,
        productivity: review.productivity || 0,
        lastReview: review.review_date,
        nextReview: review.next_review_date,
        goals: review.goals_total || 0,
        goalsCompleted: review.goals_completed || 0,
        employeeId: review.employee_id,
      }));

      setPerformanceData(transformedData);
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-foreground rounded-xl flex items-center justify-center animate-pulse">
            <TrendingUp className="w-6 h-6 text-background" />
          </div>
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const averageScore = performanceData.length > 0
    ? (performanceData.reduce((sum, emp) => sum + emp.overallScore, 0) / performanceData.length).toFixed(1)
    : '0.0';
  const topPerformers = performanceData.filter(emp => emp.overallScore >= 4.5).length;
  const totalGoals = performanceData.reduce((sum, emp) => sum + emp.goals, 0);
  const completedGoals = performanceData.reduce((sum, emp) => sum + emp.goalsCompleted, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Average Score</p>
              <h3>{averageScore} / 5.0</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={parseFloat(averageScore) * 20} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Top Performers</p>
              <h3>{topPerformers}</h3>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-500/10">
              4.5+ rating
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Goals Completed</p>
              <h3>{completedGoals} / {totalGoals}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <Progress value={(completedGoals / totalGoals) * 100} className="h-2" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Reviews</p>
              <h3>{performanceData.length}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-500/10">
              All time
            </Badge>
          </div>
        </Card>
      </div>

      {/* Performance Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Employee Performance Overview</h3>
          <Button>
            <Award className="w-4 h-4 mr-2" />
            Schedule Review
          </Button>
        </div>

        {performanceData.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Performance Reviews Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by scheduling performance reviews for your employees.
            </p>
            <Button>
              <Award className="w-4 h-4 mr-2" />
              Schedule First Review
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Goals Progress</TableHead>
                <TableHead>Last Review</TableHead>
                <TableHead>Next Review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-indigo-500/20 text-indigo-400">
                      <div className="flex items-center justify-center w-full h-full">
                        {employee.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                    </Avatar>
                    <div>
                      <p>{employee.employee}</p>
                      <p className="text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{employee.overallScore.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(employee.overallScore)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(employee.goalsCompleted / employee.goals) * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-muted-foreground">{employee.goalsCompleted}/{employee.goals}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{employee.lastReview}</TableCell>
                <TableCell className="text-muted-foreground">{employee.nextReview}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Employee Performance Detail Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Performance Review Details</DialogTitle>
            <DialogDescription>
              Detailed performance metrics and review history
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16 bg-indigo-500/20 text-indigo-400">
                  <div className="flex items-center justify-center w-full h-full">
                    {selectedEmployee.employee.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                </Avatar>
                <div className="flex-1">
                  <h3>{selectedEmployee.employee}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <Badge variant="outline" className="mt-1">{selectedEmployee.department}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Overall Score</p>
                  <div className="flex items-center gap-2">
                    <span>{selectedEmployee.overallScore.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(selectedEmployee.overallScore)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4">Performance Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Technical Skills</span>
                      <span>{selectedEmployee.technical.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={selectedEmployee.technical * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Communication</span>
                      <span>{selectedEmployee.communication.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={selectedEmployee.communication * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Leadership</span>
                      <span>{selectedEmployee.leadership.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={selectedEmployee.leadership * 20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Productivity</span>
                      <span>{selectedEmployee.productivity.toFixed(1)}/5.0</span>
                    </div>
                    <Progress value={selectedEmployee.productivity * 20} className="h-2" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4">Goals & Objectives</h4>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-muted-foreground">Goals Completed</p>
                    <p>{selectedEmployee.goalsCompleted} out of {selectedEmployee.goals}</p>
                  </div>
                  <Progress
                    value={(selectedEmployee.goalsCompleted / selectedEmployee.goals) * 100}
                    className="w-32 h-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Last Review</p>
                  <p className="text-gray-900">{selectedEmployee.lastReview}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Next Review</p>
                  <p className="text-gray-900">{selectedEmployee.nextReview}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Schedule Review</Button>
                <Button variant="outline" className="flex-1">Download Report</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
