import z from "zod";

export type FlatSchemaItem = {
  key: string;
  parents: string[];
  description: string | undefined;
  isLeaf: boolean;
};

export function flatSchema(
  schema: z.ZodDefault<z.ZodObject> | z.ZodObject,
  parents: string[] = [],
): FlatSchemaItem[] {
  const shape = schema instanceof z.ZodDefault
    ? schema.unwrap().shape
    : schema.shape;

  return Object.entries(shape).flatMap(([key, field]) => {
    const f = field as z.ZodTypeAny;
    const item = {
      key: key,
      parents: parents,
      description: f.description,
      isLeaf: !(f instanceof z.ZodDefault || f instanceof z.ZodObject),
    };

    if (f instanceof z.ZodDefault || f instanceof z.ZodObject) {
      return [
        item,
        ...flatSchema(f as z.ZodDefault<z.ZodObject> | z.ZodObject, [
          ...parents,
          key,
        ]),
      ];
    }
    return [item];
  });
}
