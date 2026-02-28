import { TextAttributes } from "@opentui/core";
import { TREE_LIST_WIDTH } from "../constants.ts";

export interface TreeItem {
  key: string;
  parents: string[];
  description: string | undefined;
  isLeaf: boolean;
}

interface TreeListProps {
  items: TreeItem[];
  selectedIndex: number;
  openPaths: Set<string>;
  visibleRows: number;
}

export const TreeList = (
  { items, selectedIndex, openPaths, visibleRows }: TreeListProps,
) => {
  let start = selectedIndex - Math.floor(visibleRows / 2);
  if (start < 0) start = 0;
  if (start + visibleRows > items.length) {
    start = Math.max(0, items.length - visibleRows);
  }

  const visibleItems = items.slice(start, start + visibleRows);

  return (
    <box flexDirection="column" width={TREE_LIST_WIDTH}>
      <text attributes={TextAttributes.BOLD}>{`<Config>`}</text>
      {visibleItems.map((item, sliceIndex) => {
        const actualIndex = start + sliceIndex;
        const depth = item.parents.length;
        const path = [...item.parents, item.key].join(".");
        const indent = "  ".repeat(depth);
        const icon = item.isLeaf ? "○ " : openPaths.has(path) ? "▼ " : "▶ ";
        const isSelected = actualIndex === selectedIndex;

        return (
          <box key={`${path}-${actualIndex}`} flexDirection="row">
            <text fg={isSelected ? "cyan" : undefined}>
              {indent}
              {icon}
            </text>
            <text fg={isSelected ? "cyan" : undefined}>
              {item.key}
            </text>
          </box>
        );
      })}
    </box>
  );
};
