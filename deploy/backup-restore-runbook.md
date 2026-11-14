# Backup and Restore Runbook (Synology NAS & Local Docker)

## 1. Automated Daily PostgreSQL Backup
Run via Synology Task Scheduler (cron at 03:00 GST daily):

```bash
#!/bin/bash
BACKUP_DIR="/volume1/backups/jewelleray/db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

sudo docker exec jewelleray_postgres pg_dump -U postgres jewelleray | gzip > "$BACKUP_DIR/jewelleray_backup_${TIMESTAMP}.sql.gz"

# Retain last 30 days of backups (UAE regulatory compliance)
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```

## 2. Restore Procedure

To restore the database from a backup file:

```bash
# 1. Stop web worker
sudo docker-compose -f docker-compose.prod.yml stop web

# 2. Decompress and restore into postgres
gunzip -c /volume1/backups/jewelleray/db/jewelleray_backup_YYYYMMDD_HHMMSS.sql.gz | sudo docker exec -i jewelleray_postgres psql -U postgres -d jewelleray

# 3. Restart web container
sudo docker-compose -f docker-compose.prod.yml start web
```

## 3. Storage Vault Backup
Private image assets in `/volume1/docker/jewelleray/data/storage` can be backed up automatically using Synology Hyper Backup to Synology C2 or local external drive.
