import React from "react";
import {
  Article,
  Definition,
  Example,
  Explanation,
  isDefinition,
  isExample,
  isExplanation,
  Item,
} from "./articleschema";
import assert from "assert";
import concepts from "./concepts";

export function ArticleView(props: { article: Article }) {
  return (
    <>
      <Header article={props.article} />
      <WordType article={props.article} />
      <Etymology article={props.article} />
      <Definitions article={props.article} />
    </>
  );
}

function Header(props: { article: Article }) {
  /* I do not expect to have to romanise numbers greater than 10, so a simple solution is enough
   * instead of a more complex one that handles all numbers. */
  for (const { hgno } of props.article.lemmas) {
    assert(hgno <= 10);
  }

  const romanNumeral = [undefined, "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  return (
    <h3>
      {props.article.lemmas.map(({ lemma, hgno }) => (
        <>
          <span>{lemma}</span>
          {hgno !== 0 && <span>{romanNumeral[hgno]}</span>}
        </>
      ))}
    </h3>
  );
}

function WordType(props: { article: Article }) {
  const wordType =
    props.article.lemmas[0].inflection_class ??
    props.article.lemmas[0].paradigm_info[0].inflection_group;

  switch (wordType) {
    case "CCONJ":
      return <div>KONJUNKSJON</div>;
    case "a1":
      return <div>ADJEKTIV</div>;
    case "verb":
      return <div>VERB</div>;
    default:
      console.error("Unknown word type:", wordType);
      return <div>Unknown: {wordType}</div>;
  }
}

function Etymology(props: { article: Article }) {
  if (props.article.body.etymology === undefined) {
    return null;
  }

  return (
    <section>
      <h4>Opphav</h4>
      <span>
        {props.article.body.etymology.map(({ content, items }) => (
          <Content content={content} items={items} />
        ))}
      </span>
    </section>
  );
}

function Definitions(props: { article: Article }) {
  const rootDefinition = props.article.body.definitions[0];

  const isDefinitionList = (elements: Definition["elements"]): elements is Definition[] =>
    elements.every(isDefinition);

  return (
    <>
      <h4>Betydning og bruk</h4>

      {isDefinitionList(rootDefinition.elements) ? (
        <DefinitionList definitions={rootDefinition.elements} />
      ) : (
        <DefinitionView definition={rootDefinition} />
      )}
    </>
  );
}

function DefinitionList(props: { definitions: Definition[] }) {
  return (
    <ol>
      {props.definitions.map((definition) => (
        <li>
          <DefinitionView definition={definition} />
        </li>
      ))}
    </ol>
  );
}

function DefinitionView(props: { definition: Definition }) {
  const explanations = props.definition.elements.filter(isExplanation);
  const examples = props.definition.elements.filter(isExample);

  return (
    <>
      {explanations.map((e) => (
        <ExplanationView explanation={e} />
      ))}

      {examples.length > 0 && <h3>Examples</h3>}

      {examples.map((e) => (
        <ExampleView example={e} />
      ))}
    </>
  );
}

function ExplanationView(props: { explanation: Explanation }) {
  return (
    <div className="explanation">
      <Content {...props.explanation} />
    </div>
  );
}

function ExampleView(props: { example: Example }) {
  return (
    <div className="example">
      <blockquote>
        <Content {...props.example.quote} />
      </blockquote>
      <p>
        <Content {...props.example.explanation} />
      </p>
    </div>
  );
}

function Content(props: { content: string; items: Item[] }) {
  const splitContent = props.content.split("$");

  return (
    <>
      {splitContent[0]}

      {splitContent.slice(1).map((contentPart, index) => (
        <>
          <ItemView {...props.items[index]} />
          {contentPart}
        </>
      ))}
    </>
  );
}

function ItemView(props: Item) {
  switch (props.type_) {
    case "article_ref":
      return props.lemmas[0].lemma;
    case "usage":
      return props.text;
    case "relation":
    case "entity":
    case "grammar":
    case "rhetoric":
    case "temporal":
    case "domain":
    case "language":
      if (!(props.id in concepts.concepts)) {
        throw new Error(`Unknown item concept ID: ${props.id}`);
      }

      return concepts.concepts[props.id].expansion;
    case "superscript":
      return <sup>{props.text}</sup>;
    case "subscript":
      return <sub>{props.text}</sub>;
    case "fraction":
      return `${props.numerator}/${props.denominator}`;
    case "quote_inset":
      return <Content content={props.content} items={props.items} />;
  }
}
