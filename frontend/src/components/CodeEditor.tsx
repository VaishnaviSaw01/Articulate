import Editor from "@monaco-editor/react";

const MONACO_LANGUAGE: Record<string, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
};

export function CodeEditor(props: {
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <Editor
        height="420px"
        language={MONACO_LANGUAGE[props.language] ?? "javascript"}
        value={props.value}
        onChange={(value) => props.onChange(value ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
