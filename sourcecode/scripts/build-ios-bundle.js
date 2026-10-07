/**
 * NepalAdvocate - Expo iOS Bundle Generator Script
 * 
 * Exports the iOS bundle via Expo Metro bundler, organizes assets,
 * and creates a standardized `main.jsbundle` compatible with Xcode projects and offline deployments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'dist-ios');

console.log('🚀 [NepalAdvocate] Starting Expo iOS Bundle Export...');

try {
  // Run expo export for platform ios
  execSync('npx expo export -p ios --output-dir dist-ios', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  const iosJsDir = path.join(outputDir, '_expo', 'static', 'js', 'ios');
  if (fs.existsSync(iosJsDir)) {
    const files = fs.readdirSync(iosJsDir);
    const bundleFile = files.find(f => f.endsWith('.hbc') || f.endsWith('.js'));
    
    if (bundleFile) {
      const srcPath = path.join(iosJsDir, bundleFile);
      const destPath = path.join(outputDir, 'main.jsbundle');
      fs.copyFileSync(srcPath, destPath);
      const stats = fs.statSync(destPath);
      const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`\n======================================================`);
      console.log(`✅ Expo iOS Bundle successfully created!`);
      console.log(`📁 Output Directory: ${outputDir}`);
      console.log(`📦 Hermes Bytecode Bundle: ${path.join(iosJsDir, bundleFile)}`);
      console.log(`📦 Xcode Standard Bundle: ${destPath} (${sizeMb} MB)`);
      console.log(`🖼️  Assets: ${path.join(outputDir, 'assets')}`);
      console.log(`📄 Manifest: ${path.join(outputDir, 'metadata.json')}`);
      console.log(`======================================================\n`);
    } else {
      console.warn('⚠️ Could not find compiled bundle file in ' + iosJsDir);
    }
  } else {
    console.warn('⚠️ iOS JS output directory not found: ' + iosJsDir);
  }
} catch (error) {
  console.error('❌ Failed to export iOS bundle:', error.message);
  process.exit(1);
}
