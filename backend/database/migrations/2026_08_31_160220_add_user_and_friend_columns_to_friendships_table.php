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
        Schema::table('friendships', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->after('id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('friend_id')
                ->after('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('status')
                ->default('pending')
                ->after('friend_id');

            $table->unique(['user_id', 'friend_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('friendships', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['friend_id']);
            $table->dropUnique(['friendships_user_id_friend_id_unique']);

            $table->dropColumn([
                'user_id',
                'friend_id',
                'status',
            ]);
        });
    }
};