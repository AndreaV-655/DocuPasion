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
        switch ($ch) {
            '\' { [void]$out.Append('\\') }
            '{' { [void]$out.Append('\{') }
            '}' { [void]$out.Append('\}') }
            default { [void]$out.Append($ch) }
        }
    }
    return $out.ToString()
}

$titlePage = @'
\rtf1\ansi\ansicpg1252\deff0
{\fonttbl{\f0\froman\fcharset0 Times New Roman;}{\f1\fswiss\fcharset0 Arial;}{\f2\fmodern\fcharset0 Courier New;}}
{\colortbl ;\red0\green0\blue0;}
\paperw11906\paperh16838\margl1134\margr1134\margt1134\margb1134
'@

Write-Output "Bisect2 OK"