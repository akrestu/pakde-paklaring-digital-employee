<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>{{ $paklaring->no_surat }}</title>
<style>
    @page { margin: 90px 50px 70px 50px; }

    body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 13.5px;
        line-height: 1.3;
        color: #1a1a1a;
    }

    header {
        position: fixed;
        top: -70px;
        left: 0;
        right: 0;
        height: 60px;
    }

    .brand-logo {
        width: 260px;
        height: 40px;
    }

    .watermark {
        position: fixed;
        top: 280px;
        left: -40px;
        width: 680px;
        text-align: center;
        transform: rotate(-35deg);
        white-space: nowrap;
        font-size: 30px;
        font-weight: bold;
        letter-spacing: 2px;
        color: #1a1a1a;
        opacity: 0.09;
    }

    .title { text-align: center; margin-bottom: 4px; }
    .title h1 { font-size: 18px; margin: 0; text-decoration: underline; }
    .title .subtitle { font-size: 14.5px; font-style: italic; color: #1f3d99; margin: 2px 0; }
    .title .no-surat { font-size: 15.5px; font-weight: bold; text-decoration: underline; margin-top: 4px; }

    .intro { margin: 12px 0 8px 0; }
    .intro .en { font-weight: bold; }
    .intro .id { font-style: italic; color: #1f3d99; }

    table.fields { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    table.fields td { padding: 5.5px 0; vertical-align: top; }
    table.fields td.label { width: 180px; }
    table.fields td.colon { width: 12px; }
    table.fields .en { font-weight: bold; text-decoration: underline; }
    table.fields .id { font-style: italic; color: #1f3d99; }
    table.fields .value { font-weight: bold; }

    .closing { margin: 10px 0 18px 0; line-height: 1.35; }
    .closing .en { }
    .closing .id { font-style: italic; color: #1f3d99; }

    .signature { width: 65%; }
    .signature .place-date { margin-bottom: 2px; }
    .signature .company { font-weight: bold; margin-bottom: 72px; }
    .signature .signer-name { font-weight: bold; text-decoration: underline; }
    .signature .signer-title { margin-top: 2px; }

    .qr-wrap { position: absolute; top: 0; right: 0; text-align: center; }
    .qr-wrap img { width: 90px; height: 90px; }
    .qr-wrap .hint { font-size: 7px; color: #555; width: 90px; }

    .signature-row { position: relative; min-height: 130px; }

    footer {
        position: fixed;
        bottom: -55px;
        left: 0;
        right: 0;
        height: 50px;
        font-size: 10.5px;
        line-height: 1.25;
        color: #1f3d99;
        font-style: italic;
    }

    .footer-rule { border-top: 1.5px solid #000; margin-bottom: 4px; }
    footer table { width: 100%; border-collapse: collapse; }
    footer td { width: 50%; vertical-align: top; }
    footer td.right { text-align: right; }
</style>
</head>
<body>

<div class="watermark">{{ strtoupper(config('company.name')) }}</div>

<header>
    @if(is_file(config('company.logo')))
        <img class="brand-logo" src="{{ config('company.logo') }}" alt="{{ config('company.name') }}">
    @endif
</header>

<footer>
    <div class="footer-rule"></div>
    <table>
        <tr>
            <td class="left">
                {{ config('company.head_office.name') }}<br>
                {{ config('company.head_office.address') }}<br>
                Tlp : {{ config('company.head_office.phone') }} Fax : {{ config('company.head_office.fax') }}<br>
                {{ config('company.head_office.website') }}
            </td>
            <td class="right">
                {{ $site->name }}<br>
                {{ $site->company_name }}<br>
                {{ $site->address }}
            </td>
        </tr>
    </table>
</footer>

<div class="title">
    <h1>THIS IS TO CERTIFY THAT</h1>
    <div class="subtitle">DENGAN INI MENERANGKAN BAHWA</div>
    <div class="no-surat">{{ $paklaring->no_surat }}</div>
</div>

<div class="intro">
    <span class="en">This Certificate verify that</span> / <span class="id">Sertifikat ini menerangkan bahwa :</span>
</div>

<table class="fields">
    <tr>
        <td class="label"><div class="en">Name</div><div class="id">Nama</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->nama }} &nbsp;&nbsp; # {{ $paklaring->nrpp }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Place, Date of Birth</div><div class="id">Tempat, Tanggal Lahir</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->tempat_lahir }}, {{ $paklaring->tanggal_lahir->locale('id')->translatedFormat('d F Y') }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Address</div><div class="id">Alamat</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->alamat }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Project &amp; Location</div><div class="id">Lokasi Proyek</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->project }} {{ $paklaring->lokasi }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Beginning Classification</div><div class="id">Klasifikasi Awal</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->beginning_classification }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Beginning Versatility</div><div class="id">Keterampilan Awal</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->beginning_versatility }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Final Classification</div><div class="id">Klasifikasi Akhir</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->final_classification }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Final Versatility</div><div class="id">Keterampilan Akhir</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->final_versatility }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Due to Termination</div><div class="id">Alasan Pemberhentian</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->alasan_phk }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Service Period</div><div class="id">Masa Kerja</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->doh->locale('id')->translatedFormat('d F Y') }} s/d {{ $paklaring->doe->locale('id')->translatedFormat('d F Y') }}</td>
    </tr>
    <tr>
        <td class="label"><div class="en">Remarks</div><div class="id">Keterangan</div></td>
        <td class="colon">:</td>
        <td class="value">{{ $paklaring->remarks ?: '- - -' }}</td>
    </tr>
</table>

<div class="closing">
    <div class="en">We thank you for your contribution to <strong>{{ config('company.name') }}</strong> and we wish you every success in the future.</div>
    <div class="id">Kami berterimakasih atas dedikasi yang telah saudara berikan kepada {{ config('company.name') }} dan berharap semoga prestasi dan keberhasilan senantiasa menyertai di waktu yang akan datang</div>
</div>

<div class="signature-row">
    <div class="signature">
        <div class="place-date">{{ $paklaring->signing_lokasi }}, {{ $paklaring->signing_tanggal->locale('id')->translatedFormat('d F Y') }}</div>
        <div class="company">{{ config('company.name') }}</div>
        <div class="signer-name">{{ $site->signer_name }}</div>
        <div class="signer-title">{{ $site->signer_title }}</div>
    </div>

    <div class="qr-wrap">
        <img src="{{ $qrDataUri }}" alt="QR Verifikasi">
    </div>
</div>

</body>
</html>
