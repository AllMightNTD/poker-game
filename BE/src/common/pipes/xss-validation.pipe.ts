import { PipeTransform, Injectable } from '@nestjs/common';
import * as xss from 'xss';

@Injectable()
export class XssValidationPipe implements PipeTransform {
  transform(value: any) {
    if (value && typeof value === 'object') {
      return this.sanitizeObject(value);
    }
    if (typeof value === 'string') {
      return xss.filterXSS(value);
    }
    return value;
  }

  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitizedObj = {};
      for (const [key, val] of Object.entries(obj)) {
        if (typeof val === 'string') {
          sanitizedObj[key] = xss.filterXSS(val);
        } else if (typeof val === 'object') {
          sanitizedObj[key] = this.sanitizeObject(val);
        } else {
          sanitizedObj[key] = val;
        }
      }
      return sanitizedObj;
    }
    return obj;
  }
}
