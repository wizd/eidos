import React from "react"
import { ViewTypeEnum } from "@/worker/meta_table/view"

import Grid from "../grid"
import { useCurrentView } from "./hooks"
import { ViewToolbar } from "./view-toolbar"

const GalleryView = React.lazy(() => import("./views/gallery"))

interface ITableProps {
  space: string
  tableName: string
  viewId?: string
  isEmbed?: boolean
}

export const Table = ({ tableName, space, viewId, isEmbed }: ITableProps) => {
  const { currentView } = useCurrentView()

  return (
    <div className="h-full w-full overflow-hidden p-2">
      <ViewToolbar
        tableName={tableName}
        space={space}
        isEmbed={Boolean(isEmbed)}
      />
      {currentView?.type === ViewTypeEnum.Grid && (
        <Grid tableName={tableName!} databaseName={space} />
      )}
      {currentView?.type === ViewTypeEnum.Gallery && (
        <GalleryView space={space} tableName={tableName} view={currentView} />
      )}
    </div>
  )
}
