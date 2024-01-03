import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from "uuid"

export { v4 as uuidv4 } from "uuid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hashText = (text: string) => {
  let hash = 0
  if (text.length == 0) {
    return hash
  }
  for (let i = 0; i < text.length; i++) {
    let char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}

export const checkIsInWorker = () => {
  return globalThis.self === globalThis
}

/**
 * pathname = /space1/5c5bf8539ee9434aa721560c89f34ed6
 * databaseName = space1
 * tableId = 5c5bf8539ee9434aa721560c89f34ed6
 * tableName = user custom name
 * rawTableName = tb_5c5bf8539ee9434aa721560c89f34ed6 (real table name in sqlite)
 * @param id
 * @returns
 */
export const getRawTableNameById = (id: string) => {
  return `tb_${id}`
}

export const getTableIdByRawTableName = (rawTableName: string) => {
  return rawTableName.replace("tb_", "")
}

export const generateColumnName = () => {
  // random 4 characters
  return `cl_${Math.random().toString(36).substring(2, 6)}`
}

export const getRawDocNameById = (id: string) => {
  return `doc_${id}`
}

// uuidv4 remove - and _ to make it shorter
export const shortenId = (id: string) => {
  return id.replace(/-/g, "").replace(/_/g, "")
}

export const extractIdFromShortId = (shortId: string) => {
  return `${shortId.slice(0, 8)}-${shortId.slice(8, 12)}-${shortId.slice(
    12,
    16
  )}-${shortId.slice(16, 20)}-${shortId.slice(20)}`
}

export const getToday = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, "0")
  const day = today.getDate().toString().padStart(2, "0")
  const date = `${year}-${month}-${day}`
  return date
}

export const getLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  const localDate = `${year}-${month}-${day}`
  return localDate
}

export const getUuid = () => {
  return shortenId(uuidv4())
}

// generate a random id with 8 characters
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10)
}
