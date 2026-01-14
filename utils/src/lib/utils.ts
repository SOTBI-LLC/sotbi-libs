export const removeProperty =
  (prop: string) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ [prop]: _, ...rest }) =>
    rest;
export const removeID = removeProperty('id');
