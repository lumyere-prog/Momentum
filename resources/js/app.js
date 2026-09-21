import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // STATE
    // ==========================================
    let tasks = [];
    let activeIndex = 0;
    let weeklyChart = null;
    let resizeTimer;
    let currentFilter = 'all';
    let searchName = '';
    let searchPriority = '';
    let searchDate = '';
    let currentTask = null;

    // pagination
    let currentPage = 1;
    const TASKS_PER_PAGE = 10;

    // ==========================================
    // PAGE DETECTION (robust)
    // ==========================================
    const taskListEl = document.getElementById('task-list');

    const isDashboard  = !!document.getElementById('weekly-chart');
    const isTaskDetail = !!document.getElementById('task-card');
    const isTaskPage   =
        !!document.getElementById('search-name') &&
        taskListEl?.tagName?.toLowerCase() === 'tbody';

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

    // ==========================================
    // ASSETS (from Blade with fallback)
    // ==========================================
    const ASSETS = window.APP_ASSETS || {
        bin:   '/images/bin.png',
        edit:  '/images/edit.png',
        eye:   '/images/eye.png',
        check: '/images/check.png',
        undo:  '/images/undo.png',
    };

    // ==========================================
    // DEBUG
    // ==========================================
    console.log('=== Momentum DEBUG ===');
    console.log('isDashboard:', isDashboard);
    console.log('isTaskPage:', isTaskPage);
    console.log('isTaskDetail:', isTaskDetail);
    console.log('#task-list:', taskListEl);
    console.log('#search-name:', document.getElementById('search-name'));
    console.log('======================');

    // ==========================================
    // HELPERS (shared)
    // ==========================================
    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value ?? '';
        return div.innerHTML;
    }

    function saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case 'High':   return 'bg-red-400/10 text-red-400';
            case 'Medium': return 'bg-yellow-400/10 text-yellow-400';
            case 'Low':    return 'bg-emerald-400/10 text-emerald-400';
            default:       return 'bg-zinc-800 text-zinc-500';
        }
    }

    function formatDisplayDate(dateString) {
        if (!dateString) return 'Today';
        const cleanDate = dateString.split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return cleanDate === today ? 'Today' : cleanDate;
    }

    function getRelativeDueLabel(dueDateStr) {
        if (!dueDateStr) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(dueDateStr + 'T00:00:00');
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

        if (diffDays === 0)  return { label: 'Today',              className: 'text-blue-600 dark:text-blue-400 font-medium' };
        if (diffDays === 1)  return { label: 'Tomorrow',           className: 'text-blue-600 dark:text-blue-400 font-medium' };
        if (diffDays > 1)    return { label: `in ${diffDays} days`, className: 'text-zinc-500 dark:text-zinc-400' };
        if (diffDays === -1) return { label: 'Overdue 1 day',      className: 'text-red-600 dark:text-red-400 font-medium' };
        return               { label: `Overdue ${Math.abs(diffDays)} days`, className: 'text-red-600 dark:text-red-400 font-medium' };
    }

    function sortTasks(list) {
        return [...list].sort((a, b) => {
            const aDone = a.completed === true || a.completed === 1 || a.completed === '1';
            const bDone = b.completed === true || b.completed === 1 || b.completed === '1';
            if (aDone !== bDone) return aDone ? 1 : -1;
            return 0;
        });
    }

    function getCarouselTasks() {
        return tasks.filter(t => !t.completed);
    }

    function scrollToListTop() {
        const list = document.getElementById('task-list');
        if (list) {
            list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ==========================================
    // THEME
    // ==========================================
    const themeToggle   = document.getElementById('theme-toggle');
    const themeIconSun  = document.getElementById('theme-icon-sun');
    const themeIconMoon = document.getElementById('theme-icon-moon');

    function updateThemeIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        if (themeIconSun)  themeIconSun.classList.toggle('hidden', !isDark);
        if (themeIconMoon) themeIconMoon.classList.toggle('hidden', isDark);
    }

    updateThemeIcons();

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcons();
            renderWeeklyChart();
        });
    }

    // ==========================================
    // FETCH TASKS (skip on task details page)
    // ==========================================
    if (!isTaskDetail) {
        fetch('/tasks', {
            headers: { 'Accept': 'application/json' }
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

            console.log('Tasks loaded:', tasks.length, tasks);

            renderTasks();
        })
        .catch(error => console.error('Error loading tasks:', error));
    }

    // ==========================================
    // SHARED ELEMENTS
    // ==========================================
    const taskList          = document.getElementById('task-list');
    const addTaskButton     = document.getElementById('add-task');
    const addTaskFooter     = document.getElementById('add-task-footer');
    const taskModal         = document.getElementById('task-modal');
    const closeModal        = document.getElementById('close-modal');
    const taskForm          = document.getElementById('task-form');

    const reviewDebtButton  = document.getElementById('review-debt');
    const debtModal         = document.getElementById('debt-modal');
    const closeDebtModal    = document.getElementById('close-debt-modal');
    const closeDebtButton   = document.getElementById('close-debt');
    const debtTaskList      = document.getElementById('debt-task-list');

    const viewTaskModal         = document.getElementById('view-task-modal');
    const closeViewModalBtn     = document.getElementById('close-view-modal');
    const closeViewModalAction  = document.getElementById('close-view-modal-btn');

    const weeklyCanvas = document.getElementById('weekly-chart');

    // Pagination elements
    const paginationControls = document.getElementById('pagination-controls');
    const paginationInfo     = document.getElementById('pagination-info');
    const paginationPrev     = document.getElementById('pagination-prev');
    const paginationNext     = document.getElementById('pagination-next');
    const paginationPages    = document.getElementById('pagination-pages');

    // Dashboard cards
    const todayTasksCard = document.getElementById('today-tasks-card');
    const completedCard  = document.getElementById('completed-card');

    // ==========================================
    // VIEW MODAL (shared)
    // ==========================================
    function openViewTaskModal(task) {
        if (!viewTaskModal || !task) return;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val ?? '—';
        };

        setText('view-task-title', task.title || 'Untitled');
        setText('view-task-description', task.description || 'No description provided.');

        const priorityEl = document.getElementById('view-task-priority');
        if (priorityEl) {
            priorityEl.textContent = task.priority || '—';
            priorityEl.className =
                `inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getPriorityClass(task.priority)}`;
        }

        setText('view-task-category', task.category || 'None');

        const due = task.due_date || task.dueDate;
        setText('view-task-due-date', due ? String(due).split('T')[0] : 'No due date');

        viewTaskModal.classList.remove('hidden');
        viewTaskModal.classList.add('flex');
    }

    function closeViewModal() {
        if (!viewTaskModal) return;
        viewTaskModal.classList.add('hidden');
        viewTaskModal.classList.remove('flex');
    }

    if (closeViewModalBtn)    closeViewModalBtn.addEventListener('click', closeViewModal);
    if (closeViewModalAction) closeViewModalAction.addEventListener('click', closeViewModal);
    if (viewTaskModal) {
        viewTaskModal.addEventListener('click', (event) => {
            if (event.target === viewTaskModal) closeViewModal();
        });
    }

    // ==========================================
    // WEEKLY CHART
    // ==========================================
    function getWeekDays() {
        const now = new Date();
        const day = now.getDay();
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

    function chartColors() {
        const dark = document.documentElement.classList.contains('dark');
        return {
            line: '#3b82f6',
            fill: 'rgba(59, 130, 246, 0.15)',
            grid: dark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
            tick: dark ? '#a1a1aa' : '#52525b',
        };
    }

    function renderWeeklyChart() {
        if (!isDashboard || !weeklyCanvas) return;

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
    // ADD TASK MODAL
    // ==========================================
    function openTaskModal() {
        if (!taskModal) return;
        taskModal.classList.remove('hidden');
        const titleInput = document.getElementById('task-title');
        if (titleInput) titleInput.focus();

        const dueDateInput = document.getElementById('task-due-date');
        if (dueDateInput && !dueDateInput.value) {
            dueDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    function closeTaskModal() {
        if (!taskModal) return;
        taskModal.classList.add('hidden');
    }

    if (addTaskButton) addTaskButton.addEventListener('click', openTaskModal);
    if (addTaskFooter) addTaskFooter.addEventListener('click', openTaskModal);
    if (closeModal)    closeModal.addEventListener('click', closeTaskModal);
    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
            if (event.target === taskModal) closeTaskModal();
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
            if (debt === 0) {
                debtMsg.textContent = "You're all caught up. Keep the momentum going.";
            } else if (debt === 1) {
                debtMsg.textContent = "You have 1 overdue task. Take care of it.";
            } else {
                debtMsg.textContent = `You have ${debt} overdue tasks. Don't let them pile up.`;
            }
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
        set('completion-percentage', `${percentage}%`);
        set('sidebar-percentage', `${percentage}%`);
        set('sidebar-task-count', `${completed} / ${total}`);
        set('total-exp', completed * 30);
        set('current-streak', 7);

        if (isDashboard) set('remaining-tasks', remaining);

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = `${percentage}%`;

        const productivityCircle = document.getElementById('productivity-circle');
        if (productivityCircle) {
            productivityCircle.style.setProperty('--progress', `${percentage}%`);
        }

        renderWeeklyChart();
        updateTaskDebt();
    }

    // ==========================================
    // ROCKET POPUP
    // ==========================================
    function showRocketCongrats(message = 'Congrats! 🎉') {
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

        task.completed = !wasCompleted;
        saveTasks();
        renderTasks();

        if (!wasCompleted && showRocket) {
            showRocketCongrats('Congrats! Task done! 🎉');
        }

        try {
            const res = await fetch(`/tasks/${id}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                }
            });
            if (!res.ok) throw new Error();
        } catch {
            task.completed = wasCompleted;
            saveTasks();
            renderTasks();
        }
    }

    // ==========================================
    // FILTER + SEARCH
    // ==========================================
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
            currentPage = 1;
            renderTasks();
        });
    });

    const searchNameInput     = document.getElementById('search-name');
    const searchPriorityInput = document.getElementById('search-priority');
    const searchDateInput     = document.getElementById('search-date');

    if (searchNameInput) {
        searchNameInput.addEventListener('input', (e) => {
            searchName = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderTasks();
        });
    }
    if (searchPriorityInput) {
        searchPriorityInput.addEventListener('change', (e) => {
            searchPriority = e.target.value;
            currentPage = 1;
            renderTasks();
        });
    }
    if (searchDateInput) {
        searchDateInput.addEventListener('input', (e) => {
            searchDate = e.target.value;
            currentPage = 1;
            renderTasks();
        });
    }

    updateFilterButtonStyles();

    // ==========================================
    // READ ?filter= FROM URL
    // ==========================================
    if (isTaskPage) {
        const urlFilter = new URLSearchParams(window.location.search).get('filter');
        if (urlFilter && ['all', 'unfinished', 'finished'].includes(urlFilter)) {
            currentFilter = urlFilter;
            updateFilterButtonStyles();
            currentPage = 1;
        }
    }

    // ==========================================
    // DASHBOARD CAROUSEL CARDS
    // ==========================================
    function buildTaskCard(task) {
        const el = document.createElement('div');

        const priorityStyles = {
            High: {
                bg:      'bg-gradient-to-br from-rose-50 to-red-100 dark:from-zinc-900 dark:to-red-950/25',
                border:  'border-rose-200/80 dark:border-red-900/40',
                badge:   'bg-red-500 text-white',
                accent:  'text-red-600 dark:text-red-400',
                divider: 'border-rose-200/60 dark:border-red-900/30',
            },
            Medium: {
                bg:      'bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-zinc-900 dark:to-amber-950/25',
                border:  'border-amber-200/80 dark:border-amber-900/40',
                badge:   'bg-amber-500 text-white',
                accent:  'text-amber-700 dark:text-amber-400',
                divider: 'border-amber-200/60 dark:border-amber-900/30',
            },
            Low: {
                bg:      'bg-gradient-to-br from-emerald-50 to-green-100 dark:from-zinc-900 dark:to-emerald-950/25',
                border:  'border-emerald-200/80 dark:border-emerald-900/40',
                badge:   'bg-emerald-500 text-white',
                accent:  'text-emerald-700 dark:text-emerald-400',
                divider: 'border-emerald-200/60 dark:border-emerald-900/30',
            },
        };

        const style = priorityStyles[task.priority] || {
            bg:      'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800',
            border:  'border-blue-200/80 dark:border-zinc-800',
            badge:   'bg-zinc-500 text-white',
            accent:  'text-blue-700 dark:text-blue-400',
            divider: 'border-blue-200/60 dark:border-zinc-800',
        };

        el.className =
            'task-card absolute ' +
            'w-[220px] min-[400px]:w-[240px] sm:w-72 md:w-80 ' +
            'min-h-[230px] sm:min-h-[250px] md:min-h-[270px] ' +
            'flex flex-col ' +
            `rounded-2xl border ${style.border} ${style.bg} p-4 sm:p-5 ` +
            'shadow-md shadow-blue-500/10 backdrop-blur-sm ' +
            'transition-all duration-500 ease-out cursor-pointer select-none ' +
            'dark:shadow-black/30';

        el.style.top = '50%';
        el.style.left = '50%';
        el.style.transform = 'translate(-50%, -50%)';
        el.dataset.id = task.id;

        el.innerHTML = `
            <h4 class="line-clamp-2 pr-6 text-sm sm:text-base font-semibold ${
                task.completed
                    ? 'text-zinc-500 line-through dark:text-zinc-500'
                    : 'text-zinc-900 dark:text-zinc-100'
            }">
                ${escapeHtml(task.title)}
            </h4>

            <p class="mt-2 flex-1 line-clamp-3 text-[11px] sm:text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                ${escapeHtml(task.description || 'No description provided.')}
            </p>

            <div class="mt-3 space-y-1.5 border-t pt-3 ${style.divider}">

                <div class="flex items-center justify-between gap-2">
                    <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        Category
                    </span>
                    <span class="truncate text-[10px] font-medium ${style.accent}">
                        ${escapeHtml(task.category || '—')}
                    </span>
                </div>

                <div class="flex items-center justify-between gap-2">
                    <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        Due Date
                    </span>
                    <span class="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        ${escapeHtml(formatDisplayDate(task.due_date || task.dueDate))}
                    </span>
                </div>

                <div class="flex items-center justify-between gap-2">
                    <span class="text-[9px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                        Priority
                    </span>
                    <span class="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${style.badge}">
                        ${escapeHtml(task.priority)}
                    </span>
                </div>

            </div>

            <button
                class="delete-task absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 opacity-0 transition hover:text-red-500 group-hover:opacity-100 dark:text-zinc-500 cursor-pointer"
                data-id="${task.id}"
                title="Delete task"
            >×</button>
        `;

        return el;
    }

    function getResponsiveMetrics() {
        const w = window.innerWidth;
        if (w < 480)  return { side: 130, far: 190, centerScale: 1.05, sideScale: 0.85, blur: 3 };
        if (w < 640)  return { side: 160, far: 220, centerScale: 1.08, sideScale: 0.88, blur: 3 };
        if (w < 768)  return { side: 190, far: 270, centerScale: 1.10, sideScale: 0.90, blur: 3 };
        if (w < 1024) return { side: 230, far: 310, centerScale: 1.12, sideScale: 0.92, blur: 3 };
        return { side: 260, far: 340, centerScale: 1.15, sideScale: 0.92, blur: 3 };
    }

    function applyCarouselLayout() {
        if (!isDashboard || !taskList) return;

        const cards = taskList.querySelectorAll('.task-card');
        const total = cards.length;
        const m = getResponsiveMetrics();

        cards.forEach((card, i) => {
            let offset = i - activeIndex;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            card.style.transition =
                'transform 550ms cubic-bezier(.22,.61,.36,1), opacity 550ms, filter 550ms';

            if (offset === 0) {
                card.style.transform = `translate(-50%, -50%) scale(${m.centerScale})`;
                card.style.opacity = '1';
                card.style.filter = 'blur(0px)';
                card.style.zIndex = '30';
                card.style.pointerEvents = 'auto';
            } else if (offset === -1) {
                card.style.transform = `translate(calc(-50% - ${m.side}px), -50%) scale(${m.sideScale})`;
                card.style.opacity = '0.6';
                card.style.filter = `blur(${m.blur}px)`;
                card.style.zIndex = '20';
                card.style.pointerEvents = 'auto';
            } else if (offset === 1) {
                card.style.transform = `translate(calc(-50% + ${m.side}px), -50%) scale(${m.sideScale})`;
                card.style.opacity = '0.6';
                card.style.filter = `blur(${m.blur}px)`;
                card.style.zIndex = '20';
                card.style.pointerEvents = 'auto';
            } else {
                const dir = offset < 0 ? -1 : 1;
                card.style.transform = `translate(calc(-50% + ${dir * m.far}px), -50%) scale(0.7)`;
                card.style.opacity = '0';
                card.style.filter = 'blur(8px)';
                card.style.zIndex = '10';
                card.style.pointerEvents = 'none';
            }
        });
    }

    function nextTask() {
        const list = getCarouselTasks();
        if (!isDashboard || list.length === 0) return;
        activeIndex = (activeIndex + 1) % list.length;
        applyCarouselLayout();
    }

    function prevTask() {
        const list = getCarouselTasks();
        if (!isDashboard || list.length === 0) return;
        activeIndex = (activeIndex - 1 + list.length) % list.length;
        applyCarouselLayout();
    }

    document.getElementById('carousel-prev')?.addEventListener('click', prevTask);
    document.getElementById('carousel-next')?.addEventListener('click', nextTask);

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isDashboard) applyCarouselLayout();
        }, 120);
    });

    // ==========================================
    // TASK PAGE LIST (TABLE + PAGINATION)
    // ==========================================
    function renderTaskPageList() {
        if (!taskList) return;
        taskList.innerHTML = '';

        const visibleTasks = getVisibleTasks();
        const total = visibleTasks.length;

        // Empty state
        if (total === 0) {
            const message = tasks.length === 0
                ? 'Add a task and get things done.'
                : 'No tasks match your filters.';

            taskList.innerHTML = `
                <tr>
                    <td colspan="6" class="px-5 py-10 text-center">
                        <div class="text-3xl">✓</div>
                        <p class="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-300">
                            No tasks to show
                        </p>
                        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                            ${message}
                        </p>
                    </td>
                </tr>
            `;

            const remaining = document.getElementById('remaining-tasks');
            if (remaining) remaining.textContent = 0;

            if (paginationControls) {
                paginationControls.classList.add('hidden');
                paginationControls.classList.remove('flex');
            }
            return;
        }

        // Pagination math
        const totalPages = Math.max(1, Math.ceil(total / TASKS_PER_PAGE));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIdx  = (currentPage - 1) * TASKS_PER_PAGE;
        const endIdx    = Math.min(startIdx + TASKS_PER_PAGE, total);
        const pageTasks = visibleTasks.slice(startIdx, endIdx);

        // Render rows
        pageTasks.forEach((task) => {
            const isDone = task.completed === true || task.completed === 1 || task.completed === '1';

            const dueRaw   = task.due_date || task.dueDate;
            const dueClean = dueRaw ? String(dueRaw).split('T')[0] : '';

            const relDue = getRelativeDueLabel(dueClean);

            const priorityBadge = {
                High:   'bg-red-500/10 text-red-600 dark:text-red-400',
                Medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
                Low:    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
            }[task.priority] || 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400';

            const tr = document.createElement('tr');
            tr.className = 'transition hover:bg-blue-50/70 dark:hover:bg-zinc-800/50 cursor-pointer';
            tr.dataset.id = task.id;

            tr.innerHTML = `
                <td class="px-4 py-3 align-middle">
                    <p class="truncate text-sm font-medium ${
                        isDone
                            ? 'text-zinc-500 line-through dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                    }">
                        ${escapeHtml(task.title)}
                    </p>
                </td>

                <td class="px-4 py-3 align-middle">
                    <p class="line-clamp-2 max-w-md text-xs text-zinc-600 dark:text-zinc-400">
                        ${escapeHtml(task.description || '—')}
                    </p>
                </td>

                <td class="px-4 py-3 align-middle">
                    <span class="inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priorityBadge}">
                        ${escapeHtml(task.priority || '—')}
                    </span>
                </td>

                <td class="px-4 py-3 align-middle">
                    ${task.category
                        ? `<span class="inline-block rounded-md border border-blue-200 bg-blue-50/70 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                               ${escapeHtml(task.category)}
                           </span>`
                        : '<span class="text-xs text-zinc-400 dark:text-zinc-500">—</span>'}
                </td>

                <td class="px-4 py-3 align-middle">
                    ${dueClean
                        ? `<div class="flex flex-col">
                               <span class="text-xs text-zinc-700 dark:text-zinc-300">${escapeHtml(dueClean)}</span>
                               ${relDue ? `<span class="text-[10px] ${relDue.className}">${relDue.label}</span>` : ''}
                           </div>`
                        : '<span class="text-xs text-zinc-400 dark:text-zinc-500">—</span>'}
                </td>

                <td class="px-4 py-3 align-middle">
                    <div class="flex items-center justify-center gap-1">

                        <button
                            type="button"
                            class="view-task inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white"
                            data-id="${task.id}"
                            title="View"
                        >
                            <img src="${ASSETS.eye}" alt="" class="h-4 w-4">
                        </button>

                        <button
                            type="button"
                            class="edit-task inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 cursor-pointer dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white"
                            data-id="${task.id}"
                            title="Edit"
                        >
                            <img src="${ASSETS.edit}" alt="" class="h-4 w-4">
                        </button>

                        <button
                            type="button"
                            class="delete-task inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 cursor-pointer dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-red-400"
                            data-id="${task.id}"
                            title="Delete"
                        >
                            <img src="${ASSETS.bin}" alt="" class="h-4 w-4">
                        </button>

                    </div>
                </td>
            `;

            taskList.appendChild(tr);
        });

        const remaining = document.getElementById('remaining-tasks');
        if (remaining) {
            remaining.textContent = visibleTasks.filter(t => !t.completed).length;
        }

        renderPagination(total, totalPages, startIdx, endIdx);
    }

    // ==========================================
    // PAGINATION RENDER
    // ==========================================
    function renderPagination(total, totalPages, startIdx, endIdx) {
        if (!paginationControls) return;

        paginationControls.classList.remove('hidden');
        paginationControls.classList.add('flex');

        if (paginationInfo) {
            paginationInfo.textContent = `Showing ${startIdx + 1}–${endIdx} of ${total}`;
        }

        if (paginationPrev) paginationPrev.disabled = currentPage === 1;
        if (paginationNext) paginationNext.disabled = currentPage === totalPages;

        if (paginationPages) {
            paginationPages.innerHTML = '';

            const pages = getPageWindow(currentPage, totalPages);

            pages.forEach(p => {
                if (p === '...') {
                    const span = document.createElement('span');
                    span.className = 'px-2 text-xs text-zinc-400 dark:text-zinc-500';
                    span.textContent = '…';
                    paginationPages.appendChild(span);
                    return;
                }

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.dataset.page = p;
                btn.textContent = p;

                const isActive = p === currentPage;
                btn.className = isActive
                    ? 'pagination-page inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2 text-xs font-semibold text-white shadow-sm cursor-pointer dark:bg-blue-500'
                    : 'pagination-page inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-blue-200 bg-white/70 px-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white';

                paginationPages.appendChild(btn);
            });
        }
    }

    function getPageWindow(current, total) {
        const pages = [];

        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }

        pages.push(1);
        if (current > 3) pages.push('...');

        const start = Math.max(2, current - 1);
        const end   = Math.min(total - 1, current + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        if (current < total - 2) pages.push('...');
        pages.push(total);

        return pages;
    }

    // ==========================================
    // PAGINATION HANDLERS
    // ==========================================
    if (paginationPrev) {
        paginationPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTaskPageList();
                scrollToListTop();
            }
        });
    }

    if (paginationNext) {
        paginationNext.addEventListener('click', () => {
            const visibleTasks = getVisibleTasks();
            const totalPages = Math.max(1, Math.ceil(visibleTasks.length / TASKS_PER_PAGE));
            if (currentPage < totalPages) {
                currentPage++;
                renderTaskPageList();
                scrollToListTop();
            }
        });
    }

    if (paginationPages) {
        paginationPages.addEventListener('click', (e) => {
            const btn = e.target.closest('.pagination-page');
            if (!btn) return;
            const page = Number(btn.dataset.page);
            if (!Number.isNaN(page) && page !== currentPage) {
                currentPage = page;
                renderTaskPageList();
                scrollToListTop();
            }
        });
    }

    // ==========================================
    // MASTER RENDER
    // ==========================================
    function renderTasks() {
        if (isTaskDetail) return;
        if (!taskList) return;

        if (isTaskPage && !isDashboard) {
            renderTaskPageList();
            updateStats();
            return;
        }

        // Dashboard → carousel
        taskList.innerHTML = '';

        const carouselTasks = getCarouselTasks();

        if (carouselTasks.length === 0) {
            const message = tasks.length === 0
                ? 'Add a task and get things done.'
                : 'All tasks completed. Nice work! 🎉';

            taskList.innerHTML = `
                <div class="text-center">
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

        if (activeIndex >= carouselTasks.length) activeIndex = carouselTasks.length - 1;
        if (activeIndex < 0) activeIndex = 0;

        carouselTasks.forEach((task, i) => {
            const card = buildTaskCard(task);
            card.dataset.index = i;
            taskList.appendChild(card);
        });

        applyCarouselLayout();
        updateStats();
        updateTaskDebt();
    }

    // ==========================================
    // CLICK HANDLER
    // ==========================================
    let clickTimer = null;

    if (taskList) {
        taskList.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('.delete-task');
            const editButton   = event.target.closest('.edit-task');
            const viewButton   = event.target.closest('.view-task');
            const card         = event.target.closest('.task-card');
            const row          = event.target.closest('tr[data-id]');

            // 1a. View → open modal
            if (viewButton) {
                event.stopPropagation();
                const id = Number(viewButton.dataset.id);
                const task = tasks.find(t => Number(t.id) === id);
                if (task) openViewTaskModal(task);
                return;
            }

            // 1b. Edit → navigate to task details
            if (editButton) {
                event.stopPropagation();
                const id = Number(editButton.dataset.id);
                window.location.href = `/task/${id}`;
                return;
            }

            // 1c. Delete
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
                        'X-CSRF-TOKEN': csrfToken
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

            // 2. Dashboard card click → navigate
            if (isDashboard && card) {
                const i = Number(card.dataset.index);
                if (Number.isNaN(i)) return;

                if (i === activeIndex) {
                    window.location.href = `/task/${card.dataset.id}`;
                } else {
                    activeIndex = i;
                    applyCarouselLayout();
                }
                return;
            }

            // 3. Task page row click → navigate after delay
            if (isTaskPage && row) {
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    window.location.href = `/task/${row.dataset.id}`;
                }, 250);
            }
        });

        taskList.addEventListener('dblclick', (event) => {
            if (event.target.closest('.delete-task') ||
                event.target.closest('.edit-task') ||
                event.target.closest('.view-task')) {
                return;
            }

            const card = event.target.closest('.task-card');
            if (card && isDashboard) {
                if (Number(card.dataset.index) !== activeIndex) return;
                event.preventDefault();
                toggleTaskComplete(card.dataset.id, { showRocket: true });
                return;
            }

            const row = event.target.closest('tr[data-id]');
            if (!row) return;

            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }

            event.preventDefault();
            toggleTaskComplete(row.dataset.id, { showRocket: true });
        });
    }

    // ==========================================
    // CREATE TASK
    // ==========================================
    if (taskForm) {
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const saveTaskBtn = document.getElementById('save-task-btn');

        // Disable button immediately to prevent duplicate submissions
        saveTaskBtn.disabled = true;
        saveTaskBtn.textContent = 'Saving...';

        const titleInput       = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const priorityInput    = document.getElementById('task-priority');
        const categoryInput    = document.getElementById('task-category');
        const dueDateInput      = document.getElementById('task-due-date');

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

                // Re-enable if saving failed
                saveTaskBtn.disabled = false;
                saveTaskBtn.textContent = 'Save Task';
            }
        } catch (error) {
            console.error("Network Error:", error);

            // Re-enable if there was a network error
            saveTaskBtn.disabled = false;
            saveTaskBtn.textContent = 'Save Task';
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
            const el = document.createElement('div');
            el.className = 'flex items-center gap-3 py-3';
            el.innerHTML = `
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
            debtTaskList.appendChild(el);
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

    if (closeDebtModal)  closeDebtModal.addEventListener('click', closeDebtModalWindow);
    if (closeDebtButton) closeDebtButton.addEventListener('click', closeDebtModalWindow);
    if (debtModal) {
        debtModal.addEventListener('click', (event) => {
            if (event.target === debtModal) closeDebtModalWindow();
        });
    }

    if (debtTaskList) {
        debtTaskList.addEventListener('click', (event) => {
            const completeButton = event.target.closest('.debt-complete');
            const deleteButton   = event.target.closest('.debt-delete');

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
    // DASHBOARD CARDS
    // ==========================================
    if (todayTasksCard) {
        todayTasksCard.addEventListener('click', () => {
            const target = document.getElementById('today-tasks-section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (completedCard) {
        completedCard.addEventListener('click', () => {
            const href = completedCard.dataset.href || '/task?filter=finished';
            window.location.href = href;
        });
    }

    // ==========================================
    // FILTER CARD — SLIDE UP/DOWN ON SCROLL (no fade)
    // ==========================================
    (function initAutoHideFilter() {
        if (!isTaskPage) return;

        const filterCard = document.getElementById('filter-card');
        if (!filterCard) return;

        const HIDDEN_CLASS = '-translate-y-[140%]';
        const SHOWN_CLASS  = 'translate-y-0';

        let lastScrollY = window.scrollY;
        let ticking = false;

        function showFilter() {
            filterCard.classList.remove(HIDDEN_CLASS);
            filterCard.classList.add(SHOWN_CLASS);
        }

        function hideFilter() {
            filterCard.classList.remove(SHOWN_CLASS);
            filterCard.classList.add(HIDDEN_CLASS);
        }

        function onScroll() {
            const currentScrollY = window.scrollY;

            // Always show near the top of the page
            if (currentScrollY < 80) {
                showFilter();
                lastScrollY = currentScrollY;
                return;
            }

            // Scroll down → hide; scroll up → show
            if (currentScrollY > lastScrollY + 6) {
                hideFilter();
            } else if (currentScrollY < lastScrollY - 6) {
                showFilter();
            }

            lastScrollY = currentScrollY;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        showFilter();
    })();

    // ==========================================
    // INITIAL LOAD
    // ==========================================
    if (!isTaskDetail) {
        renderTasks();
    }

    // ================================================================
    // TASK DETAILS PAGE
    // ================================================================
    if (isTaskDetail) {
        initTaskDetailsPage();
    }

    function initTaskDetailsPage() {
        const taskId = window.location.pathname.split('/').pop();

        const editTaskBtn       = document.getElementById('edit-task-btn');
        const editTaskModal     = document.getElementById('edit-task-modal');
        const closeEditModal    = document.getElementById('close-edit-modal');
        const cancelEdit        = document.getElementById('cancel-edit');
        const editTaskForm      = document.getElementById('edit-task-form');

        const editTaskTitle       = document.getElementById('edit-task-title');
        const editTaskDescription = document.getElementById('edit-task-description');
        const editTaskPriority    = document.getElementById('edit-task-priority');
        const editTaskCategory    = document.getElementById('edit-task-category');
        const editTaskDueDate     = document.getElementById('edit-task-due-date');

        const taskCard        = document.getElementById('task-card');
        const commentsCard    = document.getElementById('comments-card');
        const commentsHeader  = document.getElementById('comments-header');
        const taskTitle       = document.getElementById('task-title');
        const taskPriority    = document.getElementById('task-priority');
        const taskDescription = document.getElementById('task-description');
        const taskCategory    = document.getElementById('task-category');
        const taskDueDate     = document.getElementById('task-due-date');
        const toggleCompleteBtn = document.getElementById('toggle-complete');
        const doneIcon          = document.getElementById('done-icon');
        const undoIcon          = document.getElementById('undo-icon');
        const doneLabel         = document.getElementById('done-label');
        const commentsList      = document.getElementById('comments-list');
        const commentForm       = document.getElementById('comment-form');
        const commentInput      = document.getElementById('comment-input');

        function getCardStyle(priority) {
            switch (priority) {
                case 'High':
                    return {
                        card:     'border-rose-300/70 bg-gradient-to-br from-rose-50 to-red-100 dark:border-red-900/40 dark:from-zinc-900 dark:to-red-950/25',
                        desc:     'border-rose-200/70 bg-rose-50/60 dark:border-red-900/30 dark:bg-red-950/20',
                        comments: 'border-rose-300/70 bg-gradient-to-br from-rose-50 to-red-100 dark:border-red-900/40 dark:from-zinc-900 dark:to-red-950/25',
                        divider:  'border-rose-200/70 dark:border-red-900/30',
                    };
                case 'Medium':
                    return {
                        card:     'border-amber-300/70 bg-gradient-to-br from-amber-50 to-yellow-100 dark:border-amber-900/40 dark:from-zinc-900 dark:to-amber-950/25',
                        desc:     'border-amber-200/70 bg-amber-50/60 dark:border-amber-900/30 dark:bg-amber-950/20',
                        comments: 'border-amber-300/70 bg-gradient-to-br from-amber-50 to-yellow-100 dark:border-amber-900/40 dark:from-zinc-900 dark:to-amber-950/25',
                        divider:  'border-amber-200/70 dark:border-amber-900/30',
                    };
                case 'Low':
                    return {
                        card:     'border-emerald-300/70 bg-gradient-to-br from-emerald-50 to-green-100 dark:border-emerald-900/40 dark:from-zinc-900 dark:to-emerald-950/25',
                        desc:     'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-950/20',
                        comments: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 to-green-100 dark:border-emerald-900/40 dark:from-zinc-900 dark:to-emerald-950/25',
                        divider:  'border-emerald-200/70 dark:border-emerald-900/30',
                    };
                default:
                    return {
                        card:     'border-blue-200/60 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/80',
                        desc:     'border-blue-100 bg-blue-50/60 dark:border-zinc-800 dark:bg-zinc-800',
                        comments: 'border-blue-200/60 bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/80',
                        divider:  'border-blue-100 dark:border-zinc-800',
                    };
            }
        }

        function applyCardStyle(priority) {
            if (!taskCard) return;
            const style = getCardStyle(priority);

            taskCard.className =
                'rounded-xl border p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:shadow-black/30 ' +
                style.card;

            if (taskDescription) {
                taskDescription.className =
                    'rounded-lg border p-3 text-sm text-zinc-800 min-h-[60px] whitespace-pre-wrap dark:text-zinc-200 ' +
                    style.desc;
            }

            if (commentsCard) {
                commentsCard.className =
                    'rounded-xl border p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:shadow-black/30 ' +
                    style.comments;
            }

            if (commentsHeader) {
                commentsHeader.className =
                    'mb-5 border-b pb-4 ' +
                    style.divider;
            }
        }

        function applyCompleteStyle(isComplete) {
            if (!toggleCompleteBtn || !doneIcon || !doneLabel) return;

            if (isComplete) {
                toggleCompleteBtn.className =
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ' +
                    'border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 ' +
                    'dark:border-red-400 dark:bg-red-400 dark:text-zinc-900 dark:hover:bg-red-300';

                doneIcon.classList.add('hidden');
                if (undoIcon) undoIcon.classList.remove('hidden');

                doneLabel.textContent = 'Undo';
                taskTitle.classList.add('line-through', 'text-zinc-400', 'dark:text-zinc-500');
            } else {
                toggleCompleteBtn.className =
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition cursor-pointer ' +
                    'border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50 hover:text-blue-800 ' +
                    'dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white';

                doneIcon.classList.remove('hidden');
                if (undoIcon) undoIcon.classList.add('hidden');

                doneLabel.textContent = 'Done';
                taskTitle.classList.remove('line-through', 'text-zinc-400', 'dark:text-zinc-500');
            }
        }

        if (!taskId) {
            if (taskTitle)       taskTitle.textContent = 'No task selected';
            if (taskDescription) taskDescription.textContent = 'Go back and click a task to see its details.';
            if (commentForm)     commentForm.style.display = 'none';
            return;
        }

        fetch('/tasks', { headers: { 'Accept': 'application/json' } })
            .then(res => res.json())
            .then(data => {
                const allTasks = Array.isArray(data) ? data : (data.tasks || data.data || []);
                const task = allTasks.find(t => String(t.id) === String(taskId));

                if (!task) {
                    if (taskTitle) taskTitle.textContent = `Task #${taskId}`;
                    return;
                }

                currentTask = task;

                taskTitle.textContent = task.title;
                taskDescription.textContent = task.description || 'No description provided.';

                if (toggleCompleteBtn) {
                    const isDone = task.completed === true || task.completed === 1 || task.completed === '1';
                    toggleCompleteBtn.dataset.completed = isDone ? '1' : '0';
                    applyCompleteStyle(isDone);
                }

                taskPriority.textContent = task.priority;
                taskPriority.className = `shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(task.priority)}`;

                taskCategory.textContent = task.category || 'None';

                const due = task.due_date || task.dueDate;
                taskDueDate.textContent = due ? due.split('T')[0] : 'No due date';

                applyCardStyle(task.priority);
            })
            .catch(err => {
                console.error('Failed to load task:', err);
                if (taskTitle) taskTitle.textContent = `Task #${taskId}`;
            });

        function loadComments() {
            if (!commentsList) return;
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

        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const body = commentInput.value.trim();
                if (!body) return;

                try {
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
                    } else {
                        const err = await res.json().catch(() => ({}));
                        console.error('Post failed:', res.status, err);
                        alert(`Failed to post (${res.status}): ${err.message || 'Check console'}`);
                    }
                } catch (err) {
                    console.error('Network error:', err);
                    alert('Network error — see console.');
                }
            });
        }

        if (commentsList) {
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

        if (editTaskBtn) {
            editTaskBtn.addEventListener('click', () => {
                if (!currentTask) return;

                editTaskTitle.value       = currentTask.title || '';
                editTaskDescription.value = currentTask.description || '';
                editTaskPriority.value    = currentTask.priority || 'Medium';
                editTaskCategory.value    = currentTask.category || '';

                const due = currentTask.due_date || currentTask.dueDate;
                editTaskDueDate.value = due ? String(due).split('T')[0] : '';

                editTaskModal.classList.remove('hidden');
                editTaskModal.classList.add('flex');
            });
        }

        function closeEditTaskModal() {
            editTaskModal.classList.add('hidden');
            editTaskModal.classList.remove('flex');
        }

        if (closeEditModal) closeEditModal.addEventListener('click', closeEditTaskModal);
        if (cancelEdit)     cancelEdit.addEventListener('click', closeEditTaskModal);

        if (editTaskModal) {
            editTaskModal.addEventListener('click', (event) => {
                if (event.target === editTaskModal) closeEditTaskModal();
            });
        }

        if (editTaskForm) {
            editTaskForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                try {
                    const response = await fetch(`/tasks/${taskId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify({
                            title:       editTaskTitle.value.trim(),
                            description: editTaskDescription.value.trim(),
                            priority:    editTaskPriority.value,
                            category:    editTaskCategory.value.trim(),
                            due_date:    editTaskDueDate.value
                        })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error(data);
                        alert('Failed to update task.');
                        return;
                    }

                    currentTask = data.task;

                    taskTitle.textContent = currentTask.title;
                    taskDescription.textContent = currentTask.description || 'No description provided.';
                    taskCategory.textContent = currentTask.category || 'None';

                    const due = currentTask.due_date || currentTask.dueDate;
                    taskDueDate.textContent = due ? String(due).split('T')[0] : 'No due date';

                    taskPriority.textContent = currentTask.priority;
                    taskPriority.className =
                        `shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${getPriorityClass(currentTask.priority)}`;

                    applyCardStyle(currentTask.priority);
                    closeEditTaskModal();

                } catch (error) {
                    console.error('Failed to update task:', error);
                    alert('Something went wrong while updating the task.');
                }
            });
        }
    }
});