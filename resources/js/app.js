document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // TASK DATA
    // ==========================================

    let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];


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


    // ==========================================
    // GET OVERDUE TASKS
    // ==========================================

    function getOverdueTasks() {

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        return tasks.filter(task => {

            if (task.completed || !task.dueDate) {
                return false;
            }


            const dueDate = new Date(task.dueDate);

            if (isNaN(dueDate.getTime())) {
                return false;
            }


            dueDate.setHours(0, 0, 0, 0);


            return dueDate < today;

        });

    }


    // ==========================================
    // UPDATE TASK DEBT
    // ==========================================

    function updateTaskDebt() {

        const overdueTasks = getOverdueTasks();

        const debt = overdueTasks.length;


        if (debtElement) {

            debtElement.textContent = debt;

        }


        if (debtMessage) {

            if (debt === 0) {

                debtMessage.textContent =
                    "You're all caught up. Keep the momentum going.";

            }

            else if (debt === 1) {

                debtMessage.textContent =
                    "You have 1 overdue task. Take care of it.";

            }

            else {

                debtMessage.textContent =
                    `You have ${debt} overdue tasks. Don't let them pile up.`;

            }

        }

    }


    // ==========================================
    // UPDATE STATS
    // ==========================================

    function updateStats() {

        const total = tasks.length;

        const completed =
            tasks.filter(task => task.completed).length;

        const remaining = total - completed;


        const percentage =
            total === 0
                ? 0
                : Math.round((completed / total) * 100);


        // Total tasks

        const totalElement =
            document.getElementById('total-tasks');

        if (totalElement) {
            totalElement.textContent = total;
        }


        // Completed

        const completedElement =
            document.getElementById('completed-tasks');

        if (completedElement) {
            completedElement.textContent = completed;
        }


        // Remaining

        const remainingElement =
            document.getElementById('remaining-tasks');

        if (remainingElement) {
            remainingElement.textContent = remaining;
        }


        // Completion percentage

        const percentageElement =
            document.getElementById('completion-percentage');

        if (percentageElement) {
            percentageElement.textContent = `${percentage}%`;
        }


        // Progress bar

        const progressBar =
            document.getElementById('progress-bar');

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }


        // Sidebar percentage

        const sidebarPercentage =
            document.getElementById('sidebar-percentage');

        if (sidebarPercentage) {
            sidebarPercentage.textContent = `${percentage}%`;
        }

        const productivityCircle = document.getElementById('productivity-circle');

        if (productivityCircle) {
        productivityCircle.style.setProperty(
            '--progress',
            `${percentage}%`
        );
        }




        // Sidebar task count

        const sidebarTaskCount =
            document.getElementById('sidebar-task-count');

        if (sidebarTaskCount) {
            sidebarTaskCount.textContent =
                `${completed} / ${total}`;
        }


        // XP

        const xpEarned = completed * 30;

        const expElement =
            document.getElementById('total-exp');

        if (expElement) {
            expElement.textContent = xpEarned;
        }


        // Streak

        const streakElement =
            document.getElementById('current-streak');

        if (streakElement) {
            streakElement.textContent = 7;
        }

    }


    // ==========================================
    // RENDER TASKS
    // ==========================================

    function renderTasks() {

        taskList.innerHTML = '';


        // No tasks

        if (tasks.length === 0) {

            taskList.innerHTML = `
                <div class="px-5 py-10 text-center">

                    <div class="text-3xl">✓</div>

                    <p class="mt-3 text-sm font-medium text-zinc-300">
                        No tasks yet
                    </p>

                    <p class="mt-1 text-xs text-zinc-600">
                        Add a task and get things done.
                    </p>

                </div>
            `;

            updateStats();
            updateTaskDebt();

            return;
        }


        // Render every task

        tasks.forEach(task => {

            const taskElement =
                document.createElement('div');


            taskElement.className =
                'group flex items-center gap-4 border-b border-zinc-800/70 px-5 py-4 transition hover:bg-zinc-900/50';


            taskElement.innerHTML = `

                <!-- COMPLETE BUTTON -->

                <button
                    class="complete-task flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition
                    ${
                        task.completed
                            ? 'border-emerald-500 bg-emerald-500 text-[10px] font-bold text-black'
                            : 'border-zinc-700 hover:border-violet-400 hover:bg-violet-400/10'
                    }"
                    data-id="${task.id}"
                    title="${
                        task.completed
                            ? 'Mark as incomplete'
                            : 'Complete task'
                    }"
                >
                    ${task.completed ? '✓' : ''}
                </button>


                <!-- TASK INFORMATION -->

                <div class="min-w-0 flex-1">

                    <p class="
                        truncate text-sm font-medium
                        ${
                            task.completed
                                ? 'text-zinc-600 line-through'
                                : 'text-zinc-200'
                        }
                    ">
                        ${escapeHtml(task.title)}
                    </p>


                    <div class="mt-2 flex items-center gap-2">

                        <span class="
                            rounded-md px-2 py-0.5 text-[10px] font-medium
                            ${getPriorityClass(task.priority)}
                        ">
                            ${escapeHtml(task.priority)}
                        </span>


                        ${
                            task.category
                                ? `
                                    <span class="text-[11px] text-zinc-600">
                                        ${escapeHtml(task.category)}
                                    </span>
                                `
                                : ''
                        }

                    </div>

                </div>


                <!-- DATE -->

                <span class="hidden text-xs text-zinc-1000 sm:block">
                    ${escapeHtml(task.dueDate || 'Today')}
                </span>


                <!-- DELETE -->

                <button
                    class="delete-task opacity-0 transition group-hover:opacity-100 text-zinc-600 hover:text-red-400"
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
    // CREATE TASK
    // ==========================================

    taskForm.addEventListener('submit', (event) => {

        event.preventDefault();


        const titleInput =
            document.getElementById('task-title');

        const priorityInput =
            document.getElementById('task-priority');

        const categoryInput =
            document.getElementById('task-category');

        const dueDateInput =
            document.getElementById('task-due-date');


        if (!titleInput || !priorityInput || !categoryInput || !dueDateInput) {
            return;
        }


        const title =
            titleInput.value.trim();


        if (!title) {
            return;
        }


        const newTask = {

            id: Date.now(),

            title: title,

            priority: priorityInput.value,

            category: categoryInput.value.trim(),

            dueDate: dueDateInput.value,

            completed: false,

            postponedCount: 0,

            createdAt: new Date().toISOString()

        };


        tasks.unshift(newTask);


        saveTasks();

        renderTasks();


        taskForm.reset();

        closeTaskModal();

    });


    // ==========================================
    // COMPLETE / DELETE TASK
    // ==========================================

    taskList.addEventListener('click', (event) => {

        const completeButton =
            event.target.closest('.complete-task');

        const deleteButton =
            event.target.closest('.delete-task');


        // Complete

        if (completeButton) {

            const id =
                Number(completeButton.dataset.id);


            const task =
                tasks.find(task => task.id === id);


            if (task) {

                task.completed =
                    !task.completed;


                saveTasks();

                renderTasks();

            }

        }


        // Delete

        if (deleteButton) {

            const id =
                Number(deleteButton.dataset.id);


            tasks =
                tasks.filter(task => task.id !== id);


            saveTasks();

            renderTasks();

        }

    });


    // ==========================================
    // RENDER DEBT TASKS
    // ==========================================

    function renderDebtTasks() {

        if (!debtTaskList) {
            return;
        }


        const overdueTasks =
            getOverdueTasks();


        debtTaskList.innerHTML = '';


        // No debt

        if (overdueTasks.length === 0) {

            debtTaskList.innerHTML = `
                <div class="py-8 text-center">

                    <div class="text-2xl">✓</div>

                    <p class="mt-2 text-sm font-medium text-zinc-300">
                        No task debt
                    </p>

                    <p class="mt-1 text-xs text-zinc-600">
                        You're all caught up.
                    </p>

                </div>
            `;

            return;
        }


        // Render overdue tasks

        overdueTasks.forEach(task => {

            const taskElement =
                document.createElement('div');


            taskElement.className =
                'flex items-center gap-3 py-3';


            taskElement.innerHTML = `

                <button
                    class="debt-complete flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 transition hover:border-emerald-400 hover:bg-emerald-400/10"
                    data-id="${task.id}"
                    title="Complete task"
                >
                </button>


                <div class="min-w-0 flex-1">

                    <p class="truncate text-sm text-zinc-300">
                        ${escapeHtml(task.title)}
                    </p>

                    <p class="mt-1 text-[10px] text-red-400">
                        Overdue · ${escapeHtml(task.dueDate)}
                    </p>

                </div>


                <button
                    class="debt-delete text-zinc-600 transition hover:text-red-400"
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

        closeDebtModal.addEventListener(
            'click',
            closeDebtModalWindow
        );

    }


    if (closeDebtButton) {

        closeDebtButton.addEventListener(
            'click',
            closeDebtModalWindow
        );

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

            const completeButton =
                event.target.closest('.debt-complete');

            const deleteButton =
                event.target.closest('.debt-delete');


            // Complete overdue task

            if (completeButton) {

                const id =
                    Number(completeButton.dataset.id);


                const task =
                    tasks.find(task => task.id === id);


                if (task) {

                    task.completed = true;

                    saveTasks();

                    renderTasks();

                    renderDebtTasks();

                }

            }


            // Delete overdue task

            if (deleteButton) {

                const id =
                    Number(deleteButton.dataset.id);


                tasks =
                    tasks.filter(task => task.id !== id);


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