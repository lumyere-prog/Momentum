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

    const debtElement = document.getElementById('task-debt');
    const debtMessage = document.getElementById('task-debt-message');
    const reviewDebtButton = document.getElementById('review-debt');
    const debtModal = document.getElementById('debt-modal');
    const closeDebtModal = document.getElementById('close-debt-modal');
    const closeDebtButton = document.getElementById('close-debt');
    const debtTaskList = document.getElementById('debt-task-list');

    const viewTaskModal = document.getElementById('view-task-modal');
    const closeViewModalBtn = document.getElementById('close-view-modal');
    const closeViewModalAction = document.getElementById('close-view-modal-btn');

    const themeToggle = document.getElementById('theme-toggle');
    const themeIconSun = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    // ==========================================
    // HELPERS
    // ==========================================

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

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

    function formatDisplayDate(dateString) {
        if (!dateString) return 'Today';
        const cleanDate = dateString.split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return cleanDate === today ? 'Today' : cleanDate;
    }

    function saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }

    // ==========================================
    // SORT: unfinished first, finished last
    // ==========================================

    function sortTasks(list) {
        return [...list].sort((a, b) => {
            const aDone = a.completed === true || a.completed === 1 || a.completed === '1';
            const bDone = b.completed === true || b.completed === 1 || b.completed === '1';

            // Unfinished (false) comes before finished (true)
            if (aDone !== bDone) return aDone ? 1 : -1;
            return 0;
        });
    }

    // ==========================================
    // THEME
    // ==========================================

    function updateThemeIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        if (themeIconSun) themeIconSun.classList.toggle('hidden', !isDark);
        if (themeIconMoon) themeIconMoon.classList.toggle('hidden', isDark);
    }

    updateThemeIcons();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
        });
    }

    // ==========================================
    // ADD TASK MODAL
    // ==========================================

    function openTaskModal() {
        taskModal.classList.remove('hidden');
        const titleInput = document.getElementById('task-title');
        if (titleInput) titleInput.focus();

        const dueDateInput = document.getElementById('task-due-date');
        if (dueDateInput && !dueDateInput.value) {
            dueDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    function closeTaskModal() {
        taskModal.classList.add('hidden');
    }

    if (addTaskButton) addTaskButton.addEventListener('click', openTaskModal);
    if (addTaskFooter) addTaskFooter.addEventListener('click', openTaskModal);
    if (closeModal) closeModal.addEventListener('click', closeTaskModal);
    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
            if (event.target === taskModal) closeTaskModal();
        });
    }

    // ==========================================
    // VIEW MODAL
    // ==========================================

    function closeViewModal() {
        if (viewTaskModal) viewTaskModal.classList.add('hidden');
    }

    if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeViewModal);
    if (closeViewModalAction) closeViewModalAction.addEventListener('click', closeViewModal);
    if (viewTaskModal) {
        viewTaskModal.addEventListener('click', (event) => {
            if (event.target === viewTaskModal) closeViewModal();
        });
    }

    // ==========================================
    // OVERDUE / DEBT
    // ==========================================

    function getOverdueTasks() {
        const today = new Date().toISOString().split('T')[0];
        return tasks.filter(task => {
            if (task.completed) return false;
            const dateString = task.due_date || task.dueDate;
            if (!dateString) return false;
            const cleanDate = dateString.split('T')[0];
            return cleanDate < today;
        });
    }

    function updateTaskDebt() {
        const overdueTasks = getOverdueTasks();
        const debt = overdueTasks.length;

        const debtEl = document.getElementById('task-debt');
        const debtMsg = document.getElementById('task-debt-message');

        if (debtEl) debtEl.textContent = debt;

        if (debtMsg) {
            if (debt === 0) debtMsg.textContent = "You're all caught up. Keep the momentum going.";
            else if (debt === 1) debtMsg.textContent = "You have 1 overdue task. Take care of it.";
            else debtMsg.textContent = `You have ${debt} overdue tasks. Don't let them pile up.`;
        }
    }

    // ==========================================
    // STATS
    // ==========================================

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const remaining = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        set('total-tasks', total);
        set('completed-tasks', completed);
        set('remaining-tasks', remaining);
        set('completion-percentage', `${percentage}%`);
        set('sidebar-percentage', `${percentage}%`);
        set('sidebar-task-count', `${completed} / ${total}`);
        set('total-exp', completed * 30);
        set('current-streak', 7);

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = `${percentage}%`;

        const circle = document.getElementById('productivity-circle');
        if (circle) circle.style.setProperty('--progress', `${percentage}%`);

        updateTaskDebt();
    }

    // ==========================================
    // 🚀 ROCKET POPUP
    // ==========================================

    function showRocketCongrats(message = 'Congrats! 🎉') {
        // Remove any existing popup
        document.querySelectorAll('.rocket-popup').forEach(el => el.remove());

        const popup = document.createElement('div');
        popup.className = 'rocket-popup';
        popup.innerHTML = `
            <div class="rocket-inner">
                <div class="rocket-emoji">🚀</div>
                <div class="rocket-text">${escapeHtml(message)}</div>
            </div>
        `;
        document.body.appendChild(popup);

        // Fade out then remove
        setTimeout(() => popup.classList.add('hiding'), 1400);
        setTimeout(() => popup.remove(), 2000);
    }

    // ==========================================
    // TOGGLE COMPLETE
    // ==========================================

    async function toggleTaskComplete(id, options = {}) {
        const { showRocket = false } = options;
        const task = tasks.find(t => Number(t.id) === Number(id));
        if (!task) return;

        const wasCompleted = task.completed === true || task.completed === 1 || task.completed === '1';

        // Optimistic flip
        task.completed = !wasCompleted;
        saveTasks();
        renderTasks();

        // Show rocket only when marking DONE (not undo)
        if (!wasCompleted && showRocket) {
            showRocketCongrats('Congrats! Task done! 🎉');
        }

        try {
            const res = await fetch(`/tasks/${id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            if (!res.ok) throw new Error();
        } catch {
            // Revert
            task.completed = wasCompleted;
            saveTasks();
            renderTasks();
        }
    }

    // ==========================================
    // FILTER + SEARCH STATE
    // ==========================================

    let currentFilter = 'all';
    let searchName = '';
    let searchPriority = '';
    let searchDate = '';

    function getVisibleTasks() {
        const filtered = tasks.filter(task => {
            if (currentFilter === 'finished' && !task.completed) return false;
            if (currentFilter === 'unfinished' && task.completed) return false;

            if (searchName) {
                const title = (task.title || '').toLowerCase();
                const category = (task.category || '').toLowerCase();
                if (!title.includes(searchName) && !category.includes(searchName)) return false;
            }

            if (searchPriority) {
                if ((task.priority || '') !== searchPriority) return false;
            }

            if (searchDate) {
                const due = (task.due_date || task.dueDate || '').split('T')[0];
                if (due !== searchDate) return false;
            }

            return true;
        });

        // 🎯 Sort: unfinished first, finished last
        return sortTasks(filtered);
    }

    function updateFilterButtonStyles() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            const isActive = btn.dataset.filter === currentFilter;
            btn.className = isActive
                ? 'filter-btn rounded-md px-3 py-1.5 text-xs font-medium transition bg-white text-blue-700 shadow-sm dark:bg-zinc-700 dark:text-white'
                : 'filter-btn rounded-md px-3 py-1.5 text-xs font-medium transition text-zinc-600 hover:text-blue-700 dark:text-zinc-400 dark:hover:text-white';
        });
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            updateFilterButtonStyles();
            renderTasks();
        });
    });

    const searchNameInput = document.getElementById('search-name');
    const searchPriorityInput = document.getElementById('search-priority');
    const searchDateInput = document.getElementById('search-date');

    if (searchNameInput) {
        searchNameInput.addEventListener('input', (e) => {
            searchName = e.target.value.toLowerCase().trim();
            renderTasks();
        });
    }
    if (searchPriorityInput) {
        searchPriorityInput.addEventListener('change', (e) => {
            searchPriority = e.target.value;
            renderTasks();
        });
    }
    if (searchDateInput) {
        searchDateInput.addEventListener('input', (e) => {
            searchDate = e.target.value;
            renderTasks();
        });
    }

    updateFilterButtonStyles();

    // ==========================================
    // RENDER TASKS
    // ==========================================

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';

        const visibleTasks = getVisibleTasks();

        if (visibleTasks.length === 0) {
            const message = tasks.length === 0
                ? 'Add a task and get things done.'
                : 'No tasks match your filters.';

            taskList.innerHTML = `
                <div class="px-5 py-10 text-center">
                    <div class="text-3xl">✓</div>
                    <p class="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-300">
                        No tasks to show
                    </p>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        ${message}
                    </p>
                </div>
            `;

            updateStats();
            updateTaskDebt();
            return;
        }

        visibleTasks.forEach(task => {
            const taskElement = document.createElement('div');

            const rowClasses = task.completed
                ? 'group flex items-center gap-4 border-b border-blue-100/70 px-5 py-4 transition cursor-pointer bg-emerald-50/70 dark:border-zinc-800/70 dark:bg-emerald-950/20'
                : 'group flex items-center gap-4 border-b border-blue-100/70 px-5 py-4 transition hover:bg-blue-50/70 cursor-pointer dark:border-zinc-800/70 dark:hover:bg-zinc-800/50';

            taskElement.className = rowClasses;
            taskElement.dataset.id = task.id;

            const titleClasses = task.completed
                ? 'truncate text-sm font-medium text-zinc-400 line-through dark:text-zinc-500'
                : 'truncate text-sm font-medium text-zinc-900 dark:text-zinc-100';

            taskElement.innerHTML = `
                <div class="min-w-0 flex-1">
                    <p class="${titleClasses}">
                        ${escapeHtml(task.title)}
                    </p>

                    <div class="mt-2 flex flex-wrap items-center gap-2">
                        <span class="rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(task.priority)}">
                            ${escapeHtml(task.priority)}
                        </span>

                        ${
                            task.category
                                ? `<span class="text-[11px] text-zinc-600 dark:text-zinc-400">${escapeHtml(task.category)}</span>`
                                : ''
                        }

                        <span class="text-[11px] text-zinc-500 dark:text-zinc-400">
                            ${escapeHtml(formatDisplayDate(task.due_date || task.dueDate))}
                        </span>
                    </div>
                </div>

                <button
                    class="delete-task opacity-0 transition group-hover:opacity-100 text-zinc-500 hover:text-red-400 dark:text-zinc-400"
                    data-id="${task.id}"
                    title="Delete task"
                >
                    ×
                </button>
            `;

            taskList.appendChild(taskElement);
        });

        updateStats();
        updateTaskDebt();
    }

    // ==========================================
    // TASK LIST EVENTS (click + dblclick)
    // ==========================================

    if (taskList) {
    let clickTimer = null;

    taskList.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-task');
        const taskRow = event.target.closest('.group');

        // 1. Delete — fire immediately
        if (deleteButton) {
            event.stopPropagation();
            const id = Number(deleteButton.dataset.id);
            const previousTasks = [...tasks];
            tasks = tasks.filter(t => Number(t.id) !== id);
            saveTasks();
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
                saveTasks();
                renderTasks();
            });
            return;
        }

        // 2. Single click on row → navigate after a short delay
        //    (if a second click arrives first, we cancel and let dblclick handle it)
        if (taskRow) {
            if (clickTimer) clearTimeout(clickTimer);

            clickTimer = setTimeout(() => {
                const id = taskRow.dataset.id;
                window.location.href = `/taskdetails?task=${id}`;
            }, 250);
        }
    });

    // 🎯 DOUBLE CLICK = toggle complete (cancels navigation)
    taskList.addEventListener('dblclick', (event) => {
        const taskRow = event.target.closest('.group');
        if (!taskRow) return;

        if (event.target.closest('.delete-task')) return;

        // Cancel pending single-click navigation
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }

        event.preventDefault();

        const id = taskRow.dataset.id;
        toggleTaskComplete(id, { showRocket: true });
    });
}

    // ==========================================
    // CREATE TASK
    // ==========================================

    if (taskForm) {
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
                    saveTasks();
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
    }

    // ==========================================
    // DEBT MODAL
    // ==========================================

    function renderDebtTasks() {
        if (!debtTaskList) return;

        const overdueTasks = getOverdueTasks();
        debtTaskList.innerHTML = '';

        if (overdueTasks.length === 0) {
            debtTaskList.innerHTML = `
                <div class="py-8 text-center">
                    <div class="text-2xl">✓</div>
                    <p class="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-300">No task debt</p>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">You're all caught up.</p>
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
                ></button>

                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm text-zinc-900 dark:text-zinc-100">${escapeHtml(task.title)}</p>
                    <p class="mt-1 text-[10px] text-red-400">
                        Overdue · ${escapeHtml((task.due_date || task.dueDate || '').split('T')[0])}
                    </p>
                </div>

                <button class="debt-delete text-zinc-500 transition hover:text-red-400 dark:text-zinc-400" data-id="${task.id}" title="Delete task">×</button>
            `;
            debtTaskList.appendChild(taskElement);
        });
    }

    if (reviewDebtButton) {
        reviewDebtButton.addEventListener('click', () => {
            renderDebtTasks();
            if (debtModal) debtModal.classList.remove('hidden');
        });
    }

    function closeDebtModalWindow() {
        if (debtModal) debtModal.classList.add('hidden');
    }

    if (closeDebtModal) closeDebtModal.addEventListener('click', closeDebtModalWindow);
    if (closeDebtButton) closeDebtButton.addEventListener('click', closeDebtModalWindow);
    if (debtModal) {
        debtModal.addEventListener('click', (event) => {
            if (event.target === debtModal) closeDebtModalWindow();
        });
    }

    if (debtTaskList) {
        debtTaskList.addEventListener('click', (event) => {
            const completeButton = event.target.closest('.debt-complete');
            const deleteButton = event.target.closest('.debt-delete');

            if (completeButton) {
                const id = Number(completeButton.dataset.id);
                toggleTaskComplete(id, { showRocket: true });
                renderDebtTasks();
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