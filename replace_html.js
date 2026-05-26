const fs = require('fs');

const userTemplate = `
    <div class="min-h-screen bg-slate-900 text-slate-100 flex font-sans overflow-hidden w-full">

      <!-- MENU LATERAL (SIDEBAR) -->
      <aside class="w-72 bg-slate-800/80 border-r border-slate-700/50 flex flex-col relative z-20 backdrop-blur-xl">
        <div class="h-24 flex items-center px-8 border-b border-slate-700/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h1 class="text-2xl font-bold tracking-tight text-white">Fin<span class="text-emerald-400">Quest</span></h1>
          </div>
        </div>

        <!-- Navegação -->
        <nav class="flex-1 py-8 px-4 flex flex-col gap-2">
          <!-- Item: Dashboard -->
          <button (click)="mudarAba('dashboard')"
                  [class]="activeTab() === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent'"
                  class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border w-full text-left font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
          </button>

          <!-- Item: Trilhas / Missões -->
          <button (click)="mudarAba('trilhas')"
                  [class]="activeTab() === 'trilhas' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent'"
                  class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border w-full text-left font-medium relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            Trilhas
            <span class="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOVO</span>
          </button>

          <!-- Item: Simulador -->
          <button (click)="mudarAba('simulador')"
                  [class]="activeTab() === 'simulador' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent'"
                  class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border w-full text-left font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
            Simulador
          </button>

          <!-- Item: Conquistas -->
          <button (click)="mudarAba('conquistas')"
                  [class]="activeTab() === 'conquistas' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent'"
                  class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border w-full text-left font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            Conquistas
          </button>

          <button (click)="mudarAba('mentor')"
                  [class]="activeTab() === 'mentor' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-transparent'"
                  class="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all border w-full text-left font-medium relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            Mentor IA
            <span class="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BETA</span>
          </button>
        </nav>

        <div class="p-6 mt-auto">
          <div class="bg-gradient-to-b from-slate-700/50 to-slate-800 border border-slate-700 rounded-2xl p-4 text-center">
            <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="1"/></svg>
            </div>
            <h4 class="text-sm font-semibold text-slate-200 mb-1">Precisa de ajuda?</h4>
            <p class="text-xs text-slate-400 mb-3">Acesse nossa central de aprendizado.</p>
            <button class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors border border-slate-600">
              Ver Dicas
            </button>
          </div>
        </div>
      </aside>

      <!-- ÁREA PRINCIPAL -->
      <main class="flex-1 flex flex-col h-screen relative">
        <div class="absolute top-0 left-1/4 w-[800px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div class="absolute bottom-0 right-0 w-[600px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none -z-10"></div>

        <!-- HEADER / TOPO -->
        <header class="h-24 px-10 flex items-center justify-between z-10 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
          <div>
            <h2 class="text-2xl font-bold text-white tracking-tight capitalize">
              @if(activeTab() === 'dashboard') { Visão Geral }
              @else if(activeTab() === 'trilhas') { Trilha de Aprendizado }
              @else if(activeTab() === 'mentor') { Mentor de Inteligência Artificial }
              @else { {{ activeTab() }} }
            </h2>
            <p class="text-sm text-slate-400 mt-1">Bem-vindo de volta, {{ user().name }}!</p>
          </div>

          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 shadow-inner">
              <div class="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M16 12a4 4 0 0 0-8 0" stroke="#0f172a" stroke-width="2"/></svg>
              </div>
              <span class="font-bold text-slate-200">{{ user().coins }}</span>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Nível {{ user().level }}</p>
                <div class="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                       [style.width.%]="xpPercentage()"></div>
                </div>
                <p class="text-[10px] text-slate-500 mt-1 font-medium">{{ user().xp }} / {{ user().xpNextLevel }} XP</p>
              </div>

              <div class="relative">
                <img [src]="user().avatarUrl" alt="Avatar do Usuário" class="w-12 h-12 rounded-full border-2 border-slate-700 object-cover shadow-lg">
                <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                  {{ user().level }}
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTEÚDO SCROLLÁVEL -->
        <div class="flex-1 overflow-y-auto p-10 z-10 scrollbar-hide relative">

          <!-- ================= ABA DASHBOARD ================= -->
          @if (activeTab() === 'dashboard') {
            <div class="max-w-6xl mx-auto space-y-8 animate-fade-in">

              <!-- GRID DE ESTATÍSTICAS -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                  <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-medium text-slate-400 mb-1">XP Total Acumulado</p>
                      <h3 class="text-4xl font-bold text-white tracking-tight">{{ user().xp }}</h3>
                    </div>
                    <div class="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                  </div>
                  <div class="mt-6 flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                    +350 XP esta semana
                  </div>
                </div>

                <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                  <div class="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-medium text-slate-400 mb-1">Ofensiva Atual</p>
                      <h3 class="text-4xl font-bold text-white tracking-tight">{{ user().streak }} <span class="text-xl text-slate-500 font-medium">Dias</span></h3>
                    </div>
                    <div class="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                    </div>
                  </div>
                  <div class="mt-6 flex items-center gap-2 text-xs font-medium text-orange-400 bg-orange-400/10 w-fit px-3 py-1.5 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Faltam 3 dias para bônus
                  </div>
                </div>

                <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                  <div class="absolute -right-6 -top-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                  <div class="flex items-start justify-between">
                    <div>
                      <p class="text-sm font-medium text-slate-400 mb-1">Aulas Concluídas</p>
                      <h3 class="text-4xl font-bold text-white tracking-tight">12 <span class="text-xl text-slate-500 font-medium">/ 40</span></h3>
                    </div>
                    <div class="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center text-purple-400 shadow-inner">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    </div>
                  </div>
                  <div class="mt-6 w-full bg-slate-900/80 rounded-full h-1.5 mb-1 overflow-hidden">
                     <div class="bg-purple-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" style="width: 30%"></div>
                  </div>
                  <p class="text-[10px] text-slate-400 mt-2 font-medium">30% do curso básico</p>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- COLUNA ESQUERDA: Missão Atual -->
                <div class="lg:col-span-2 space-y-6">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m12 16 4-4-4-4"/><path d="M8 12h8"/></svg>
                      Continuar Jornada
                    </h3>
                    <button class="text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors" (click)="mudarAba('trilhas')">Ver trilha completa &rarr;</button>
                  </div>

                  <div class="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 overflow-hidden shadow-2xl">
                    <div class="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="absolute -right-10 -bottom-10 w-64 h-64 text-slate-800/50 pointer-events-none transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>

                    <div class="relative z-10">
                      <div class="flex items-center gap-3 mb-4">
                        <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 uppercase tracking-wider">
                          {{ nextMission().module }}
                        </span>
                      </div>

                      <h2 class="text-3xl font-bold text-white mb-2 tracking-tight">{{ nextMission().title }}</h2>
                      <p class="text-slate-400 max-w-lg mb-8 leading-relaxed">Aprenda na prática como os juros compostos funcionam e simule seu primeiro investimento em um título seguro do governo.</p>

                      <div class="flex items-center gap-6">
                        <button (click)="mudarAba('trilhas')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] transform hover:-translate-y-1 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Ir para as Trilhas
                        </button>

                        <div class="flex items-center gap-4 text-sm font-medium">
                          <div class="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                            <span class="text-emerald-400">+{{ nextMission().rewardXp }}</span> XP
                          </div>
                          <div class="flex items-center gap-1.5 text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                            <span class="text-yellow-500">+{{ nextMission().rewardCoins }}</span> Moedas
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- COLUNA DIREITA -->
                <div class="space-y-6">
                  <h3 class="text-xl font-bold text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                    Últimas Conquistas
                  </h3>

                  <div class="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 flex flex-col gap-4">
                    @for (achiev of recentAchievements(); track achiev.id) {
                      <div class="flex items-center gap-4 p-3 hover:bg-slate-700/30 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-600/50">
                        <div class="w-14 h-14 rounded-full flex items-center justify-center shadow-inner flex-shrink-0" [ngClass]="achiev.iconClass">
                          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        </div>
                        <div>
                          <h4 class="text-white font-bold text-sm">{{ achiev.title }}</h4>
                          <p class="text-slate-400 text-xs mt-0.5 line-clamp-1">{{ achiev.description }}</p>
                          <span class="text-[10px] text-slate-500 mt-1 block font-medium">{{ achiev.date }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- ================= ABA TRILHAS (NOVO) ================= -->
          @if (activeTab() === 'trilhas') {
            <div class="max-w-5xl mx-auto space-y-8 animate-fade-in">

              <!-- Se NÃO tiver nenhuma lição aberta, exibe a lista de níveis -->
              @if (!licaoAtiva()) {
                <div class="mb-8">
                  <h2 class="text-3xl font-bold text-white mb-2">Trilhas de Conhecimento</h2>
                  <p class="text-slate-400">Complete as lições de cada nível para ganhar experiência e moedas.</p>
                </div>

                @for (nivel of niveis(); track nivel.numNivel) {
                  <div class="bg-slate-800/60 backdrop-blur-md border border-slate-700 rounded-3xl p-8 shadow-xl mb-8 relative overflow-hidden">
                    <!-- Decorador -->
                    <div class="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>

                    <div class="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-4">
                      <h3 class="text-2xl font-bold text-white flex items-center gap-3">
                        <span class="w-10 h-10 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                          {{ nivel.numNivel }}
                        </span>
                        {{ nivel.titulo }}
                      </h3>
                      <span class="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                        Requer: {{ nivel.xpMinimo }} XP
                      </span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      @for (licao of nivel.licoes; track licao.idLicao) {
                        <div class="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col"
                             (click)="iniciarLicao(licao)">
                          <div class="flex justify-between items-start mb-4">
                            <div class="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            </div>
                            <div class="flex items-center gap-2 text-xs font-bold">
                              <span class="text-emerald-400 flex items-center gap-1"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m18 15-6-6-6 6"/></svg> {{ licao.recompensaXP }}</span>
                              <span class="text-yellow-500 flex items-center gap-1"><svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg> {{ licao.recompensaCredito }}</span>
                            </div>
                          </div>
                          <h4 class="text-lg font-bold text-white mb-2">{{ licao.titulo }}</h4>
                          <p class="text-sm text-slate-400 line-clamp-2 mb-4 flex-1">{{ licao.conteudo }}</p>
                          <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                            <span class="text-xs text-slate-500 font-medium">{{ licao.questoes.length }} Questões</span>
                            <span class="text-emerald-400 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">Começar <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              } @else {

                <!-- Tela do Jogo / Quiz Múltipla Escolha -->
                <div class="max-w-3xl mx-auto bg-slate-800/80 backdrop-blur-xl border border-slate-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-fade-in">

                  <!-- Topo do Jogo (Progresso e Vidas) -->
                  <div class="flex items-center justify-between mb-8 border-b border-slate-700/50 pb-6">
                    <button (click)="sairLicao()" class="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg> Sair
                    </button>

                    <div class="flex-1 mx-8">
                      <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="progressoLicao()"></div>
                      </div>
                      <p class="text-center text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">
                        Questão {{ questaoAtualIndex() + 1 }} de {{ licaoAtiva()?.questoes?.length }}
                      </p>
                    </div>

                    <div class="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      {{ vidasAtuais() }}
                    </div>
                  </div>

                  <!-- Conteúdo da Questão -->
                  @if (!licaoConcluida()) {
                    <div class="mb-8">
                      <h3 class="text-2xl font-bold text-white mb-6 leading-relaxed">
                        {{ questaoAtual()?.enunciado }}
                      </h3>

                      <div class="space-y-3">
                        @for (alt of questaoAtual()?.alternativas; track $index) {
                          <button
                            (click)="selecionarAlternativa($index)"
                            [disabled]="feedbackResposta() !== null"
                            class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group"
                            [ngClass]="{
                              'border-slate-600 bg-slate-900/50 hover:border-emerald-500/50 text-slate-300': respostaSelecionada() !== $index && feedbackResposta() === null,
                              'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]': respostaSelecionada() === $index && feedbackResposta() === null,
                              'border-emerald-500 bg-emerald-500/20 text-white': feedbackResposta() !== null && $index === questaoAtual()?.respostaCorreta,
                              'border-red-500 bg-red-500/20 text-white': feedbackResposta() === 'incorreta' && respostaSelecionada() === $index,
                              'opacity-50 cursor-not-allowed': feedbackResposta() !== null && $index !== questaoAtual()?.respostaCorreta && $index !== respostaSelecionada()
                            }">

                            <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors"
                                  [ngClass]="respostaSelecionada() === $index ? 'bg-emerald-500 text-slate-900' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'">
                              {{ ['A', 'B', 'C', 'D'][$index] }}
                            </span>
                            <span class="font-medium">{{ alt }}</span>

                            <!-- Ícones de Feedback -->
                            @if (feedbackResposta() !== null && $index === questaoAtual()?.respostaCorreta) {
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            }
                            @if (feedbackResposta() === 'incorreta' && respostaSelecionada() === $index) {
                              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            }
                          </button>
                        }
                      </div>
                    </div>

                    <!-- Botões de Ação Inferior -->
                    <div class="flex justify-end pt-4 border-t border-slate-700/50">
                      @if (feedbackResposta() === null) {
                        <button (click)="confirmarResposta()"
                                [disabled]="respostaSelecionada() === null"
                                class="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-3 px-8 rounded-xl transition-colors">
                          Confirmar
                        </button>
                      } @else {
                        <button (click)="proximaQuestao()"
                                class="bg-purple-500 hover:bg-purple-400 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                          Continuar <svg class="w-4 h-4 inline-block ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </button>
                      }
                    </div>
                  } @else {
                    <!-- Tela de Sucesso Final da Lição -->
                    <div class="text-center py-8 animate-fade-in">
                      <div class="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <h2 class="text-3xl font-bold text-white mb-2">Lição Concluída!</h2>
                      <p class="text-slate-400 mb-8">Ótimo trabalho, completou o módulo com sucesso.</p>

                      <div class="flex justify-center gap-6 mb-10">
                        <div class="bg-slate-900/50 border border-emerald-500/30 p-4 rounded-2xl min-w-[120px]">
                          <p class="text-xs text-slate-400 uppercase font-bold mb-1">XP Ganho</p>
                          <p class="text-2xl font-bold text-emerald-400">+{{ licaoAtiva()?.recompensaXP }}</p>
                        </div>
                        <div class="bg-slate-900/50 border border-yellow-500/30 p-4 rounded-2xl min-w-[120px]">
                          <p class="text-xs text-slate-400 uppercase font-bold mb-1">Moedas</p>
                          <p class="text-2xl font-bold text-yellow-500">+{{ licaoAtiva()?.recompensaCredito }}</p>
                        </div>
                      </div>

                      <button (click)="finalizarEvolucao()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        Voltar para Trilhas
                      </button>
                    </div>
                  }

                </div>
              }
            </div>
          }

          @if (activeTab() === 'mentor') {
            <div class="chat-wrapper">
              <div class="chat-container">

                <div class="chat-messages" #chatScroll>
                  <div class="message ai-message">
                    <div class="avatar ai-avatar">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                    </div>
                    <div class="bubble ai-bubble">
                      Olá, {{ user().name }}! Sou o Mentor do FinQuest. O que quer aprender hoje?
                    </div>
                  </div>

                  @for (msg of chatHistory(); track $index) {
                    <div class="message" [ngClass]="msg.role === 'user' ? 'user-message' : 'ai-message'">
                      <div class="avatar" [ngClass]="msg.role === 'user' ? 'user-avatar' : 'ai-avatar'">
                        @if (msg.role === 'user') {
                          <img [src]="user().avatarUrl">
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        }
                      </div>
                      <div class="bubble" [ngClass]="msg.role === 'user' ? 'user-bubble' : 'ai-bubble'">
                        {{ msg.text }}
                      </div>
                    </div>
                  }

                  @if (isTyping()) {
                    <div class="message ai-message">
                      <div class="avatar ai-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                      </div>
                      <div class="bubble ai-bubble typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  }
                </div>

                <div class="chat-input-area">
                  <input type="text" [(ngModel)]="chatInput" (keyup.enter)="askMentor()" [disabled]="isTyping()" placeholder="Faça uma pergunta sobre finanças...">
                  <button class="btn-send" (click)="askMentor()" [disabled]="!chatInput.trim() || isTyping()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- OUTRAS ABAS -->
          @if (activeTab() !== 'dashboard' && activeTab() !== 'trilhas' && activeTab() !== 'mentor') {
             <div class="h-full flex flex-col items-center justify-center text-slate-500 animate-fade-in">
                <div class="w-24 h-24 mb-6 rounded-3xl bg-slate-800/50 border border-slate-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 16 14"/></svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-300 mb-2">Módulo em Desenvolvimento</h3>
                <p class="max-w-md text-center text-slate-400">A tela de <span class="capitalize font-semibold text-emerald-400">{{ activeTab() }}</span> está sendo construída pela equipe.</p>
             </div>
          }

        </div>
      </main>
    </div>
`;

fs.writeFileSync('src/app/pages/dashboard/dashboard.html', userTemplate);
