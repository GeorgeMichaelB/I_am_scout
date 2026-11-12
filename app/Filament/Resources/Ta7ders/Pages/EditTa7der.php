<?php

namespace App\Filament\Resources\Ta7ders\Pages;

use App\Filament\Resources\Ta7ders\Ta7derResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTa7der extends EditRecord
{
    protected static string $resource = Ta7derResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
