param(
    [Parameter(Mandatory = $true)]
    [string[]]$Sources,
    [Parameter(Mandatory = $true)]
    [string]$Output,
    [string]$HeaderText = "",
    [string]$Title = ""
)
Write-Output "SOURCES=$($Sources -join ',')"
Write-Output "OUTPUT=$Output"
Write-Output "HEADER=$HeaderText"