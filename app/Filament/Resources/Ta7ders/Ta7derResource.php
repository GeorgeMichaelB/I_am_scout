<?php

namespace App\Filament\Resources\Ta7ders;

use App\Filament\Resources\Ta7ders\Pages\CreateTa7der;
use App\Filament\Resources\Ta7ders\Pages\EditTa7der;
use App\Filament\Resources\Ta7ders\Pages\ListTa7ders;
use App\Filament\Resources\Ta7ders\Schemas\Ta7derForm;
use App\Filament\Resources\Ta7ders\Tables\Ta7dersTable;
use App\Models\Ta7der;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class Ta7derResource extends Resource
{
    protected static ?string $model = Ta7der::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return Ta7derForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return Ta7dersTable::configure($table);
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
            'index' => ListTa7ders::route('/'),
            'create' => CreateTa7der::route('/create'),
            'edit' => EditTa7der::route('/{record}/edit'),
        ];
    }
}
