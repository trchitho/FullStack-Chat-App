const inlineFormat = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MarkdownContent = ({ content }) => {
  const lines = content.split(/\r?\n/);
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="my-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-slate-700 sm:pl-6">
        {listItems.map((item) => <li key={item}>{inlineFormat(item)}</li>)}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line === "---") {
      flushList();
      elements.push(<hr key={index} className="my-7 border-slate-200" />);
      return;
    }
    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      return;
    }

    flushList();
    if (line.startsWith("# ")) elements.push(<h1 key={index} className="mb-4 break-words text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{line.slice(2)}</h1>);
    else if (line.startsWith("## ")) elements.push(<h2 key={index} className="mb-3 mt-8 break-words text-xl font-bold text-slate-950 sm:text-2xl">{line.slice(3)}</h2>);
    else if (line.startsWith("### ")) elements.push(<h3 key={index} className="mb-2 mt-6 break-words text-lg font-bold text-slate-900 sm:text-xl">{line.slice(4)}</h3>);
    else if (line.startsWith("> ")) elements.push(<blockquote key={index} className="my-5 rounded-2xl border-l-4 border-blue-600 bg-blue-50 px-5 py-4 text-slate-700">{inlineFormat(line.slice(2))}</blockquote>);
    else elements.push(<p key={index} className="my-3 break-words text-[15px] leading-7 text-slate-700">{inlineFormat(line)}</p>);
  });

  flushList();
  return <div className="min-w-0 max-w-full overflow-x-hidden">{elements}</div>;
};

export default MarkdownContent;
