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
            else { [void]$out.Append("\u${c}?") }
        }
    }
    return $out.ToString()
}

function Get-TableCells {
    param([string]$line)
    $line = $line.Trim().Substring(5)  # quita "@HDR " o "@ROW "
    return @($line -split '\|' | ForEach-Object { $_.Trim() })
}

function Write-RtfTable {
    param([string[]]$rows, [int]$headerRow = 0, [bool]$hasHeader = $false)
    $startIdx = 0
    $headerCells = @()
    $colHeads = @()
    if ($hasHeader) {
        $headerCells = Get-TableCells -line $rows[0]
        $startIdx = 1
        $colHeads = $headerCells
    } else {
        $first = Get-TableCells -line $rows[0]
        $colHeads = $first
    }
    $colCount = $colHeads.Count

    # Anchos relativos segun longitud del encabezado (min 300)
    $weights = @()
    foreach ($h in $colHeads) {
        $w = [Math]::Max(($h.Length * 95), 320)
        $weights += $w
    }
    $total = ($weights | Measure-Object -Sum).Sum
    $tableW = 9638
    $bounds = @()
    $acc = 0
    for ($i = 0; $i -lt $colCount; $i++) {
        $acc += [Math]::Round($tableW * ($weights[$i] / $total))
        $bounds += $acc
    }

    $borders = '\clbrdrt\brdrs\brdrw10\clbrdrl\brdrs\brdrw10\clbrdrb\brdrs\brdrw10\clbrdrr\brdrs\brdrw10'

    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.Append('\par\sb60\sa60')

    $rowIndex = 0
    for ($r = 0; $r -lt $rows.Count; $r++) {
        $cells = Get-TableCells -line $rows[$r]
        if ($cells.Count -eq 0) { continue }
        # Rellenar con vacio si faltan columnas
        while ($cells.Count -lt $colCount) { $cells += "" }
        $cellTexts = @($cells[0..($colCount - 1)])

        [void]$sb.Append('\trowd\trgaph70\trleft0')
        $cellDefs = ''
        $cellData = ''
        for ($i = 0; $i -lt $colCount; $i++) {
            $isHeaderCell = ($hasHeader -and $r -eq 0)
            $shading = ''
            if ($isHeaderCell) { $shading = '\clshdng3000' }
            $cellDefs += "$shading$borders\clvertalc\cellx$($bounds[$i])"
            $align = '\ql'
            if ($isHeaderCell) { $align = '\qc' }
            $size = '\fs18'
            $bold = ''
            if ($isHeaderCell) { $bold = '\b' }
            $cellData += "\intbl$bold$align$size " + (ConvertTo-RtfText -text $cellTexts[$i]) + "$bold\cell "
        }
        [void]$sb.Append($cellDefs)
        [void]$sb.Append(' \pard' + $cellData + '\row')
        $rowIndex++
    }
    [void]$sb.Append('\par\sb120')
    return $sb.ToString()
}

# ---- Preamble RTF ----
$titlePage = @'
\rtf1\ansi\ansicpg1252\deff0
{\fonttbl{\f0\froman\fcharset0 Times New Roman;}{\f1\fswiss\fcharset0 Arial;}{\f2\fmodern\fcharset0 Courier New;}}
{\colortbl ;\red0\green0\blue0;}
\paperw11906\paperh16838\margl1134\margr1134\margt1134\margb1134
'@

$headerBlock = ''

$sb = [System.Text.StringBuilder]::new()
[void]$sb.Append($titlePage)
[void]$sb.Append("`n\widowctrl")
[void]$sb.Append("`n{\footer\pard\qr\fs18 P\u225?gina \chpgn\par}")
if ($HeaderText) {
    $escHeader = ConvertTo-RtfText -text $HeaderText
    [void]$sb.Append("`n{\header\pard\ql\fs16\i $escHeader\i0\par}")
}
[void]$sb.Append("`n\viewkind4\uc1\pard\sectd")

