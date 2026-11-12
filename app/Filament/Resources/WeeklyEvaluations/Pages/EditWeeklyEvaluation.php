<?php

namespace App\Filament\Resources\WeeklyEvaluations\Pages;

use App\Filament\Resources\WeeklyEvaluations\WeeklyEvaluationResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditWeeklyEvaluation extends EditRecord
{
    protected static string $resource = WeeklyEvaluationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
