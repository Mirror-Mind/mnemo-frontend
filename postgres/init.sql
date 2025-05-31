-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for better performance with vector operations
-- This can be uncommented when you have vector columns in your tables
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_embedding_cosine 
-- ON your_table_name USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- You can add any other initialization SQL here for your application 