<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrCodeController extends Controller
{
    public function generate(Request $request)
    {
        $user = $request->user();

        $qrData = json_encode([
            'type' => 'student_profile',
            'user_id' => $user->id,
        ]);

        $qrCode = QrCode::format('svg')
            ->size(300)
            ->margin(2)
            ->generate($qrData);

        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml');
    }

    public function profile($userId)
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        $qrData = json_encode([
            'type' => 'student_profile',
            'user_id' => $user->id,
        ]);

        $qrCode = QrCode::format('svg')
            ->size(300)
            ->margin(2)
            ->generate($qrData);

        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml');
    }
}