
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Momentum</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body class="min-h-screen bg-[#09090b] text-zinc-100 antialiased">

    <div class="min-h-screen">

        {{-- NAVBAR --}}
        <header class="border-b border-zinc-800/80 bg-[#09090b]/95">
            <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                <div class="flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-black text-black">
                        ✓
                    </div>

                    <div>
                        <h1 class="text-sm font-semibold tracking-wide">
                            Momentum
                        </h1>

                        <p class="text-xs text-zinc-500">
                            Personal workspace
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-4">

                    <div class="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 sm:flex">
                        <span class="text-sm">🔥</span>
                        <span class="text-xs font-medium text-zinc-300">
                            7 day streak
                        </span>
                    </div>

                    <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white">
                        ⚙
                    </button>

                </div>

            </div>
        </header>


        {{-- MAIN --}}
        <main class="mx-auto max-w-7xl px-6 py-10">

            {{-- HEADER --}}
            <div class="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

                <div>
                    <p class="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                        {{ now()->format('l, F j') }}
                    </p>

                    <h2 class="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Good morning.
                    </h2>

                    <p class="mt-2 text-sm text-zinc-500">
                        Let's get a few things done today.
                    </p>
                </div>

                <button class="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200">
                    <span class="text-base">+</span>
                    Add task
                </button>

            </div>


            {{-- STATS --}}
            <div class="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800 md:grid-cols-4">

                <div class="bg-[#0c0c0f] p-5">
                    <p class="text-xs text-zinc-500">Today's tasks</p>

                    <div class="mt-3 flex items-end gap-2">
                        <span class="text-2xl font-semibold">12</span>
                        <span class="pb-0.5 text-xs text-zinc-600">tasks</span>
                    </div>
                </div>

                <div class="bg-[#0c0c0f] p-5">
                    <p class="text-xs text-zinc-500">Completed</p>

                    <div class="mt-3 flex items-end gap-2">
                        <span class="text-2xl font-semibold">8</span>
                        <span class="pb-0.5 text-xs text-emerald-400">67%</span>
                    </div>
                </div>

                <div class="bg-[#0c0c0f] p-5">
                    <p class="text-xs text-zinc-500">Current streak</p>

                    <div class="mt-3 flex items-end gap-2">
                        <span class="text-2xl font-semibold">7</span>
                        <span class="pb-0.5 text-xs text-orange-400">🔥 days</span>
                    </div>
                </div>

                <div class="bg-[#0c0c0f] p-5">
                    <p class="text-xs text-zinc-500">Experience</p>

                    <div class="mt-3 flex items-end gap-2">
                        <span class="text-2xl font-semibold">240</span>
                        <span class="pb-0.5 text-xs text-violet-400">XP</span>
                    </div>
                </div>

            </div>


            {{-- CONTENT --}}
            <div class="grid gap-6 lg:grid-cols-[1fr_340px]">


                {{-- TASK PANEL --}}
                <section class="overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0f]">

                    {{-- TASK HEADER --}}
                    <div class="flex items-center justify-between border-b border-zinc-800 px-5 py-4">

                        <div>
                            <h3 class="text-sm font-semibold text-white">
                                Today's tasks
                            </h3>

                            <p class="mt-1 text-xs text-zinc-600">
                                4 tasks remaining
                            </p>
                        </div>

                        <button class="text-xs font-medium text-zinc-500 transition hover:text-white">
                            View all
                        </button>

                    </div>


                    {{-- TASKS --}}
                    <div class="divide-y divide-zinc-800/70">


                        {{-- TASK --}}
                        <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/50">

                            <button class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 transition hover:border-violet-400 hover:bg-violet-400/10">
                            </button>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm font-medium text-zinc-200">
                                    Finish Laravel dashboard
                                </p>

                                <div class="mt-2 flex items-center gap-2">

                                    <span class="rounded-md bg-red-400/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                                        High
                                    </span>

                                    <span class="text-[11px] text-zinc-600">
                                        Development
                                    </span>

                                </div>

                            </div>

                            <span class="text-xs text-zinc-600">
                                Today
                            </span>

                        </div>


                        {{-- TASK --}}
                        <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/50">

                            <button class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 transition hover:border-violet-400 hover:bg-violet-400/10">
                            </button>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm font-medium text-zinc-200">
                                    Create database migrations
                                </p>

                                <div class="mt-2 flex items-center gap-2">

                                    <span class="rounded-md bg-yellow-400/10 px-2 py-0.5 text-[10px] font-medium text-yellow-400">
                                        Medium
                                    </span>

                                    <span class="text-[11px] text-zinc-600">
                                        Laravel
                                    </span>

                                </div>

                            </div>

                            <span class="text-xs text-zinc-600">
                                Today
                            </span>

                        </div>


                        {{-- COMPLETED TASK --}}
                        <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/50">

                            <button class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-black">
                                ✓
                            </button>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm text-zinc-600 line-through">
                                    Setup Git repository
                                </p>

                                <div class="mt-2">
                                    <span class="text-[11px] text-emerald-500">
                                        Completed
                                    </span>
                                </div>

                            </div>

                            <span class="text-xs text-zinc-700">
                                Done
                            </span>

                        </div>


                        {{-- TASK --}}
                        <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/50">

                            <button class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 transition hover:border-violet-400 hover:bg-violet-400/10">
                            </button>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm font-medium text-zinc-200">
                                    Test task management system
                                </p>

                                <div class="mt-2 flex items-center gap-2">
                                    <span class="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                                        Low energy
                                    </span>
                                </div>

                            </div>

                            <span class="text-xs text-zinc-600">
                                Tomorrow
                            </span>

                        </div>


                        {{-- TASK --}}
                        <div class="group flex items-center gap-4 px-5 py-4 transition hover:bg-zinc-900/50">

                            <button class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 transition hover:border-violet-400 hover:bg-violet-400/10">
                            </button>

                            <div class="min-w-0 flex-1">

                                <p class="truncate text-sm font-medium text-zinc-200">
                                    Review project requirements
                                </p>

                                <div class="mt-2 flex items-center gap-2">
                                    <span class="text-[11px] text-zinc-600">
                                        Planning
                                    </span>
                                </div>

                            </div>

                            <span class="text-xs text-zinc-600">
                                Tomorrow
                            </span>

                        </div>

                    </div>


                    {{-- TASK FOOTER --}}
                    <div class="border-t border-zinc-800 px-5 py-4">

                        <button class="text-xs font-medium text-zinc-500 transition hover:text-white">
                            + Add another task
                        </button>

                    </div>

                </section>


                {{-- SIDEBAR --}}
                <aside class="space-y-6">


                    {{-- PRODUCTIVITY --}}
                    <div class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5">

                        <div class="flex items-center justify-between">
                            <h3 class="text-sm font-semibold">
                                Productivity
                            </h3>

                            <span class="text-[11px] text-zinc-600">
                                This week
                            </span>
                        </div>


                        <div class="mt-6 flex items-center gap-5">

                            <div class="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[7px] border-zinc-800">

                                <div class="absolute inset-[-7px] rounded-full border-[7px] border-violet-500 border-b-transparent border-l-transparent rotate-[-35deg]"></div>

                                <div class="text-center">
                                    <p class="text-xl font-semibold">
                                        78%
                                    </p>

                                    <p class="text-[9px] text-zinc-600">
                                        score
                                    </p>
                                </div>

                            </div>


                            <div class="flex-1">

                                <div class="mb-3 flex items-center justify-between">
                                    <span class="text-xs text-zinc-500">
                                        Completed
                                    </span>

                                    <span class="text-xs font-medium">
                                        8 / 12
                                    </span>
                                </div>

                                <div class="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                    <div class="h-full w-[67%] rounded-full bg-violet-500"></div>
                                </div>

                                <p class="mt-3 text-[11px] text-zinc-600">
                                    You're doing better than last week.
                                </p>

                            </div>

                        </div>

                    </div>


                    {{-- TASK DEBT --}}
                    <div class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5">

                        <div class="flex items-start justify-between">

                            <div>
                                <p class="text-xs font-medium uppercase tracking-wider text-zinc-600">
                                    Task debt
                                </p>

                                <p class="mt-2 text-3xl font-semibold">
                                    3
                                </p>
                            </div>

                            <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-red-400/10 text-sm">
                                💀
                            </div>

                        </div>

                        <p class="mt-4 text-xs leading-5 text-zinc-500">
                            Tasks you've postponed. Don't let them pile up.
                        </p>

                        <button class="mt-4 w-full rounded-lg border border-zinc-800 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-900 hover:text-white">
                            Review debt
                        </button>

                    </div>


                    {{-- FOCUS MODE --}}
                    <div class="rounded-xl border border-violet-500/20 bg-violet-500/[0.04] p-5">

                        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-sm">
                            🎯
                        </div>

                        <h3 class="mt-4 text-sm font-semibold">
                            Focus mode
                        </h3>

                        <p class="mt-2 text-xs leading-5 text-zinc-500">
                            Work on one task without distractions.
                        </p>

                        <button class="mt-4 w-full rounded-lg bg-violet-500 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-400">
                            Start focus session
                        </button>

                    </div>

                </aside>

            </div>


            {{-- BOTTOM --}}
            <div class="mt-6 grid gap-6 lg:grid-cols-2">


                {{-- ACHIEVEMENTS --}}
                <section class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5">

                    <div class="flex items-center justify-between">

                        <div>
                            <h3 class="text-sm font-semibold">
                                Achievements
                            </h3>

                            <p class="mt-1 text-xs text-zinc-600">
                                Keep going to unlock more.
                            </p>
                        </div>

                        <span class="text-lg">
                            🏆
                        </span>

                    </div>


                    <div class="mt-5 grid grid-cols-3 gap-3">

                        <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                            <div class="text-xl">🔥</div>
                            <p class="mt-2 text-[10px] font-medium text-zinc-400">
                                7 Day Streak
                            </p>
                        </div>

                        <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                            <div class="text-xl">⚡</div>
                            <p class="mt-2 text-[10px] font-medium text-zinc-400">
                                Fast Starter
                            </p>
                        </div>

                        <div class="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                            <div class="text-xl">🎯</div>
                            <p class="mt-2 text-[10px] font-medium text-zinc-400">
                                Focused
                            </p>
                        </div>

                    </div>

                </section>


                {{-- WEEKLY ACTIVITY --}}
                <section class="rounded-xl border border-zinc-800 bg-[#0c0c0f] p-5">

                    <div>
                        <h3 class="text-sm font-semibold">
                            Weekly activity
                        </h3>

                        <p class="mt-1 text-xs text-zinc-600">
                            Completed tasks over the last 7 days.
                        </p>
                    </div>


                    <div class="mt-6 flex h-28 items-end gap-2">

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[30%] rounded-sm bg-zinc-800"></div>
                            <span class="text-center text-[9px] text-zinc-700">M</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[50%] rounded-sm bg-zinc-700"></div>
                            <span class="text-center text-[9px] text-zinc-700">T</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[70%] rounded-sm bg-violet-500/60"></div>
                            <span class="text-center text-[9px] text-zinc-700">W</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[45%] rounded-sm bg-zinc-700"></div>
                            <span class="text-center text-[9px] text-zinc-700">T</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[90%] rounded-sm bg-violet-500"></div>
                            <span class="text-center text-[9px] text-zinc-700">F</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[60%] rounded-sm bg-zinc-700"></div>
                            <span class="text-center text-[9px] text-zinc-700">S</span>
                        </div>

                        <div class="flex h-full flex-1 flex-col justify-end gap-2">
                            <div class="h-[25%] rounded-sm bg-zinc-800"></div>
                            <span class="text-center text-[9px] text-zinc-700">S</span>
                        </div>

                    </div>

                </section>

            </div>

        </main>


        {{-- FOOTER --}}
        <footer class="mx-auto max-w-7xl px-6 py-8">
            <div class="border-t border-zinc-900 pt-6 text-center">
                <p class="text-[11px] text-zinc-700">
                    TaskFlow · Stay focused. Get things done.
                </p>
            </div>
        </footer>

    </div>

</body>
</html>
```
