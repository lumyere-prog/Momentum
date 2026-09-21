@extends('layouts.app')

@section('title', 'Momentum')

@section('content')
    <main class="w-full px-10 py-2">

        <div data-animate="fade-up" class="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <button id="add-task" type="button"
                class="btn-gradient press-scale inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer sm:w-full">
                <span class="text-base">+</span>
                Add task
            </button>
        </div>

        <div class="mb-2 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">

            <div data-animate="fade-right" class="card-lift rounded-xl border border-blue-200/60 bg-white/90 p-5 shadow-md shadow-blue-500/10 backdrop-blur-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30 lg:row-span-3 flex flex-col justify-between">
                <div class="flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">PRODUCTIVITY</h3>
                    <span class="text-[11px] text-zinc-500 dark:text-zinc-400">This week</span>
                </div>

                <div class="mt-6 flex flex-col items-center gap-6">
                    <div id="productivity-circle"
                        class="productivity-circle relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full transition-all duration-700 ease-out"
                        style="--progress: 0%;">
                        <div class="absolute inset-[10px] flex items-center justify-center rounded-full bg-white dark:bg-zinc-900">
                            <div class="text-center">
                                <p id="sidebar-percentage" class="text-3xl font-semibold text-zinc-900 dark:text-white transition-all duration-500">0%</p>
                                <p class="text-[10px] text-zinc-500 dark:text-zinc-400">score</p>
                            </div>
                        </div>
                    </div>

                    <div class="w-full">
                        <div class="mb-3 flex items-center justify-between gap-2">
                            <span class="text-xs text-zinc-600 dark:text-zinc-400">Completed this week</span>
                            <span id="sidebar-task-count" class="text-xs font-medium text-zinc-900 dark:text-white">0 / 0</span>
                        </div>
                        <div class="h-28 w-full">
                            <canvas id="weekly-chart"></canvas>
                        </div>
                        <p class="mt-3 text-[11px] leading-4 text-zinc-500 dark:text-zinc-500">Keep completing tasks to improve your score.</p>
                    </div>
                </div>
            </div>

            <button type="button" id="today-tasks-card" data-animate="fade-left"
                class="card-lift press-scale text-left min-w-0 rounded-xl border border-blue-200/60 bg-white/90 p-5 shadow-md shadow-blue-500/10 backdrop-blur-sm sm:p-6 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 cursor-pointer">
                <p class="text-xs font-medium uppercase tracking-wider text-black dark:text-blue-400">Today's tasks</p>
                <div class="mt-4 flex items-end gap-2">
                    <span id="total-tasks" class="text-3xl font-semibold text-zinc-900 dark:text-white transition-all duration-500">0</span>
                    <span class="pb-1 text-xs text-zinc-600 dark:text-zinc-400">tasks</span>
                </div>
            </button>

            <button type="button" id="completed-card" data-href="/task?filter=finished" data-animate="fade-left"
                class="card-lift press-scale text-left min-w-0 rounded-xl border border-blue-200/60 bg-white/90 p-5 shadow-md shadow-blue-500/10 backdrop-blur-sm sm:p-6 hover:border-blue-300 hover:bg-blue-50/60 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60 cursor-pointer">
                <p class="text-xs font-medium uppercase tracking-wider text-black dark:text-blue-400">Completed</p>
                <div class="mt-4 flex items-end gap-2">
                    <span id="completed-tasks" class="text-3xl font-semibold text-zinc-900 dark:text-white transition-all duration-500">0</span>
                    <span id="completion-percentage" class="pb-1 text-xs font-medium text-blue-600 dark:text-blue-400">0%</span>
                </div>
            </button>

            <div data-animate="fade-left" class="card-lift rounded-xl border border-blue-200/60 bg-white/90 p-5 shadow-md shadow-blue-500/10 backdrop-blur-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <p class="text-xs font-medium uppercase tracking-wider text-black dark:text-blue-400">Task debt</p>
                        <p id="task-debt" class="mt-3 text-3xl font-semibold text-zinc-900 dark:text-white transition-all duration-500">0</p>
                    </div>
                </div>
                <p id="task-debt-message" class="mt-4 text-xs leading-5 text-zinc-600 dark:text-zinc-400">You're all caught up. Keep the momentum going.</p>
                <button id="review-debt" type="button"
                    class="press-scale mt-5 w-full rounded-lg border border-blue-200 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 cursor-pointer dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                    Review debt
                </button>
            </div>

        </div>

        <div class="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_-10px]">
            <section id="today-tasks-section" data-animate="zoom-in"
                class="min-w-0 overflow-hidden rounded-xl border border-blue-200/60 bg-white/90 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">

                <div class="flex flex-col gap-3 border-b border-blue-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800">
                    <div class="min-w-0">
                        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Today's tasks</h3>
                        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <span id="remaining-tasks">0</span> tasks remaining
                        </p>
                    </div>

                    <a href="{{ route('task') }}"
                        class="press-scale inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-800 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white">
                        View all Task →
                    </a>
                </div>

                <div class="relative">
                    <button id="carousel-prev" type="button"
                        class="carousel-arrow absolute left-1 top-1/2 z-30 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white/80 text-blue-700 shadow-md backdrop-blur-sm hover:bg-blue-50 cursor-pointer sm:left-2 sm:h-9 sm:w-9 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        aria-label="Previous task">‹</button>

                    <button id="carousel-next" type="button"
                        class="carousel-arrow absolute right-1 top-1/2 z-30 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white/80 text-blue-700 shadow-md backdrop-blur-sm hover:bg-blue-50 cursor-pointer sm:right-2 sm:h-9 sm:w-9 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        aria-label="Next task">›</button>

                    <div id="task-list" class="relative mx-auto h-[300px] w-full max-w-5xl overflow-hidden sm:h-[340px] md:h-[380px]"></div>
                </div>
            </section>
        </div>

    </main>

    <div id="task-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-blue-950/50 px-4 backdrop-blur-sm dark:bg-black/70">
        <div class="modal-panel-in w-full max-w-md rounded-xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">

            <div class="mb-6 flex items-center justify-between gap-4">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Add New Task</h3>
                <button id="close-modal" type="button" class="press-scale shrink-0 text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>

            <form id="task-form" class="space-y-5">
                <div>
                    <label for="task-title" class="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Task Title</label>
                    <input type="text" id="task-title" required
                        class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                        placeholder="e.g. Finish Laravel dashboard">
                </div>

                <div class="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                    <div>
                        <label for="task-priority" class="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Priority</label>
                        <select id="task-priority" class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                            <option value="Low">Low</option>
                            <option value="Medium" selected>Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label for="task-category" class="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Category</label>
                        <input type="text" id="task-category"
                            class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                            placeholder="e.g. Development">
                    </div>
                </div>

                <div>
                    <label for="task-description" class="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Description</label>
                    <textarea id="task-description" rows="3" class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 resize-none focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500"
                        placeholder="Add more details about this task..."></textarea>
                </div>

                <div>
                    <label for="task-due-date" class="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">Due Date</label>
                    <input type="date" id="task-due-date"
                        class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                </div>

                <button type="submit"
                    class="btn-gradient press-scale mt-2 w-full rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer">
                    Save Task
                </button>
            </form>
        </div>
    </div>

    <div id="debt-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-blue-950/50 px-4 backdrop-blur-sm dark:bg-black/70">
        <div class="modal-panel-in w-full max-w-md rounded-xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">

            <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                    <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Task Debt</h3>
                    <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">These tasks are overdue.</p>
                </div>
                <button id="close-debt-modal" type="button" class="press-scale shrink-0 text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>

            <div id="debt-task-list" class="mt-5 max-h-80 overflow-y-auto divide-y divide-blue-100 dark:divide-zinc-800"></div>

            <button id="close-debt" type="button"
                class="press-scale mt-5 w-full rounded-lg border border-blue-200 py-2.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 cursor-pointer dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                Close
            </button>
        </div>
    </div>

    <div id="view-task-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-blue-950/50 px-4 backdrop-blur-sm dark:bg-black/70">
        <div class="modal-panel-in w-full max-w-lg rounded-xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">

            <div class="mb-5 flex items-center justify-between gap-4 border-b border-blue-100 pb-4 dark:border-zinc-800">
                <h3 id="view-task-title" class="text-base font-semibold text-zinc-900 dark:text-white">Task Title</h3>
                <button id="close-view-modal" type="button" class="press-scale shrink-0 text-lg text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>

            <div class="space-y-5 text-sm text-zinc-700 dark:text-zinc-300">
                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Description</span>
                    <p id="view-task-description" class="rounded-lg bg-blue-50/60 border border-blue-100 p-3 text-zinc-800 min-h-[60px] whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"></p>
                </div>

                <div class="grid grid-cols-2 gap-5">
                    <div>
                        <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Priority</span>
                        <span id="view-task-priority" class="inline-block rounded-md px-2 py-0.5 text-xs font-medium"></span>
                    </div>
                    <div>
                        <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Category</span>
                        <span id="view-task-category" class="text-xs text-zinc-700 dark:text-zinc-300">None</span>
                    </div>
                </div>

                <div>
                    <span class="text-xs font-medium text-zinc-500 block mb-1.5 dark:text-zinc-400">Due Date</span>
                    <span id="view-task-due-date" class="text-xs text-zinc-700 dark:text-zinc-300"></span>
                </div>
            </div>

            <div class="mt-7 flex justify-end">
                <button id="close-view-modal-btn" type="button"
                    class="press-scale rounded-lg border border-blue-200 px-4 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 cursor-pointer dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white">
                    Close
                </button>
            </div>
        </div>
    </div>

    <footer class="w-full px-10 pb-10 pt-6">
        <div class="mx-auto max-w-5xl">

            <div data-animate="fade-up" class="mb-6 text-center">
                <h2 class="text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl">
                    Meet the Developers
                </h2>
                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    The team behind Momentum
                </p>
            </div>

            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                <div data-animate="fade-up" class="card-lift flex flex-col items-center rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">
                    <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform duration-300 hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-700">
                        <img src="{{ asset('images/nambato.png') }}" alt="Developer 1" class="h-full w-full object-cover">
                    </div>
                    <h3 class="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">Akira</h3>
                    <p class="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">FrontEnd Developer</p>
                    <p class="mt-2 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">Sino nambato nun?</p>
                    <div class="mt-4 flex items-center gap-2">
                        <a href="https://github.com/rolandverdan" target="_blank" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="GitHub">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.98 10.98 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
                        </a>
                        <a href="https://www.linkedin.com/" target="_blank" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="LinkedIn">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                        </a>
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=cy.roland01@gmail.com" target="_blank" rel="noopener noreferrer" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="Email">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </a>
                    </div>
                </div>

                <div data-animate="fade-up" class="scroll-delay-2 card-lift flex flex-col items-center rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">
                    <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform duration-300 hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-700">
                        <img src="{{ asset('images/pano.jpg') }}" alt="Developer 2" class="h-full w-full object-cover">
                    </div>
                    <h3 class="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">Kenneth</h3>
                    <p class="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Frontend Developer</p>
                    <p class="mt-2 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">Pano mo nasabi?</p>
                    <div class="mt-4 flex items-center gap-2">
                        <a href="#" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="GitHub">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.98 10.98 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
                        </a>
                        <a href="#" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="LinkedIn">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                        </a>
                        <a href="#" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="Email">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </a>
                    </div>
                </div>

                <div data-animate="fade-up" class="scroll-delay-3 card-lift flex flex-col items-center rounded-xl border border-blue-200/60 bg-white/90 p-6 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/30">
                    <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 transition-transform duration-300 hover:scale-105 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-700">
                        <img src="{{ asset('images/rene.jfif') }}" alt="Developer 3" class="h-full w-full object-cover">
                    </div>
                    <h3 class="mt-4 text-sm font-semibold text-zinc-900 dark:text-white">Lumiere</h3>
                    <p class="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">Backend Developer</p>
                    <p class="mt-2 text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">Mamaaaaaaa~</p>
                    <div class="mt-4 flex items-center gap-2">
                        <a href="#" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="GitHub">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.92.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a10.98 10.98 0 015.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
                        </a>
                        <a href="#" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="LinkedIn">
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
                        </a>
                        <a href="{{ route('task') }}" class="press-scale inline-flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 text-zinc-600 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white" title="Email">
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </a>
                    </div>
                </div>

            </div>

            <p class="mt-8 text-center text-[11px] text-zinc-500 dark:text-zinc-500">
                © {{ date('Y') }} Momentum. All rights reserved.
            </p>

        </div>
    </footer>
@endsection