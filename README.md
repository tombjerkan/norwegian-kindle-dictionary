# Fetch tokens

`npm run fetchtokens <token>...`

This will fetch the article IDs for the tokens passed as arguments and save this to `data/tokens.json`.

For example, `npm run fetchtokens han du og` will fetch the articles for "han", "du", and "og", resulting in a `tokens.json` file like:

```
[
  {
    "token": "han",
    "articleIds": [22170]
  },
  {
    "token": "du",
    "articleIds": [11072]
  },
  {
    "token": "og",
    "articleIds": [41860, 41861]
  }
]
```

To run with the example data set:  
`npm run fetchtokens $(<./example-data/tokens.txt)`

# Fetch articles

`npm run fetcharticles <article_id>...`

This will fetch the articles for the IDs passed as arguments and save a JSON file for each article to `data/articles/<article_id>.json`.

For example, `npm run fetcharticles 1001 1002 1003` will create the article definition files `data/articles/1001.json`, `data/articles/1002.json`, and `data/articles/1003.json`.

To run with the example data set:  
`npm run fetcharticles $(<./example-data/articleids.txt)`.

To run with the article IDs listed for the tokens in `data/tokens.json`:  
`npm run fetcharticles $(cat ./data/tokens.json | jq '[.[] | .articleIds] | flatten | .[]')`
