<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Task Details - Momentum</title>
    <script>
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 text-zinc-900 antialiased dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-100">

<div class="min-h-screen">

    <header>
        <div class="mx-auto w-full px-10 py-2">
            <div class="flex items-center justify-between py-4">

                <a href="/" class="flex items-center gap-3">
                    <div class="flex h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                        <img src="{{ asset('images/logo2.png') }}" alt="Logo" class="h-full w-full object-contain">
                    </div>
                    <p class="text-sm font-bold text-zinc-900 sm:text-base dark:text-zinc-100">
                        Task Details
                    </p>
                </a>

                <a href="/"
                   class="rounded-lg border border-blue-200 bg-white/70 px-4 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    ← Back to tasks
                </a>

            </div>
        </div>
    </header>

    <main class="mx-auto w-full max-w-3xl px-10 py-6 space-y-5">

        <!-- TASK DETAILS CARD -->
        <div class="rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">

            <div class="flex items-start justify-between gap-4 mb-5">
                <h1 id="task-title" class="text-lg font-semibold text-zinc-900 dark:text-white">
                    Loading...
                </h1>
                <span id="task-priority" class="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium"></span>
            </div>

            <div class="mb-5">
                <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Description</span>
                <p id="task-description" class="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-sm text-zinc-800 min-h-[60px] whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"></p>
            </div>

            <div class="grid grid-cols-2 gap-5">
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Category</span>
                    <span id="task-category" class="text-sm text-zinc-700 dark:text-zinc-300">None</span>
                </div>
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Due Date</span>
                    <span id="task-due-date" class="text-sm text-zinc-700 dark:text-zinc-300">—</span>
                </div>
            </div>

        </div>

        <!-- COMMENTS CARD -->
        <div class="rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">

            <div class="mb-5 border-b border-blue-100 pb-4 dark:border-zinc-800">
                <h2 class="text-sm font-semibold text-zinc-900 dark:text-white">Activity & Comments</h2>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Share updates or notes about this task.</p>
            </div>

            <div id="comments-list" class="mb-5 space-y-3">
                <p class="text-xs text-zinc-500 italic dark:text-zinc-400">Loading comments...</p>
            </div>

            <form id="comment-form" class="flex gap-2">
                <input
                    type="text"
                    id="comment-input"
                    placeholder="Write a comment..."
                    required
                    class="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                >
                <button
                    type="submit"
                    class="cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-500/30 transition hover:from-blue-700 hover:to-indigo-700"
                >
                    Post
                </button>
            </form>

        </div>

    </main>

</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task');

    const taskTitle = document.getElementById('task-title');
    const taskPriority = document.getElementById('task-priority');
    const taskDescription = document.getElementById('task-description');
    const taskCategory = document.getElementById('task-category');
    const taskDueDate = document.getElementById('task-due-date');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');

    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case 'High':   return 'bg-red-400/10 text-red-400';
            case 'Medium': return 'bg-yellow-400/10 text-yellow-400';
            case 'Low':    return 'bg-emerald-400/10 text-emerald-400';
            default:       return 'bg-zinc-800 text-zinc-500';
        }
    }

    if (!taskId) {
        taskTitle.textContent = 'No task selected';
        taskDescription.textContent = 'Go back and click a task to see its details.';
        commentForm.style.display = 'none';
        return;
    }

    // Load details ng task dito
    fetch('/tasks', { headers: { 'Accept': 'application/json' } })
        .then(res => res.json())
        .then(data => {
            const tasks = Array.isArray(data) ? data : (data.tasks || data.data || []);
            const task = tasks.find(t => String(t.id) === String(taskId));

            if (!task) {
                taskTitle.textContent = `Task #${taskId}`;
                return;
            }

            taskTitle.textContent = task.title;
            taskDescription.textContent = task.description || 'No description provided.';

            taskPriority.textContent = task.priority;
            taskPriority.className = `shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(task.priority)}`;

            taskCategory.textContent = task.category || 'None';

            const due = task.due_date || task.dueDate;
            taskDueDate.textContent = due ? due.split('T')[0] : 'No due date';
        })
        .catch(err => {
            console.error('Failed to load task:', err);
            taskTitle.textContent = `Task #${taskId}`;
        });

    // Load comments
    function loadComments() {
        commentsList.innerHTML = '<p class="text-xs text-zinc-500 dark:text-zinc-400">Loading comments...</p>';

        fetch(`/tasks/${taskId}/comments`, { headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(comments => {
                commentsList.innerHTML = '';

                if (!Array.isArray(comments) || comments.length === 0) {
                    commentsList.innerHTML = '<p class="text-xs text-zinc-500 italic dark:text-zinc-400">No comments yet.</p>';
                    return;
                }

                comments.forEach(comment => {
                    const div = document.createElement('div');
                    div.className = 'flex items-start justify-between gap-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-sm dark:bg-zinc-800 dark:border-zinc-700';
                    div.innerHTML = `
                        <div class="min-w-0 flex-1">
                            <p class="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">${escapeHtml(comment.body)}</p>
                            ${comment.created_at ? `<p class="mt-1 text-[10px] text-zinc-500 dark:text-zinc-500">${escapeHtml(new Date(comment.created_at).toLocaleString())}</p>` : ''}
                        </div>
                        <button class="delete-comment shrink-0 text-zinc-500 hover:text-red-400 cursor-pointer dark:text-zinc-400" data-id="${comment.id}" title="Delete">×</button>
                    `;
                    commentsList.appendChild(div);
                });
            })
            .catch(err => {
                console.error('Error loading comments:', err);
                commentsList.innerHTML = '<p class="text-xs text-red-400">Failed to load comments.</p>';
            });
    }

    loadComments();

    // Post comment
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = commentInput.value.trim();
        if (!body) return;

        const res = await fetch(`/tasks/${taskId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ body })
        });

        if (res.ok) {
            commentInput.value = '';
            loadComments();
        }
    });

    // Delete comment
    commentsList.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('delete-comment')) return;
        const commentId = e.target.dataset.id;

        const res = await fetch(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            }
        });

        if (res.ok) loadComments();
    });
});
</script>

</body>
</html>