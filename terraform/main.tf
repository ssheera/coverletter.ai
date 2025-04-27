module "s3_bucket" {
  source = "./modules/s3"
  s3_bucket_name = var.s3_bucket_name
}

# module "rds" {
#   source = "./modules/rds"
#   db_name = var.rds_db_name
#   username = var.rds_username
#   password = var.rds_password
# }
#
# output "RDS_ENDPOINT" {
#   description = "The endpoint of the RDS instance"
#   value       = module.rds.endpoint
#   sensitive   = false
# }
#
# output "RDS_DATABASE" {
#   description = "The database name"
#   value       = module.rds.db_name
#   sensitive   = false
# }
#
# output "RDS_USERNAME" {
#   description = "The database username"
#   value       = module.rds.username
#   sensitive   = false
# }
#
# output "RDS_PASSWORD" {
#   description = "The database password"
#   value       = module.rds.password
#   sensitive   = true
# }

output "AWS_BUCKET_NAME" {
  description = "The name of the S3 bucket"
  value       = module.s3_bucket.s3_bucket_name
  sensitive   = false
}