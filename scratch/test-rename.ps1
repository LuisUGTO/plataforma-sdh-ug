try {
    Move-Item -Path "c:\Proyectos\plataforma-sdh-ug\Infografias_nuevas_2026-11-03\SDH_000_Mapa_Global_A2.pdf" -Destination "c:\Proyectos\plataforma-sdh-ug\Infografias_nuevas_2026-11-03\SDH_000_Mapa_Global_A2_old.pdf" -Force
    Write-Output "Renamed successfully"
} catch {
    Write-Output "Cannot rename: $($_.Exception.Message)"
}
