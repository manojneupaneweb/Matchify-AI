type Level = 'info' | 'warn' | 'error';

type Fields = Record<string, unknown>;

function write(level: Level, message: string, fields?: Fields) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info(message: string, fields?: Fields) {
    write('info', message, fields);
  },
  warn(message: string, fields?: Fields) {
    write('warn', message, fields);
  },
  error(message: string, fields?: Fields) {
    write('error', message, fields);
  },
};
