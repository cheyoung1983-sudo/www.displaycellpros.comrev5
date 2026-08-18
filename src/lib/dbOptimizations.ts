/**
 * D&CP High-Performance Database Indexing & Query Optimization Engine
 * Provides production-grade index recommendations, DDL scripts, and query plan optimizations
 * tailored for high-traffic mobile hardware repair lookups.
 */

export interface IndexRecommendation {
  id: string;
  table: string;
  indexName: string;
  type: 'BTREE' | 'COMPOSITE_BTREE' | 'PARTIAL_BTREE' | 'GIN_TRGM' | 'BRIN' | 'UNIQUE_BTREE';
  targetColumns: string[];
  sqlDDL: string;
  queryPattern: string;
  estimatedSpeedup: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rationale: string;
}

export interface PoolConfigStats {
  maxPrimaryConnections: number;
  maxReadOnlyConnections: number;
  idleTimeoutMs: number;
  connectionTimeoutMs: number;
  statementTimeoutMs: number;
  keepAlive: boolean;
  readWriteSplittingEnabled: boolean;
}

export const REPAIR_DB_INDEX_RECOMMENDATIONS: IndexRecommendation[] = [
  {
    id: 'idx_rec_01',
    table: 'repair_tickets',
    indexName: 'idx_repair_tickets_ticket_number_unique',
    type: 'UNIQUE_BTREE',
    targetColumns: ['ticket_number'],
    sqlDDL: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_tickets_ticket_number ON repair_tickets (UPPER(ticket_number));',
    queryPattern: 'SELECT * FROM repair_tickets WHERE UPPER(ticket_number) = $1',
    estimatedSpeedup: '98% (Table scan O(N) -> Index lookup O(log N) ~1.2ms)',
    priority: 'CRITICAL',
    rationale: 'Primary lookup path for customers and bench technicians tracking active board repair jobs via ticket ID.'
  },
  {
    id: 'idx_rec_02',
    table: 'repair_tickets',
    indexName: 'idx_repair_tickets_customer_history',
    type: 'COMPOSITE_BTREE',
    targetColumns: ['customer_email', 'created_at DESC'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_tickets_customer_history ON repair_tickets (LOWER(customer_email), created_at DESC);',
    queryPattern: 'SELECT * FROM repair_tickets WHERE LOWER(customer_email) = $1 ORDER BY created_at DESC LIMIT 20',
    estimatedSpeedup: '95% (Eliminates in-memory filesort across full ticket table)',
    priority: 'CRITICAL',
    rationale: 'Allows instant customer portal profile loading with zero temporary table sort overhead.'
  },
  {
    id: 'idx_rec_03',
    table: 'repair_tickets',
    indexName: 'idx_repair_tickets_active_queue',
    type: 'PARTIAL_BTREE',
    targetColumns: ['status', 'queue_position', 'priority_express', 'updated_at'],
    sqlDDL: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_tickets_active_queue 
ON repair_tickets (queue_position ASC, updated_at DESC) 
WHERE status NOT IN ('completed', 'delivered', 'cancelled', 'recycled');`,
    queryPattern: "SELECT * FROM repair_tickets WHERE status = 'in_triage' ORDER BY queue_position ASC",
    estimatedSpeedup: '92% (Indexes only ~5% of table volume representing uncompleted bench jobs)',
    priority: 'HIGH',
    rationale: 'Partial index keeps index memory footprint extremely small while providing sub-millisecond technician dashboard filtering.'
  },
  {
    id: 'idx_rec_04',
    table: 'supported_devices',
    indexName: 'idx_supported_devices_brand_model_composite',
    type: 'COMPOSITE_BTREE',
    targetColumns: ['brand', 'model'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supported_devices_brand_model ON supported_devices (brand, model);',
    queryPattern: 'SELECT * FROM supported_devices WHERE brand = $1 AND model ILIKE $2',
    estimatedSpeedup: '89% (Direct B-Tree index scan for device catalog autocomplete)',
    priority: 'HIGH',
    rationale: 'Powers high-traffic device model autocomplete, schematics lookup, and repair pricing calculators.'
  },
  {
    id: 'idx_rec_05',
    table: 'supported_devices',
    indexName: 'idx_supported_devices_board_id_exact',
    type: 'BTREE',
    targetColumns: ['board_id'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_supported_devices_board_id ON supported_devices (UPPER(board_id));',
    queryPattern: 'SELECT * FROM supported_devices WHERE UPPER(board_id) = $1',
    estimatedSpeedup: '96% (Instant PCB schematics & donor board component mapping)',
    priority: 'HIGH',
    rationale: 'Used by micro-soldering technicians verifying boardview netlists (e.g., 820-00165, EDM-020, N200-MB).'
  },
  {
    id: 'idx_rec_06',
    table: 'service_bookings',
    indexName: 'idx_service_bookings_schedule_slot',
    type: 'COMPOSITE_BTREE',
    targetColumns: ['appointment_date', 'time_slot', 'status'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_bookings_schedule_slot ON service_bookings (appointment_date, time_slot, status);',
    queryPattern: "SELECT time_slot, COUNT(*) FROM service_bookings WHERE appointment_date = $1 AND status != 'cancelled' GROUP BY time_slot",
    estimatedSpeedup: '94% (Index-only scan for drop-off slot availability check)',
    priority: 'HIGH',
    rationale: 'Guarantees lightning-fast booking calendar availability checks during high-traffic booking rushes.'
  },
  {
    id: 'idx_rec_07',
    table: 'diagnostic_telemetry',
    indexName: 'idx_diagnostic_telemetry_ticket_time',
    type: 'COMPOSITE_BTREE',
    targetColumns: ['ticket_id', 'logged_at DESC'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_diagnostic_telemetry_ticket_time ON diagnostic_telemetry (ticket_id, logged_at DESC);',
    queryPattern: 'SELECT * FROM diagnostic_telemetry WHERE ticket_id = $1 ORDER BY logged_at DESC LIMIT 50',
    estimatedSpeedup: '97% (High-frequency thermal & ammeter data series retrieval)',
    priority: 'MEDIUM',
    rationale: 'Supports live bench ammeter curves and thermal imaging history without full table scan.'
  },
  {
    id: 'idx_rec_08',
    table: 'repair_tickets',
    indexName: 'idx_repair_tickets_created_brin',
    type: 'BRIN',
    targetColumns: ['created_at'],
    sqlDDL: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_repair_tickets_created_brin ON repair_tickets USING BRIN (created_at);',
    queryPattern: 'SELECT COUNT(*), AVG(turnaround_hours) FROM repair_tickets WHERE created_at >= $1 AND created_at <= $2',
    estimatedSpeedup: '85% (99.5% smaller storage footprint than B-Tree for append-only timestamp data)',
    priority: 'MEDIUM',
    rationale: 'Ideal for annual repair analytics, turnaround KPIs, and warranty rate computations over millions of rows.'
  }
];

export const POSTGRES_TABLE_SCHEMAS_DDL = `
-- ====================================================================
-- D&CP HIGH-PERFORMANCE DATABASE SCHEMA FOR MOBILE REPAIR TELEMETRY
-- ====================================================================

-- 1. Supported Devices & Schematics Catalog
CREATE TABLE IF NOT EXISTS supported_devices (
  id VARCHAR(64) PRIMARY KEY,
  brand VARCHAR(64) NOT NULL,
  model VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  board_id VARCHAR(64),
  soc VARCHAR(128),
  schematics_available BOOLEAN DEFAULT true,
  boardview_available BOOLEAN DEFAULT true,
  donor_stock_count INT DEFAULT 0,
  max_repair_tier VARCHAR(32) DEFAULT 'Tier 3 (Board Rework)',
  common_faults JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Repair Tickets & Intake Jobs
CREATE TABLE IF NOT EXISTS repair_tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_number VARCHAR(32) UNIQUE NOT NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(32),
  device_brand VARCHAR(64),
  device_model VARCHAR(128) NOT NULL,
  serial_imei VARCHAR(64),
  reported_issue TEXT,
  service_tier VARCHAR(64) DEFAULT 'Tier 2 (Display Renewal)',
  priority_express VARCHAR(32) DEFAULT 'standard',
  current_stage INT DEFAULT 1,
  queue_position INT DEFAULT 1,
  status VARCHAR(32) DEFAULT 'intake_received',
  estimated_completion TIMESTAMPTZ,
  quote_amount NUMERIC(10, 2),
  bench_notes TEXT,
  telemetry JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Bookings & Drop-Off Reservations
CREATE TABLE IF NOT EXISTS service_bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_id VARCHAR(64) UNIQUE NOT NULL,
  ticket_number VARCHAR(32),
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  device_category VARCHAR(64) NOT NULL,
  service_tier VARCHAR(64) NOT NULL,
  drop_off_type VARCHAR(32) DEFAULT 'in_person',
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bench Telemetry Log Stream
CREATE TABLE IF NOT EXISTS diagnostic_telemetry (
  id BIGSERIAL PRIMARY KEY,
  ticket_id VARCHAR(32) NOT NULL,
  ammeter_draw_amps NUMERIC(6, 3),
  battery_health_pct INT,
  battery_temp_celsius NUMERIC(5, 2),
  short_detected BOOLEAN DEFAULT false,
  thermal_hotspot_celsius NUMERIC(5, 2),
  reading_raw JSONB DEFAULT '{}'::jsonb,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Apply Recommended Production Indexes
${REPAIR_DB_INDEX_RECOMMENDATIONS.map((r) => r.sqlDDL).join('\n')}
`;

export function generateMigrationScript(): string {
  return POSTGRES_TABLE_SCHEMAS_DDL.trim();
}
