import { OpenAIStream, StreamingTextResponse } from "ai"
import OpenAI from "openai"

import { tools } from "@/lib/ai/functions"

// import { queryEmbedding } from "../routes/lib"
import { IData } from "./interface"

export async function handleOpenAI(
  data: IData,
  options?: {
    useFunctions: boolean
  }
) {
  const { useFunctions = true } = options || {}
  const {
    messages,
    apiKey,
    baseUrl,
    systemPrompt,
    model: modelAndProvider,
    // currentPreviewFile,
  } = data

  const model = modelAndProvider.split("@")[0]
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  })

  const lastMsg = messages[messages.length - 1]
  let newMsgs = [
    systemPrompt?.length
      ? {
          role: "system" as const,
          content: systemPrompt,
        }
      : undefined,
    ...messages,
  ].filter(Boolean)

  console.log({ systemPrompt, messages, newMsgs })
  // if (
  //   currentPreviewFile &&
  //   // is user query
  //   lastMsg.role === "user"
  // ) {
  //   const res = await queryEmbedding({
  //     query: lastMsg.content,
  //     model: "text-embedding-ada-002",
  //     scope: currentPreviewFile.id,
  //     provider: {
  //       name: "openai",
  //       token: token,
  //     },
  //   })
  //   const context = res?.map((em) => em?.raw_content).join("\n")
  //   newMsgs = [
  //     ...messages,
  //     {
  //       role: "user",
  //       content: `here are some information: \n${context}`,
  //     },
  //   ]
  //   console.log("sw", newMsgs)
  // }
  let request: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
    model: model ?? "gpt-3.5-turbo-0613",
    stream: true,
    messages: newMsgs,
    ...(data.paths && { paths: data.paths }),
    ...(data.space && { space: data.space }),
  } as any
  if (useFunctions) {
    request = {
      ...request,
      tool_choice: "auto",
      tools: tools as any,
    }
  }
  console.log(request)
  const response = await openai.chat.completions.create(request)
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}
