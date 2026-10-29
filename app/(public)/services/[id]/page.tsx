import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { configured, publicClient } from '@/lib/supabase/server';
import { ServiceDetail } from '@/components/service';
import type { Service } from '@/lib/types';
const getService = cache(async (id: string): Promise<Service> => {
  if (!z.string().uuid().safeParse(id).success || !configured()) notFound();
  const { data, error } = await publicClient().from('services').select('*').eq('id', id).eq('published', true).maybeSingle();
  if (error) throw new Error('Impossible de charger le service.');
  if (!data) notFound();
  return data;
});
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const service = await getService((await params).id);
  return { title: service.title, description: service.summary, alternates: { canonical: `/services/${service.id}` }, openGraph: { title: service.title, description: service.summary, images: ['/opengraph-image'] } };
}
export default async function ServicePage({ params }: { params: Promise<{ id: string }> }) {
  const service = await getService((await params).id);
  return <ServiceDetail service={service} />;
}
