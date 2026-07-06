<?php

namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Request;

class ActivityLogObserver
{
    protected function log($model, $action)
    {
        if (! auth()->id()) {
            return;
        }

        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'old_values' => $model->getOriginal(),
            'new_values' => $model->getAttributes(),
            'ip_address' => Request::ip(),
        ]);
    }

    public function created($model) { $this->log($model, 'created'); }
    public function updated($model) { $this->log($model, 'updated'); }
    public function deleted($model) { $this->log($model, 'deleted'); }
}
