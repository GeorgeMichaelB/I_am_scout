<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('scout_id'),
                TextInput::make('full_name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('password')
                    ->password()
                    ->required(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('mom_phone')
                    ->tel(),
                TextInput::make('dad_phone')
                    ->tel(),
                TextInput::make('school'),
                TextInput::make('grade'),
                TextInput::make('gender')
                    ->required()
                    ->default('male'),
                TextInput::make('sunday_school_family'),
                TextInput::make('address'),
                Textarea::make('diseases')
                    ->columnSpanFull(),
                Textarea::make('notes')
                    ->columnSpanFull(),
                TextInput::make('avatar'),
            ]);
    }
}
