# Run AFTER closing Cursor (or it may fail on locked folders).
# Removes stale Cursor worktree copies under .cursor\worktrees\MusicMan
$base = Join-Path $env:USERPROFILE ".cursor\worktrees\MusicMan"
if (-not (Test-Path $base)) { Write-Host "Nothing to clean."; exit 0 }
Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  cmd /c "rd /s /q `"$($_.FullName)`"" 2>&1 | Out-Null
}
if (Test-Path $base) {
  $left = Get-ChildItem $base -ErrorAction SilentlyContinue
  if ($left) { Write-Host "Still locked (close Cursor and retry): $($left.Name -join ', ')" } else { Remove-Item $base -Force -ErrorAction SilentlyContinue }
}
Write-Host "Done."
