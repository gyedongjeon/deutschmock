import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Evaluation } from '../../evaluation/entities/evaluation.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'A2' })
  level: string;

  @OneToMany(() => Evaluation, (evaluation) => evaluation.user)
  evaluations: Evaluation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
