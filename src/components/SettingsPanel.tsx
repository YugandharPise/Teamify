import { useState } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Clock,
  Mail,
  Smartphone,
  Lock,
  Key,
  Database,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Card } from './ui/card';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  // Account Settings
  const [fullName, setFullName] = useState('Admin User');
  const [email, setEmail] = useState('admin@company.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [role, setRole] = useState('HR Manager');

  // Company Settings
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [companyEmail, setCompanyEmail] = useState('hr@acme.com');
  const [timezone, setTimezone] = useState('America/New_York');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState(true);
  const [newApplications, setNewApplications] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(false);
  const [payrollReminders, setPayrollReminders] = useState(true);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend/Supabase
    console.log('Settings saved');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">TeamifyHR Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-accent">
            <TabsTrigger value="account" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Building2 className="w-4 h-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-foreground data-[state=active]:text-background">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6 mt-6">
            <div>
              <h3 className="text-foreground mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground">Role</Label>
                    <Input
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-foreground">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
                <Button className="bg-foreground hover:opacity-90 text-background">
                  Update Password
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Company Settings */}
          <TabsContent value="company" className="space-y-6 mt-6">
            <div>
              <h3 className="text-foreground mb-4">Company Details</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-foreground">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-foreground">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Regional Settings</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-foreground">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="text-foreground">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Working Hours</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workStart" className="text-foreground">Work Start Time</Label>
                  <Input
                    id="workStart"
                    type="time"
                    defaultValue="09:00"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workEnd" className="text-foreground">Work End Time</Label>
                  <Input
                    id="workEnd"
                    type="time"
                    defaultValue="17:00"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div>
              <h3 className="text-foreground mb-4">Notification Channels</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-foreground">Email Notifications</Label>
                    </div>
                    <p className="text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-foreground">Push Notifications</Label>
                    </div>
                    <p className="text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground">Leave Requests</Label>
                    <p className="text-muted-foreground">
                      Notify when employees submit leave requests
                    </p>
                  </div>
                  <Switch
                    checked={leaveRequests}
                    onCheckedChange={setLeaveRequests}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground">New Job Applications</Label>
                    <p className="text-muted-foreground">
                      Notify when new candidates apply for positions
                    </p>
                  </div>
                  <Switch
                    checked={newApplications}
                    onCheckedChange={setNewApplications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground">Attendance Alerts</Label>
                    <p className="text-muted-foreground">
                      Notify about late arrivals and absences
                    </p>
                  </div>
                  <Switch
                    checked={attendanceAlerts}
                    onCheckedChange={setAttendanceAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <Label className="text-foreground">Payroll Reminders</Label>
                    <p className="text-muted-foreground">
                      Remind about upcoming payroll processing dates
                    </p>
                  </div>
                  <Switch
                    checked={payrollReminders}
                    onCheckedChange={setPayrollReminders}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <div>
              <h3 className="text-foreground mb-4">Authentication</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Key className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-foreground">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout" className="text-foreground">Session Timeout (minutes)</Label>
                  <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="0">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Active Sessions</h3>
              <Card className="p-4 bg-background border-border">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Current Session</p>
                      <p className="text-muted-foreground">Chrome on Windows • Active now</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-border text-muted-foreground">
                      This device
                    </Button>
                  </div>
                  <Separator className="bg-border" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground">Mobile Session</p>
                      <p className="text-muted-foreground">Safari on iPhone • 2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-border text-destructive hover:text-destructive">
                      Revoke
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <Separator className="bg-border" />

            <div>
              <h3 className="text-foreground mb-4">Data & Privacy</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-accent">
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start border-border text-foreground hover:bg-accent">
                  <Database className="w-4 h-4 mr-2" />
                  Export Account Information
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            className="bg-foreground hover:opacity-90 text-background"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
