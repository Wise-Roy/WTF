-- Work page PDFs (3 entries of {title, url} stored as jsonb array in footer_settings)
ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS work_pdfs jsonb NOT NULL DEFAULT '[{"title":"","url":""},{"title":"","url":""},{"title":"","url":""}]';
