# =============================================================================
# RDS POSTGRESQL DATABASE
# =============================================================================
# Provisioned inside the VPC created above (module.vpc), in the private
# subnets, so it comes up right after the VPC/subnets are ready.
# =============================================================================

# -----------------------------------------------------------------------------
# Master password
# -----------------------------------------------------------------------------
# If var.rds_db_password is left empty (default), a secure random password
# is auto-generated. If you set var.rds_db_password (via terraform.tfvars,
# -var, or an environment variable TF_VAR_rds_db_password), that value is
# used instead.
# -----------------------------------------------------------------------------
resource "random_password" "rds_password" {
  length           = 20
  special          = true
  override_special = "!#$%^&*()-_=+[]{}<>:?"
}

locals {
  rds_final_password = var.rds_db_password != "" ? var.rds_db_password : random_password.rds_password.result
}

# -----------------------------------------------------------------------------
# DB Subnet Group - places RDS in the private subnets of the VPC
# -----------------------------------------------------------------------------
resource "aws_db_subnet_group" "rds" {
  name       = "${local.cluster_name}-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = merge(local.common_tags, {
    Name = "${local.cluster_name}-rds-subnet-group"
  })
}

# -----------------------------------------------------------------------------
# Security Group - allows PostgreSQL access only from inside the VPC / EKS
# -----------------------------------------------------------------------------
resource "aws_security_group" "rds" {
  name        = "${local.cluster_name}-rds-sg"
  description = "Allow PostgreSQL access to RDS from within the VPC and EKS cluster"
  vpc_id      = module.vpc.vpc_id

  tags = merge(local.common_tags, {
    Name = "${local.cluster_name}-rds-sg"
  })
}

resource "aws_security_group_rule" "rds_ingress_from_vpc" {
  description       = "Allow PostgreSQL access from within the VPC CIDR"
  type              = "ingress"
  from_port         = var.rds_port
  to_port           = var.rds_port
  protocol          = "tcp"
  cidr_blocks       = [module.vpc.vpc_cidr_block]
  security_group_id = aws_security_group.rds.id
}

resource "aws_security_group_rule" "rds_ingress_from_eks" {
  description              = "Allow PostgreSQL access from the EKS cluster security group"
  type                     = "ingress"
  from_port                = var.rds_port
  to_port                  = var.rds_port
  protocol                 = "tcp"
  source_security_group_id = module.retail_app_eks.cluster_security_group_id
  security_group_id        = aws_security_group.rds.id
}

resource "aws_security_group_rule" "rds_egress_all" {
  description       = "Allow all outbound traffic from RDS"
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.rds.id
}

# -----------------------------------------------------------------------------
# RDS PostgreSQL Instance
# -----------------------------------------------------------------------------
resource "aws_db_instance" "postgres" {
  identifier = "${local.cluster_name}-postgres"

  # Engine
  engine         = "postgres"
  engine_version = var.rds_engine_version

  # Sizing
  instance_class        = var.rds_instance_class
  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_type           = var.rds_storage_type
  storage_encrypted      = true

  # Database
  db_name  = var.rds_db_name
  username = var.rds_db_username
  password = local.rds_final_password
  port     = var.rds_port

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = var.rds_publicly_accessible
  multi_az                = var.rds_multi_az

  # Backups & maintenance
  backup_retention_period = var.rds_backup_retention_period
  backup_window            = var.rds_backup_window
  maintenance_window       = var.rds_maintenance_window

  # Lifecycle & protection
  skip_final_snapshot       = var.rds_skip_final_snapshot
  final_snapshot_identifier = var.rds_skip_final_snapshot ? null : "${local.cluster_name}-postgres-final-snapshot"
  deletion_protection       = var.rds_deletion_protection
  apply_immediately          = true

  # Observability
  performance_insights_enabled = var.rds_performance_insights_enabled

  tags = merge(local.common_tags, {
    Name = "${local.cluster_name}-postgres"
  })

  depends_on = [module.vpc]
}
