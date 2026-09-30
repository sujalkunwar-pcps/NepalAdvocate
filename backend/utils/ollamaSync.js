const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Synchronizes the local Ollama model with the fine-tuned model config/weights
 * from the configured SujalAI directory.
 */
function syncOllamaModel() {
  const sujalAiPath = process.env.SUJAL_AI_PATH;
  const modelName = process.env.OLLAMA_MODEL_NAME || 'sujal';

  if (!sujalAiPath) {
    console.log('[Ollama Sync] SUJAL_AI_PATH is not set in environment variables. Skipping automatic model synchronization.');
    return;
  }

  // Normalize path and resolve Modelfile location
  const modelfilePath = path.join(sujalAiPath, 'models', 'Modelfile');

  console.log(`[Ollama Sync] Checking SujalAI path: ${sujalAiPath}`);

  // Check if SujalAI folder exists
  if (!fs.existsSync(sujalAiPath)) {
    console.warn(`[Ollama Sync] Warning: SujalAI directory not found at "${sujalAiPath}". Skipping sync.`);
    return;
  }

  // Check if Modelfile exists in SujalAI/models
  if (!fs.existsSync(modelfilePath)) {
    console.warn(`[Ollama Sync] Warning: Modelfile not found at "${modelfilePath}". Skipping sync.`);
    return;
  }

  console.log(`[Ollama Sync] Found Modelfile at: ${modelfilePath}`);
  console.log(`[Ollama Sync] Executing: ollama create ${modelName} -f "${modelfilePath}"`);

  // Run Ollama create command in the background
  exec(`ollama create ${modelName} -f "${modelfilePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Ollama Sync] Error registering/syncing model "${modelName}":`, error.message);
      console.error(`[Ollama Sync] Exec output:`, stderr || stdout);
      return;
    }
    console.log(`[Ollama Sync] Successfully synchronized/updated Ollama model "${modelName}" from SujalAI!`);
    if (stdout && stdout.trim()) {
      console.log(`[Ollama Sync] Output: ${stdout.trim()}`);
    }
  });
}

module.exports = {
  syncOllamaModel
};
