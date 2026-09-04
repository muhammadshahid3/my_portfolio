# =============================================================================
# OUTPUT VALUES
# =============================================================================

# =============================================================================
# CLUSTER INFORMATION
# =============================================================================

output "cluster_name" {
  description = "Name of the EKS cluster (with unique suffix)"
  value       = module.retail_app_eks.cluster_name
}

output "cluster_name_base" {
  description = "Base cluster name without suffix"
  value       = var.cluster_name
}

output "cluster_name_suffix" {
  description = "Random suffix added to cluster name"
  value       = random_string.suffix.result
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.retail_app_eks.cluster_endpoint
}

output "cluster_version" {
  description = "The Kubernetes version for the EKS cluster"
  value       = module.retail_app_eks.cluster_version
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.retail_app_eks.cluster_security_group_id
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster for the OpenID Connect identity provider"
  value       = module.retail_app_eks.cluster_oidc_issuer_url
}

# =============================================================================
# NETWORK INFORMATION
# =============================================================================

output "vpc_id" {
  description = "ID of the VPC where the cluster is deployed"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnets" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnets
}

# =============================================================================
# ACCESS INFORMATION
# =============================================================================

output "configure_kubectl" {
  description = "Configure kubectl: make sure you're logged in with the correct AWS profile and run the following command to update your kubeconfig"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.retail_app_eks.cluster_name}"
}

output "argocd_namespace" {
  description = "Namespace where ArgoCD is installed"
  value       = var.argocd_namespace
}

output "argocd_server_port_forward" {
  description = "Command to port-forward to ArgoCD server"
  value       = "kubectl port-forward svc/argocd-server -n ${var.argocd_namespace} 8080:443"
}

output "argocd_admin_password" {
  description = "Command to get ArgoCD admin password"
  value       = "kubectl -n ${var.argocd_namespace} get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
  sensitive   = true
}

# =============================================================================
# APPLICATION ACCESS
# =============================================================================

output "ingress_nginx_loadbalancer" {
  description = "Command to get the LoadBalancer URL for accessing applications"
  value       = "kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
}

output "retail_store_url" {
  description = "Command to get the retail store application URL"
  value       = "echo 'http://'$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')"
}

# =============================================================================
# RDS (POSTGRESQL) INFORMATION
# =============================================================================

output "rds_instance_id" {
  description = "ID of the RDS PostgreSQL instance"
  value       = aws_db_instance.postgres.id
}

output "rds_instance_arn" {
  description = "ARN of the RDS PostgreSQL instance"
  value       = aws_db_instance.postgres.arn
}

output "rds_endpoint" {
  description = "Connection endpoint for the RDS PostgreSQL instance (host:port)"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "Hostname of the RDS PostgreSQL instance (without port)"
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "Port on which the RDS PostgreSQL instance listens"
  value       = aws_db_instance.postgres.port
}

output "rds_db_name" {
  description = "Name of the initial PostgreSQL database created on the RDS instance"
  value       = aws_db_instance.postgres.db_name
}

output "rds_username" {
  description = "Master username for the RDS PostgreSQL instance"
  value       = aws_db_instance.postgres.username
  sensitive   = true
}

output "rds_password" {
  description = "Master password for the RDS PostgreSQL instance (auto-generated unless var.rds_db_password is set)"
  value       = local.rds_final_password
  sensitive   = true
}

output "rds_security_group_id" {
  description = "ID of the security group attached to the RDS instance"
  value       = aws_security_group.rds.id
}

output "rds_subnet_group_name" {
  description = "Name of the DB subnet group used by the RDS instance"
  value       = aws_db_subnet_group.rds.name
}

output "rds_connection_string" {
  description = "PostgreSQL connection string for the RDS instance (password redacted)"
  value       = "postgresql://${aws_db_instance.postgres.username}:<password>@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
  sensitive   = false
}

# =============================================================================
# USEFUL COMMANDS
# =============================================================================

output "useful_commands" {
  description = "Useful commands for managing the cluster"
  value = {
    get_nodes           = "kubectl get nodes"
    get_pods_all        = "kubectl get pods -A"
    get_retail_store    = "kubectl get pods -n retail-store"
    argocd_apps         = "kubectl get applications -n ${var.argocd_namespace}"
    ingress_status      = "kubectl get ingress -A"
    describe_cluster    = "kubectl cluster-info"
  }
}
