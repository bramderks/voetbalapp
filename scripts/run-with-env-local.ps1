$ErrorActionPreference = 'Stop'
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^(?<k>[A-Za-z_][A-Za-z0-9_]*)="?(?<v>.*?)"?$') {
        $key = $matches['k']
        $val = $matches['v']
        [System.Environment]::SetEnvironmentVariable($key, $val)
    }
}
npx tsx scripts/import-postgres-data.ts
