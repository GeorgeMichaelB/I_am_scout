<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ScouterTemplateExport implements FromArray, WithHeadings, WithStyles
{
    protected ?string $suggestedPrefix;

    public function __construct(?string $suggestedPrefix = 'ASH-F1')
    {
        $this->suggestedPrefix = $suggestedPrefix ?? 'ASH-F1';
    }

    public function headings(): array
    {
        return [
            'Unique ID',
            'Full Name',
            'Email',
            'Gender (male/female)',
            'Phone',
            "Mom's Phone",
            "Dad's Phone",
            'School',
            'Grade',
            'Sunday School Family',
            'Address',
            'Diseases',
            'Notes',
        ];
    }

    public function array(): array
    {
        // Provide 2 helpful sample rows demonstrating the human-readable ID format
        $prefix = $this->suggestedPrefix;
        return [
            [
                $prefix . '-001',
                'Sample Scout 1',
                'scout1@example.com',
                'male',
                '+201200000001',
                '+201200000002',
                '+201200000003',
                'St. Mark School',
                'Grade 5',
                'St. George Family',
                'Heliopolis, Cairo',
                'None',
                'Sample notes',
            ],
            [
                $prefix . '-002',
                'Sample Scout 2',
                'scout2@example.com',
                'female',
                '+201200000004',
                '+201200000005',
                '+201200000006',
                'St. Joseph School',
                'Grade 6',
                'St. Mary Family',
                'Nasr City, Cairo',
                'Asthma',
                'Requires inhaler during camps',
            ],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

