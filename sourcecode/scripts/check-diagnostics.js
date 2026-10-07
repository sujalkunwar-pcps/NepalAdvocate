const ts = require('typescript');

const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

for (const fileName of compilerOptions.fileNames) {
  try {
    const program = ts.createProgram([fileName], compilerOptions.options);
    const sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) continue;
    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
    if (diagnostics.length > 0) {
      console.log(`\n❌ File has ${diagnostics.length} errors: ${fileName}`);
      diagnostics.slice(0, 5).forEach(d => {
        const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
        const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
        console.log(`   Line ${line + 1}:${character + 1} - ${msg}`);
      });
    } else {
      console.log(`✅ OK: ${fileName}`);
    }
  } catch (err) {
    console.error(`💥 CRASHED ON FILE: ${fileName}`, err.message);
  }
}
