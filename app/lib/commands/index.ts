import { slashCommands } from './slashCommands';
import { fileSystemCommands } from './fileSystemCommands';
import { systemCommands } from './systemCommands';

export function handleCommand(input: string): string {
  const trimmedInput = input.trim();
  const [command, ...args] = trimmedInput.split(' ');
  
  // Handle terminal commands (no slash)
  if (command === 'clear' || command === 'cls') {
    return 'CLEAR_TERMINAL';
  }
  
  // Check file system commands
  const fsResult = fileSystemCommands(command, args);
  if (fsResult) return fsResult;
  
  // Check system commands
  const sysResult = systemCommands(command, args);
  if (sysResult) return sysResult;
  
  // Handle slash commands
  if (command.startsWith('/')) {
    return slashCommands(command, args);
  }
  
  // If not a command, prepare for AI chat (to be implemented)
  if (trimmedInput.startsWith('/')) {
    return `Command not found: ${command}\nType /help for available commands.`;
  }
  
  return `AI chat coming soon. For now, try /help to see available commands.`;
}