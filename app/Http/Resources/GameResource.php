<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class GameResource extends JsonResource
{
    public $preserveKeys = true;
    
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'pgn' => $this->pgn,
            'event' => $this->event,
            'site' => $this->site,
            'date' => $this->date,
            'round' => $this->round,
            'white' => $this->white,
            'black' => $this->black,
            'result' => $this->result
        ];
    }
}
