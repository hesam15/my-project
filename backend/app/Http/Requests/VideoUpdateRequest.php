<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;

class VideoUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exceptions\HttpResponseException
     */
    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();

        throw new HttpResponseException(response()->json([
            'message' => 'Invalid data send',
            'details' => $errors->messages(),
        ], 422));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string',
            'video_path' => [
                'required',
                function ($attribute, $value, $fail) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        $mimetypes = ['video/avi', 'video/mpeg', 'video/mp4', 'video/quicktime'];
                        if (!in_array($value->getMimeType(), $mimetypes)) {
                            $fail('فایل ویدیویی باید یکی از فرمت‌های avi، mpeg، mp4 یا quicktime باشد.');
                        }
                    } elseif (is_string($value)) {
                        if (!preg_match('/^videos\/[0-9]+\/[a-zA-Z0-9_\-\.]+\.(mp4|avi|mpeg|mov)$/', $value)) {
                            $fail('مسیر ویدیوی فعلی معتبر نیست.');
                        }
                    } else {
                        $fail('فیلد video_path باید یا یک فایل ویدیویی باشد یا یک مسیر معتبر.');
                    }
                },
            ],
            'thumbnail_path' => 'nullable',
        ];
    }
}
