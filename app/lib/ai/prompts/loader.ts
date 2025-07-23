import fs from 'fs';
import path from 'path';

export async function loadPrompt(promptName: string): Promise<string> {
  const promptPath = path.join(process.cwd(), 'app', 'lib', 'ai', 'prompts', `${promptName}.md`);
  const prompt = await fs.promises.readFile(promptPath, 'utf-8');
  return prompt;
}