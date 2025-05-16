<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::insert([
            [
                'name' => 'دانیال میر نجفی',
                'phone' => '09123456789',
                'role' => 'admin',
                'is_premium' => true,
                'password' => bcrypt('12345678'),
            ],
            [
                'name' => 'داوود پناهی',
                'phone' => '09123456788',
                'role' => 'customer',
                'is_premium' => false,
                'password' => bcrypt('12345678'),
            ]
        ]);

        $user = User::find(2);
        $user->balance()->create([
            'amount' => 0
        ]);
    }
}
