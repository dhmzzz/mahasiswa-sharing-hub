<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $sentRequests = $user->sentFriendRequests()
            ->with('friend')
            ->get();

        $receivedRequests = $user->receivedFriendRequests()
            ->with('user')
            ->get();

        return response()->json([
            'message' => 'Data pertemanan berhasil diambil.',
            'sent_requests' => $sentRequests,
            'received_requests' => $receivedRequests,
        ]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'friend_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = $request->user();

        if ($user->id == $validated['friend_id']) {
            return response()->json([
                'message' => 'Kamu tidak dapat menambahkan diri sendiri sebagai teman.',
            ], 422);
        }

        $friend = User::findOrFail($validated['friend_id']);

        $existingFriendship = Friendship::where(function ($query) use ($user, $friend) {
            $query->where('user_id', $user->id)
                ->where('friend_id', $friend->id);
        })->orWhere(function ($query) use ($user, $friend) {
            $query->where('user_id', $friend->id)
                ->where('friend_id', $user->id);
        })->first();

        if ($existingFriendship) {
            return response()->json([
                'message' => 'Permintaan pertemanan sudah ada.',
                'data' => $existingFriendship,
            ], 409);
        }

        $friendship = Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friend->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Permintaan pertemanan berhasil dikirim.',
            'data' => $friendship->load('friend'),
        ], 201);
    }
    
    public function accept(Request $request, Friendship $friendship)
    {
    $user = $request->user();

    if ($friendship->friend_id !== $user->id) {
        return response()->json([
            'message' => 'Kamu tidak memiliki izin untuk menerima permintaan ini.',
        ], 403);
    }

    if ($friendship->status !== 'pending') {
        return response()->json([
            'message' => 'Permintaan pertemanan ini sudah diproses.',
        ], 422);
    }

    $friendship->update([
        'status' => 'accepted',
    ]);

    return response()->json([
        'message' => 'Permintaan pertemanan berhasil diterima.',
        'data' => $friendship->load(['user', 'friend']),
    ]);
    }
    public function destroy(Request $request, Friendship $friendship)
    {
        $user = $request->user();

        if (
            $friendship->user_id !== $user->id &&
            $friendship->friend_id !== $user->id
        ) {
            return response()->json([
                'message' => 'Kamu tidak memiliki izin untuk menghapus pertemanan ini.',
            ], 403);
        }

        $friendship->delete();

        return response()->json([
            'message' => 'Data pertemanan berhasil dihapus.',
        ]);
    }
}