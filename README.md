# NOTE: A new and unified deobfuscator, which can work with the legacy structure, is now available. Read further for the new deobfuscator.

# PHPKoboDeobfuscator
This JS file is a helper to significantly facilitate the deobfuscation of HTML files that have been obfuscated with PHPKobo since 2025-05-01.
Note: Due to the different structure used before 2025-05-01, this deobfuscator currently does not work on this older structure.

## How exactly does this significantly facilitate the deobfuscation?
This tool is targeted at normal developers who have a hard time deobfuscating even, for example, a deeply nested self-invoking function where most decisions are driven by comparisons between base64-decoded strings and JSON-parsed fragments. It effectively allows what could take hours if not entire days to deobfuscate, to be completed within minutes, even for normal developers. Since this is meant to be a helper, instructions are printed throughout the process to ensure that even normal developers can do it.

## How is this different from https://blog.deobfuscate.io/investigating-html-obfuscator?
This deobfuscator performs the majority of the process in Node.js, an isolated environment, but defers getting the second layer to the browser on a modified version of the obfuscated HTML file that does not execute said second layer, with the debugger in place to avoid execution from elsewhere like redirects. It also removes the need for document.write entirely and allows developers to perform deobfuscation without the need to inject a document.write arrow function hook.

## Can't I just simply inject the hook from that blog post?
You could inject the hook: `;document._write = document.write;hook = (code) => console.log(code);document.write = hook;`, but then that would make the environment run entirely in the browser which can come with security risks if not handled carefully. This deobfuscator offers the convenience in Node.js without having to mock document.write or an entire browser. It is, however, a necessary alternative for the legacy structure.

## What about the CSS deobfuscator and the Elements Tab deobfuscator?
An unified deobfuscator that uses the hook method, with anti-fetch protection for safety, to deobfuscate both the HTML and CSS obfuscation by PHPKobo (they use different methods by the way) is now available.

For PHPKobo's Elements Tab Obfuscator, the obfuscation is powered entirely by a single JavaScript file, making it extremely easy to circumvent by finding and then blockiing the file in network requests; if the Elements Tab obfuscator is within an unrelated file, conditional breakpoints can be abused to skip the obfuscator logic entirely; or alternatively, download the HTML, remove the obfuscator, and then open the file, but you might still need to first deobfuscate the HTML as well if it's been obfuscated.

I have additionally reverse engineered the Elements Tab Obfuscator, see https://gist.github.com/UnbuiltAlmond8/bd5642276b702bf02999a62a4de2f0e7 for a script with readable variable names, the free trial check, and more.

## Give me the unified deobfuscator!
Okay fine, here it is:
```javascript
(function (code, allowFetch = false) {
  hook = `hook1 = (code) => console.log(code);document.write = hook;hook2 = (code) => console.log(code);CSSStyleSheet.prototype.insertRule = hook2;`
  if (!allowFetch) {
    hook = hook + 'fetch=()=>{};XMLHttpRequest=()=>{};'
  };
  eval(hook + code)
})(`PHPKobo code goes here`)
```
Note that it does not use JSDOM, but you can pair this with JSDOM to generate necessary context directly in Node.js. This unified deobfuscator works even for files created before 2025-01-01. To use it, you simply look for the large obfuscated portion `Function('...')()` within the target file, put it in place of `PHPKobo code goes here`, and go. After running, check the console to get the raw HTML and CSS. Remember to also discover all assets and block the Elements Tab Obfuscator!
