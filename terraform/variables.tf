# =============================================================================
# INPUT VARIABLES
# =============================================================================

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "exam-board"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.33"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "argocd_namespace" {
  description = "Namespace to install ArgoCD"
  type        = string
  default     = "argocd"
}

variable "argocd_chart_version" {
  description = "ArgoCD Helm chart version"
  type        = string
  default     = "5.51.6"
}

variable "enable_single_nat_gateway" {
  description = "Use single NAT gateway to reduce costs (not recommended for production)"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Enable monitoring stack (Prometheus, Grafana)"
  type        = bool
  default     = false
}

# =============================================================================
# RDS (POSTGRESQL) VARIABLES
# =============================================================================

variable "rds_engine_version" {
  description = "PostgreSQL engine version for the RDS instance"
  type        = string
  default     = "16"
}

variable "rds_instance_class" {
  description = "Instance class/type for the RDS PostgreSQL instance"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Initial allocated storage (in GB) for the RDS instance"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum storage (in GB) RDS can autoscale to (0 disables storage autoscaling)"
  type        = number
  default     = 100
}

variable "rds_storage_type" {
  description = "Storage type for the RDS instance"
  type        = string
  default     = "gp3"
}

variable "rds_db_name" {
  description = "Name of the initial PostgreSQL database to create"
  type        = string
  default     = "examboard"
}

variable "rds_db_username" {
  description = "Master username for the RDS PostgreSQL instance"
  type        = string
  default     = "examboard_admin"
}

variable "rds_db_password" {
  description = "Master password for the RDS PostgreSQL instance. Leave empty to auto-generate a random secure password."
  type        = string
  default     = ""
  sensitive   = true
}

variable "rds_port" {
  description = "Port on which the RDS PostgreSQL instance listens"
  type        = number
  default     = 5432
}

variable "rds_multi_az" {
  description = "Whether to deploy the RDS instance across multiple Availability Zones"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "Number of days to retain automated RDS backups"
  type        = number
  default     = 7
}

variable "rds_backup_window" {
  description = "Preferred backup window for the RDS instance (UTC)"
  type        = string
  default     = "03:00-04:00"
}

variable "rds_maintenance_window" {
  description = "Preferred maintenance window for the RDS instance (UTC)"
  type        = string
  default     = "mon:04:30-mon:05:30"
}

variable "rds_skip_final_snapshot" {
  description = "Whether to skip the final DB snapshot when the RDS instance is destroyed"
  type        = bool
  default     = true
}

variable "rds_deletion_protection" {
  description = "Whether to enable deletion protection on the RDS instance"
  type        = bool
  default     = false
}

variable "rds_publicly_accessible" {
  description = "Whether the RDS instance should have a publicly accessible endpoint"
  type        = bool
  default     = false
}

variable "rds_performance_insights_enabled" {
  description = "Whether to enable Performance Insights on the RDS instance"
  type        = bool
  default     = false
}
