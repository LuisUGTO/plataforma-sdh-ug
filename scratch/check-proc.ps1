Get-Process | Where-Object { $_.ProcessName -match "Acrobat|AcroRd32|msedge" } | Select-Object Id, ProcessName, MainWindowTitle
