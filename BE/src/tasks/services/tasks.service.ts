import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { FileService, S3Service } from 'src/utils/services';
import { ExceptionsResponse } from '../exceptions';
import { IJobResponse } from '../interfaces/job-response';

@Injectable()
export class TasksService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly logger = new Logger(TasksService.name),
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
    private readonly s3Service: S3Service,
  ) {}

  public findAll(): IJobResponse[] {
    // const jobs = this.schedulerRegistry.getCronJobs();
    // const data = [];

    // for (const [key, value] of jobs) {
    //   const lastDate = value.lastDate();
    //   let nextDate: string;
    //   try {
    //     const nextDateObj = value.nextDates();

    //     // Kiểm tra nếu nextDateObj là hợp lệ (không phải trong quá khứ)
    //     if (nextDateObj && nextDateObj.isAfter(new Date())) {
    //       nextDate = nextDateObj.toDate().toString(); // Lấy ngày kế tiếp hợp lệ
    //     } else {
    //       nextDate = 'error: next fire date is in the past!';
    //     }
    //   } catch (e) {
    //     nextDate = 'error: next fire date is in the past!';
    //   }

    //   data.push({ name: key, running: value.running, nextDate, lastDate });
    // }

    // return data;
    return [];
  }

  public findOneByName(name: string): IJobResponse {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      const lastDate = job.lastDate();

      let nextDate: any;
      try {
        nextDate = job.nextDates();
      } catch (e) {
        console.log(e.message);
        nextDate = 'error: next fire date is in the past!';
      }

      return { name, running: job.running, nextDate, lastDate };
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException(ExceptionsResponse.jobNotFound);
    }
  }

  public addCronJob(
    name: string,
    time: string,
    fnExecute: () => void,
  ): IJobResponse {
    const job = new CronJob(time, fnExecute);

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    return this.findOneByName(name);
  }

  public stopJob(name: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(name);

      job.stop();

      return true;
    } catch (_error) {
      console.log(_error.message);
      throw new NotFoundException(ExceptionsResponse.jobNotFound);
    }
  }

  public startJob(name: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(name);

      job.start();

      return true;
    } catch (_error) {
      console.log(_error.message);
      throw new NotFoundException(ExceptionsResponse.jobNotFound);
    }
  }

  public deleteJob(name: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(name);

      if (job) {
        console.log('vo');
        this.schedulerRegistry.deleteCronJob(name);
      }

      return true;
    } catch (_error) {
      console.log(_error.message);
      throw new NotFoundException(ExceptionsResponse.jobNotFound);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'deleteUploadTempFolder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async deleteUploadTempFolder(): Promise<void> {
    const { serverUpload } = this.configService.get('app');
    const date = moment().format('dddd, YYYY/MM/DD, HH:mm:ss A');

    let message = '';
    let folder = '';

    if (serverUpload !== 'local') {
      const { dest } = this.configService.get('file');
      folder = `${dest.root}/${dest.tmp}`;
      message = 'Job delete upload tmp folder in local server';

      await this.fileService.deleteFolder(folder);
    } else {
      folder = this.configService.get('aws.s3.tmpFolder');
      message = 'Job delete upload tmp folder in aws/s3 server';

      await this.s3Service.deleteFolder(folder);
    }

    this.logger.debug(message, `Time Complete: ${date}`);
  }
}
