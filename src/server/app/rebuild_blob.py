from app.catalog.utils import normalize, to_latin, to_cyrillic
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="realsite",
    user="realsite_api",
    password="1234"
)

cur = conn.cursor()

cur.execute("SELECT id, name FROM products")
rows = cur.fetchall()

for pid, name in rows:
    base = normalize(name)

    latin = normalize(to_latin(name))
    cyr = normalize(to_cyrillic(base))

    blob = f"{base} {latin} {cyr}"

    cur.execute(
        "UPDATE products SET normalized_blob = %s WHERE id = %s",
        (blob, pid)
    )

conn.commit()
cur.close()
conn.close()

print("DONE")