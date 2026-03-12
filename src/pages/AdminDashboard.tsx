import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Users, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Download, Loader2, LogOut } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [examTiming, setExamTiming] = useState<any>(null);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [bulkScheduleTime, setBulkScheduleTime] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [approveScheduleTime, setApproveScheduleTime] = useState('');
  const [useDefaultWait, setUseDefaultWait] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/login');
    } else if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminRequests()
      ]);
      setStats(statsRes);
      setRequests(requestsRes.requests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await api.getCandidates();
      setCandidates(res.candidates || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const res = await api.getResults();
      setResults(res.results || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchExamTiming = async () => {
    try {
      const res = await api.getExamTiming();
      setExamTiming(res);
    } catch (error) {
      console.error('Error fetching exam timing:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'candidates' && candidates.length === 0) {
      fetchCandidates();
    } else if (activeTab === 'results' && results.length === 0) {
      fetchResults();
    }
  }, [activeTab]);

  const handleApprove = async (requestId: string) => {
    setProcessing(true);
    try {
      const examAvailableAt = useDefaultWait ? null : new Date(approveScheduleTime).toISOString();
      await api.approveRequest(requestId, examAvailableAt);
      setApproveDialogOpen(false);
      setApproveScheduleTime('');
      setUseDefaultWait(true);
      await fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const openApproveDialog = (request: any) => {
    setSelectedRequest(request);
    setUseDefaultWait(true);
    setApproveScheduleTime('');
    setApproveDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      await api.rejectRequest(selectedRequest._id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedRequest(null);
      await fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportResults();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `VproTechDigital_Results_${Date.now()}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const handleBulkSchedule = async () => {
    if (!bulkScheduleTime) return;
    setProcessing(true);
    try {
      const result = await api.bulkScheduleExam(bulkScheduleTime);
      alert(result.message || 'Exam scheduled successfully');
      setBulkScheduleOpen(false);
      setBulkScheduleTime('');
      await fetchData();
    } catch (error) {
      console.error('Error scheduling exam:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">VproTechDigital Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl font-bold">{stats?.totalCandidates || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{stats?.pendingRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">{stats?.approvedRequests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Exams</p>
                  <p className="text-2xl font-bold">{stats?.completedExams || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'timing') fetchExamTiming();
        }}>
          <TabsList className="mb-4">
            <TabsTrigger value="requests">Exam Requests</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="timing">Exam Timing</TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Exam Requests</CardTitle>
                <CardDescription>Approve or reject candidate exam requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{request.userId?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{request.userId?.email}</p>
                            <p className="text-xs text-muted-foreground">{request.userId?.collegeName}</p>
                          </div>
                        </TableCell>
                        <TableCell>{request.requestedDomain}</TableCell>
                        <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.requestStatus === 'pending' ? 'secondary' :
                            request.requestStatus === 'approved' ? 'default' : 'destructive'
                          }>
                            {request.requestStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.requestStatus === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => openApproveDialog(request)} disabled={processing}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                              }} disabled={processing}>
                                Reject
                              </Button>
                            </div>
                          )}
                          {request.requestStatus === 'approved' && request.examAvailableAt && (
                            <p className="text-sm text-muted-foreground">
                              Available: {new Date(request.examAvailableAt).toLocaleString()}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>All Candidates</CardTitle>
                <CardDescription>View all registered candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>College</TableHead>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Registered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate._id}>
                        <TableCell className="font-medium">{candidate.fullName}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.collegeName}</TableCell>
                        <TableCell className="font-mono">{candidate.applicationId}</TableCell>
                        <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {candidates.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No candidates found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Exam Results</CardTitle>
                  <CardDescription>View all exam results</CardDescription>
                </div>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result._id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{result.userId?.fullName}</p>
                            <p className="text-sm text-muted-foreground">{result.userId?.applicationId}</p>
                          </div>
                        </TableCell>
                        <TableCell>{result.domain}</TableCell>
                        <TableCell>
                          <span className="font-bold">{result.totalScore}</span>/{result.totalMarks}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            result.disqualified ? 'destructive' :
                            result.totalScore >= 14 ? 'default' : 'secondary'
                          }>
                            {result.disqualified ? 'Disqualified' : result.totalScore >= 14 ? 'Qualified' : 'Not Qualified'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No results found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timing Tab */}
          <TabsContent value="timing">
            <Card>
              <CardHeader>
                <CardTitle>Exam Timing Settings</CardTitle>
                <CardDescription>Configure exam timing for all candidates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Default Wait Time</p>
                    <p className="text-2xl font-bold">{examTiming?.defaultWaitMinutes || 5} minutes</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Default Exam Duration</p>
                    <p className="text-2xl font-bold">{examTiming?.defaultDurationMinutes || 30} minutes</p>
                  </div>
                </div>

                {/* Bulk Schedule */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Bulk Schedule Exam for All Users</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set a specific date and time when all pending/approved users can start their exam.
                  </p>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Exam Start Time</label>
                      <Input
                        type="datetime-local"
                        value={bulkScheduleTime}
                        onChange={(e) => setBulkScheduleTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={() => setBulkScheduleOpen(true)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule for All
                    </Button>
                  </div>
                </div>

                {/* Global Start Time */}
                {examTiming?.globalExamStartTime && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Current Global Exam Start</h3>
                    <p className="text-2xl font-bold text-primary">
                      {new Date(examTiming.globalExamStartTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this exam request.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing || !rejectReason}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog with Custom Schedule */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Exam Request</DialogTitle>
            <DialogDescription>
              Choose when the candidate can start their exam.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="defaultWait"
                name="scheduleType"
                checked={useDefaultWait}
                onChange={() => setUseDefaultWait(true)}
                className="w-4 h-4"
              />
              <label htmlFor="defaultWait" className="text-sm font-medium">
                Use default wait time ({examTiming?.defaultWaitMinutes || 5} minutes)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="customTime"
                name="scheduleType"
                checked={!useDefaultWait}
                onChange={() => setUseDefaultWait(false)}
                className="w-4 h-4"
              />
              <label htmlFor="customTime" className="text-sm font-medium">
                Set specific exam start time
              </label>
            </div>
            {!useDefaultWait && (
              <div className="ml-6">
                <label className="text-sm font-medium">Exam Start Time</label>
                <Input
                  type="datetime-local"
                  value={approveScheduleTime}
                  onChange={(e) => setApproveScheduleTime(e.target.value)}
                  className="mt-1"
                />
                {approveScheduleTime && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Exam will be available from: <span className="font-semibold">{new Date(approveScheduleTime).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedRequest && handleApprove(selectedRequest._id)} 
              disabled={processing || (!useDefaultWait && !approveScheduleTime)}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Schedule Dialog */}
      <Dialog open={bulkScheduleOpen} onOpenChange={setBulkScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Exam for All Users</DialogTitle>
            <DialogDescription>
              This will set the exam start time for all pending and approved users. Existing scheduled times will be overridden.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">Selected Time:</p>
            <p className="text-lg font-bold">{bulkScheduleTime ? new Date(bulkScheduleTime).toLocaleString() : 'Not set'}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkSchedule} disabled={processing || !bulkScheduleTime}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
