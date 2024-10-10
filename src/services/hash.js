import crypto from 'crypto';

export class HashServise {
  hash(data) {
    const hashData = crypto.createHash('sha256').update(data);
    return hashData.digest('hex');
  }
}
