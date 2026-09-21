@extends('layouts.app')

@section('title', 'Momentum')

@section('content')
    <div class="flex min-h-screen flex-col px-10 py-2">
        <div class="flex flex-1 flex-col gap-4">

            <div
                id="filter-card"
                class="sticky top-2 z-20 min-w-0 shrink-0 rounded-xl border border-blue-200/60 bg-white/95 p-5 shadow-md shadow-blue-500/10 backdrop-blur-md sm:p-6
                     will-change-transform
                     transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                     dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30"
            >
                <p class="text-xs font-medium uppercase tracking-wider text-black dark:text-blue-400">
                    Filters
                </p>

                <div class="mt-4 flex flex-wrap items-center gap-1 rounded-lg bg-blue-50/60 p-1 dark:bg-zinc-800/60">
                    <button type="button" data-filter="all" class="filter-btn rounded-md px-3 py-1.5 text-xs font-medium transition">All</button>
                    <button type="button" data-filter="unfinished" class="filter-btn rounded-md px-3 py-1.5 text-xs font-medium transition">Unfinished</button>
                    <button type="button" data-filter="finished" class="filter-btn rounded-md px-3 py-1.5 text-xs font-medium transition">Finished</button>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input type="text" id="search-name" placeholder="Search by name or category..."
                        class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-500">

                    <select id="search-priority"
                        class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                        <option value="">All priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <input type="date" id="search-date"
                        class="w-full rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                </div>
            </div>

            <section class="flex min-w-0 flex-col rounded-xl border border-blue-200/60 bg-white/90 shadow-md shadow-blue-500/10 backdrop-blur-sm 
                dark:border-zinc-800 dark:bg-zinc-900/80">

                <div class="flex shrink-0 flex-col gap-3 border-b border-blue-100 px-5 py-4 sm:flex-row sm:items-center 
                    sm:justify-between sm:px-6 dark:border-zinc-800">
                    <div class="min-w-0">
                        <p class="text-xs font-medium uppercase tracking-wider text-black dark:text-blue-400">Task List</p>
                        <p class="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <span class="text-3xl font-semibold text-zinc-900 dark:text-white" id="remaining-tasks">0</span>
                            <span class="text-xs">tasks remaining</span>
                        </p>
                    </div>
                </div>

                <div class="w-full overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="border-b border-blue-100 bg-blue-50/40 dark:border-zinc-800 dark:bg-zinc-800/40">
                            <tr>
                                <th class="min-w-[160px] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Task</th>
                                <th class="min-w-[240px] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description</th>
                                <th class="w-24 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Priority</th>
                                <th class="w-32 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Category</th>
                                <th class="w-32 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Due Date</th>
                                <th class="w-32 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="task-list" class="divide-y divide-blue-100/70 dark:divide-zinc-800/70"></tbody>
                    </table>
                </div>

                <div id="pagination-controls"
                    class="hidden shrink-0 flex-col items-center justify-center gap-2 border-t border-blue-100 px-5 py-4 sm:px-6 dark:border-zinc-800">
                    <div class="flex items-center justify-center gap-1">
                        <button id="pagination-prev" type="button"
                            class="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white/70 px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white">
                            ‹ Prev
                        </button>
                        <div id="pagination-pages" class="flex items-center gap-1"></div>
                        <button id="pagination-next" type="button"
                            class="inline-flex h-8 items-center justify-center rounded-lg border border-blue-200 bg-white/70 px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white">
                            Next ›
                        </button>
                    </div>
                    <p id="pagination-info" class="text-center text-xs text-zinc-500 dark:text-zinc-400">Showing 0–0 of 0</p>
                </div>
            </section>
        </div>
    </div>

    <div id="view-task-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-blue-950/50 px-4 backdrop-blur-sm dark:bg-black/70">
        <div class="w-full max-w-lg rounded-xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">
            <div class="mb-5 flex items-center justify-between gap-4 border-b border-blue-100 pb-4 dark:border-zinc-800">
                <h3 id="view-task-title" class="text-base font-semibold text-zinc-900 dark:text-white">Task Title</h3>
                <button id="close-view-modal" type="button" class="shrink-0 text-lg text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white">&times;</button>
            </div>
            <div class="space-y-4">
                <div>
                    <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</p>
                    <p id="view-task-description" class="text-sm text-zinc-700 dark:text-zinc-200">—</p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Priority</p>
                        <p id="view-task-priority" class="text-sm text-zinc-700 dark:text-zinc-200">—</p>
                    </div>
                    <div>
                        <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Category</p>
                        <p id="view-task-category" class="text-sm text-zinc-700 dark:text-zinc-200">—</p>
                    </div>
                </div>
                <div>
                    <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Due Date</p>
                    <p id="view-task-due-date" class="text-sm text-zinc-700 dark:text-zinc-200">—</p>
                </div>
            </div>
            <div class="mt-7 flex justify-end">
                <button id="close-view-modal-btn" type="button"
                    class="rounded-xl border border-blue-200 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700">
                    Close
                </button>
            </div>
        </div>
    </div>
@endsection