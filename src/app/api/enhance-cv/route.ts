import { NextRequest } from "next/server";
import groq from "@/lib/groq";

const templatePrompts: Record<string, string> = {
  professional: "Professional & Traditional style: ATS-friendly, clean sans-serif structure, quantifiable achievements, reverse-chronological",
  modern: "Modern & Contemporary style: accent-colored headers, clean whitespace, skills prominent, professional summary at top",
  minimal: "Minimalist & Elegant style: sparse layout, generous whitespace, understated headers, concise content",
  executive: "Executive & Formal style: leadership emphasis, metrics-driven, formal language, core competencies section",
};

export async function POST(request: NextRequest) {
  const { cvContent, jobDescription, enhancements, template = "professional" } = await request.json();
  const styleGuide = templatePrompts[template] || templatePrompts.professional;

  const prompt = `Enhance this CV. Use this EXACT structure:
# Full Name
email | phone | linkedin

## Professional Summary
summary

## Experience
### Job Title | Company
- bullet points

## Education
### Degree | Institution
- details

## Skills
- skills

Style: ${styleGuide}

Original CV:
${cvContent}

${jobDescription ? `\nTarget Job:\n${jobDescription}` : ""}
${enhancements ? `\nFocus: ${enhancements}` : ""}

Output ONLY the enhanced CV markdown. No commentary.`;

  const stream = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: "You are an expert CV reviewer. Output only the enhanced CV markdown.",
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
