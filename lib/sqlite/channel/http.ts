import { MsgType } from "@/lib/const"

import { ISqlite } from "../interface"

interface IHttpSendData {
  type: MsgType.CallFunction
  data: {
    method: string
    params: any[]
    dbName: string
    tableId?: string
    userId?: string
  }
  id: string
}

export class HttpSqlite implements ISqlite<string, IHttpSendData> {
  connector: string // URL of the server

  responseMap: Map<string, Response> = new Map()
  constructor(connector: string) {
    this.connector = connector
    this.responseMap = new Map()
  }

  async send(data: IHttpSendData) {
    const response = await fetch(this.connector, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Network response was not ok")
    }
    this.responseMap.set(data.id, response)
  }

  async onCallBack(
    thisCallId: string,
    timeout: number = 5000,
    interval: number = 100
  ) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const checkResponse = async () => {
        const response = this.responseMap.get(thisCallId)
        if (response) {
          try {
            const data: {
              status: "success" | "error"
              result: any
            } = await response.json()
            if (data.status === "success") {
              resolve(data.result)
            } else {
              reject(new Error(data.result))
            }
          } catch (error) {
            reject(new Error(`解析响应失败: ${error instanceof Error ? error.message : '未知错误'}`))
          } finally {
            this.responseMap.delete(thisCallId)
          }
          clearInterval(polling)
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error("在超时时间内未找到响应"))
          clearInterval(polling)
        }
      }

      const polling = setInterval(checkResponse, interval)
    })
  }
}