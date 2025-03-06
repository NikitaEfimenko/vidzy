import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint') ?? "",
      port: this.configService.get<number>('minio.port'),
      useSSL: true,
      accessKey: this.configService.get<string>('minio.accessKey'),
      secretKey: this.configService.get<string>('minio.secretKey'),
      region: 'us-east-1', // Или другой, если MinIO настроен иначе
    });

    this.bucketName = this.configService.get<string>('minio.bucketName') ?? "";
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      console.log(exists, "exist??")
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
      }
    } catch (e) {
      console.log(e)
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileStream = Readable.from(file.buffer);

    await this.minioClient.putObject(this.bucketName, fileName, fileStream, undefined, {
      'Content-Type': file.mimetype,
    });

    return fileName;
  }

  async getFileUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedUrl('GET', this.bucketName, fileName);
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
