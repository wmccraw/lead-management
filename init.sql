DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    product_category VARCHAR(50),
    make VARCHAR(50),
    model VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    quoted_from_vendor BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);