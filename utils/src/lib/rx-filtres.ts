export const forMap = <K, V>(a: { id: K; name: V }): [K, V] => [a.id, a.name];
export const forMapStringNumber = (a: {
  name: string;
  id: number;
}): [string, number] => [a.name, a.id];
export const notEmptyMap = <K, V>(el: Map<K, V>) => el?.size > 0;
export const notEmptyArray = <T>(el: Array<T>) => el?.length > 0;
export const notEmptyObject = (obj: object) =>
  !!obj && Object.keys(obj).length > 0;
