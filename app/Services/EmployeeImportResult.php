<?php

namespace App\Services;

readonly class EmployeeImportResult
{
    /**
     * @param  string[]  $skipped
     */
    public function __construct(
        public int $created,
        public int $updated,
        public array $skipped,
    ) {}
}
