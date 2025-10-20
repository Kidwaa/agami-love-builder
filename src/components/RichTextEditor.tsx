import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import { sanitizeRichText } from "@/utils/richText";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Strikethrough,
  Type,
} from "lucide-react";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

type EditorTab = "wysiwyg" | "markdown";

function htmlToMarkdown(html: string): string {
  if (!html) return "";
  let next = sanitizeRichText(html)
    .replace(/<br\s*\/?>(\s*)/gi, "\n")
    .replace(/<div>(.*?)<\/div>/gi, "\n$1\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<p>/gi, "");

  next = next
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<(?:s|strike)>(.*?)<\/(?:s|strike)>/gi, "~~$1~~")
    .replace(/<span style="text-decoration:\s*line-through;?">(.*?)<\/span>/gi, "~~$1~~")
    .replace(/<span style="background-color:[^>]*">(.*?)<\/span>/gi, "==$1==")
    .replace(/<span style="color:[^>]*">(.*?)<\/span>/gi, "::$1::")
    .replace(/<h1>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/gi, "### $1\n\n");

  next = next.replace(/<a[^>]*href=\"([^\"]*)\"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");

  next = next.replace(/<ul>([\s\S]*?)<\/ul>/gi, (_, list) =>
    list
      .replace(/<li>([\s\S]*?)<\/li>/gi, "- $1\n")
      .replace(/\n{2,}/g, "\n")
  );

  next = next.replace(/<ol>([\s\S]*?)<\/ol>/gi, (_, list) =>
    list
      .replace(/<li>([\s\S]*?)<\/li>/gi, (match, item, index) => `${index + 1}. ${item}\n`)
      .replace(/\n{2,}/g, "\n")
  );

  next = next.replace(/<[^>]+>/g, "");
  return next.replace(/\s+$/g, "").trim();
}

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/\[(.*?)\]\((https?:[^\)]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, '<span style="text-decoration: line-through">$1</span>')
    .replace(/==(.*?)==/g, '<span style="background-color: #fff3a3">$1</span>')
    .replace(/::(.*?)::/g, '<span style="color: #2563eb">$1</span>')
    .replace(/\s{2,}\n/g, "<br />");
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let listBuffer: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    blocks.push(
      `<${listBuffer.type}>${listBuffer.items
        .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
        .join("")}</${listBuffer.type}>`
    );
    listBuffer = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (!listBuffer || listBuffer.type !== "ol") {
        flushList();
        listBuffer = { type: "ol", items: [] };
      }
      listBuffer.items.push(orderedMatch[1]);
      return;
    }
    const unorderedMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (unorderedMatch) {
      if (!listBuffer || listBuffer.type !== "ul") {
        flushList();
        listBuffer = { type: "ul", items: [] };
      }
      listBuffer.items.push(unorderedMatch[1]);
      return;
    }
    flushList();
    blocks.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  });

  flushList();
  return blocks.join("\n");
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  isActive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100",
        isActive ? "bg-indigo-50 text-indigo-600" : ""
      )}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function RichTextEditor({ label, value, onChange, description }: RichTextEditorProps) {
  const [tab, setTab] = React.useState<EditorTab>("wysiwyg");
  const editorRef = React.useRef<HTMLDivElement>(null);
  const syncingRef = React.useRef(false);
  const [markdownValue, setMarkdownValue] = React.useState(() => htmlToMarkdown(value));
  const [highlightColor, setHighlightColor] = React.useState("#fff3a3");
  const [textColor, setTextColor] = React.useState("#1f2937");

  const updateFromHtml = React.useCallback(
    (html: string) => {
      const sanitized = sanitizeRichText(html);
      syncingRef.current = true;
      onChange(sanitized);
      setMarkdownValue(htmlToMarkdown(sanitized));
    },
    [onChange]
  );

  React.useEffect(() => {
    const sanitized = sanitizeRichText(value);
    if (editorRef.current && !syncingRef.current && editorRef.current.innerHTML !== sanitized) {
      editorRef.current.innerHTML = sanitized || "";
    }
    syncingRef.current = false;
    setMarkdownValue(htmlToMarkdown(sanitized));
  }, [value]);

  const exec = (command: string, arg?: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, arg);
    updateFromHtml(editorRef.current.innerHTML);
  };

  const applyHeading = (tag: "h2" | "h3") => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand("formatBlock", false, tag);
    updateFromHtml(editorRef.current.innerHTML);
  };

  const applyLink = () => {
    if (!editorRef.current) return;
    const url = window.prompt("Enter link (http or https)", "https://");
    if (!url) return;
    exec("createLink", url);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    updateFromHtml(editorRef.current.innerHTML);
  };

  const handleMarkdownChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setMarkdownValue(next);
    const html = markdownToHtml(next);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    updateFromHtml(html);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {description ? <p className="text-xs text-slate-500">{description}</p> : null}
      <Tabs value={tab} onValueChange={(value) => setTab(value as EditorTab)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wysiwyg">WYSIWYG</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
        </TabsList>
        <TabsContent value="wysiwyg" className="space-y-2">
          <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 bg-slate-50 p-2">
            <ToolbarButton icon={Bold} label="Bold" onClick={() => exec("bold")} />
            <ToolbarButton icon={Italic} label="Italic" onClick={() => exec("italic")} />
            <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => exec("strikeThrough")} />
            <ToolbarButton icon={Highlighter} label="Highlight" onClick={() => exec("hiliteColor", highlightColor)} />
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Type className="h-4 w-4" />
              <input
                type="color"
                value={textColor}
                onChange={(event) => {
                  setTextColor(event.target.value);
                  exec("foreColor", event.target.value);
                }}
                aria-label="Text color"
                className="h-6 w-10 cursor-pointer border border-slate-200"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Highlighter className="h-4 w-4" />
              <input
                type="color"
                value={highlightColor}
                onChange={(event) => {
                  setHighlightColor(event.target.value);
                  exec("hiliteColor", event.target.value);
                }}
                aria-label="Highlight color"
                className="h-6 w-10 cursor-pointer border border-slate-200"
              />
            </label>
            <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => applyHeading("h2")} />
            <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => applyHeading("h3")} />
            <ToolbarButton icon={AlignLeft} label="Align left" onClick={() => exec("justifyLeft")} />
            <ToolbarButton icon={AlignCenter} label="Align center" onClick={() => exec("justifyCenter")} />
            <ToolbarButton icon={AlignRight} label="Align right" onClick={() => exec("justifyRight")} />
            <ToolbarButton icon={AlignJustify} label="Justify" onClick={() => exec("justifyFull")} />
            <ToolbarButton icon={List} label="Bullet list" onClick={() => exec("insertUnorderedList")} />
            <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => exec("insertOrderedList")} />
            <ToolbarButton icon={LinkIcon} label="Insert link" onClick={applyLink} />
          </div>
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-multiline="true"
            suppressContentEditableWarning
            className="min-h-[220px] w-full rounded-md border border-slate-200 bg-white p-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onInput={handleInput}
          />
        </TabsContent>
        <TabsContent value="markdown">
          <Textarea value={markdownValue} onChange={handleMarkdownChange} className="min-h-[220px]" />
          <p className="text-xs text-slate-500">Use Markdown to fine tune the content. Highlight: ==text==, Text color: ::text::.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
