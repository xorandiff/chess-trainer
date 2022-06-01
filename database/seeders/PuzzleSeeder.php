<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PuzzleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('puzzles')->insert([
            'rating' => 443,
            'pgn' => '[Event "?"]
            [Site "Telgte ch jeugd"]
            [Date "1989.??.??"]
            [Round "?"]
            [White "Illner"]
            [Black "Dorsmann"]
            [Result "0-1"]
            [SetUp "1"]
            [FEN "4r1k1/pp2qr1p/2pp2pB/2b2b1n/2P5/1PN2QPP/P4PB1/3R1RK1 w - - 0 1"]
            [DELTA "3.47"]
            [FirstMove "21w"]
            [FULL "21. Rde1 Qxe1 22. Rxe1 Rxe1+"]
            [MOVES "2"]
            [PlyCount "4"]
            [SCORE "-3.78"]
            
            1. Rde1 ({24:-3.51} 1. Rde1 Qxe1 2. Rxe1 Rxe1+ 3. Kh2 Bxh3 4. Bf4 Nxf4 $19)
            ({24:-1.86} 1. Bf4 Nxf4 2. gxf4 Qh4 3. Rde1 Ref8 4. Ne4 Bxe4 $19) ({24:-2.22} 1.
            b4 Bxb4 2. Bd2 Bxh3 3. Rfe1 Qxe1+ 4. Bxe1 Rxf3 $19) ({24:-2.35} 1. Rd2 Bxh3 2.
            Qd3 Bf5 3. Qf3 Bd7 4. Re2 Rxf3 $19) ({24:-2.68} 1. Rc1 Bxh3 2. Qd3 Qe6 3. b4
            Bxb4 4. Qe3 Qxe3 $19) 1... Qxe1 ({24:-3.17} 1... Qxe1 2. Rxe1 Rxe1+ 3. Kh2 Bxh3
            4. Bf4 Nxf4 5. gxf4 $19) ({24:-0.88} 1... Qd8 2. Rxe8+ Qxe8 3. Na4 Bd4 4. Nc3
            Qe5 5. Ne2 $17) ({24:-0.31} 1... Qd7 2. Kh2 Rxe1 3. Rxe1 Bc2 4. Qe2 Rxf2 5. Rf1
            $15) ({24:0.55} 1... Be6 2. Qd3 Qd7 3. Na4 Bb4 4. Bd2 Bxd2 5. Qxd2 $14) 2. Rxe1
            ({24:-3.15} 2. Rxe1 Rxe1+ 3. Kh2 Bxh3 4. Bf4 Nxf4 5. gxf4 Bf5 $19) ({24:-8.86}
            2. Na4 Bc8 3. Rxe1 Rxe1+ 4. Kh2 Rxf3 5. Nxc5 Rf7 $19) ({24:-9.5} 2. Kh2 Qe5 3.
            Bf4 Nxf4 4. gxf4 Qd4 5. Ne2 Qb2 $19) ({24:-9.84} 2. Kh1 Qe5 3. Bf4 Nxf4 4. gxf4
            Qd4 5. Ne2 Qb2 $19) 2... Rxe1+ ({24:-3.21} 2... Rxe1+ 3. Kh2 Bxh3 4. Bf4 Nxf4 5.
            gxf4 Bf5 6. Ne2 $19) ({24:5.15} 2... Be6 3. Bf4 Rff8 4. Qd1 Nxf4 5. gxf4 Bf5 6.
            Na4 $18) ({24:6.22} 2... Bd7 3. Rxe8+ Bxe8 4. Bf4 Nxf4 5. gxf4 Bd7 6. Ne4 $18)
            ({24:6.64} 2... Rd8 3. Qe2 Nf6 4. g4 Bd7 5. Qd2 Bb4 6. Re2 $18) 0-1'
        ]);
    }
}
