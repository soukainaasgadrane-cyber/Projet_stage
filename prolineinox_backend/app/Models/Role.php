<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = ['name', 'guard_name'];
    public function users() { return $this->belongsToMany(User::class); }
    public function permissions() { return $this->belongsToMany(Permission::class); }
    public function hasPermission($permission) {
        return $this->permissions->contains('name', $permission);
    }
}