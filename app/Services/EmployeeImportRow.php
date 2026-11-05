<?php

namespace App\Services;

use App\Models\Site;

/**
 * One data row of an import file after it has been read and checked, but
 * before anything is saved. Shared by the preview and the real import so
 * both apply exactly the same rules.
 */
readonly class EmployeeImportRow
{
    public const STATUS_NEW = 'new';

    public const STATUS_UPDATE = 'update';

    public const STATUS_SKIP = 'skip';

    /**
     * @param  array<string, mixed>  $attributes  Employee attributes (no site_id)
     */
    public function __construct(
        public int $rowNumber,
        public string $status,
        public array $attributes,
        public ?Site $site = null,
        public ?string $message = null,
    ) {}

    public function isSkipped(): bool
    {
        return $this->status === self::STATUS_SKIP;
    }

    /** The reason as shown in import summaries, e.g. "Baris 4: …". */
    public function skipLabel(): string
    {
        return $this->rowNumber > 0
            ? "Baris {$this->rowNumber}: {$this->message}"
            : (string) $this->message;
    }
}
