$path = 'C:\Users\sofig\OneDrive\Documentos\Default Project\DocuPasion\_src\tools\generate_doc.ps1'
$content = Get-Content -LiteralPath $path -Raw -Encoding UTF8
$errors = $null
$null = [System.Management.Automation.Language.Parser]::ParseFile(
    $path, [ref]$null, [ref]$errors)
if ($errors -and $errors.Count -gt 0) {
    foreach ($e in $errors) { Write-Output ("ERR: " + $e.Message + " (linea " + $e.Extent.StartLineNumber + ")") }
} else {
    Write-Output 'SINTAXIS_OK'
}