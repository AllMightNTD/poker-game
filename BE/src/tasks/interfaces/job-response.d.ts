export interface IJobResponse {
  name: string;
  running: boolean;
  nextDate: string;
  lastDate: Date | string | null;
}
