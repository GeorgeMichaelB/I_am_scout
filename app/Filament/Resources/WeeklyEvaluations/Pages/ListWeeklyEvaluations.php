<?php

namespace App\Filament\Resources\WeeklyEvaluations\Pages;

use App\Filament\Resources\WeeklyEvaluations\WeeklyEvaluationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListWeeklyEvaluations extends ListRecords
{
    protected static string $resource = WeeklyEvaluationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
