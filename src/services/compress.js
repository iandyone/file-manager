import streams from 'stream/promises';
import zlib from 'zlib';
import fs from 'fs';

export class CompressService {
  async compressFile(filePath, compressedFilePath) {
    await streams.pipeline(
      fs.createReadStream(filePath),
      zlib.createGzip(),
      fs.createWriteStream(compressedFilePath)
    );
  }

  async decompressFile(filePath, compressedFilePath) {
    await streams.pipeline(
      fs.createReadStream(filePath),
      zlib.createGunzip(),
      fs.createWriteStream(compressedFilePath)
    );
  }
}
