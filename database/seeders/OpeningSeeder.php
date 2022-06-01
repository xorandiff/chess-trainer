<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OpeningSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('openings')->insert([ 'name' => 'Vienna Game' ]);
        DB::table('openings')->insert([ 'name' => 'Italian Game' ]);
        DB::table('openings')->insert([ 'name' => 'Sicilian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'French Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Ruy López Opening' ]);
        DB::table('openings')->insert([ 'name' => 'Caro-Kann Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Scandinavian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Pirc Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Alekhine\'s Defense' ]);
        DB::table('openings')->insert([ 'name' => 'King\'s Gambit' ]);
        DB::table('openings')->insert([ 'name' => 'Scotch Game' ]);
        DB::table('openings')->insert([ 'name' => 'Queen\'s Gambit' ]);
        DB::table('openings')->insert([ 'name' => 'King\'s Indian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Nimzo-Indian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Dutch Defense' ]);
        DB::table('openings')->insert([ 'name' => 'London System' ]);
        DB::table('openings')->insert([ 'name' => 'Benko Gambit' ]);
        DB::table('openings')->insert([ 'name' => 'Grünfeld Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Bogo-Indian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Queen\'s Indian Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Slav Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Trompowsky Attack' ]);
        DB::table('openings')->insert([ 'name' => 'Benoni Defense' ]);
        DB::table('openings')->insert([ 'name' => 'Catalan Opening' ]);
        DB::table('openings')->insert([ 'name' => 'Réti Opening' ]);
        DB::table('openings')->insert([ 'name' => 'English Opening' ]);
        DB::table('openings')->insert([ 'name' => 'Bird\'s Opening' ]);
        DB::table('openings')->insert([ 'name' => 'King\'s Indian Attack' ]);
        DB::table('openings')->insert([ 'name' => 'Polish Opening' ]);
        DB::table('openings')->insert([ 'name' => 'Grob Opening' ]);
        DB::table('openings')->insert([ 'name' => 'King\'s Fianchetto Opening' ]);
        DB::table('openings')->insert([ 'name' => 'Nimzowitsch-Larsen Attack' ]);
    }
}
