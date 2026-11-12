<?php

namespace App\Filament\Resources\Lectures\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class LectureForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('feraa_id')
                    ->required()
                    ->numeric(),
                TextInput::make('section_id')
                    ->required()
                    ->numeric(),
                TextInput::make('title')
                    ->required(),
                Textarea::make('content')
                    ->columnSpanFull(),
                TextInput::make('file_path'),
                TextInput::make('created_by')
                    ->required()
                    ->numeric(),
                DatePicker::make('week_date')
                    ->required(),
            ]);
    }
}
