<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagementToolStoreRequest;
use App\Http\Requests\ManagementToolUpdateRequest;
use App\Models\ManagementTool;
use App\Services\FileStorageService;
use Laravel\Sanctum\PersonalAccessToken;
use App\Services\ThumbnailStorageService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Request;

class ManagementToolController extends Controller
{
    protected $user;

    public function __construct() {
        $token = PersonalAccessToken::findToken(Request::cookie('auth_token'));
        if($token) {
            $this->user = $token->tokenable;
        }
    }

    public function index() {
        $managementTools = ManagementTool::all();

        return response()->json($managementTools);
    }

    public function show(ManagementTool $tool) {
        $tool = ManagementTool::with('comments')->findOrFail($tool->id);
        return response()->json($tool);
    }

    public function store(ManagementToolStoreRequest $request) {
        $toolPath = FileStorageService::store($request->tool_path, $this->user, 'tool');
        $thumbnailPath = ThumbnailStorageService::store($request->file('thumbnail_path'), $this->user, 'video');

        $managementTool = ManagementTool::create([
            'name' => $request->name,
            'description' => $request->description,
            'tool_path' => $toolPath,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'ابزار با موفقیت اضافه شد',
            'managementTool' => $managementTool
        ]);
    }

    public function update(ManagementToolUpdateRequest $request, ManagementTool $managementTool) {
        $toolPath = FileStorageService::store($request->tool_path, $this->user, 'tool', $managementTool->tool_path);
        $thumbnailPath = ThumbnailStorageService::store($request->file('thumbnail_path'), $this->user, 'video');

        $managementTool->update([
            'name' => $request->name,
            'description' => $request->description,
            'tool_path' => $toolPath,
            'thumbnail_path' => $thumbnailPath,
            'is_premium' => boolval($request->is_premium),
            'user_id' => $this->user->id
        ]);

        return response()->json([
            'message' => 'ابزار با موفقیت بروزرسانی شد',
            'managementTool' => $managementTool
        ]);
    }

    public function destroy(ManagementTool $tool) {
        Storage::disk('public')->delete($tool->tool_path);
        Storage::disk('public')->delete($tool->thumbnail_path);

        $tool->delete();

        return response()->json([
            'message' => 'ابزار با موفقیت حذف شد'
        ]);
    }
}
