import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, 'clinic.db'));
db.pragma('journal_mode = WAL');

// Initialize Database Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birthDate TEXT,
    plan TEXT,
    pathology TEXT,
    medication TEXT,
    secondaryPhone TEXT,
    relationship TEXT,
    status TEXT DEFAULT 'Ativo',
    lastVisit TEXT DEFAULT 'Novo',
    appointmentDate TEXT,
    attendanceStatus TEXT DEFAULT 'Pendente'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    patientName TEXT,
    type TEXT,
    status TEXT,
    value REAL,
    date TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS scheduling_rules (
    id TEXT PRIMARY KEY,
    criteria TEXT,
    value TEXT,
    patientName TEXT,
    daysAfter INTEGER
  );
`);

// Migration: Add new columns if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(patients)").all() as any[];
const hasAppointmentDate = tableInfo.some(col => col.name === 'appointmentDate');
const hasAttendanceStatus = tableInfo.some(col => col.name === 'attendanceStatus');

if (!hasAppointmentDate) {
  db.prepare("ALTER TABLE patients ADD COLUMN appointmentDate TEXT").run();
}
if (!hasAttendanceStatus) {
  db.prepare("ALTER TABLE patients ADD COLUMN attendanceStatus TEXT DEFAULT 'Pendente'").run();
}

// Seed initial settings if empty
const settingsCount = db.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
if (settingsCount.count === 0) {
  const insertSetting = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('clinicName', 'ClinicFlow');
  insertSetting.run('birthdayMessage', 'Olá {nome}, feliz aniversário! Desejamos muita saúde e paz.');
  insertSetting.run('reminderMessage', 'Olá {nome}, lembrete de sua consulta amanhã às {horario}.');
  insertSetting.run('autoBirthday', 'true');
  insertSetting.run('birthdayTime', '09:00');
  insertSetting.run('autoReminder', 'true');
  insertSetting.run('daysAfter', '1');
  insertSetting.run('scheduledTime', '09:00');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Patients ---
  app.get('/api/patients', (req, res) => {
    console.log('GET /api/patients requested');
    try {
      const patients = db.prepare('SELECT * FROM patients').all();
      res.json(patients);
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/patients/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    const patients = db.prepare('SELECT id, name FROM patients WHERE name LIKE ? LIMIT 10').all(`%${q}%`);
    res.json(patients);
  });

  app.post('/api/patients', (req, res) => {
    const patient = req.body;
    
    if (!patient.name) {
      return res.status(400).json({ error: 'O nome do paciente é obrigatório.' });
    }

    const stmt = db.prepare(`
      INSERT INTO patients (id, name, email, phone, birthDate, plan, pathology, medication, secondaryPhone, relationship, status, lastVisit, appointmentDate, attendanceStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    try {
      stmt.run(
        patient.id || Math.random().toString(36).substr(2, 9),
        patient.name,
        patient.email || null,
        patient.phone || null,
        patient.birthDate || null,
        patient.plan || 'Particular',
        patient.pathology || null,
        patient.medication || null,
        patient.secondaryPhone || null,
        patient.relationship || null,
        patient.status || 'Ativo',
        patient.lastVisit || 'Novo',
        patient.appointmentDate || null,
        patient.attendanceStatus || 'Pendente'
      );
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    const patient = req.body;

    if (!patient.name) {
      return res.status(400).json({ error: 'O nome do paciente é obrigatório.' });
    }

    const stmt = db.prepare(`
      UPDATE patients SET 
        name = ?, email = ?, phone = ?, birthDate = ?, plan = ?, 
        pathology = ?, medication = ?, secondaryPhone = ?, relationship = ?, 
        status = ?, lastVisit = ?, appointmentDate = ?, attendanceStatus = ?
      WHERE id = ?
    `);
    try {
      stmt.run(
        patient.name,
        patient.email || null,
        patient.phone || null,
        patient.birthDate || null,
        patient.plan || 'Particular',
        patient.pathology || null,
        patient.medication || null,
        patient.secondaryPhone || null,
        patient.relationship || null,
        patient.status || 'Ativo',
        patient.lastVisit || 'Novo',
        patient.appointmentDate || null,
        patient.attendanceStatus || 'Pendente',
        id
      );
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating patient:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/patients/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM patients WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Transactions ---
  app.get('/api/transactions', (req, res) => {
    try {
      const transactions = db.prepare('SELECT * FROM transactions ORDER BY date DESC').all();
      res.json(transactions);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/transactions', (req, res) => {
    const t = req.body;
    const stmt = db.prepare(`
      INSERT INTO transactions (id, patientName, type, status, value, date, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    try {
      stmt.run(
        t.id || Math.random().toString(36).substr(2, 9),
        t.patientName,
        t.type,
        t.status,
        t.value,
        t.date,
        t.description
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const t = req.body;
    // Only update fields that are provided
    const updates = [];
    const values = [];
    
    if (t.status !== undefined) { updates.push('status = ?'); values.push(t.status); }
    if (t.value !== undefined) { updates.push('value = ?'); values.push(t.value); }
    
    if (updates.length === 0) return res.json({ success: true });
    
    values.push(id);
    const sql = `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      db.prepare(sql).run(...values);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Settings ---
  app.get('/api/settings', (req, res) => {
    const rows = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
    const settings: Record<string, string> = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  });

  app.post('/api/settings', (req, res) => {
    const settings = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    const updateMany = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        stmt.run(key, String(value));
      }
    });
    try {
      updateMany(settings);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Scheduling Rules ---
  app.get('/api/scheduling-rules', (req, res) => {
    const rules = db.prepare('SELECT * FROM scheduling_rules').all();
    res.json(rules);
  });

  app.post('/api/scheduling-rules', (req, res) => {
    const rule = req.body;
    const stmt = db.prepare(`
      INSERT INTO scheduling_rules (id, criteria, value, patientName, daysAfter)
      VALUES (?, ?, ?, ?, ?)
    `);
    try {
      stmt.run(
        rule.id || Math.random().toString(36).substr(2, 9),
        rule.criteria,
        rule.value,
        rule.patientName,
        rule.daysAfter
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/scheduling-rules/:id', (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM scheduling_rules WHERE id = ?').run(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Backup ---
  app.get('/api/backup', (req, res) => {
    try {
      const patients = db.prepare('SELECT * FROM patients').all();
      const transactions = db.prepare('SELECT * FROM transactions').all();
      const settings = db.prepare('SELECT * FROM settings').all();
      const rules = db.prepare('SELECT * FROM scheduling_rules').all();

      const backupData = {
        timestamp: new Date().toISOString(),
        patients,
        transactions,
        settings,
        scheduling_rules: rules
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=clinic_backup_${new Date().toISOString().split('T')[0]}.json`);
      res.json(backupData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 404 for API routes - prevent falling through to SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    
    // SPA Fallback for production
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
