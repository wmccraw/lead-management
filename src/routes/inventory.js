const express = require('express');
const { Pool } = require('pg');
const csv = require('csv-parser');
const fs = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { createReadStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const multer = require('multer');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const pipelineAsync = promisify(pipeline);
const upload = multer({ dest: 'uploads/' });

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/', async (req, res) => {
    const part = req.body;
    try {
        await pool.query(
            `INSERT INTO inventory (
                part_number, serial_number, part_name, description, category, manufacturer,
                model_compatibility, quantity, location, stock_status, reorder_point,
                supplier_name, supplier_part_number, supplier_contact, supplier_cost,
                latest_lead_time_received, retail_price, last_sold_date, sales_frequency,
                condition, image_url, attachment_files, date_added, last_updated,
                usage_rate, inventory_turnover, tags, custom_attributes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
            ON CONFLICT (part_number) DO UPDATE SET
                serial_number = EXCLUDED.serial_number,
                part_name = EXCLUDED.part_name,
                description = EXCLUDED.description,
                category = EXCLUDED.category,
                manufacturer = EXCLUDED.manufacturer,
                model_compatibility = EXCLUDED.model_compatibility,
                quantity = EXCLUDED.quantity,
                location = EXCLUDED.location,
                stock_status = EXCLUDED.stock_status,
                reorder_point = EXCLUDED.reorder_point,
                supplier_name = EXCLUDED.supplier_name,
                supplier_part_number = EXCLUDED.supplier_part_number,
                supplier_contact = EXCLUDED.supplier_contact,
                supplier_cost = EXCLUDED.supplier_cost,
                latest_lead_time_received = EXCLUDED.latest_lead_time_received,
                retail_price = EXCLUDED.retail_price,
                last_sold_date = EXCLUDED.last_sold_date,
                sales_frequency = EXCLUDED.sales_frequency,
                condition = EXCLUDED.condition,
                image_url = EXCLUDED.image_url,
                attachment_files = EXCLUDED.attachment_files,
                date_added = EXCLUDED.date_added,
                last_updated = EXCLUDED.last_updated,
                usage_rate = EXCLUDED.usage_rate,
                inventory_turnover = EXCLUDED.inventory_turnover,
                tags = EXCLUDED.tags,
                custom_attributes = EXCLUDED.custom_attributes`,
            [
                part.part_number,
                part.serial_number,
                part.part_name,
                part.description,
                part.category,
                part.manufacturer,
                part.model_compatibility,
                part.quantity || 0,
                part.location,
                part.stock_status,
                part.reorder_point,
                part.supplier_name,
                part.supplier_part_number,
                part.supplier_contact,
                part.supplier_cost,
                part.latest_lead_time_received,
                part.retail_price,
                part.last_sold_date,
                part.sales_frequency,
                part.condition,
                part.image_url,
                part.attachment_files,
                part.date_added || new Date().toISOString().split('T')[0],
                part.last_updated || new Date().toISOString().split('T')[0],
                part.usage_rate,
                part.inventory_turnover,
                part.tags,
                part.custom_attributes || {}
            ]
        );
        res.status(201).send('Part added');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/csv', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM inventory');
        const headers = [
            'part_number', 'serial_number', 'part_name', 'description', 'category',
            'manufacturer', 'model_compatibility', 'quantity', 'location', 'stock_status',
            'reorder_point', 'supplier_name', 'supplier_part_number', 'supplier_contact',
            'supplier_cost', 'latest_lead_time_received', 'retail_price', 'last_sold_date',
            'sales_frequency', 'condition', 'image_url', 'attachment_files', 'date_added',
            'last_updated', 'usage_rate', 'inventory_turnover', 'tags', 'custom_attributes'
        ];
        let csv = headers.join(',') + '\n';
        result.rows.forEach(row => {
            const values = headers.map(h => {
                const val = row[h];
                if (h === 'custom_attributes') return JSON.stringify(val);
                return val ? `"${val.toString().replace(/"/g, '""')}"` : '';
            });
            csv += values.join(',') + '\n';
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory.csv');
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/upload', upload.fields([
    { name: 'mainCsv', maxCount: 1 },
    { name: 'retailCsv', maxCount: 1 },
    { name: 'imageZip', maxCount: 1 }
]), async (req, res) => {
    try {
        const mainCsv = req.files?.mainCsv?.[0];
        const retailCsv = req.files?.retailCsv?.[0];
        const imageZip = req.files?.imageZip?.[0];
        if (!mainCsv) return res.status(400).json({ message: 'Main CSV required' });

        const mainParts = [];
        await pipelineAsync(
            createReadStream(mainCsv.path),
            csv(),
            async function* (source) {
                for await (const row of source) {
                    mainParts.push({
                        part_number: row.SKU,
                        part_name: row['Item Name'],
                        description: row.Description,
                        manufacturer: row.Brand,
                        supplier_cost: parseFloat(row.DEALER) || null,
                        category: row.Category || 'Uncategorized',
                        supplier_name: row.Supplier || 'BMF Co.',
                        custom_attributes: {
                            weight: row['Weight (lbs)'],
                            length: row['Length (in)'],
                            width: row['Width (in)'],
                            height: row['Height (in)']
                        }
                    });
                }
            }
        );

        const retailParts = {};
        if (retailCsv) {
            await pipelineAsync(
                createReadStream(retailCsv.path),
                csv(),
                async function* (source) {
                    for await (const row of source) {
                        retailParts[row.SKU] = { retail_price: parseFloat(row.RETAIL) || null };
                    }
                }
            );
        }

        const imageUrls = {};
        if (imageZip) {
            const zipDir = path.join(__dirname, '..', '..', 'uploads', Date.now().toString());
            await fs.mkdir(zipDir, { recursive: true });
            await new Promise((resolve, reject) => {
                createReadStream(imageZip.path)
                    .pipe(unzipper.Extract({ path: zipDir }))
                    .on('close', resolve)
                    .on('error', reject);
            });

            const walkDir = async dir => {
                const files = await fs.readdir(dir, { withFileTypes: true });
                for (const file of files) {
                    const fullPath = path.join(dir, file.name);
                    if (file.isDirectory()) {
                        await walkDir(fullPath);
                    } else if (file.name.endsWith('.jpg')) {
                        const partNumber = path.basename(file.name, '.jpg');
                        const destPath = path.join(__dirname, '..', '..', 'public', 'images', file.name);
                        await fs.mkdir(path.dirname(destPath), { recursive: true });
                        await fs.copyFile(fullPath, destPath);
                        imageUrls[partNumber] = `/images/${file.name}`;
                    }
                }
            };
            await walkDir(zipDir);
            await fs.rm(zipDir, { recursive: true, force: true });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const part of mainParts) {
                if (!part.part_number || !part.category || !part.supplier_name) {
                    console.warn(`Skipping part: Missing required fields`, part);
                    continue;
                }
                const mergedPart = {
                    ...part,
                    retail_price: retailParts[part.part_number]?.retail_price,
                    image_url: imageUrls[part.part_number],
                    stock_status: part.quantity > 0 ? 'In Stock' : 'Supplier-Sourced',
                    date_added: new Date().toISOString().split('T')[0],
                    last_updated: new Date().toISOString().split('T')[0]
                };
                await client.query(
                    `INSERT INTO inventory (
                        part_number, part_name, description, category, manufacturer,
                        supplier_cost, retail_price, image_url, stock_status, date_added,
                        last_updated, custom_attributes, supplier_name
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT (part_number) DO UPDATE SET
                        part_name = EXCLUDED.part_name,
                        description = EXCLUDED.description,
                        category = EXCLUDED.category,
                        manufacturer = EXCLUDED.manufacturer,
                        supplier_cost = EXCLUDED.supplier_cost,
                        недовольство retail_price = EXCLUDED.retail_price,
                        image_url = EXCLUDED.image_url,
                        stock_status = EXCLUDED.stock_status,
                        date_added = EXCLUDED.date_added,
                        last_updated = EXCLUDED.last_updated,
                        custom_attributes = EXCLUDED.custom_attributes,
                        supplier_name = EXCLUDED.supplier_name`,
                    [
                        mergedPart.part_number,
                        mergedPart.part_name,
                        mergedPart.description,
                        mergedPart.category,
                        mergedPart.manufacturer,
                        mergedPart.supplier_cost,
                        mergedPart.retail_price,
                        mergedPart.image_url,
                        mergedPart.stock_status,
                        mergedPart.date_added,
                        mergedPart.last_updated,
                        mergedPart.custom_attributes,
                        mergedPart.supplier_name
                    ]
                );
            }
            await client.query('COMMIT');
            res.json({ message: `Imported ${mainParts.length} parts` });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ message: 'Upload failed' });
        } finally {
            client.release();
            if (mainCsv) await fs.unlink(mainCsv.path);
            if (retailCsv) await fs.unlink(retailCsv.path);
            if (imageZip) await fs.unlink(imageZip.path);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;