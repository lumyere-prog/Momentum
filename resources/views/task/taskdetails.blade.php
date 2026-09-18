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

<body class="min-h-screen 

bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 text-zinc-900 antialiased dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-100">

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

                <a href="/task"
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

    <h1 id="task-title" class="text-lg font-semibold text-zinc-900 dark:text-white min-w-0">
        Loading...
    </h1>

    <div class="flex shrink-0 items-center gap-2">

        {{-- PRIORITY BADGE --}}
        <span id="task-priority" class="rounded-md px-2 py-0.5 text-[10px] font-medium"></span>

        {{-- 🆕 EDIT BUTTON --}}
            <button
            id="edit-task-btn"
            type="button"
            class="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
            Edit
        </button>

        {{-- 🆕 DONE BUTTON --}}
        <button
            id="toggle-complete"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer
                border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800
                dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
            data-completed="0"
        >
            <svg id="done-icon" class="hidden h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span id="done-label">Done</span>
        </button>

    </div>

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


        <!-- EDIT -->
                            <!-- Edit Task Modal -->
                    <div
                        id="edit-task-modal"
                        class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 px-4"
                    >
                        <div class="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">

                            <!-- Modal Header -->
                            <div class="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 class="text-lg font-semibold text-white">Edit Task</h2>
                                    <p class="text-sm text-zinc-400">Update your task details.</p>
                                </div>

                                <button
                                    id="close-edit-modal"
                                    type="button"
                                    class="text-2xl text-zinc-400 hover:text-white"
                                >
                                    &times;
                                </button>
                            </div>

                            <!-- Edit Form -->
                            <form id="edit-task-form" class="space-y-4">

                                <!-- Title -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-300">
                                        Task Title
                                    </label>

                                    <input
                                        id="edit-task-title"
                                        type="text"
                                        required
                                        class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                                    >
                                </div>

                                <!-- Description -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-300">
                                        Description
                                    </label>

                                    <textarea
                                        id="edit-task-description"
                                        rows="3"
                                        class="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                                    ></textarea>
                                </div>

                                <!-- Priority -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-300">
                                        Priority
                                    </label>

                                    <select
                                        id="edit-task-priority"
                                        required
                                        class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <!-- Category -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-300">
                                        Category
                                    </label>

                                    <input
                                        id="edit-task-category"
                                        type="text"
                                        class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                                    >
                                </div>

                                <!-- Due Date -->
                                <div>
                                    <label class="mb-1 block text-sm font-medium text-zinc-300">
                                        Due Date
                                    </label>

                                    <input
                                        id="edit-task-due-date"
                                        type="date"
                                        required
                                        class="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                                    >
                                </div>

                                <!-- Buttons -->
                                <div class="flex justify-end gap-2 pt-3">
                                    <button
                                        id="cancel-edit"
                                        type="button"
                                        class="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
                                    >
                                        Save Changes
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

    </main>

