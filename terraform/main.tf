terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {}
variable "account_id" {}
variable "r2_bucket_name" {}

resource "cloudflare_r2_bucket" "pages" {
  account_id = var.account_id
  name       = var.r2_bucket_name
  location   = "AUTO"
}
