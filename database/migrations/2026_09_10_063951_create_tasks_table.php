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

        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // For "Task Title"
            $table->string('priority')->default('Medium'); // For "Priority" dropdown
            $table->string('category')->nullable(); // For "Category"
            $table->text('description')->nullable(); // For "Description"
            $table->date('due_date'); // For "Due Date"
            $table->boolean('completed')->default(false); // Background tracker
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }

    
};
