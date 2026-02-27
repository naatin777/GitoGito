import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type { FlatSchemaItem } from "../../helpers/flat_schema.ts";
import { isEnter, keyEventToInput } from "../../helpers/opentui/key.ts";
import { DetailPanel } from "./components/DetailPanel.tsx";
import { TreeList } from "./components/TreeList.tsx";
import {
  initializeConfigTree,
  moveDown,
  moveUp,
  selectConfigFilteredItems,
  selectConfigOpenPaths,
  selectConfigSelectedIndex,
  toggleItem,
} from "./config_slice.ts";
import {
  DETAIL_PANEL_PADDING,
  HEADER_HEIGHT,
  TREE_LIST_WIDTH,
} from "./constants.ts";

export interface ConfigUIProps {
  flattenConfigSchema: FlatSchemaItem[];
}

export const ConfigUI = ({ flattenConfigSchema }: ConfigUIProps) => {
  const dispatch = useAppDispatch();
  const size = useTerminalDimensions();
  const selectedIndex = useAppSelector(selectConfigSelectedIndex);
  const filteredItems = useAppSelector(selectConfigFilteredItems);
  const openPaths = useAppSelector(selectConfigOpenPaths);

  useEffect(() => {
    dispatch(initializeConfigTree(flattenConfigSchema));
  }, [dispatch]);

  useKeyboard((event) => {
    const input = keyEventToInput(event);

    if (event.name === "up") {
      dispatch(moveUp());
    } else if (event.name === "down") {
      dispatch(moveDown());
    } else if (isEnter(event) || input === " ") {
      dispatch(toggleItem(selectedIndex));
    }
  });

  const visibleRows = size.height - HEADER_HEIGHT;
  const detailPanelWidth = size.width - TREE_LIST_WIDTH -
    DETAIL_PANEL_PADDING;
  const detailPanelHeight = size.height - HEADER_HEIGHT;
  const selectedItem = filteredItems[selectedIndex];

  if (!selectedItem) {
    return <box />;
  }

  return (
    <box flexDirection="column" height={size.height}>
      <box flexDirection="row" height={size.height}>
        <box flexDirection="column" width={40}>
          <TreeList
            items={filteredItems}
            selectedIndex={selectedIndex}
            openPaths={openPaths}
            visibleRows={visibleRows}
          />
        </box>
        <box flexDirection="column" flexGrow={1}>
          <box height={HEADER_HEIGHT} />
          <DetailPanel
            item={selectedItem}
            width={detailPanelWidth}
            height={detailPanelHeight}
          />
        </box>
      </box>
    </box>
  );
};
