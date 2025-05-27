CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    product_category VARCHAR(255),
    make VARCHAR(255),
    model VARCHAR(255),
    notes TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar (
    id SERIAL PRIMARY KEY,
    date DATE,
    name VARCHAR(255),
    time TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    part_number VARCHAR(50),
    serial_number VARCHAR(50),
    part_name VARCHAR(255),
    description TEXT,
    category VARCHAR(255),
    manufacturer VARCHAR(255),
    model_compatibility VARCHAR(255),
    quantity_in_stock INTEGER,
    location VARCHAR(255),
    stock_status VARCHAR(50),
    reorder_point INTEGER,
    supplier_name VARCHAR(255),
    supplier_part_number VARCHAR(50),
    supplier_contact VARCHAR(255),
    supplier_cost DECIMAL(10, 2),
    latest_lead_time INTEGER,
    retail_price DECIMAL(10, 2),
    last_sold_date DATE,
    sales_frequency INTEGER,
    condition VARCHAR(50),
    image_url VARCHAR(255),
    attachment_files TEXT,
    usage_rate DECIMAL(10, 2),
    inventory_turnover DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);