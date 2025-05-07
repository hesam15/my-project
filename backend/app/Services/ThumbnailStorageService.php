<?php
namespace App\Services;

use Illuminate\Support\Facades\Request;
use Illuminate\Http\Exceptions\HttpResponseException;

class ThumbnailStorageService {
    public static function store($thumbnail, $user, $type, $oldThumbnail = null) {
        if(!$thumbnail instanceof \Illuminate\Http\UploadedFile) {
            return $thumbnail;
        }

        $thumbnailName = $thumbnail->getClientOriginalName();
        $thumbnailPath = 'images/'.$user->id.'/'.$type.'_thumbnails/'.$thumbnailName;

        if($type == 'video') {
           $model = \App\Models\Video::class;
        } elseif($type == 'course') {
            $model = \App\Models\Course::class;
        } elseif($type == 'post') {
            $model = \App\Models\Post::class;
        }

        if($model::where('thumbnail_path', $thumbnailPath)->exists() && $oldThumbnail != $thumbnailPath) {
            $response = response()->json(['message' => 'فایل تامبنیل ویدیویی قبلا با این نام ثبت شده است'], 409);
            throw new HttpResponseException($response);
        }

        $path = $thumbnail->storeAs('images/'.$user->id.'/'.$type.'_thumbnails' ,$thumbnailName ,'public');

        return $path;
    }
}