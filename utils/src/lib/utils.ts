export const removeProperty =
  (prop: string) =>
  ({ [prop]: _, ...rest }) =>
    rest;
export const removeID = removeProperty('id');
