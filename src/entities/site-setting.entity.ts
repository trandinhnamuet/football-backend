import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'site_settings' })
export class SiteSetting {
  @PrimaryGeneratedColumn()
  id: number;

  // Default theme pushed to all visitors: 'dark' | 'light'
  @Column({ default: 'dark' })
  default_theme: string;

  // Bumped every time admin changes the default. Clients apply the forced
  // theme exactly once per new version, then respect the user's own choice.
  @Column({ default: 1 })
  theme_version: number;

  @UpdateDateColumn()
  updated_at: Date;
}
