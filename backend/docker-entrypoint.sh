#!/usr/bin/env sh
set -e

if [ -n "$DATABASE_URL" ]; then
  python - <<'PY'
import os
from pathlib import Path

path = Path("alembic.ini")
if path.exists():
    lines = path.read_text(encoding="utf-8").splitlines()
    updated = []
    for line in lines:
        if line.startswith("sqlalchemy.url ="):
            updated.append(f"sqlalchemy.url = {os.environ['DATABASE_URL']}")
        else:
            updated.append(line)
    path.write_text("\n".join(updated) + "\n", encoding="utf-8")
PY
fi

set +e
MIGRATION_OUTPUT=$(alembic upgrade head 2>&1)
MIGRATION_STATUS=$?
set -e

if [ "$MIGRATION_STATUS" -ne 0 ]; then
  echo "$MIGRATION_OUTPUT"
  if echo "$MIGRATION_OUTPUT" | grep -q "Can't locate revision identified by"; then
    echo "Detected missing Alembic revision. Stamping database to current head."
    alembic stamp head
  else
    echo "Alembic migration failed."
    exit "$MIGRATION_STATUS"
  fi
fi

python - <<'PY'
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
try:
    exists = db.query(User).filter(User.username == "admin").first()
    if not exists:
        db.add(User(username="admin", hashed_password=get_password_hash("admin123")))
        db.commit()
        print("Default admin user created: admin / admin123")
    else:
        print("Default admin user already exists")
finally:
    db.close()
PY

exec uvicorn app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8000}"
