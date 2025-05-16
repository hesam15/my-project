<?php
namespace App\Services;

use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Request;

class FileStorageService {
    public static function store($file, $user, $type, $oldFile = null) {
        if(!$file instanceof \Illuminate\Http\UploadedFile) {
            return $file;
        }
        $fileName = $file->getClientOriginalName();
        $filePath = $type.'s/'.$user->id.'/'.$fileName;

        if($type == 'video') {
            $model = \App\Models\Video::class;
            $persianName = 'فایل ویدیویی';
        } elseif($type == 'tool') {
            $model = \App\Models\ManagementTool::class; 
            $persianName = 'فایل ابزار';  
        }
        
        if($model::where($type.'_path', $filePath)->exists() && $oldFile != $filePath) {
            $response = response()->json(['message' => $persianName.' قبلا با این نام ثبت شده است'], 409);
            throw new HttpResponseException($response);
        }

        $path = $oldFile != $filePath 
            ? $file->storeAs($type.'s/'.$user->id, $fileName, 'public') 
            : $oldFile;

        return $path;
    }
}