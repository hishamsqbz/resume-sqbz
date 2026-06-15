"use client";

import { useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Printer, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { TemplateId, templates, type CVTemplate } from "@/lib/templates";

type CVOutputProps = {
  output: string;
  generating: boolean;
  filename?: string;
  template?: string;
  onBack?: () => void;
  onStop?: () => void;
};

const STYLES: Record<string, {
  body: string; headerBg: string; headerText: string;
  nameSize: string; sectionBorder: string; sectionColor: string;
  accent: string; muted: string; secondary: string; font: string;
  headerLayout: string;
}> = {
  professional: {
    body: "color:#2d2d2d;line-height:1.5",
    headerBg: "#1a365d", headerText: "#ffffff",
    nameSize: "24pt", sectionBorder: "2px solid #1a365d",
    sectionColor: "#1a365d", accent: "#e2e8f0",
    muted: "#718096", secondary: "#2d3748",
    font: "'Segoe UI',Arial,sans-serif",
    headerLayout: "center",
  },
  modern: {
    body: "color:#374151;line-height:1.55",
    headerBg: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    headerText: "#ffffff", nameSize: "26pt",
    sectionBorder: "3px solid #2563eb",
    sectionColor: "#2563eb", accent: "#dbeafe",
    muted: "#6b7280", secondary: "#1e3a5f",
    font: "'Inter','Segoe UI',Arial,sans-serif",
    headerLayout: "center",
  },
  minimal: {
    body: "color:#404040;line-height:1.65",
    headerBg: "#ffffff", headerText: "#171717",
    nameSize: "28pt", sectionBorder: "1px solid #d4d4d4",
    sectionColor: "#a3a3a3", accent: "#f5f5f5",
    muted: "#a3a3a3", secondary: "#171717",
    font: "'Inter','Helvetica Neue',Arial,sans-serif",
    headerLayout: "left",
  },
  executive: {
    body: "color:#1a1a1a;line-height:1.5",
    headerBg: "#1a1a1a", headerText: "#ffffff",
    nameSize: "22pt", sectionBorder: "1px solid #1a1a1a",
    sectionColor: "#1a1a1a", accent: "#f0f0f0",
    muted: "#666666", secondary: "#333333",
    font: "Georgia,'Times New Roman',serif",
    headerLayout: "left",
  },
};

function mdToHtml(md: string, tpl: CVTemplate): string {
  const s = STYLES[tpl.id] || STYLES.professional;
  const lines = md.split("\n");
  const parts: string[] = [];
  let name = "", contactBuf: string[] = [], inHeader = false;
  let inList = false, listTag = "ul";

  const esc = (x: string) =>
    x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
      .replace(/`(.+?)`/g,"<code style='background:#eee;padding:1px 4px;border-radius:2px;font-size:9pt'>$1</code>");

  const closeList = () => { if (inList) { parts.push(`</${listTag}>`); inList = false; } };

  for (const raw of lines) {
    const L = raw.trim();
    if (!L) { closeList(); if (inHeader) inHeader = false; continue; }

    if (L.startsWith("# ")) {
      name = esc(L.slice(2));
      inHeader = true; contactBuf = []; continue;
    }

    if (inHeader && !L.startsWith("##")) {
      contactBuf.push(L); continue;
    }
    if (inHeader) inHeader = false;

    if (L.startsWith("## ")) {
      closeList();
      const t = esc(L.slice(3));
      parts.push(`<div class="sec"><span class="sec-bar"></span>${t}</div>`);
      continue;
    }

    if (L.startsWith("### ")) {
      closeList();
      const c = esc(L.slice(4));
      const p = c.split("|").map(x => x.trim());
      parts.push(`<div class="item-hdr"><span class="item-t">${p[0]}</span>${p[1] ? `<span class="item-s">${p[1]}</span>` : ""}</div>`);
      continue;
    }

    if (L === "---") { closeList(); parts.push(`<hr>`); continue; }

    if (L.startsWith("- ")) {
      if (!inList) { parts.push(`<ul>`); inList = true; listTag = "ul"; }
      parts.push(`<li>${esc(L.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(L)) {
      if (!inList) { parts.push(`<ol>`); inList = true; listTag = "ol"; }
      parts.push(`<li>${esc(L.replace(/^\d+\.\s/,""))}</li>`);
      continue;
    }

    closeList();
    parts.push(`<p>${esc(L)}</p>`);
  }
  closeList();

  const contactHtml = contactBuf.length
    ? `<div class="ct">${contactBuf.map(l => esc(l)).join(" &nbsp;·&nbsp; ")}</div>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CV</title>
<style>
@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family:${s.font}; font-size:10pt; ${s.body}; background:#fff; }
.page { width:210mm; min-height:297mm; margin:0 auto; padding:0; position:relative; }
.hdr { background:${s.headerBg}; color:${s.headerText}; padding:32px 40px 28px; text-align:${s.headerLayout}; }
.hdr .nm { font-size:${s.nameSize}; font-weight:700; letter-spacing:-0.02em; margin-bottom:4px; }
.hdr .ct { font-size:9pt; opacity:0.85; line-height:1.6; margin-top:6px; }
.body { padding:24px 40px 40px; }
.sec { font-size:10.5pt; font-weight:700; color:${s.sectionColor}; text-transform:uppercase; letter-spacing:0.06em; margin:18px 0 8px 0; padding-bottom:4px; border-bottom:${s.sectionBorder}; display:flex; align-items:center; gap:8px; }
.sec-bar { display:${tpl.id === "modern" ? "inline-block" : "none"}; width:4px; height:14px; background:${s.sectionColor}; border-radius:2px; }
.item-hdr { display:flex; justify-content:space-between; align-items:baseline; margin:8px 0 2px; flex-wrap:wrap; }
.item-t { font-weight:700; color:${s.secondary}; font-size:10.5pt; }
.item-s { font-size:9pt; color:${s.muted}; white-space:nowrap; }
p { margin:3px 0; font-size:10pt; line-height:1.5; }
ul, ol { margin:3px 0 3px 16px; }
li { margin:1.5px 0; font-size:10pt; line-height:1.45; }
hr { border:none; border-top:1px solid ${s.accent}; margin:6px 0; }
strong { color:${s.secondary}; }
code { background:${s.accent}; padding:1px 4px; border-radius:2px; font-size:9pt; }
@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
</style></head><body>
<div class="page">
<div class="hdr"><div class="nm">${name || "Your Name"}</div>${contactHtml}</div>
<div class="body">${parts.join("\n")}</div>
</div>
</body></html>`;
}

export default function CVOutput({ output, generating, filename = "CV", template = "professional", onBack, onStop }: CVOutputProps) {
  const tpl = templates[template as TemplateId] || templates.professional;

  const handleDownloadMarkdown = () => {
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = useCallback(() => {
    const html = mdToHtml(output, tpl);
    const win = window.open("", "_blank");
    if (!win) { toast.error("Please allow pop-ups"); return; }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 600);
  }, [output, tpl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Your CV</h2>
          <Badge variant="secondary" className="text-xs">{tpl.icon} {tpl.name}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          {generating && onStop && (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Stop
            </Button>
          )}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
            <FileText className="w-4 h-4 mr-2" /> .md
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print / PDF
          </Button>
        </div>
      </div>
      <Separator />
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {output || (generating ? "*Generating your CV...*" : "")}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
