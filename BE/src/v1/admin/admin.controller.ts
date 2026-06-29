import { Controller } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller()
export class AdminController {
  constructor(private readonly userService: UserService) {}
}
