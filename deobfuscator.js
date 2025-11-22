async function main() {
    const fs = await import('fs');
    const readline = await import('readline');

    const { gunzip } = await import("zlib");
    const { promisify } = await import("util");

    const gunzipAsync = promisify(gunzip);

    async function decodeAndDecompress(b64) {
        // 1. Base64 decode → Buffer
        const binary = Buffer.from(b64, "base64");

        // 2. Gunzip decompress
        const decompressed = await gunzipAsync(binary);

        return decompressed.toString("utf8");
    }

    async function input(query) {
        const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
        });

        return  new Promise(resolve => rl.question(query, answer => { rl.close(); resolve(answer.trim()) }));
    }

    function buildCodeMatchingLength({ template, placeholder, targetString }) {
        // Generate a random alphanumeric string of a given length
        function randomString(len) {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let out = "";
            for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
            return out;
        }

        // Measure the length of the template when the placeholder is empty
        const baseLengthWithoutPlaceholder =
            template.replace(placeholder, "").length;

        // Compute how long the replacement must be
        const requiredPlaceholderLength =
            targetString.length - baseLengthWithoutPlaceholder;

        if (requiredPlaceholderLength < 0) {
            throw new Error("Target string is too short to match the template.");
        }

        // Create the random replacement
        const replacement = randomString(requiredPlaceholderLength);

        // Build final code
        const finalCode = template.replace(placeholder, replacement);

        return {
            finalCode,
            replacement,
            finalLength: finalCode.length,
            targetLength: targetString.length
        };
    };

    console.log("Welcome to the phpkobo html deobfuscator! This is a helper to significantly facilitate the deobfuscation of HTML files that have been obfuscated using the phpkobo html obfuscator tool. This is sadly not an immediate solution due to cases where scripts might redirect the user, because Node.js does not offer a browser-like 'window' API, and it does not work for the legacy structure that has since been replaced sometime between 2025-04-30 and 2025-05-02.");
    const dir = await input("That said, what file do you want to deobfuscate? Provide a path: ");

    console.log("Reading file...");
    const code = fs.readFileSync(dir, 'utf-8');

    const firstIndex = code.indexOf('(()=>{})');
    if (firstIndex === -1) {
        throw new Error("This obfuscated HTML code may be using the legacy structure which is incompatible with this deobfuscator as of now.")
    }
    
    const lastIndex = firstIndex + code.slice(firstIndex).indexOf(';');

    const extractedLayer = code.slice(firstIndex, lastIndex);

    const extractedVariable = extractedLayer.split(',')[1].split(')')[0]

    let base_log = `console.log(\\\\\\"$some_placeholder_string:\\\\\\");console.log(${extractedVariable})`
    base_log = buildCodeMatchingLength({
        template: base_log,
        placeholder: "$some_placeholder_string",
        targetString: extractedLayer
    }).finalCode

    const modified_function = code.replace(extractedLayer, base_log)
    const modified_script = '<!doctype html><meta charset="UTF-8"><script>;debugger; ' + modified_function.split('<script>')[1].split('</script>')[0] + '</script>'

    console.log("Modification successful. Writing to .modified.html file.")

    fs.writeFileSync(dir.replace(".html", "") + ".modified.html", modified_script)

    console.log("Wrote to .modified.html file.")
    console.log("Just before opening the modified file in your browser, open DevTools and then enter the path to the modified file in your browser in the same tab linked to the DevTools instance.")
    console.log("DevTools should automatically open, on the debugger section. Make sure to step IN UNTIL the next layer's code is printed in the console. Do NOT go any further after that.")

    console.log("Once you have the code from the console, copy it as an object (we want raw code without quotes), gzip compress it, base64 encode it if it isn't already, and send it here. DO NOT BEAUTIFY BEFOREHAND!")

    const nextcode_compressed = await input("Base64 encoded gzipped code: ")

    const nextcode = await decodeAndDecompress(nextcode_compressed);
    const necessary_context = nextcode.split(";").slice(0, nextcode.split(";").findIndex((i) => i === "})")+2).join(";").slice(nextcode.indexOf('{')+1)

    // We need to first eval once and catch the ReferenceError to get the variable that needs to defined as `this` or `window` and then try again
    try {
        eval(necessary_context)
    } catch (e) {
        if (e instanceof ReferenceError) {
            globalThis[e.message.split(" ")[0]] = globalThis;
            eval(necessary_context)
        }
    }

    console.log("Great, now we have generated the necessary context to finally decipher this obfuscated HTML! We just need the variable name, in the format of 'object.property', that's initially assigned either a long mix of largely hexadecimal and other ASCII characters or just a seemingly random sequence of ASCII characters.")
    console.log("For example: _L55c0Y._Srkpv='P;(W}+UT_}L&-N.~)?.PI_?MNPVQ{.KI+INPK)G.]MV-}VI_M{[NJ:L_!&=^{~JHG}VVKOQI ... [truncated for brevity] ... STL&][O:)&={@RW%_.=[~|;)&(-U#-Q)IH;(=J-H@#=OQ&N-{*IV-?-#!BD5258492~35373246725'")

    const obfuscated_html_name = await input("The variable name (must be in format 'object.property'): ")
    globalThis[obfuscated_html_name.split('.')[0]] = {}
    globalThis[obfuscated_html_name.split('.')[0]][obfuscated_html_name.split('.')[1]] = code.slice(code.indexOf(obfuscated_html_name + '=') + obfuscated_html_name.length + 1).split('\\\\\\\"')[1]

    console.log("Property defined. We'll now extract the deciphering function and execute it.")

    const obfuscated_html_name_idx = nextcode.indexOf(obfuscated_html_name)
    const start_of_function_index = nextcode.lastIndexOf(";", obfuscated_html_name_idx)
    const decipher_function = nextcode.slice(start_of_function_index).split("};_")[0].slice(3) + '};'

    const another_variable = necessary_context.split(";").slice(-1)[0].split('=')[0]
    globalThis[another_variable] = {
        currentScript: {
            textContent: {
                length: code.length
            }
        }
    };

    eval(decipher_function)

    console.log("Decipher function successfully extracted. Below should hopefully be the results.\n\n")
    eval(`console.log(${decipher_function.split('=')[0]}())`)
};

main()