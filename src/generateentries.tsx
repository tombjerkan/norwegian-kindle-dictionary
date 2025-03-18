import fs from "fs/promises";
import path from "path";
import prettier from "prettier";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleView } from "./render";
import { articleSchema } from "./articleschema";
import { ensureDirectoriesExist } from "./utils";

// TODO: move to a configuration file
const ARTICLES_DIRECTORY = path.join(".", "data", "articles");
const ENTRIES_DIRECTORY = path.join(".", "data", "entries");

await ensureDirectoriesExist(ENTRIES_DIRECTORY);

const allArticleIds = process.argv.slice(2);

for (const articleId of allArticleIds) {
  const articleFile = path.join(ARTICLES_DIRECTORY, `${articleId}.json`);
  const articleJson = await fs.readFile(articleFile, { encoding: "utf-8" });
  const unsafeArticle = JSON.parse(articleJson);
  const article = articleSchema.parse(unsafeArticle);

  const html = renderToStaticMarkup(<ArticleView article={article} />);

  const entryFile = path.join(ENTRIES_DIRECTORY, `${articleId}.html`);

  await fs.writeFile(entryFile, await prettier.format(html, { parser: "html" }));
}
