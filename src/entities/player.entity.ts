import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'players' })
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  num: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: true })
  joined: string;

  @Column({ nullable: true })
  boots: string;

  @Column({ nullable: true })
  nick: string;

  @Column({ nullable: true })
  image_url: string;

  // Secondary "zoom" photo used on the homepage hero & squad sections
  @Column({ nullable: true })
  zoom_image_url: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  stat_goals: number;

  @Column({ default: 0 })
  stat_assists: number;

  @Column({ default: 0 })
  stat_saves: number;

  @Column({ default: 0 })
  stat_tackles: number;

  @Column({ type: 'float', default: 0 })
  stat_passes: number;

  @Column({ default: 0 })
  stat_attendance: number;

  @Column({ default: 0 })
  stat_minutes: number;

  @Column({ type: 'float', default: 0 })
  stat_points: number;

  @Column({ default: 0 })
  stat_matches: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
