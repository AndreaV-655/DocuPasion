$path = 'C:\Users\sofig\OneDrive\Documentos\Default Project\DocuPasion\_src\tools\generate_doc.ps1'
$tokens = $null; $errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($path, [ref]$tokens, [ref]$errors)
$scriptBlockAst = $ast.Find({ param($a) $a -is [System.Management.Automation.Language.ScriptBlockAst] }, $false)
if ($scriptBlockAst.ParamBlock) {
    foreach ($p in $scriptBlockAst.ParamBlock.Parameters) {
        $nameLine = $p.Extent.StartLineNumber
        $attr = $p.Attributes | ForEach-Object { $_.TypeName.Name } 
        Write-Output ("PARAM line=$nameLine name=" + $p.Name.VariablePath.UserPath)
    }
} else {
    Write-Output 'NO_PARAM_BLOCK_AT_TOP'
}