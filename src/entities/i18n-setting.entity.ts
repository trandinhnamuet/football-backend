import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ schema: 'football', name: 'i18n_settings' })
export class I18nSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', default: '{}' })
  data_vi: string;

  @Column({ type: 'text', default: '{}' })
  data_en: string;

  @UpdateDateColumn()
  updated_at: Date;
}
