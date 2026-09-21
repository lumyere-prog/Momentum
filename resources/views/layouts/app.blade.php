<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Momentum')</title>
    <link rel="icon" type="image/png" href="{{ asset('images/logo2.png') }}">

    <script>
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <script>
        window.APP_ASSETS = {
            bin:   "{{ asset('images/bin.png') }}",
            edit:  "{{ asset('images/edit.png') }}",
            eye:   "{{ asset('images/eye.png') }}",
            check: "{{ asset('images/check.png') }}",
            undo:  "{{ asset('images/undo.png') }}",
        };
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        #sidebar {
            width: 64px;
            transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #sidebar:hover { width: 240px; }

        .sidebar-label {
            opacity: 0;
            transform: translateX(-6px);
            white-space: nowrap;
            transition: opacity 0.2s ease, transform 0.25s ease;
            pointer-events: none;
        }
        #sidebar:hover .sidebar-label {
            opacity: 1;
            transform: translateX(0);
            pointer-events: auto;
        }

        .sidebar-sublist {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
            opacity: 0;
        }
        #sidebar:hover .sidebar-sublist { max-height: 200px; opacity: 1; }

        .sidebar-sublist a { padding-left: 3.25rem; }

        #main-area {
            transition: padding-left 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            padding-left: 80px;
        }

        .sidebar-item-active {
            background: rgba(59, 130, 246, 0.12);
            color: #2563eb;
        }
        .dark .sidebar-item-active {
            background: rgba(59, 130, 246, 0.2);
            color: #93c5fd;
        }

        [data-animate] {
            opacity: 0;
            transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1),
                        transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: opacity, transform;
        }
        [data-animate="fade-up"]    { transform: translateY(28px); }
        [data-animate="fade-down"]  { transform: translateY(-28px); }
        [data-animate="fade-left"]  { transform: translateX(28px); }
        [data-animate="fade-right"] { transform: translateX(-28px); }
        [data-animate="zoom-in"]    { transform: scale(0.92); }
        [data-animate="flip-up"]    { transform: perspective(800px) rotateX(-12deg) translateY(20px); }

        [data-animate].is-visible {
            opacity: 1;
            transform: translateY(0) translateX(0) scale(1) rotateX(0);
        }

        .scroll-delay-1 { transition-delay: 0.05s; }
        .scroll-delay-2 { transition-delay: 0.10s; }
        .scroll-delay-3 { transition-delay: 0.15s; }
        .scroll-delay-4 { transition-delay: 0.20s; }
        .scroll-delay-5 { transition-delay: 0.25s; }
        .scroll-delay-6 { transition-delay: 0.30s; }

        .card-lift {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.3s ease;
        }
        .card-lift:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px -8px rgba(59, 130, 246, 0.20);
        }
        .dark .card-lift:hover {
            box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.55);
        }

        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
        }
        .btn-gradient {
            background-size: 200% 200%;
            animation: gradientShift 4s ease infinite;
        }

        .press-scale { transition: transform 0.12s ease; }
        .press-scale:active { transform: scale(0.97); }

        @keyframes floatSoft {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-4px); }
        }
        .float-soft { animation: floatSoft 4s ease-in-out infinite; }

        @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-panel-in { animation: modalIn 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) both; }

        .carousel-arrow {
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                        background-color 0.2s ease,
                        color 0.2s ease;
        }
        .carousel-arrow:hover { transform: translateY(-50%) scale(1.12); }
        .carousel-arrow:active { transform: translateY(-50%) scale(0.94); }

        @keyframes gentlePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.5); }
            50%      { box-shadow: 0 0 0 8px rgba(96, 165, 250, 0); }
        }
        .date-pulse { animation: gentlePulse 2.5s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
            [data-animate] {
                opacity: 1 !important;
                transform: none !important;
                transition: none !important;
            }
        }
    </style>

    @stack('styles')
</head>

<body class="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 text-zinc-900 antialiased dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-100">

    <aside
        id="sidebar"
        class="fixed left-0 top-0 z-40 flex h-full flex-col overflow-hidden border-r border-blue-200/60 bg-white/90 shadow-md shadow-blue-500/10 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:shadow-black/30"
    >
        <a href="/" class="flex h-16 shrink-0 items-center gap-3 px-4">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center">
                <img src="{{ asset('images/logo2.png') }}" alt="Logo" class="h-full w-full object-contain">
            </div>
            <span class="sidebar-label text-sm font-bold text-zinc-900 dark:text-white">Momentum</span>
        </a>

        <nav class="mt-2 flex flex-1 flex-col gap-1 px-2">

            <a href="{{ url('/') }}"
                class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white {{ request()->is('/') ? 'sidebar-item-active' : '' }}">
                <svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="sidebar-label">Dashboard</span>
            </a>

            <div class="flex flex-col">
                <a href="{{ route('task') }}"
                    class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white {{ request()->is('task') ? 'sidebar-item-active' : '' }}">
                    <svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span class="sidebar-label">Task</span>
                </a>

                <div class="sidebar-sublist mt-1 flex flex-col gap-0.5">
                    <a href="{{ route('task') }}?filter=unfinished"
                        class="flex items-center gap-2 rounded-md py-2 pr-3 text-xs font-medium text-zinc-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"></span>
                        <span>Unfinished</span>
                    </a>

                    <a href="{{ route('task') }}?filter=finished"
                        class="flex items-center gap-2 rounded-md py-2 pr-3 text-xs font-medium text-zinc-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white">
                        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"></span>
                        <span>Finished</span>
                    </a>
                </div>
            </div>

        </nav>

        <div class="shrink-0 px-4 pb-4">
            <p class="sidebar-label text-[10px] text-zinc-400 dark:text-zinc-500">
                © {{ date('Y') }} Momentum
            </p>
        </div>
    </aside>

    <div id="main-area" class="min-h-screen">

        <header data-animate="fade-down">
            <div class="mx-auto w-full px-10 py-2">
                <div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">

                    <a href="/" class="flex min-w-0 items-center gap-3 sm:gap-5">
                        <div class="float-soft flex h-14 w-14 shrink-0 sm:h-16 sm:w-16 md:h-20 md:w-20">
                            <img src="{{ asset('images/logo2.png') }}" alt="Logo" class="h-full w-full object-contain drop-shadow-md">
                        </div>
                        <div class="flex min-w-0 flex-col gap-1">
                            <p class="mt-0 text-sm font-bold text-zinc-900 sm:text-base md:text-lg dark:text-zinc-100">
                                Make a list, Conquer your day!
                            </p>
                        </div>
                    </a>

                    <div class="flex w-full items-center gap-2 sm:w-auto">

                        <button id="theme-toggle" type="button"
                            class="press-scale inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white/70 text-zinc-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white"
                            title="Toggle theme" aria-label="Toggle theme">
                            <svg id="theme-icon-sun" class="hidden h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="4" />
                                <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                            </svg>

                            <svg id="theme-icon-moon" class="hidden h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        </button>

                        <p class="date-pulse text-[10px] font-medium uppercase tracking-[0.15em] text-white sm:text-xs sm:tracking-[0.2em] bg-blue-400 px-3 py-2 rounded-lg text-center shadow-md shadow-blue-500/30">
                            {{ now()->format('l, F j') }}
                        </p>
                    </div>

                </div>
            </div>
        </header>

        @yield('content')

    </div>

    @stack('scripts')

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const elements = document.querySelectorAll('[data-animate]');
            if (!elements.length) return;

            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) {
                elements.forEach(el => el.classList.add('is-visible'));
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -60px 0px'
            });

            elements.forEach(el => observer.observe(el));
        });
    </script>
</body>
</html>