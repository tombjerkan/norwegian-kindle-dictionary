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

To run with the example data set: `npm run fetchtokens $(<./example-data/tokens.txt)
