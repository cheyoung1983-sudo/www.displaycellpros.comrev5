import { describe, it, expect, beforeEach } from 'vitest';
import {
  initSqliteDatabase,
  getSqliteDatabase,
  saveOfflineRepairIntake,
  getOfflineRepairIntakes,
  getOfflineRepairIntakeById,
  deleteOfflineRepairIntake,
  clearAllOfflineRepairIntakes,
  exportDatabaseRecordsAsJson,
  exportDatabaseRecordsAsCsv,
  downloadDatabaseBackup,
} from './db.ts';
import { Manufacturer, ServiceTier } from '../types.ts';

describe('Local SQLite Database & Offline Intake Store', () => {
  beforeEach(async () => {
    await clearAllOfflineRepairIntakes();
  });

  it('initializes local sqlite database instance with table definitions', () => {
    const db = initSqliteDatabase({ memory: true });
    expect(db).toBeDefined();
    expect(typeof db.exec).toBe('function');
    expect(typeof db.prepare).toBe('function');
  });

  it('saves and retrieves an offline repair intake entry', async () => {
    const entry = await saveOfflineRepairIntake({
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: 'iPhone 14 Pro',
      imei: '354892019284712',
      serviceTier: ServiceTier.TIER_2_DISPLAY,
      customerName: 'Alice Springs',
      customerEmail: 'alice@example.com',
      customerPhone: '5095551234',
      destinationZipCode: '99201',
      customerReportedIssue: 'OLED cracked with black spots and ghost touch',
      status: 'draft',
    });

    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('draft');
    expect(entry.deviceModel).toBe('iPhone 14 Pro');

    const retrieved = await getOfflineRepairIntakeById(entry.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.customerName).toBe('Alice Springs');
    expect(retrieved?.imei).toBe('354892019284712');
  });

  it('filters offline intakes by status', async () => {
    await saveOfflineRepairIntake({
      id: 'intake_1',
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: 'iPhone 13',
      imei: '354892019284711',
      serviceTier: ServiceTier.TIER_1_POWER,
      customerName: 'Bob Builder',
      customerEmail: 'bob@example.com',
      customerPhone: '5095554321',
      destinationZipCode: '99201',
      customerReportedIssue: 'Battery swelling and 0% bootloop',
      status: 'draft',
    });

    await saveOfflineRepairIntake({
      id: 'intake_2',
      deviceManufacturer: Manufacturer.SAMSUNG,
      deviceModel: 'Galaxy S23 Ultra',
      imei: '354892019284713',
      serviceTier: ServiceTier.TIER_3_BOARD,
      customerName: 'Charlie Root',
      customerEmail: 'charlie@example.com',
      customerPhone: '5095559876',
      destinationZipCode: '99206',
      customerReportedIssue: 'VBUS short to ground at charging IC',
      status: 'pending_sync',
    });

    const allIntakes = await getOfflineRepairIntakes();
    expect(allIntakes.length).toBe(2);

    const draftIntakes = await getOfflineRepairIntakes('draft');
    expect(draftIntakes.length).toBe(1);
    expect(draftIntakes[0].id).toBe('intake_1');

    const pendingIntakes = await getOfflineRepairIntakes('pending_sync');
    expect(pendingIntakes.length).toBe(1);
    expect(pendingIntakes[0].id).toBe('intake_2');
  });

  it('deletes an offline repair intake by ID', async () => {
    const entry = await saveOfflineRepairIntake({
      deviceManufacturer: Manufacturer.OTHER,
      deviceModel: 'Steam Deck OLED',
      imei: '354892019284799',
      serviceTier: ServiceTier.TIER_3_BOARD,
      customerName: 'David Deck',
      customerEmail: 'david@example.com',
      customerPhone: '5095557788',
      destinationZipCode: '99201',
      customerReportedIssue: 'USB-C power delivery negotiation failed',
      status: 'draft',
    });

    const deleted = await deleteOfflineRepairIntake(entry.id);
    expect(deleted).toBe(true);

    const check = await getOfflineRepairIntakeById(entry.id);
    expect(check).toBeNull();
  });

  it('exports SQLite database records as valid JSON format', async () => {
    await saveOfflineRepairIntake({
      id: 'export_test_1',
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: 'iPhone 15 Pro',
      imei: '354892019284722',
      serviceTier: ServiceTier.TIER_2_DISPLAY,
      customerName: 'Eve Export',
      customerEmail: 'eve@example.com',
      customerPhone: '5095553344',
      destinationZipCode: '99201',
      customerReportedIssue: 'Front display shattered, Touch ID operational',
      status: 'draft',
    });

    const jsonStr = exportDatabaseRecordsAsJson();
    expect(jsonStr).toBeDefined();

    const parsed = JSON.parse(jsonStr);
    expect(parsed.version).toBe('1.0');
    expect(parsed.table).toBe('offline_repair_intakes');
    expect(parsed.totalRecords).toBe(1);
    expect(parsed.records[0].id).toBe('export_test_1');
    expect(parsed.records[0].customerName).toBe('Eve Export');
  });

  it('exports SQLite database records as valid CSV format', async () => {
    await saveOfflineRepairIntake({
      id: 'export_csv_1',
      deviceManufacturer: Manufacturer.SAMSUNG,
      deviceModel: 'Galaxy S24',
      imei: '354892019284733',
      serviceTier: ServiceTier.TIER_1_POWER,
      customerName: 'Frankie Form, Jr.',
      customerEmail: 'frank@example.com',
      customerPhone: '5095556677',
      destinationZipCode: '99206',
      customerReportedIssue: 'Charge port loose, intermittent "fast charging" warnings',
      status: 'pending_sync',
    });

    const csvStr = exportDatabaseRecordsAsCsv();
    expect(csvStr).toBeDefined();

    const lines = csvStr.split('\r\n');
    expect(lines.length).toBe(2); // header + 1 row
    expect(lines[0]).toContain('deviceModel');
    expect(lines[0]).toContain('customerName');
    expect(lines[1]).toContain('"export_csv_1"');
    expect(lines[1]).toContain('"Frankie Form, Jr."'); // verify escaped comma
    expect(lines[1]).toContain('"Galaxy S24"');
  });

  it('generates backup package through downloadDatabaseBackup', async () => {
    await saveOfflineRepairIntake({
      id: 'backup_1',
      deviceManufacturer: Manufacturer.APPLE,
      deviceModel: 'MacBook Air M2',
      imei: 'C02G1234MD6R',
      serviceTier: ServiceTier.TIER_3_BOARD,
      customerName: 'Grace Hopper',
      customerEmail: 'grace@example.com',
      customerPhone: '5095558899',
      destinationZipCode: '99201',
      customerReportedIssue: 'No power, 5V 0.00A ammeter draw',
      status: 'draft',
    });

    const jsonBackup = await downloadDatabaseBackup('json', 'custom-backup.json');
    expect(jsonBackup.success).toBe(true);
    expect(jsonBackup.filename).toBe('custom-backup.json');
    expect(jsonBackup.format).toBe('json');
    expect(jsonBackup.count).toBe(1);
    expect(jsonBackup.content).toContain('MacBook Air M2');

    const csvBackup = await downloadDatabaseBackup('csv');
    expect(csvBackup.success).toBe(true);
    expect(csvBackup.format).toBe('csv');
    expect(csvBackup.filename).toMatch(/repair-intakes-backup-.*\.csv/);
    expect(csvBackup.count).toBe(1);
    expect(csvBackup.content).toContain('Grace Hopper');
  });
});
