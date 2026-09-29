<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('studentProfile');

        return response()->json([
            'message' => 'Profil berhasil diambil',
            'data' => [
                'user' => $user,
                'profile' => $user->studentProfile,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'student_id' => ['nullable', 'string', 'max:100'],
            'university' => ['nullable', 'string', 'max:255'],
            'faculty' => ['nullable', 'string', 'max:255'],
            'major' => ['nullable', 'string', 'max:255'],
            'semester' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $user->update([
            'name' => $validated['name'],
        ]);

        $profile = $user->studentProfile;

        $profileData = [
            'student_id' => $validated['student_id'] ?? null,
            'university' => $validated['university'] ?? null,
            'faculty' => $validated['faculty'] ?? null,
            'major' => $validated['major'] ?? null,
            'semester' => $validated['semester'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ];

        if ($request->hasFile('photo')) {
            if ($profile?->photo_path) {
                Storage::disk('public')->delete($profile->photo_path);
            }

            $profileData['photo_path'] = $request
                ->file('photo')
                ->store('profile-photos', 'public');
        }

        $profile = $user->studentProfile()->updateOrCreate(
            [],
            $profileData
        );

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => [
                'user' => $user->fresh(),
                'profile' => $profile,
            ],
        ]);
    }
}