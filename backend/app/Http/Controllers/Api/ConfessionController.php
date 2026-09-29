<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Confession;
use Illuminate\Http\Request;

class ConfessionController extends Controller
{
    /**
     * Menampilkan semua confession.
     */
    public function index()
    {
        $confessions = Confession::with('user')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Daftar confession berhasil diambil',
            'data' => $confessions,
        ]);
    }

    /**
     * Membuat confession baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_anonymous' => ['required', 'boolean'],
        ]);

        $confession = $request->user()->confessions()->create($validated);

        return response()->json([
            'message' => 'Confession berhasil dibuat',
            'data' => $confession,
        ], 201);
    }

    /**
     * Menampilkan satu confession.
     */
    public function show(Confession $confession)
    {
        $confession->load('user');

        return response()->json([
            'message' => 'Confession berhasil diambil',
            'data' => $confession,
        ]);
    }

    /**
     * Mengubah confession.
     */
    public function update(Request $request, Confession $confession)
    {
        if ($request->user()->id !== $confession->user_id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mengubah confession ini',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
            'is_anonymous' => ['required', 'boolean'],
        ]);

        $confession->update($validated);

        return response()->json([
            'message' => 'Confession berhasil diperbarui',
            'data' => $confession,
        ]);
    }

    /**
     * Menghapus confession.
     */
    public function destroy(Request $request, Confession $confession)
    {
        if ($request->user()->id !== $confession->user_id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menghapus confession ini',
            ], 403);
        }

        $confession->delete();

        return response()->json([
            'message' => 'Confession berhasil dihapus',
        ]);
    }
}