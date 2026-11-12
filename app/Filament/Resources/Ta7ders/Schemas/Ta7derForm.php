<?php

namespace App\Filament\Resources\Ta7ders\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class Ta7derForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('leader_id')
                    ->required()
                    ->numeric(),
                TextInput::make('feraa_id')
                    ->required()
                    ->numeric(),
                DatePicker::make('week_date')
                    ->required(),
                Textarea::make('content')
                    ->required()
                    ->columnSpanFull(),
                DateTimePicker::make('submitted_at'),
            ]);
    }
}
