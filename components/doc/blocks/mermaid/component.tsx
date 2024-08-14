import { useCallback, useEffect, useRef, useState } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin"
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin"
import html2canvas from "html2canvas"
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  EditorState,
  NodeKey,
} from "lexical"
import { ChevronDown } from "lucide-react"
import mermaid from "mermaid"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

import { $isMermaidNode } from "./node"

export interface MermaidProps {
  text: string
  nodeKey: NodeKey
}
mermaid.initialize({
  theme: "default",
})
export const Mermaid: React.FC<MermaidProps> = ({ text, nodeKey }) => {
  const [mermaidText, setMermaidText] = useState<string>(text)
  const [svg, setSvg] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [mode, setMode] = useState<"preview" | "edit">("preview")
  const { theme } = useTheme()
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setMermaidText(text)
    mermaid.initialize({
      theme: theme === "dark" ? "dark" : "default",
    })
    renderMermaid()
  }, [text, theme])

  const [editor] = useLexicalComposerContext()
  const toggleMode = () => {
    setMode(mode === "preview" ? "edit" : "preview")
  }
  useEffect(() => {
    mermaid.contentLoaded()
  }, [])

  const renderMermaid = useCallback(async () => {
    try {
      const mermaidId = `mermaid-${nodeKey}`
      const isValid = await mermaid.parse(mermaidText)
      if (isValid) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey)
          if (text !== mermaidText && $isMermaidNode(node)) {
            node.setText(mermaidText)
          }
        })
        const { svg } = await mermaid.render(mermaidId, mermaidText)
        setSvg(svg)
        setError("")
      } else {
        setSvg("")
        setError("Invalid Mermaid text")
      }
    } catch (error) {
      setSvg("")
      setError("Invalid Mermaid text")
    }
  }, [mermaidText, text])

  useEffect(() => {
    renderMermaid()
  }, [mermaidText])

  const { toast } = useToast()

  const initialConfig = {
    namespace: "MermaidEditor",
    onError: (error: Error) => console.error(error),
    nodes: [],
    editorState: () => {
      const root = $getRoot()
      const paragraph = $createParagraphNode()
      paragraph.append($createTextNode(mermaidText))
      root.append(paragraph)
    },
  }

  const onChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const newText = editorState.read(() => $getRoot().getTextContent())
      setMermaidText(newText)
    })
  }, [])

  const copyContent = useCallback(
    async (format: "png" | "svg" | "text") => {
      if (mermaidRef.current) {
        try {
          if (format === "text") {
            await navigator.clipboard.writeText(mermaidText)
          } else if (format === "svg") {
            const svgText = mermaidRef.current.innerHTML
            await navigator.clipboard.writeText(svgText)
          } else {
            const canvas = await html2canvas(mermaidRef.current)
            canvas.toBlob((blob) => {
              if (blob) {
                const item = new ClipboardItem({ [`image/${format}`]: blob })
                navigator.clipboard.write([item])
              }
            }, `image/${format}`)
          }
          toast({
            title: `Copied as ${format}`,
            description: "Successfully copied the diagram to the clipboard",
          })
        } catch (error) {
          console.error(`Failed to copy as ${format}:`, error)
          toast({
            title: `Failed to copy as ${format}`,
            description: "Failed to copy the diagram to the clipboard",
          })
        }
      }
    },
    [mermaidText]
  )

  const handleEditorClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className="relative group bg-secondary"
      style={{ minHeight: "200px" }}
      ref={ref}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button variant="outline" size="xs" onClick={toggleMode}>
          {mode === "preview" ? "Edit" : "Preview"}
        </Button>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="xs">
              Copy as <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="group-hover:opacity-100"
            container={ref.current!}
          >
            <DropdownMenuItem onClick={() => copyContent("text")}>
              Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyContent("png")}>
              PNG
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => copyContent("svg")}>
              SVG
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {mode === "edit" && (
        <div onClick={handleEditorClick}>
          <LexicalComposer initialConfig={initialConfig}>
            <PlainTextPlugin
              contentEditable={
                <ContentEditable className="prose dark:prose-invert w-full p-2 h-full border-b outline-none" />
              }
              placeholder={
                <div className="text-muted">
                  Enter your Mermaid diagram code here...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <OnChangePlugin onChange={onChange} />
            <TabIndentationPlugin />
          </LexicalComposer>
        </div>
      )}
      {error && <div className="text-red-500">{error}</div>}
      <div
        ref={mermaidRef}
        className="p-2 flex items-center justify-center"
        dangerouslySetInnerHTML={{
          __html: svg,
        }}
      />
    </div>
  )
}

// Add this custom plugin to handle onChange events
function OnChangePlugin({
  onChange,
}: {
  onChange: (editorState: EditorState) => void
}) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState)
    })
  }, [editor, onChange])
  return null
}
