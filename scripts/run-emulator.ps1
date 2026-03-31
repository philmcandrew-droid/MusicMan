<#
.SYNOPSIS
  Starts the Android Emulator with a cold boot (avoids missing/corrupt default_boot snapshot errors).

.PARAMETER AvdName
  Name of the AVD (default: MusicMan_API34).

.EXAMPLE
  .\scripts\run-emulator.ps1
  .\scripts\run-emulator.ps1 -AvdName Pixel_6_API_34
#>
param(
  [string] $AvdName = 'MusicMan_API34',
  [switch] $NoColdBoot
)

$ErrorActionPreference = 'Stop'
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$emu = Join-Path $sdk 'emulator\emulator.exe'
if (-not (Test-Path $emu)) {
  Write-Error "Emulator not found at $emu. Set ANDROID_HOME or install Android SDK Emulator."
}

$args = @('-avd', $AvdName, '-netdelay', 'none', '-netspeed', 'full')
if (-not $NoColdBoot) {
  # Skip loading snapshots; fixes "Device 'cache' does not have the requested snapshot 'default_boot'"
  $args = @('-no-snapshot-load') + $args
}

Write-Host "Starting: $emu $($args -join ' ')"
Start-Process -FilePath $emu -ArgumentList $args -WorkingDirectory (Split-Path $emu)
