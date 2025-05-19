DROP TABLE IF EXISTS leads;
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    product_category VARCHAR(50),
    make VARCHAR(50),
    model VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'New',
    quoted_from_vendor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);