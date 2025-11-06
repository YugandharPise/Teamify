import { useState, useEffect } from 'react';
import { UserPlus, Briefcase, Users, CheckCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { recruitmentApi } from '../lib/api';
import { toast } from 'sonner@2.0.3';

const stages = ['SUBMITTED', 'SCREENING', 'SHORTLISTED', 'INTERVIEWED', 'OFFERED', 'HIRED'];

export function RecruitmentPipeline() {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecruitmentData();
  }, []);

  const loadRecruitmentData = async () => {
    try {
      setIsLoading(true);
      const [jobsData, appsData] = await Promise.all([
        recruitmentApi.getActiveJobPostings(),
        recruitmentApi.getAllApplications(),
      ]);

      setJobPostings(jobsData || []);
      setApplications(appsData || []);
    } catch (error: any) {
      console.error('Error loading recruitment data:', error);
      toast.error('Failed to load recruitment data');
    } finally {
      setIsLoading(false);
    }
  };

  const getCandidatesByStage = (stage: string) => {
    return applications.filter(app => app.status === stage);
  };

  const totalApplicants = applications.length;
  const inInterviewCount = applications.filter(app =>
    app.status === 'INTERVIEWED' || app.status === 'SHORTLISTED'
  ).length;
  const offersCount = applications.filter(app => app.status === 'OFFERED').length;

  // Count applications per job posting
  const jobPostingsWithCounts = jobPostings.map(job => ({
    ...job,
    applicant_count: applications.filter(app => app.job_posting_id === job.job_posting_id).length
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading recruitment data...</p>
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
              <p className="text-muted-foreground">Open Positions</p>
              <h3>{jobPostings.length}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-500/10">
              Active hiring
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Total Applicants</p>
              <h3>{totalApplicants}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-purple-400 border-purple-400/30 bg-purple-500/10">
              Total applications
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">In Interview</p>
              <h3>{inInterviewCount}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-orange-400 border-orange-400/30 bg-orange-500/10">
              Active interviews
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Offers Made</p>
              <h3>{offersCount}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
              Pending acceptance
            </Badge>
          </div>
        </Card>
      </div>

      {/* Open Positions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Open Positions</h3>
          <Button>
            <Briefcase className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </div>
        {jobPostingsWithCounts.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active job postings</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Create a new job posting to start hiring
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostingsWithCounts.map((position) => (
              <Card key={position.job_posting_id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4>{position.job_title}</h4>
                    <p className="text-muted-foreground">{position.department?.department_name || 'N/A'}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/30">
                    {position.status}
                  </Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>📍</span>
                    <span>{position.location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>💼</span>
                    <span>{position.employment_type || 'Full-time'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>📅</span>
                    <span>Posted {position.posted_date ? new Date(position.posted_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-muted-foreground">{position.applicant_count} applicants</span>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Recruitment Pipeline */}
      <Card className="p-6">
        <h3 className="mb-6">Recruitment Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage);
            const stageLabel = stage.charAt(0) + stage.slice(1).toLowerCase().replace('_', ' ');
            return (
              <Card
                key={stage}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedStage(stage)}
              >
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">{stageLabel}</p>
                  <h4>{stageCandidates.length}</h4>
                  <div className="mt-3 space-y-2">
                    {stageCandidates.slice(0, 2).map((app) => {
                      const applicantName = `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim();
                      const initials = applicantName.split(' ').map(n => n[0]).join('');
                      return (
                        <div
                          key={app.application_id}
                          className="flex items-center gap-2 text-left"
                        >
                          <Avatar className="w-6 h-6 bg-indigo-500/20 text-indigo-400">
                            <div className="flex items-center justify-center w-full h-full text-xs">
                              {initials || '?'}
                            </div>
                          </Avatar>
                          <span className="text-muted-foreground truncate">{app.applicant?.first_name || 'Unknown'}</span>
                        </div>
                      );
                    })}
                    {stageCandidates.length > 2 && (
                      <p className="text-muted-foreground/50">+{stageCandidates.length - 2} more</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Recent Candidates */}
      <Card className="p-6">
        <h3 className="mb-6">Recent Candidates</h3>
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No applications yet</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Applications will appear here once candidates apply
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.slice(0, 5).map((app) => {
              const applicantName = `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim() || 'Unknown Applicant';
              const initials = applicantName.split(' ').map(n => n[0]).join('');
              const statusLabel = app.status ? app.status.charAt(0) + app.status.slice(1).toLowerCase().replace('_', ' ') : 'N/A';

              return (
                <div
                  key={app.application_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCandidate(app)}
                >
                  <Avatar className="w-12 h-12 bg-indigo-500/20 text-indigo-400">
                    <div className="flex items-center justify-center w-full h-full">
                      {initials || '?'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h4>{applicantName}</h4>
                    <p className="text-muted-foreground">{app.job_posting?.job_title || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {statusLabel}
                    </Badge>
                    <p className="text-muted-foreground">
                      {app.application_date ? new Date(app.application_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">View Profile</Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Candidate Detail Dialog */}
      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
            <DialogDescription>
              Review candidate details and move them through the pipeline
            </DialogDescription>
          </DialogHeader>
          {selectedCandidate && selectedCandidate.applicant && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16 bg-indigo-500/20 text-indigo-400">
                  <div className="flex items-center justify-center w-full h-full">
                    {`${selectedCandidate.applicant.first_name?.[0] || ''}${selectedCandidate.applicant.last_name?.[0] || ''}`}
                  </div>
                </Avatar>
                <div className="flex-1">
                  <h3>{`${selectedCandidate.applicant.first_name || ''} ${selectedCandidate.applicant.last_name || ''}`.trim()}</h3>
                  <p className="text-muted-foreground">{selectedCandidate.job_posting?.job_title || 'N/A'}</p>
                </div>
                <Badge variant="outline">
                  {selectedCandidate.status ? selectedCandidate.status.charAt(0) + selectedCandidate.status.slice(1).toLowerCase().replace('_', ' ') : 'N/A'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p>{selectedCandidate.applicant.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{selectedCandidate.applicant.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Applied Date</p>
                  <p>{selectedCandidate.application_date ? new Date(selectedCandidate.application_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Stage</p>
                  <p>{selectedCandidate.current_stage || selectedCandidate.status || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-2">Move to Stage</p>
                <div className="grid grid-cols-3 gap-2">
                  {stages.map((stage) => {
                    const stageLabel = stage.charAt(0) + stage.slice(1).toLowerCase().replace('_', ' ');
                    return (
                      <Button
                        key={stage}
                        variant={selectedCandidate.status === stage ? 'default' : 'outline'}
                        size="sm"
                      >
                        {stageLabel}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button className="flex-1">Schedule Interview</Button>
                <Button variant="outline" className="flex-1">Download Resume</Button>
                <Button variant="outline" className="flex-1">Send Email</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
