import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] gap-12">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Build Professional CVs with{" "}
          <span className="text-primary">AI</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Create stunning resumes from scratch or enhance your existing CV using the power of Llama 4 Scout.
          Choose from 4 professional templates — Professional, Modern, Minimal, or Executive.
          Land your dream job with a perfectly crafted CV.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl">
        <Link href="/builder">
          <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Build New CV</CardTitle>
              <CardDescription>
                Create a professional CV from scratch. Fill in your details, pick a template, and let AI format it perfectly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 h-auto">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/enhancer">
          <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Enhance Existing CV</CardTitle>
              <CardDescription>
                Paste your existing CV and get AI-powered suggestions to improve it. Optimize for ATS and impact.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="group-hover:translate-x-1 transition-transform p-0 h-auto">
                Enhance Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
