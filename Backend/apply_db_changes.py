import sqlite3
import os

databases = ["assignflow.db", "iilm_assignflow.db"]

for db_name in databases:
    if not os.path.exists(db_name):
        print(f"Database {db_name} not found. Skipping.")
        continue

    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        
        # Check if marks_obtained exists
        cursor.execute("PRAGMA table_info(submissions)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if not columns:
            print(f"Table 'submissions' does not exist in {db_name}. Skipping column addition.")
            continue

        updated = False
        if "marks_obtained" not in columns:
            cursor.execute("ALTER TABLE submissions ADD COLUMN marks_obtained INTEGER")
            print(f"Added marks_obtained to {db_name}")
            updated = True
        
        if "evaluated_at" not in columns:
            cursor.execute("ALTER TABLE submissions ADD COLUMN evaluated_at DATETIME")
            print(f"Added evaluated_at to {db_name}")
            updated = True
            
        # Update default status for existing records to 'pending' if it was 'submitted'
        cursor.execute("UPDATE submissions SET status = 'pending' WHERE status = 'submitted'")
        if cursor.rowcount > 0:
            print(f"Updated status to 'pending' for {cursor.rowcount} rows in {db_name}")
            updated = True
            
        conn.commit()
        conn.close()
        
        if not updated:
            print(f"Database {db_name} was already up-to-date.")
    except Exception as e:
        print(f"Error updating {db_name}: {e}")
