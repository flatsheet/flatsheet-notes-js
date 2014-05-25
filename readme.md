# flatsheet-notes-js
> a sample microblogging client for flatsheet

## Required columns

Your sheet at flatsheet.io must have title, content, and slug fields.

The slug field needs to contain strings that are a version of the title all in lowercase and separated by dashes.

## config.json

Edit the config.json file to add the app name (lowercase with dashes), the baseurl of your app, and the sheet slug from flatsheet.io

```
{
  "name": "flatsheet-notes",
  "baseurl": "http://flatsheet.io/flatsheet-notes-js/",
  "sheet": "8-p2tdw53rwzx9nvr2g5oq'"
}
```

## License
MIT