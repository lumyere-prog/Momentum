<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Comment;
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
            'description' => $validated['description'],
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

    public function toggleComplete(Task $task)
    {
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

    // ==========================================
    // COMMENTS METHODS
    // ==========================================

    // Fetch comments for a specific task
    public function comments(Task $task)
    {
        return response()->json($task->comments()->latest()->get());
    }

    // Store a new comment
    public function storeComment(Request $request, Task $task)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:1000',
        ]);

        $comment = $task->comments()->create([
            'body' => $validated['body'],
        ]);

        return response()->json([
            'message' => 'Comment added!',
            'comment' => $comment
        ], 201);
    }

    // Delete a comment
    public function destroyComment(Comment $comment)
    {
        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted!'
        ]);
    }
}