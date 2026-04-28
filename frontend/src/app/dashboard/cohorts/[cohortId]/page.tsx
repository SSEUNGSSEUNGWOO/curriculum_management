import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { createClient } from '@/lib/supabase/server';

export default async function CohortOverviewPage({
  params
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const supabase = await createClient();
  const { data: cohort, error } = await supabase
    .from('cohorts')
    .select('id, name, started_at, ended_at')
    .eq('id', cohortId)
    .single();

  if (error || !cohort) notFound();

  const sections = [
    { slug: 'recruitment', label: '모집', desc: '지원서 접수와 모집 현황' },
    { slug: 'selection', label: '선발', desc: '지원자 평가 및 선발 결과' },
    { slug: 'attendance', label: '출결', desc: '수강생 출석 및 결석 기록' },
    { slug: 'assignments', label: '과제', desc: '과제 출제, 제출, 채점' },
    { slug: 'completion', label: '수료', desc: '수료 기준 충족 여부' },
    { slug: 'certification', label: '인증', desc: '수료증 발급 및 인증서' }
  ];

  return (
    <PageContainer
      pageTitle={cohort.name}
      pageDescription={`${cohort.started_at ?? '시작 미정'} ~ ${cohort.ended_at ?? '종료 미정'}`}
    >
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/dashboard/cohorts/${cohortId}/${s.slug}`}
            className='hover:bg-accent block rounded-md border p-4 transition-colors'
          >
            <div className='font-semibold'>{s.label}</div>
            <div className='text-muted-foreground mt-1 text-xs'>{s.desc}</div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
