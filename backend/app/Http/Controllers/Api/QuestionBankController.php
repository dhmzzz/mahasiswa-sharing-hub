<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class QuestionBankController extends Controller
{
    public function index()
    {
        $questionBanks = QuestionBank::with('user')
            ->latest()
            ->get()
            ->map(function ($questionBank) {
                $questionBank->file_url = $questionBank->file_path
                    ? asset('storage/' . $questionBank->file_path)
                    : null;

                return $questionBank;
            });

        return response()->json([
            'message' => 'Daftar bank soal berhasil diambil',
            'data' => $questionBanks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'exam_type' => ['required', 'in:UTS,UAS'],
            'file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx',
            ],
        ]);

        $filePath = null;

        if ($request->hasFile('file')) {
            $filePath = $request
                ->file('file')
                ->store('question-banks', 'public');
        }

        $questionBank = QuestionBank::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'exam_type' => $validated['exam_type'],
            'file_path' => $filePath,
        ]);

        $questionBank->load('user');

        $questionBank->file_url = $filePath
            ? asset('storage/' . $filePath)
            : null;

        return response()->json([
            'message' => 'Bank soal berhasil dibuat',
            'data' => $questionBank,
        ], 201);
    }

    public function show(QuestionBank $questionBank)
    {
        $questionBank->load('user');

        $questionBank->file_url = $questionBank->file_path
            ? asset('storage/' . $questionBank->file_path)
            : null;

        return response()->json([
            'message' => 'Detail bank soal berhasil diambil',
            'data' => $questionBank,
        ]);
    }

    public function update(
        Request $request,
        QuestionBank $questionBank
    ) {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'exam_type' => [
                'sometimes',
                'required',
                'in:UTS,UAS',
            ],
            'file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx',
            ],
        ]);

        $updateData = [
            'title' => $validated['title'] ?? $questionBank->title,
            'description' =>
                $validated['description'] ??
                null,
            'subject' =>
                $validated['subject'] ??
                null,
            'exam_type' =>
                $validated['exam_type'] ??
                $questionBank->exam_type,
        ];

        if ($request->hasFile('file')) {
            if ($questionBank->file_path) {
                Storage::disk('public')->delete(
                    $questionBank->file_path
                );
            }

            $updateData['file_path'] =
                $request
                    ->file('file')
                    ->store(
                        'question-banks',
                        'public'
                    );
        }

        $questionBank->update($updateData);

        $questionBank->load('user');

        $questionBank->file_url =
            $questionBank->file_path
                ? asset(
                    'storage/' .
                    $questionBank->file_path
                )
                : null;

        return response()->json([
            'message' =>
                'Bank soal berhasil diperbarui',
            'data' => $questionBank,
        ]);
    }

    public function destroy(
        QuestionBank $questionBank
    ) {
        if ($questionBank->file_path) {
            Storage::disk('public')->delete(
                $questionBank->file_path
            );
        }

        $questionBank->delete();

        return response()->json([
            'message' =>
                'Bank soal berhasil dihapus',
        ]);
    }
}