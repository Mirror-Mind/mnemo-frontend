-- Create the mnemo user if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mnemo') THEN
        CREATE ROLE mnemo WITH LOGIN PASSWORD 'mnemo_password';
    END IF;
END
$$;

-- Create the mnemo_db database if it doesn't exist
SELECT 'CREATE DATABASE mnemo_db OWNER mnemo'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mnemo_db')\gexec

-- Grant necessary permissions to mnemo user
GRANT ALL PRIVILEGES ON DATABASE mnemo_db TO mnemo;

-- Connect to the mnemo_db database to set up extensions
\c mnemo_db

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Grant schema permissions to mnemo user
GRANT ALL ON SCHEMA public TO mnemo;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mnemo;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mnemo;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mnemo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mnemo;

-- Create indexes for better performance with vector operations
-- This can be uncommented when you have vector columns in your tables
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_embedding_cosine 
-- ON your_table_name USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- You can add any other initialization SQL here for your application 