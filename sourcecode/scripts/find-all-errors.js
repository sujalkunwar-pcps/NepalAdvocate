const ts = require('typescript');
const glob = require('fs').readdirSync;
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = require('fs').readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== 'dist' && file.name !== 'dist-ios') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const srcFiles = getFiles('./src');
srcFiles.push('App.tsx');
srcFiles.push('index.ts');

const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

const program = ts.createProgram(srcFiles, compilerOptions.options);
const diagnostics = ts.getPreEmitDiagnostics(program);

console.log(`Total Diagnostics Found: ${diagnostics.length}\n`);

const byFile = {};
diagnostics.forEach(d => {
  if (d.file) {
    const fileName = path.relative('.', d.file.fileName);
    if (!byFile[fileName]) byFile[fileName] = [];
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    byFile[fileName].push({ line: line + 1, character: character + 1, message: msg });
  }
});

Object.keys(byFile).forEach(f => {
  console.log(`\n❌ [${f}] (${byFile[f].length} errors):`);
  byFile[f].forEach(e => {
    console.log(`   Line ${e.line}:${e.character} - ${e.message}`);
  });
});

if (Object.keys(byFile).length === 0) {
  console.log('🎉 No errors found across src files!');
}
