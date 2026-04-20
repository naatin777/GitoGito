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

export function flatSchema(
  schema: z.ZodDefault<z.ZodObject> | z.ZodObject,
  parents: string[] = [],
): FlatSchemaItem[] {
  const shape = schema instanceof z.ZodDefault
    ? schema.unwrap().shape
    : schema.shape;

  return Object.entries(shape).flatMap(([key, field]) => {
    const item: FlatSchemaItem = {
      key,
      parents,
      description: field.description,
      isLeaf: !(field instanceof z.ZodDefault || field instanceof z.ZodObject),
    };

    if (field instanceof z.ZodDefault || field instanceof z.ZodObject) {
      return [
        item,
        ...flatSchema(field as z.ZodDefault<z.ZodObject> | z.ZodObject, [
          ...parents,
          key,
        ]),
      ];
    }
    return [item];
  });
}
