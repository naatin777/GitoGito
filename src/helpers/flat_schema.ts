import z from "zod";

export interface FlatSchemaItem {
  key: string;
  parents: string[];
  description: string | undefined;
  isLeaf: boolean;
}

export function fullPath(item: FlatSchemaItem): string {
  return [...item.parents, item.key].join(".");
}

export function urlPath(item: FlatSchemaItem): string {
  return [...item.parents, item.key].join("/");
}

export function flatSchema(schema: z.ZodDefault<z.ZodObject> | z.ZodObject, parents: string[] = []): FlatSchemaItem[] {
  const shape = schema instanceof z.ZodDefault ? schema.unwrap().shape : schema.shape;

  return Object.entries(shape).flatMap(([key, field]) => {
    const objectField = extractObjectSchema(field);

    const item: FlatSchemaItem = {
      key,
      parents,
      description: field.description,
      isLeaf: objectField === null,
    };

    if (objectField) {
      return [item, ...flatSchema(objectField, [...parents, key])];
    }
    return [item];
  });
}

function extractObjectSchema(field: unknown): z.ZodObject | null {
  let current: unknown = field;

  for (let i = 0; i < 8; i++) {
    if (current instanceof z.ZodObject) {
      return current;
    }

    if (
      current instanceof z.ZodDefault ||
      current instanceof z.ZodOptional ||
      current instanceof z.ZodNullable ||
      current instanceof z.ZodCatch
    ) {
      current = current.unwrap();
      continue;
    }

    return null;
  }

  return null;
}
