import z from "zod";
import { AppColorSchema } from "./appearance/color_schema";


export const AppearanceSchema = z.object({
  useNerdFont: z.boolean().default(false),
  themeMode: z.enum(["light", "dark", "system_or_light", "system_or_dark"]).default("system_or_dark"),
  lightModeColor: AppColorSchema,
  darkModeColor: AppColorSchema,
})
