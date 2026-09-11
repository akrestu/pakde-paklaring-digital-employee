<?php

namespace App\Http\Controllers;

use App\Models\Paklaring;
use App\Services\PaklaringPdfService;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class VerificationController extends Controller
{
    /**
     * Public verification page reached by scanning the QR code printed on
     * a paklaring. No authentication required — the uuid token itself is
     * the credential.
     */
    public function show(string $token): Response
    {
        $paklaring = Str::isUuid($token)
            ? Paklaring::with('site')->where('verification_token', $token)->first()
            : null;

        return Inertia::render('verify/show', [
            'valid' => $paklaring !== null,
            'paklaring' => $paklaring,
        ]);
    }

    public function download(string $token, PaklaringPdfService $pdfService): HttpResponse
    {
        $paklaring = Str::isUuid($token)
            ? Paklaring::where('verification_token', $token)->first()
            : null;

        abort_unless($paklaring, 404);

        return response($pdfService->render($paklaring), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$paklaring->no_surat.'-'.PaklaringPdfService::DEFAULT_PAPER_SIZE.'.pdf"',
        ]);
    }
}
