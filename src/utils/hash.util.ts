import * as bcryptjs from 'bcryptjs';

export async function hash(plain_text: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(plain_text, salt);
  return hashed;
}

export async function comparePlainValueWithHashedValue(
  plain_value: string,
  hashed_value: string,
): Promise<boolean> {
  const isMatching = await bcryptjs.compare(plain_value, hashed_value);
  return !!isMatching;
}
