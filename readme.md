# flatsheet-notes-js
> a sample microblogging client for flatsheet


## How to use flatsheet-notes-js

My plan is to use this for simple links + narrative sites, notebooks of important links about specific topics. It's inspired by sites like [Quartz's Glass](http://glass.qz.com/).

The approach this project uses (content loaded by browser javascript) isn't great if you require your microblog to be indexed by search engines, but for this kind of project, that may not actually be a requirement. (Also: [search engines may be getting better at rendering js-heavy sites](http://googlewebmastercentral.blogspot.de/2014/05/understanding-web-pages-better.html))

## Set up
- Fork this repository
- Clone your fork to your local computer
- Create an account and sheet at [flatsheet.io](http://app.flatsheet.io)
- Run npm install inside the project folder
- Edit config.json to change the `name`, `baseurl`, and `sheet` properties.
- Edit index.html and style.css to revise project name, css, and other project-specific details
- Commit your changes and push to your fork

## Create a sheet

You'll be using this with Flatsheet, so go to [app.flatsheet.io](http://app.flatsheet.io) to create an account and a new sheet for this project.

### Required columns

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