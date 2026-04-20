import { ScrollBoxRenderable, TextAttributes } from "@opentui/core";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Box, ScrollBox, Text } from "../../../components/ThemedComponents.tsx";
import type { FlatSchemaItem } from "../../../helpers/flat_schema.ts";
import { fullPath } from "../../../helpers/flat_schema.ts";


interface TreeListProps {
  items: FlatSchemaItem[];
  selectedPath: string | null;
  openPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

export const TreeList = (
  {
    items,
    selectedPath,
    openPaths,
    onSelect,
    onToggle,
  }: TreeListProps,
) => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const scrollboxRef = useRef<ScrollBoxRenderable | null>(null)
  const height = (scrollboxRef.current?.height ?? 0) - 1
  useEffect(() => {

    const pos = scrollboxRef.current?.scrollTop ?? 0;
    const index = items.findIndex((item) => fullPath(item) === selectedPath);
    if (index > height + pos) {
      scrollboxRef.current?.scrollTo(index - height);
    } else if (index < pos) {
      scrollboxRef.current?.scrollTo(index);
    }
  }, [selectedPath])

  const params = useParams();
  const allIds = params["*"]?.split("/") ?? [];


  return (
    <Box flexDirection="column" width={30} height="100%">
      <ScrollBox
        ref={scrollboxRef}
      >
        {items.map((item) => {
          const path = fullPath(item);
          const depth = item.parents.length;
          const isSelected = path === selectedPath;
          const isHovered = path === hoveredPath;
          const icon = item.isLeaf ? "•" : openPaths.has(path) ? "▼" : "▶";

          return (
            <Box
              key={path}
              id={path}
              flexDirection="row"
              width="auto"
              alignSelf="flex-start"
              onMouseOver={() => {
                setHoveredPath(path);
              }}
              onMouseOut={() => {
                setHoveredPath((currentPath) =>
                  currentPath === path ? null : currentPath
                );
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(path);
                onToggle(path);
                console.log(path)
                console.error(path)
              }}
            >
              <Text
                color={isSelected ? "primary" : "text"}
                attributes={isSelected || isHovered ? TextAttributes.BOLD : undefined}
              >
                {`${"  ".repeat(depth)}${icon} ${item.key}`}
              </Text>
            </Box>
          );
        })}
      </ScrollBox>
    </Box>
  );
};
