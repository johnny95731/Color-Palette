/* v8 ignore start */
export const calc = (
  name: string,
  fn: Function, // eslint-disable-line
  ...args: unknown[]
) => {
  const result = fn(...args);
  console.log(`${name}: ${result}`);
};
/* v8 ignore stop */
