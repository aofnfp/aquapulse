import * as SQLite from 'expo-sqlite';
import { IntakeEntry, DailySummary, BeverageType, ReminderSlot, PRESET_BEVERAGES } from '@/types';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('aquapulse.db');
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await initSchema(db);
  return db;
}

async function initSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS beverage_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      hydration_multiplier REAL NOT NULL DEFAULT 1.0,
      is_preset INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS intake_log (
      id TEXT PRIMARY KEY,
      log_date TEXT NOT NULL,
      logged_at TEXT NOT NULL,
      beverage_type_id TEXT NOT NULL,
      beverage_name TEXT NOT NULL,
      beverage_icon TEXT NOT NULL,
      volume_ml REAL NOT NULL,
      effective_ml REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS daily_summary (
      summary_date TEXT PRIMARY KEY,
      goal_ml REAL NOT NULL,
      total_volume_ml REAL DEFAULT 0,
      total_effective_ml REAL DEFAULT 0,
      goal_met INTEGER DEFAULT 0,
      entry_count INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reminder_slots (
      id TEXT PRIMARY KEY,
      time_hhmm TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_intake_log_date ON intake_log(log_date);
    CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(summary_date);
  `);

  // Seed preset beverages if empty
  const count = await database.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM beverage_types WHERE is_preset = 1'
  );
  if (!count || count.cnt === 0) {
    for (const b of PRESET_BEVERAGES) {
      await database.runAsync(
        `INSERT OR IGNORE INTO beverage_types (id, name, icon, hydration_multiplier, is_preset, display_order)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [b.id, b.name, b.icon, b.hydrationMultiplier, b.displayOrder]
      );
    }
  }
}

// ─── Beverage Types ──────────────────────────────────────────────
export async function getBeverageTypes(): Promise<BeverageType[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    name: string;
    icon: string;
    hydration_multiplier: number;
    is_preset: number;
    display_order: number;
  }>('SELECT * FROM beverage_types ORDER BY display_order');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    hydrationMultiplier: r.hydration_multiplier,
    isPreset: r.is_preset === 1,
    displayOrder: r.display_order,
  }));
}

// ─── Intake Logging ──────────────────────────────────────────────
export async function addIntakeEntry(
  entry: Omit<IntakeEntry, 'id'>
): Promise<IntakeEntry> {
  const database = await getDatabase();
  const id = generateId();
  await database.runAsync(
    `INSERT INTO intake_log (id, log_date, logged_at, beverage_type_id, beverage_name, beverage_icon, volume_ml, effective_ml)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, entry.logDate, entry.loggedAt, entry.beverageTypeId, entry.beverageName, entry.beverageIcon, entry.volumeMl, entry.effectiveMl]
  );
  await updateDailySummary(entry.logDate);
  return { ...entry, id };
}

export async function deleteIntakeEntry(id: string, logDate: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM intake_log WHERE id = ?', [id]);
  await updateDailySummary(logDate);
}

export async function updateIntakeEntryVolume(
  id: string,
  logDate: string,
  volumeMl: number,
  effectiveMl: number
): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'UPDATE intake_log SET volume_ml = ?, effective_ml = ? WHERE id = ?',
    [volumeMl, effectiveMl, id]
  );
  await updateDailySummary(logDate);
}

export async function getTodayEntries(date: string): Promise<IntakeEntry[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    log_date: string;
    logged_at: string;
    beverage_type_id: string;
    beverage_name: string;
    beverage_icon: string;
    volume_ml: number;
    effective_ml: number;
  }>('SELECT * FROM intake_log WHERE log_date = ? ORDER BY logged_at DESC', [date]);
  return rows.map((r) => ({
    id: r.id,
    logDate: r.log_date,
    loggedAt: r.logged_at,
    beverageTypeId: r.beverage_type_id,
    beverageName: r.beverage_name,
    beverageIcon: r.beverage_icon,
    volumeMl: r.volume_ml,
    effectiveMl: r.effective_ml,
  }));
}

export async function getEntriesForDate(date: string): Promise<IntakeEntry[]> {
  return getTodayEntries(date);
}

// ─── Daily Summary ───────────────────────────────────────────────
async function updateDailySummary(date: string): Promise<void> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    total_volume: number;
    total_effective: number;
    cnt: number;
  }>(
    'SELECT COALESCE(SUM(volume_ml), 0) as total_volume, COALESCE(SUM(effective_ml), 0) as total_effective, COUNT(*) as cnt FROM intake_log WHERE log_date = ?',
    [date]
  );
  if (!result) return;

  // Get goal for this day from profile (stored in AsyncStorage, passed via caller)
  // For now we read from existing summary or use default
  const existing = await database.getFirstAsync<{ goal_ml: number }>(
    'SELECT goal_ml FROM daily_summary WHERE summary_date = ?',
    [date]
  );
  const goalMl = existing?.goal_ml ?? 2000;
  const goalMet = result.total_effective >= goalMl ? 1 : 0;

  await database.runAsync(
    `INSERT INTO daily_summary (summary_date, goal_ml, total_volume_ml, total_effective_ml, goal_met, entry_count, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(summary_date) DO UPDATE SET
       total_volume_ml = excluded.total_volume_ml,
       total_effective_ml = excluded.total_effective_ml,
       goal_met = excluded.goal_met,
       entry_count = excluded.entry_count,
       updated_at = excluded.updated_at`,
    [date, goalMl, result.total_volume, result.total_effective, goalMet, result.cnt]
  );
}

export async function ensureDailySummary(date: string, goalMl: number): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT OR IGNORE INTO daily_summary (summary_date, goal_ml, total_volume_ml, total_effective_ml, goal_met, entry_count)
     VALUES (?, ?, 0, 0, 0, 0)`,
    [date, goalMl]
  );
  // Also update goal if changed
  await database.runAsync(
    `UPDATE daily_summary SET goal_ml = ? WHERE summary_date = ? AND goal_ml != ?`,
    [goalMl, date, goalMl]
  );
}

export async function getDailySummary(date: string): Promise<DailySummary | null> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<{
    summary_date: string;
    goal_ml: number;
    total_volume_ml: number;
    total_effective_ml: number;
    goal_met: number;
    entry_count: number;
  }>('SELECT * FROM daily_summary WHERE summary_date = ?', [date]);
  if (!row) return null;
  return {
    summaryDate: row.summary_date,
    goalMl: row.goal_ml,
    totalVolumeMl: row.total_volume_ml,
    totalEffectiveMl: row.total_effective_ml,
    goalMet: row.goal_met === 1,
    entryCount: row.entry_count,
  };
}

