/**
 * Remove excess spaces
 */
export function standardizeString(s: string) {
  return (
    s
      // remove spaces in two head
      .trim()
      // remove multiple spaces
      .replace(/ +(?= )/g, '')
  );
}
