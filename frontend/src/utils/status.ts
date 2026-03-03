import type { Deployment, DeploymentStatus } from "../types/deployment";

export function getDeploymentStatus(d: Deployment): DeploymentStatus {
  if (d.completed) return "완료";
  if (d.second_approval) return "2차승인";
  if (d.first_approval) return "1차승인";
  return "대기";
}
