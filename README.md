# PHPKoboDeobfuscator
This JS file is a helper to significantly facilitate the deobfuscation of HTML files that have been obfuscated with PHPKobo since 2025-05-01.
Note: Due to the different structure used before 2025-05-01, this deobfuscator currently does not work on this older structure.

## How exactly does this significantly facilitate the deobfuscation?
This tool is targeted at normal developers who have a hard time deobfuscating even a deeply nested self-invoking function where most decisions are driven by comparisons between base64-decoded strings and JSON-parsed fragments. It effectively allows what could take hours if not entire days to deobfuscate, to be completed within minutes, even for normal developers. Since this is meant to be a helper, instructions are printed throughout the process to ensure that even normal developers can do it.

## How is this different from https://blog.deobfuscate.io/investigating-html-obfuscator?
This deobfuscator performs the majority of the process in Node.js, an isolated environment, but defers getting the second layer to the browser on a modified version of the obfuscated HTML file that does not execute said second layer, with the debugger in place to avoid execution from elsewhere like redirects. It also removes the need for document.write entirely and allows developers to perform deobfuscation without the need to inject a document.write arrow function hook.
