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
    /**
     * Render the paklaring PDF, store it on the private "local" disk, and
     * return the storage path (saved on the model as file_path).
     */
    public function generate(Paklaring $paklaring): string
    {
        $paklaring->loadMissing('site');

        $qrDataUri = $this->buildVerificationQrCode($paklaring);

        $pdf = Pdf::loadView('pdf.paklaring', [
            'paklaring' => $paklaring,
            'site' => $paklaring->site,
            'headOffice' => config('company.head_office'),
            'qrDataUri' => $qrDataUri,
        ])->setPaper('a4', 'portrait');

        $path = 'paklaring/'.$paklaring->no_surat.'.pdf';

        Storage::disk('local')->put($path, $pdf->output());

        return $path;
    }

    private function buildVerificationQrCode(Paklaring $paklaring): string
    {
        $url = route('verify.show', $paklaring->verification_token);

        $result = (new Builder(
            writer: new PngWriter,
            data: $url,
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 220,
            margin: 4,
        ))->build();

        return $result->getDataUri();
    }
}
