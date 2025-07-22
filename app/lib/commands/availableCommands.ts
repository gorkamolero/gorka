export const SLASH_COMMANDS = [
  '/help',
  '/about', 
  '/work',
  '/music',
  '/contact',
  '/skills',
  '/resume'
] as const;

export const TERMINAL_COMMANDS = [
  'clear',
  'cls',
  'ls',
  'pwd',
  'whoami',
  'echo',
  'date',
  'uname',
  'uptime',
  'history',
  'hostname',
  'which'
] as const;

export const ALL_COMMANDS = [...SLASH_COMMANDS, ...TERMINAL_COMMANDS];

export type SlashCommand = typeof SLASH_COMMANDS[number];
export type TerminalCommand = typeof TERMINAL_COMMANDS[number];
export type Command = typeof ALL_COMMANDS[number];