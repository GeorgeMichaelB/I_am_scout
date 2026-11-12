<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Event;
use App\Models\Feraa;
use App\Models\Lecture;
use App\Models\Section;
use App\Models\User;
use App\Models\UserRole;
use App\Models\WeeklyEvaluation;
use App\Models\EvaluationEntry;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create the 8 sections
        $sectionsData = [
            ['name' => 'Ashbal', 'slug' => 'ashbal', 'display_order' => 1],
            ['name' => 'Zahrat', 'slug' => 'zahrat', 'display_order' => 2],
            ['name' => 'Kshafa', 'slug' => 'kshafa', 'display_order' => 3],
            ['name' => 'Morshedat', 'slug' => 'morshedat', 'display_order' => 4],
            ['name' => 'Caravelat', 'slug' => 'caravelat', 'display_order' => 5],
            ['name' => 'Morshahen Gawala', 'slug' => 'morshahen-gawala', 'display_order' => 6],
            ['name' => 'Gawala Boys', 'slug' => 'gawala-boys', 'display_order' => 7],
            ['name' => 'Gawala Girls', 'slug' => 'gawala-girls', 'display_order' => 8],
        ];

        $sections = [];
        foreach ($sectionsData as $data) {
            $sections[$data['slug']] = Section::create($data);
        }

        // 2. Create Fera'as for each section
        $ashbalFeraa1 = Feraa::create(['section_id' => $sections['ashbal']->id, 'name' => "Fera'a 1 (Eagles)"]);
        $ashbalFeraa2 = Feraa::create(['section_id' => $sections['ashbal']->id, 'name' => "Fera'a 2 (Lions)"]);
        $zahratFeraa1 = Feraa::create(['section_id' => $sections['zahrat']->id, 'name' => "Fera'a 1 (Roses)"]);
        $kshafaFeraa1 = Feraa::create(['section_id' => $sections['kshafa']->id, 'name' => "Fera'a 1 (Falcons)"]);
        $gawalaBoysFeraa1 = Feraa::create(['section_id' => $sections['gawala-boys']->id, 'name' => "Fera'a 1 (Rovers)"]);

        // 3. Create key users with roles
        // Dev
        $dev = User::create([
            'scout_id' => 'DEV-001',
            'full_name' => 'Lead Developer',
            'email' => 'dev@scout.com',
            'password' => Hash::make('password'),
            'phone' => '+201000000001',
            'gender' => 'male',
        ]);
        UserRole::create(['user_id' => $dev->id, 'role' => 'dev']);

        // Super Admin
        $superAdmin = User::create([
            'scout_id' => 'SADM-001',
            'full_name' => 'Super Administrator',
            'email' => 'superadmin@scout.com',
            'password' => Hash::make('password'),
            'phone' => '+201000000002',
            'gender' => 'male',
        ]);
        UserRole::create(['user_id' => $superAdmin->id, 'role' => 'super_admin']);

        // Admin
        $admin = User::create([
            'scout_id' => 'ADM-001',
            'full_name' => 'Scout Admin',
            'email' => 'admin@scout.com',
            'password' => Hash::make('password'),
            'phone' => '+201000000003',
            'gender' => 'male',
        ]);
        UserRole::create(['user_id' => $admin->id, 'role' => 'admin']);

        // Supervisor (Ashbal)
        $supervisor = User::create([
            'scout_id' => 'SUP-ASH-01',
            'full_name' => 'Mina Supervisor',
            'email' => 'supervisor@scout.com',
            'password' => Hash::make('password'),
            'phone' => '+201000000004',
            'gender' => 'male',
        ]);
        UserRole::create([
            'user_id' => $supervisor->id,
            'role' => 'supervisor',
            'section_id' => $sections['ashbal']->id,
        ]);

        // Leader (Leader in Ashbal Fera'a 1, AND also a Scouter in Gawala Boys!)
        $leader = User::create([
            'scout_id' => 'LDR-ASH-01',
            'full_name' => 'Peter Leader',
            'email' => 'leader@scout.com',
            'password' => Hash::make('password'),
            'phone' => '+201000000005',
            'gender' => 'male',
        ]);
        UserRole::create([
            'user_id' => $leader->id,
            'role' => 'leader',
            'section_id' => $sections['ashbal']->id,
            'feraa_id' => $ashbalFeraa1->id,
        ]);
        UserRole::create([
            'user_id' => $leader->id,
            'role' => 'scouter',
            'section_id' => $sections['gawala-boys']->id,
            'feraa_id' => $gawalaBoysFeraa1->id,
        ]);

        // Sample Scouters
        $scoutersData = [
            [
                'scout_id' => 'ASH-F1-001',
                'full_name' => 'Fady Youssef',
                'email' => 'scouter@scout.com',
                'phone' => '+201200000001',
                'mom_phone' => '+201200000002',
                'dad_phone' => '+201200000003',
                'school' => 'St. Mark School',
                'grade' => 'Grade 5',
                'gender' => 'male',
                'sunday_school_family' => 'St. George Family',
                'address' => 'Heliopolis, Cairo',
                'diseases' => 'None',
                'notes' => 'Very active in outdoor knots',
            ],
            [
                'scout_id' => 'ASH-F1-002',
                'full_name' => 'David Samir',
                'email' => 'david@scout.com',
                'phone' => '+201200000004',
                'mom_phone' => '+201200000005',
                'dad_phone' => '+201200000006',
                'school' => 'Patriarchal School',
                'grade' => 'Grade 4',
                'gender' => 'male',
                'sunday_school_family' => 'St. George Family',
                'address' => 'Shubra, Cairo',
                'diseases' => 'Mild Asthma',
                'notes' => 'Has inhaler in backpack',
            ],
            [
                'scout_id' => 'ASH-F1-003',
                'full_name' => 'George Nabil',
                'email' => 'george@scout.com',
                'phone' => '+201200000007',
                'mom_phone' => '+201200000008',
                'dad_phone' => '+201200000009',
                'school' => 'St. Joseph School',
                'grade' => 'Grade 5',
                'gender' => 'male',
                'sunday_school_family' => 'Archangel Michael Family',
                'address' => 'Nasr City, Cairo',
                'diseases' => 'None',
                'notes' => 'First year in Ashbal',
            ],
            [
                'scout_id' => 'ASH-F1-004',
                'full_name' => 'Mark Ashraf',
                'email' => 'mark@scout.com',
                'phone' => '+201200000010',
                'mom_phone' => '+201200000011',
                'dad_phone' => '+201200000012',
                'school' => 'Collège des Frères',
                'grade' => 'Grade 6',
                'gender' => 'male',
                'sunday_school_family' => 'St. Anthony Family',
                'address' => 'Maadi, Cairo',
                'diseases' => 'None',
                'notes' => 'Patrol second',
            ],
        ];

        $createdScouters = [];
        foreach ($scoutersData as $sData) {
            $user = User::create(array_merge($sData, [
                'password' => Hash::make('password'),
            ]));
            UserRole::create([
                'user_id' => $user->id,
                'role' => 'scouter',
                'section_id' => $sections['ashbal']->id,
                'feraa_id' => $ashbalFeraa1->id,
            ]);
            $createdScouters[] = $user;
        }

        // 4. Sample Announcements
        Announcement::create([
            'title' => 'Welcome to the New Scouting Year',
            'body' => 'All scouts and leaders are requested to assemble in complete uniform this Friday at 4:00 PM for the opening ceremony and flag salute.',
            'scope' => 'general',
            'created_by' => $admin->id,
        ]);

        Announcement::create([
            'title' => 'Ashbal Section Knotting Workshop',
            'body' => 'Remember to bring your 3-meter scout ropes for this week practical session on reef and sheet bend knots.',
            'scope' => 'section',
            'section_id' => $sections['ashbal']->id,
            'created_by' => $supervisor->id,
        ]);

        // 5. Sample Calendar Events
        Event::create([
            'title' => 'General Scout Rally',
            'description' => 'Annual gathering for all sections with inspection, parades, and campfire.',
            'start_time' => Carbon::now()->addDays(5)->setTime(16, 0),
            'end_time' => Carbon::now()->addDays(5)->setTime(20, 0),
            'section_id' => null, // General
            'created_by' => $admin->id,
        ]);

        Event::create([
            'title' => 'Ashbal Weekly Gathering',
            'description' => 'Weekly meeting, roll call, inspection, and badge curriculum.',
            'start_time' => Carbon::now()->addDays(2)->setTime(17, 0),
            'end_time' => Carbon::now()->addDays(2)->setTime(19, 30),
            'section_id' => $sections['ashbal']->id,
            'created_by' => $supervisor->id,
        ]);

        // 6. Sample Lectures
        Lecture::create([
            'feraa_id' => $ashbalFeraa1->id,
            'section_id' => $sections['ashbal']->id,
            'title' => 'History of Scouting and the Scout Promise',
            'content' => 'Overview of Lord Baden-Powell, founding principles, the 10 Scout Laws, and the meaning of our Scout Emblem.',
            'week_date' => Carbon::now()->startOfWeek()->toDateString(),
            'created_by' => $supervisor->id,
        ]);

        Lecture::create([
            'feraa_id' => $ashbalFeraa1->id,
            'section_id' => $sections['ashbal']->id,
            'title' => 'Essential Scouting Knots - Part 1',
            'content' => 'Reef knot, clove hitch, and figure-eight knot applications in pioneering and rescue.',
            'week_date' => Carbon::now()->subWeek()->startOfWeek()->toDateString(),
            'created_by' => $leader->id,
        ]);

        // 7. Sample Weekly Evaluation
        $eval = WeeklyEvaluation::create([
            'feraa_id' => $ashbalFeraa1->id,
            'week_date' => Carbon::now()->startOfWeek()->toDateString(),
            'is_active' => true,
            'created_by' => $leader->id,
        ]);

        foreach ($createdScouters as $idx => $scouter) {
            EvaluationEntry::create([
                'evaluation_id' => $eval->id,
                'scouter_id' => $scouter->id,
                'hair' => true,
                'trousers' => true,
                'clothes' => $idx !== 1, // one missing clothes
                'rope' => true,
                'missed_lectures' => $idx === 1 ? 1 : 0,
            ]);
        }
    }
}
