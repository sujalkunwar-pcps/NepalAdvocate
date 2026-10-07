const ts = require('typescript');

const files = [
  'src/screens/LoginScreen.tsx',
  'src/context/AuthContext.tsx',
  'src/screens/AiChatScreen.tsx',
  'src/components/GoogleAuthModal.tsx',
  'src/components/TimedDialog.tsx'
];

const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

// Force exclude dist
compilerOptions.options.exclude = ['dist', 'dist-ios', 'node_modules'];

const program = ts.createProgram(files, compilerOptions.options);

files.forEach(f => {
  const sf = program.getSourceFile(f);
  if (!sf) {
    console.log(`Could not find ${f}`);
    return;
  }
  const diags = ts.getPreEmitDiagnostics(program, sf);
  console.log(`\n=== Diagnostics for ${f} (Total: ${diags.length}) ===`);
  diags.forEach(d => {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    console.log(`Line ${line + 1}:${character + 1} - ${msg}`);
  });
});
