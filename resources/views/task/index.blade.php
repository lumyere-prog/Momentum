
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="grid grid-cols-1 gap-2">

    <section class="min-w-0 overflow-hidden rounded-xl border border-blue-200/60 bg-white/90 shadow-md shadow-blue-500/10 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">

        <div class="flex flex-col gap-3 border-b border-blue-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800">

            <div class="min-w-0">

                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
                    Today's tasks
                </h3>

                <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span id="remaining-tasks">0</span>
                    tasks remaining
                </p>

            </div>

        </div>

        <div
            id="task-list"
            class="divide-y divide-blue-100/70 dark:divide-zinc-800/70"
        >
        </div>

    </section>

</div>


{{-- View Task Modal --}}
<div
    id="view-task-modal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center bg-blue-950/50 px-4 backdrop-blur-sm dark:bg-black/70"
>

    <div class="w-full max-w-lg rounded-xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/50">

        <div class="mb-5 flex items-center justify-between gap-4 border-b border-blue-100 pb-4 dark:border-zinc-800">

            <h3
                id="view-task-title"
                class="text-base font-semibold text-zinc-900 dark:text-white"
            >
                Task Title
            </h3>

            <button
                id="close-view-modal"
                type="button"
                class="shrink-0 text-lg text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
            >
                &times;
            </button>

        </div>

        <div class="space-y-4">

            <div>
                <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Description
                </p>

                <p
                    id="view-task-description"
                    class="text-sm text-zinc-700 dark:text-zinc-200"
                >
                    —
                </p>
            </div>

            <div class="grid grid-cols-2 gap-4">

                <div>
                    <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Priority
                    </p>

                    <p
                        id="view-task-priority"
                        class="text-sm text-zinc-700 dark:text-zinc-200"
                    >
                        —
                    </p>
                </div>

                <div>
                    <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Category
                    </p>

                    <p
                        id="view-task-category"
                        class="text-sm text-zinc-700 dark:text-zinc-200"
                    >
                        —
                    </p>
                </div>

            </div>

            <div>
                <p class="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    Due Date
                </p>

                <p
                    id="view-task-due-date"
                    class="text-sm text-zinc-700 dark:text-zinc-200"
                >
                    —
                </p>
            </div>

        </div>

        <div class="mt-7 flex justify-end">

            <button
                id="close-view-modal-btn"
                type="button"
                class="rounded-lg border border-blue-200 bg-white/70 px-4 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
                Close
            </button>

        </div>

    </div>

</div>


@vite(['resources/css/app.css', 'resources/js/app.js'])
