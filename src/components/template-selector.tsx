"use client";

import { TemplateId, templateList } from "@/lib/templates";
import { Card } from "@/components/ui/card";

type TemplateSelectorProps = {
  selected: TemplateId;
  onChange: (id: TemplateId) => void;
};

export default function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {templateList.map((t) => (
        <Card
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`cursor-pointer p-4 transition-all hover:shadow-md ${
            selected === t.id
              ? "ring-2 ring-primary border-primary shadow-sm"
              : "border-muted hover:border-muted-foreground/30"
          }`}
        >
          <div className="text-2xl mb-2">{t.icon}</div>
          <div className="font-semibold text-sm">{t.name}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t.description}
          </div>
        </Card>
      ))}
    </div>
  );
}
