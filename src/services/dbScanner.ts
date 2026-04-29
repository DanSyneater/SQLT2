import sql from 'mssql';

const getPool = async (connectionString: string) => {
  if (!connectionString) {
    throw new Error('THARSTEN_DB_CONNECTION_STRING is not provided');
  }
  const config = {
    connectionString,
    options: {
      encrypt: true, 
      trustServerCertificate: true 
    }
  };
  return await sql.connect(config);
};

export async function scanDatabaseSchema(connectionString: string) {
  const pool = await getPool(connectionString);
  const tables = await pool.request().query`
    SELECT t.TABLE_SCHEMA, t.TABLE_NAME, p.rows AS ROW_COUNT
    FROM INFORMATION_SCHEMA.TABLES t
    INNER JOIN sys.tables st ON t.TABLE_NAME = st.name
    INNER JOIN sys.partitions p ON st.object_id = p.object_id
    WHERE t.TABLE_TYPE = 'BASE TABLE' AND p.index_id IN (0, 1)
    GROUP BY t.TABLE_SCHEMA, t.TABLE_NAME, p.rows`;
    
  const views = await pool.request().query`
    SELECT TABLE_SCHEMA, TABLE_NAME 
    FROM INFORMATION_SCHEMA.VIEWS`;
    
  const columns = await pool.request().query`
    SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS`;

  return {
    tables: tables.recordset || [],
    views: views.recordset || [],
    columns: columns.recordset || []
  };
}

export async function getStoredProcedures(connectionString: string) {
  const pool = await getPool(connectionString);
  return await pool.request().query`
    SELECT OBJECT_NAME(object_id) AS ProcedureName, definition
    FROM sys.sql_modules
    WHERE object_id IN (SELECT object_id FROM sys.procedures)`;
}

export async function getKeys(connectionString: string) {
  const pool = await getPool(connectionString);
  return await pool.request().query`
    SELECT 
        f.name AS ForeignKey,
        OBJECT_NAME(f.parent_object_id) AS TableName,
        COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
        OBJECT_NAME(f.referenced_object_id) AS ReferencedTableName,
        COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
    FROM sys.foreign_keys AS f
    INNER JOIN sys.foreign_key_columns AS fc
        ON f.object_id = fc.constraint_object_id;`;
}
