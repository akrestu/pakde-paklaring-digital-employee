<?php

namespace App\Services;

use App\Models\Employee;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class EmployeeSpreadsheetService
{
    /**
     * NRPP prefix used to mark the example row in the template. The importer
     * recognizes and skips any row whose NRPP starts with this, so nothing
     * bad happens if a user forgets to delete it before uploading.
     */
    public const EXAMPLE_NRPP = 'CONTOH001';

    /**
     * @var string[]
     */
    private const HEADERS = [
        'nrpp', 'site', 'nama', 'tempat_lahir', 'tanggal_lahir', 'alamat', 'project', 'lokasi',
        'beginning_classification', 'beginning_versatility', 'classification', 'versatility', 'doh', 'is_active',
    ];

    /**
     * @var array<int, mixed>
     */
    private const EXAMPLE_ROW = [
        self::EXAMPLE_NRPP,
        'BAU',
        'Doni (contoh)',
        'Tanjung Sakti',
        '1985-09-19',
        'Dusun Desa Senabing; RT 000 RW 000; Kel. Senabing; Kec. Lahat; Kab. Lahat; Prov. Sumatera Selatan',
        'PT. BAU',
        'Lahat',
        'Operator 3',
        'Driver DT',
        'Operator 3',
        'Driver DT, ADT A60H',
        '2022-07-23',
        1,
    ];

    public function template(): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template');
        $this->writeHeader($spreadsheet);
        $this->writeExampleRow($spreadsheet);

        return $spreadsheet;
    }

    /**
     * @param  Collection<int, Employee>  $employees
     */
    public function export(Collection $employees): Spreadsheet
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Data Karyawan');
        $this->writeHeader($spreadsheet);

        $row = 2;

        foreach ($employees as $employee) {
            $sheet->fromArray([
                $employee->nrpp,
                $employee->site?->code,
                $employee->nama,
                $employee->tempat_lahir,
                $employee->tanggal_lahir?->format('Y-m-d'),
                $employee->alamat,
                $employee->project,
                $employee->lokasi,
                $employee->beginning_classification,
                $employee->beginning_versatility,
                $employee->classification,
                $employee->versatility,
                $employee->doh?->format('Y-m-d'),
                $employee->is_active ? 1 : 0,
            ], null, 'A'.$row);

            $row++;
        }

        foreach (range('A', $this->lastColumn()) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $spreadsheet;
    }

    private function lastColumn(): string
    {
        return chr(ord('A') + count(self::HEADERS) - 1);
    }

    private function writeHeader(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray(self::HEADERS, null, 'A1');

        $lastColumn = $this->lastColumn();
        $sheet->getStyle('A1:'.$lastColumn.'1')->getFont()->setBold(true);
        $sheet->getStyle('A1:'.$lastColumn.'1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E5E7EB');

        foreach (range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }

    private function writeExampleRow(Spreadsheet $spreadsheet): void
    {
        $sheet = $spreadsheet->getActiveSheet();
        $lastColumn = $this->lastColumn();

        $sheet->fromArray(self::EXAMPLE_ROW, null, 'A2');
        $sheet->getStyle('A2:'.$lastColumn.'2')->getFont()->setItalic(true)->getColor()->setRGB('6B7280');
        $sheet->getStyle('A2:'.$lastColumn.'2')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB('FEF9C3');

        $sheet->mergeCells('A3:'.$lastColumn.'3');
        $sheet->setCellValue('A3', '↑ Baris di atas cuma contoh (NRPP "'.self::EXAMPLE_NRPP.'" otomatis dilewati saat import) — kolom "site" harus sama dengan kode site yang sudah ada di aplikasi. Hapus atau timpa baris ini dengan data karyawan sebenarnya.');
        $sheet->getStyle('A3')->getFont()->setItalic(true)->setSize(9)->getColor()->setRGB('B91C1C');
        $sheet->getStyle('A3')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension(3)->setRowHeight(28);
    }
}
