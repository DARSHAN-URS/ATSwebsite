import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import type { CustomSection } from "./types";

interface Props {
  sections: CustomSection[];
  onChange: (sections: CustomSection[]) => void;
}

export default function CustomSectionsEditor({ sections, onChange }: Props) {
  const addSection = () => {
    onChange([...sections, { id: crypto.randomUUID(), title: "", items: [""] }]);
  };

  const updateTitle = (index: number, title: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], title };
    onChange(updated);
  };

  const addItem = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      items: [...updated[sectionIndex].items, ""],
    };
    onChange(updated);
  };

  const updateItem = (sectionIndex: number, itemIndex: number, value: string) => {
    const updated = [...sections];
    const items = [...updated[sectionIndex].items];
    items[itemIndex] = value;
    updated[sectionIndex] = { ...updated[sectionIndex], items };
    onChange(updated);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex] = {
      ...updated[sectionIndex],
      items: updated[sectionIndex].items.filter((_, i) => i !== itemIndex),
    };
    onChange(updated);
  };

  const removeSection = (index: number) => {
    onChange(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {sections.map((section, si) => (
        <Card key={section.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <Label className="text-xs">Section Title</Label>
                <Input
                  value={section.title}
                  onChange={(e) => updateTitle(si, e.target.value)}
                  placeholder="e.g. Certifications, Projects, Languages..."
                  className="font-medium"
                />
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 mt-4" onClick={() => removeSection(si)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items.map((item, ii) => (
              <div key={ii} className="flex gap-2 items-center">
                <span className="text-muted-foreground">•</span>
                <Input
                  value={item}
                  onChange={(e) => updateItem(si, ii, e.target.value)}
                  placeholder="Add an item..."
                  className="h-8 text-sm"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(si, ii)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addItem(si)} className="text-xs">
              <Plus className="h-3 w-3 mr-1" />Add Item
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={addSection} className="w-full border-dashed">
        <Plus className="h-4 w-4 mr-2" />Add Custom Section
      </Button>
    </div>
  );
}
