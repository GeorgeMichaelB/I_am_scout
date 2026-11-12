<?php

namespace App\Filament\Resources\Feraas\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class FeraaForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('section_id')
                    ->required()
                    ->numeric(),
                TextInput::make('name')
                    ->required(),
            ]);
    }
}
