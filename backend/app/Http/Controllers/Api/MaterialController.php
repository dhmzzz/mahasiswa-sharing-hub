<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index()
    {
        $materials = Material::with('user')
            ->latest()
            ->get()
            ->map(function ($material) {
                $material->file_url = $material->file_path
                    ? asset('storage/' . $material->file_path)
                    : null;

                return $material;
            });

        return response()->json([
            'message' => 'Daftar material berhasil diambil',
            'data' => $materials,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
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
                ->store('materials', 'public');
        }

        $material = Material::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'subject' => $validated['subject'] ?? null,
            'file_path' => $filePath,
        ]);

        $material->load('user');

        $material->file_url = $filePath
            ? asset('storage/' . $filePath)
            : null;

        return response()->json([
            'message' => 'Material berhasil dibuat',
            'data' => $material,
        ], 201);
    }

    public function show(Material $material)
    {
        $material->load('user');

        $material->file_url = $material->file_path
            ? asset('storage/' . $material->file_path)
            : null;

        return response()->json([
            'message' => 'Detail material berhasil diambil',
            'data' => $material,
        ]);
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subject' => ['nullable', 'string', 'max:255'],
            'file' => [
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx',
            ],
        ]);

        $updateData = [
            'title' => $validated['title'] ?? $material->title,
            'description' => $validated['description'] ?? null,
            'subject' => $validated['subject'] ?? null,
        ];

        if ($request->hasFile('file')) {
            if ($material->file_path) {
                Storage::disk('public')->delete(
                    $material->file_path
                );
            }

            $updateData['file_path'] = $request
                ->file('file')
                ->store('materials', 'public');
        }

        $material->update($updateData);
        $material->load('user');

        $material->file_url = $material->file_path
            ? asset('storage/' . $material->file_path)
            : null;

        return response()->json([
            'message' => 'Material berhasil diperbarui',
            'data' => $material,
        ]);
    }

    public function destroy(Material $material)
    {
        if ($material->file_path) {
            Storage::disk('public')->delete(
                $material->file_path
            );
        }

        $material->delete();

        return response()->json([
            'message' => 'Material berhasil dihapus',
        ]);
    }
}