export type TemplateId = "professional" | "modern" | "minimal" | "executive";

export type CVTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  styles: {
    container: string;
    name: string;
    section: string;
    sectionTitle: string;
    item: string;
  };
};

export const templates: Record<TemplateId, CVTemplate> = {
  professional: {
    id: "professional",
    name: "Professional",
    description: "Clean, traditional layout trusted by recruiters",
    icon: "📋",
    prompt: `Format as a professional, ATS-friendly CV with a clean traditional layout.
- Use a clear sans-serif font style structure
- Bold section headers with horizontal rules
- Left-aligned text, consistent spacing
- Standard reverse-chronological order
- Bullet points for achievements with quantifiable results
- Include contact info at the top`,
    styles: {
      container: "font-sans text-gray-900",
      name: "text-3xl font-bold tracking-tight text-gray-900",
      section: "mt-6 first:mt-0",
      sectionTitle:
        "text-lg font-bold uppercase tracking-wider text-gray-800 border-b-2 border-gray-300 pb-1.5 mb-3",
      item: "mb-4 last:mb-0",
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with accent colors and clean sections",
    icon: "🎨",
    prompt: `Format as a modern, visually structured CV with clear visual hierarchy.
- Use a contemporary layout with distinct sections
- Bold section headers with a colored accent style
- Clean whitespace and modern typography feel
- Highlight key achievements with impactful language
- Skills should stand out as a distinct section
- Include a professional summary at the top`,
    styles: {
      container: "font-sans text-gray-800",
      name: "text-3xl font-bold text-blue-700",
      section: "mt-7 first:mt-0",
      sectionTitle:
        "text-base font-bold uppercase tracking-widest text-blue-700 mb-3",
      item: "mb-4 last:mb-0 border-l-2 border-blue-200 pl-3",
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Elegant, minimalist design with plenty of whitespace",
    icon: "⚪",
    prompt: `Format as a minimalist, elegant CV with plenty of whitespace.
- Use a clean, sparse layout
- Minimal use of borders and lines
- Lots of vertical whitespace between sections
- Simple, understated section headers
- Focus on content clarity over visual complexity
- Use a small, refined typography scale`,
    styles: {
      container: "font-sans text-gray-700 leading-relaxed",
      name: "text-2xl font-light text-gray-900 tracking-wide",
      section: "mt-8 first:mt-0",
      sectionTitle:
        "text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 mb-4",
      item: "mb-6 last:mb-0",
    },
  },
  executive: {
    id: "executive",
    name: "Executive",
    description: "Formal, achievement-focused layout for senior roles",
    icon: "👔",
    prompt: `Format as an executive-level CV focused on leadership and achievements.
- Emphasize strategic impact and leadership experience
- Include a strong executive summary/profile at the top
- Use achievement-focused bullet points with metrics
- Bold section headers with a formal, authoritative style
- Highlight board positions, publications, and speaking engagements
- Use formal, confident language throughout
- Include a 'Core Competencies' section`,
    styles: {
      container: "font-serif text-gray-900",
      name: "text-3xl font-bold text-gray-900 serif",
      section: "mt-6 first:mt-0",
      sectionTitle:
        "text-base font-bold uppercase tracking-wider text-gray-900 border-b border-gray-900 pb-2 mb-4",
      item: "mb-5 last:mb-0",
    },
  },
};

export const templateList = Object.values(templates);
