<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by(strtolower((string) $request->input('email')).'|'.$request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by(optional($request->user())->id ?: $request->ip());
        });

        // Register activity log observer for core models
        \App\Models\Document::observe(\App\Observers\ActivityLogObserver::class);
        \App\Models\Company::observe(\App\Observers\ActivityLogObserver::class);
        \App\Models\Contact::observe(\App\Observers\ActivityLogObserver::class);
        \App\Models\Article::observe(\App\Observers\ActivityLogObserver::class);
        \App\Models\Transaction::observe(\App\Observers\ActivityLogObserver::class);
        \App\Models\User::observe(\App\Observers\ActivityLogObserver::class);
    }
}
