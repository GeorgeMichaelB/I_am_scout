<?php

namespace App\Filament\Resources\Ta7ders\Pages;

use App\Filament\Resources\Ta7ders\Ta7derResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTa7ders extends ListRecords
{
    protected static string $resource = Ta7derResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
