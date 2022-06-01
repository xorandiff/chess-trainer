<?php

namespace App\Services\ChessParser;

class PgnParser {
    protected string $pgn;

    public string $event;

    public string $site;

    public string $date;

    public string $round;

    public string $white;

    public string $black;

    public string $result;

    public function __construct(string $pgn) {
        $this->pgn = $pgn;
    }

    public function isValid() {
        return true;
    }

    public function parseTags() {
        $lines = explode("\n", $this->pgn);
        
        foreach ($lines as $line) {
            $matches = [];
            preg_match('/\[(\w+)\s+"(.+)"\]/i', $line, $matches, PREG_UNMATCHED_AS_NULL);

            if ($matches) {
                $tagName = $matches[1];
                $tagValue = $matches[2];

                switch (strtolower($tagName)) {
                    case 'event':
                        $this->event = $tagValue;
                        break;
                    case 'site':
                        $this->site = $tagValue;
                        break;
                    case 'date':
                        $this->date = $tagValue;
                        break;
                    case 'round':
                        $this->round = $tagValue;
                        break;
                    case 'white':
                        $this->white = $tagValue;
                        break;
                    case 'black':
                        $this->black = $tagValue;
                        break;
                    case 'result':
                        $this->result = $tagValue;
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
