<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Bootstrap Admin Account
    |--------------------------------------------------------------------------
    |
    | Used only by AdminUserSeeder to create (or update) a single super_admin
    | login. Override these in .env for a real production account instead of
    | shipping with the demo defaults.
    |
    */

    'name' => env('ADMIN_NAME', 'Admin'),

    'email' => env('ADMIN_EMAIL', 'admin@wbk.test'),

    'password' => env('ADMIN_PASSWORD', 'password'),

];
