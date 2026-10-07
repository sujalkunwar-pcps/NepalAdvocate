const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve('src/context/AuthContext.tsx'),
  path.resolve('src/screens/LoginScreen.tsx'),
  path.resolve('src/screens/AiChatScreen.tsx'),
  path.resolve('src/screens/ClientManagementScreen.tsx'),
  path.resolve('src/components/LawyerDashboardView.tsx'),
  path.resolve('src/components/ClientCommunicationModal.tsx')
];

const configFileName = ts.findConfigFile('./', ts.sys.fileExists, 'tsconfig.json');
const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
const compilerOptions = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

// Add LanguageService
const servicesHost = {
  getScriptFileNames: () => compilerOptions.fileNames.filter(f => !f.includes('dist') && !f.includes('node_modules')),
  getScriptVersion: fileName => '1',
  getScriptSnapshot: fileName => {
    if (!fs.existsSync(fileName)) return undefined;
    return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName, 'utf8'));
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => compilerOptions.options,
  getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};

const service = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

targetFiles.forEach(file => {
  console.log(`\n========================================`);
  console.log(`Checking: ${path.relative('.', file)}`);
  console.log(`========================================`);

  const syntactic = service.getSyntacticDiagnostics(file);
  const semantic = service.getSemanticDiagnostics(file);
  const suggestion = service.getSuggestionDiagnostics(file);

  console.log(`Syntactic Diagnostics: ${syntactic.length}`);
  syntactic.forEach(d => {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
    console.log(`  [Syntactic] Line ${line + 1}:${character + 1} - ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  });

  console.log(`Semantic Diagnostics: ${semantic.length}`);
  semantic.forEach(d => {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
    console.log(`  [Semantic] Line ${line + 1}:${character + 1} - ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  });

  console.log(`Suggestion Diagnostics: ${suggestion.length}`);
  suggestion.slice(0, 10).forEach(d => {
    const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
    console.log(`  [Suggestion] Line ${line + 1}:${character + 1} - ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
  });
});
