import type { BoxProps, ScrollBoxProps, TextProps } from "@opentui/react"
import { useThemeColors } from "../features/config/use_theme_colors"

export const Box = (props: BoxProps) => {
  const theme = useThemeColors()
  return <box backgroundColor={theme.backgroundColor} borderColor={theme.border} border={false} {...props} />
}

export const Text = ({ color = "text", ...props }: TextProps & { color?: "text" | "primary" }) => {
  const theme = useThemeColors()
  return <text fg={theme[color]} {...props} />
}

export const ScrollBox = (props: ScrollBoxProps) => {
  return <scrollbox {...props} />
}
