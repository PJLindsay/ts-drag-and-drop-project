will make this as one large file
then demonstrate how TS will allow us to restructure it cleaner

npm start

Seperate terminal: run TS compiler in watch mode

```
tsc -w
```

This is a drag & drop UI

- we start the project in one big monolithic .ts file
- then we use modules and namespaces to organize the code

two options for splitting your code:

1. namespaces and file bundling
   TS has it's own syntax feature called namespace to group related code

per-file or bundled compilation is possible
for writing the code - you can put it into multiple files
for serving the code it can be bundled into one file (bundled compilation)

2. ES Modules (the official JS way of splitting code across multiple files)
   relatively new JS feature
   bundling via build tools (ie Webpack) is still possible

we need to set tsconfig.json to make sure we bundle our interfaces into one file/place

"outFile": "./dist/bundle.js",
also have to set module to "amd"(change from commonjs)
also have to set change app.js to bundle.js (in the index.html):
```
<script src="dist/bundle.js" defer></script>
```

we also need to uncomment "moduleResolution": "node",in tsconfig
(to fix ERROR: The resource from “http://localhost:3000/dist/bundle.js” was blocked due to MIME type (“text/html”) mismatch (X-Content-Type-Options: nosniff).)
