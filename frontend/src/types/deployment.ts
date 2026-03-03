export interface PrecheckChecklistItem {
  category: string;
  check_item: string;
  question: string;
  verification_method: string;
  checked: boolean;
}

export interface Deployment {
  id: string;
  deploy_date: string;
  deploy_time: string;
  content: string;
  unit_test_done: boolean;
  uat_done: boolean;
  precheck_done: boolean;
  precheck_checklist?: PrecheckChecklistItem[];
  executor: string;
  deploy_manager: string;
  work_card_number: string;
  first_approval: boolean;
  first_approver: string | null;
  second_approval: boolean;
  second_approver: string | null;
  completed: boolean;
  post_qc_done: boolean;
  created_at: string;
  updated_at: string;
}

export type DeploymentStatus = "대기" | "1차승인" | "2차승인" | "완료";

export interface DeploymentCreateInput {
  deploy_date: string;
  deploy_time: string;
  content: string;
  unit_test_done: boolean;
  uat_done: boolean;
  precheck_done: boolean;
  precheck_checklist?: PrecheckChecklistItem[];
  executor: string;
  deploy_manager: string;
  work_card_number: string;
  completed?: boolean;
  post_qc_done?: boolean;
  first_approval?: boolean;
  first_approver?: string | null;
  second_approval?: boolean;
  second_approver?: string | null;
}

export interface DeploymentUpdateInput {
  precheck_checklist?: PrecheckChecklistItem[];
  deploy_date?: string;
  deploy_time?: string;
  content?: string;
  unit_test_done?: boolean;
  uat_done?: boolean;
  precheck_done?: boolean;
  executor?: string;
  deploy_manager?: string;
  work_card_number?: string;
  completed?: boolean;
  post_qc_done?: boolean;
  first_approval?: boolean;
  first_approver?: string | null;
  second_approval?: boolean;
  second_approver?: string | null;
}
