"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Loader2, Layout, GitBranch } from "lucide-react";
import CVOutput from "@/components/cv-output";
import TemplateSelector from "@/components/template-selector";
import GitHubFetcher from "@/components/github-fetcher";
import { TemplateId } from "@/lib/templates";
import type { GitHubRepo } from "@/lib/github";

export default function EnhancerPage() {
  const [cvContent, setCvContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [enhancements, setEnhancements] = useState("");
  const [template, setTemplate] = useState<TemplateId>("professional");
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const handleEnhance = async () => {
    if (!cvContent.trim()) {
      toast.error("Please paste your CV content");
      return;
    }

    setGenerating(true);
    setOutput("");

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/enhance-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvContent,
          jobDescription: jobDescription.trim() || undefined,
          enhancements: enhancements.trim() || undefined,
          template,
          githubRepos: githubRepos.length > 0 ? githubRepos : undefined,
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
        toast.error("Failed to enhance CV. Please try again.");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => abortRef.current?.abort();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Enhance Your CV</h1>
        <p className="text-muted-foreground">
          Paste your existing CV and let AI improve it with professional formatting and impactful language
        </p>
      </div>

      {!output ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" /> Choose Output Style
              </CardTitle>
              <CardDescription>
                Select how you want your enhanced CV to be formatted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector selected={template} onChange={setTemplate} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your CV</CardTitle>
              <CardDescription>Paste your current CV content here</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={cvContent}
                onChange={(e) => setCvContent(e.target.value)}
                placeholder={`Paste your CV here...

Example:
John Doe
Software Engineer

EXPERIENCE
Senior Developer at ABC Corp (2019-Present)
- Developed web applications
- Worked with cross-functional teams

EDUCATION
B.S. Computer Science, MIT (2015-2019)`}
                className="min-h-[300px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Target Job (Optional)</CardTitle>
                <CardDescription>Paste the job description to tailor your CV</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you're applying for..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specific Focus (Optional)</CardTitle>
                <CardDescription>Areas you want improved</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={enhancements}
                  onChange={(e) => setEnhancements(e.target.value)}
                  placeholder="e.g., Make my summary more impactful, highlight leadership skills, optimize for ATS..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" /> GitHub Repositories (Optional)
              </CardTitle>
              <CardDescription>
                Connect GitHub to include your open-source work in the enhanced CV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GitHubFetcher
                selectedRepos={githubRepos}
                onReposChange={setGithubRepos}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button size="lg" onClick={handleEnhance} disabled={generating || !cvContent.trim()} className="px-8">
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enhancing...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Enhance My CV</>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <CVOutput
          output={output}
          generating={generating}
          filename="Enhanced_CV"
          template={template}
          onBack={() => { setOutput(""); setCvContent(""); setJobDescription(""); setEnhancements(""); }}
          onStop={handleStop}
        />
      )}
    </div>
  );
}
