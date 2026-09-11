<?php

namespace App\Services;

use App\Models\Paklaring;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;

class PaklaringPdfService
{
    public const DEFAULT_PAPER_SIZE = 'f4';

    /**
     * Paper dimensions in points (1 point = 1/72 inch).
     * F4 uses the common Indonesian folio size: 210 x 330 mm.
     *
     * @var array<string, string|array{0: float, 1: float, 2: float, 3: float}>
     */
    public const PAPER_SIZES = [
        'f4' => [0.0, 0.0, 595.28, 935.43],
        'a4' => 'a4',
    ];

    /**
     * Render the paklaring PDF, store it on the private "local" disk, and
     * return the storage path (saved on the model as file_path).
     */
    public function generate(Paklaring $paklaring, string $paperSize = self::DEFAULT_PAPER_SIZE): string
    {
        $path = 'paklaring/'.$paklaring->no_surat.'.pdf';

        Storage::disk('local')->put($path, $this->render($paklaring, $paperSize));

        return $path;
    }

    /** Render a fresh PDF in the requested supported paper size. */
    public function render(Paklaring $paklaring, string $paperSize = self::DEFAULT_PAPER_SIZE): string
    {
        $paklaring->loadMissing('site');

        $paper = self::PAPER_SIZES[$paperSize] ?? self::PAPER_SIZES[self::DEFAULT_PAPER_SIZE];

        return Pdf::loadView('pdf.paklaring', [
            'paklaring' => $paklaring,
            'site' => $paklaring->site,
            'headOffice' => config('company.head_office'),
            'qrDataUri' => $this->buildVerificationQrCode($paklaring),
        ])->setPaper($paper, 'portrait')->output();
    }

    private function buildVerificationQrCode(Paklaring $paklaring): string
    {
        $url = route('verify.show', $paklaring->verification_token);

        $result = Builder::create()
            ->writer(new PngWriter)
            ->data($url)
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(220)
            ->margin(4)
            ->build();

        return $result->getDataUri();
    }
}
