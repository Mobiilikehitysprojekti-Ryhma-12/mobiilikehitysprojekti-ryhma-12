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
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  is_hidden?: boolean | null;
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
    customerEmail: row.customer_email ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    businessId: row.business_id,
    isHidden: row.is_hidden ?? false,
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
      // Huom: vanhoissa riveissä kenttä voi olla vielä NULL (ennen migraatiota).
      // Siksi sallitaan sekä NULL että false.
      .or('is_hidden.is.null,is_hidden.eq.false')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase listLeads epäonnistui: ${error.message}`);
    }

    const rows = (data ?? []) as LeadRow[];
    return rows.map(mapLeadRowToLead);
  }

  async listHiddenLeads(): Promise<Lead[]> {
    const { data, error } = await this.client
      .from('leads')
      .select('*')
      .eq('is_hidden', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase listHiddenLeads epäonnistui: ${error.message}`);
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
    // Huom: Supabase voi RLS-tilanteissa palauttaa "0 riviä päivitetty" ilman virhettä.
    // Siksi haetaan palautteeksi päivitetty rivi ja varmistetaan, että muutos oikeasti tapahtui.
    const { data, error } = await this.client
      .from('leads')
      .update({ status })
      .eq('id', leadId)
      .select('id');

    if (error) throw new Error(`Supabase updateLeadStatus epäonnistui: ${error.message}`);

    const updated = (data ?? []) as Array<{ id: string }>;
    if (updated.length === 0) {
      throw new Error(
        'Liidin päivitys estyi (0 riviä päivitetty). Todennäköisin syy on Supabasen RLS/policyt tai puuttuva kirjautuminen.'
      );
    }
  }

  async hideLead(leadId: string): Promise<void> {
    // Sama huomio kuin updateLeadStatus: RLS voi palauttaa 0 riviä ilman virhettä.
    const { data, error } = await this.client
      .from('leads')
      .update({ is_hidden: true })
      .eq('id', leadId)
      .select('id');

    if (error) throw new Error(`Supabase hideLead epäonnistui: ${error.message}`);

    const updated = (data ?? []) as Array<{ id: string }>;
    if (updated.length === 0) {
      throw new Error(
        'Liidin piilotus estyi (0 riviä päivitetty). Tarkista että olet kirjautunut ja että RLS sallii UPDATE-operaation (business_id = auth.uid()).'
      );
    }
  }

  async unhideLead(leadId: string): Promise<void> {
    const { data, error } = await this.client
      .from('leads')
      .update({ is_hidden: false })
      .eq('id', leadId)
      .select('id');

    if (error) throw new Error(`Supabase unhideLead epäonnistui: ${error.message}`);

    const updated = (data ?? []) as Array<{ id: string }>;
    if (updated.length === 0) {
      throw new Error(
        'Liidin palautus estyi (0 riviä päivitetty). Tarkista että olet kirjautunut ja että RLS sallii UPDATE-operaation.'
      );
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    // Delete-operaatio voi myös palauttaa 0 riviä ilman virhettä, jos RLS estää.
    const { data, error } = await this.client.from('leads').delete().eq('id', leadId).select('id');

    if (error) throw new Error(`Supabase deleteLead epäonnistui: ${error.message}`);

    const deleted = (data ?? []) as Array<{ id: string }>;
    if (deleted.length === 0) {
      throw new Error(
        'Liidin poisto estyi (0 riviä poistettu). Lisää Supabaseen DELETE policy (business_id = auth.uid()) ja varmista että authenticated-roolilla on DELETE-grant.'
      );
    }
  }
}
