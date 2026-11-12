<?php

namespace App\Filament\Resources\WeeklyEvaluations;

use App\Filament\Resources\WeeklyEvaluations\Pages\CreateWeeklyEvaluation;
use App\Filament\Resources\WeeklyEvaluations\Pages\EditWeeklyEvaluation;
use App\Filament\Resources\WeeklyEvaluations\Pages\ListWeeklyEvaluations;
use App\Filament\Resources\WeeklyEvaluations\Schemas\WeeklyEvaluationForm;
use App\Filament\Resources\WeeklyEvaluations\Tables\WeeklyEvaluationsTable;
use App\Models\WeeklyEvaluation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class WeeklyEvaluationResource extends Resource
{
    protected static ?string $model = WeeklyEvaluation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return WeeklyEvaluationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return WeeklyEvaluationsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListWeeklyEvaluations::route('/'),
            'create' => CreateWeeklyEvaluation::route('/create'),
            'edit' => EditWeeklyEvaluation::route('/{record}/edit'),
        ];
    }
}
