const arity = { M: 2, L: 2, C: 6, Z: 0 };
export function validatePath(commands) {
  if (!Array.isArray(commands) || !commands.length) throw new Error('invalidPathCommand');
  for (const command of commands) {
    if (!Array.isArray(command)) throw new Error('invalidPathCommand');
    const [operation, ...values] = command;
    if (!Object.hasOwn(arity, operation)) throw new Error('unsupportedPathCommand');
    if (values.length !== arity[operation] || !values.every(Number.isFinite)) throw new Error('invalidPathCommand');
  }
  return commands;
}