</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('task');


    let currentTask = null;

    const editTaskBtn = document.getElementById('edit-task-btn');
    const editTaskModal = document.getElementById('edit-task-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const editTaskForm = document.getElementById('edit-task-form');

    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDescription = document.getElementById('edit-task-description');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const editTaskCategory = document.getElementById('edit-task-category');
    const editTaskDueDate = document.getElementById('edit-task-due-date');


    const taskTitle = document.getElementById('task-title');
    const taskPriority = document.getElementById('task-priority');
    const taskDescription = document.getElementById('task-description');
    const taskCategory = document.getElementById('task-category');
    const taskDueDate = document.getElementById('task-due-date');
    const toggleCompleteBtn = document.getElementById('toggle-complete');
    const doneIcon = document.getElementById('done-icon');
    const doneLabel = document.getElementById('done-label');
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

currentTask = task;

            taskTitle.textContent = task.title;
            taskDescription.textContent = task.description || 'No description provided.';
            // Reflect current completed state on the Done button
            if (toggleCompleteBtn && typeof applyCompleteStyle === 'function') {
                const isDone = task.completed === true || task.completed === 1 || task.completed === '1';
                toggleCompleteBtn.dataset.completed = isDone ? '1' : '0';
                applyCompleteStyle(isDone);
            }
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

        // ==========================================
    // DONE / UNDO BUTTON
    // ==========================================

    function applyCompleteStyle(isComplete) {
    if (!toggleCompleteBtn || !doneIcon || !doneLabel) return;

    if (isComplete) {
        // RED = "Undo" state (no icon)
        toggleCompleteBtn.className =
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ' +
            'border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 ' +
            'dark:border-red-400 dark:bg-red-400 dark:text-zinc-900 dark:hover:bg-red-300';
        doneIcon.classList.add('hidden');   // ← always hidden
        doneLabel.textContent = 'Undo';

        // Line through the title
        taskTitle.classList.add('line-through', 'text-zinc-400', 'dark:text-zinc-500');
    } else {
        // DEFAULT = "Done" state (blue outline)
        toggleCompleteBtn.className =
            'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ' +
            'border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 ' +
            'dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white';
        doneIcon.classList.add('hidden');   // ← always hidden
        doneLabel.textContent = 'Done';

        // Remove line through
        taskTitle.classList.remove('line-through', 'text-zinc-400', 'dark:text-zinc-500');
    }
}

    if (toggleCompleteBtn) {
        toggleCompleteBtn.addEventListener('click', async () => {
            const isCurrentlyComplete = toggleCompleteBtn.dataset.completed === '1';
            const newState = !isCurrentlyComplete;

            toggleCompleteBtn.dataset.completed = newState ? '1' : '0';
            applyCompleteStyle(newState);

            try {
                const res = await fetch(`/tasks/${taskId}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    }
                });

                if (!res.ok) throw new Error('Failed to toggle');
            } catch (err) {
                console.error(err);
                toggleCompleteBtn.dataset.completed = isCurrentlyComplete ? '1' : '0';
                applyCompleteStyle(isCurrentlyComplete);
                alert('Could not update task. Please try again.');
            }
        });
    }
    // Open Edit Modal
editTaskBtn.addEventListener('click', () => {
    if (!currentTask) return;

    editTaskTitle.value = currentTask.title || '';
    editTaskDescription.value = currentTask.description || '';
    editTaskPriority.value = currentTask.priority || 'Medium';
    editTaskCategory.value = currentTask.category || '';

    const due = currentTask.due_date || currentTask.dueDate;
    editTaskDueDate.value = due ? String(due).split('T')[0] : '';

    editTaskModal.classList.remove('hidden');
    editTaskModal.classList.add('flex');
});

// Close Edit Modal
function closeEditTaskModal() {
    editTaskModal.classList.add('hidden');
    editTaskModal.classList.remove('flex');
}

closeEditModal.addEventListener('click', closeEditTaskModal);
cancelEdit.addEventListener('click', closeEditTaskModal);

editTaskModal.addEventListener('click', (event) => {
    if (event.target === editTaskModal) {
        closeEditTaskModal();
    }
});

// Save Edited Task
editTaskForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document
                    .querySelector('meta[name="csrf-token"]')
                    .getAttribute('content')
            },
            body: JSON.stringify({
                title: editTaskTitle.value.trim(),
                description: editTaskDescription.value.trim(),
                priority: editTaskPriority.value,
                category: editTaskCategory.value.trim(),
                due_date: editTaskDueDate.value
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);
            alert('Failed to update task.');
            return;
        }

        currentTask = data.task;

        // Update task details on the page
        taskTitle.textContent = currentTask.title;
        taskDescription.textContent =
            currentTask.description || 'No description provided.';

        taskCategory.textContent =
            currentTask.category || 'None';

        const due = currentTask.due_date || currentTask.dueDate;
        taskDueDate.textContent =
            due ? String(due).split('T')[0] : 'No due date';

        taskPriority.textContent = currentTask.priority;
        taskPriority.className =
            `shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(currentTask.priority)}`;

        closeEditTaskModal();

    } catch (error) {
        console.error('Failed to update task:', error);
        alert('Something went wrong while updating the task.');
    }
});

});
</script>

</body>
</html>