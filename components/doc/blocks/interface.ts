import { ElementTransformer, TextMatchTransformer } from "@lexical/markdown"
import { LexicalCommand } from "lexical"
import { FunctionComponent } from "react"

export interface DocBlock {
    name: string
    icon: string
    node: any
    plugin: FunctionComponent
    onSelect: (editor: any) => void
    keywords: string[]
    transform: ElementTransformer | TextMatchTransformer
    command: {
        create: LexicalCommand<any>
    }
    createNode: (args: any) => any
    markdownLanguage?: string
}