import { createClient as createLibsqlClient } from "@libsql/client";

export interface TursoConfig {
  url?: string;
  authToken?: string;
}

function getClient(config: TursoConfig): any {
  const url = config.url || process.env.TURSO_CONNECTION_URL;
  const authToken = config.authToken || process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("Turso Database connection URL is not configured. Please provide it in the UI or set TURSO_CONNECTION_URL in the environments/secrets.");
  }

  return createLibsqlClient({
    url: url,
    authToken: authToken || "",
  });
}

export async function testTursoConnection(config: TursoConfig): Promise<{ success: boolean; message: string }> {
  let client;
  try {
    client = getClient(config);
    const rs = await client.execute("SELECT 1 as test;");
    if (rs && rs.rows && rs.rows.length > 0) {
      return {
        success: true,
        message: "Successfully connected to Turso Database! " + JSON.stringify(rs.rows[0]),
      };
    }
    return {
      success: true,
      message: "Connected to Turso, but returned no rows for 'SELECT 1;'.",
    };
  } catch (error: any) {
    console.error("Turso Connection Error:", error);
    return {
      success: false,
      message: error.message || String(error),
    };
  } finally {
    if (client) {
      try {
        // Safe close if client supports it
        // Some libsql clients might not have a close method, let's guard
        if (typeof (client as any).close === "function") {
          (client as any).close();
        }
      } catch (e) {}
    }
  }
}

export async function initializeTursoTables(config: TursoConfig): Promise<{ success: boolean; message: string }> {
  let client;
  try {
    client = getClient(config);
    
    // Create it_assets_state table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS it_assets_state (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
      );
    `);

    // Create it_assets_users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS it_assets_users (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT
      );
    `);

    // Create a demo logger table just to show structured tables work nicely
    await client.execute(`
      CREATE TABLE IF NOT EXISTS it_assets_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT,
        details TEXT,
        timestamp TEXT
      );
    `);

    // Insert a log
    await client.execute({
      sql: "INSERT INTO it_assets_logs (action, details, timestamp) VALUES (?, ?, ?);",
      args: ["INITIALIZE", "Database tables verified/initialized", new Date().toISOString()]
    });

    return {
      success: true,
      message: "Turso SQLite tables successfully initialized: 'it_assets_state', 'it_assets_users', and 'it_assets_logs'.",
    };
  } catch (error: any) {
    console.error("Turso Initialization Error:", error);
    return {
      success: false,
      message: error.message || String(error),
    };
  }
}

export async function executeTursoSql(
  config: TursoConfig,
  sql: string,
  args: any[] = []
): Promise<{ success: boolean; columns: string[]; rows: any[]; affectedRows?: number; message?: string }> {
  let client;
  try {
    client = getClient(config);
    
    const rs = await client.execute({
      sql,
      args
    });

    const columns = rs.columns || [];
    const rows = Array.from(rs.rows || []).map((row: any) => {
      // Map row values into objects if it's an array or keep it as objects/arrays
      if (Array.isArray(row)) {
        const obj: any = {};
        columns.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      }
      return row;
    });

    return {
      success: true,
      columns,
      rows,
      affectedRows: rs.rowsAffected,
      message: `Query completed successfully. Affected ${rs.rowsAffected} rows.`
    };
  } catch (error: any) {
    console.error("Turso Query Execution Error:", error);
    return {
      success: false,
      columns: [],
      rows: [],
      message: error.message || String(error)
    };
  }
}

export async function saveStateToTurso(config: TursoConfig, key: string, data: any): Promise<boolean> {
  let client;
  try {
    client = getClient(config);
    const jsonStr = JSON.stringify(data);
    const now = new Date().toISOString();

    await client.execute({
      sql: `INSERT OR REPLACE INTO it_assets_state (key, value, updated_at) VALUES (?, ?, ?);`,
      args: [key, jsonStr, now]
    });

    // Write a log
    await client.execute({
      sql: "INSERT INTO it_assets_logs (action, details, timestamp) VALUES (?, ?, ?);",
      args: ["SAVE_STATE", `State saved under key '${key}'`, now]
    });

    return true;
  } catch (error) {
    console.error("Error saving state to Turso:", error);
    return false;
  }
}

export async function fetchStateFromTurso(config: TursoConfig, key: string): Promise<any | null> {
  let client;
  try {
    client = getClient(config);
    const rs = await client.execute({
      sql: `SELECT value FROM it_assets_state WHERE key = ?;`,
      args: [key]
    });

    if (rs && rs.rows && rs.rows.length > 0) {
      const val = rs.rows[0].value || (rs.rows[0] as any)[0];
      if (typeof val === "string") {
        return JSON.parse(val);
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching state from Turso:", error);
    return null;
  }
}
