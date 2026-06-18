import { registerPlugin } from '@capacitor/core';

const SSH = registerPlugin('SSH');

export async function runSSHCommand(command) {
  try {
    const result = await SSH.execute({
      host: '10.0.0.16',
      user: 'yehuda',
      password: 'javajew798',
      command: command,
      port: 22
    });
    return result.output;
  } catch (error) {
    return "Error: " + error.message;
  }
}

