import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const plugins = [remarkGfm];

export function RulesText({ text }: { text?: string }) {
  if (!text?.trim()) return null;
  // Some source/translated labels include spaces inside their bold delimiters.
  const markdown = text.replace(
    /\*\*([^\n*]+)\*\*/g,
    (_, label: string) => `**${label.trim()}**`,
  );
  return (
    <div className="rules-description">
      <Markdown remarkPlugins={plugins} skipHtml>
        {markdown}
      </Markdown>
    </div>
  );
}
