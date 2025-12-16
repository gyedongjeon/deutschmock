/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { Evaluation } from './entities/evaluation.entity';
import { User } from '../auth/entities/user.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { generateEvaluationPrompt } from './prompts/evaluation.prompt';
import { generateTaskPrompt } from './prompts/task.prompt';

// ... existing code ...

@Injectable()
export class EvaluationService {
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Evaluation)
    private evaluationRepository: Repository<Evaluation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    // ...
  }

  async create(createEvaluationDto: CreateEvaluationDto, user?: User) {
    // 1. Check Usage Limit (if user exists)
    if (user) {
      const freshUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (freshUser) {
        const today = new Date().toDateString();
        const lastDate = freshUser.last_usage_date ? freshUser.last_usage_date.toDateString() : null;

        // Reset if new day
        if (lastDate !== today) {
          freshUser.usage_count = 0;
          // We don't save immediately here to save a DB call, we trust the check below
        }

        if (freshUser.usage_count >= freshUser.usage_limit) {
          throw new ForbiddenException('Daily trial limit reached (10/10). Please upgrade or try again tomorrow.');
        }
      }
    }

    const { answer, task } = createEvaluationDto;

    // Validation: Minimum Length
    if (!answer || answer.trim().length < 20) {
      throw new ForbiddenException('Answer is too short. Please write at least 20 characters to proceed.');
    }

    // Use level/part from task or DTO if available, defaults provided
    const level = task?.level || createEvaluationDto.level || 'A2';
    const part = task?.part || createEvaluationDto.part || 1;

    // Execute AI Evaluation
    const evaluationResult = await this.evaluateWithGemini(
      answer,
      user?.language || 'en',
      task,
      level,
    );

    // 2. Increment Usage Count & Update Date (Only on successful AI call)
    if (user) {
      // We perform a safe update that handles the reset implicitly by setting the value
      const freshUser = await this.userRepository.findOne({ where: { id: user.id } });
      if (freshUser) {
        const today = new Date();
        const lastDateStr = freshUser.last_usage_date ? freshUser.last_usage_date.toDateString() : null;

        if (lastDateStr !== today.toDateString()) {
          // First use of the day
          await this.userRepository.update({ id: user.id }, { usage_count: 1, last_usage_date: today });
        } else {
          // Same day, just increment
          await this.userRepository.increment({ id: user.id }, 'usage_count', 1);
          // Ensure date is current (though distinct days are handled above, keeping it fresh is fine)
          await this.userRepository.update({ id: user.id }, { last_usage_date: today });
        }
      }
    }

    // Save to DB
    const evaluation = this.evaluationRepository.create({
      original_text: answer,
      score: evaluationResult.score,
      feedback: evaluationResult.feedback,
      level: level,
      part: part,
      task: task,
      module: createEvaluationDto.module || 'writing',
      user,
    });

    await this.evaluationRepository.save(evaluation);

    return evaluationResult;
  }

  async getHistory(userId: number) {
    return this.evaluationRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      take: 50, // Limit to last 50 entries
    });
  }

  async getHistoryDetail(id: number, userId: number) {
    const evaluation = await this.evaluationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found or unauthorized');
    }
    return evaluation;
  }

  async generateTask(level: string = 'A2', part: number = 1): Promise<any> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      return {
        title: 'Mock Task',
        scenario: 'This is a mock task because the API key is missing.',
        points: ['Point 1', 'Point 2', 'Point 3'],
        instruction: 'Write something.',
        level,
        part,
      };
    }

    const prompt = generateTaskPrompt(level, part);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'http://localhost:3000/',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const data: any = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned');
      }

      const textResponse = data.candidates[0].content.parts[0].text;

      const jsonStartIndex = textResponse.indexOf('{');
      const jsonEndIndex = textResponse.lastIndexOf('}');
      if (jsonStartIndex === -1) throw new Error('No JSON found');

      const taskData = JSON.parse(
        textResponse.substring(jsonStartIndex, jsonEndIndex + 1),
      );
      // Include level and part info in Task result
      return { ...taskData, level, part };
    } catch (error) {
      console.error('Task Generation Error:', error);
      // Fallback in case of error
      return {
        title: 'Error',
        scenario: 'Could not generate a new task. Please try again.',
        points: ['Check API Key', 'Retry'],
        instruction: 'Error mode.',
        level,
        part,
      };
    }
  }

  private async evaluateWithGemini(
    text: string,
    lang: string,

    task?: any,
    level: string = 'A2',
  ): Promise<{ score: number; feedback: any }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Using mock evaluation.');
      return {
        score: 70,
        feedback: {
          strengths: ['Mock: Good effort (API Key missing)'],
          improvements: ['Set GEMINI_API_KEY in .env'],
          corrected: text,
        },
      };
    }

    const prompt = generateEvaluationPrompt(text, lang, task, level);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      // Use fetch directly instead of SDK to control headers (Referer)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Referer: 'http://localhost:3000/', // Must match the URL registered in Google Console
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error ${response.status}: ${JSON.stringify(errorData)}`,
        );
      }

      const data: any = await response.json();

      // Response Parsing

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No candidates returned from Gemini');
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      console.log('Gemini Raw Response:', textResponse);

      const jsonStartIndex = textResponse.indexOf('{');
      const jsonEndIndex = textResponse.lastIndexOf('}');

      if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error('No JSON found in response');
      }

      const jsonString = textResponse.substring(
        jsonStartIndex,
        jsonEndIndex + 1,
      );
      return JSON.parse(jsonString);
    } catch (error: any) {
      console.error('Gemini API Error details:', error);
      return {
        score: 0,
        feedback: {
          strengths: [],

          improvements: [`Error: ${error.message}`],
          corrected: text,
        },
      };
    }
  }
}
