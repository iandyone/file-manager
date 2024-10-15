import streams from 'stream/promises';
import zlib from 'zlib';
import fs from 'fs';

export class CompressService {
  async compressFile(filePath, compressedFilePath) {
    await streams.pipeline(
      fs.createReadStream(filePath),
      zlib.createBrotliCompress(),
      fs.createWriteStream(compressedFilePath)
    );
  }

  async decompressFile(filePath, compressedFilePath) {
    await streams.pipeline(
      fs.createReadStream(filePath),
      zlib.createBrotliDecompress(),
      fs.createWriteStream(compressedFilePath)
    );
  }
}
