`test1.db` has been created with sqlite3 cli with the following commands :

```shell
.mode csv
.import ./test1.csv
```

The created schema shows that all types are all `text` :

```sql
CREATE TABLE IF NOT EXISTS "main"(
"col1" TEXT, "col2" TEXT, "col3" TEXT, "col4" TEXT,
 "col5" TEXT, "col6" TEXT, "col7" TEXT, "col8" TEXT,
 "col9" TEXT, "col 10" TEXT, "col11" TEXT, "col12" TEXT);
```