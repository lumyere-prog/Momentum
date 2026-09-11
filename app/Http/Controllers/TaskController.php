<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // Fetch all tasks for the dashboard
    public function index()
    {
        return response()->json(Task::orderBy('created_at', 'desc')->get());
    }

    // Save the data from your modal
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'priority'    => 'required|string|in:Low,Medium,High',
            'category'    => 'nullable|string|max:100',
            'due_date'    => 'required|date', 
        ]);

        $task = Task::create([
            'title'       => $validated['title'],
            'description' => $validated['description'], // <-- Add this line!
            'priority'    => $validated['priority'],
            'category'    => $validated['category'],
            'due_date'    => $validated['due_date'],
            'completed'   => false,
        ]);

        return response()->json([
            'message' => 'Task saved successfully!',
            'task'    => $task
        ], 201);
    }
    // Add this inside TaskController
    public function toggleComplete(Task $task)
    {
        // Flip the current status (true becomes false, false becomes true)
        $task->completed = !$task->completed;
        $task->save();

        return response()->json([
            'message' => 'Task completion updated!',
            'task' => $task
        ]);
    }
    // Delete the task from the database
    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully!'
        ]);
    }
}