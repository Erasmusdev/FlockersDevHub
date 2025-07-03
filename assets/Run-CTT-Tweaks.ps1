# Check for Administrator privileges
If (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(`
    [Security.Principal.WindowsBuiltInRole] "Administrator"))
{
    # Relaunch as administrator
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    Exit
}

# Run the tweak command
iwr -useb https://christitus.com/win | iex

# Pause to keep the terminal open
Write-Host "`nPress Enter to close this window..." -ForegroundColor Yellow
Read-Host
