/**
 * SupabaseLeadsRepository
 *
 * Supabase-toteutus `LeadsRepository`-rajapinnalle.
 *
 * Miksi tämä tiedosto on olemassa:
 * - UI (Inbox/Detail/Quote) ei saa kutsua Supabasen clientia suoraan.
 * - RLS hoitaa "näe vain omat" -logiikan (business_id = auth.uid()).
 * - Tässä tehdään selkeä mappaus DB:n snake_case -> domainin camelCase.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Lead, LeadStatus } from '@/models/Lead';
import { supabase as defaultSupabase } from '@/services/supabaseClient';

import type { LeadsRepository } from './LeadsRepository';

/**
 * DB-rivin muoto (Supabase palauttaa kentät taulun sarakenimillä).
 *
 * Huom: pidetään tämä erillisenä domain-tyypistä, jotta mappaus on eksplisiittinen.
 */
export type LeadRow = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

const ALLOWED_STATUSES: ReadonlyArray<LeadStatus> = ['new', 'quoted', 'accepted', 'rejected'];

function parseLeadStatus(status: string): LeadStatus {
  // Miksi guard:
  // - DB:ssä on CHECK-constraint, mutta varmistetaan silti UI:n turvallisuus.
  // - Jos data on korruptoitunutta, näytetään ainakin järkevä fallback.
  return (ALLOWED_STATUSES as ReadonlyArray<string>).includes(status) ? (status as LeadStatus) : 'new';
}

function mapLeadRowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: parseLeadStatus(row.status),
    createdAt: row.created_at,
    address: row.address ?? undefined,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    businessId: row.business_id,
  };
}

function requireSupabaseClient(client: SupabaseClient | null): SupabaseClient {
  // Miksi oma helper:
  // - `supabaseClient.ts` palauttaa `null`, jos env puuttuu.
  // - Tällöin halutaan selkeä virhe UI:n ErrorCardiin (ei cryptistä null-pointeria).
  if (!client) {
    throw new Error(
      'Supabase ei ole konfiguroitu: aseta EXPO_PUBLIC_SUPABASE_URL ja EXPO_PUBLIC_SUPABASE_ANON_KEY (katso services/supabaseClient.ts).'
    );
  }
  return client;
}

export class SupabaseLeadsRepository implements LeadsRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient | null = defaultSupabase) {
    this.client = requireSupabaseClient(client);
  }

  async listLeads(): Promise<Lead[]> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase listLeads epäonnistui: ${error.message}`);
    }

    const rows = (data ?? []) as LeadRow[];
    return rows.map(mapLeadRowToLead);
  }

  async getLeadById(id: string): Promise<Lead | null> {
    const { data, error } = await this.client.from('leads').select('*').eq('id', id).maybeSingle();

    if (error) {
      throw new Error(`Supabase getLeadById epäonnistui: ${error.message}`);
    }

    if (!data) return null;
    return mapLeadRowToLead(data as LeadRow);
  }

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
    const { error } = await this.client.from('leads').update({ status }).eq('id', leadId);

    if (error) {
      throw new Error(`Supabase updateLeadStatus epäonnistui: ${error.message}`);
    }
  }
}
