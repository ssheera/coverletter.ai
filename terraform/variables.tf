variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "s3_bucket_name" {
  description = "S3 bucket name"
  type        = string
  default     = "s3-coverletter-ai"
}

variable "rds_db_name" {
  description = "RDS database name"
  type        = string
  default     = "coverletter_ai_db"
}

variable "rds_username" {
  description = "RDS username"
  type        = string
  default     = "username"
}

variable "rds_password" {
  description = "RDS password"
  type        = string
  default     = "password"
}