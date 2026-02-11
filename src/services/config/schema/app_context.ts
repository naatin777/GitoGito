import { z } from "zod";
import { ConfigSchema } from "./config.ts";
import { CredentialsSchema } from "./credentials.ts";

export const AppContextSchema = z.object({
  ...ConfigSchema.shape,
  credentials: CredentialsSchema.describe("Credentials settings."),
}).describe("Application context schema including config and credentials.");

export type AppContext = z.infer<typeof AppContextSchema>;
