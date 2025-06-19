terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {}

variable "account_id" {}

resource "cloudflare_r2_bucket" "pages" {
  account_id = var.account_id
  name       = "nony-pages"
  location   = "WNAM"
}