foreach ($src in $Sources) {
    if (-not (Test-Path -LiteralPath $src)) { throw "No existe la fuente: $src" }
    $lines = Get-Content -LiteralPath $src -Encoding UTF8
    $inPre = $false
    $preLines = [System.Collections.Generic.List[string]]::new()
    $tableRows = [System.Collections.Generic.List[string]]::new()
    $tableHasHeader = $false

    foreach ($raw in $lines) {
        $line = $raw.Trim()
        if (-not $line) { continue }

        if ($inPre) {
            if ($line -eq '@ENDPRE') {
                $inPre = $false
                [void]$sb.Append("`n\pard\ql\par")
                foreach ($pl in $preLines) {
                    $esc = ConvertTo-RtfText -text $pl
                    [void]$sb.Append("`n{\f2\fs18 $esc}\par")
                }
                [void]$sb.Append("`n\sb120")
                $preLines.Clear()
                continue
            }
            $preLines.Add($raw)
            continue
        }

        if ($line.StartsWith('@TABLE')) {
            $tableRows.Clear()
            $tableHasHeader = $false
            continue
        }
        if ($line.StartsWith('@HDR ')) {
            $tableHasHeader = $true
            [void]$tableRows.Add($line)
            continue
        }
        if ($line.StartsWith('@ROW ')) {
            [void]$tableRows.Add($line)
            continue
        }
        if ($line.StartsWith('@ENDT')) {
            if ($tableRows.Count -gt 0) {
                $tbl = Write-RtfTable -rows $tableRows.ToArray() -hasHeader $tableHasHeader
                $sb.Append($tbl) | Out-Null
            }
            $tableRows.Clear()
            continue
        }

        switch -Wildcard ($line) {
            '@TITLE *' {
                $t = (ConvertTo-RtfText -text $line.Substring(7))
                [void]$sb.Append("`n\pard\sb2000\qc\f1\fs58\b $t\b0\fs58\par")
            }
            '@SUB *' {
                $t = (ConvertTo-RtfText -text $line.Substring(5))
                [void]$sb.Append("`n\pard\qc\f1\fs32 $t\par")
            }
            '@AUTHOR *' {
                $t = (ConvertTo-RtfText -text $line.Substring(8))
                [void]$sb.Append("`n\pard\qc\fs24 $t\par")
            }
            '@DATE *' {
                $t = (ConvertTo-RtfText -text $line.Substring(6))
                [void]$sb.Append("`n\pard\qc\fs24 $t\par")
            }
            '@SPACE *' {
                $n = [int]($line.Substring(8 - 1).Trim())  # @SPACE< n
                if ($line -match '^@SPACE\s+(\d+)$') { $n = [int]$matches[1] }
                [void]$sb.Append("`n\pard\sb$($n * 240)\sa0\par")
            }
            '@H1 *' {
                $t = (ConvertTo-RtfText -text $line.Substring(4))
                [void]$sb.Append("`n\pard\sb360\sa180\f0\fs32\b $t\b0\par")
            }
            '@H2 *' {
                $t = (ConvertTo-RtfText -text $line.Substring(4))
                [void]$sb.Append("`n\pard\sb240\sa120\f0\fs28\b $t\b0\par")
            }
            '@H3 *' {
                $t = (ConvertTo-RtfText -text $line.Substring(4))
                [void]$sb.Append("`n\pard\sb200\sa100\f0\fs24\b $t\b0\par")
            }
            '@P *' {
                $t = (ConvertTo-RtfText -text $line.Substring(3))
                [void]$sb.Append("`n\pard\sb60\sa120\fi360\sl288\slmult1 $t\par")
            }
            '@B *' {
                $t = (ConvertTo-RtfText -text $line.Substring(3))
                [void]$sb.Append("`n\pard\sb60\sa120\sl288\slmult1\b $t\b0\par")
            }
            '@C *' {
                $t = (ConvertTo-RtfText -text $line.Substring(3))
                [void]$sb.Append("`n\pard\sb60\sa120\qc\sl288\slmult1 $t\par")
            }
            '@LI *' {
                $t = (ConvertTo-RtfText -text $line.Substring(4))
                [void]$sb.Append("`n\pard\sb40\sa80\li480\fi-240\sl264\slmult1\u8226? $t\par")
            }
            '@PRE' {
                $inPre = $true
            }
            '@PB' {
                [void]$sb.Append("`n\page\par")
            }
            default {
                # Texto suelto => parrafo normal
                $t = (ConvertTo-RtfText -text $line)
                [void]$sb.Append("`n\pard\sb60\sa120 $t\par")
            }
        }
    }
}

[void]$sb.Append("`n}")
$rtf = $sb.ToString()

$outDir = Split-Path -Path $Output -Parent
if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}
# El RTF emitido es ASCII puro (unicode expresado como \uNNNN)
[System.IO.File]::WriteAllText($Output, $rtf, [System.Text.Encoding]::ASCII)
Write-Output "Documento generado: $Output ($((Get-Item -LiteralPath $Output).Length) bytes)"