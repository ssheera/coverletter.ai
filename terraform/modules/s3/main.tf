resource "aws_s3_bucket" "bucket" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "coverLetter.ai"
    Environment = "production"
  }
}

resource "aws_s3_object" "coverLetter_prompt_file" {
  bucket = aws_s3_bucket.bucket.bucket
  key    = "uploads/coverLetter_prompt"
  source = "${path.module}/uploads/coverLetter_prompt.txt"
  acl    = "private"

  etag = filemd5("${path.module}/uploads/coverLetter_prompt.txt")
}

resource "aws_s3_object" "resumeData_prompt_file" {
  bucket = aws_s3_bucket.bucket.bucket
  key    = "uploads/resumeData_prompt"
  source = "${path.module}/uploads/resumeData_prompt.txt"
  acl    = "private"

  etag = filemd5("${path.module}/uploads/resumeData_prompt.txt")
}


resource "aws_s3_object" "rewrite_prompt_file" {
  bucket = aws_s3_bucket.bucket.bucket
  key    = "uploads/rewrite_prompt"
  source = "${path.module}/uploads/rewrite_prompt.txt"
  acl    = "private"

  etag = filemd5("${path.module}/uploads/rewrite_prompt.txt")
}


output "s3_bucket_name" {
  value = aws_s3_bucket.bucket.bucket
}