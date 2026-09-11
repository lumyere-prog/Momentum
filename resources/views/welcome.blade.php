<!DOCTYPE html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Momentum</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="min-h-screen bg-white text-zinc-100 antialiased">

<div class="min-h-screen">

    {{-- NAVBAR --}}
    <header>
        <div class="mx-auto w-full px-10 py-2">
            <div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">

                <div class="flex min-w-0 items-center gap-3 sm:gap-5">

                    <div class="flex h-14 w-14 shrink-0 sm:h-16 sm:w-16 md:h-20 md:w-20">
                        <img
                            src="{{ asset('images/logo.png') }}"
                            alt="Logo"
                            class="h-full w-full object-contain"
                        >
                    </div>

                    <div class="min-w-0">
                        <p class="mt-0 text-sm font-bold text-zinc-900 sm:text-base md:text-lg">
                            Make a list, Conquer your day!
                        </p>
                    </div>

                </div>

                <div class="w-full sm:w-auto">
                    <p class="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-900 sm:text-xs sm:tracking-[0.2em]">
                        {{ now()->format('l, F j') }}
                    </p>
                </div>

            </div>
        </div>
    </header>


    {{-- MAIN --}}
    <main class="w-full px-10 py-2">

        {{-- HEADER --}}
        <div class="mb-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <button
                id="add-task"
                type="button"
                class="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-600 cursor-pointer sm:w-full"
            >
                <span class="text-base">+</span>
                Add task
            </button>

        </div>


        {{-- STATS --}}
        <div class="mb-2 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2">

            {{-- TODAY'S TASKS --}}
            <div class="min-w-0 bg-[#0c0c0f] p-4 sm:p-5">

                <p class="text-xs text-zinc-500">
                    Today's tasks
                </p>

                <div class="mt-3 flex items-end gap-2">

                    <span
                        id="total-tasks"
                        class="text-2xl font-semibold text-white"
                    >
                        0
                    </span>

                    <span class="pb-0.5 text-xs text-zinc-600">
                        tasks
                    </span>

                </div>

            </div>


            {{-- COMPLETED --}}
            <div class="min-w-0 bg-[#0c0c0f] p-4 sm:p-5">

                <p class="text-xs text-zinc-500">
                    Completed
                </p>

                <div class="mt-3 flex items-end gap-2">

                    <span
                        id="completed-tasks"
                        class="text-2xl font-semibold text-white"
                    >
                        0
                    </span>

                    <span
                        id="completion-percentage"
                        class="pb-0.5 text-xs font-medium text-emerald-400"
                    >
                        0%
                    </span>

                </div>

            </div>

            {{-- PRODUCTIVITY --}}
                <div class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-4 sm:p-5">

                    <div class="flex items-center justify-between">

                        <h3 class="text-sm font-semibold">
                            Productivity
                        </h3>

                        <span class="text-[11px] text-zinc-600">
                            This week
                        </span>

                    </div>


                    <div class="mt-3 flex flex-col gap-4 min-[400px]:flex-row min-[400px]:items-center">

                        <div
                            id="productivity-circle"
                            class="productivity-circle relative mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-full min-[400px]:mx-0"
                            style="--progress: 0%;"
                        >
                            <div class="absolute inset-[7px] flex items-center justify-center rounded-full bg-[#0c0c0f]">
                                <div class="text-center">

                                    <p
                                        id="sidebar-percentage"
                                        class="text-xl font-semibold text-white"
                                    >
                                        0%
                                    </p>

                                    <p class="text-[9px] text-zinc-600">
                                        score
                                    </p>

                                </div>
                            </div>
                        </div>


                        <div class="min-w-0 flex-1">

                            <div class="mb-3 flex items-center justify-between gap-2">

                                <span class="text-xs text-zinc-500">
                                    Completed
                                </span>

                                <span
                                    id="sidebar-task-count"
                                    class="text-xs font-medium"
                                >
                                    0 / 0
                                </span>

                            </div>

                            <div class="h-1.5 overflow-hidden rounded-full bg-zinc-800">

                                <div
                                    id="progress-bar"
                                    class="h-full w-0 rounded-full bg-violet-500 transition-all duration-300"
                                ></div>

                            </div>

                            <p class="mt-3 text-[11px] leading-4 text-zinc-600">
                                Keep completing tasks to improve your score.
                            </p>

                        </div>

                    </div>

                </div>


                {{-- TASK DEBT --}}
                <div class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-4 sm:p-5">

                    <div class="flex items-start justify-between gap-4">

                        <div>

                            <p class="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                Task debt
                            </p>

                            <p
                                id="task-debt"
                                class="mt-2 text-3xl font-semibold"
                            >
                                0
                            </p>

                        </div>

                        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-400/10 text-sm">
                            💀
                        </div>

                    </div>

                    <p
                        id="task-debt-message"
                        class="mt-4 text-xs leading-5 text-zinc-500"
                    >
                        You're all caught up. Keep the momentum going.
                    </p>

                    <button
                        id="review-debt"
                        type="button"
                        class="mt-4 w-full rounded-lg border border-zinc-800 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                    >
                        Review debt
                    </button>

                </div>

        </div>



        {{-- CONTENT --}}
        <div class="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_-10px]">


            {{-- TASK PANEL --}}
            <section class="min-w-0 overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0f]">

                {{-- TASK HEADER --}}
                <div class="flex flex-col gap-3 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                    <div class="min-w-0">

                        <h3 class="text-sm font-semibold text-white">
                            Today's tasks
                        </h3>

                        <p class="mt-1 text-xs text-zinc-600">
                            <span id="remaining-tasks">0</span>
                            tasks remaining
                        </p>

                    </div>

                   

                </div>


                {{-- TASKS --}}
                {{-- JavaScript will render tasks here --}}
                <div
                    id="task-list"
                    class="divide-y divide-zinc-800/70"
                >
                </div>

            </section>

        </div>

    </main>


</div>


{{-- ==========================================
     ADD TASK MODAL
     ========================================== --}}

<div
    id="task-modal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
>

    <div class="w-full max-w-md rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5 shadow-xl sm:p-6">

        <div class="mb-5 flex items-center justify-between gap-4">

            <h3 class="text-sm font-semibold text-white">
                Add New Task
            </h3>

            <button
                id="close-modal"
                type="button"
                class="shrink-0 text-zinc-500 transition hover:text-white"
            >
                &times;
            </button>

        </div>


        <form
            id="task-form"
            class="space-y-4"
        >

            {{-- TASK TITLE --}}
            <div>

                <label
                    for="task-title"
                    class="mb-1.5 block text-xs text-zinc-400"
                >
                    Task Title
                </label>

                <input
                    type="text"
                    id="task-title"
                    required
                    class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                    placeholder="e.g. Finish Laravel dashboard"
                />

            </div>


            {{-- PRIORITY + CATEGORY --}}
            <div class="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">

                <div>

                    <label
                        for="task-priority"
                        class="mb-1.5 block text-xs text-zinc-400"
                    >
                        Priority
                    </label>

                    <select
                        id="task-priority"
                        class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                    >
                        <option value="Low">Low</option>
                        <option value="Medium" selected>Medium</option>
                        <option value="High">High</option>
                    </select>

                </div>


                <div>

                    <label
                        for="task-category"
                        class="mb-1.5 block text-xs text-zinc-400"
                    >
                        Category
                    </label>

                    <input
                        type="text"
                        id="task-category"
                        class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                        placeholder="e.g. Development"
                    />

                </div>

            </div>

            {{-- TASK DESCRIPTION --}}
            <div>
                <label for="task-description" class="mb-1.5 block text-xs text-zinc-400">Description</label>
                <textarea id="task-description" rows="3" class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none resize-none" placeholder="Add more details about this task..."></textarea>
            </div>


            {{-- DUE DATE --}}
            <div>

                <label
                    for="task-due-date"
                    class="mb-1.5 block text-xs text-zinc-400"
                >
                    Due Date
                </label>

                <input
                    type="date"
                    id="task-due-date"
                    class="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />

            </div>


            {{-- SAVE TASK --}}
            <button
                type="submit"
                class="mt-4 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
                Save Task
            </button>

        </form>

    </div>

</div>


{{-- ==========================================
     TASK DEBT MODAL
     ========================================== --}}

<div
    id="debt-modal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
>

    <div class="w-full max-w-md rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5 shadow-xl sm:p-6">

        <div class="flex items-center justify-between gap-4">

            <div class="min-w-0">

                <h3 class="text-sm font-semibold text-white">
                    Task Debt
                </h3>

                <p class="mt-1 text-xs text-zinc-600">
                    These tasks are overdue.
                </p>

            </div>

            <button
                id="close-debt-modal"
                type="button"
                class="shrink-0 text-zinc-500 transition hover:text-white"
            >
                &times;
            </button>

        </div>


        {{-- DEBT TASK LIST --}}
        <div
            id="debt-task-list"
            class="mt-5 max-h-80 overflow-y-auto divide-y divide-zinc-800/70"
        >
        </div>


        {{-- CLOSE DEBT MODAL --}}
        <button
            id="close-debt"
            type="button"
            class="mt-5 w-full rounded-lg border border-zinc-800 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        >
            Close
        </button>

    </div>

</div>

{{-- ==========================================
     VIEW TASK DETAILS MODAL
     ========================================== --}}

<div
    id="view-task-modal"
    class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
>

    <div class="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5 shadow-xl sm:p-6">

        <div class="mb-4 flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">

            <h3 id="view-task-title" class="text-base font-semibold text-white">
                Task Title
            </h3>

            <button
                id="close-view-modal"
                type="button"
                class="shrink-0 text-zinc-500 transition hover:text-white text-lg"
            >
                &times;
            </button>

        </div>


        <div class="space-y-4 text-sm text-zinc-300">

            {{-- DESCRIPTION --}}
            <div>
                <span class="text-xs text-zinc-500 block mb-1">Description</span>
                <p id="view-task-description" class="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-zinc-200 min-h-[60px] whitespace-pre-wrap"></p>
            </div>


            {{-- META GRID --}}
            <div class="grid grid-cols-2 gap-4">

                <div>
                    <span class="text-xs text-zinc-500 block mb-1">Priority</span>
                    <span id="view-task-priority" class="inline-block rounded-md px-2 py-0.5 text-xs font-medium"></span>
                </div>

                <div>
                    <span class="text-xs text-zinc-500 block mb-1">Category</span>
                    <span id="view-task-category" class="text-xs text-zinc-300">None</span>
                </div>

            </div>


            {{-- DUE DATE --}}
            <div>
                <span class="text-xs text-zinc-500 block mb-1">Due Date</span>
                <span id="view-task-due-date" class="text-xs text-zinc-300"></span>
            </div>

        </div>


        <div class="mt-6 flex justify-end">
            <button
                id="close-view-modal-btn"
                type="button"
                class="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            >
                Close
            </button>
        </div>

    </div>

</div>


</body>
</html>
