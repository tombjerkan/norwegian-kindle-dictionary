import { z } from "zod";

const baseItemSchema = z.union([
  z.object({
    type_: z.literal("article_ref"),
    lemmas: z
      .array(
        z.object({
          lemma: z.string(),
        }),
      )
      .nonempty(),
  }),
  z.object({
    type_: z.literal("usage"),
    text: z.string(),
  }),
  z.object({
    type_: z.literal("relation"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("entity"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("grammar"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("rhetoric"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("temporal"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("domain"),
    id: z.string(),
  }),
  z.object({
    type_: z.literal("superscript"),
    text: z.string(),
  }),
  z.object({
    type_: z.literal("subscript"),
    text: z.string(),
  }),
  z.object({
    type_: z.literal("fraction"),
    numerator: z.coerce.number(),
    denominator: z.coerce.number(),
  }),
  z.object({
    type_: z.literal("language"),
    id: z.string(),
  }),
]);

const itemSchema: z.ZodType<Item> = z.union([
  baseItemSchema,
  z.object({
    type_: z.literal("quote_inset"),
    content: z.string(),
    items: z.lazy(() => z.array(itemSchema)),
  }),
]);

const explanationSchema = z.object({
  type_: z.literal("explanation"),
  content: z.string(),
  items: z.array(itemSchema),
});

const exampleSchema = z.object({
  type_: z.literal("example"),
  quote: z.object({
    content: z.string(),
    items: z.array(itemSchema),
  }),
  explanation: z.object({
    content: z.string(),
    items: z.array(itemSchema),
  }),
});

const compoundListSchema = z.object({
  type_: z.literal("compound_list"),
  elements: z
    .array(
      z.object({
        type_: z.literal("article_ref"),
        lemmas: z
          .array(
            z.object({
              lemma: z.string(),
            }),
          )
          .nonempty(),
      }),
    )
    .nonempty(),
  intro: z.object({
    content: z.string(),
    items: z.array(itemSchema),
  }),
});

// TODO: define the full schema for sub-articles when they are supported in in the rendering
const subArticleSchema = z.object({
  type_: z.literal("sub_article"),
});

const baseDefinitionSchema = z.object({
  type_: z.literal("definition"),
  sub_definition: z.boolean().optional(),
});

const definitionSchema: z.ZodType<Definition> = baseDefinitionSchema.extend({
  elements: z.lazy(() =>
    z.array(
      z.union([
        definitionSchema,
        explanationSchema,
        exampleSchema,
        compoundListSchema,
        subArticleSchema,
      ]),
    ),
  ),
});

export const articleSchema = z.object({
  article_id: z.number(),
  lemmas: z
    .array(
      z.object({
        hgno: z.number(),
        inflection_class: z.string().optional(),
        paradigm_info: z.array(
          z.object({
            inflection_group: z.string(),
          }),
        ),
        lemma: z.string(),
      }),
    )
    .nonempty(),
  body: z.object({
    etymology: z
      .array(
        z.object({
          type_: z
            .literal("etymology_language")
            .or(z.literal("etymology_reference"))
            .or(z.literal("etymology_litt")),
          content: z.string(),
          items: z.array(itemSchema),
        }),
      )
      .optional(),
    definitions: z.array(definitionSchema).length(1),
  }),
});

export type Article = z.infer<typeof articleSchema>;

export type Explanation = z.infer<typeof explanationSchema>;

export type Example = z.infer<typeof exampleSchema>;

export type CompoundList = z.infer<typeof compoundListSchema>;

export type SubArticle = z.infer<typeof subArticleSchema>;

export type Definition = z.infer<typeof baseDefinitionSchema> & {
  elements: DefinitionElement[];
};

export type Item =
  | z.infer<typeof baseItemSchema>
  | {
      type_: "quote_inset";
      content: string;
      items: Item[];
    };

export type DefinitionElement = Definition | Explanation | Example | CompoundList | SubArticle;

export function isDefinition(element: DefinitionElement): element is Definition {
  return element.type_ === "definition";
}
export function isExplanation(element: DefinitionElement): element is Explanation {
  return element.type_ === "explanation";
}

export function isExample(element: DefinitionElement): element is Example {
  return element.type_ === "example";
}
