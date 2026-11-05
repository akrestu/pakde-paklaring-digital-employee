<?php

namespace App\Http\Controllers;

use App\Models\Paklaring;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    /**
     * Public verification page reached by scanning the QR code printed on
     * a paklaring. No authentication required — the uuid token itself is
     * the credential, so the page only receives the handful of fields
     * needed to confirm authenticity. Personal data (address, birth date,
     * NRPP) and the termination reason never leave the server here.
     */
    public function show(string $token): Response
    {
        $paklaring = Str::isUuid($token)
            ? Paklaring::with('site:id,signer_name,signer_title')
                ->where('verification_token', $token)
                ->first()
            : null;

        return Inertia::render('verify/show', [
            'valid' => $paklaring !== null,
            'paklaring' => $paklaring ? [
                'no_surat' => $paklaring->no_surat,
                'nama' => $paklaring->nama,
                'tanggal_terbit' => $paklaring->signing_tanggal->toDateString(),
                'signer_name' => $paklaring->site?->signer_name,
                'signer_title' => $paklaring->site?->signer_title,
                'final_classification' => $paklaring->final_classification,
                'doh' => $paklaring->doh->toDateString(),
                'doe' => $paklaring->doe->toDateString(),
            ] : null,
        ]);
    }
}
