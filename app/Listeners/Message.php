<?php

namespace App\Listeners;

use App\Events\Bestmove;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class Message
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\Bestmove  $event
     * @return void
     */
    public function handle(Bestmove $event)
    {
        //
    }
}
