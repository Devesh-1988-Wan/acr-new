import { cn } from '@/lib/utils';

interface CRDetailSectionProps {
  label: string;
  value: string;
  isMultiline?: boolean;
  className?: string;
}

export const CRDetailSection = ({ label, value, isMultiline = false, className }: CRDetailSectionProps) => {
  return (
    <div className={cn('border-b border-border py-4 last:border-b-0', className)}>
      <dt className="text-sm font-semibold text-muted-foreground mb-1.5">{label}</dt>
      <dd className={cn('text-foreground', isMultiline && 'whitespace-pre-wrap')}>
        {value}
      </dd>
    </div>
  );
};
