<?php

namespace App\Http\Requests;

use App\Models\ManagementTool;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ManagementToolUpdateRequest extends FormRequest
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
        $toolId = $this->route('tool');

        return [
            'name' => ['required', 'string', Rule::unique('management_tools', 'name')->ignore($toolId)],
            'description' => 'nullable|string',
            'tool_path' => [
                'required',
                function ($attribute, $value, $fail) {
                    if ($value instanceof \Illuminate\Http\UploadedFile) {
                        $mimetypes = ['application/pdf']; // فقط PDF
                        if (!in_array($value->getMimeType(), $mimetypes)) {
                            $fail('فایل باید از نوع PDF باشد.');
                        }
                    } elseif (is_string($value)) {
                        if (!preg_match('/^tools\/[0-9]+\/[a-zA-Z0-9_\-\.]+\.pdf$/', $value)) {
                            $fail('مسیر فایل PDF فعلی معتبر نیست.');
                        }
                    } else {
                        $fail('فیلد video_path باید یا یک فایل PDF باشد یا یک مسیر معتبر.');
                    }
                },
            ],
            'thumbnail_path' => 'nullable',
            'is_premium' => 'required|boolean'
        ];
    }
}
