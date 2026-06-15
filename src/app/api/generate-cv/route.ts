import { NextRequest } from "next/server";
import groq from "@/lib/groq";

const templatePrompts: Record<string, string> = {
  professional: `Use this EXACT structure (keep the markdown formatting):
# Full Name
email@example.com | +1 234 567 890 | linkedin.com/in/username

## Professional Summary
2-3 sentence summary of experience and career goals.

## Experience
### Job Title | Company Name
- Achievement bullet point with quantifiable results
- Another achievement bullet point

### Previous Job Title | Previous Company
- Achievement bullet point
- Another achievement bullet point

## Education
### Degree Name | Institution Name
- GPA: X.X (if applicable)

## Skills
- Skill 1, Skill 2, Skill 3, Skill 4
- Technical: Skill A, Skill B, Skill C

CRITICAL: First line MUST be "# Name". Contact info goes right after. Use "### Title | Company" for experience items. Use "- " for bullet points. Reverse chronological order. Quantifiable achievements. ATS-friendly.`,

  modern: `Use this EXACT structure (keep the markdown formatting):
# Full Name
email@example.com | +1 234 567 890 | linkedin.com/in/username

## Professional Summary
2-3 sentence summary highlighting expertise.

## Experience
### Job Title | Company Name
- Achievement bullet point with impact

### Previous Job Title | Previous Company
- Achievement bullet point

## Education
### Degree Name | Institution Name
- details

## Skills
- Skill 1, Skill 2, Skill 3, Skill 4

CRITICAL: First line MUST be "# Name". Contact info goes right after. Use "### Title | Company" for experience items. Modern visual style with clean sections.`,

  minimal: `Use this EXACT structure (keep the markdown formatting):
# Full Name
email@example.com | +1 234 567 890 | linkedin.com/in/username

## Summary
Brief, elegant summary.

## Experience
### Job Title | Company Name
- Concise bullet point
- Another bullet point

## Education
### Degree Name | Institution Name
- details

## Skills
- Skill 1, Skill 2, Skill 3

CRITICAL: First line MUST be "# Name". Contact info goes right after. Use "### Title | Company" for experience items. Minimal formatting, sparse layout.`,

  executive: `Use this EXACT structure (keep the markdown formatting):
# Full Name
email@example.com | +1 234 567 890 | linkedin.com/in/username

## Executive Summary
Powerful 2-3 sentence executive profile highlighting leadership.

## Experience
### Job Title | Company Name
- Strategic achievement with metrics
- Leadership impact bullet point

## Education
### Degree Name | Institution Name
- details

## Core Competencies
- Strategic: Skill 1, Skill 2, Skill 3
- Technical: Skill A, Skill B, Skill C

CRITICAL: First line MUST be "# Name". Contact info goes right after. Use "### Title | Company" for experience items. Formal language, metrics-driven.`,
};

export async function POST(request: NextRequest) {
  const { personalInfo, experience, education, skills, projects, template = "professional" } = await request.json();
  const styleGuide = templatePrompts[template] || templatePrompts.professional;

  const prompt = `Create a professional CV in markdown format from this information.

${styleGuide}

## DATA
- Name: ${personalInfo.name}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- LinkedIn: ${personalInfo.linkedin}
- Summary: ${personalInfo.summary}

## Work Experience
${experience.map((exp: any, i: number) => `${i + 1}. Title: ${exp.jobTitle} | Company: ${exp.company} | Period: ${exp.startDate} - ${exp.endDate}
   Description: ${exp.description}`).join("\n")}

## Education
${education.map((edu: any, i: number) => `${i + 1}. Degree: ${edu.degree} | Field: ${edu.field} | Institution: ${edu.institution} | Period: ${edu.startDate} - ${edu.endDate} | GPA: ${edu.gpa}`).join("\n")}

## Skills
${skills.map((s: string) => `- ${s}`).join("\n")}

## Projects
${projects.map((proj: any, i: number) => `${i + 1}. ${proj.name}: ${proj.description} (${proj.technologies})`).join("\n")}

Output ONLY the CV markdown. No extra commentary.`;

  const stream = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: "You are an expert CV writer. Output only the CV markdown with no extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_completion_tokens: 4096,
    top_p: 1,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
