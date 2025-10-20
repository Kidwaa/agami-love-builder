import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function RichTextEditor({ label, value, onChange, description }: RichTextEditorProps) {
  const [tab, setTab] = React.useState<"wysiwyg" | "markdown">("wysiwyg");
  const editorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (tab === "wysiwyg" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [tab, value]);

  return (
    <div className="space-y-2">
      <Tabs value={tab} onValueChange={(val) => setTab(val as "wysiwyg" | "markdown")}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <TabsList>
            <TabsTrigger value="wysiwyg">WYSIWYG</TabsTrigger>
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
          </TabsList>
        </div>
        {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        <TabsContent value="wysiwyg">
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-multiline="true"
            suppressContentEditableWarning
            className={cn(
              "min-h-[200px] w-full rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            )}
            onInput={(event) => onChange((event.target as HTMLDivElement).innerHTML)}
          />
        </TabsContent>
        <TabsContent value="markdown">
          <Textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[200px]" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
