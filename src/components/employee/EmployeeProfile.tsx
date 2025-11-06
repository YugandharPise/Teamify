import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit2, Save, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface EmployeeProfileProps {
  employee: {
    name: string;
    email: string;
    position: string;
    department: string;
    employeeId: string;
    avatar: string;
    joinDate: string;
  };
}

export default function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);

  const personalInfo = {
    fullName: employee.name,
    email: employee.email,
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street, Apt 4B',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States',
  };

  const employmentInfo = {
    employeeId: employee.employeeId,
    position: employee.position,
    department: employee.department,
    manager: 'John Smith',
    joinDate: employee.joinDate,
    employmentType: 'Full-time',
    workLocation: 'San Francisco Office',
  };

  const emergencyContact = {
    name: 'Jane Johnson',
    relationship: 'Spouse',
    phone: '+1 (555) 987-6543',
    email: 'jane.johnson@email.com',
  };

  const skills = [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'AWS',
    'Docker',
    'GraphQL',
    'MongoDB',
  ];

  const certifications = [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024-03-15',
      expiry: '2027-03-15',
    },
    {
      name: 'Professional Scrum Master',
      issuer: 'Scrum.org',
      date: '2023-09-20',
      expiry: null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-24 h-24 bg-indigo-500/20 text-indigo-400 text-2xl">
            <div className="flex items-center justify-center w-full h-full">
              {employee.avatar}
            </div>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1>{employee.name}</h1>
              <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-500/10">
                Active
              </Badge>
            </div>
            <p className="text-white/80">{employee.position}</p>
            <p className="text-white/60">{employee.department}</p>
            <div className="flex items-center gap-4 mt-4 text-white/60">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{employee.employeeId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-white/5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
          <TabsTrigger value="skills">Skills & Certifications</TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Personal Information</h3>
              {!isEditingPersonal ? (
                <Button onClick={() => setIsEditingPersonal(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditingPersonal(false)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingPersonal(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.fullName} />
                ) : (
                  <p className="text-white/80">{personalInfo.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isEditingPersonal ? (
                  <Input type="email" defaultValue={personalInfo.email} />
                ) : (
                  <p className="text-white/80">{personalInfo.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditingPersonal ? (
                  <Input type="tel" defaultValue={personalInfo.phone} />
                ) : (
                  <p className="text-white/80">{personalInfo.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                {isEditingPersonal ? (
                  <Input type="date" defaultValue={personalInfo.dateOfBirth} />
                ) : (
                  <p className="text-white/80">{new Date(personalInfo.dateOfBirth).toLocaleDateString()}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.address} />
                ) : (
                  <p className="text-white/80">{personalInfo.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.city} />
                ) : (
                  <p className="text-white/80">{personalInfo.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>State</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.state} />
                ) : (
                  <p className="text-white/80">{personalInfo.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Zip Code</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.zipCode} />
                ) : (
                  <p className="text-white/80">{personalInfo.zipCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                {isEditingPersonal ? (
                  <Input defaultValue={personalInfo.country} />
                ) : (
                  <p className="text-white/80">{personalInfo.country}</p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Employment Tab */}
        <TabsContent value="employment">
          <Card className="p-6">
            <h3 className="mb-6">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <p className="text-white/80">{employmentInfo.employeeId}</p>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <p className="text-white/80">{employmentInfo.position}</p>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <p className="text-white/80">{employmentInfo.department}</p>
              </div>

              <div className="space-y-2">
                <Label>Manager</Label>
                <p className="text-white/80">{employmentInfo.manager}</p>
              </div>

              <div className="space-y-2">
                <Label>Join Date</Label>
                <p className="text-white/80">{new Date(employmentInfo.joinDate).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <Label>Employment Type</Label>
                <p className="text-white/80">{employmentInfo.employmentType}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Work Location</Label>
                <p className="text-white/80">{employmentInfo.workLocation}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Emergency Contact Tab */}
        <TabsContent value="emergency">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Emergency Contact</h3>
              {!isEditingEmergency ? (
                <Button onClick={() => setIsEditingEmergency(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditingEmergency(false)}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingEmergency(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                {isEditingEmergency ? (
                  <Input defaultValue={emergencyContact.name} />
                ) : (
                  <p className="text-white/80">{emergencyContact.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                {isEditingEmergency ? (
                  <Input defaultValue={emergencyContact.relationship} />
                ) : (
                  <p className="text-white/80">{emergencyContact.relationship}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                {isEditingEmergency ? (
                  <Input type="tel" defaultValue={emergencyContact.phone} />
                ) : (
                  <p className="text-white/80">{emergencyContact.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                {isEditingEmergency ? (
                  <Input type="email" defaultValue={emergencyContact.email} />
                ) : (
                  <p className="text-white/80">{emergencyContact.email}</p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Skills & Certifications Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Skills</h3>
              <Button>
                <Edit2 className="w-4 h-4 mr-2" />
                Manage Skills
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-indigo-400 border-indigo-400/30 bg-indigo-500/10 px-4 py-2"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3>Certifications</h3>
              <Button>
                <Edit2 className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4>{cert.name}</h4>
                      <p className="text-white/60 mt-1">{cert.issuer}</p>
                      <div className="flex gap-4 mt-2 text-white/60">
                        <span>Issued: {new Date(cert.date).toLocaleDateString()}</span>
                        {cert.expiry && (
                          <span>Expires: {new Date(cert.expiry).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-400 border-green-400/30 bg-green-500/10"
                    >
                      Valid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
