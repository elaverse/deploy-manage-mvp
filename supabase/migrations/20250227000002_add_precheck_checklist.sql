-- precheck_checklist JSONB column for deployment checklist items
ALTER TABLE deployment_management
ADD COLUMN IF NOT EXISTS precheck_checklist JSONB DEFAULT '[]';
