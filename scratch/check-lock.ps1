try {
    $stream = [System.IO.File]::Open("c:\Proyectos\plataforma-sdh-ug\Infografias_nuevas_2026-11-03\SDH_000_Mapa_Global_A2.pdf", [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
    $stream.Close()
    Write-Output "File is NOT locked now."
} catch {
    Write-Output "File is locked: $($_.Exception.Message)"
}
