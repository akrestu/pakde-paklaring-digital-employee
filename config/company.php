<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Identity
    |--------------------------------------------------------------------------
    |
    | Used to build paklaring letter numbers (e.g. WBK-BAU-HRGA-2025-VIII-0834)
    | and to render the printed / PDF letterhead.
    |
    */

    'code' => env('COMPANY_CODE', 'WBK'),

    'department_code' => env('COMPANY_DEPARTMENT_CODE', 'HRGA'),

    'name' => env('COMPANY_NAME', 'PT. Wahana Bandhawa Kencana'),

    'tagline' => env('COMPANY_TAGLINE', 'Earthmoving and Mining Company'),

    'logo' => public_path('images/company-logo.png'),

    /*
    |--------------------------------------------------------------------------
    | Head Office
    |--------------------------------------------------------------------------
    |
    | Printed as the fixed left-hand column of the paklaring PDF footer. The
    | right-hand column comes from the site the paklaring belongs to.
    |
    */

    'head_office' => [
        'name' => env('COMPANY_HEAD_OFFICE_NAME', 'Head Office'),
        'address' => env('COMPANY_HEAD_OFFICE_ADDRESS', 'Jalan Majapahit No. 28/IV MNO, Jakarta Pusat - 10160. Indonesia'),
        'phone' => env('COMPANY_HEAD_OFFICE_PHONE', '(+62) 21 384 1801'),
        'fax' => env('COMPANY_HEAD_OFFICE_FAX', '(+62) 21 384 1802'),
        'website' => env('COMPANY_WEBSITE', 'wahanabandhawakencana.co.id'),
    ],

];
