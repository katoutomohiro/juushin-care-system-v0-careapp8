SELECT
    schemaname,
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    schemaname = 'public';

-- care_receivers actual columns (schema check)
SELECT
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name = 'care_receivers'
ORDER BY
    ordinal_position;
