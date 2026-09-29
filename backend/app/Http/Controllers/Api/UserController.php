<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:1', 'max:255'],
        ]);

        $currentUserId = $request->user()->id;

        $users = User::query()
            ->where('id', '!=', $currentUserId)
            ->where('name', 'ILIKE', '%' . $validated['name'] . '%')
            ->select([
                'id',
                'name',
                'email',
            ])
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json([
            'message' => 'Hasil pencarian user berhasil diambil',
            'data' => $users,
        ]);
    }
}