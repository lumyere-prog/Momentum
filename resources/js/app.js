import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
document.addEventListener('DOMContentLoaded', () => {
    let tasks = [];

    // Fetch real tasks from the database when the page loads
    fetch('/tasks', {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Check if data is wrapped in an object (like { tasks: [...] } or pagination { data: [...] })
        if (Array.isArray(data)) {
            tasks = data;
        } else if (data.tasks && Array.isArray(data.tasks)) {
            tasks = data.tasks;
        } else if (data.data && Array.isArray(data.data)) {
            tasks = data.data;
        } else {
            tasks = [];
        }

        renderTasks();
    })
    .catch(error => console.error('Error loading tasks:', error));

    // ==========================================
    // ELEMENTS
    // ==========================================

    const taskList = document.getElementById('task-list');

    const addTaskButton = document.getElementById('add-task');
    const addTaskFooter = document.getElementById('add-task-footer');

    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');

    // Task Debt
    const debtElement = document.getElementById('task-debt');
    const debtMessage = document.getElementById('task-debt-message');
    const reviewDebtButton = document.getElementById('review-debt');

    const debtModal = document.getElementById('debt-modal');
    const closeDebtModal = document.getElementById('close-debt-modal');
    const closeDebtButton = document.getElementById('close-debt');
    const debtTaskList = document.getElementById('debt-task-list');

    // View Task Modal Elements
    const viewTaskModal = document.getElementById('view-task-modal');
    const closeViewModalBtn = document.getElementById('close-view-modal');
    const closeViewModalAction = document.getElementById('close-view-modal-btn');

    const viewTitle = document.getElementById('view-task-title');
    const viewDescription = document.getElementById('view-task-description');
    const viewPriority = document.getElementById('view-task-priority');
    const viewCategory = document.getElementById('view-task-category');
    const viewDueDate = document.getElementById('view-task-due-date');

    // Theme Toggle Elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');
    // ==========================================
    // WEEKLY COMPLETED LINE CHART
    // ==========================================

    const weeklyCanvas = document.getElementById('weekly-chart');
    let weeklyChart = null;

    function getWeekDays() {
        // Returns Mon..Sun dates for the current week as YYYY-MM-DD
        const now = new Date();
        const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
        const diffToMonday = (day === 0 ? -6 : 1 - day);

        const monday = new Date(now);
        monday.setDate(now.getDate() + diffToMonday);
        monday.setHours(0, 0, 0, 0);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    }

    function buildWeeklyData() {
        const days = getWeekDays();
        const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const counts = [0, 0, 0, 0, 0, 0, 0];

        tasks.forEach(task => {
            if (!task.completed) return;

            // Prefer completed_at, fall back to updated_at, then due_date
            const raw = task.completed_at || task.updated_at || task.due_date || task.dueDate;
            if (!raw) return;

            const clean = raw.split('T')[0];

            const idx = days.findIndex(d => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${dd}` === clean;
            });

            if (idx !== -1) counts[idx]++;
        });

        return { labels, counts };
    }

    function isDarkMode() {
        return document.documentElement.classList.contains('dark');
    }

    function chartColors() {
        const dark = isDarkMode();
        return {
            line: '#3b82f6',
            fill: dark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            grid: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            tick: dark ? '#a1a1aa' : '#52525b',
        };
    }

    function renderWeeklyChart() {
        if (!weeklyCanvas) return;

        const { labels, counts } = buildWeeklyData();
        const c = chartColors();

        if (weeklyChart) {
            weeklyChart.data.labels = labels;
            weeklyChart.data.datasets[0].data = counts;
            weeklyChart.data.datasets[0].borderColor = c.line;
            weeklyChart.data.datasets[0].backgroundColor = c.fill;
            weeklyChart.options.scales.x.ticks.color = c.tick;
            weeklyChart.options.scales.y.ticks.color = c.tick;
            weeklyChart.options.scales.x.grid.color = c.grid;
            weeklyChart.options.scales.y.grid.color = c.grid;
            weeklyChart.update();
            return;
        }

        weeklyChart = new Chart(weeklyCanvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Completed',
                    data: counts,
                    borderColor: c.line,
                    backgroundColor: c.fill,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: c.line,
                    pointBorderColor: c.line,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        displayColors: false,
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y} task${ctx.parsed.y === 1 ? '' : 's'}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: c.grid, drawBorder: false },
                        ticks: { color: c.tick, font: { size: 10 } }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: c.tick,
                            font: { size: 10 },
                            precision: 0,
                            stepSize: 1
                        },
                        grid: { color: c.grid, drawBorder: false }
                    }
                }
            }
        });
    }


    // ==========================================
    // BASIC CHECK
    // ==========================================

    if (!taskList || !taskModal || !taskForm) {
        return;
    }


    // ==========================================
    // SAVE TASKS
    // ==========================================

    function saveTasks() {
        localStorage.setItem(
            'taskflow_tasks',
            JSON.stringify(tasks)
        );
    }


    // ==========================================
    // THEME TOGGLE
    // ==========================================

    function updateThemeIcons() {
        const isDark = document.documentElement.classList.contains('dark');

        if (themeIconSun) {
            themeIconSun.classList.toggle('hidden', !isDark);
        }
        if (themeIconMoon) {
            themeIconMoon.classList.toggle('hidden', isDark);
        }
    }

    // Sync icons with whatever the inline head script already applied
    updateThemeIcons();

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcons();
        renderWeeklyChart();
    });


    // ==========================================
    // OPEN ADD TASK MODAL
    // ==========================================

    function openTaskModal() {
        taskModal.classList.remove('hidden');

        const titleInput = document.getElementById('task-title');
        if (titleInput) {
            titleInput.focus();
        }
    }


    // ==========================================
    // CLOSE ADD TASK MODAL
    // ==========================================

    function closeTaskModal() {
        taskModal.classList.add('hidden');
    }


    if (addTaskButton) {
        addTaskButton.addEventListener('click', openTaskModal);
    }

    if (addTaskFooter) {
        addTaskFooter.addEventListener('click', openTaskModal);
    }

    if (closeModal) {
        closeModal.addEventListener('click', closeTaskModal);
    }

    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
            if (event.target === taskModal) {
                closeTaskModal();
            }
        });
    }


    // ==========================================
    // PRIORITY COLORS
    // ==========================================

    function getPriorityClass(priority) {
        switch (priority) {
            case 'High':
                return 'bg-red-400/10 text-red-400';
            case 'Medium':
                return 'bg-yellow-400/10 text-yellow-400';
            case 'Low':
                return 'bg-emerald-400/10 text-emerald-400';
            default:
                return 'bg-zinc-800 text-zinc-500';
        }
    }


    // ==========================================
    // SECURITY / HTML ESCAPING
    // ==========================================

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }


    // Close View Modal Logic
    function closeViewModal() {
        if (viewTaskModal) {
            viewTaskModal.classList.add('hidden');
        }
    }

    if (closeViewModalBtn) {
        closeViewModalBtn.addEventListener('click', closeViewModal);
    }

    if (closeViewModalAction) {
        closeViewModalAction.addEventListener('click', closeViewModal);
    }

    if (viewTaskModal) {
        viewTaskModal.addEventListener('click', (event) => {
            if (event.target === viewTaskModal) {
                closeViewModal();
            }
        });
    }


    // ==========================================
    // GET OVERDUE TASKS
    // ==========================================

    function getOverdueTasks() {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        return tasks.filter(task => {
            // If it's already completed, it's not a debt
            if (task.completed) return false;

            // Get the date (handling both JS camelCase and Laravel snake_case just in case)
            const dateString = task.due_date || task.dueDate;

            // If there is no due date, it can't be overdue
            if (!dateString) return false;

            // Clean Laravel's timestamp (e.g., "2026-09-10T00:00:00.000000Z" -> "2026-09-10")
            const cleanDate = dateString.split('T')[0];

            // It is overdue if the due date is strictly before today
            return cleanDate < today;
        });
    }


    // ==========================================
    // UPDATE TASK DEBT
    // ==========================================

    function updateTaskDebt() {
        const overdueTasks = getOverdueTasks();
        const debt = overdueTasks.length;

        const debtElement = document.getElementById('task-debt');
        const debtMessage = document.getElementById('task-debt-message');

        if (debtElement) {
            debtElement.textContent = debt;
        }

        if (debtMessage) {
            if (debt === 0) {
                debtMessage.textContent = "You're all caught up. Keep the momentum going.";
            } else if (debt === 1) {
                debtMessage.textContent = "You have 1 overdue task. Take care of it.";
            } else {
                debtMessage.textContent = `You have ${debt} overdue tasks. Don't let them pile up.`;
            }
        }
    }


    // ==========================================
    // UPDATE STATS
    // ==========================================

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const remaining = total - completed;

        const percentage =
            total === 0
                ? 0
                : Math.round((completed / total) * 100);

        const totalElement = document.getElementById('total-tasks');
        if (totalElement) {
            totalElement.textContent = total;
        }

        const completedElement = document.getElementById('completed-tasks');
        if (completedElement) {
            completedElement.textContent = completed;
        }

        const remainingElement = document.getElementById('remaining-tasks');
        if (remainingElement) {
            remainingElement.textContent = remaining;
        }

        const percentageElement = document.getElementById('completion-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }

        const sidebarPercentage = document.getElementById('sidebar-percentage');
        if (sidebarPercentage) {
            sidebarPercentage.textContent = `${percentage}%`;
        }

        const productivityCircle = document.getElementById('productivity-circle');
        if (productivityCircle) {
            productivityCircle.style.setProperty('--progress', `${percentage}%`);
        }
        renderWeeklyChart();

        updateTaskDebt();

        const sidebarTaskCount = document.getElementById('sidebar-task-count');
        if (sidebarTaskCount) {
            sidebarTaskCount.textContent = `${completed} / ${total}`;
        }

        const xpEarned = completed * 30;
        const expElement = document.getElementById('total-exp');
        if (expElement) {
            expElement.textContent = xpEarned;
        }

        const streakElement = document.getElementById('current-streak');
        if (streakElement) {
            streakElement.textContent = 7;
        }
    }


    function formatDisplayDate(dateString) {
        if (!dateString) return 'Today';

        const cleanDate = dateString.split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        return cleanDate === today ? 'Today' : cleanDate;
    }


    // ==========================================
    // RENDER TASKS
    // ==========================================

    function renderTasks() {
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="w-full px-5 py-10 text-center">
                    <div class="text-3xl">✓</div>
                    <p class="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-300">
                        No tasks yet
                    </p>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        Add a task and get things done.
                    </p>
                </div>
            `;

            updateStats();
            updateTaskDebt();
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement('div');

            // Card wrapper — fixed width, snap, group for hover
            taskElement.className =
                'group relative flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-blue-200/60 bg-white/90 shadow-md shadow-blue-500/10 backdrop-blur-sm transition hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30';
            taskElement.dataset.id = task.id;

            // Priority → gradient color for the card "image" area
            const priorityGradient = {
                High:   'from-red-300 to-red-200 dark:from-red-900/50 dark:to-red-800/30',
                Medium: 'from-yellow-200 to-yellow-100 dark:from-yellow-900/50 dark:to-yellow-800/30',
                Low:    'from-emerald-200 to-emerald-100 dark:from-emerald-900/50 dark:to-emerald-800/30',
            }[task.priority] || 'from-blue-200 to-indigo-100 dark:from-zinc-800 dark:to-zinc-700';

            taskElement.innerHTML = `
                <!-- TOP "IMAGE" AREA -->
                <div class="relative h-28 w-full bg-gradient-to-br ${priorityGradient} flex items-center justify-center">

                    <!-- Priority badge in top-right -->
                    <span class="absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(task.priority)}">
                        ${escapeHtml(task.priority)}
                    </span>

                    <!-- Big task icon (placeholder image) -->
                    <svg class="h-10 w-10 text-white/70 dark:text-white/40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <circle cx="9" cy="11" r="1.5" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 17l-4.5-4.5L9 20" />
                    </svg>

                    <!-- Complete toggle (top-left) -->
                    <button
                        class="complete-task absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full border transition
                        ${
                            task.completed
                                ? 'border-emerald-500 bg-emerald-500 text-[11px] font-bold text-white'
                                : 'border-white/80 bg-white/40 hover:bg-white/70 dark:border-zinc-600 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80'
                        }"
                        data-id="${task.id}"
                        title="${task.completed ? 'Mark as incomplete' : 'Complete task'}"
                    >
                        ${task.completed ? '✓' : ''}
                    </button>

                </div>

                <!-- BOTTOM CONTENT -->
                <div class="flex flex-1 flex-col p-4">

                    <!-- Title -->
                    <p class="line-clamp-2 text-sm font-semibold ${
                        task.completed
                            ? 'text-zinc-500 line-through dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                    }">
                        ${escapeHtml(task.title)}
                    </p>

                    <!-- Placeholder "content lines" like the reference -->
                    <div class="mt-3 space-y-1.5">
                        <div class="h-2 w-3/4 rounded-full bg-blue-100 dark:bg-zinc-800"></div>
                        <div class="h-2 w-1/2 rounded-full bg-blue-100 dark:bg-zinc-800"></div>
                    </div>

                    <!-- Category + Date chips -->
                    <div class="mt-4 flex flex-wrap items-center gap-2">

                        ${
                            task.category
                                ? `<span class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-zinc-800 dark:text-zinc-300">${escapeHtml(task.category)}</span>`
                                : ''
                        }

                        <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400">
                            ${escapeHtml(formatDisplayDate(task.due_date || task.dueDate))}
                        </span>

                    </div>

                    <!-- Delete (bottom-right, hidden until hover) -->
                    <button
                        class="delete-task absolute bottom-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 opacity-0 transition group-hover:opacity-100 hover:text-red-500 dark:text-zinc-500 cursor-pointer"
                        data-id="${task.id}"
                        title="Delete task"
                    >
                        ×
                    </button>

                </div>
            `;

            taskList.appendChild(taskElement);
        });

        updateStats();
        updateTaskDebt();
    }


    // ==========================================
    // CREATE TASK (SAVING TO LARAVEL DB)
    // ==========================================

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const priorityInput = document.getElementById('task-priority');
        const categoryInput = document.getElementById('task-category');
        const dueDateInput = document.getElementById('task-due-date');

        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    title: titleInput.value.trim(),
                    description: descriptionInput ? descriptionInput.value.trim() : '',
                    priority: priorityInput.value,
                    category: categoryInput.value.trim(),
                    due_date: dueDateInput.value
                })
            });

            if (response.ok) {
                const newRecord = await response.json();

                tasks.unshift(newRecord.task);
                renderTasks();

                taskForm.reset();
                closeTaskModal();
            } else {
                const errorData = await response.json();
                console.error("Validation Failed:", errorData.errors);
                alert("Failed to save task. Please check your inputs.");
            }
        } catch (error) {
            console.error("Network Error:", error);
        }
    });


    // ==========================================
    // COMPLETE / DELETE TASK / VIEW DETAILS / COMMENTS
    // ==========================================

   taskList.addEventListener('click', (event) => {

    const completeButton = event.target.closest('.complete-task');
    const deleteButton = event.target.closest('.delete-task');
    const taskRow = event.target.closest('.group');

    // 1. Complete task
    if (completeButton) {
        event.stopPropagation();
        const id = Number(completeButton.dataset.id);
        const task = tasks.find(t => Number(t.id) === id);

        if (task) {
            task.completed = !task.completed;
            renderTasks();

            fetch(`/tasks/${id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            })
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .catch(() => {
                task.completed = !task.completed;
                renderTasks();
            });
        }
        return;
    }

    // 2. Delete task
    if (deleteButton) {
        event.stopPropagation();
        const id = Number(deleteButton.dataset.id);
        const previousTasks = [...tasks];
        tasks = tasks.filter(t => Number(t.id) !== id);
        renderTasks();

        fetch(`/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .catch(() => {
            tasks = previousTasks;
            renderTasks();
        });
        return;
    }

    // 3. Click row → open task detail page (same tab)
    if (taskRow) {
        const id = taskRow.dataset.id;
        window.location.href = `/task?task=${id}`;
    }
});


    // ==========================================
    // RENDER DEBT TASKS
    // ==========================================

    function renderDebtTasks() {
        if (!debtTaskList) {
            return;
        }

        const overdueTasks = getOverdueTasks();

        debtTaskList.innerHTML = '';

        if (overdueTasks.length === 0) {
            debtTaskList.innerHTML = `
                <div class="py-8 text-center">
                    <div class="text-2xl">✓</div>
                    <p class="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-300">
                        No task debt
                    </p>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        You're all caught up.
                    </p>
                </div>
            `;
            return;
        }

        overdueTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'flex items-center gap-3 py-3';

            taskElement.innerHTML = `
                <button
                    class="debt-complete flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-400 transition hover:border-emerald-400 hover:bg-emerald-400/10 dark:border-zinc-700"
                    data-id="${task.id}"
                    title="Complete task"
                >
                </button>

                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm text-zinc-900 dark:text-zinc-100">
                        ${escapeHtml(task.title)}
                    </p>
                    <p class="mt-1 text-[10px] text-red-400">
                        Overdue · ${escapeHtml((task.due_date || task.dueDate || '').split('T')[0])}
                    </p>
                </div>

                <button
                    class="debt-delete text-zinc-500 transition hover:text-red-400 dark:text-zinc-400"
                    data-id="${task.id}"
                    title="Delete task"
                >
                    ×
                </button>
            `;

            debtTaskList.appendChild(taskElement);
        });
    }


    // ==========================================
    // COMMENTS LOGIC
    // ==========================================

    function loadComments(taskId) {
        const commentsList = document.getElementById('modal-comments-list');
        if (!commentsList) return;

        if (!taskId) {
            commentsList.innerHTML =
                '<p class="text-xs text-zinc-500 italic dark:text-zinc-400">Select a task to view its comments.</p>';
            return;
        }

        commentsList.innerHTML = '<p class="text-xs text-zinc-500 dark:text-zinc-400">Loading comments...</p>';

        fetch(`/tasks/${taskId}/comments`, {
            headers: { 'Accept': 'application/json' }
        })
        .then(res => res.json())
        .then(comments => {
            commentsList.innerHTML = '';

            if (!Array.isArray(comments) || comments.length === 0) {
                commentsList.innerHTML =
                    '<p class="text-xs text-zinc-500 italic dark:text-zinc-400">No comments yet.</p>';
                return;
            }

            comments.forEach(comment => {
                const div = document.createElement('div');
                div.className =
                    'flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs dark:bg-zinc-800 dark:border-zinc-700';
                div.innerHTML = `
                    <span class="text-zinc-800 dark:text-zinc-200">${escapeHtml(comment.body)}</span>
                    <button class="delete-comment text-zinc-500 hover:text-red-400 ml-2 cursor-pointer dark:text-zinc-400" data-id="${comment.id}">×</button>
                `;
                commentsList.appendChild(div);
            });
        })
        .catch(err => {
            console.error('Error loading comments:', err);
            commentsList.innerHTML =
                '<p class="text-xs text-red-400">Failed to load comments.</p>';
        });
    }

    // Handle Comment Submission
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const taskId = document.getElementById('active-comment-task-id').value;
            const input = document.getElementById('comment-input');
            const body = input.value.trim();

            if (!body || !taskId) {
                if (!taskId) {
                    alert('Open a task first to comment on it.');
                }
                return;
            }

            const res = await fetch(`/tasks/${taskId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ body })
            });

            if (res.ok) {
                input.value = '';
                loadComments(taskId);
            }
        });
    }

    // Handle Comment Deletion
    const commentsListContainer = document.getElementById('modal-comments-list');
    if (commentsListContainer) {
        commentsListContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-comment')) {
                const commentId = e.target.dataset.id;
                const taskId = document.getElementById('active-comment-task-id').value;

                const res = await fetch(`/comments/${commentId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (res.ok) {
                    loadComments(taskId);
                }
            }
        });
    }


    // ==========================================
    // OPEN DEBT MODAL
    // ==========================================

    if (reviewDebtButton) {
        reviewDebtButton.addEventListener('click', () => {
            renderDebtTasks();

            if (debtModal) {
                debtModal.classList.remove('hidden');
            }
        });
    }


    // ==========================================
    // CLOSE DEBT MODAL
    // ==========================================

    function closeDebtModalWindow() {
        if (debtModal) {
            debtModal.classList.add('hidden');
        }
    }

    if (closeDebtModal) {
        closeDebtModal.addEventListener('click', closeDebtModalWindow);
    }

    if (closeDebtButton) {
        closeDebtButton.addEventListener('click', closeDebtModalWindow);
    }

    if (debtModal) {
        debtModal.addEventListener('click', (event) => {
            if (event.target === debtModal) {
                closeDebtModalWindow();
            }
        });
    }


    // ==========================================
    // DEBT COMPLETE / DELETE
    // ==========================================

    if (debtTaskList) {
        debtTaskList.addEventListener('click', (event) => {

            const completeButton = event.target.closest('.debt-complete');
            const deleteButton = event.target.closest('.debt-delete');

            if (completeButton) {
                const id = Number(completeButton.dataset.id);
                const task = tasks.find(task => task.id === id);

                if (task) {
                    task.completed = true;
                    saveTasks();
                    renderTasks();
                    renderDebtTasks();
                }
            }

            if (deleteButton) {
                const id = Number(deleteButton.dataset.id);
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
                renderDebtTasks();
            }
        });
    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    renderTasks();
});