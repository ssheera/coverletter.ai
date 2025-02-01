resource "aws_security_group" "rds_security_group" {
  name        = "rds-sg"
  description = "Allow access to RDS"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


resource "aws_db_instance" "rds" {
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_name              = var.db_name
  username             = var.username
  password             = var.password
  identifier = "rds-instance"
  publicly_accessible  = true

  tags = {
    Name = "rds-instance"
  }

  vpc_security_group_ids = [aws_security_group.rds_security_group.id]

  skip_final_snapshot = true
  
  deletion_protection = true
}

output "endpoint" {
  value = aws_db_instance.rds.endpoint
}

output "db_name" {
  value = aws_db_instance.rds.db_name
}

output "username" {
  value = aws_db_instance.rds.username
}

output "password" {
  value = aws_db_instance.rds.password
}