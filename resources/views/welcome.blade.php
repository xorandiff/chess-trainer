<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @vite
    </head>
    <body class="antialiased">
        <div class="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
    
            <main class="px-3">
                <div id="app" class="d-flex justify-content-center"></div>
            </main>
    
            <footer class="mt-auto text-white-50">
                <p>Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})</p>
            </footer>
        </div>
    </body>
</html>
