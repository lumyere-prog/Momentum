document.addEventListener('DOMContentLoaded', () => {

    // Get saved tasks
    let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || [];

    // Elements
    const taskList = document.getElementById('task-list');
    const addTaskButton = document.getElementById('add-task');
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.getElementById('close-modal');
    const taskForm = document.getElementById('task-form');

    // If the dashboard doesn't have these elements yet,
    // stop here instead of throwing errors.
    if (!taskList || !addTaskButton || !taskModal || !taskForm) {
        return;
    }


    function saveTasks() {
        localStorage.setItem(
            'taskflow_tasks',
            JSON.stringify(tasks)
        );
    }


// ==========================================
    // RENDER TASKS
    // ==========================================

    function renderTasks() {

        taskList.innerHTML = '';

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
            return;
        }


        tasks.forEach(task => {

            const taskElement = document.createElement('div');

            taskElement.className =
                'group flex items-center gap-4 border-b border-zinc-800/70 px-5 py-4 transition hover:bg-zinc-900/50';


            taskElement.innerHTML = `

                <!-- COMPLETE BUTTON -->

                <button
                    class="complete-task flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition
                    ${task.completed
                        ? 'border-emerald-500 bg-emerald-500 text-[10px] font-bold text-black'
                        : 'border-zinc-700 hover:border-violet-400 hover:bg-violet-400/10'
                    }"
                    data-id="${task.id}"
                    title="${task.completed ? 'Mark as incomplete' : 'Complete task'}"
                >
                    ${task.completed ? '✓' : ''}
                </button>


                <!-- TASK INFORMATION -->

                <div class="min-w-0 flex-1">

                    <p class="
                        truncate text-sm font-medium
                        ${task.completed
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
                            ${task.priority}
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
                    ${task.dueDate || 'Today'}
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

        // The crashing code has been removed from here. We just call updateStats()!
        updateStats();
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
    // ADD TASK
    // ==========================================

    addTaskButton.addEventListener('click', () => {

        taskModal.classList.remove('hidden');

        const titleInput = document.getElementById('task-title');

        if (titleInput) {
            titleInput.focus();
        }
    });


    // ==========================================
    // CLOSE MODAL
    // ==========================================

    closeModal.addEventListener('click', () => {

        taskModal.classList.add('hidden');

    });


    // Close when clicking outside modal

    taskModal.addEventListener('click', (event) => {

        if (event.target === taskModal) {
            taskModal.classList.add('hidden');
        }

    });


    // ==========================================
    // CREATE TASK
    // ==========================================

    taskForm.addEventListener('submit', (event) => {

        event.preventDefault();


        const titleInput = document.getElementById('task-title');
        const priorityInput = document.getElementById('task-priority');
        const categoryInput = document.getElementById('task-category');
        const dueDateInput = document.getElementById('task-due-date');


        const title = titleInput.value.trim();

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


        // Reset form

        taskForm.reset();

        taskModal.classList.add('hidden');

    });


    // ==========================================
    // COMPLETE / DELETE TASK
    // ==========================================

    taskList.addEventListener('click', (event) => {

        const completeButton =
            event.target.closest('.complete-task');

        const deleteButton =
            event.target.closest('.delete-task');


        // COMPLETE

        if (completeButton) {

            const id = Number(completeButton.dataset.id);

            const task = tasks.find(task => task.id === id);

            if (task) {

                task.completed = !task.completed;

                saveTasks();

                renderTasks();

            }

        }


        // DELETE

        if (deleteButton) {

            const id = Number(deleteButton.dataset.id);

            tasks = tasks.filter(task => task.id !== id);

            saveTasks();

            renderTasks();

        }

    });


function updateStats() {

        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const remaining = total - completed;
        
        // Completion percentage
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        // Today's tasks
        const totalElement = document.getElementById('total-tasks');
        if (totalElement) totalElement.textContent = total;

        // Completed
        const completedElement = document.getElementById('completed-tasks');
        if (completedElement) completedElement.textContent = completed;

        // Remaining
        const remainingElement = document.getElementById('remaining-tasks');
        if (remainingElement) remainingElement.textContent = remaining;

        // Top Stats percentage
        const percentageElement = document.getElementById('completion-percentage');
        if (percentageElement) percentageElement.textContent = `${percentage}%`;


      // Progress bar (Sidebar)
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = `${percentage}%`;

        // Productivity Meter (Sidebar Percentage & Text)
        const sidebarPercentage = document.getElementById('sidebar-percentage');
        if (sidebarPercentage) sidebarPercentage.textContent = `${percentage}%`;

        const productivityCircle = document.getElementById('productivity-circle');

        if (productivityCircle) {
            productivityCircle.style.background = `
                conic-gradient(
                    #8b5cf6 ${percentage}%,
                    #27272a ${percentage}%
                )
            `;
        }

        const sidebarTaskCount = document.getElementById('sidebar-task-count');
        if (sidebarTaskCount) sidebarTaskCount.textContent = `${completed} / ${total}`;

 
        // Let's grant 30 XP per completed task!
        const xpEarned = completed * 30; 
        const expElement = document.getElementById('total-exp');
        if (expElement) expElement.textContent = xpEarned;

        // Static streak for now (you can connect this to a real date-tracker later)
        const streakElement = document.getElementById('current-streak');
        if (streakElement) streakElement.textContent = 7;

    }


    // ==========================================
    // SECURITY / HTML ESCAPING
    // ==========================================

    function escapeHtml(value) {

        const div = document.createElement('div');

        div.textContent = value;

        return div.innerHTML;
    }


    renderTasks();

});

