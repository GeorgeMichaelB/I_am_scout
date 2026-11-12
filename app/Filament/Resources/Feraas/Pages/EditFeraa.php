<?php

namespace App\Filament\Resources\Feraas\Pages;

use App\Filament\Resources\Feraas\FeraaResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFeraa extends EditRecord
{
    protected static string $resource = FeraaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
