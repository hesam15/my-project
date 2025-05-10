<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consultation_reservations', function (Blueprint $table) {
            $table->id();
            $table->string('date');
            $table->string('time', 5);
            $table->foreignId('user_id');
            $table->foreignId('consultation_id');
            $table->enum('status', ['pending', 'done', 'canceled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consultation_reservations');
    }
};
