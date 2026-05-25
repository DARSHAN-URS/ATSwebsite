$files = Get-ChildItem -Path "src\pages" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    $original = $content

    # Fix min-heights
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[700px\]', 'min-h-[400px] lg:min-h-[700px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[500px\]', 'min-h-[300px] lg:min-h-[500px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[300px\]', 'min-h-[200px] md:min-h-[300px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[350px\]', 'min-h-[200px] md:min-h-[350px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[250px\]', 'min-h-[150px] md:min-h-[250px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)min-h-\[200px\]', 'min-h-[120px] md:min-h-[200px]'

    # Fix heights
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)h-\[700px\]', 'h-auto lg:h-[700px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)h-\[500px\]', 'h-auto lg:h-[500px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)h-\[400px\]', 'h-auto lg:h-[400px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)h-\[320px\]', 'h-auto lg:h-[320px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)h-\[280px\]', 'h-auto lg:h-[280px]'

    # Fix widths
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)w-\[500px\]', 'w-full lg:w-[500px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)w-\[400px\]', 'w-full lg:w-[400px]'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)w-\[300px\]', 'w-full lg:w-[300px]'

    # Fix grids
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)grid-cols-2', 'grid-cols-1 md:grid-cols-2'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)grid-cols-3', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)grid-cols-4', 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

    # Special handling for "grid grid-cols-1 lg:grid-cols-12" (already responsive) - ignore

    # Fix flex gaps or layouts occasionally used in hero sections
    # Avoid blanket replacing flex-row since it might be for small icons
    
    # Hero text sizes
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)text-6xl', 'text-4xl md:text-6xl'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)text-5xl', 'text-3xl md:text-5xl'
    $content = $content -replace '(?<!md:|lg:|sm:|xl:)text-4xl', 'text-2xl md:text-4xl'

    if ($original -ne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}
