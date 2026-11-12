<?php

namespace App\Imports;

use App\Models\User;
use App\Models\UserRole;
use App\Models\Section;
use App\Models\Feraa;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ScouterImport implements ToCollection, WithHeadingRow
{
    protected ?int $sectionId;
    protected ?int $feraaId;
    public int $importedCount = 0;

    public function __construct(?int $sectionId = null, ?int $feraaId = null)
    {
        $this->sectionId = $sectionId;
        $this->feraaId = $feraaId;
    }

    public function collection(Collection $rows)
    {
        $section = $this->sectionId ? Section::find($this->sectionId) : null;
        $feraa = $this->feraaId ? Feraa::find($this->feraaId) : null;

        $prefix = 'SCOUT';
        if ($section) {
            $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $section->name), 0, 3));
        }
        if ($feraa) {
            $prefix .= '-F' . $feraa->id;
        }

        $counter = User::count() + 1;

        foreach ($rows as $row) {
            // Support multiple possible header names (lowercase/slugged by heading row)
            $fullName = $row['full_name'] ?? $row['fullname'] ?? $row['name'] ?? null;
            if (empty($fullName)) {
                continue;
            }

            $email = $row['email'] ?? null;
            if (empty($email)) {
                $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $fullName));
                $email = $cleanName . rand(100, 999) . '@scout.local';
            }

            // Check if user already exists by email
            $existing = User::where('email', $email)->first();
            if ($existing) {
                // Attach role if not present
                UserRole::firstOrCreate([
                    'user_id' => $existing->id,
                    'role' => 'scouter',
                    'section_id' => $this->sectionId,
                    'feraa_id' => $this->feraaId,
                ]);
                $this->importedCount++;
                continue;
            }

            $scoutId = $row['unique_id'] ?? $row['scout_id'] ?? null;
            if (empty($scoutId)) {
                $scoutId = $prefix . '-' . str_pad($counter, 3, '0', STR_PAD_LEFT);
                $counter++;
            }

            $gender = strtolower($row['gender_malefemale'] ?? $row['gender'] ?? 'male');
            if (!in_array($gender, ['male', 'female'])) {
                $gender = 'male';
            }

            $user = User::create([
                'scout_id' => $scoutId,
                'full_name' => $fullName,
                'email' => $email,
                'password' => Hash::make('password'),
                'gender' => $gender,
                'phone' => $row['phone'] ?? null,
                'mom_phone' => $row['moms_phone'] ?? $row['mom_phone'] ?? null,
                'dad_phone' => $row['dads_phone'] ?? $row['dad_phone'] ?? null,
                'school' => $row['school'] ?? null,
                'grade' => $row['grade'] ?? null,
                'sunday_school_family' => $row['sunday_school_family'] ?? null,
                'address' => $row['address'] ?? null,
                'diseases' => $row['diseases'] ?? null,
                'notes' => $row['notes'] ?? null,
            ]);

            UserRole::create([
                'user_id' => $user->id,
                'role' => 'scouter',
                'section_id' => $this->sectionId,
                'feraa_id' => $this->feraaId,
            ]);

            $this->importedCount++;
        }
    }
}
