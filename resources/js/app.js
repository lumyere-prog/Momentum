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

    // Grab the elements from the DOM
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

        updateTaskDebt();

        
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


   function formatDisplayDate(dateString) {
    if (!dateString) return 'Today';
    
    // Extract just the YYYY-MM-DD part by splitting at the 'T'
    const cleanDate = dateString.split('T')[0];
    
    // Get today's actual date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Compare the clean date to today
    return cleanDate === today ? 'Today' : cleanDate;
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
                'group flex items-center gap-4 border-b border-zinc-800/70 px-5 py-4 transition hover:bg-zinc-900/50 cursor-pointer';
            taskElement.dataset.id = task.id; // <-- Add this line so the row knows its ID!

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
                    ${escapeHtml(formatDisplayDate(task.due_date || task.dueDate))}
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
    // CREATE TASK (SAVING TO LARAVEL DB)
    // ==========================================

    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. Gather the data from the modal
        const titleInput = document.getElementById('task-title');
        const descriptionInput = document.getElementById('task-description');
        const priorityInput = document.getElementById('task-priority');
        const categoryInput = document.getElementById('task-category');
        const dueDateInput = document.getElementById('task-due-date');
        
        // 2. Get the CSRF security token
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

        try {
            // 3. Send the POST request to your Laravel backend
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

            // 4. Handle the response
            if (response.ok) {
                const newRecord = await response.json();
                
                // Add the new task to your local array and re-render
                tasks.unshift(newRecord.task);
                renderTasks();

                // Reset and close the modal
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
    // COMPLETE / DELETE TASK / VIEW DETAILS
    // ==========================================

    taskList.addEventListener('click', (event) => {

        const completeButton = event.target.closest('.complete-task');
        const deleteButton = event.target.closest('.delete-task');
        const taskRow = event.target.closest('.group');


        // 1. complete task
        if (completeButton) {
            const id = Number(completeButton.dataset.id);
            const task = tasks.find(task => task.id === id);

            if (task) {
                // crispy nyan pre
                task.completed = !task.completed;
                renderTasks(); 

                // update to sa db 
                fetch(`/tasks/${id}/complete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') 
                    }
                })
                .then(async response => {
                    if (!response.ok) {
                        const errorDetails = await response.json().catch(() => response.text());
                        console.error("Laravel Error Details:", errorDetails);
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Failed to sync to database:', error);
                    // Revert the UI if it failed
                    task.completed = !task.completed;
                    renderTasks();
                });
            }
            return;
        }


        // 2. DELETE TASK (SYNCED WITH DB)
        if (deleteButton) {
            const id = Number(deleteButton.dataset.id);
            
            // Optimistically remove from local array and re-render
            const previousTasks = [...tasks];
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();

            // Send DELETE request to Laravel backend
            fetch(`/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(async response => {
                if (!response.ok) {
                    const errorDetails = await response.json().catch(() => response.text());
                    console.error("Laravel Error Details:", errorDetails);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error('Failed to delete from database:', error);
                // Revert tasks array if database delete failed
                tasks = previousTasks;
                renderTasks();
            });
            return;
        }


        // 3. OPEN TASK DETAILS MODAL (ROW CLICK)
        if (taskRow) {
            const id = Number(taskRow.dataset.id);
            const task = tasks.find(t => t.id === id);

            if (task) {
                viewTitle.textContent = task.title;
                viewDescription.textContent = task.description || 'No description provided.';
                
                viewPriority.textContent = task.priority;
                viewPriority.className = `inline-block rounded-md px-2 py-0.5 text-xs font-medium ${getPriorityClass(task.priority)}`;
                
                viewCategory.textContent = task.category || 'None';
                viewDueDate.textContent = task.due_date ? task.due_date.split('T')[0] : 'No due date';


                //comments to brah
                const activeCommentTaskId = document.getElementById('active-comment-task-id');
                if (activeCommentTaskId) activeCommentTaskId.value = task.id;
                loadComments(task.id);



                viewTaskModal.classList.remove('hidden');
            }
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
    // COMMENTS LOGIC
    // ==========================================

    function loadComments(taskId) {
        const commentsList = document.getElementById('modal-comments-list');
        if (!commentsList) return;
        
        commentsList.innerHTML = '<p class="text-xs text-zinc-600">Loading comments...</p>';

        fetch(`/tasks/${taskId}/comments`, { 
            headers: { 'Accept': 'application/json' } 
        })
        .then(res => res.json())
        .then(comments => {
            commentsList.innerHTML = '';
            if (comments.length === 0) {
                commentsList.innerHTML = '<p class="text-xs text-zinc-600 italic">No comments yet.</p>';
                return;
            }

            comments.forEach(comment => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between rounded-lg bg-zinc-900/60 border border-zinc-800/60 px-3 py-2 text-xs';
                div.innerHTML = `
                    <span class="text-zinc-300">${escapeHtml(comment.body)}</span>
                    <button class="delete-comment text-zinc-600 hover:text-red-400 ml-2 cursor-pointer" data-id="${comment.id}">×</button>
                `;
                commentsList.appendChild(div);
            });
        })
        .catch(err => {
            console.error('Error loading comments:', err);
            commentsList.innerHTML = '<p class="text-xs text-red-400">Failed to load comments.</p>';
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
            if (!body || !taskId) return;

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