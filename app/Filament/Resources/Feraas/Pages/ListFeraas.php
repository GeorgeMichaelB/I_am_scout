<?php

namespace App\Filament\Resources\Feraas\Pages;

use App\Filament\Resources\Feraas\FeraaResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFeraas extends ListRecords
{
    protected static string $resource = FeraaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
