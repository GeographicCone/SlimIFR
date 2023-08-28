
// IfrFmt.js
// Version: 2023-08-28

// Make the output of UEFI Internal Forms Representation more concise and human-readable

// Usage: % node IfrFmt.js <InFile> <OutFile>
// Where: <InFile> - Output of: % IFRExtractor <SetupModule> verbose

// Output: <VarStoreName>:<Offset>[(Size|SizeRangeMin-SizeRangeMax)] <Form>: <Prompt> [AllowedValueList|AllowedValueScopeMin - AllowedValueScopeMax]

// Based on the work by BoringBoredom
// Source: https://github.com/BoringBoredom/UEFI-Editor/blob/master/IFR-Formatter/IFR-Formatter.js

// Maximum number of characters to pad the VarStore name and offset with
const PADDING = 32;

const f = require('fs');
const p = require('process');

// Format a hexadecimal value with the specified padding
function h(value, size = 2) {
    return '0x' + parseInt(value, 16).toString(16).toUpperCase().padStart(size, '0');
}

// Sanitize text output by trimming leading and trailing whitespace
function t(string) {
    return `${string ? string.trim() : '(Empty)' }`
}

(async function() {

    // Read and normalize input
    let i = f.readFileSync(p.argv[2], 'utf8').replaceAll(/[\r\n|\n|\r](?!0x[0-9A-F]{3})/g, '<br>');

    // Initialize variables
    let o = '';
    let activeForm = '';
    const varStores = {};

    // Iterate through the entries of the IFR dump
    for(const row of i.split('\n')) {

        // Entry is a form definition
        if(entry = row.match(
            /Form FormId: (.*), Title: "(.*)" \{ (.*) \}/))
            // Update the name of the active form
            activeForm = t(entry[2])

        // Entry is a VarStore definition
        else if(entry = row.match(
            /VarStore Guid: (.*), VarStoreId: (.*), Size: (.*), Name: "(.*)" \{/))
            // Populate the VarStore array with its name
            varStores[entry[2]] = entry[4]

        // Subsequent entries sorted by frequency of occurence: a sample IFR file analyzed
        // was 55.3% set choice, 41.2% numerical, 3% Boolean, and only 0.5% string prompts

        // Entry is one of the options for the set choice
        else if(entry = row.match(
            /OneOfOption Option: "(.*)" Value: (.*) \{/)) {
            // Append the option to the the output
            o += ` [${h(entry[2])} - ${entry[1]}]`;
        }

        // Entry is a set-choice prompt
        else if(entry = row.match(
            /OneOf Prompt: "(.*)", Help: "(.*)", QuestionFlags: (.*), QuestionId: (.*), VarStoreId: (.*), VarOffset: (.*), Flags: (.*), Size: (.*), Min: (.*), Max: (.*), Step: (.*) \{ (.*) \}/)) {
            // Append the set-choice prompt to the output
            o += '\n'
              // VarStore name and offset, padded to 2 bytes
              // Size, if not a single byte
              // All padded to PADDING characters
              + `${varStores[entry[5]]}:${h(entry[6], 4)}${entry[8] == 8 ? '' : '(' + h(entry[8] / 8) + ')'} `.padEnd(PADDING, ' ')
              // Active form and entry name
              + ` ${activeForm}: ${t(entry[1])}`;

        }

        // Entry is a numerical prompt
        else if(entry = row.match(
            /Numeric Prompt: "(.*)", Help: "(.*)", QuestionFlags: (.*), QuestionId: (.*), VarStoreId: (.*), VarOffset: (.*), Flags: (.*), Size: (.*), Min: (.*), Max: (.*), Step: (.*) \{ (.*) \}/)) {
            // Append the numerical prompt to the output
            o += '\n'
              // VarStore name and offset, padded to 2 bytes
              // Size, if not a single byte
              // All padded to PADDING characters
              + `${varStores[entry[5]]}:${h(entry[6], 4)}${entry[8] == 8 ? '' : '(' + h(entry[8] / 8) + ')'} `.padEnd(PADDING, ' ')
              // Active form and entry name
              + ` ${activeForm}: ${t(entry[1])}`
              // Allowed value range, padded to size
              + ` [${h(entry[9], 2 * entry[8] / 8)} - ${h(entry[10], 2 * entry[8] / 8)}]`;
        }

        // Entry is a Boolean prompt
        else if(entry = row.match(
            /CheckBox Prompt: "(.*)", Help: "(.*)", QuestionFlags: (.*), QuestionId: (.*), VarStoreId: (.*), VarOffset: (.*), Flags: (.*) \{ (.*) \}/)) {
            // Append the Boolean prompt to the output
            o += '\n'
              // VarStore name and offset, padded to 2 bytes
              // All padded to PADDING characters
              + `${varStores[entry[5]]}:${h(entry[6], 4)} `.padEnd(PADDING, ' ')
              // Active form and entry name
              + ` ${activeForm}: ${t(entry[1])}`
              // Allowed value range
              + ` [0x00 / 0x01]`;
        }

        // Entry is a text string prompt
        else if(entry = row.match(
            /String Prompt: "(.*)", Help: "(.*)", QuestionFlags: (.*), QuestionId: (.*), VarStoreId: (.*), VarStoreInfo: (.*), MinSize: (.*), MaxSize: (.*), Flags: (.*) \{ (.*) \}/)) {
            // Append the text string prompt to the output
            o += '\n'
              // VarStore name and offset, padded to 2 bytes
              // Size, or size range, if applicable
              // All padded to PADDING characters
              + `${varStores[entry[5]]}:${h(entry[6], 4)}(${h(entry[7])}${entry[7] == entry[8] ? '' : '-' + h(entry[8])}) `.padEnd(PADDING, ' ')
              // Active form and entry name
              + ` ${activeForm}: ${t(entry[1])}`;
        }

    }

    // Save the output to a file with a couple of finishing touches
    f.writeFileSync(
        p.argv[3],
        o
            .slice(1)                      // Remove the line break the output started with
            .replaceAll(/\] \[/g, ', ')    // Fix formatting for multiple consecutive option choices
            .split('\n').sort().join('\n') // Sort the output in alphabetical order
            + '\n');                       // End the file with a line break

})();
