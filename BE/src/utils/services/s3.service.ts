import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { omit } from 'lodash';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private signedUrlExpiry: number;
  private tmpFolder: string;
  private uploadFolder: string;

  constructor(private readonly config: ConfigService) {
    const { s3, credentials } = this.config.get('aws');

    this.bucket = s3.bucket;
    this.signedUrlExpiry = s3.signedUrlExpiry;
    this.tmpFolder = s3.tmpFolder;
    this.uploadFolder = s3.uploadFolder;

    this.s3 = new S3Client({
      region: s3.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    });
  }

  private getUploadParams(file: Express.Multer.File, folder?: string): PutObjectCommandInput {
    const { originalname, mimetype, buffer } = file;
    const key = `${randomUUID()}_${originalname}`;
    file.filename = key;

    // Convert the expiration time (number) to a Date
    const expiresAt = new Date(Date.now() + this.signedUrlExpiry * 1000);

    return {
      Bucket: folder ? `${this.bucket}/${folder}` : this.bucket,
      Key: key,
      Expires: expiresAt, // Use Date object for Expires
      ContentType: mimetype,
      Body: buffer,
    };
  }

  public async uploadOne(file: Express.Multer.File, folder?: string): Promise<Record<string, unknown>> {
    const params = this.getUploadParams(file, folder);
    const command = new PutObjectCommand(params);
    try {
      const data = await this.s3.send(command);
      return { ...data, file: omit(file, ['buffer']) };
    } catch (err) {
      throw err;
    }
  }

  public async uploadMany(files: any[], folder?: string): Promise<any> {
    const promises: Promise<unknown>[] = [];
    const upload = async (file: Express.Multer.File) => {
      const params = this.getUploadParams(file, folder);
      const command = new PutObjectCommand(params);
      try {
        const data = await this.s3.send(command);
        return { ...data, file: omit(file, ['buffer']) };
      } catch (err) {
        throw err;
      }
    };

    for (const file of files) {
      promises.push(upload(file));
    }
    return await Promise.all(promises);
  }

  public async deleteFolder(folder: string): Promise<any> {
    const params = {
      Bucket: this.bucket,
      Prefix: folder,
    };

    const command = new ListObjectsCommand(params);
    try {
      const data = await this.s3.send(command);
      const objects = data.Contents.map((object) => ({ Key: object.Key }));
      const deleteParams = {
        Bucket: this.bucket,
        Delete: { Objects: objects, Quiet: true },
      };
      const deleteCommand = new DeleteObjectsCommand(deleteParams);
      return await this.s3.send(deleteCommand);
    } catch (err) {
      throw err;
    }
  }

  public async deleteFile(fileName: string, folder: string): Promise<any> {
    const params = {
      Bucket: this.bucket,
      Key: `${folder}/${fileName}`,
    };

    const command = new DeleteObjectCommand(params);
    try {
      return await this.s3.send(command);
    } catch (err) {
      throw err;
    }
  }

  public async moveFile(
    filePath: string,
    folderCurrent?: string,
    folderMove?: string,
  ): Promise<any> {
    const fileName = filePath.split('/').slice(-1)[0];
    if (!folderCurrent) folderCurrent = this.tmpFolder;
    if (!folderMove) folderMove = this.uploadFolder;

    const copyParams = {
      Bucket: this.bucket,
      Key: `${folderMove}/${fileName}`,
      CopySource: `${this.bucket}/${folderCurrent}/${fileName}`,
    };

    const copyCommand = new CopyObjectCommand(copyParams);
    try {
      await this.s3.send(copyCommand);
      const deleteParams = {
        Bucket: this.bucket,
        Key: `${folderCurrent}/${fileName}`,
      };
      const deleteCommand = new DeleteObjectCommand(deleteParams);
      await this.s3.send(deleteCommand);
      return filePath.replace(folderCurrent, folderMove);
    } catch (err) {
      throw err;
    }
  }

  public async getFolder(folder: string, delimiter?: string): Promise<any> {
    const params = {
      Bucket: this.bucket,
      Prefix: folder,
      Delimiter: delimiter || '/',
    };

    const command = new ListObjectsCommand(params);
    try {
      const data = await this.s3.send(command);
      return data;
    } catch (err) {
      throw err;
    }
  }

  public async createFolder(folderName: string): Promise<any> {
    const params = {
      Bucket: this.bucket,
      Key: `${folderName}/`,
    };

    const command = new PutObjectCommand(params);
    try {
      return await this.s3.send(command);
    } catch (err) {
      throw err;
    }
  }

  public async listBucker(limit?: number, folderName?: string): Promise<any> {
    const params = {
      Bucket: this.bucket,
      MaxKeys: limit || 0,
      Delimiter: '/',
      Prefix: folderName || '',
    };

    const command = new ListObjectsCommand(params);
    try {
      const data = await this.s3.send(command);
      return data;
    } catch (err) {
      throw err;
    }
  }
}
