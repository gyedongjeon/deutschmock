import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Evaluation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  original_text: string;

  @Column()
  score: number;

  @Column('jsonb')
  feedback: any;

  @Column({ default: 'A2' })
  level: string;

  @Column({ default: 1 })
  part: number;

  @Column('jsonb', { nullable: true })
  task: any;

  @Column({ default: 'writing' })
  module: string;

  @ManyToOne(() => User, (user) => user.evaluations, { nullable: true }) // nullable: true to allow tests for non-logged-in users
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
