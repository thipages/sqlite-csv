# sqlite-csv
Load csv files in sqlite databases with the right types and some stats via `sqlite3 cli`.

It requires [sqlite3](https://www.sqlite.org/download.html) >= 3.36.0  (REGEXP support) installed on the OS.

## What it does
- Loads the csv file into sqlite
- Defines types (`text`, `real` or `integer`) at the schema level
  - zero leading integers are considered as `text`
  - dot is used for identifying  `real` data
  - precedence order is computed as followed : `text` > `real` > `integer`
- Replaces empty values by `null` values
- Defines or create if not specified a primary key
- Creates a table with basic statistics for each field

## NPX usage
npx command will load in `dbname` all csv files present in the folder where npx is run. Tables names match `csv` file names along stats tables suffixed with `_stats`. Delimiter is automatically detected but restricted to
- the first line of the `csv` file
- comma and semi-colon

```shell
npx @titsoft/sqlite-csv dbname
```

## ESM usage
via `npm i @titsoft/sqlite-csv`
```javascript
import {importCsv} from '@titsoft/sqlite-csv'
const stats = await importCsv(dbPath, csvPath, options)
```
### Options object
- `separator`:  csv separator, default `','`
- `csvTable`: name of the imported csv table, default `'main'`
- `statsTable`: name of the stats table, default `'main_stats'`,
- `primaryKey`: name of the primary key, default `id`

### `importCsv` returned value
returns an array of object
- `field`  one of the field
- `type` 0 | 1 | 2
- `sType` text | real | integer
- `distinct` number of distinct values (null not counted)
- `null`: number of null values
- `min` min field value
- `max` max field value
- `avg` average field value
- `total` total number of records

Notes
- `min`, `max` and `avg` are length-based for `text` type
- `min`, `max`, `avg`, `distinct` computation discards `null` values
- `type` and `sType` represents the same descriptor





