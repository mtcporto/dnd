import { normalizeRulesMarkdown } from "../domain/item-presentation.ts";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const plugins = [remarkGfm];

export function RulesText({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  const markdown = normalizeRulesMarkdown(text);
  return (
    <div className="rules-description">
      <Markdown remarkPlugins={plugins} skipHtml>
        {markdown}
      </Markdown>
    </div>
  );
}
