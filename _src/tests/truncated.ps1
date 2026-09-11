param(
    [Parameter(Mandatory = $true)]
    [string[]]$Sources,
    [Parameter(Mandatory = $true)]
    [string]$Output,
    [string]$HeaderText = "",
    [string]$Title = ""
)
Write-Output "Truncated script OK: $($Sources -join ',') -> $Output"