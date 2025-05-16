DO $$ BEGIN
    -- Create leads table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'leads'
    ) THEN
        CREATE TABLE leads (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            status VARCHAR(50),
            quoted_from_vendor BOOLEAN,
            created_at TIMESTAMP,
            time_in_system INTEGER
        );
    END IF;

    -- Create customers table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'customers'
    ) THEN
        CREATE TABLE customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL
        );
    END IF;

    -- Create inventory table if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'inventory'
    ) THEN
        CREATE TABLE inventory (
            id SERIAL PRIMARY KEY,
            part_number VARCHAR(50) UNIQUE NOT NULL,
            serial_number VARCHAR(50),
            part_name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            manufacturer VARCHAR(100),
            model_compatibility TEXT,
            quantity INTEGER DEFAULT 0,
            location VARCHAR(100),
            stock_status VARCHAR(50),
            reorder_point INTEGER,
            supplier_name VARCHAR(100) NOT NULL,
            supplier_part_number VARCHAR(50),
            supplier_contact VARCHAR(100),
            supplier_cost DECIMAL(10,2),
            latest_lead_time_received VARCHAR(100),
            retail_price DECIMAL(10,2),
            last_sold_date DATE,
            sales_frequency VARCHAR(50),
            condition VARCHAR(50),
            image_url VARCHAR(255),
            attachment_files VARCHAR(255),
            date_added DATE DEFAULT CURRENT_DATE,
            last_updated DATE DEFAULT CURRENT_DATE,
            usage_rate VARCHAR(50),
            inventory_turnover VARCHAR(50),
            tags TEXT,
            custom_attributes JSONB
        );
        CREATE INDEX idx_part_number ON inventory(part_number);
        CREATE INDEX idx_category ON inventory(category);
        CREATE INDEX idx_supplier_name ON inventory(supplier_name);
    END IF;
END $$;