# Stasis Generator 
[![CircleCI](https://circleci.com/gh/Gioni06/stasis-generator/tree/master.svg?style=svg)](https://circleci.com/gh/Gioni06/stasis-generator/tree/master)

**A minimal static site generator.**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Gioni06/stasis-basic-example)

## Project Status

This project is currently in alpha status. It's not recommended to use it in production since the API is likely to change in the future. If you want to contribute and help to release 1.0.0, please look at the issues and roadmap.

## About

Stasis is a simple and easy to use static site generator. It aims to provide production ready tools to create static website projects.

Stasis uses *Handlebars* templates to compile your Markdown source files into static HTML webpages. Scripts and styles are compiled using the powerful Parcel Bundler. It can handle `sass`, `scss`, `ts` and many more asset types and compiles them into pure javascript and CSS. You can read more about supported asset types at Parcel's documentation. 

## Getting started

To create a static site project you can clone or download the [example project ](https://github.com/Gioni06/stasis-basic-example) on Github.

### Folder structure

```
/project-root
    src/
        assets/
            main.js
            style.css
        helpers/
            json.js
        layouts/
            base.hbs
        partials/
            my-partial.hbs
        pages/
            simple-markdown-file.md
        static/
        assets/
    stasis.config.json
    package.json
``` 
#### Folders

- **src** Main source folder for your project. Provide this folder as \<path\> argument to the *build*, and *serve* CLI argument.
- **layouts** Handlebars template layouts for your pages.
- **partials** Handlebars partials that you can use in your layout files
- **helpers** A folder with your custom handlebars helpers. The file name is the name of your helper that  Stasis registers.
- **pages** Your website content. Stasis respects the folder structure and automatically generate pretty URLs for each `.md` file.
- **static** Place your static assets like images and fonts here.
- **assets** Place all your scripts and stylesheets here. Those files are bundled using Parcel.
- **stasis.config.json**  A simple configuration file for your project. Provide this file as `-c` argument to the *build*, and *serve* CLI argument.

## stasis.config.json

```
{
    "sourcePath": "src",
    "publicPath": "dist",
    "assetsPath": "assets",
    "staticPath": "static",
    "entryAssets": [
        "**/*"
    ]
}
```

#### Options

-  **sourcePath** Custom source path
-  **publicPath** The output directory of the compiled site
-  **assetsPath** Folder that holds your assets
-  **staticPath** Your static folder for fonts and images
-  **entryAssets** Patter to look for entry assets. Use `**/*` to compile everything inside the `assets` folder or provide a list of files.

## CLI

You can choose to install Stasis globally with `npm i -g stasis-generator`.

Run the CLI with `stasis-cli -h` to see all available options.

Its recommended that you install Stasis locally in your project and use it via **npm scripts**.

`npm i --save-dev stasis-generator`

*Basic usage example:*
```
"build": "stasis-cli build -s stasis.config.json src",
"serve": "stasis-cli serve -s stasis.config.json src",
```

## Advanced Usage

*Work in progress*


