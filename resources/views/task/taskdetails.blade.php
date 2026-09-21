@extends('layouts.app')

@section('title', 'Task Details - Momentum')

@section('content')
    <main class="mx-auto w-full max-w-3xl px-10 py-6 space-y-5">

        <div id="task-card" class="rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">

            <div class="flex items-start justify-between gap-4 mb-5">
                <h1 id="task-title" class="text-lg font-semibold text-zinc-900 dark:text-white min-w-0">
                    Loading...
                </h1>

                <div class="flex shrink-0 items-center gap-2">
                    <button id="edit-task-btn" type="button"
                        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer
                            border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800
                            dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white">
                        <img src="{{ asset('images/edit.png') }}" alt="" class="h-3.5 w-3.5">
                        <span>Edit</span>
                    </button>

                    <button id="toggle-complete" type="button"
                        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer
                            border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800
                            dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
                        data-completed="0">
                        <img id="done-icon" src="{{ asset('images/check.png') }}" alt="" class="h-3.5 w-3.5">
                        <img id="undo-icon" src="{{ asset('images/undo.png') }}" alt="" class="hidden h-3.5 w-3.5">
                        <span id="done-label">Done</span>
                    </button>
                </div>
            </div>

            <div class="mb-5">
                <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Description</span>
                <p id="task-description" class="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-sm text-zinc-800 min-h-[60px] whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"></p>
            </div>

            <div class="grid grid-cols-3 gap-5">
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Category</span>
                    <span id="task-category" class="text-sm text-zinc-700 dark:text-zinc-300">None</span>
                </div>
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Due Date</span>
                    <span id="task-due-date" class="text-sm text-zinc-700 dark:text-zinc-300">—</span>
                </div>
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Priority</span>
                    <span id="task-priority" class="rounded-md px-2 py-0.5 font-medium"></span>
                </div>
            </div>
        </div>

        <div id="comments-card" class="rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">
            <div id="comments-header" class="mb-5 border-b border-blue-100 pb-4 dark:border-zinc-800">
                <h2 class="text-sm font-semibold text-zinc-900 dark:text-white">Activity & Comments</h2>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Share updates or notes about this task.</p>
            </div>

            <div id="comments-list" class="mb-5 space-y-3">
                <p class="text-xs text-zinc-500 italic dark:text-zinc-400">Loading comments...</p>
            </div>

            <form id="comment-form" class="flex gap-2">
                <input type="text" id="comment-input" placeholder="Write a comment..." required
                    class="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500">
                <button type="submit"
                    class="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700">
                    Post
                </button>
            </form>
        </div>

        <div id="edit-task-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
                <div class="mb-6 flex items-center justify-between">
                    <div>
                        <h2 class="text-lg font-semibold text-white">Edit Task</h2>
                        <p class="text-sm text-zinc-400">Update your task details.</p>
                    </div>
                    <button id="close-edit-modal" type="button" class="text-2xl text-zinc-400 hover:text-white">&times;</button>
                </div>

                <form id="edit-task-form" class="space-y-4">
                    <div>
                        <label class="mb-1 block text-sm font-medium text-zinc-300">Task Title</label>
                        <input id="edit-task-title" type="text" required class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500">
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-zinc-300">Description</label>
                        <textarea id="edit-task-description" rows="3" class="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"></textarea>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-zinc-300">Priority</label>
                        <select id="edit-task-priority" required class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500">
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-zinc-300">Category</label>
                        <input id="edit-task-category" type="text" class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500">
                    </div>

                    <div>
                        <label class="mb-1 block text-sm font-medium text-zinc-300">Due Date</label>
                        <input id="edit-task-due-date" type="date" required class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500">
                    </div>

                    <div class="flex justify-end gap-2 pt-3">
                        <button id="cancel-edit" type="button" class="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button>
                        <button type="submit" class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    </main>
@endsection