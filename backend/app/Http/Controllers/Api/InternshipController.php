<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Internship;
use Illuminate\Http\Request;

class InternshipController extends Controller
{
    public function index()
    {
        $internships = Internship::with('user')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Daftar informasi magang berhasil diambil',
            'data' => $internships,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'application_url' => ['nullable', 'url', 'max:255'],
            'deadline' => ['nullable', 'date'],
        ]);

        $internship = Internship::create([
            'user_id' => $request->user()->id,
            'company_name' => $validated['company_name'],
            'position' => $validated['position'],
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'application_url' => $validated['application_url'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
        ]);

        return response()->json([
            'message' => 'Informasi magang berhasil dibuat',
            'data' => $internship,
        ], 201);
    }

    public function show(Internship $internship)
    {
        $internship->load('user');

        return response()->json([
            'message' => 'Detail informasi magang berhasil diambil',
            'data' => $internship,
        ]);
    }

    public function update(Request $request, Internship $internship)
    {
        $validated = $request->validate([
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'application_url' => ['nullable', 'url', 'max:255'],
            'deadline' => ['nullable', 'date'],
        ]);

        $internship->update($validated);

        return response()->json([
            'message' => 'Informasi magang berhasil diperbarui',
            'data' => $internship,
        ]);
    }

    public function destroy(Internship $internship)
    {
        $internship->delete();

        return response()->json([
            'message' => 'Informasi magang berhasil dihapus',
        ]);
    }
}