import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationService } from './evaluation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

const mockEvaluationRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const mockConfigService = {
  get: jest.fn(() => 'mock_api_key'),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<any>, jest.Mock>>;

describe('EvaluationService', () => {
  let service: EvaluationService;
  let repository: MockRepository<Evaluation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        { provide: getRepositoryToken(Evaluation), useFactory: mockEvaluationRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
    repository = module.get(getRepositoryToken(Evaluation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistory', () => {
    it('should return a list of evaluations for a user', async () => {
      const mockResult = [{ id: 1, score: 90 }] as Evaluation[];
      repository.find?.mockResolvedValue(mockResult);

      const result = await service.getHistory(1);

      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        order: { created_at: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getHistoryDetail', () => {
    it('should return a specific evaluation if found and authorized', async () => {
      const mockEvaluation = { id: 1, score: 90, user: { id: 1 } } as Evaluation;
      repository.findOne?.mockResolvedValue(mockEvaluation);

      const result = await service.getHistoryDetail(1, 1);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1, user: { id: 1 } },
      });
      expect(result).toEqual(mockEvaluation);
    });

    it('should throw NotFoundException if evaluation is not found', async () => {
      repository.findOne?.mockResolvedValue(null);

      await expect(service.getHistoryDetail(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an evaluation by calling AI and saving to DB', async () => {
      // Mock Data
      const createEvaluationDto = {
        answer: 'My German Text',
        level: 'A2',
        part: 1,
        module: 'writing',
        task: { title: 'Task Title', scenario: 'Scenario', points: ['Test point'] },
      };

      const mockAiResponse = {
        score: 85,
        feedback: {
          strengths: ['Good grammar'],
          improvements: ['Better vocab'],
          corrected: 'My corrected German Text'
        }
      };

      const mockSavedEvaluation = {
        id: 1,
        ...createEvaluationDto,
        original_text: createEvaluationDto.answer,
        score: mockAiResponse.score,
        feedback: mockAiResponse.feedback,
        created_at: new Date(),
      };

      // Mock Fetch (Global)
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: JSON.stringify(mockAiResponse) }]
              }
            }]
          }),
        })
      ) as jest.Mock;

      // Mock Repository
      repository.create?.mockReturnValue(mockSavedEvaluation);
      repository.save?.mockResolvedValue(mockSavedEvaluation);

      // Execute
      const result = await service.create(createEvaluationDto, { id: 1, language: 'en' } as any);

      // Verify
      expect(global.fetch).toHaveBeenCalled();

      expect(repository.create).toHaveBeenCalledWith({
        original_text: createEvaluationDto.answer,
        score: mockAiResponse.score,
        feedback: mockAiResponse.feedback,
        level: createEvaluationDto.level,
        part: createEvaluationDto.part,
        task: createEvaluationDto.task,
        module: createEvaluationDto.module,
        user: { id: 1, language: 'en' },
      });

      expect(repository.save).toHaveBeenCalledWith(mockSavedEvaluation);
      expect(result).toEqual(mockAiResponse);
    });
  });
});
