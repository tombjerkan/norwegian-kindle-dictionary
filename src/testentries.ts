import { diffLines } from "diff";
import fs from "fs/promises";
import path from "path";
import { JSDOM } from "jsdom";

const TEST_DATA_DIRECTORY = path.join(".", "test-data");
const ENTRIES_DIRECTORY = path.join(".", "data", "entries");

const articleIds = process.argv.slice(2);

for (const articleId of articleIds) {
  console.log(`Testing entry "${articleId}"`);

  const testHtmlFileName = path.join(TEST_DATA_DIRECTORY, `${articleId}.html`);
  const testHtml = await fs.readFile(testHtmlFileName, { encoding: "utf-8" });
  const testDocument = new JSDOM(testHtml).window.document;

  removeVisBoyningButton(testDocument);
  removeKopierLenkeButton(testDocument);
  removeDelButton(testDocument);
  removeSiterButton(testDocument);
  removeArtikkelsideLink(testDocument);
  removeSrOnly(testDocument);
  removePronunciation(testDocument);
  removeHomographAndDefOrder(testDocument);

  const testTextContent = removeSemicolons(testDocument.body.textContent.replace(/\s+/g, "\n"));

  const entryHtmlFilename = path.join(ENTRIES_DIRECTORY, `${articleId}.html`);
  const entryHtml = await fs.readFile(entryHtmlFilename, { encoding: "utf-8" });
  const entryDocument = new JSDOM(entryHtml).window.document;
  const entryTextContent = entryDocument.body.textContent.replace(/\s+/g, "\n");

  const diff = diffLines(testTextContent, entryTextContent);

  const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
  const red = (text: string) => `\x1b[31m${text}\x1b[0m`;

  const colouredDiffText = diff
    .map(({ value, added, removed }) => (added ? green(value) : removed ? red(value) : value))
    .join("");

  console.log(colouredDiffText);
}

function removeButtonByText(document: Document, text: string) {
  for (const button of document.querySelectorAll("button")) {
    if (button.textContent?.trim() === text) {
      button.remove();
    }
  }
}

function removeVisBoyningButton(document: Document) {
  removeButtonByText(document, "Vis bøyning");
}

function removeKopierLenkeButton(document: Document) {
  removeButtonByText(document, "Kopier lenke");
}

function removeDelButton(document: Document) {
  removeButtonByText(document, "Del");
}

function removeSiterButton(document: Document) {
  removeButtonByText(document, "Siter");
}

function removeArtikkelsideLink(document: Document) {
  for (const link of document.querySelectorAll("a")) {
    if (link.textContent?.trim() === "Artikkelside") {
      link.remove();
    }
  }
}

function removeSrOnly(document: Document) {
  for (const srOnly of document.querySelectorAll("[class='sr-only']")) {
    srOnly.remove();
  }
}

function removePronunciation(document: Document) {
  document.querySelector("section.pronunciation")?.remove();
}

function removeHomographAndDefOrder(document: Document) {
  for (const homograph of document.querySelectorAll(".article_ref > .homograph")) {
    homograph.remove();
  }

  for (const defOrder of document.querySelectorAll(".article_ref > .def_order")) {
    defOrder.remove();
  }
}

function removeSemicolons(text: string) {
  return text.replace(/;\n/g, "\n");
}
