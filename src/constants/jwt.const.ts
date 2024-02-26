import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

const secureFolderName = 'secure';

function checkExistFolder(name: string): void {
  const check_path = path.join(__dirname, `../../${name}`);
  !fs.existsSync(check_path) && fs.mkdir(check_path, (err) => err);
}

function getTokenKeyPair(name: string): [string, string] {
  checkExistFolder(secureFolderName);

  const private_key_path = path.join(
    __dirname,
    `../../${secureFolderName}/${name}_private.key`,
  );
  const public_key_path = path.join(
    __dirname,
    `../../${secureFolderName}/${name}_public.key`,
  );

  // if key files do not exist -> gen a new pair
  if (!fs.existsSync(private_key_path) || !fs.existsSync(public_key_path)) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    // write keys to files
    fs.writeFileSync(private_key_path, privateKey);
    fs.writeFileSync(public_key_path, publicKey);
  }

  // read keys from files
  const private_key = fs.readFileSync(private_key_path, 'utf-8');
  const public_key = fs.readFileSync(public_key_path, 'utf-8');

  return [private_key, public_key];
}

export const [access_token_private_key, access_token_public_key] =
  getTokenKeyPair('access_token');

export const [refresh_token_private_key, refresh_token_public_key] =
  getTokenKeyPair('refresh_token');
