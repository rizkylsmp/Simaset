# Diagram PlantUML BAB V SIMASET

Folder ini berisi sumber diagram PlantUML untuk melengkapi `BAB-V-SIMASET-DRAFT.md`.

## Cara Render

Jika PlantUML sudah terpasang:

```powershell
plantuml -tpng -o ..\gambar documents\bab5\plantuml\*.puml
```

Untuk output SVG:

```powershell
plantuml -tsvg -o ..\gambar documents\bab5\plantuml\*.puml
```

Hasil render dapat dimasukkan ke dokumen Word sebagai gambar sesuai nomor gambar pada BAB V.

## Daftar File

| File | Keterangan |
| ---- | ---------- |
| `gambar-5-01-proses-bisnis-sebelum-simaset.puml` | Proses Bisnis Sebelum SIMASET |
| `gambar-5-02-proses-bisnis-setelah-simaset.puml` | Proses Bisnis Setelah SIMASET |
| `gambar-5-03-use-case-simaset.puml` | Use Case Diagram SIMASET |
| `gambar-5-04-dfd-simaset.puml` | Data Flow Diagram (DFD) Level 0 SIMASET |
| `gambar-5-05-activity-login-mfa.puml` | Activity Diagram Login dan MFA |
| `gambar-5-06-activity-kelola-aset.puml` | Activity Diagram Mengelola Data Aset |
| `gambar-5-07-activity-substansi-bpn.puml` | Activity Diagram Mengelola Data Substansi BPN |
| `gambar-5-08-activity-pusat-data-bpkad.puml` | Activity Diagram Mengelola Pusat Data BPKAD |
| `gambar-5-09-activity-peta-interaktif.puml` | Activity Diagram Peta Interaktif |
| `gambar-5-10-activity-permintaan-sewa.puml` | Activity Diagram Permintaan Sewa |
| `gambar-5-11-activity-sewa-aset.puml` | Activity Diagram Pengelolaan Sewa Aset |
| `gambar-5-12-activity-backup-restore.puml` | Activity Diagram Backup dan Restore Data |
| `gambar-5-13-class-diagram-simaset.puml` | Class Diagram SIMASET |
| `gambar-5-14-erd-simaset.puml` | Entity Relationship Diagram (ERD) SIMASET |
| `gambar-5-15-sequence-login.puml` | Sequence Diagram Login |
| `gambar-5-16-sequence-kelola-aset.puml` | Sequence Diagram Kelola Data Aset |
| `gambar-5-17-sequence-peta-interaktif.puml` | Sequence Diagram Peta Interaktif |
| `gambar-5-18-sequence-permintaan-sewa.puml` | Sequence Diagram Permintaan Sewa Publik |
| `gambar-5-19-sequence-pengelolaan-sewa.puml` | Sequence Diagram Pengelolaan Sewa Aset |
| `gambar-5-20-sequence-backup.puml` | Sequence Diagram Backup Data |
