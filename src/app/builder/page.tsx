"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, FileText, Layout, Eye, EyeOff } from "lucide-react";
import CVOutput from "@/components/cv-output";
import TemplateSelector from "@/components/template-selector";
import { TemplateId } from "@/lib/templates";

type Experience = {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Education = {
  degree: string;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
  gpa: string;
};

type Project = {
  name: string;
  description: string;
  technologies: string;
};

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [template, setTemplate] = useState<TemplateId>("professional");
  const [showTemplatePicker, setShowTemplatePicker] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    summary: "",
  });
  const [experience, setExperience] = useState<Experience[]>([
    { jobTitle: "", company: "", startDate: "", endDate: "", description: "" },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { degree: "", field: "", institution: "", startDate: "", endDate: "", gpa: "" },
  ]);
  const [skills, setSkills] = useState("");
  const [projects, setProjects] = useState<Project[]>([
    { name: "", description: "", technologies: "" },
  ]);

  const abortRef = useRef<AbortController | null>(null);

  const addExperience = () => {
    setExperience([...experience, { jobTitle: "", company: "", startDate: "", endDate: "", description: "" }]);
  };
  const removeExperience = (index: number) => {
    if (experience.length > 1) setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setExperience(experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)));
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", field: "", institution: "", startDate: "", endDate: "", gpa: "" }]);
  };
  const removeEducation = (index: number) => {
    if (education.length > 1) setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setEducation(education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)));
  };

  const addProject = () => {
    setProjects([...projects, { name: "", description: "", technologies: "" }]);
  };
  const removeProject = (index: number) => {
    if (projects.length > 1) setProjects(projects.filter((_, i) => i !== index));
  };
  const updateProject = (index: number, field: keyof Project, value: string) => {
    setProjects(projects.map((proj, i) => (i === index ? { ...proj, [field]: value } : proj)));
  };

  const handleGenerate = async () => {
    if (!personalInfo.name) {
      toast.error("Please enter your name");
      setActiveTab("personal");
      return;
    }

    setGenerating(true);
    setOutput("");
    setShowTemplatePicker(false);
    const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalInfo, experience, education, skills: skillsList, projects, template,
        }),
        signal: abortRef.current.signal,
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Failed to generate CV. Please try again.");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  const filledFields = [
    personalInfo.name && "Name",
    personalInfo.summary && "Summary",
    experience[0]?.jobTitle && "Experience",
    education[0]?.degree && "Education",
    skills && "Skills",
    projects[0]?.name && "Projects",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Build Your CV</h1>
        <p className="text-muted-foreground">
          Fill in your details and let AI create a professional CV for you
        </p>
      </div>

      {!output && showTemplatePicker && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="w-5 h-5" /> Choose a Template
            </CardTitle>
            <CardDescription>
              Pick a style for your CV. Each template has a unique layout and formatting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateSelector selected={template} onChange={setTemplate} />
          </CardContent>
        </Card>
      )}

      {!output ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="grid grid-cols-5 max-w-2xl">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            {filledFields.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                {filledFields.map((f) => (
                  <Badge key={f} variant="secondary" className="px-2 py-0.5">{f}</Badge>
                ))}
              </div>
            )}
          </div>

          <TabsContent value="personal" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic details and professional summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn URL</Label>
                    <Input id="linkedin" value={personalInfo.linkedin} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} placeholder="https://linkedin.com/in/johndoe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea id="summary" value={personalInfo.summary} onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })} placeholder="Brief overview of your career and goals..." className="min-h-[100px]" />
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowTemplatePicker(!showTemplatePicker)}>
                    {showTemplatePicker ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    Templates
                  </Button>
                  <Button onClick={() => setActiveTab("experience")}>Next: Experience</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional work history</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addExperience}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    {experience.length > 1 && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeExperience(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input value={exp.jobTitle} onChange={(e) => updateExperience(index, "jobTitle", e.target.value)} placeholder="Software Engineer" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input value={exp.company} onChange={(e) => updateExperience(index, "company", e.target.value)} placeholder="Acme Corp" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input value={exp.startDate} onChange={(e) => updateExperience(index, "startDate", e.target.value)} placeholder="Jan 2020" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input value={exp.endDate} onChange={(e) => updateExperience(index, "endDate", e.target.value)} placeholder="Present" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={exp.description} onChange={(e) => updateExperience(index, "description", e.target.value)} placeholder="Describe your responsibilities and achievements..." className="min-h-[80px]" />
                    </div>
                    {index < experience.length - 1 && <Separator />}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("education")}>Next: Education</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>Your academic background</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    {education.length > 1 && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeEducation(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input value={edu.degree} onChange={(e) => updateEducation(index, "degree", e.target.value)} placeholder="Bachelor of Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>Field of Study</Label>
                        <Input value={edu.field} onChange={(e) => updateEducation(index, "field", e.target.value)} placeholder="Computer Science" />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input value={edu.institution} onChange={(e) => updateEducation(index, "institution", e.target.value)} placeholder="MIT" />
                      </div>
                      <div className="space-y-2">
                        <Label>GPA</Label>
                        <Input value={edu.gpa} onChange={(e) => updateEducation(index, "gpa", e.target.value)} placeholder="3.8" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input value={edu.startDate} onChange={(e) => updateEducation(index, "startDate", e.target.value)} placeholder="Sep 2016" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input value={edu.endDate} onChange={(e) => updateEducation(index, "endDate", e.target.value)} placeholder="Jun 2020" />
                      </div>
                    </div>
                    {index < education.length - 1 && <Separator />}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("skills")}>Next: Skills</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Technical and professional skills (comma separated)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="JavaScript, React, Node.js, Python, TypeScript, AWS..."
                  className="min-h-[120px]"
                />
                {skills && (
                  <div className="flex flex-wrap gap-2">
                    {skills.split(",").map((s, i) => s.trim() && (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{s.trim()}</span>
                    ))}
                  </div>
                )}
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("projects")}>Next: Projects</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Notable projects you've worked on</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {projects.map((proj, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                    {projects.length > 1 && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => removeProject(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input value={proj.name} onChange={(e) => updateProject(index, "name", e.target.value)} placeholder="E-commerce Platform" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={proj.description} onChange={(e) => updateProject(index, "description", e.target.value)} placeholder="Brief description..." className="min-h-[60px]" />
                    </div>
                    <div className="space-y-2">
                      <Label>Technologies Used</Label>
                      <Input value={proj.technologies} onChange={(e) => updateProject(index, "technologies", e.target.value)} placeholder="React, Node.js, MongoDB" />
                    </div>
                    {index < projects.length - 1 && <Separator />}
                  </div>
                ))}
                <div className="flex justify-center pt-4">
                  <Button size="lg" onClick={handleGenerate} disabled={generating} className="px-8">
                    {generating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><FileText className="w-4 h-4 mr-2" /> Generate CV</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <CVOutput
          output={output}
          generating={generating}
          filename={personalInfo.name.replace(/\s+/g, "_") + "_CV"}
          template={template}
          onBack={() => { setOutput(""); setActiveTab("personal"); setShowTemplatePicker(false); }}
          onStop={handleStop}
        />
      )}
    </div>
  );
}
