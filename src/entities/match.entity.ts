import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  week: number;

  @Column()
  date: string;

  @Column()
  opponent: string;

  @Column({ nullable: true })
  venue: string;

  @Column({ nullable: true })
  result: string;

  @Column({ nullable: true })
  score: string;

  @Column({ default: 0 })
  goals_for: number;

  @Column({ default: 0 })
  goals_against: number;

  @Column({ default: false })
  is_upcoming: boolean;

  @Column({ nullable: true })
  time: string;

  @CreateDateColumn()
  created_at: Date;
}
