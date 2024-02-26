import { compare } from 'bcrypt';

export async function verifyPlainContentWithHashedContent(
  plain_text: string,
  hashed_text: string,
): Promise<boolean> {
  const isMatching = await compare(plain_text, hashed_text);
  return !!isMatching;
}
