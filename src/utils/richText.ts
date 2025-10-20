const ALLOWED_STYLE_PROPS = new Set(["text-align", "background-color", "color"]);

function filterInlineStyles(styleValue: string) {
  return styleValue
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part)
    .map((part) => {
      const [rawProp, ...rest] = part.split(":");
      if (!rawProp || rest.length === 0) return null;
      const prop = rawProp.trim().toLowerCase();
      if (!ALLOWED_STYLE_PROPS.has(prop)) return null;
      const value = rest.join(":").trim();
      return value ? `${prop}: ${value}` : null;
    })
    .filter((part): part is string => Boolean(part))
    .join("; ");
}

export function sanitizeRichText(value: string): string {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value
      .replace(/<img[^>]*>/gi, "")
      .replace(/style=\"([^\"]*)\"/gi, (_, styles: string) => {
        const filtered = filterInlineStyles(styles);
        return filtered ? `style=\"${filtered}\"` : "";
      })
      .replace(/style='([^']*)'/gi, (_, styles: string) => {
        const filtered = filterInlineStyles(styles);
        return filtered ? `style='${filtered}'` : "";
      })
      .replace(/href=\"(?!https?:)[^\"]*\"/gi, "")
      .replace(/href='(?!https?:)[^']*'/gi, "")
      .trim();
  }
  const div = window.document.createElement("div");
  div.innerHTML = value;
  div.querySelectorAll("img").forEach((node) => node.remove());
  div.querySelectorAll("a").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || !/^https?:\/\//i.test(href)) {
      const textNode = window.document.createTextNode(anchor.textContent ?? "");
      anchor.replaceWith(textNode);
    }
  });
  div.querySelectorAll("*").forEach((element) => {
    const style = element.getAttribute("style");
    if (!style) return;
    const filtered = filterInlineStyles(style);
    if (filtered) {
      element.setAttribute("style", filtered);
    } else {
      element.removeAttribute("style");
    }
  });
  return div.innerHTML;
}

export function stripHtml(value: string): string {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const div = window.document.createElement("div");
  div.innerHTML = value;
  const text = div.textContent || div.innerText || "";
  return text.replace(/\s+/g, " ").trim();
}

export function containsInvalidLinks(value: string): boolean {
  if (!value) return false;
  if (typeof window === "undefined") {
    return /href\s*=\s*"(?!https?:)/i.test(value) || /href\s*=\s*'(?!https?:)/i.test(value);
  }
  const div = window.document.createElement("div");
  div.innerHTML = value;
  return Array.from(div.querySelectorAll("a")).some((anchor) => {
    const href = anchor.getAttribute("href") || "";
    return !/^https?:\/\//i.test(href);
  });
}

export function richTextLength(value: string): number {
  return stripHtml(value).length;
}
