import * as bcryptjs from 'bcryptjs';

export async function hash(plain_text: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  const hashed = await bcryptjs.hash(plain_text, salt);
  return hashed;
}

export async function compare(
  plain_text: string,
  hashed_text: string,
): Promise<boolean> {
  const isMatching = await bcryptjs.compare(plain_text, hashed_text);
  return !!isMatching;
}
