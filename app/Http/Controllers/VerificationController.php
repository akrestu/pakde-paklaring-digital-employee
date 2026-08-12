<?php

namespace App\Http\Controllers;

use App\Models\Paklaring;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function download(string $token): StreamedResponse
    {
        $paklaring = Str::isUuid($token)
            ? Paklaring::where('verification_token', $token)->first()
            : null;

        abort_unless($paklaring && $paklaring->file_path && Storage::disk('local')->exists($paklaring->file_path), 404);

        return Storage::disk('local')->response($paklaring->file_path, $paklaring->no_surat.'.pdf');
    }
}
