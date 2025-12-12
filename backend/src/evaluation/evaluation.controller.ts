import { Controller, Post, Get, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { OptionalJwtAuthGuard } from '../auth/jwt-optional.guard';
import { AuthService } from '../auth/auth.service';

@Controller('evaluation')
export class EvaluationController {
  constructor(
    private readonly evaluationService: EvaluationService,
    private readonly authService: AuthService,
  ) { }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() createEvaluationDto: CreateEvaluationDto, @Req() req) {
    let user: any = undefined;
    if (req.user) {
      user = await this.authService.findUser(req.user.userId);
    }
    return this.evaluationService.create(createEvaluationDto, user || undefined);
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async getHistory(@Req() req) {
    return this.evaluationService.getHistory(req.user.userId);
  }

  @Get('history/:id')
  @UseGuards(AuthGuard('jwt'))
  async getHistoryDetail(@Param('id') id: string, @Req() req) {
    return this.evaluationService.getHistoryDetail(parseInt(id), req.user.userId);
  }

  @Get('task')
  @UseGuards(OptionalJwtAuthGuard)
  async getTask(@Query('level') level: string, @Query('part') part?: string) {
    const partNum = part ? parseInt(part, 10) : 1;
    return this.evaluationService.generateTask(level, partNum);
  }
}
