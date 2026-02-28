import type { TreeItem } from "./TreeList.tsx";

interface DetailPanelProps {
  item: TreeItem;
  width: number;
  height: number;
}

export const DetailPanel = ({ item, width, height }: DetailPanelProps) => {
  const fullPath = [...item.parents, item.key].join(".");

  return (
    <box flexDirection="column" flexGrow={1} paddingLeft={2}>
      <box
        border
        borderStyle="rounded"
        paddingX={1}
        width={width}
        height={height}
        flexDirection="column"
      >
        <text>
          {fullPath}
        </text>
        <text>
          {item.description}
        </text>
      </box>
    </box>
  );
};
