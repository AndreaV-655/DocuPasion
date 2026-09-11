$path = 'C:\Users\sofig\OneDrive\Documentos\Default Project\DocuPasion\_src\tools\generate_doc.ps1'
$tokens = $null; $errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors)
foreach ($e in $errors) { Write-Output "PARSEERR: $($e.Message)" }
$sb = $ast.Find({ param($a) $a -is [System.Management.Automation.Language.ScriptBlockAst] }, $false)
if ($sb.ParamBlock) {
    foreach ($p in $sb.ParamBlock.Parameters) {
        $setNames = @($p.Attributes | Where-Object { $_.TypeName.Name -eq 'Parameter' } | ForEach-Object {
            foreach ($na in $_.NamedArguments) { if ($na.ParameterName -eq 'ParameterSetName') { $na.ExpressionOmitted -eq $false; $na.Argument.ToString() } }
        })
        Write-Output ("name=" + $p.Name.VariablePath.UserPath + " sets=[" + ($setNames -join ',') + "]")
    }
}