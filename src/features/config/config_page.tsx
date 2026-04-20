import { TextAttributes } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import { SplitPane } from "../../components/SplitPane.tsx";
import { Box, Text } from "../../components/ThemedComponents.tsx";
import { useThemeMode } from "../../contexts/theme_mode_context.tsx";
import type { FlatSchemaItem } from "../../helpers/flat_schema.ts";
import { fullPath as getFullPath } from "../../helpers/flat_schema.ts";
import { isEnter, keyEventToInput } from "../../helpers/opentui/key.ts";
import { NotificationBar } from "../notifications/NotificationBar.tsx";
import { DetailPanel } from "./components/DetailPanel.tsx";
import { TreeList } from "./components/TreeList.tsx";
import {
  initializeConfigTree,
  moveDown,
  moveUp,
  selectConfigFilteredItems,
  selectConfigOpenPaths,
  selectConfigSelectedItem,
  selectConfigSelectedPath,
  selectItem,
  toggleItem,
} from "./config_page_slice.ts";

export interface ConfigPageProps {
  flattenConfigSchema: FlatSchemaItem[];
}

export const ConfigPage = ({ flattenConfigSchema }: ConfigPageProps) => {
  const dispatch = useAppDispatch();
  const size = useTerminalDimensions();
  const selectedPath = useAppSelector(selectConfigSelectedPath);
  const filteredItems = useAppSelector(selectConfigFilteredItems);
  const openPaths = useAppSelector(selectConfigOpenPaths);
  const selectedItem = useAppSelector(selectConfigSelectedItem);

  const theme = useThemeMode()

  useEffect(() => {
    dispatch(initializeConfigTree(flattenConfigSchema));
  }, [dispatch, flattenConfigSchema]);

  const handleSelect = useMemo(
    () => (path: string) => {
      dispatch(selectItem(path));
    },
    [dispatch],
  );

  const handleToggle = useMemo(
    () => (path: string) => {
      dispatch(toggleItem(path));
    },
    [dispatch],
  );

  useKeyboard((event) => {
    const input = keyEventToInput(event);

    if (event.name === "up") {
      dispatch(moveUp());
    } else if (event.name === "down") {
      dispatch(moveDown());
    } else if (isEnter(event) || input === " ") {
      if (selectedItem) {
        dispatch(toggleItem(getFullPath(selectedItem)));
      }
    }
  });

  if (!selectedItem) {
    return <Box />;
  }

  return (
    <Box flexDirection="column" height={size.height}>
      <Text attributes={TextAttributes.BOLD}>
        {`<Config> ${theme ?? ""}`}
      </Text>
      <SplitPane direction="horizontal">
        <TreeList
          items={filteredItems}
          selectedPath={selectedPath}
          openPaths={openPaths}
          onSelect={handleSelect}
          onToggle={handleToggle}
        />
        <DetailPanel item={selectedItem} />
      </SplitPane>
      <NotificationBar />
    </Box >
  );
};
