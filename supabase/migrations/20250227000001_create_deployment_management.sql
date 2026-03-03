-- deployment_management table
CREATE TABLE IF NOT EXISTS deployment_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deploy_date DATE NOT NULL,
    deploy_time TIME NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    unit_test_done BOOLEAN NOT NULL DEFAULT FALSE,
    uat_done BOOLEAN NOT NULL DEFAULT FALSE,
    precheck_done BOOLEAN NOT NULL DEFAULT FALSE,
    executor VARCHAR(255) NOT NULL DEFAULT '',
    deploy_manager VARCHAR(255) NOT NULL DEFAULT '',
    work_card_number VARCHAR(255) NOT NULL DEFAULT '',
    first_approval BOOLEAN NOT NULL DEFAULT FALSE,
    first_approver VARCHAR(255),
    second_approval BOOLEAN NOT NULL DEFAULT FALSE,
    second_approver VARCHAR(255),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    post_qc_done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_deployment_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deployment_management_updated_at
    BEFORE UPDATE ON deployment_management
    FOR EACH ROW
    EXECUTE FUNCTION update_deployment_management_updated_at();

-- index for listing/filtering
CREATE INDEX idx_deployment_management_deploy_date ON deployment_management(deploy_date DESC);
CREATE INDEX idx_deployment_management_completed ON deployment_management(completed);
