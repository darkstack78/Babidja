import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;
}

const DEFAULT_WINDOW_DAYS = 90;

/** Par défaut, une fenêtre de 90 jours à partir d'aujourd'hui quand start/end ne sont pas fournis. */
export function resolveDateRange(query: DateRangeQueryDto): { start: Date; end: Date } {
  const start = query.start ? new Date(query.start) : new Date();
  const end = query.end
    ? new Date(query.end)
    : new Date(start.getTime() + DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  return { start, end };
}
