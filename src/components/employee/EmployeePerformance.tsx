import { useState, useEffect } from 'react';
import { Target, Award, TrendingUp, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { performanceApi } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { PerformanceReview } from '../../lib/types';

interface EmployeePerformanceProps {
  employee: {
    employee_id: string;
    name: string;
  };
}

export default function EmployeePerformance({ employee }: EmployeePerformanceProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadPerformanceData();
  }, [employee.employee_id]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, goalsData, avgRating] = await Promise.all([
        performanceApi.getEmployeeReviews(employee.employee_id),
        performanceApi.getEmployeeGoals(employee.employee_id),
        performanceApi.getEmployeeAverageRating(employee.employee_id),
      ]);

      setReviews(reviewsData || []);
      setGoals(goalsData || []);
      setAverageRating(avgRating || 0);
    } catch (error: any) {
      console.error('Error loading performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate performance metrics from latest review
  const latestReview = reviews.length > 0 ? reviews[0] : null;
  const performanceMetrics = latestReview ? [
    {
      category: 'Technical Skills',
      score: latestReview.technical_skills_rating || 0,
      maxScore: 5.0,
      percentage: ((latestReview.technical_skills_rating || 0) / 5.0) * 100,
      color: 'blue' as const,
    },
    {
      category: 'Communication',
      score: latestReview.communication_rating || 0,
      maxScore: 5.0,
      percentage: ((latestReview.communication_rating || 0) / 5.0) * 100,
      color: 'green' as const,
    },
    {
      category: 'Leadership',
      score: latestReview.leadership_rating || 0,
      maxScore: 5.0,
      percentage: ((latestReview.leadership_rating || 0) / 5.0) * 100,
      color: 'purple' as const,
    },
    {
      category: 'Teamwork',
      score: latestReview.teamwork_rating || 0,
      maxScore: 5.0,
      percentage: ((latestReview.teamwork_rating || 0) / 5.0) * 100,
      color: 'yellow' as const,
    },
  ] : [];

  const getGoalStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { label: 'Completed', className: 'text-green-400 border-green-400/30 bg-green-500/10' },
      IN_PROGRESS: { label: 'In Progress', className: 'text-blue-400 border-blue-400/30 bg-blue-500/10' },
      NOT_STARTED: { label: 'Not Started', className: 'text-gray-400 border-gray-400/30 bg-gray-500/10' },
      CANCELLED: { label: 'Cancelled', className: 'text-red-400 border-red-400/30 bg-red-500/10' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.IN_PROGRESS;
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
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.length === 0 ? (
          <Card className="p-6 col-span-full">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No performance reviews yet</p>
              <p className="text-muted-foreground/60 text-sm mt-2">
                Your performance reviews will appear here once submitted by your manager
              </p>
            </div>
          </Card>
        ) : (
          performanceMetrics.map((metric, index) => {
          const colorClasses = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600',
            yellow: 'from-yellow-500 to-yellow-600',
          };
          return (
            <Card key={index} className="p-6">
              <div>
                <p className="text-white/60">{metric.category}</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <h2>{metric.score}</h2>
                  <span className="text-white/60">/ {metric.maxScore}</span>
                </div>
                <div className="mt-4">
                  <Progress value={metric.percentage} className="h-2" />
                  <p className="text-white/40 mt-2">{metric.percentage}%</p>
                </div>
              </div>
            </Card>
          );
        })
        )}
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="bg-white/5">
          <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
          <TabsTrigger value="reviews">Review History</TabsTrigger>
        </TabsList>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3>My Goals</h3>
                <p className="text-white/60 mt-1">Track your progress towards set objectives</p>
              </div>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No goals assigned yet</p>
                <p className="text-muted-foreground/60 text-sm mt-2">
                  Your manager will set goals for you during performance reviews
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal: any) => (
                <div
                  key={goal.goal_id}
                  className="p-5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {goal.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-blue-400" />
                        )}
                        <h4>{goal.goal_title}</h4>
                      </div>
                      <p className="text-white/60 mt-2 ml-8">{goal.goal_description || 'No description'}</p>
                    </div>
                    {getGoalStatusBadge(goal.status)}
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center justify-between text-white/60">
                      <span>Target Date: {goal.target_date || 'Not set'}</span>
                    </div>
                    {goal.completion_date && (
                      <p className="text-green-400">
                        Completed on {goal.completion_date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Review History Tab */}
        <TabsContent value="reviews">
          <Card className="p-6">
            <h3 className="mb-6">Performance Review History</h3>
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No performance reviews yet</p>
                <p className="text-muted-foreground/60 text-sm mt-2">
                  Your performance reviews will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any, index: number) => (
                <div
                  key={review.review_id}
                  className="p-5 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4>
                        {review.review_period_start && review.review_period_end
                          ? `${new Date(review.review_period_start).toLocaleDateString()} - ${new Date(review.review_period_end).toLocaleDateString()}`
                          : 'Performance Review'}
                      </h4>
                      <p className="text-white/60 mt-1">{new Date(review.review_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <h3>{review.overall_rating ? review.overall_rating.toFixed(1) : 'N/A'}</h3>
                      </div>
                      <p className="text-white/60 mt-1">Overall Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {review.comments && <p className="text-white/80">{review.comments}</p>}
                    {review.strengths && (
                      <div>
                        <p className="text-green-400 font-medium">Strengths:</p>
                        <p className="text-white/60">{review.strengths}</p>
                      </div>
                    )}
                    {review.areas_for_improvement && (
                      <div>
                        <p className="text-yellow-400 font-medium">Areas for Improvement:</p>
                        <p className="text-white/60">{review.areas_for_improvement}</p>
                      </div>
                    )}
                    {review.reviewer && (
                      <p className="text-white/40">
                        Reviewed by: {review.reviewer.first_name} {review.reviewer.last_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
