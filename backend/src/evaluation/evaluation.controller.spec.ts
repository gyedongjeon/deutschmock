/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';
import { AuthService } from '../auth/auth.service';

describe('EvaluationController', () => {
  let controller: EvaluationController;
  let evaluationService: EvaluationService;

  const mockEvaluationService = {
    create: jest.fn(() => Promise.resolve({ score: 80, feedback: {} })),
    getHistory: jest.fn(() => Promise.resolve([{ id: 1, score: 90 }])),
    getHistoryDetail: jest.fn(() => Promise.resolve({ id: 1, score: 90 })),
    generateTask: jest.fn(() => Promise.resolve({ title: 'Task' })),
  };

  const mockAuthService = {
    findUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationController],
      providers: [
        {
          provide: EvaluationService,
          useValue: mockEvaluationService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<EvaluationController>(EvaluationController);
    evaluationService = module.get<EvaluationService>(EvaluationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistory', () => {
    it('should call service.getHistory with user id', async () => {
      const mockReq = { user: { userId: 123 } };
      await controller.getHistory(mockReq);
      expect(evaluationService.getHistory).toHaveBeenCalledWith(123);
    });
  });

  describe('getHistoryDetail', () => {
    it('should call service.getHistoryDetail with id and user id', async () => {
      const mockReq = { user: { userId: 123 } };
      const id = '1';
      await controller.getHistoryDetail(id, mockReq);
      expect(evaluationService.getHistoryDetail).toHaveBeenCalledWith(1, 123);
    });
  });
});
