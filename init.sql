-- LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    product_category VARCHAR(255),
    make VARCHAR(255),
    model VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'New',
    quoted_from_vendor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CALENDAR TABLE (legacy, safe to keep if used elsewhere)
CREATE TABLE IF NOT EXISTS calendar (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    name VARCHAR(255) NOT NULL,
    time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    part_number VARCHAR(50) NOT NULL,
    serial_number VARCHAR(50),
    part_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    manufacturer VARCHAR(255),
    model_compatibility VARCHAR(255),
    quantity_in_stock INTEGER DEFAULT 0,
    location VARCHAR(255),
    stock_status VARCHAR(50),
    reorder_point INTEGER DEFAULT 0,
    supplier_name VARCHAR(255),
    supplier_part_number VARCHAR(50),
    supplier_contact VARCHAR(255),
    supplier_cost DECIMAL(10, 2),
    latest_lead_time INTEGER,
    retail_price DECIMAL(10, 2),
    last_sold_date DATE,
    sales_frequency INTEGER DEFAULT 0,
    condition VARCHAR(50),
    image_url VARCHAR(255),
    attachment_files TEXT,
    usage_rate DECIMAL(10, 2),
    inventory_turnover DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CALENDAR_DAYS TABLE (for new calendar system)
DROP TABLE IF EXISTS calendar_days;
CREATE TABLE calendar_days (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    notes TEXT,
    note_type TEXT NOT NULL,
    absentee TEXT,
    out_status BOOLEAN,
    out_start_date DATE,
    out_end_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Unique index for absences: only one row per person per absence range
CREATE UNIQUE INDEX IF NOT EXISTS uniq_absence
ON calendar_days (note_type, absentee, out_start_date, out_end_date);

-- Unique index for notes: only one note per day per type (not Absence)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_note
ON calendar_days (date, note_type)
WHERE note_type != 'Absence';

-- Optional: Add indexes for faster lookups (uncomment if needed)
-- CREATE INDEX idx_leads_email ON leads(email);
-- CREATE INDEX idx_customers_email ON customers(email);
-- CREATE INDEX idx_inventory_part_number ON inventory(part_number);

-- Optional: Add triggers to auto-update updated_at on row changes (PostgreSQL example)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
-- FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
-- FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();