export async function getWeekSummaries(dates: string[]): Promise<DailySummary[]> {
  const database = await getDatabase();
  const placeholders = dates.map(() => '?').join(',');
  const rows = await database.getAllAsync<{
    summary_date: string;
    goal_ml: number;
    total_volume_ml: number;
    total_effective_ml: number;
    goal_met: number;
    entry_count: number;
  }>(`SELECT * FROM daily_summary WHERE summary_date IN (${placeholders}) ORDER BY summary_date`, dates);
  return rows.map((r) => ({
    summaryDate: r.summary_date,
    goalMl: r.goal_ml,
    totalVolumeMl: r.total_volume_ml,
    totalEffectiveMl: r.total_effective_ml,
    goalMet: r.goal_met === 1,
    entryCount: r.entry_count,
  }));
}

export async function getMonthSummaries(year: number, month: number): Promise<DailySummary[]> {
  const database = await getDatabase();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const rows = await database.getAllAsync<{
    summary_date: string;
    goal_ml: number;
    total_volume_ml: number;
    total_effective_ml: number;
    goal_met: number;
    entry_count: number;
  }>('SELECT * FROM daily_summary WHERE summary_date LIKE ? ORDER BY summary_date', [`${prefix}%`]);
  return rows.map((r) => ({
    summaryDate: r.summary_date,
    goalMl: r.goal_ml,
    totalVolumeMl: r.total_volume_ml,
    totalEffectiveMl: r.total_effective_ml,
    goalMet: r.goal_met === 1,
    entryCount: r.entry_count,
  }));
}

// ─── Reminders ───────────────────────────────────────────────────
export async function getReminderSlots(): Promise<ReminderSlot[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    time_hhmm: string;
    is_enabled: number;
    display_order: number;
  }>('SELECT * FROM reminder_slots ORDER BY display_order');
  return rows.map((r) => ({
    id: r.id,
    timeHhmm: r.time_hhmm,
    isEnabled: r.is_enabled === 1,
    displayOrder: r.display_order,
  }));
}

export async function upsertReminderSlot(slot: ReminderSlot): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO reminder_slots (id, time_hhmm, is_enabled, display_order)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       time_hhmm = excluded.time_hhmm,
       is_enabled = excluded.is_enabled,
       display_order = excluded.display_order`,
    [slot.id, slot.timeHhmm, slot.isEnabled ? 1 : 0, slot.displayOrder]
  );
}

export async function deleteReminderSlot(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM reminder_slots WHERE id = ?', [id]);
}

// ─── Data Management ─────────────────────────────────────────────
export async function deleteAllData(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM intake_log;
    DELETE FROM daily_summary;
    DELETE FROM reminder_slots;
    DELETE FROM beverage_types WHERE is_preset = 0;
  `);
}

export async function exportDataAsJson(): Promise<string> {
  const database = await getDatabase();
  const entries = await database.getAllAsync('SELECT * FROM intake_log ORDER BY logged_at DESC');
  const summaries = await database.getAllAsync('SELECT * FROM daily_summary ORDER BY summary_date DESC');
  return JSON.stringify({ intakeLog: entries, dailySummaries: summaries }, null, 2);
}

// ─── Helpers ─────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return days;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
