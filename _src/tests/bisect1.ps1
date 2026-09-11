param(
    [Parameter(Mandatory = $true)]
    [string[]]$Sources,
    [Parameter(Mandatory = $true)]
    [string]$Output,
    [string]$HeaderText = "",
    [string]$Title = ""
)

$ErrorActionPreference = 'Stop'

function ConvertTo-RtfText {
    param([string]$text)
    $out = [System.Text.StringBuilder]::new()
    foreach ($ch in $text.ToCharArray()) {
        $c = [int]$ch
        if ($c -lt 128) {
            switch ($ch) {
                '\' { [void]$out.Append('\\') }
                '{' { [void]$out.Append('\{') }
                '}' { [void]$out.Append('\}') }
                default { [void]$out.Append($ch) }
            }
        } else {
            if ($c -eq 160) { [void]$out.Append('\u160?') }
            else { [void]$out.Append("\u$c?") }
        }
    }
    return $out.ToString()
}

Write-Output "Bisect1 OK"