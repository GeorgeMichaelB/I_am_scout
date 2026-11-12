<?php

namespace App\Filament\Resources\Feraas;

use App\Filament\Resources\Feraas\Pages\CreateFeraa;
use App\Filament\Resources\Feraas\Pages\EditFeraa;
use App\Filament\Resources\Feraas\Pages\ListFeraas;
use App\Filament\Resources\Feraas\Schemas\FeraaForm;
use App\Filament\Resources\Feraas\Tables\FeraasTable;
use App\Models\Feraa;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FeraaResource extends Resource
{
    protected static ?string $model = Feraa::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return FeraaForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FeraasTable::configure($table);
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
            'index' => ListFeraas::route('/'),
            'create' => CreateFeraa::route('/create'),
            'edit' => EditFeraa::route('/{record}/edit'),
        ];
    }
}
